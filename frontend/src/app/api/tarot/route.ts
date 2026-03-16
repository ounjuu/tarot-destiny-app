import { NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(request: Request) {
  try {
    const { category, categoryLabel, cards } = await request.json();

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({
        success: true,
        reading: generateFallbackReading(categoryLabel, cards),
      });
    }

    // Claude API 호출
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: buildPrompt(category, categoryLabel, cards),
          },
        ],
      }),
    });

    const data = await response.json();
    const reading = data.content?.[0]?.text || "해석을 불러오지 못했습니다.";

    return NextResponse.json({ success: true, reading });
  } catch (error) {
    return NextResponse.json(
      { success: false, reading: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// Claude에게 보낼 프롬프트
function buildPrompt(category: string, categoryLabel: string, cards: string[]) {
  return `당신은 신비로운 타로 카드 리더 "루나"입니다.
달빛 아래에서 타로 카드를 읽어주는 따뜻하고 신비로운 분위기의 점술사입니다.

사용자가 "${categoryLabel}"에 대해 타로 카드를 뽑았습니다.

뽑은 카드 6장:
1번 카드: ${cards[0]}
2번 카드: ${cards[1]}
3번 카드: ${cards[2]}
4번 카드: ${cards[3]}
5번 카드: ${cards[4]}
6번 카드: ${cards[5]}

다음 형식으로 타로 해석을 해주세요:

🌙 전체 운세 흐름
(6장의 카드가 전체적으로 어떤 이야기를 하고 있는지 2-3문장)

🃏 카드별 해석
(각 카드가 "${categoryLabel}" 맥락에서 어떤 의미인지 간단히 1-2문장씩)

⭐ 조언
(이 카드 배열을 바탕으로 한 구체적인 조언 2-3문장)

🔮 행운의 키워드
(3개의 키워드)

따뜻하고 희망적인 톤으로, 한국어로 작성해주세요. 너무 부정적인 해석은 피하되, 현실적인 조언을 포함해주세요.`;
}

// API 키 없을 때 임시 응답
function generateFallbackReading(categoryLabel: string, cards: string[]) {
  return `🌙 전체 운세 흐름
${cards.join(", ")} 카드가 나왔습니다.
${categoryLabel}에 대해 카드들이 긍정적인 에너지를 보여주고 있어요.

🃏 카드별 해석
곧 더 자세한 해석이 준비될 예정이에요. 조금만 기다려주세요!

⭐ 조언
지금 뽑은 카드의 에너지를 믿고, 긍정적인 마음으로 하루를 보내보세요.

🔮 행운의 키워드
희망, 새로운 시작, 성장`;
}
