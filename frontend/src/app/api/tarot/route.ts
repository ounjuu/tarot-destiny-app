import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 카테고리별 스프레드 포지션
const SPREAD_POSITIONS: Record<string, string[]> = {
  love: ["나의 마음", "상대의 마음", "두 사람의 현재", "장애물", "숨겨진 감정", "결말"],
  couple: ["나의 상태", "상대의 상태", "관계의 현재", "갈등 요인", "해결의 열쇠", "관계의 미래"],
  friendship: ["나의 입장", "친구의 입장", "우정의 현재", "시련", "서로에게 필요한 것", "우정의 방향"],
  exam: ["현재 실력", "숨은 잠재력", "방해 요소", "도움이 되는 것", "시험 당일 흐름", "최종 결과"],
  aptitude: ["현재 나", "숨겨진 재능", "피해야 할 길", "맞는 방향", "성장 포인트", "미래 모습"],
  study: ["현재 학업 상태", "강점", "약점", "집중해야 할 것", "주변 환경", "학업 성과"],
  career: ["현재 직장", "이직 동기", "새로운 기회", "리스크", "준비해야 할 것", "이직 결과"],
  health: ["현재 건강", "신체 에너지", "정신 에너지", "주의할 점", "도움이 되는 것", "건강 전망"],
};

export async function POST(request: Request) {
  try {
    const { category, categoryLabel, cards } = await request.json();

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
    const reading =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "해석을 불러오지 못했습니다.";

    return NextResponse.json({ success: true, reading });
  } catch (error) {
    return NextResponse.json(
      { success: false, reading: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

function buildPrompt(category: string, categoryLabel: string, cards: string[]) {
  const positions = SPREAD_POSITIONS[category] || SPREAD_POSITIONS.love;

  return `당신은 신비로운 타로 카드 리더 "루나"입니다.
달빛 아래에서 타로 카드를 읽어주는 따뜻하고 신비로운 분위기의 점술사입니다.

사용자가 "${categoryLabel}"에 대해 타로 카드를 뽑았습니다.

스프레드 배치:
${positions.map((pos, i) => `${i + 1}번 위치 [${pos}]: ${cards[i]}`).join("\n")}

중요 규칙:
- 카드를 개별적으로 하나하나 해석하지 말고, 카드들의 "조합"과 "흐름"을 중심으로 해석해주세요.
- 카드끼리의 관계, 위치별 의미의 연결, 전체적인 스토리를 만들어주세요.
- 절대 ** ** (볼드 마크다운)을 사용하지 마세요. 일반 텍스트로만 작성하세요.
- 구체적이고 디테일한 해석을 해주세요. 두리뭉실하게 쓰지 마세요.
- "~할 수 있습니다", "~일 것입니다" 같은 애매한 표현 대신 단정적으로 말해주세요.

다음 형식으로 타로 해석을 해주세요:

📊 ${categoryLabel} 점수
(카드 조합을 분석하여 ${categoryLabel} 점수를 20~100% 사이로 매기고, 한 줄로 이유를 설명. 매번 다른 점수를 줘야 하며 50~80% 구간에 치우치지 말고 20%, 35%, 45%, 67%, 88%, 95% 등 다양하게 분포시켜줘)

🌙 카드가 들려주는 이야기
(6장의 카드 조합이 만들어내는 전체 스토리를 4-5문장으로 구체적으로 서술. 어떤 상황이 벌어지고, 어떤 변화가 오는지 디테일하게)

💫 핵심 메시지
(카드 조합에서 읽히는 가장 중요한 메시지 2문장. 구체적으로)

⭐ 루나의 조언
(이 카드 배열을 바탕으로 구체적이고 실용적인 행동 조언 2-3문장. "이렇게 해보세요"처럼 명확하게)

🔮 행운의 키워드
(3개의 키워드)

따뜻하고 희망적인 톤으로, 한국어로 작성해주세요. 너무 부정적인 해석은 피하되, 현실적인 조언을 포함해주세요.`;
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
