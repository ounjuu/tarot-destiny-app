"use client";

import { signIn } from "next-auth/react";
import StarBackground from "@/components/StarBackground";

export default function LoginPage() {
  return (
    <div className="app-container bg-background">
      <StarBackground />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        {/* 로고 */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5 mt-4">
            <img src="/logo.png" alt="LunaTarot" className="w-44 h-44" />
          </div>
          <h1 className="text-4xl font-bold text-gold tracking-wider mb-2">
            LunaTarot
          </h1>
          <p className="text-foreground/40 text-sm">달빛이 비추는 당신의 운명</p>
        </div>

        {/* 로그인 버튼 */}
        <div className="w-full max-w-[300px] flex flex-col gap-3">
          {/* 카카오 로그인 */}
          <button
            onClick={() => signIn("kakao", { callbackUrl: "/" })}
            className="w-full py-3.5 bg-[#FEE500] rounded-2xl text-[#191919] font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1C4.58 1 1 3.79 1 7.21C1 9.38 2.56 11.27 4.88 12.33L3.87 16.12C3.79 16.42 4.15 16.65 4.41 16.47L8.89 13.38C8.93 13.38 8.96 13.38 9 13.38C13.42 13.38 17 10.59 17 7.21C17 3.79 13.42 1 9 1Z" fill="#191919"/>
            </svg>
            카카오로 시작하기
          </button>

          {/* 구글 로그인 */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full py-3.5 bg-white rounded-2xl text-[#333] font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform cursor-pointer border border-gray-200"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Google로 시작하기
          </button>

          <p className="text-center text-foreground/20 text-[10px] mt-2">
            로그인하면 타로 결과를 저장하고 공유할 수 있어요
          </p>
        </div>
      </div>

      {/* 하단 */}
      <footer className="safe-bottom relative z-10 py-3 text-center">
        <p className="text-foreground/15 text-[10px] tracking-wider">
          LUNA TAROT · AI 타로 리딩
        </p>
      </footer>
    </div>
  );
}
