import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tarot-destiny-app.vercel.app";

export const metadata: Metadata = {
  title: "Luna - 타로 · 점성술 · 사주",
  description: "타로 카드, 별자리 점성술, 사주팔자까지. 루나가 당신의 운명을 읽어드려요.",
  openGraph: {
    title: "Luna - 타로 · 점성술 · 사주",
    description: "타로 카드, 별자리 점성술, 사주팔자까지. 루나가 당신의 운명을 읽어드려요.",
    url: SITE_URL,
    siteName: "Luna",
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
    title: "Luna - 타로 · 점성술 · 사주",
    description: "타로 카드, 별자리 점성술, 사주팔자까지. 루나가 당신의 운명을 읽어드려요.",
    images: [`${SITE_URL}/og-image.png`],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Luna",
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
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a1a" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var t=localStorage.getItem('theme');
            if(t==='light'){
              document.documentElement.classList.add('light');
              var m=document.querySelector('meta[name="theme-color"]');
              if(m)m.setAttribute('content','#f5f0e8');
            }
          })();
        `}} />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js');
            });
          }
        `}} />
      </body>
    </html>
  );
}
