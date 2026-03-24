import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { callAI } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { userId, userName, category, birthday, birthTime, gender, calendarType } = await request.json();

    if (!birthday) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    // 기존 결과 확인 (카테고리별 기간 제한)
    if (userId && supabase) {
      const existing = await getExistingSajuReading(userId, category);
      if (existing) {
        return NextResponse.json({
          success: true,
          reading: existing.reading,
          readingId: existing.id,
          cached: true,
        });
      }
    }

    // 사주팔자 계산
    let sajuData = "";
    let sajuChart = null;
    try {
      const { calculateSaju, getPillarByHangul, solarToLunar, lunarToSolar } = await import("@fullstackfamily/manseryeok");

      let [year, month, day] = birthday.split("-").map(Number);
      let hour = 12;
      if (birthTime) {
        hour = parseInt(birthTime.split(":")[0]);
      }

      // 음력이면 양력으로 변환 (사주 계산은 양력 기준)
      if (calendarType === "lunar") {
        try {
          const converted = lunarToSolar(year, month, day, false);
          year = converted.solar.year;
          month = converted.solar.month;
          day = converted.solar.day;
        } catch {}
      }

      const saju = calculateSaju(year, month, day, hour);
      const lunar = solarToLunar(year, month, day);

      // 각 기둥 상세 정보
      const yearInfo = getPillarByHangul(saju.yearPillar);
      const monthInfo = getPillarByHangul(saju.monthPillar);
      const dayInfo = getPillarByHangul(saju.dayPillar);
      const hourInfo = saju.hourPillar ? getPillarByHangul(saju.hourPillar) : null;

      // 오행 카운트
      const elements: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
      [yearInfo, monthInfo, dayInfo, hourInfo].forEach((p) => {
        if (p?.tiangan?.element) elements[p.tiangan.element]++;
        if (p?.dizhi?.element) elements[p.dizhi.element]++;
      });

      const elementStr = Object.entries(elements)
        .map(([k, v]) => `${k}(${v})`)
        .join(", ");

      // 일간 (일주 천간 = 나 자신)
      const ilgan = dayInfo?.tiangan;

      sajuData = `
사주팔자:
- 년주: ${saju.yearPillar} (${saju.yearPillarHanja}) - 천간 ${yearInfo?.tiangan?.element || ""} / 지지 ${yearInfo?.dizhi?.element || ""} / 띠: ${yearInfo?.dizhi?.animal || ""}
- 월주: ${saju.monthPillar} (${saju.monthPillarHanja}) - 천간 ${monthInfo?.tiangan?.element || ""} / 지지 ${monthInfo?.dizhi?.element || ""}
- 일주: ${saju.dayPillar} (${saju.dayPillarHanja}) - 천간 ${dayInfo?.tiangan?.element || ""} / 지지 ${dayInfo?.dizhi?.element || ""} (일간 = 나 자신)
- 시주: ${saju.hourPillar} (${saju.hourPillarHanja}) - 천간 ${hourInfo?.tiangan?.element || ""} / 지지 ${hourInfo?.dizhi?.element || ""}

일간: ${ilgan?.hangul || ""}${ilgan?.element || ""} (${ilgan?.hanja || ""}) - ${getIlganDescription(ilgan?.hangul || "")}

오행 분포: ${elementStr}
${getElementAnalysis(elements)}

음력: ${lunar.lunar.year}년 ${lunar.lunar.month}월 ${lunar.lunar.day}일 ${lunar.lunar.isLeapMonth ? "(윤달)" : ""}
음양: ${yearInfo?.yinYang || ""} / ${monthInfo?.yinYang || ""} / ${dayInfo?.yinYang || ""} / ${hourInfo?.yinYang || ""}`;

      sajuChart = {
        year: { pillar: saju.yearPillar, hanja: saju.yearPillarHanja, stem: yearInfo?.tiangan?.hangul || "", branch: yearInfo?.dizhi?.hangul || "", stemElement: yearInfo?.tiangan?.element || "", branchElement: yearInfo?.dizhi?.element || "", animal: yearInfo?.dizhi?.animal || "" },
        month: { pillar: saju.monthPillar, hanja: saju.monthPillarHanja, stem: monthInfo?.tiangan?.hangul || "", branch: monthInfo?.dizhi?.hangul || "", stemElement: monthInfo?.tiangan?.element || "", branchElement: monthInfo?.dizhi?.element || "" },
        day: { pillar: saju.dayPillar, hanja: saju.dayPillarHanja, stem: dayInfo?.tiangan?.hangul || "", branch: dayInfo?.dizhi?.hangul || "", stemElement: dayInfo?.tiangan?.element || "", branchElement: dayInfo?.dizhi?.element || "" },
        hour: { pillar: saju.hourPillar || "?", hanja: saju.hourPillarHanja || "?", stem: hourInfo?.tiangan?.hangul || "?", branch: hourInfo?.dizhi?.hangul || "?", stemElement: hourInfo?.tiangan?.element || "", branchElement: hourInfo?.dizhi?.element || "" },
        elements: elements,
        ilgan: ilgan?.hangul || "",
        ilganElement: ilgan?.element || "",
      };

    } catch {
      sajuData = "";
    }

    const prompt = buildSajuPrompt(category, birthday, birthTime, sajuData, userName, gender, calendarType);

    const { text: reading, source, geminiFailed, groqFailed } = await callAI(prompt);

    // 실패 로그
    if (geminiFailed && !groqFailed && reading && supabase) {
      await supabase.from("fallback_logs").insert({
        category: `saju_${category}`,
        error_type: "gemini_failed_groq_success",
        user_id: userId || null,
      });
    }

    if (!reading) {
      if (supabase) {
        await supabase.from("fallback_logs").insert({
          category: `saju_${category}`,
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
          category: `saju_${category}`,
          category_label: getCategoryLabel(category),
          cards: [],
          reading,
          score,
          keywords: "",
          source: source || "gemini",
        })
        .select("id")
        .single();

      readingId = inserted?.id;
    }

    return NextResponse.json({ success: true, reading, readingId, sajuChart });
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
    "saju-chart": "나의 사주",
    "saju-daily": "오늘의 운세",
    "saju-weekly": "이번 주 운세",
    "saju-monthly": "이번 달 운세",
    "saju-yearly": "올해의 운세",
    "saju-love": "연애운",
    "saju-career": "직업운",
    "saju-wealth": "재물운",
  };
  return labels[category] || category;
}

