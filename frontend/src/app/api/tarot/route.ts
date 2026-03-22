import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 카테고리별 스프레드 포지션
const SPREAD_POSITIONS: Record<string, string[]> = {
  love: ["나의 마음", "다가올 인연", "현재 연애 흐름", "장애물", "숨겨진 감정", "결말"],
  couple: ["나의 상태", "상대의 상태", "관계의 현재", "갈등 요인", "해결의 열쇠", "관계의 미래"],
  friendship: ["나의 입장", "친구의 입장", "우정의 현재", "시련", "서로에게 필요한 것", "우정의 방향"],
  exam: ["현재 실력", "숨은 잠재력", "방해 요소", "도움이 되는 것", "시험 당일 흐름", "최종 결과"],
  aptitude: ["현재 나", "숨겨진 재능", "피해야 할 길", "맞는 방향", "성장 포인트", "미래 모습"],
  study: ["현재 학업 상태", "강점", "약점", "집중해야 할 것", "주변 환경", "학업 성과"],
  career: ["현재 직장", "이직 동기", "새로운 기회", "리스크", "준비해야 할 것", "이직 결과"],
  health: ["현재 건강", "신체 에너지", "정신 에너지", "주의할 점", "도움이 되는 것", "건강 전망"],
  pastlife: ["전생의 나", "전생의 인연", "가져온 카르마", "이번 생의 과제", "숨겨진 재능", "영혼의 방향"],
  office: ["오늘의 전체 분위기", "직장 상사", "동료 관계", "예상치 못한 사건", "주의할 점", "퇴근 운"],
  reunion: ["과거의 관계", "이별의 원인", "상대의 현재 마음", "재회의 가능성", "재회 후 변화", "최종 결말"],
  remarriage: ["과거 결혼의 교훈", "현재 나의 마음", "새로운 인연의 등장", "장애물", "극복의 열쇠", "재혼의 미래"],
};

