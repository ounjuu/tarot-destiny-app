// 메이저 아르카나 22장 - 파스텔 동물 스타일
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

// 메이저 아르카나 - Rider-Waite 클래식 스타일
export const MAJOR_ARCANA_CLASSIC = [
  { id: 0, name: "The Fool", nameKo: "광대", image: "/cards/rider-waite/00-fool.jpg" },
  { id: 1, name: "The Magician", nameKo: "마법사", image: "/cards/rider-waite/01-magician.jpg" },
  { id: 2, name: "The High Priestess", nameKo: "여사제", image: "/cards/rider-waite/02-high-priestess.jpg" },
  { id: 3, name: "The Empress", nameKo: "여황제", image: "/cards/rider-waite/03-empress.jpg" },
  { id: 4, name: "The Emperor", nameKo: "황제", image: "/cards/rider-waite/04-emperor.jpg" },
  { id: 5, name: "The Hierophant", nameKo: "교황", image: "/cards/rider-waite/05-hierophant.jpg" },
  { id: 6, name: "The Lovers", nameKo: "연인", image: "/cards/rider-waite/06-lovers.jpg" },
  { id: 7, name: "The Chariot", nameKo: "전차", image: "/cards/rider-waite/07-chariot.jpg" },
  { id: 8, name: "Strength", nameKo: "힘", image: "/cards/rider-waite/08-strength.jpg" },
  { id: 9, name: "The Hermit", nameKo: "은둔자", image: "/cards/rider-waite/09-hermit.jpg" },
  { id: 10, name: "Wheel of Fortune", nameKo: "운명의 수레바퀴", image: "/cards/rider-waite/10-wheel.jpg" },
  { id: 11, name: "Justice", nameKo: "정의", image: "/cards/rider-waite/11-justice.jpg" },
  { id: 12, name: "The Hanged Man", nameKo: "매달린 사람", image: "/cards/rider-waite/12-hanged-man.jpg" },
  { id: 13, name: "Death", nameKo: "죽음", image: "/cards/rider-waite/13-death.jpg" },
  { id: 14, name: "Temperance", nameKo: "절제", image: "/cards/rider-waite/14-temperance.jpg" },
  { id: 15, name: "The Devil", nameKo: "악마", image: "/cards/rider-waite/15-devil.jpg" },
  { id: 16, name: "The Tower", nameKo: "탑", image: "/cards/rider-waite/16-tower.png" },
  { id: 17, name: "The Star", nameKo: "별", image: "/cards/rider-waite/17-star.jpg" },
  { id: 18, name: "The Moon", nameKo: "달", image: "/cards/rider-waite/18-moon.jpg" },
  { id: 19, name: "The Sun", nameKo: "태양", image: "/cards/rider-waite/19-sun.jpg" },
  { id: 20, name: "Judgement", nameKo: "심판", image: "/cards/rider-waite/20-judgement.jpg" },
  { id: 21, name: "The World", nameKo: "세계", image: "/cards/rider-waite/21-world.jpg" },
];

export const CARD_BACK_IMAGE = "/cards/card-back.svg";

// 카테고리별 카드 덱 선택
const CLASSIC_CATEGORIES = ["love", "couple", "exam", "study", "career", "health"];

export function getCardDeck(categoryId: string) {
  return CLASSIC_CATEGORIES.includes(categoryId) ? MAJOR_ARCANA_CLASSIC : MAJOR_ARCANA;
}

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
export function getShuffledCards(count: number = 20, categoryId?: string) {
  const deck = categoryId ? getCardDeck(categoryId) : MAJOR_ARCANA;
  const cards = [...deck];
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards.slice(0, count);
}
