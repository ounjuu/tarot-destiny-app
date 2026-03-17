import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tarot-destiny-app.vercel.app";

export const metadata: Metadata = {
  title: "LunaTarot - AI 타로 리딩",
  description: "달빛 아래 펼쳐지는 AI 타로 카드 리딩. 연애운, 회사운, 전생운 등 10가지 운세를 확인해보세요.",
  openGraph: {
    title: "🌙 LunaTarot - AI 타로 리딩",
    description: "달빛이 비추는 당신의 운명. 카드를 뽑고 AI가 해석해드려요.",
    url: SITE_URL,
    siteName: "LunaTarot",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "LunaTarot 메인 화면",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "🌙 LunaTarot - AI 타로 리딩",
    description: "달빛이 비추는 당신의 운명. 카드를 뽑고 AI가 해석해드려요.",
    images: [`${SITE_URL}/og-image.png`],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LunaTarot",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
