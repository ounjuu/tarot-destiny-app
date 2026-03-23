"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { CARD_BACK_IMAGE, getShuffledCards, getCardDeck, MAJOR_ARCANA, MAJOR_ARCANA_CLASSIC, MINOR_ARCANA_CLASSIC } from "@/data/tarot-cards";
import CardSpreadLayout from "./CardSpreadLayout";

interface TarotSpreadProps {
  categoryId: string;
  categoryLabel: string;
  onBack: () => void;
}

export default function TarotSpread({ categoryId, categoryLabel, onBack }: TarotSpreadProps) {
  const { data: session } = useSession();
  const [cards] = useState(() => getShuffledCards(20, categoryId));
  const deck = getCardDeck(categoryId);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [phase, setPhase] = useState<"checking" | "select" | "flipping" | "loading" | "result">("checking");
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [reading, setReading] = useState("");
  const [readingId, setReadingId] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [todayResult, setTodayResult] = useState(false);
  const MAX_CARDS = 6;

  // 오늘 이미 본 카테고리인지 체크
  useEffect(() => {
    async function checkTodayReading() {
      if (!session?.user?.id) {
        setPhase("select");
        return;
      }
      try {
        const response = await fetch("/api/tarot/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: categoryId, userId: session.user.id }),
        });
        const data = await response.json();
        if (data.exists) {
          setReading(data.reading);
          setReadingId(data.readingId);
          // 저장된 카드 이름으로 카드 데이터 복원
          const allCards = [...MAJOR_ARCANA, ...MAJOR_ARCANA_CLASSIC, ...MINOR_ARCANA_CLASSIC];
          const restored = (data.cards as string[]).map((name: string) => {
            return allCards.find((c) => c.nameKo === name) || deck[0];
          });
          setSelectedCards(restored.map((c) => c.id));
          setTodayResult(true);
          setPhase("result");
          if (data.readingId) {
            window.history.replaceState(null, "", `/result/${data.readingId}`);
          }
          return;
        }
      } catch {}
      setPhase("select");
    }
    checkTodayReading();
  }, []);

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
          userId: session?.user?.id,
        }),
      });

      const data = await response.json();
      setReading(data.reading || "해석을 불러오지 못했습니다.");
      setReadingId(data.readingId || null);
      setHasError(!data.success);

      // 결과 URL로 변경
      if (data.readingId) {
        window.history.replaceState(null, "", `/result/${data.readingId}`);
      }
    } catch {
      setReading("🌙 인터넷 연결이 불안정해요.\n\n네트워크를 확인하고 다시 시도해주세요.");
      setHasError(true);
    }

    setPhase("result");
  };

  const selectedCardData = selectedCards.map((id) =>
    deck.find((c) => c.id === id)!
  );

  const handleShare = async () => {
    const scoreMatch = reading.match(/(\d+)%/);
    const score = scoreMatch ? scoreMatch[0] : "";
    const shareUrl = readingId
      ? `${window.location.origin}/result/${readingId}`
      : window.location.origin;

    if (navigator.share) {
      try {
        // URL만 공유하면 카카오톡이 OG 태그에서 제목/설명/이미지를 가져옴
        await navigator.share({ url: shareUrl });
      } catch {}
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const totalRemaining = remainingCards.length;
  const fanAngle = Math.min(100, totalRemaining * 5);
  const startAngle = -fanAngle / 2;

  return (
    <div className="flex flex-col h-full">
      {/* 체크 중 */}
      {phase === "checking" && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-gold/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold/60 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-gold/50 text-lg">✦</div>
          </div>
          <p className="text-foreground/30 text-sm">카드를 준비하고 있어요...</p>
        </div>
      )}

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
                className="slide-up mt-8 mb-[-20px] px-8 py-3 bg-gradient-to-r from-purple to-gold/80 rounded-2xl text-white font-bold text-sm tracking-wider active:scale-[0.98] transition-transform cursor-pointer shadow-lg shadow-purple/30"
              >
                ✨ 카드 뒤집기
              </button>
            )}
          </div>

          {/* 하단: 부채꼴 카드 (작게) */}
          {phase === "select" && (
            <div className="relative h-[200px] sm:h-[220px] flex-shrink-0 mt-4">
              <div className="absolute bottom-0 left-1/2 w-0 h-0">
                {remainingCards.map((card, index) => {
                  const angle = totalRemaining > 1
                    ? startAngle + (fanAngle / (totalRemaining - 1)) * index
                    : 0;
                  const radius = 130;

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
        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <CardSpreadLayout categoryId={categoryId} cards={selectedCardData} />
          <div className="relative w-14 h-14 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-purple/30" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold/70 animate-spin" />
            <div className="absolute inset-[-6px] rounded-full border border-transparent border-b-purple/30 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
            <div className="absolute inset-0 flex items-center justify-center text-gold/60 text-sm pulse-glow">✦</div>
          </div>
          <p className="text-gold text-base font-bold mb-2">카드를 해석하고 있어요</p>
          <p className="text-foreground/30 text-sm">달빛이 카드 위를 비추고 있어요...</p>
        </div>
      )}

      {/* 결과 */}
      {phase === "result" && (
        <div className="fade-in px-5 pt-4 pb-6 overflow-y-auto">
          <h2 className="text-center text-gold text-lg font-bold mb-1">✨ {categoryLabel} 결과 ✨</h2>
          {todayResult && (
            <p className="text-center text-foreground/30 text-[11px] mb-4">오늘 이미 확인한 결과예요</p>
          )}
          {!todayResult && <div className="mb-5" />}

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
          <div className="flex flex-col gap-3">
            {hasError && (
              <button
                onClick={() => { setHasError(false); fetchReading(); }}
                className="w-full py-3.5 bg-gradient-to-r from-purple to-gold/80 rounded-2xl text-white font-bold text-sm active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-purple/30"
              >
                ✨ 다시 해석하기
              </button>
            )}
            {!hasError && (
              <button
                onClick={handleShare}
                className="w-full py-3.5 bg-gradient-to-r from-purple to-gold/80 rounded-2xl text-white font-bold text-sm active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-purple/30"
              >
                {copied ? "✅ 복사 완료!" : "📤 결과 공유하기"}
              </button>
            )}
            <button onClick={() => { onBack(); window.history.replaceState(null, "", "/"); }} className="w-full py-3.5 border border-gold/20 rounded-2xl text-gold/60 text-sm active:scale-[0.98] transition-all cursor-pointer">
              ☽ 다른 운세 보기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
