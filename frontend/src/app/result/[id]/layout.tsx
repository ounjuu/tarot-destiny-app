import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tarot-destiny-app.vercel.app";

  if (!supabaseUrl || !supabaseAnonKey) {
    return { title: "LunaTarot - 타로 리딩" };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data } = await supabase
    .from("readings")
    .select("category_label, cards, score")
    .eq("id", id)
    .single();

  if (!data) {
    return { title: "LunaTarot - 타로 리딩" };
  }

  const title = `${data.category_label} ${data.score || ""}% - LunaTarot`;
  const description = `뽑은 카드: ${data.cards.join(", ")}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630 }],
      url: `${siteUrl}/result/${id}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/og-image.png`],
    },
  };
}

export default function ResultLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