export async function POST(request: Request) {
  let category = "";
  let cards: string[] = [];
  try {
    const body = await request.json();
    category = body.category;
    cards = body.cards;
    const { categoryLabel, userId } = body;

    // 하루 1회 제한 체크 - 이미 봤으면 기존 결과 반환
    if (userId && supabase) {
      const today = new Date().toISOString().split("T")[0];
      const { data: existing } = await supabase
        .from("readings")
        .select("id, reading, cards")
        .eq("user_id", userId)
        .eq("category", category)
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`)
        .limit(1);

      if (existing && existing.length > 0) {
        return NextResponse.json({
          success: true,
          error: "daily_limit",
          reading: existing[0].reading,
          readingId: existing[0].id,
          savedCards: existing[0].cards,
        });
      }
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({
        success: true,
        reading: generateFallbackReading(categoryLabel, cards),
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: buildPrompt(category, categoryLabel, cards) },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    // API 에러 시 DB에서 같은 카드 조합 결과 가져오기
    if (data.error) {
      const fallback = await getMatchingReading(category, cards);
      if (fallback) {
        return NextResponse.json({ success: true, reading: fallback.reading, readingId: fallback.id });
      }
      return NextResponse.json({
        success: false,
        error: "api_error",
        reading: "🌙 별들의 신호가 잠시 불안정해요.\n\n잠시 후 다시 시도해주세요.",
      });
    }

    const reading =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "🌙 카드의 메시지를 읽어오지 못했어요.\n\n다시 시도해주세요.";

    // 로그인 사용자면 결과 저장 (요약본)
    let readingId = null;
    if (userId && supabase) {
      const scoreMatch = reading.match(/(\d+)%/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
      const keywordMatch = reading.match(/행운의 키워드[^\n]*\n([^\n]+)/);
      const keywords = keywordMatch ? keywordMatch[1].trim() : "";

      const { data: inserted } = await supabase
        .from("readings")
        .insert({
          user_id: userId,
          category,
          category_label: categoryLabel,
          cards,
          reading,
          score,
          keywords,
        })
        .select("id")
        .single();

      readingId = inserted?.id;
    }

    return NextResponse.json({ success: true, reading, readingId });
  } catch (error) {
    const fallback = await getMatchingReading(category, cards);
    if (fallback) {
      return NextResponse.json({ success: true, reading: fallback.reading, readingId: fallback.id });
    }
    return NextResponse.json(
      { success: false, error: "server_error", reading: "🌙 서버와의 연결이 불안정해요.\n\n잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}

function buildPrompt(category: string, categoryLabel: string, cards: string[]) {
  const positions = SPREAD_POSITIONS[category] || SPREAD_POSITIONS.love;

  if (category === "office") {
    return buildOfficePrompt(positions, cards);
  }

  return `당신은 20년 경력의 타로 마스터 "루나"입니다.
유튜브와 오프라인에서 실제로 타로 상담을 해주는 전문 리더입니다.
당신은 기계적인 해석이 아니라, 당신 앞에 앉은 사람의 마음을 읽고 공감하면서 이야기를 풀어나갑니다.

${category === "love" ? "현재 연인이 없는 솔로인 사용자가 연애운(새로운 인연, 다가올 사랑)에 대해 타로 카드를 뽑았습니다." : `사용자가 "${categoryLabel}"에 대해 타로 카드를 뽑았습니다.`}

스프레드 배치:
${positions.map((pos, i) => `${i + 1}번 위치 [${pos}]: ${cards[i]}`).join("\n")}

당신의 해석 스타일:
- 마치 앞에 앉아있는 사람에게 직접 말하듯이 "~하고 있네요", "~거든요", "~보여요" 같은 구어체를 사용해요.
- 카드 조합이 만들어내는 스토리를 읽어요. 예를 들어 "광대 옆에 연인 카드가 나왔다는 건 새로운 만남이 사랑으로 이어진다는 뜻이에요" 처럼 카드 간의 관계를 설명해요.
- 같은 카드라도 위치와 주변 카드에 따라 완전히 다른 의미를 가져요. 이걸 꼭 반영해주세요.
- 뻔한 말 대신 "지금 이 시기에는 ~하는 게 좋아요", "다음 달 초쯤에 변화가 올 거예요" 같이 구체적으로 말해요.
- 긍정적인 카드가 나오면 신나게, 주의가 필요한 카드가 나오면 걱정 말라고 다독이면서도 현실적인 조언을 해요.

절대 지켜야 할 규칙:
- ** ** (볼드 마크다운) 절대 사용하지 마세요. 일반 텍스트만 사용하세요.
- "~할 수 있습니다", "~일 것입니다" 같은 딱딱한 존댓말 대신 "~거예요", "~하고 있어요", "~해보세요" 같은 부드러운 말투를 써주세요.
- 카드 이름을 나열하면서 하나하나 설명하지 마세요. 자연스러운 이야기 흐름으로 풀어주세요.

다음 형식으로 해석해주세요:

📊 ${categoryLabel} 점수
(카드 조합으로 ${categoryLabel} 점수를 20~100% 사이로 매기세요. 점수 옆에 한 줄 코멘트. 매번 다양한 점수를 주세요 - 28%, 43%, 61%, 77%, 92% 등)

🌙 카드가 들려주는 이야기
(실제 타로 상담사가 앞에서 말해주듯이 5-6문장으로 자연스럽게. "자, 카드를 보니까요..." 이런 식으로 시작해도 좋아요. 카드 조합의 흐름을 스토리로 풀어주세요. 시간의 흐름이나 상황 변화를 구체적으로 짚어주세요.)

💫 이 카드 조합이 특별한 이유
(이 6장의 조합에서만 읽히는 독특한 메시지 2-3문장. "보통 이런 조합은 흔하지 않은데요..." 같은 느낌으로)

⭐ 루나의 한마디
(친한 언니/오빠가 조언해주듯이 따뜻하면서도 현실적인 조언 2-3문장. "제가 봤을 때는요..." 같은 느낌으로)

🔮 행운의 키워드
(3개의 키워드)

진심을 담아서, 듣는 사람이 "와 진짜 내 이야기 같다"고 느낄 수 있도록 해석해주세요.`;
}

function buildOfficePrompt(positions: string[], cards: string[]) {
  return `당신은 직장인 친구처럼 오늘의 회사운을 알려주는 "루나쌤"입니다.

카드 배치:
${positions.map((pos, i) => `${i + 1}번 [${pos}]: ${cards[i]}`).join("\n")}

규칙:
- 짧고 간결하게! 장황하지 않게!
- ** ** 볼드 절대 금지
- "~거예요", "~거든요" 같은 편한 말투
- 긍정적인 내용을 많이 넣어주세요. 좋은 일이 생길 예감, 칭찬받을 가능성, 간식 이벤트 등
- 부정적인 카드가 나와도 "이것만 조심하면 괜찮아요!" 느낌으로

다음 형식으로 짧게 해석해주세요:

📊 오늘의 회사운 점수
(20~100% + 한 줄 코멘트)

🏢 오늘 한 줄 요약
(오늘 회사 분위기를 한 줄로 요약)

🍀 오늘의 좋은 일
(오늘 생길 수 있는 좋은 일 1-2가지. 간식, 칭찬, 상사 외근, 일찍 퇴근 등)

⚠️ 이것만 조심!
(주의할 것 한 줄)

🔮 퇴근 운세
(한 줄로)

전체 5-6줄 이내로 간결하게!`;
}

function generateFallbackReading(categoryLabel: string, cards: string[]) {
  return `📊 ${categoryLabel} 점수
75% - 전체적으로 긍정적인 흐름이에요.

🌙 카드가 들려주는 이야기
${cards.join(", ")} 카드가 나왔습니다.
${categoryLabel}에 대해 카드들이 긍정적인 에너지를 보여주고 있어요.

💫 핵심 메시지
곧 더 자세한 해석이 준비될 예정이에요. 조금만 기다려주세요!

⭐ 루나의 조언
지금 뽑은 카드의 에너지를 믿고, 긍정적인 마음으로 하루를 보내보세요.

🔮 행운의 키워드
희망, 새로운 시작, 성장`;
}

// DB에서 같은 카테고리 + 같은 카드 조합의 과거 결과 가져오기
async function getMatchingReading(category: string, cards: string[]) {
  if (!supabase || !cards || cards.length === 0) return null;

  const { data } = await supabase
    .from("readings")
    .select("id, reading")
    .eq("category", category)
    .contains("cards", cards)
    .order("created_at", { ascending: false })
    .limit(10);

  if (!data || data.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
}
