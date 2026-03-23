"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import BirthInfoForm from "./BirthInfoForm";
import BirthChart from "./BirthChart";
import { ASTROLOGY_CATEGORIES, ZODIAC_SIGNS } from "@/data/astrology";

interface BirthInfo {
  birthday: string;
  birth_time: string | null;
  birth_city: string;
  birth_lat: number;
  birth_lng: number;
  zodiac_sign: string;
}

export default function AstrologyMain() {
  const { data: session } = useSession();
  const [birthInfo, setBirthInfo] = useState<BirthInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [reading, setReading] = useState("");
  const [readingLoading, setReadingLoading] = useState(false);
  const [readingId, setReadingId] = useState<string | null>(null);
  const [partnerSign, setPartnerSign] = useState("");
  const [hasError, setHasError] = useState(false);

  const sign = ZODIAC_SIGNS.find((s) => s.id === birthInfo?.zodiac_sign);

  // 출생 정보 확인
  useEffect(() => {
    if (!session?.user?.id) return;
    checkBirthInfo();
  }, [session]);

  async function checkBirthInfo() {
    try {
      const res = await fetch(`/api/astrology/birth-info?userId=${session?.user?.id}`);
      const data = await res.json();
      if (data.exists) {
        setBirthInfo(data);
      }
    } catch {}
    setLoading(false);
  }

  // 출생 정보 저장
  async function handleBirthInfoSubmit(data: { birthday: string; birthTime: string | null; birthCity: string; birthLat: number; birthLng: number }) {
    const res = await fetch("/api/astrology/birth-info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: session?.user?.id, ...data }),
    });
    const result = await res.json();
    if (result.success) {
      setBirthInfo({
        birthday: data.birthday,
        birth_time: data.birthTime,
        birth_city: data.birthCity,
        birth_lat: data.birthLat,
        birth_lng: data.birthLng,
        zodiac_sign: result.zodiacSign,
      });
    }
  }

  // 해석 요청
  async function fetchReading(category: string) {
    setReadingLoading(true);
    setHasError(false);
    try {
      const res = await fetch("/api/astrology/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user?.id,
          category,
          birthday: birthInfo?.birthday,
          birthTime: birthInfo?.birth_time,
          birthCity: birthInfo?.birth_city,
          birthLat: birthInfo?.birth_lat,
          birthLng: birthInfo?.birth_lng,
          zodiacSign: birthInfo?.zodiac_sign,
          partnerSign: category === "compatibility" ? partnerSign : undefined,
        }),
      });
      const data = await res.json();
      setReading(data.reading || "해석을 불러오지 못했어요.");
      setReadingId(data.readingId || null);
      setHasError(!data.success);
    } catch {
      setReading("별들의 신호가 불안정해요.\n\n네트워크를 확인하고 다시 시도해주세요.");
      setHasError(true);
    }
    setReadingLoading(false);
  }

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-gold/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold/70 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-gold/60 text-sm">✦</div>
        </div>
      </div>
    );
  }

  // 출생 정보 미입력
  if (!birthInfo) {
    return <BirthInfoForm onSubmit={handleBirthInfoSubmit} />;
  }

  // 해석 결과
  if (reading && selectedCategory) {
    return (
      <div className="flex flex-col h-full px-4 sm:px-5 pt-4 pb-6 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
        {/* 별자리 정보 */}
        <div className="text-center mb-4">
          <img src={sign?.icon} alt={sign?.name} className="w-12 h-12 mx-auto" />
          <h2 className="text-gold text-lg font-bold mt-1">✦ {sign?.name} ✦</h2>
        </div>

        {/* 나의 별자리 - 출생 차트 시각화 */}
        {selectedCategory === "my-chart" && birthInfo && (
          <BirthChart
            birthday={birthInfo.birthday}
            birthTime={birthInfo.birth_time}
            birthLat={birthInfo.birth_lat}
            birthLng={birthInfo.birth_lng}
          />
        )}

        {/* 해석 결과 */}
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
              onClick={() => fetchReading(selectedCategory)}
              className="w-full py-3.5 bg-gradient-to-r from-purple to-gold/80 rounded-2xl text-white font-bold text-sm active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-purple/30"
            >
              ✦ 다시 해석하기
            </button>
          )}
          {!hasError && readingId && (
            <button
              onClick={() => {
                const url = `${window.location.origin}/result/${readingId}`;
                if (navigator.share) {
                  navigator.share({ url });
                } else {
                  navigator.clipboard.writeText(url);
                }
              }}
              className="w-full py-3.5 bg-gradient-to-r from-purple to-gold/80 rounded-2xl text-white font-bold text-sm active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-purple/30"
            >
              ✦ 결과 공유하기
            </button>
          )}
          <button
            onClick={() => { setSelectedCategory(null); setReading(""); setReadingId(null); }}
            className="w-full py-3.5 border border-gold/20 rounded-2xl text-gold/60 text-sm active:scale-[0.98] transition-all cursor-pointer"
          >
            ✧ 다른 운세 보기
          </button>
        </div>
      </div>
    );
  }

  // 로딩 중
  if (readingLoading) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center px-5">
        <div className="relative w-14 h-14 mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-purple/30" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold/70 animate-spin" />
          <div className="absolute inset-[-6px] rounded-full border border-transparent border-b-purple/30 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
          <div className="absolute inset-0 flex items-center justify-center text-gold/60 text-sm pulse-glow">✦</div>
        </div>
        <p className="text-gold text-base font-bold mb-2">별자리를 읽고 있어요</p>
        <p className="text-foreground/30 text-sm">루나가 별의 흐름을 파악하고 있어요...</p>
      </div>
    );
  }

  // 궁합 - 상대 별자리 선택
  if (selectedCategory === "compatibility" && !partnerSign) {
    return (
      <div className="flex flex-col justify-center h-full px-5 py-6 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className="text-center mb-8">
          <h2 className="text-gold text-lg font-bold mb-1">상대방의 별자리는?</h2>
          <p className="text-foreground/30 text-xs">궁합을 볼 상대의 별자리를 선택하세요</p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-[280px] sm:max-w-[320px] mx-auto">
          {ZODIAC_SIGNS.map((z) => (
            <button
              key={z.id}
              onClick={() => { setPartnerSign(z.name); fetchReading("compatibility"); }}
              className="p-3 bg-purple-dark/30 border border-gold/15 rounded-xl active:scale-95 hover:bg-purple-dark/50 hover:border-gold/30 transition-all cursor-pointer text-center"
            >
              <img src={z.icon} alt={z.name} className="w-8 h-8 mx-auto" />
              <span className="text-gold/70 text-[11px] mt-1 block">{z.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 카테고리 선택
  return (
    <div className="flex flex-col justify-center h-full px-5 py-6">
      {/* 내 별자리 정보 */}
      <div className="text-center mb-8">
        <img src={sign?.icon} alt={sign?.name} className="w-14 h-14 mx-auto" />
        <h2 className="text-gold text-lg sm:text-xl font-bold mt-2">{sign?.name}</h2>
        <p className="text-foreground/30 text-xs mt-1">{sign?.dates} · {sign?.element} 원소</p>
        <button
          onClick={() => setBirthInfo(null)}
          className="text-foreground/20 text-[10px] mt-2 cursor-pointer"
        >
          출생 정보 수정
        </button>
      </div>

      {/* 카테고리 선택 */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {ASTROLOGY_CATEGORIES.map((cat, index) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setPartnerSign("");
              if (cat.id !== "compatibility") {
                fetchReading(cat.id);
              }
            }}
            className="fade-in flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-purple-dark/30 border border-gold/15 rounded-2xl active:scale-95 hover:bg-purple-dark/50 hover:border-gold/30 transition-all cursor-pointer"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <img src={cat.icon} alt="" className="w-7 h-7 sm:w-8 sm:h-8" />
            <div className="text-left">
              <p className="text-gold font-bold text-xs sm:text-sm">{cat.label}</p>
              <p className="text-foreground/30 text-[10px] sm:text-[11px] mt-0.5">{cat.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
