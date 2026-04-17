"use client";

import { useState, useEffect } from "react";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.lunafortune.app";

export default function AppInstallPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 모바일에서만 표시
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const dismissed = localStorage.getItem("app_install_dismissed");

    if (isMobile && !dismissed) {
      // 로그인 직후 자연스럽게 보이도록 약간 딜레이
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("app_install_dismissed", "true");
  };

  const handleInstall = () => {
    window.open(PLAY_STORE_URL, "_blank");
    handleDismiss();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* 팝업 */}
      <div className="relative w-full max-w-[320px] bg-[#1a1025] border border-gold/20 rounded-2xl p-6 text-center fade-in">
        {/* 아이콘 */}
        <div className="mb-4">
          <img
            src="/logo.png"
            alt="Luna"
            className="w-16 h-16 mx-auto mb-3"
          />
          <h3 className="text-gold text-lg font-bold">루나 앱 출시!</h3>
          <p className="text-foreground/50 text-xs mt-2 leading-relaxed">
            앱으로 더 빠르고 편하게
            <br />
            오늘의 운세를 확인해보세요
          </p>
        </div>

        {/* 버튼 */}
        <div className="space-y-2.5">
          <button
            onClick={handleInstall}
            className="w-full py-3 bg-gold/90 text-background font-bold text-sm rounded-xl active:scale-[0.97] transition-all cursor-pointer"
          >
            Google Play에서 다운로드
          </button>
          <button
            onClick={handleDismiss}
            className="w-full py-2.5 text-foreground/30 text-xs cursor-pointer"
          >
            다음에 할게요
          </button>
        </div>
      </div>
    </div>
  );
}
