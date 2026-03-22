import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { isAdmin } from "@/lib/admin";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isAdmin(session.user.id)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  if (!supabase) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  const today = new Date().toISOString().split("T")[0];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  // 모든 쿼리 병렬 실행
  const [usersRes, readingsRes, todayRes, recentRes, categoryRes, fallbackRes] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("readings").select("*", { count: "exact", head: true }),
    supabase.from("readings").select("*", { count: "exact", head: true })
      .gte("created_at", `${today}T00:00:00`).lte("created_at", `${today}T23:59:59`),
    supabase.from("readings").select("created_at")
      .gte("created_at", sevenDaysAgo.toISOString().split("T")[0] + "T00:00:00"),
    supabase.from("readings").select("category"),
    supabase.from("fallback_logs").select("*", { count: "exact", head: true }),
  ]);

  // 7일 일별 통계
  const dailyStats: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyStats[d.toISOString().split("T")[0]] = 0;
  }
  recentRes.data?.forEach((r) => {
    const date = r.created_at.split("T")[0];
    if (dailyStats[date] !== undefined) dailyStats[date]++;
  });

  // 카테고리별 인기도
  const categoryStats: Record<string, number> = {};
  categoryRes.data?.forEach((r) => {
    categoryStats[r.category] = (categoryStats[r.category] || 0) + 1;
  });

  return NextResponse.json({
    totalUsers: usersRes.count || 0,
    totalReadings: readingsRes.count || 0,
    todayReadings: todayRes.count || 0,
    totalFallbacks: fallbackRes.count || 0,
    dailyStats,
    categoryStats,
  });
}
