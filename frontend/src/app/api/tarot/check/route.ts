import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { category, userId } = await request.json();

    if (!userId || !supabase) {
      return NextResponse.json({ exists: false });
    }

    const today = new Date().toISOString().split("T")[0];
    const { data: existing } = await supabase
      .from("readings")
      .select("id, reading, cards")
      .eq("user_id", userId)
      .eq("category", category)
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({
        exists: true,
        reading: existing[0].reading,
        readingId: existing[0].id,
        cards: existing[0].cards,
      });
    }

    return NextResponse.json({ exists: false });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