function getIlganDescription(ilgan: string): string {
  const desc: Record<string, string> = {
    "갑": "큰 나무 - 곧고 당당한 기운, 리더십",
    "을": "꽃과 풀 - 부드럽고 유연한 기운, 적응력",
    "병": "태양 - 밝고 뜨거운 기운, 열정",
    "정": "촛불 - 따뜻하고 섬세한 기운, 배려",
    "무": "큰 산 - 묵직하고 안정된 기운, 신뢰",
    "기": "논밭 - 포용하고 기르는 기운, 양육",
    "경": "쇠와 바위 - 강하고 결단력 있는 기운, 정의",
    "신": "보석 - 세련되고 날카로운 기운, 완벽주의",
    "임": "바다와 강 - 넓고 깊은 기운, 지혜",
    "계": "이슬과 비 - 맑고 순수한 기운, 직관",
  };
  return desc[ilgan] || "";
}

function getElementAnalysis(elements: Record<string, number>): string {
  const total = Object.values(elements).reduce((a, b) => a + b, 0);
  const strong = Object.entries(elements).filter(([, v]) => v >= 3).map(([k]) => k);
  const weak = Object.entries(elements).filter(([, v]) => v === 0).map(([k]) => k);

  let analysis = "";
  if (strong.length > 0) analysis += `과다한 오행: ${strong.join(", ")}. `;
  if (weak.length > 0) analysis += `부족한 오행: ${weak.join(", ")}. `;
  if (strong.length === 0 && weak.length === 0) analysis += "오행이 비교적 균형잡혀 있음.";
  return analysis;
}

