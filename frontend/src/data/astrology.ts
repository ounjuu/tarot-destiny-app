// 점성술 카테고리
export const ASTROLOGY_CATEGORIES = [
  { id: "daily", label: "오늘의 운세", icon: "/icons/astrology-service.svg", description: "별이 알려주는 오늘 하루" },
  { id: "personality", label: "성격 분석", icon: "/icons/astrology-service.svg", description: "별자리로 보는 나의 성격" },
  { id: "love-star", label: "연애운", icon: "/icons/love.svg", description: "별이 알려주는 나의 연애" },
  { id: "marriage-star", label: "결혼운", icon: "/icons/remarriage.svg", description: "별자리로 보는 결혼 운명" },
  { id: "compatibility", label: "별자리 궁합", icon: "/icons/astrology-service.svg", description: "두 별자리의 케미는?" },
  { id: "monthly", label: "이번 달 운세", icon: "/icons/astrology-service.svg", description: "이번 달의 흐름과 조언" },
  { id: "yearly", label: "올해의 운세", icon: "/icons/astrology-service.svg", description: "올해의 큰 흐름 읽기" },
  { id: "career-star", label: "직업 적성", icon: "/icons/career.svg", description: "별자리로 보는 나의 적성" },
  { id: "my-chart", label: "나의 별자리", icon: "/icons/astrology-service.svg", description: "출생 차트로 보는 타고난 운명" },
];

// 별자리 정보
export const ZODIAC_SIGNS = [
  { id: "aries", name: "양자리", symbol: "♈", icon: "/icons/zodiac/aries.svg", dates: "3/21 - 4/19", element: "불" },
  { id: "taurus", name: "황소자리", symbol: "♉", icon: "/icons/zodiac/taurus.svg", dates: "4/20 - 5/20", element: "흙" },
  { id: "gemini", name: "쌍둥이자리", symbol: "♊", icon: "/icons/zodiac/gemini.svg", dates: "5/21 - 6/21", element: "바람" },
  { id: "cancer", name: "게자리", symbol: "♋", icon: "/icons/zodiac/cancer.svg", dates: "6/22 - 7/22", element: "물" },
  { id: "leo", name: "사자자리", symbol: "♌", icon: "/icons/zodiac/leo.svg", dates: "7/23 - 8/22", element: "불" },
  { id: "virgo", name: "처녀자리", symbol: "♍", icon: "/icons/zodiac/virgo.svg", dates: "8/23 - 9/22", element: "흙" },
  { id: "libra", name: "천칭자리", symbol: "♎", icon: "/icons/zodiac/libra.svg", dates: "9/23 - 10/22", element: "바람" },
  { id: "scorpio", name: "전갈자리", symbol: "♏", icon: "/icons/zodiac/scorpio.svg", dates: "10/23 - 11/21", element: "물" },
  { id: "sagittarius", name: "사수자리", symbol: "♐", icon: "/icons/zodiac/sagittarius.svg", dates: "11/22 - 12/21", element: "불" },
  { id: "capricorn", name: "염소자리", symbol: "♑", icon: "/icons/zodiac/capricorn.svg", dates: "12/22 - 1/19", element: "흙" },
  { id: "aquarius", name: "물병자리", symbol: "♒", icon: "/icons/zodiac/aquarius.svg", dates: "1/20 - 2/18", element: "바람" },
  { id: "pisces", name: "물고기자리", symbol: "♓", icon: "/icons/zodiac/pisces.svg", dates: "2/19 - 3/20", element: "물" },
];

// 생년월일로 태양 별자리 계산
export function getZodiacSign(month: number, day: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return "gemini";
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return "cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "aquarius";
  return "pisces";
}
