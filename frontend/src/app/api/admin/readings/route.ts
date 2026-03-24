import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { isAdmin } from "@/lib/admin";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isAdmin(session.user.id)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  if (!supabase) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const category = searchParams.get("category");
  const userId = searchParams.get("userId");
  const offset = (page - 1) * limit;

  let query = supabase
    .from("readings")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) query = query.eq("category", category);
  if (userId) query = query.eq("user_id", userId);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 사용자 이름 매핑
  const userIds = [...new Set(data?.map((r) => r.user_id) || [])];
  let userMap: Record<string, string> = {};

  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, name, provider")
      .in("id", userIds);

    users?.forEach((u) => {
      userMap[u.id] = u.name || u.id;
    });
  }

  const readings = data?.map((r) => ({
    ...r,
    user_name: userMap[r.user_id] || r.user_id,
  }));

  return NextResponse.json({ readings, total: count, page, limit });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isAdmin(session.user.id)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  if (!supabase) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  const { ids } = await request.json();

  if (!ids || ids.length === 0) {
    return NextResponse.json({ error: "no_ids" }, { status: 400 });
  }

  const { error } = await supabase
    .from("readings")
    .delete()
    .in("id", ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, deleted: ids.length });
}
