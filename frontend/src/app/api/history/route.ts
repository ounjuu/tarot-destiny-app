import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId || !supabase) {
      return NextResponse.json({ readings: [] });
    }

    const { data } = await supabase
      .from("readings")
      .select("id, category, category_label, score, keywords, reading, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    return NextResponse.json({ readings: data || [] });
  } catch {
    return NextResponse.json({ readings: [] });
  }
}
