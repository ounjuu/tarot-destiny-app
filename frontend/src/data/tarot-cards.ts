// 메이저 아르카나 22장
export const MAJOR_ARCANA = [
  { id: 0, name: "The Fool", nameKo: "광대", image: "/cards/00-fool.svg" },
  { id: 1, name: "The Magician", nameKo: "마법사", image: "/cards/01-magician.svg" },
  { id: 2, name: "The High Priestess", nameKo: "여사제", image: "/cards/02-high-priestess.svg" },
  { id: 3, name: "The Empress", nameKo: "여황제", image: "/cards/03-empress.svg" },
  { id: 4, name: "The Emperor", nameKo: "황제", image: "/cards/04-emperor.svg" },
  { id: 5, name: "The Hierophant", nameKo: "교황", image: "/cards/05-hierophant.svg" },
  { id: 6, name: "The Lovers", nameKo: "연인", image: "/cards/06-lovers.svg" },
  { id: 7, name: "The Chariot", nameKo: "전차", image: "/cards/07-chariot.svg" },
  { id: 8, name: "Strength", nameKo: "힘", image: "/cards/08-strength.svg" },
  { id: 9, name: "The Hermit", nameKo: "은둔자", image: "/cards/09-hermit.svg" },
  { id: 10, name: "Wheel of Fortune", nameKo: "운명의 수레바퀴", image: "/cards/10-wheel.svg" },
  { id: 11, name: "Justice", nameKo: "정의", image: "/cards/11-justice.svg" },
  { id: 12, name: "The Hanged Man", nameKo: "매달린 사람", image: "/cards/12-hanged-man.svg" },
  { id: 13, name: "Death", nameKo: "죽음", image: "/cards/13-death.svg" },
  { id: 14, name: "Temperance", nameKo: "절제", image: "/cards/14-temperance.svg" },
  { id: 15, name: "The Devil", nameKo: "악마", image: "/cards/15-devil.svg" },
  { id: 16, name: "The Tower", nameKo: "탑", image: "/cards/16-tower.svg" },
  { id: 17, name: "The Star", nameKo: "별", image: "/cards/17-star.svg" },
  { id: 18, name: "The Moon", nameKo: "달", image: "/cards/18-moon.svg" },
  { id: 19, name: "The Sun", nameKo: "태양", image: "/cards/19-sun.svg" },
  { id: 20, name: "Judgement", nameKo: "심판", image: "/cards/20-judgement.svg" },
  { id: 21, name: "The World", nameKo: "세계", image: "/cards/21-world.svg" },
];

export const CARD_BACK_IMAGE = "/cards/card-back.svg";

// 운세 카테고리
export const CATEGORIES = [
  { id: "love", label: "연애운", icon: "💘", description: "솔로의 연애 운세" },
  { id: "couple", label: "커플운", icon: "💑", description: "연인과의 관계 운세" },
  { id: "friendship", label: "우정운", icon: "🤝", description: "친구와의 관계 운세" },
  { id: "exam", label: "시험운", icon: "📝", description: "시험 및 합격 운세" },
  { id: "aptitude", label: "적성운", icon: "🧭", description: "나에게 맞는 진로 운세" },
  { id: "study", label: "학업운", icon: "📚", description: "학업 성취 운세" },
  { id: "career", label: "이직운", icon: "💼", description: "이직 및 직장 운세" },
  { id: "health", label: "건강운", icon: "🏥", description: "건강 관련 운세" },
];

// 카드 20장 랜덤 셔플
export function getShuffledCards(count: number = 20) {
  const cards = [...MAJOR_ARCANA];
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards.slice(0, count);
}
