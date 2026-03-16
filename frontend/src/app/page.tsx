"use client";

import { useState } from "react";
import StarBackground from "@/components/StarBackground";
import CategorySelect from "@/components/CategorySelect";
import TarotSpread from "@/components/TarotSpread";
import { CATEGORIES } from "@/data/tarot-cards";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const category = CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div className="app-container bg-background">
      <StarBackground />

      {/* 상단 헤더 */}
      <header className="safe-top relative z-20 flex items-center justify-center py-4 border-b border-gold/10">
        {selectedCategory ? (
          <button
            onClick={() => setSelectedCategory(null)}
            className="absolute left-4 text-gold/60 text-sm cursor-pointer"
          >
            ← 뒤로
          </button>
        ) : null}
        <div className="text-center">
          <h1 className="text-xl font-bold text-gold tracking-wider">
            🌙 LunaTarot
          </h1>
        </div>
        {selectedCategory && (
          <span className="absolute right-4 text-gold/40 text-xs">
            {category?.label}
          </span>
        )}
      </header>

      {/* 본문 */}
      <div className="app-content relative z-10">
        {!selectedCategory ? (
          <CategorySelect onSelect={setSelectedCategory} />
        ) : (
          <TarotSpread
            categoryId={selectedCategory}
            categoryLabel={category!.label}
            onBack={() => setSelectedCategory(null)}
          />
        )}
      </div>

      {/* 하단 바 */}
      <footer className="safe-bottom relative z-20 py-3 text-center border-t border-gold/10 bg-background/80 backdrop-blur-sm">
        <p className="text-foreground/20 text-[10px] tracking-wider">
          LUNA TAROT · AI 타로 리딩
        </p>
      </footer>
    </div>
  );
}
