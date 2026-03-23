import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ZODIAC_SIGNS } from "@/data/astrology";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  try {
    const { userId, category, birthday, birthTime, birthCity, birthLat, birthLng, zodiacSign, partnerSign } = await request.json();

    const sign = ZODIAC_SIGNS.find((s) => s.id === zodiacSign);
    if (!sign) {
      return NextResponse.json({ error: "invalid_sign" }, { status: 400 });
    }

    // 출생 차트 계산
    let chartData = "";
    try {
      // @ts-ignore
      const { Origin, Horoscope } = await import("circular-natal-horoscope-js");

      const [year, month, day] = birthday.split("-").map(Number);
      let hour = 12, minute = 0;
      if (birthTime) {
        [hour, minute] = birthTime.split(":").map(Number);
      }

      const origin = new Origin({
        year, month: month - 1, date: day,
        hour, minute, second: 0,
        latitude: birthLat, longitude: birthLng,
      });

      const horoscope = new Horoscope({
        origin,
        hpieces: 12,
        zodiac: "tropical",
        aspectPoints: ["bodies", "points", "angles"],
        aspectWithPoints: ["bodies", "points", "angles"],
        aspectTypes: ["major"],
        customOrbs: {},
        language: "en",
      });

      // 주요 행성 위치 추출
      const bodies = horoscope.CelestialBodies?.all || [];
      const angles = horoscope.Angles?.all || [];

      const planetPositions = bodies.map((b: { label: string; Sign: { label: string } }) =>
        `${b.label}: ${b.Sign?.label || "unknown"}`
      ).join(", ");

      const anglePositions = angles.map((a: { label: string; Sign: { label: string } }) =>
        `${a.label}: ${a.Sign?.label || "unknown"}`
      ).join(", ");

      chartData = `\n행성 위치: ${planetPositions}\n앵글: ${anglePositions}`;
    } catch {
      chartData = "";
    }

    const prompt = buildPrompt(category, sign.name, sign.symbol, birthday, birthTime, birthCity, chartData, partnerSign);

    if (!GEMINI_API_KEY) {
      return NextResponse.json({
        success: true,
        reading: `✦ ${sign.name} ${sign.symbol}\n\n별자리 해석 서비스를 준비 중이에요. 곧 만나요!`,
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      return NextResponse.json({
        success: false,
        error: "api_error",
        reading: "별들의 신호가 잠시 불안정해요.\n\n잠시 후 다시 시도해주세요.",
      });
    }

    const reading = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reading) {
      return NextResponse.json({
        success: false,
        error: "empty_response",
        reading: "별의 메시지를 읽어오지 못했어요.\n\n다시 시도해주세요.",
      });
    }

    // 결과 저장
    let readingId = null;
    if (userId && supabase) {
      const scoreMatch = reading.match(/(\d+)%/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

      const { data: inserted } = await supabase
        .from("readings")
        .insert({
          user_id: userId,
          category: `astro_${category}`,
          category_label: `${sign.name} ${getCategoryLabel(category)}`,
          cards: [sign.name, sign.symbol],
          reading,
          score,
          keywords: "",
          source: "gemini",
        })
        .select("id")
        .single();

      readingId = inserted?.id;
    }

    return NextResponse.json({ success: true, reading, readingId });
  } catch {
    return NextResponse.json({
      success: false,
      error: "server_error",
      reading: "서버와의 연결이 불안정해요.\n\n잠시 후 다시 시도해주세요.",
    }, { status: 500 });
  }
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    "my-chart": "나의 별자리",
    daily: "오늘의 운세",
    personality: "성격 분석",
    "love-star": "연애운",
    "marriage-star": "결혼운",
    compatibility: "별자리 궁합",
    monthly: "이번 달 운세",
    yearly: "올해의 운세",
    "career-star": "직업 적성",
  };
  return labels[category] || category;
}

