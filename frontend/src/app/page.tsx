"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import StarBackground from "@/components/StarBackground";
import CategorySelect from "@/components/CategorySelect";
import TarotSpread from "@/components/TarotSpread";
import History from "@/components/History";
import { CATEGORIES } from "@/data/tarot-cards";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
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

  return (
    <div className="app-container bg-background">
      <StarBackground />

      {/* 상단 헤더 */}
      <header className="safe-top relative z-20 flex items-center justify-center pt-3 pb-3 border-b border-gold/10 min-h-[52px]">
        {selectedCategory ? (
          <button
            onClick={() => setSelectedCategory(null)}
            className="absolute left-4 text-gold/60 text-sm cursor-pointer"
          >
            ← 뒤로
          </button>
        ) : currentTab === "history" ? (
          <button
            onClick={() => setCurrentTab("home")}
            className="absolute left-4 text-gold/60 text-sm cursor-pointer"
          >
            ← 뒤로
          </button>
        ) : null}
        <div className="text-center">
          <h1 className="text-xl font-bold text-gold tracking-wider flex items-center gap-1 justify-center">
            <img src="/logo.png" alt="LunaTarot" className="w-7 h-7 -mb-0.5 -ml-3 -mt-0.5" />
            LunaTarot
          </h1>
        </div>
        <div className="absolute right-3">
          {!selectedCategory && currentTab === "home" && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-gold/40 text-[10px] cursor-pointer"
            >
              로그아웃
            </button>
          )}
        </div>
        {selectedCategory && (
          <span className="absolute right-4 text-gold/40 text-xs">
            {category?.label}
          </span>
        )}
      </header>

      {/* 본문 */}
      <div className="app-content relative z-10">
        {currentTab === "history" ? (
          <History />
        ) : !selectedCategory ? (
          <CategorySelect onSelect={setSelectedCategory} />
        ) : (
          <TarotSpread
            categoryId={selectedCategory}
            categoryLabel={category!.label}
            onBack={() => setSelectedCategory(null)}
          />
        )}
      </div>

      {/* 하단 탭 바 */}
      {!selectedCategory && (
        <footer className="safe-bottom relative z-20 border-t border-gold/10 bg-background/80 backdrop-blur-sm">
          <div className="flex">
            <button
              onClick={() => setCurrentTab("home")}
              className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                currentTab === "home" ? "text-gold" : "text-foreground/25"
              }`}
            >
              <img src="/icons/tarot-tab.svg" alt="" className={`w-5 h-5 ${currentTab === "home" ? "opacity-100" : "opacity-30"}`} />
              <span className="text-[9px]">타로</span>
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

      {/* 카드 뽑기 중에는 기존 footer */}
      {selectedCategory && (
        <footer className="safe-bottom relative z-20 py-3 text-center border-t border-gold/10 bg-background/80 backdrop-blur-sm">
          <p className="text-foreground/20 text-[10px] tracking-wider">
            LUNA TAROT · AI 타로 리딩
          </p>
        </footer>
      )}
    </div>
  );
}
