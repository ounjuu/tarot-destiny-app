"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import StarBackground from "@/components/StarBackground";
import Link from "next/link";

interface Reading {
  category_label: string;
  cards: string[];
  reading: string;
  score: number | null;
  keywords: string | null;
  created_at: string;
}

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<Reading | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReading() {
      if (!supabase) return;
      const { data: reading } = await supabase
        .from("readings")
        .select("category_label, cards, reading, score, keywords, created_at")
        .eq("id", id)
        .single();

      setData(reading);
      setLoading(false);
    }
    fetchReading();
  }, [id]);

  if (loading) {
    return (
      <div className="app-container bg-background">
        <StarBackground />
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-2 border-gold/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold/70 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-gold/60 text-sm">✦</div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="app-container bg-background">
        <StarBackground />
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
          <p className="text-gold text-lg mb-4">결과를 찾을 수 없어요</p>
          <Link href="/" className="text-gold/50 text-sm">
            타로 보러 가기 →
          </Link>
        </div>
      </div>
    );
  }

  const date = new Date(data.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="app-container bg-background">
      <StarBackground />

      <header className="safe-top relative z-20 flex items-center justify-center pt-3 pb-3 border-b border-gold/10 min-h-[52px]">
        <h1 className="text-xl font-bold text-gold tracking-wider flex items-center gap-1 justify-center">
          <img src="/logo.png" alt="LunaTarot" className="w-7 h-7 -mb-0.5 -ml-3" /> LunaTarot
        </h1>
      </header>

      <div className="app-content relative z-10 px-5 pt-6 pb-8">
        {/* 제목 */}
        <div className="text-center mb-6">
          <h2 className="text-gold text-lg font-bold mb-1">✦ {data.category_label} 결과 ✦</h2>
          <p className="text-foreground/30 text-xs">{date}</p>
        </div>

        {/* 카드 목록 */}
        <div className="flex flex-wrap justify-center gap-2 mb-5">
          {data.cards.map((card, i) => (
            <span key={i} className="text-xs text-gold/60 bg-purple-dark/30 px-3 py-1.5 rounded-full border border-gold/10">
              {card}
            </span>
          ))}
        </div>

        {/* 점수 */}
        {data.score && (
          <div className="text-center mb-5">
            <span className="text-3xl font-bold text-gold">{data.score}%</span>
          </div>
        )}

        {/* 해석 */}
        <div className="relative p-5 bg-gradient-to-b from-purple-dark/30 to-purple-dark/10 rounded-2xl border border-gold/15 mb-6">
          <div className="absolute top-2 left-3 text-gold/20 text-[10px]">✦</div>
          <div className="absolute top-2 right-3 text-gold/20 text-[10px]">✦</div>
          <div className="absolute bottom-2 left-3 text-gold/20 text-[10px]">✦</div>
          <div className="absolute bottom-2 right-3 text-gold/20 text-[10px]">✦</div>
          <div className="text-foreground/85 text-sm leading-7 whitespace-pre-line">{data.reading}</div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-purple to-gold/80 rounded-2xl text-white font-bold text-sm tracking-wider"
          >
            ✦ 나도 타로 보러 가기
          </Link>
        </div>
      </div>

      <footer className="safe-bottom relative z-20 py-3 text-center border-t border-gold/10 bg-background/80 backdrop-blur-sm">
        <p className="text-foreground/20 text-[10px] tracking-wider">LUNA TAROT · 타로 리딩</p>
      </footer>
    </div>
  );
}
