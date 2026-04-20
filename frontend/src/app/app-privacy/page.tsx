"use client";

import { useEffect } from "react";

export default function AppPrivacyPage() {
  useEffect(() => {
    document.documentElement.style.overflow = "auto";
    document.documentElement.style.height = "auto";
    document.body.style.overflow = "auto";
    document.body.style.height = "auto";
    return () => {
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground/80">
      <div className="max-w-[430px] mx-auto px-5 py-8">
        <h1 className="text-gold text-xl font-bold mb-6">개인정보처리방침</h1>
        <p className="text-gold/60 text-xs mb-6">루나운세 (LunaFortune) 모바일 앱</p>

        <div className="space-y-6 text-sm leading-7">
          <section>
            <h2 className="text-gold/80 font-bold mb-2">1. 수집하는 개인정보</h2>
            <p className="text-foreground/60">
              루나운세는 서비스 제공을 위해 다음 정보를 수집합니다.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-foreground/60">
              <li>출생 정보: 생년월일, 태어난 시간, 성별 (사용자 직접 입력)</li>
              <li>출생지: 태어난 장소 (점성술 서비스 이용 시, 선택사항)</li>
            </ul>
            <p className="text-foreground/60 mt-2">
              위 정보는 기기 내부(로컬 저장소)에만 저장되며, 별도의 서버에 전송하거나 저장하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-gold/80 font-bold mb-2">2. 개인정보의 수집 및 이용 목적</h2>
            <ul className="list-disc pl-5 space-y-1 text-foreground/60">
              <li>타로, 사주, 점성술 운세 서비스 제공</li>
              <li>AI 운세 해석 요청 시 출생 정보 활용</li>
              <li>운세 결과 이미지 공유 기능 제공</li>
            </ul>
          </section>

          <section>
            <h2 className="text-gold/80 font-bold mb-2">3. 개인정보의 보관 및 파기</h2>
            <ul className="list-disc pl-5 space-y-1 text-foreground/60">
              <li>모든 개인정보는 사용자의 기기 로컬 저장소에만 보관됩니다.</li>
              <li>앱을 삭제하면 저장된 모든 정보가 자동으로 삭제됩니다.</li>
              <li>앱 내 설정에서 언제든지 저장된 정보를 직접 삭제할 수 있습니다.</li>
              <li>서버에 개인정보를 별도 저장하지 않으므로, 앱 삭제만으로 완전한 파기가 이루어집니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-gold/80 font-bold mb-2">4. 개인정보의 제3자 제공</h2>
            <p className="text-foreground/60">
              루나운세는 사용자의 개인정보를 제3자에게 제공하지 않습니다.
              단, 운세 해석을 위해 AI 서비스(Google Gemini, Groq)에 출생 정보가 전달되며,
              이는 해석 생성 목적으로만 사용되고 AI 서비스에서 별도로 저장하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-gold/80 font-bold mb-2">5. 광고</h2>
            <p className="text-foreground/60">
              루나운세는 Google AdMob 광고를 포함하고 있습니다.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-foreground/60">
              <li>광고 제공을 위해 광고 식별자(Advertising ID)가 사용될 수 있습니다.</li>
              <li>광고 식별자는 기기에서 자동으로 관리되며, 기기 설정에서 재설정하거나 비활성화할 수 있습니다.</li>
              <li>개인을 직접 식별할 수 있는 정보는 광고 서비스에 제공되지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-gold/80 font-bold mb-2">6. 이용자의 권리</h2>
            <ul className="list-disc pl-5 space-y-1 text-foreground/60">
              <li>앱 설정에서 저장된 출생 정보를 언제든지 확인, 수정, 삭제할 수 있습니다.</li>
              <li>앱 삭제를 통해 모든 데이터를 완전히 제거할 수 있습니다.</li>
              <li>별도의 회원가입이나 로그인이 없으므로, 탈퇴 절차 없이 앱 삭제만으로 충분합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-gold/80 font-bold mb-2">7. 개인정보 보호를 위한 조치</h2>
            <ul className="list-disc pl-5 space-y-1 text-foreground/60">
              <li>AI 서비스와의 통신은 HTTPS를 통해 암호화됩니다.</li>
              <li>개인정보는 기기 내부에만 저장되어 외부 유출 위험이 최소화됩니다.</li>
              <li>별도의 계정 시스템이 없어 계정 탈취 위험이 없습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-gold/80 font-bold mb-2">8. 개인정보처리방침의 변경</h2>
            <p className="text-foreground/60">
              본 방침이 변경되는 경우, 앱 업데이트를 통해 안내합니다.
            </p>
          </section>

          <section>
            <h2 className="text-gold/80 font-bold mb-2">9. 문의</h2>
            <p className="text-foreground/60">
              개인정보 관련 문의는 아래로 연락해주세요.
            </p>
            <p className="text-gold/60 mt-2">서비스명: 루나운세 (LunaFortune)</p>
            <p className="text-gold/60">이메일: lunafortune.help@gmail.com</p>
            <p className="text-gold/60">시행일: 2026년 3월 26일</p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gold/10 text-center">
          <p className="text-foreground/20 text-xs">LunaFortune · 타로 · 사주 · 점성술</p>
        </div>
      </div>
    </div>
  );
}
