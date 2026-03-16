import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LunaTarot - AI 타로 리딩",
  description: "달빛 아래 펼쳐지는 AI 타로 카드 리딩",
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
