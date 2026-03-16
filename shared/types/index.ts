// 타로 카드 타입
export interface TarotCard {
  id: number;
  name: string;
  nameKo: string;
  description: string;
  image: string;
  isReversed: boolean;
}

// 타로 리딩 요청
export interface TarotReadingRequest {
  cards: TarotCard[];
  question: string;
}

// 타로 리딩 응답
export interface TarotReadingResponse {
  success: boolean;
  reading: string;
  error?: string;
}
