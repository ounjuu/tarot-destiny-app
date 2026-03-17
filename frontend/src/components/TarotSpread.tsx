"use client";

import { useState } from "react";
import Image from "next/image";
import { CARD_BACK_IMAGE, getShuffledCards, getCardDeck } from "@/data/tarot-cards";
import CardSpreadLayout from "./CardSpreadLayout";

interface TarotSpreadProps {
  categoryId: string;
  categoryLabel: string;
  onBack: () => void;
}

export default function TarotSpread({ categoryId, categoryLabel, onBack }: TarotSpreadProps) {
  const [cards] = useState(() => getShuffledCards(20, categoryId));
  const deck = getCardDeck(categoryId);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [phase, setPhase] = useState<"select" | "flipping" | "loading" | "result">("select");
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [reading, setReading] = useState("");
  const MAX_CARDS = 6;

  const remainingCards = cards.filter((c) => !selectedCards.includes(c.id));

  const handleCardClick = (cardId: number) => {
    if (phase !== "select") return;
    if (selectedCards.includes(cardId)) return; // 다시 선택 불가
    if (selectedCards.length >= MAX_CARDS) return;
    setSelectedCards([...selectedCards, cardId]);
  };

  // 6장 뽑은 후 한번에 뒤집기
  const handleFlipAll = () => {
    setPhase("flipping");

    // 카드를 하나씩 순차적으로 뒤집기
    selectedCards.forEach((cardId, i) => {
      setTimeout(() => {
        setFlippedCards((prev) => new Set(prev).add(cardId));
      }, i * 400);
    });

    // 전부 뒤집힌 후 결과 요청
    setTimeout(() => {
      fetchReading();
    }, selectedCards.length * 400 + 800);
  };

  const fetchReading = async () => {
    setPhase("loading");

    const selectedCardData = selectedCards.map((id) =>
      deck.find((c) => c.id === id)!
    );

    try {
      const response = await fetch("/api/tarot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: categoryId,
          categoryLabel,
          cards: selectedCardData.map((c) => c.nameKo),
        }),
      });

      const data = await response.json();
      setReading(data.reading || "해석을 불러오지 못했습니다.");
    } catch {
      setReading("서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }

    setPhase("result");
  };

  const selectedCardData = selectedCards.map((id) =>
    deck.find((c) => c.id === id)!
  );

  const totalRemaining = remainingCards.length;
  const fanAngle = Math.min(100, totalRemaining * 5);
  const startAngle = -fanAngle / 2;

  return (
    <div className="flex flex-col h-full">
      {/* 카드 선택 & 뒤집기 화면 */}
      {(phase === "select" || phase === "flipping") && (
        <div className="flex flex-col h-full">
          {/* 중앙: 뽑은 카드 영역 */}
          <div className="flex-1 flex flex-col items-center justify-center px-3">
            {/* 안내 텍스트 */}
            <p className="text-gold/50 text-xs mb-2">
              {phase === "flipping"
                ? "✧ 카드를 뒤집는 중... ✧"
                : selectedCards.length === 0
                  ? "✧ 아래에서 끌리는 카드를 뽑아주세요 ✧"
                  : `✧ ${selectedCards.length} / ${MAX_CARDS} 선택 완료 ✧`}
            </p>

            {/* 프로그레스 바 */}
            {phase === "select" && (
              <div className="w-48 h-1 bg-purple-dark/30 rounded-full overflow-hidden mb-5">
                <div
                  className="h-full bg-gradient-to-r from-purple to-gold rounded-full transition-all duration-500"
                  style={{ width: `${(selectedCards.length / MAX_CARDS) * 100}%` }}
                />
              </div>
            )}

            {/* 뽑은 카드 배경 프레임 */}
            <div className="relative p-4 pb-5 rounded-2xl border border-gold/10 bg-purple-dark/10">
              {/* 모서리 장식 */}
              <div className="absolute top-1.5 left-2.5 text-gold/15 text-[8px]">✦</div>
              <div className="absolute top-1.5 right-2.5 text-gold/15 text-[8px]">✦</div>
              <div className="absolute bottom-1.5 left-2.5 text-gold/15 text-[8px]">✦</div>
              <div className="absolute bottom-1.5 right-2.5 text-gold/15 text-[8px]">✦</div>

              {/* 카드 6장 - 3x2 그리드 (작은 화면 대응) */}
              <div className="grid grid-cols-6 gap-1.5 sm:gap-2.5 justify-items-center">
                {Array.from({ length: MAX_CARDS }).map((_, i) => {
                  const card = selectedCardData[i];
                  const isFlipped = card && flippedCards.has(card.id);

                  return (
                    <div key={card?.id ?? `empty-${i}`} className="flex flex-col items-center gap-1">
                      <span className={`text-[8px] sm:text-[9px] ${card ? "text-gold/50" : "text-gold/15"}`}>
                        {i + 1}
                      </span>

                      {card ? (
                        <div className="fade-in card-flip w-[46px] h-[69px] sm:w-[56px] sm:h-[84px]" style={{ animationDelay: `${i * 0.1}s` }}>
                          <div className={`card-flip-inner ${isFlipped ? "flipped" : ""}`}>
                            <div className="card-front rounded-md overflow-hidden border-2 border-[#c9a84c]/30 shadow-md">
                              <Image src={CARD_BACK_IMAGE} alt="카드 뒷면" width={56} height={84} className="w-full h-full object-cover" />
                            </div>
                            <div className="card-back rounded-md overflow-hidden border-2 border-gold/50 shadow-md">
                              <Image src={card.image} alt={card.nameKo} width={56} height={84} className="w-full h-full object-cover" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-[46px] h-[69px] sm:w-[56px] sm:h-[84px] rounded-md border-2 border-dashed border-gold/8 flex items-center justify-center bg-purple-dark/5">
                          <span className="text-gold/10 text-[8px]">✧</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 해석 버튼 */}
            {phase === "select" && selectedCards.length === MAX_CARDS && (
              <button
                onClick={handleFlipAll}
                className="slide-up mt-5 px-8 py-3 bg-gradient-to-r from-purple to-gold/80 rounded-2xl text-white font-bold text-sm tracking-wider active:scale-[0.98] transition-transform cursor-pointer shadow-lg shadow-purple/30"
              >
                ✨ 카드 뒤집기
              </button>
            )}
          </div>

          {/* 하단: 부채꼴 카드 (작게) */}
          {phase === "select" && (
            <div className="relative h-[180px] sm:h-[200px] flex-shrink-0">
              <div className="absolute bottom-0 left-1/2 w-0 h-0">
                {remainingCards.map((card, index) => {
                  const angle = totalRemaining > 1
                    ? startAngle + (fanAngle / (totalRemaining - 1)) * index
                    : 0;
                  const radius = 150;

                  return (
                    <div
                      key={card.id}
                      className="absolute origin-bottom cursor-pointer active:scale-95 transition-transform"
                      style={{
                        transform: `rotate(${angle}deg) translateY(-${radius}px)`,
                        transition: "transform 0.4s ease-out",
                        zIndex: index,
                        left: "-25px",
                        bottom: "0",
                      }}
                      onClick={() => handleCardClick(card.id)}
                    >
                      <div className="w-[50px] h-[75px] sm:w-[60px] sm:h-[90px] rounded-lg overflow-hidden shadow-md">
                        <Image src={CARD_BACK_IMAGE} alt="카드 뒷면" width={60} height={90} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 로딩 */}
      {phase === "loading" && (
        <div className="flex flex-col items-center justify-center flex-1">
          {/* 뒤집힌 카드 표시 */}
          <div className="mb-6">
            <CardSpreadLayout categoryId={categoryId} cards={selectedCardData} />
          </div>
          <div className="text-4xl mb-4 pulse-glow">🔮</div>
          <p className="text-gold text-base font-bold mb-2">카드를 해석하고 있어요</p>
          <p className="text-foreground/30 text-sm">달빛이 카드 위를 비추고 있어요...</p>
          <div className="flex gap-1.5 mt-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 bg-gold/60 rounded-full pulse-glow" style={{ animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* 결과 */}
      {phase === "result" && (
        <div className="fade-in px-5 pt-4 pb-6 overflow-y-auto">
          <h2 className="text-center text-gold text-lg font-bold mb-5">✨ {categoryLabel} 결과 ✨</h2>

          {/* 카드 스프레드 */}
          <CardSpreadLayout categoryId={categoryId} cards={selectedCardData} />

          {/* AI 해석 */}
          <div className="relative p-5 bg-gradient-to-b from-purple-dark/30 to-purple-dark/10 rounded-2xl border border-gold/15 mb-6">
            <div className="absolute top-2 left-3 text-gold/20 text-[10px]">✦</div>
            <div className="absolute top-2 right-3 text-gold/20 text-[10px]">✦</div>
            <div className="absolute bottom-2 left-3 text-gold/20 text-[10px]">✦</div>
            <div className="absolute bottom-2 right-3 text-gold/20 text-[10px]">✦</div>
            <div className="text-foreground/85 text-sm leading-7 whitespace-pre-line">{reading}</div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button onClick={onBack} className="flex-1 py-3.5 border border-gold/20 rounded-2xl text-gold/60 text-sm active:scale-[0.98] transition-all cursor-pointer">
              ☽ 다른 운세 보기
            </button>
            <button
              onClick={() => { setSelectedCards([]); setFlippedCards(new Set()); setPhase("select"); }}
              className="flex-1 py-3.5 bg-purple-dark/50 border border-gold/20 rounded-2xl text-gold text-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              ☾ 다시 뽑기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
