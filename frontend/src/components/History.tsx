"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const CATEGORY_LABELS: Record<string, string> = {
  love: "연애운", couple: "커플운", friendship: "우정운", exam: "시험운",
  aptitude: "적성운", study: "학업운", career: "이직운", health: "건강운",
  pastlife: "전생운", office: "회사운", reunion: "재회운", remarriage: "재혼운",
  astro_daily: "오늘의 운세", astro_personality: "성격 분석",
  "astro_love-star": "연애운", "astro_marriage-star": "결혼운",
  astro_compatibility: "별자리 궁합", astro_monthly: "이번 달 운세",
  astro_yearly: "올해의 운세", "astro_career-star": "직업 적성",
  "astro_my-chart": "나의 별자리",
};

const CATEGORY_ICONS: Record<string, string> = {
  love: "/icons/love.svg", couple: "/icons/couple.svg", friendship: "/icons/friendship.svg",
  exam: "/icons/exam.svg", aptitude: "/icons/aptitude.svg", study: "/icons/study.svg",
  career: "/icons/career.svg", health: "/icons/health.svg", pastlife: "/icons/pastlife.svg",
  office: "/icons/office.svg", reunion: "/icons/reunion.svg", remarriage: "/icons/remarriage.svg",
  astro_daily: "/icons/astrology-service.svg", astro_personality: "/icons/astrology-service.svg",
  "astro_love-star": "/icons/love.svg", "astro_marriage-star": "/icons/remarriage.svg",
  astro_compatibility: "/icons/astrology-service.svg", astro_monthly: "/icons/astrology-service.svg",
  astro_yearly: "/icons/astrology-service.svg", "astro_career-star": "/icons/career.svg",
  "astro_my-chart": "/icons/astrology-service.svg",
};

interface Reading {
  id: string;
  category: string;
  category_label: string;
  score: number;
  keywords: string;
  reading: string;
  created_at: string;
}

export default function History() {
  const { data: session } = useSession();
  const router = useRouter();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [historyTab, setHistoryTab] = useState<"tarot" | "astrology">("tarot");

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchHistory();
  }, [session]);

  async function fetchHistory() {
    try {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session?.user?.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setReadings(data.readings || []);
      }
    } catch {}
    setLoading(false);
  }

  // 탭별 필터
  const filtered = readings.filter((r) =>
    historyTab === "astrology" ? r.category.startsWith("astro_") : !r.category.startsWith("astro_")
  );

  // 날짜별 그룹핑
  const grouped: Record<string, Reading[]> = {};
  filtered.forEach((r) => {
    const date = new Date(r.created_at).toLocaleDateString("ko-KR", {
      year: "numeric", month: "long", day: "numeric",
    });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(r);
  });

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-full px-5">
        <div className="relative w-14 h-14 mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-gold/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold/70 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-gold/60 text-sm">✦</div>
        </div>
      </div>
    );
  }

  if (readings.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-full px-5">
        <div className="relative w-12 h-12 mb-4 opacity-20">
          <div className="absolute inset-0 rounded-full border-2 border-gold/40" />
          <div className="absolute inset-0 flex items-center justify-center text-gold/60 text-sm">✦</div>
        </div>
        <p className="text-foreground/40 text-sm mb-1">아직 기록이 없어요</p>
        <p className="text-foreground/20 text-xs">운세를 뽑으면 여기에 기록이 남아요</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-4 py-4 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
      <div className="text-center mb-4">
        <h2 className="text-gold text-base sm:text-lg font-bold">나의 기록</h2>
      </div>

      {/* 타로 / 점성술 탭 */}
      <div className="flex gap-1 mb-4 bg-purple-dark/20 p-1 rounded-xl">
        <button
          onClick={() => setHistoryTab("tarot")}
          className={`flex-1 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
            historyTab === "tarot"
              ? "bg-gradient-to-r from-purple/50 to-gold/20 text-gold font-bold"
              : "text-foreground/40"
          }`}
        >
          타로
        </button>
        <button
          onClick={() => setHistoryTab("astrology")}
          className={`flex-1 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
            historyTab === "astrology"
              ? "bg-gradient-to-r from-purple/50 to-gold/20 text-gold font-bold"
              : "text-foreground/40"
          }`}
        >
          점성술
        </button>
      </div>

      <p className="text-foreground/30 text-xs mb-3 pl-1">총 {filtered.length}건</p>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-12">
          <p className="text-foreground/20 text-sm">
            {historyTab === "tarot" ? "타로 기록이 없어요" : "점성술 기록이 없어요"}
          </p>
        </div>
      )}

      <div className="space-y-5">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <p className="text-foreground/30 text-[11px] mb-2 pl-1">{date}</p>
            <div className="space-y-2">
              {items.map((r) => (
                <div key={r.id} className="rounded-xl border border-gold/10 bg-purple-dark/10 overflow-hidden">
                  <div
                    className="flex items-center gap-2.5 p-3 cursor-pointer active:bg-purple-dark/20 transition-colors"
                    onClick={() => {
                      if (expandedId === r.id) {
                        setExpandedId(null);
                      } else {
                        setExpandedId(r.id);
                      }
                    }}
                  >
                    <img src={CATEGORY_ICONS[r.category] || "/icons/love.svg"} alt="" className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground/80">{CATEGORY_LABELS[r.category] || r.category}</p>
                      {r.keywords && (
                        <p className="text-foreground/30 text-[10px] mt-0.5 truncate">{r.keywords}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {r.score && (
                        <span className="text-gold/70 text-sm font-bold">{r.score}%</span>
                      )}
                      <p className="text-foreground/20 text-[9px] mt-0.5">
                        {new Date(r.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <span className={`text-foreground/20 text-xs transition-transform ${expandedId === r.id ? "rotate-180" : ""}`}>▾</span>
                  </div>
                  {expandedId === r.id && (
                    <div className="px-3 pb-3 border-t border-gold/5">
                      <div className="text-foreground/70 text-xs leading-6 whitespace-pre-line mt-2">{r.reading}</div>
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/result/${r.id}`;
                          if (navigator.share) {
                            navigator.share({ url });
                          } else {
                            navigator.clipboard.writeText(url);
                          }
                        }}
                        className="mt-3 w-full py-2 text-xs text-gold/50 border border-gold/10 rounded-lg cursor-pointer active:scale-[0.98] transition-transform"
                      >
                        ✦ 결과 공유하기
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
