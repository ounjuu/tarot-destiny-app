"use client";

import { CATEGORIES } from "@/data/tarot-cards";

interface CategorySelectProps {
  onSelect: (categoryId: string) => void;
}

export default function CategorySelect({ onSelect }: CategorySelectProps) {
  return (
    <div className="flex flex-col justify-center h-full px-5 py-6">
      {/* 인사말 */}
      <div className="text-center mb-8">
        <p className="text-foreground/60 text-sm mb-1">오늘의 운세를 확인해보세요</p>
        <h2 className="text-gold text-xl font-bold">어떤 운세가 궁금하신가요?</h2>
      </div>

      {/* 카테고리 그리드 */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {CATEGORIES.map((category, index) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className="fade-in flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-purple-dark/30 border border-gold/15 rounded-2xl active:scale-95 active:bg-purple-dark/50 hover:bg-purple-dark/50 hover:border-gold/30 hover:shadow-[0_0_15px_rgba(201,168,76,0.08)] transition-all duration-300 cursor-pointer"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <img src={category.icon} alt={category.label} className="w-7 h-7 sm:w-8 sm:h-8" />
            <div className="text-left">
              <p className="text-gold font-bold text-xs sm:text-sm">{category.label}</p>
              <p className="text-foreground/30 text-[10px] sm:text-[11px] mt-0.5">{category.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