function buildSajuPrompt(category: string, birthday: string, birthTime: string | null, sajuData: string, userName?: string, gender?: string, calendarType?: string): string {
  const genderStr = gender === "male" ? "남성" : gender === "female" ? "여성" : "알 수 없음";
  const calendarStr = calendarType === "lunar" ? "음력" : "양력";
  const baseInfo = `사용자 정보:
- 성별: ${genderStr}
- 생년월일 (${calendarStr}): ${birthday}
- 태어난 시간: ${birthTime || "알 수 없음"}
${sajuData}`;

  const rules = `당신은 30년 경력의 사주 명리학 전문가이자, 동네에서 가장 따뜻한 상담사 "루나"입니다.
오랜 경험과 직관으로 사람의 마음을 읽고, 친한 언니/오빠처럼 편안하게 이야기를 나눕니다.
당신 앞에 소중한 사람이 앉아 있다고 생각하고, 진심을 담아 이야기해주세요.

해석 스타일:
- "자, 사주를 한번 볼게요... 어머, 이거 되게 재밌는 사주인데요?" 처럼 실제 대화하듯 자연스럽게
- "~하고 있네요", "~거든요", "~인 것 같아요", "~해보세요" 같은 다정한 말투
- 사주 용어나 데이터를 절대 기계적으로 나열하지 마세요. "당신은 큰 나무 같은 사람이에요. 뿌리가 깊고 꿋꿋하거든요" 이런 식으로 비유와 이야기로 풀어주세요
- 이름을 절대 부르지 마세요. "당신"이라고 하세요
- 마치 카페에서 오랜 친구와 이야기하듯 편안하고 따뜻하게
- "아, 이 부분은 제가 봐도 정말 부러워요", "솔직히 말하면요" 같은 감정 표현도 넣어주세요
- 각 섹션을 충분히 길고 풍성하게 써주세요. 짧게 끝내지 마세요.
- 구체적인 상황 예시를 많이 넣어주세요 ("예를 들어 회의 중에 갑자기 좋은 아이디어가 떠오르는 타입이에요")
- 부정적인 내용도 "근데 걱정하지 마세요, 이건 이렇게 하면 되거든요" 식으로 항상 해결책과 함께
- 마지막에는 항상 따뜻하게 안아주는 느낌으로 마무리해주세요

절대 지켜야 할 규칙:
- ** ** 볼드 마크다운 절대 사용 금지. 일반 텍스트만 사용
- 천간지지 한자(甲乙丙丁 등)를 그대로 보여주지 마세요
- "갑목이 을화를 생하고", "일간이 편관을 만나" 같은 명리학 전문 용어 금지. 누구나 이해할 수 있게 쉽게 풀어주세요
- 오행 분석을 숫자로 나열하지 마세요 ("목 3개, 화 1개" 금지). "나무의 기운이 강해서 성장하려는 에너지가 넘쳐요" 이런 식으로`;

  if (category === "saju-chart") {
    return `${rules}\n\n${baseInfo}\n\n이 사람의 사주팔자를 종합적으로 분석해주세요. 오래된 친구에게 이야기하듯 편안하고 따뜻하게, 충분히 길게 풀어주세요.\n\n형식:\n✦ 나의 사주\n\n☽ 당신은 이런 사람이에요\n(10-12문장, 일간을 중심으로 이 사람의 핵심 성격을 비유와 구체적 상황으로 풍성하게. "회의할 때 이런 모습", "친구들 사이에서는 이런 역할", "혼자 있을 때는 이런 면이 있어요" 등 생생한 예시 포함)\n\n✧ 타고난 에너지와 균형\n(7-8문장, 오행을 쉬운 비유로 풀어서. "불의 에너지가 강해서 열정이 넘치는데, 그만큼 가끔 지칠 수 있어요" 같은 식으로. 강한 에너지를 어떻게 활용하고, 부족한 에너지를 어떻게 보완할지)\n\n★ 인생의 큰 그림\n(8-10문장, 10대/20대/30대/40대 이후의 흐름을 이야기하듯. "20대에는 이런 시기였을 거예요", "30대 중반쯤에 큰 전환점이 올 수 있어요" 같이 구체적으로)\n\n☽ 이것만 주의하면 돼요\n(4-5문장, 약점을 다독이면서 극복 방법을 구체적으로. "걱정하지 마세요" 로 시작)\n\n★ 루나가 당신에게 전하고 싶은 말\n(5-6문장, 진심을 담아 감동적으로. 이 사람의 인생을 응원하는 따뜻한 메시지)\n\n✦ 사주 키워드\n(5개)`;
  }

  if (category === "saju-daily") {
    return `${rules}\n\n${baseInfo}\n\n오늘 날짜: ${new Date().toISOString().split("T")[0]}\n\n사주를 바탕으로 오늘의 운세를 따뜻하게 해석해주세요.\n\n형식:\n✦ 오늘의 사주 운세\n\n✦ 오늘의 점수\n(20~100% + 한 줄 코멘트. 가끔 낮은 점수도)\n\n☽ 오늘 하루는 이래요\n(7-8문장, 아침에 눈 뜨면서부터 잠들기까지의 흐름을 이야기하듯. "아침에는 좀 느릿느릿할 수 있는데, 점심 지나면서 에너지가 올라올 거예요" 같이 구체적으로)\n\n✧ 이것만 조심하면 돼요\n(3-4문장, 구체적인 상황과 해결법 함께)\n\n★ 루나의 한마디\n(4-5문장, 오늘 하루를 잘 보내기 위한 진심 어린 조언. 친한 친구가 아침에 보내주는 응원 메시지처럼)\n\n✦ 행운의 키워드\n(3개)`;
  }

  if (category === "saju-weekly") {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const weekRange = `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
    return `${rules}\n\n${baseInfo}\n\n이번 주(${weekRange}) 운세를 사주를 바탕으로 따뜻하게 해석해주세요.\n\n형식:\n✦ 이번 주 사주 운세\n\n✦ 이번 주 점수\n(20~100% + 한 줄 코멘트)\n\n☽ 이번 주는 이래요\n(8-10문장, 월화수/목금/주말 흐름을 이야기하듯. "월요일은 좀 무거울 수 있는데, 수요일쯤 되면 분위기가 확 바뀔 거예요" 같이 생생하게)\n\n✧ 이것만 조심하면 돼요\n(3-4문장)\n\n★ 루나의 한마디\n(4-5문장, 한 주를 응원하는 따뜻한 메시지)\n\n✦ 행운의 키워드\n(3개)`;
  }

  if (category === "saju-monthly") {
    const now = new Date();
    const monthName = `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
    return `${rules}\n\n${baseInfo}\n\n${monthName} 운세를 사주를 바탕으로 따뜻하게 해석해주세요.\n\n형식:\n✦ ${monthName} 사주 운세\n\n✦ 이번 달 점수\n(20~100% + 한 줄 코멘트)\n\n☽ 이번 달은 이래요\n(8-10문장, 월초/월중/월말의 흐름과 분위기 변화를 구체적으로)\n\n✧ 기회와 주의\n(5-6문장, 놓치면 안 되는 기회와 조심할 점을 구체적 상황과 함께)\n\n★ 루나의 한마디\n(4-5문장, 한 달을 응원하는 따뜻한 메시지)\n\n✦ 행운의 키워드\n(3개)`;
  }

  if (category === "saju-yearly") {
    const year = new Date().getFullYear();
    return `${rules}\n\n${baseInfo}\n\n${year}년 운세를 사주를 바탕으로 따뜻하게 해석해주세요.\n\n형식:\n✦ ${year}년 사주 운세\n\n✦ 올해의 점수\n(20~100% + 한 줄 코멘트)\n\n☽ 올해는 이래요\n(10-12문장, 봄/여름/가을/겨울 또는 분기별로 어떤 변화가 오는지 이야기하듯 풍성하게. 각 시기마다 구체적인 상황 예시)\n\n✧ 올해 놓치지 말아야 할 것\n(5-6문장)\n\n★ 루나가 전하는 올해의 메시지\n(4-5문장, 올 한 해를 따뜻하게 응원)\n\n✦ 올해의 키워드\n(3개)`;
  }

  if (category === "saju-love") {
    return `${rules}\n\n${baseInfo}\n\n사주를 바탕으로 연애운을 친한 언니/오빠처럼 따뜻하게 해석해주세요.\n\n형식:\n✦ 사주 연애운\n\n✦ 연애운 점수\n(20~100% + 한 줄 코멘트)\n\n☽ 당신의 연애 스타일\n(7-8문장, 좋아하는 사람 앞에서 어떻게 되는지, 연애할 때 습관, 질투는 하는 타입인지 등 구체적이고 생생하게)\n\n✧ 지금의 연애 흐름\n(5-6문장, 현재 시기의 연애 에너지와 앞으로 어떤 변화가 올지)\n\n★ 루나의 연애 조언\n(4-5문장, 진심 담은 따뜻한 조언. "솔직히 말하면요..." 같은 느낌으로)\n\n✦ 연애 키워드\n(3개)`;
  }

  if (category === "saju-career") {
    return `${rules}\n\n${baseInfo}\n\n사주를 바탕으로 직업운을 따뜻하게 해석해주세요.\n\n형식:\n✦ 사주 직업운\n\n☽ 타고난 적성과 강점\n(7-8문장, 일할 때 빛나는 능력, 어떤 환경에서 잘하는지, 동료들이 보는 당신의 이미지 등 구체적으로)\n\n✧ 이런 일이 잘 맞아요\n(구체적 직업 5-7개 추천. 각각 왜 맞는지 2-3줄씩 "이 일을 하면 이런 점에서 빛날 수 있어요" 식으로)\n\n✧ 직장에서의 당신\n(5-6문장, 상사/동료와의 관계, 스트레스 받는 포인트, 성장하는 방식)\n\n★ 루나의 커리어 조언\n(4-5문장, 앞으로의 커리어에 대한 진심 어린 조언)\n\n✦ 커리어 키워드\n(3개)`;
  }

  if (category === "saju-wealth") {
    return `${rules}\n\n${baseInfo}\n\n사주를 바탕으로 재물운을 따뜻하게 해석해주세요.\n\n형식:\n✦ 사주 재물운\n\n✦ 재물운 점수\n(20~100% + 한 줄 코멘트)\n\n☽ 당신과 돈의 관계\n(7-8문장, 돈을 대하는 태도, 소비 습관, 돈이 들어오는 패턴을 구체적이고 재밌게. "충동구매 좀 하는 타입이죠?" 같은 공감 포인트)\n\n✧ 돈이 들어오는 시기와 방법\n(5-6문장, 어떤 방식이 맞는지, 투자 스타일, 주의할 시기 등 구체적으로)\n\n★ 루나의 재물 조언\n(4-5문장, 현실적이면서 따뜻한 재물 조언)\n\n✦ 재물 키워드\n(3개)`;
  }

  return `${rules}\n\n${baseInfo}\n\n이 사람의 사주를 해석해주세요.`;
}

// 카테고리별 기간 제한 체크
async function getExistingSajuReading(userId: string, category: string) {
  if (!supabase) return null;

  const fullCategory = `saju_${category}`;

  // 영구: 한번 보면 계속 같은 결과
  if (category === "saju-chart" || category === "saju-career" || category === "saju-love" || category === "saju-wealth") {
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
  let fromDate: string;

  if (category === "saju-daily") {
    fromDate = now.toISOString().split("T")[0] + "T00:00:00";
  } else if (category === "saju-weekly") {
    const monday = new Date(now);
    const day = monday.getDay();
    monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
    fromDate = monday.toISOString().split("T")[0] + "T00:00:00";
  } else if (category === "saju-monthly") {
    fromDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01T00:00:00`;
  } else if (category === "saju-yearly") {
    fromDate = `${now.getFullYear()}-01-01T00:00:00`;
  } else {
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
