"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { isAdmin } from "@/lib/admin";

const CATEGORY_LABELS: Record<string, string> = {
  love: "연애운", couple: "커플운", friendship: "우정운", exam: "시험운",
  aptitude: "적성운", study: "학업운", career: "이직운", health: "건강운",
  pastlife: "전생운", office: "회사운", reunion: "재회운", remarriage: "재혼운",
  astro_daily: "오늘의 운세", astro_weekly: "이번 주 운세", astro_monthly: "이번 달 운세",
  astro_yearly: "올해의 운세", astro_compatibility: "별자리 궁합", astro_personality: "성격 분석",
  "astro_love-star": "연애운", "astro_marriage-star": "결혼운",
  "astro_career-star": "직업 적성", "astro_my-chart": "나의 별자리",
  "saju_saju-chart": "나의 사주", "saju_saju-daily": "오늘의 운세",
  "saju_saju-weekly": "이번 주 운세", "saju_saju-monthly": "이번 달 운세",
  "saju_saju-yearly": "올해의 운세", "saju_saju-love": "연애운",
  "saju_saju-career": "직업운", "saju_saju-wealth": "재물운",
};

const ERROR_TYPE_LABELS: Record<string, string> = {
  api_error: "Gemini 에러",
  empty_response: "Gemini 빈 응답",
  ai_failed: "AI 실패",
  server_error: "서버 에러",
  gemini_failed_groq_success: "Gemini 실패 → Groq 대체",
  all_failed: "Gemini + Groq 모두 실패",
};

type Tab = "dashboard" | "users" | "readings" | "fallback";

interface StatsData {
  totalUsers: number;
  totalReadings: number;
  todayReadings: number;
  totalFallbacks: number;
  dailyStats: Record<string, number>;
  categoryStats: Record<string, number>;
}

interface UserData {
  id: string;
  provider: string;
  name: string;
  email: string;
  image: string;
  created_at: string;
}

interface ReadingData {
  id: string;
  user_id: string;
  user_name: string;
  category: string;
  category_label: string;
  score: number;
  keywords: string;
  created_at: string;
  reading: string;
  source: string;
}

interface FallbackLog {
  id: string;
  category: string;
  error_type: string;
  user_id: string;
  created_at: string;
  fallback_readings: { reading: string } | null;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [readings, setReadings] = useState<ReadingData[]>([]);
  const [readingsTotal, setReadingsTotal] = useState(0);
  const [readingsPage, setReadingsPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [fallbackLogs, setFallbackLogs] = useState<FallbackLog[]>([]);
  const [fallbackTotal, setFallbackTotal] = useState(0);
  const [fallbackPage, setFallbackPage] = useState(1);
  const [expandedReading, setExpandedReading] = useState<string | null>(null);
  const [selectedReadings, setSelectedReadings] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  // 권한 체크 + 스크롤 허용
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id || !isAdmin(session.user.id)) {
      router.push("/");
      return;
    }
    document.documentElement.style.overflow = "auto";
    document.documentElement.style.height = "auto";
    document.body.style.overflow = "auto";
    document.body.style.height = "auto";
    return () => {
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, [session, status, router]);

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    if (!session?.user?.id || !isAdmin(session.user.id)) return;

