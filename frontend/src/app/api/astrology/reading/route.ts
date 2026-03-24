import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ZODIAC_SIGNS } from "@/data/astrology";
import { callAI } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { userId, userName, category, birthday, birthTime, birthCity, birthLat, birthLng, zodiacSign, partnerSign } = await request.json();

    const sign = ZODIAC_SIGNS.find((s) => s.id === zodiacSign);
    if (!sign) {
      return NextResponse.json({ error: "invalid_sign" }, { status: 400 });
    }

    // 기존 결과 확인 (카테고리별 기간 제한)
    if (userId && supabase) {
      const existing = await getExistingReading(userId, category);
      if (existing) {
        return NextResponse.json({
          success: true,
          reading: existing.reading,
          readingId: existing.id,
          cached: true,
        });
      }
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
        zodiac: "tropical",
        aspectPoints: ["bodies", "points", "angles"],
        aspectWithPoints: ["bodies", "points", "angles"],
        aspectTypes: ["major"],
        customOrbs: {},
        language: "en",
      });

      // 행성 위치 추출
      const bodies = horoscope.CelestialBodies?.all || [];
      const angles = horoscope.Angles?.all || [];

      const planetPositions = bodies.map((b: { label: string; Sign: { label: string }; ChartPosition?: { Ecliptic?: { DecimalDegrees?: number } } }) =>
        `${b.label}: ${b.Sign?.label || "unknown"} ${Math.round(b.ChartPosition?.Ecliptic?.DecimalDegrees || 0)}°`
      ).join(", ");

      const anglePositions = angles.map((a: { label: string; Sign: { label: string } }) =>
        `${a.label}: ${a.Sign?.label || "unknown"}`
      ).join(", ");

      // 하우스 배치 추출
      const houses = horoscope.Houses?.all || [];
      const houseData = houses.map((h: { id: number; Sign: { label: string } }) =>
        `${h.id}하우스: ${h.Sign?.label || "unknown"}`
      ).join(", ");

      // 어스펙트(행성 간 각도) 추출
      const aspects = horoscope.Aspects?.all || [];
      const aspectData = aspects.slice(0, 10).map((a: { point1?: { label?: string }; point2?: { label?: string }; type?: { label?: string } }) =>
        `${a.point1?.label || ""} ${a.type?.label || ""} ${a.point2?.label || ""}`
      ).join(", ");

      chartData = `\n행성 위치: ${planetPositions}\n앵글: ${anglePositions}\n하우스: ${houseData}\n주요 어스펙트: ${aspectData}`;
    } catch {
      chartData = "";
    }

    const prompt = buildPrompt(category, sign.name, sign.symbol, birthday, birthTime, birthCity, chartData, userName, partnerSign);

    // AI 호출 (Gemini → Groq 폴백)
    const { text: reading, source, geminiFailed, groqFailed } = await callAI(prompt);

    // Gemini만 실패하고 Groq 성공 시 로그
    if (geminiFailed && !groqFailed && reading && supabase) {
      await supabase.from("fallback_logs").insert({
        category: `astro_${category}`,
        error_type: "gemini_failed_groq_success",
        user_id: userId || null,
      });
    }

    // 둘 다 실패 시 로그 + 에러 반환
    if (!reading) {
      if (supabase) {
        await supabase.from("fallback_logs").insert({
          category: `astro_${category}`,
          error_type: geminiFailed && groqFailed ? "all_failed" : "ai_failed",
          user_id: userId || null,
        });
      }
      return NextResponse.json({
        success: false,
        error: "api_error",
        reading: "별들의 신호가 잠시 불안정해요.\n\n잠시 후 다시 시도해주세요.",
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
          source: source || "gemini",
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
    weekly: "이번 주 운세",
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

function buildPrompt(category: string, signName: string, signSymbol: string, birthday: string, birthTime: string | null, birthCity: string, chartData: string, userName?: string, partnerSign?: string): string {
  const baseInfo = `사용자 정보:
- 태양 별자리: ${signName} ${signSymbol}
- 생년월일: ${birthday}
- 태어난 시간: ${birthTime || "알 수 없음"}
- 태어난 장소: ${birthCity}
${chartData ? `- 출생 차트 데이터: ${chartData}` : ""}`;

  const rules = `당신은 20년 경력의 점성술사 "루나"입니다.
유튜브와 오프라인에서 실제로 점성술 상담을 해주는 전문 리더입니다.
당신 앞에 앉은 사람의 마음을 읽고 공감하면서, 친한 언니/오빠처럼 따뜻하게 이야기를 풀어나갑니다.

해석 스타일:
- "자, 차트를 보니까요...", "이게 되게 흥미로운 게요" 처럼 실제로 앞에서 말하는 듯한 자연스러운 구어체
- "~하고 있네요", "~거든요", "~보여요", "~인 것 같아요" 같은 부드러운 말투
- 차트 데이터를 직접 나열하지 말고, 자연스러운 이야기 흐름으로 풀어주세요
- 뻔한 말 대신 "이 시기에는 ~하는 게 좋아요", "한 달쯤 뒤에 변화가 올 거예요" 같이 구체적으로
- 걱정되는 내용이 있어도 다독이면서 현실적인 조언을 해요
- 이름을 절대 부르지 마세요. "당신"이라고 하세요
- 충분히 길고 풍성하게 해석해주세요. 짧게 끝내지 마세요.

절대 지켜야 할 규칙:
- ** ** (볼드 마크다운) 절대 사용 금지. 일반 텍스트만 사용
- 차트 데이터(행성 위치, 하우스 번호, 각도 등)를 그대로 보여주지 마세요
- "태양이 물고기자리에 있고 달이 사자자리에 있으니" 같은 기계적 나열 금지. 자연스럽게 녹여서 표현하세요`;

  if (category === "my-chart") {
    return `${rules}\n\n${baseInfo}\n\n이 사람의 출생 차트를 기반으로 타고난 인생 운명을 종합적으로, 이야기하듯 풍성하게 분석해주세요. 전생부터 이어진 영혼의 목적, 이번 생의 과제, 타고난 재능, 인생의 큰 흐름을 읽어주세요.\n\n형식:\n✦ ${signName}의 인생 지도\n\n☽ 타고난 성향과 영혼의 목적\n(7-8문장, 태양/달/상승 별자리 조합으로 이 사람이 태어난 이유와 영혼이 원하는 방향. 구체적인 성향과 삶의 패턴을 이야기하듯)\n\n✧ 타고난 재능과 강점\n(5-6문장, 행성 배치로 보는 숨겨진 재능. 본인도 모르는 능력을 알려주듯)\n\n★ 인생의 전환점\n(5-6문장, 인생에서 중요한 시기와 변화의 흐름. 과거/현재/미래를 자연스럽게 이어서)\n\n☽ 주의해야 할 약점\n(3-4문장, 극복해야 할 과제를 다독이면서)\n\n★ 루나가 읽은 당신의 운명\n(4-5문장, 종합적인 인생 메시지를 따뜻하고 감동적으로)\n\n✦ 인생 키워드\n(5개)`;
  }

  if (category === "weekly") {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const weekRange = `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
    return `${rules}\n\n${baseInfo}\n\n이번 주(${weekRange}) 운세를 해석해주세요.\n\n형식:\n✦ ${signName} 이번 주 운세\n\n✦ 이번 주 점수\n(20~100% + 한 줄 코멘트. 가끔 낮은 점수도)\n\n☽ 주간 흐름\n(7-8문장, 주 초반/중반/후반의 분위기 변화를 이야기하듯 자연스럽게. 어떤 요일에 어떤 일이 있을 수 있는지 구체적으로)\n\n✧ 주의할 점\n(3-4문장, 구체적인 상황과 함께)\n\n★ 루나의 한마디\n(3-4문장, 한 주를 잘 보내기 위한 따뜻한 조언)\n\n✦ 행운의 키워드\n(3개)`;
  }

  if (category === "daily") {
    return `${rules}\n\n${baseInfo}\n\n오늘 날짜: ${new Date().toISOString().split("T")[0]}\n\n오늘의 운세를 해석해주세요.\n\n형식:\n✦ ${signName} 오늘의 운세\n\n✦ 오늘의 점수\n(20~100% + 한 줄 코멘트. 가끔 낮은 점수도)\n\n☽ 오늘의 흐름\n(5-7문장, 오늘 하루 전체 흐름을 이야기하듯 풀어주세요. 오전/오후/저녁 흐름을 자연스럽게)\n\n✧ 주의할 점\n(2-3문장, 구체적인 상황과 함께)\n\n★ 루나의 한마디\n(3-4문장, 따뜻하고 힘이 되는 조언. 친한 언니/오빠가 말해주듯이)\n\n✦ 행운의 키워드\n(3개)`;
  }

  if (category === "personality") {
    return `${rules}\n\n${baseInfo}\n\n이 사람의 성격을 출생 차트 기반으로 깊이 있게, 이야기하듯 분석해주세요.\n\n형식:\n✦ ${signName}의 성격 분석\n\n☽ 기본 성격\n(6-8문장, 태양 별자리 기반 핵심 성격을 풍성하게. 구체적인 상황 예시와 함께)\n\n☽ 내면의 나\n(5-6문장, 달 별자리 기반 감정/내면. 혼자 있을 때의 모습, 감정 표현 방식 등)\n\n✧ 다른 사람들이 보는 나\n(3-4문장, 상승궁 기반 첫인상과 사회적 이미지)\n\n★ 숨겨진 매력과 재능\n(3-4문장, 본인도 모르는 강점)\n\n★ 루나가 전하는 말\n(3-4문장, 따뜻한 격려와 조언)\n\n✦ 성격 키워드\n(5개)`;
  }

  if (category === "love-star") {
    return `${rules}\n\n${baseInfo}\n\n이 사람의 연애운을 출생 차트 기반으로 따뜻하게 해석해주세요.\n\n형식:\n✦ ${signName}의 연애운\n\n✦ 연애운 점수\n(20~100% + 한 줄 코멘트. 가끔 낮은 점수도)\n\n☽ 연애 스타일\n(5-6문장, 이 사람이 사랑에 빠지는 방식, 연애할 때 습관, 좋아하는 사람 앞에서의 모습을 구체적으로)\n\n✧ 지금의 연애 흐름\n(4-5문장, 현재 시기의 연애 에너지와 앞으로의 변화)\n\n★ 루나의 연애 조언\n(3-4문장, 친한 언니/오빠가 진심으로 해주는 따뜻한 조언)\n\n✦ 연애 키워드\n(3개)`;
  }

  if (category === "marriage-star") {
    return `${rules}\n\n${baseInfo}\n\n이 사람의 결혼운을 출생 차트 기반으로 따뜻하게 해석해주세요.\n\n형식:\n✦ ${signName}의 결혼운\n\n✦ 결혼운 점수\n(20~100% + 한 줄 코멘트. 가끔 낮은 점수도)\n\n☽ 결혼관과 이상형\n(5-6문장, 이 사람이 원하는 결혼 생활, 이상적인 파트너상, 가정에서의 역할을 구체적으로)\n\n✧ 결혼 시기와 흐름\n(4-5문장, 결혼에 유리한 시기와 현재 흐름, 어떤 계기로 결혼을 결심할지)\n\n★ 루나의 결혼 조언\n(3-4문장, 따뜻하고 현실적인 조언)\n\n✦ 결혼 키워드\n(3개)`;
  }

  if (category === "compatibility") {
    const partnerInfo = partnerSign ? `\n상대방 별자리: ${partnerSign}` : "";
    return `${rules}\n\n${baseInfo}${partnerInfo}\n\n${partnerSign ? `${signName}과 ${partnerSign}의 궁합` : `${signName}의 궁합 운`}을 이야기하듯 분석해주세요.\n\n형식:\n✦ 별자리 궁합\n\n✦ 궁합 점수\n(20~100% + 한 줄 코멘트)\n\n☽ 두 별자리의 케미\n(6-8문장, 만나면 어떤 분위기인지, 서로에게 끌리는 포인트, 함께할 때 좋은 점을 구체적으로)\n\n✧ 조심해야 할 부분\n(3-4문장, 부딪힐 수 있는 상황과 해결법을 함께)\n\n★ 루나의 궁합 조언\n(3-4문장, 두 사람이 더 잘 맞으려면 어떻게 하면 좋을지 따뜻하게)\n\n✦ 궁합 키워드\n(3개)`;
  }

  if (category === "monthly") {
    const now = new Date();
    const monthName = `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
    return `${rules}\n\n${baseInfo}\n\n${monthName} 운세를 해석해주세요.\n\n형식:\n✦ ${signName} ${monthName} 운세\n\n✦ 이번 달 점수\n(20~100% + 한 줄 코멘트)\n\n☽ 이번 달 흐름\n(7-8문장, 월초/월중/월말의 흐름을 이야기하듯 자연스럽게. 어떤 시기에 어떤 변화가 올지 구체적으로)\n\n✧ 기회와 주의\n(4-5문장, 놓치면 안 되는 기회와 조심해야 할 점을 구체적으로)\n\n★ 루나의 한마디\n(3-4문장, 한 달을 잘 보내기 위한 따뜻한 조언)\n\n✦ 행운의 키워드\n(3개)`;
  }

  if (category === "yearly") {
    const year = new Date().getFullYear();
    return `${rules}\n\n${baseInfo}\n\n${year}년 운세를 해석해주세요.\n\n형식:\n✦ ${signName} ${year}년 운세\n\n✦ 올해의 점수\n(20~100% + 한 줄 코멘트)\n\n☽ 올해의 큰 흐름\n(8-10문장, 봄/여름/가을/겨울 또는 분기별로 어떤 변화가 오는지 이야기하듯 풍성하게)\n\n✧ 올해의 기회와 주의\n(5-6문장, 놓치면 안 되는 기회와 조심할 시기를 구체적으로)\n\n★ 루나의 한마디\n(3-4문장, 올 한 해를 잘 보내기 위한 따뜻한 조언)\n\n✦ 올해의 키워드\n(3개)`;
  }

  if (category === "career-star") {
    return `${rules}\n\n${baseInfo}\n\n이 사람의 직업 적성을 출생 차트 기반으로 따뜻하게 분석해주세요.\n\n형식:\n✦ ${signName}의 직업 적성\n\n☽ 타고난 강점\n(5-6문장, 일할 때 빛나는 능력과 성향을 구체적으로)\n\n✧ 어울리는 직업\n(구체적인 직업 5-7개 추천 + 각각 왜 맞는지 2-3줄씩 설명)\n\n✧ 직장에서의 스타일\n(4-5문장, 동료/상사와의 관계, 일하는 방식, 스트레스 받는 포인트 등)\n\n★ 루나의 커리어 조언\n(3-4문장, 앞으로의 커리어 방향에 대한 따뜻한 조언)\n\n✦ 커리어 키워드\n(3개)`;
  }

  return `${rules}\n\n${baseInfo}\n\n이 사람의 별자리 운세를 해석해주세요.`;
}

// 카테고리별 기간 제한 체크
async function getExistingReading(userId: string, category: string) {
  if (!supabase) return null;

  const fullCategory = `astro_${category}`;
  let fromDate: string;

  if (category === "my-chart" || category === "personality" || category === "career-star") {
    // 영구: 한번 보면 계속 같은 결과
    const { data } = await supabase
      .from("readings")
      .select("id, reading")
      .eq("user_id", userId)
      .eq("category", fullCategory)
      .order("created_at", { ascending: false })
      .limit(1);
    return data && data.length > 0 ? data[0] : null;
  }

  const now = new Date();

  if (category === "daily" || category === "love-star" || category === "compatibility") {
    // 하루 1회 (자정 기준)
    fromDate = now.toISOString().split("T")[0] + "T00:00:00";
  } else if (category === "weekly") {
    // 주 1회 (월요일 기준)
    const monday = new Date(now);
    const day = monday.getDay();
    monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
    fromDate = monday.toISOString().split("T")[0] + "T00:00:00";
  } else if (category === "monthly") {
    // 월 1회 (1일 기준)
    fromDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01T00:00:00`;
  } else if (category === "yearly" || category === "marriage-star") {
    // 년 1회 (1월 1일 기준)
    fromDate = `${now.getFullYear()}-01-01T00:00:00`;
  } else {
    // 기본: 하루 1회
    fromDate = now.toISOString().split("T")[0] + "T00:00:00";
  }

  const { data } = await supabase
    .from("readings")
    .select("id, reading")
    .eq("user_id", userId)
    .eq("category", fullCategory)
    .gte("created_at", fromDate)
    .order("created_at", { ascending: false })
    .limit(1);

  return data && data.length > 0 ? data[0] : null;
}
