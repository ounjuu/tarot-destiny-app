"use client";

import Image from "next/image";

interface CardSpreadLayoutProps {
  categoryId: string;
  cards: { id: number; name: string; nameKo: string; image: string }[];
}

const POSITION_LABELS: Record<string, string[]> = {
  love: ["나의 마음", "상대의 마음", "두 사람의 현재", "장애물", "숨겨진 감정", "결말"],
  couple: ["나의 상태", "상대의 상태", "관계의 현재", "갈등 요인", "해결의 열쇠", "관계의 미래"],
  friendship: ["나의 입장", "친구의 입장", "우정의 현재", "시련", "필요한 것", "우정의 방향"],
  exam: ["현재 실력", "숨은 잠재력", "방해 요소", "도움이 되는 것", "시험 당일", "최종 결과"],
  aptitude: ["현재 나", "숨겨진 재능", "피해야 할 길", "맞는 방향", "성장 포인트", "미래 모습"],
  study: ["학업 상태", "강점", "약점", "집중할 것", "주변 환경", "학업 성과"],
  career: ["현재 직장", "이직 동기", "새로운 기회", "리스크", "준비할 것", "이직 결과"],
  health: ["현재 건강", "신체 에너지", "정신 에너지", "주의할 점", "도움 되는 것", "건강 전망"],
};

const isLoveCategory = (id: string) => id === "love" || id === "couple";

export default function CardSpreadLayout({ categoryId, cards }: CardSpreadLayoutProps) {
  const labels = POSITION_LABELS[categoryId] || POSITION_LABELS.love;

  // 연애운/커플운: 하트 모양 배치 (반응형)
  if (isLoveCategory(categoryId)) {
    return (
      <div className="relative w-full max-w-[280px] aspect-[280/220] mx-auto mb-6">
        {[
          { x: "20%", y: "0%" },
          { x: "59%", y: "0%" },
          { x: "5%", y: "25%" },
          { x: "73%", y: "25%" },
          { x: "20%", y: "45%" },
          { x: "59%", y: "45%" },
        ].map((pos, i) => (
          <div
            key={cards[i]?.id ?? i}
            className="absolute fade-in flex flex-col items-center"
            style={{ left: pos.x, top: pos.y, animationDelay: `${i * 0.12}s` }}
          >
            <div className="w-[42px] h-[63px] sm:w-[52px] sm:h-[78px] rounded-lg overflow-hidden border border-gold/40 shadow-md">
              <Image src={cards[i].image} alt={cards[i].nameKo} width={52} height={78} className="w-full h-full object-cover" />
            </div>
            <span className="text-[7px] sm:text-[8px] text-gold/40 mt-0.5 text-center w-[50px]">{labels[i]}</span>
          </div>
        ))}
        <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 280 220" fill="none">
          <path d="M140 210 Q30 140 40 70 Q50 10 140 60 Q230 10 240 70 Q250 140 140 210Z" stroke="#e0a0b0" strokeWidth="0.8" opacity="0.2" fill="none" />
        </svg>
      </div>
    );
  }

  // 기본: 2x3 그리드 (반응형)
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3 justify-items-center mx-auto mb-6 max-w-[220px] sm:max-w-[240px]">
      {cards.map((card, i) => (
        <div key={card.id} className="fade-in flex flex-col items-center" style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="w-[42px] h-[63px] sm:w-[52px] sm:h-[78px] rounded-lg overflow-hidden border border-gold/40 shadow-md">
            <Image src={card.image} alt={card.nameKo} width={52} height={78} className="w-full h-full object-cover" />
          </div>
          <span className="text-[7px] sm:text-[8px] text-gold/40 mt-0.5 text-center w-[50px]">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