function buildPrompt(category: string, signName: string, signSymbol: string, birthday: string, birthTime: string | null, birthCity: string, chartData: string, partnerSign?: string): string {
  const baseInfo = `사용자 정보:
- 태양 별자리: ${signName} ${signSymbol}
- 생년월일: ${birthday}
- 태어난 시간: ${birthTime || "알 수 없음"}
- 태어난 장소: ${birthCity}
${chartData ? `- 출생 차트 데이터: ${chartData}` : ""}`;

  const rules = `당신은 20년 경력의 점성술사 "루나"입니다.
따뜻하고 공감하면서 이야기를 풀어나갑니다.

규칙:
- ** ** 볼드 마크다운 절대 사용 금지
- "~거예요", "~거든요" 같은 부드러운 구어체
- 구체적이고 개인화된 해석`;

  if (category === "my-chart") {
    return `${rules}\n\n${baseInfo}\n\n이 사람의 출생 차트를 기반으로 타고난 인생 운명을 종합적으로 분석해주세요. 전생부터 이어진 영혼의 목적, 이번 생의 과제, 타고난 재능, 인생의 큰 흐름을 읽어주세요.\n\n형식:\n✦ ${signName}의 인생 지도\n\n☽ 타고난 성향과 영혼의 목적\n(5-6문장, 태양/달/상승 별자리 조합으로 이 사람이 태어난 이유와 영혼이 원하는 방향)\n\n✧ 타고난 재능과 강점\n(3-4문장, 행성 배치로 보는 숨겨진 재능)\n\n★ 인생의 전환점\n(3-4문장, 인생에서 중요한 시기와 변화의 흐름)\n\n☽ 주의해야 할 약점\n(2-3문장, 극복해야 할 과제)\n\n★ 루나가 읽은 당신의 운명\n(3-4문장, 종합적인 인생 메시지)\n\n✦ 인생 키워드\n(5개)`;
  }

  if (category === "daily") {
    return `${rules}\n\n${baseInfo}\n\n오늘 날짜: ${new Date().toISOString().split("T")[0]}\n\n오늘의 운세를 해석해주세요.\n\n형식:\n✦ ${signName} 오늘의 운세\n\n✦ 오늘의 점수\n(20~100% + 한 줄 코멘트. 가끔 낮은 점수도)\n\n☽ 오늘의 흐름\n(3-4문장, 오늘 하루 전체 흐름)\n\n✧ 주의할 점\n(1-2문장)\n\n★ 루나의 한마디\n(2문장, 따뜻한 조언)\n\n✦ 행운의 키워드\n(3개)`;
  }

  if (category === "personality") {
    return `${rules}\n\n${baseInfo}\n\n이 사람의 성격을 출생 차트 기반으로 깊이 있게 분석해주세요.\n\n형식:\n✦ ${signName}의 성격 분석\n\n☽ 기본 성격\n(4-5문장, 태양 별자리 기반 핵심 성격)\n\n☽ 내면의 나\n(3-4문장, 달 별자리 기반 감정/내면)\n\n✧ 첫인상\n(2-3문장, 상승궁 기반)\n\n★ 숨겨진 매력\n(2-3문장)\n\n✦ 키워드\n(5개)`;
  }

  if (category === "love-star") {
    return `${rules}\n\n${baseInfo}\n\n이 사람의 연애운을 출생 차트 기반으로 해석해주세요.\n\n형식:\n✦ ${signName}의 연애운\n\n✦ 연애운 점수\n(20~100% + 한 줄 코멘트. 가끔 낮은 점수도)\n\n☽ 연애 스타일\n(3-4문장, 이 별자리의 연애 패턴)\n\n✧ 지금의 연애 흐름\n(3-4문장, 현재 시기의 연애 에너지)\n\n★ 루나의 연애 조언\n(2-3문장)\n\n✦ 연애 키워드\n(3개)`;
  }

  if (category === "marriage-star") {
    return `${rules}\n\n${baseInfo}\n\n이 사람의 결혼운을 출생 차트 기반으로 해석해주세요.\n\n형식:\n✦ ${signName}의 결혼운\n\n✦ 결혼운 점수\n(20~100% + 한 줄 코멘트. 가끔 낮은 점수도)\n\n☽ 결혼관과 이상형\n(3-4문장, 이 별자리가 원하는 결혼 스타일)\n\n✧ 결혼 시기와 흐름\n(3-4문장, 결혼에 유리한 시기와 현재 흐름)\n\n★ 루나의 결혼 조언\n(2-3문장)\n\n✦ 결혼 키워드\n(3개)`;
  }

  if (category === "compatibility") {
    const partnerInfo = partnerSign ? `\n상대방 별자리: ${partnerSign}` : "";
    return `${rules}\n\n${baseInfo}${partnerInfo}\n\n${partnerSign ? `${signName}과 ${partnerSign}의 궁합` : `${signName}의 궁합 운`}을 분석해주세요.\n\n형식:\n✦ 별자리 궁합\n\n✦ 궁합 점수\n(20~100% + 한 줄 코멘트)\n\n☽ 두 별자리의 케미\n(4-5문장)\n\n✧ 주의할 점\n(2-3문장)\n\n★ 루나의 조언\n(2-3문장)\n\n✦ 궁합 키워드\n(3개)`;
  }

  if (category === "monthly") {
    const now = new Date();
    const monthName = `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
    return `${rules}\n\n${baseInfo}\n\n${monthName} 운세를 해석해주세요.\n\n형식:\n✦ ${signName} ${monthName} 운세\n\n✦ 이번 달 점수\n(20~100% + 한 줄 코멘트)\n\n☽ 이번 달 흐름\n(5-6문장, 주간별 흐름)\n\n✧ 기회와 주의\n(3-4문장)\n\n★ 루나의 한마디\n(2-3문장)\n\n✦ 행운의 키워드\n(3개)`;
  }

  if (category === "yearly") {
    const year = new Date().getFullYear();
    return `${rules}\n\n${baseInfo}\n\n${year}년 운세를 해석해주세요.\n\n형식:\n✦ ${signName} ${year}년 운세\n\n✦ 올해의 점수\n(20~100% + 한 줄 코멘트)\n\n☽ 올해의 큰 흐름\n(5-6문장, 분기별 변화)\n\n✧ 올해의 기회\n(3-4문장)\n\n★ 루나의 한마디\n(2-3문장)\n\n✦ 올해의 키워드\n(3개)`;
  }

  if (category === "career-star") {
    return `${rules}\n\n${baseInfo}\n\n이 별자리의 직업 적성을 분석해주세요.\n\n형식:\n✦ ${signName}의 직업 적성\n\n☽ 타고난 강점\n(3-4문장)\n\n✧ 어울리는 직업\n(구체적인 직업 5-7개 추천 + 각각 한 줄 이유)\n\n✧ 직장에서의 스타일\n(3-4문장)\n\n★ 루나의 조언\n(2-3문장)\n\n✦ 커리어 키워드\n(3개)`;
  }

  return `${rules}\n\n${baseInfo}\n\n이 사람의 별자리 운세를 해석해주세요.`;
}
