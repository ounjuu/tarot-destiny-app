import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tarot-destiny-app.vercel.app";

  const ogImage = `${siteUrl}/og-image.png`;
  const defaultMeta = {
    title: "Luna - 타로 · 점성술 · 사주",
    openGraph: {
      title: "Luna - 타로 · 점성술 · 사주",
      description: "루나가 당신의 운명을 읽어드려요.",
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: "website" as const,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: "Luna - 타로 · 점성술 · 사주",
      images: [ogImage],
    },
  };

  if (!supabaseUrl || !supabaseAnonKey) return defaultMeta;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data } = await supabase
    .from("readings")
    .select("category_label, cards, score")
    .eq("id", id)
    .single();

  if (!data) return defaultMeta;

  const score = data.score != null && data.score > 0 ? `${data.score}%` : "";
  const title = score ? `${data.category_label} ${score} - Luna` : `${data.category_label} - Luna`;
  const description = data.cards && data.cards.length > 0
    ? `뽑은 카드: ${data.cards.join(", ")}`
    : `${data.category_label} 결과를 확인해보세요`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      url: `${siteUrl}/result/${id}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function ResultLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
