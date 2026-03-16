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
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((category, index) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className="fade-in flex items-center gap-3 p-4 bg-purple-dark/30 border border-gold/15 rounded-2xl active:scale-95 active:bg-purple-dark/50 transition-all cursor-pointer"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <span className="text-3xl w-10 text-center">{category.icon}</span>
            <div className="text-left">
              <p className="text-gold font-bold text-sm">{category.label}</p>
              <p className="text-foreground/30 text-[11px] mt-0.5">{category.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