    if (tab === "dashboard" && !stats) fetchStats();
    if (tab === "users" && users.length === 0) fetchUsers();
    if (tab === "readings") fetchReadings();
    if (tab === "readings" && users.length === 0) fetchUsers();
    if (tab === "fallback") fetchFallbackLogs();
  }, [tab, readingsPage, categoryFilter, userFilter, fallbackPage]);

  async function fetchStats() {
    const res = await fetch("/api/admin/stats");
    if (res.ok) setStats(await res.json());
  }

  async function fetchUsers() {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    }
  }

  async function fetchReadings() {
    const params = new URLSearchParams({ page: String(readingsPage), limit: "20" });
    if (categoryFilter) params.set("category", categoryFilter);
    if (userFilter) params.set("userId", userFilter);
    const res = await fetch(`/api/admin/readings?${params}`);
    if (res.ok) {
      const data = await res.json();
      setReadings(data.readings);
      setReadingsTotal(data.total);
    }
  }

  async function deleteReadings() {
    if (selectedReadings.size === 0) return;
    if (!confirm(`${selectedReadings.size}개의 기록을 삭제하시겠습니까?`)) return;
    setDeleting(true);
    try {
      const ids = [...selectedReadings];
      console.log("삭제 요청:", ids.length, "개", ids);
      const res = await fetch("/api/admin/readings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      console.log("삭제 응답:", res.status, data);
      if (res.ok && data.success) {
        setSelectedReadings(new Set());
        await fetchReadings();
        await fetchStats();
        console.log("목록 새로고침 완료");
      } else {
        alert(`삭제 실패: ${data.error || "알 수 없는 에러"}`);
      }
    } catch (e) {
      console.error("삭제 에러:", e);
      alert(`삭제 에러: ${e}`);
    }
    setDeleting(false);
  }

  async function fetchFallbackLogs() {
    const res = await fetch(`/api/admin/fallback-logs?page=${fallbackPage}&limit=20`);
    if (res.ok) {
      const data = await res.json();
      setFallbackLogs(data.logs);
      setFallbackTotal(data.total);
    }
  }

  if (status === "loading" || !session?.user?.id || !isAdmin(session.user.id)) {
    return (
      <div className="fixed inset-0 bg-[#0a0a1a] flex items-center justify-center">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-gold/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold/70 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-gold/60 text-sm">✦</div>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "dashboard", label: "대시보드" },
    { key: "users", label: "사용자" },
    { key: "readings", label: "리딩 기록" },
    { key: "fallback", label: "Fallback 로그" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white" style={{ overflow: "auto", height: "auto" }}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-gold text-xl font-bold">LunaTarot Admin</h1>
          <span className="text-foreground/30 text-xs">{session.user.name}</span>
        </div>

        {/* 탭 */}
        <div className="flex gap-1 mb-6 bg-purple-dark/20 p-1 rounded-xl overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 text-xs sm:text-sm rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                tab === t.key
                  ? "bg-gradient-to-r from-purple/50 to-gold/20 text-gold font-bold"
                  : "text-foreground/40 hover:text-foreground/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 대시보드 - 스켈레톤 */}
        {tab === "dashboard" && !stats && (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl border border-gold/10 bg-purple-dark/10">
                  <div className="h-3 w-14 bg-gold/5 rounded mb-2" />
                  <div className="h-7 w-10 bg-gold/10 rounded" />
                </div>
              ))}
            </div>
            <div className="p-4 rounded-xl border border-gold/10 bg-purple-dark/10">
              <div className="h-3 w-24 bg-gold/5 rounded mb-3" />
              <div className="flex items-end gap-2 h-32">
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-gold/5 rounded-t" style={{ height: `${20 + Math.random() * 60}%` }} />
                    <div className="h-2 w-6 bg-gold/5 rounded" />
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-gold/10 bg-purple-dark/10">
              <div className="h-3 w-28 bg-gold/5 rounded mb-3" />
              <div className="space-y-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-3 w-14 bg-gold/5 rounded" />
                    <div className="flex-1 h-4 bg-gold/5 rounded-full" />
                    <div className="h-3 w-6 bg-gold/5 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 대시보드 */}
        {tab === "dashboard" && stats && (
          <div className="space-y-6">
            {/* 요약 카드 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "총 사용자", value: stats.totalUsers },
                { label: "총 리딩", value: stats.totalReadings },
                { label: "오늘 리딩", value: stats.todayReadings },
                { label: "Fallback", value: stats.totalFallbacks },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-xl border border-gold/10 bg-purple-dark/10">
                  <p className="text-foreground/40 text-xs mb-1">{item.label}</p>
                  <p className="text-gold text-2xl font-bold">{item.value}</p>
                </div>
              ))}
            </div>

            {/* 7일 그래프 */}
            <div className="p-4 rounded-xl border border-gold/10 bg-purple-dark/10">
              <p className="text-foreground/40 text-xs mb-3">최근 7일 리딩 수</p>
              <div className="flex items-end gap-2 h-32">
                {Object.entries(stats.dailyStats).map(([date, count]) => {
                  const max = Math.max(...Object.values(stats.dailyStats), 1);
                  const height = (count / max) * 100;
                  return (
                    <div key={date} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-gold/60 text-[10px]">{count}</span>
                      <div
                        className="w-full bg-gradient-to-t from-purple/50 to-gold/30 rounded-t"
                        style={{ height: `${Math.max(height, 4)}%` }}
                      />
                      <span className="text-foreground/30 text-[9px]">{date.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 카테고리 인기도 */}
            <div className="p-4 rounded-xl border border-gold/10 bg-purple-dark/10">
              <p className="text-foreground/40 text-xs mb-3">카테고리별 인기도</p>
              <div className="space-y-2">
                {Object.entries(stats.categoryStats)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, count]) => {
                    const max = Math.max(...Object.values(stats.categoryStats), 1);
                    return (
                      <div key={cat} className="flex items-center gap-2">
                        <span className="text-foreground/50 text-xs w-16 shrink-0">{CATEGORY_LABELS[cat] || cat}</span>
                        <div className="flex-1 h-4 bg-purple-dark/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple/50 to-gold/40 rounded-full"
                            style={{ width: `${(count / max) * 100}%` }}
                          />
                        </div>
                        <span className="text-gold/50 text-xs w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* 사용자 목록 */}
        {tab === "users" && (
          <div className="space-y-2">
            <p className="text-foreground/30 text-xs mb-2">총 {users.length}명</p>
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl border border-gold/10 bg-purple-dark/10">
                {user.image && (
                  <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name || "이름 없음"}</p>
                  <p className="text-foreground/30 text-xs truncate">{user.email || "-"}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    user.provider === "kakao" ? "bg-yellow-500/20 text-yellow-400" : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {user.provider === "kakao" ? "카카오" : "구글"}
                  </span>
                  <p className="text-foreground/20 text-[10px] mt-1">
                    {new Date(user.created_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 리딩 기록 */}
        {tab === "readings" && (
          <div className="space-y-3">
            {/* 필터 */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setReadingsPage(1); }}
                className="bg-purple-dark/30 border border-gold/10 rounded-lg px-3 py-1.5 text-xs text-foreground/60"
              >
                <option value="">전체 카테고리</option>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <select
                value={userFilter}
                onChange={(e) => { setUserFilter(e.target.value); setReadingsPage(1); }}
                className="bg-purple-dark/30 border border-gold/10 rounded-lg px-3 py-1.5 text-xs text-foreground/60"
              >
                <option value="">전체 사용자</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name || u.id}</option>
                ))}
              </select>
              <span className="text-foreground/30 text-xs">총 {readingsTotal}건</span>
              {selectedReadings.size > 0 && (
                <button
                  onClick={deleteReadings}
                  disabled={deleting}
                  className="text-xs px-3 py-1 bg-red-500/20 text-red-400 rounded-lg cursor-pointer hover:bg-red-500/30 transition-colors"
                >
                  {deleting ? "삭제 중..." : `${selectedReadings.size}개 삭제`}
                </button>
              )}
              <button
                onClick={() => {
                  if (selectedReadings.size === readings.length) {
                    setSelectedReadings(new Set());
                  } else {
                    setSelectedReadings(new Set(readings.map(r => r.id)));
                  }
                }}
                className="text-[10px] text-foreground/30 cursor-pointer"
              >
                {selectedReadings.size === readings.length ? "전체 해제" : "전체 선택"}
              </button>
            </div>

            {/* 목록 */}
            {readings.map((r) => (
              <div key={r.id} className={`rounded-xl border ${selectedReadings.has(r.id) ? "border-red-500/30" : "border-gold/10"} bg-purple-dark/10 overflow-hidden`}>
                <div
                  className="flex items-center gap-2 p-3 cursor-pointer"
                  onClick={() => setExpandedReading(expandedReading === r.id ? null : r.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedReadings.has(r.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      const next = new Set(selectedReadings);
                      if (next.has(r.id)) next.delete(r.id);
                      else next.add(r.id);
                      setSelectedReadings(next);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-3.5 h-3.5 shrink-0 accent-gold cursor-pointer"
                  />
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple/20 text-purple/80 shrink-0">
                    {CATEGORY_LABELS[r.category] || r.category}
                  </span>
                  <span className="text-foreground/50 text-xs truncate flex-1">{r.user_name}</span>
                  {r.source === "fallback" && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 shrink-0">FB</span>
                  )}
                  {r.score && <span className="text-gold/60 text-xs shrink-0">{r.score}%</span>}
                  <span className="text-foreground/20 text-[10px] shrink-0">
                    {new Date(r.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                {expandedReading === r.id && (
                  <div className="px-3 pb-3 border-t border-gold/5">
                    <p className="text-foreground/60 text-xs leading-6 whitespace-pre-line mt-2">{r.reading}</p>
                  </div>
                )}
              </div>
            ))}

            {/* 페이지네이션 */}
            {readingsTotal > 20 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => setReadingsPage(Math.max(1, readingsPage - 1))}
                  disabled={readingsPage === 1}
                  className="px-3 py-1 text-xs text-gold/40 border border-gold/10 rounded-lg disabled:opacity-30 cursor-pointer"
                >
                  이전
                </button>
                <span className="px-3 py-1 text-xs text-foreground/30">
                  {readingsPage} / {Math.ceil(readingsTotal / 20)}
                </span>
                <button
                  onClick={() => setReadingsPage(readingsPage + 1)}
                  disabled={readingsPage >= Math.ceil(readingsTotal / 20)}
                  className="px-3 py-1 text-xs text-gold/40 border border-gold/10 rounded-lg disabled:opacity-30 cursor-pointer"
                >
                  다음
                </button>
              </div>
            )}
          </div>
        )}

        {/* Fallback 로그 */}
        {tab === "fallback" && (
          <div className="space-y-3">
            <p className="text-foreground/30 text-xs">총 {fallbackTotal}건</p>

            {fallbackLogs.length === 0 && (
              <div className="text-center py-12 text-foreground/20 text-sm">
                아직 fallback이 발생하지 않았어요
              </div>
            )}

            {fallbackLogs.map((log) => (
              <div key={log.id} className="rounded-xl border border-gold/10 bg-purple-dark/10 overflow-hidden">
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer"
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                >
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    log.error_type === "all_failed" ? "bg-red-500/20 text-red-400"
                    : log.error_type === "gemini_failed_groq_success" ? "bg-blue-500/20 text-blue-400"
                    : "bg-orange-500/20 text-orange-400"
                  }`}>
                    {ERROR_TYPE_LABELS[log.error_type] || log.error_type}
                  </span>
                  <span className="text-xs text-purple/60 shrink-0">
                    {CATEGORY_LABELS[log.category] || log.category}
                  </span>
                  <span className="text-foreground/30 text-xs truncate flex-1">{log.user_id || "-"}</span>
                  <span className="text-foreground/20 text-[10px] shrink-0">
                    {new Date(log.created_at).toLocaleString("ko-KR")}
                  </span>
                </div>
                {expandedLog === log.id && log.fallback_readings && (
                  <div className="px-3 pb-3 border-t border-gold/5">
                    <p className="text-foreground/40 text-[10px] mt-2 mb-1">보여준 해석:</p>
                    <p className="text-foreground/60 text-xs leading-6 whitespace-pre-line">{log.fallback_readings.reading}</p>
                  </div>
                )}
              </div>
            ))}

            {/* 페이지네이션 */}
            {fallbackTotal > 20 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => setFallbackPage(Math.max(1, fallbackPage - 1))}
                  disabled={fallbackPage === 1}
                  className="px-3 py-1 text-xs text-gold/40 border border-gold/10 rounded-lg disabled:opacity-30 cursor-pointer"
                >
                  이전
                </button>
                <span className="px-3 py-1 text-xs text-foreground/30">
                  {fallbackPage} / {Math.ceil(fallbackTotal / 20)}
                </span>
                <button
                  onClick={() => setFallbackPage(fallbackPage + 1)}
                  disabled={fallbackPage >= Math.ceil(fallbackTotal / 20)}
                  className="px-3 py-1 text-xs text-gold/40 border border-gold/10 rounded-lg disabled:opacity-30 cursor-pointer"
                >
                  다음
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
