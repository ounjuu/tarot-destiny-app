"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import StarBackground from "@/components/StarBackground";
import ServiceSelect from "@/components/ServiceSelect";
import CategorySelect from "@/components/CategorySelect";
import TarotSpread from "@/components/TarotSpread";
import History from "@/components/History";
import AstrologyMain from "@/components/AstrologyMain";
import SajuMain from "@/components/SajuMain";
import { CATEGORIES } from "@/data/tarot-cards";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [service, setService] = useState<"tarot" | "astrology" | "saju" | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<"home" | "history">("home");

  const category = CATEGORIES.find((c) => c.id === selectedCategory);

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="app-container bg-background">
        <StarBackground />
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-2 border-gold/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold/70 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-gold/60 text-sm">✦</div>
          </div>
        </div>
      </div>
    );
  }

  // 뒤로가기 핸들러
  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
    } else if (currentTab === "history") {
      setCurrentTab("home");
    } else if (service) {
      setService(null);
      setCurrentTab("home");
    }
  };

  // 뒤로가기 버튼 표시 조건
  const showBack = selectedCategory || currentTab === "history" || service;

  // 헤더 타이틀
  const headerTitle = service === "astrology" ? "점성술" : "LunaTarot";

  return (
    <div className="app-container bg-background">
      <StarBackground />

      {/* 상단 헤더 */}
      <header className="safe-top relative z-20 flex items-center justify-center pt-3 pb-3 border-b border-gold/10 min-h-[52px]">
        {showBack ? (
          <button
            onClick={handleBack}
            className="absolute left-4 text-gold/60 text-sm cursor-pointer"
          >
            ← 뒤로
          </button>
        ) : null}
        <div className="text-center">
          <h1 className="text-xl font-bold text-gold tracking-wider flex items-center gap-1 justify-center">
            {!service && <img src="/logo.png" alt="Luna" className="w-7 h-7 -mb-0.5 -ml-3 -mt-0.5" />}
            {service === "tarot" && <img src="/logo.png" alt="Luna" className="w-7 h-7 -mb-0.5 -ml-3 -mt-0.5" />}
            {service === "tarot" ? "LunaTarot" : service === "astrology" ? "LunaStars" : service === "saju" ? "LunaSaju" : "Luna"}
          </h1>
        </div>
        <div className="absolute right-3">
          {!service && !selectedCategory && currentTab === "home" && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-gold/40 text-[10px] cursor-pointer"
            >
              로그아웃
            </button>
          )}
        </div>
        {selectedCategory && (
          <span className="absolute right-4 text-gold/40 text-xs truncate max-w-[80px]">
            {category?.label}
          </span>
        )}
      </header>

      {/* 본문 */}
      <div className="app-content relative z-10">
        {/* 서비스 선택 */}
        {!service ? (
          <ServiceSelect onSelect={setService} />
        ) : service === "tarot" ? (
          // 타로 서비스
          currentTab === "history" ? (
            <History defaultTab="tarot" />
          ) : !selectedCategory ? (
            <CategorySelect onSelect={setSelectedCategory} />
          ) : (
            <TarotSpread
              categoryId={selectedCategory}
              categoryLabel={category!.label}
              onBack={() => setSelectedCategory(null)}
            />
          )
        ) : service === "astrology" ? (
          // 점성술 서비스
          currentTab === "history" ? (
            <History defaultTab="astrology" />
          ) : (
            <AstrologyMain />
          )
        ) : (
          // 사주 서비스
          currentTab === "history" ? (
            <History defaultTab="saju" />
          ) : (
            <SajuMain />
          )
        )}
      </div>

      {/* 하단 탭 바 (서비스 선택 후 + 카드 뽑기 중 아님) */}
      {service && !(service === "tarot" && selectedCategory) && (
        <footer className="safe-bottom relative z-20 border-t border-gold/10 bg-background/80 backdrop-blur-sm">
          <div className="flex">
            <button
              onClick={() => setCurrentTab("home")}
              className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                currentTab === "home" ? "text-gold" : "text-foreground/25"
              }`}
            >
              <img src={service === "tarot" ? "/icons/tarot-tab.svg" : service === "astrology" ? "/icons/astrology-service.svg" : "/icons/saju-service.svg"} alt="" className={`w-5 h-5 ${currentTab === "home" ? "opacity-100" : "opacity-30"}`} />
              <span className="text-[9px]">{service === "tarot" ? "타로" : service === "astrology" ? "점성술" : "사주"}</span>
            </button>
            <button
              onClick={() => setCurrentTab("history")}
              className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                currentTab === "history" ? "text-gold" : "text-foreground/25"
              }`}
            >
              <img src="/icons/history-tab.svg" alt="" className={`w-5 h-5 ${currentTab === "history" ? "opacity-100" : "opacity-30"}`} />
              <span className="text-[9px]">기록</span>
            </button>
          </div>
        </footer>
      )}

      {/* 카드 뽑기 중 footer */}
      {service === "tarot" && selectedCategory && (
        <footer className="safe-bottom relative z-20 py-3 text-center border-t border-gold/10 bg-background/80 backdrop-blur-sm">
          <p className="text-foreground/20 text-[10px] tracking-wider">
            LUNA TAROT · 타로 리딩
          </p>
        </footer>
      )}

      {/* 서비스 선택 footer */}
      {!service && (
        <footer className="safe-bottom relative z-20 py-3 text-center border-t border-gold/10 bg-background/80 backdrop-blur-sm">
          <p className="text-foreground/20 text-[10px] tracking-wider">
            LUNA · 운세 리딩
          </p>
        </footer>
      )}
    </div>
  );
}
