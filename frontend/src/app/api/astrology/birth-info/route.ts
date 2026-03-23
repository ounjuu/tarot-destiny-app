import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getZodiacSign } from "@/data/astrology";

// 출생 정보 저장
export async function POST(request: Request) {
  try {
    const { userId, birthday, birthTime, birthCity, birthLat, birthLng } = await request.json();

    if (!userId || !supabase) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    const [year, month, day] = birthday.split("-").map(Number);
    const zodiacSign = getZodiacSign(month, day);

    const { error } = await supabase
      .from("users")
      .update({
        birthday,
        birth_time: birthTime,
        birth_city: birthCity,
        birth_lat: birthLat,
        birth_lng: birthLng,
        zodiac_sign: zodiacSign,
      })
      .eq("id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, zodiacSign });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// 출생 정보 조회
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId || !supabase) {
    return NextResponse.json({ exists: false });
  }

  const { data } = await supabase
    .from("users")
    .select("birthday, birth_time, birth_city, birth_lat, birth_lng, zodiac_sign")
    .eq("id", userId)
    .single();

  if (data?.birthday) {
    return NextResponse.json({ exists: true, ...data });
  }

  return NextResponse.json({ exists: false });
}
