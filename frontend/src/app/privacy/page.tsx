"use client";

import { useEffect } from "react";

export default function PrivacyPage() {
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

        <div className="space-y-6 text-sm leading-7">
          <section>
            <h2 className="text-gold/80 font-bold mb-2">1. 수집하는 개인정보</h2>
            <p>Luna는 서비스 제공을 위해 다음 정보를 수집합니다.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-foreground/60">
              <li>소셜 로그인 정보: 이름, 이메일, 프로필 이미지 (카카오/구글 제공)</li>
              <li>출생 정보: 생년월일, 태어난 시간, 태어난 장소, 성별 (사용자 직접 입력)</li>
              <li>운세 결과: 타로/점성술/사주 해석 내용 및 점수</li>
            </ul>
          </section>

          <section>
            <h2 className="text-gold/80 font-bold mb-2">2. 개인정보의 수집 및 이용 목적</h2>
            <ul className="list-disc pl-5 space-y-1 text-foreground/60">
              <li>타로, 점성술, 사주 운세 서비스 제공</li>
              <li>운세 결과 저장 및 히스토리 조회</li>
              <li>결과 공유 기능 제공</li>
              <li>카테고리별 이용 제한 관리 (하루/주/월/년 1회)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-gold/80 font-bold mb-2">3. 개인정보의 보유 및 이용 기간</h2>
            <p className="text-foreground/60">
              회원 탈퇴 시 또는 서비스 종료 시 지체 없이 파기합니다.
              단, 운세 결과는 서비스 이용 기간 동안 보관됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-gold/80 font-bold mb-2">4. 개인정보의 제3자 제공</h2>
            <p className="text-foreground/60">
              Luna는 사용자의 개인정보를 제3자에게 제공하지 않습니다.
              단, 운세 해석을 위해 AI 서비스(Google Gemini, Groq)에 출생 정보가 전달되며,
              이는 해석 생성 목적으로만 사용되고 별도로 저장되지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-gold/80 font-bold mb-2">5. 개인정보의 파기</h2>
            <p className="text-foreground/60">
              보유 기간이 경과하거나 처리 목적이 달성된 경우, 해당 개인정보를 지체 없이 파기합니다.
              전자적 파일은 복구 불가능한 방법으로 삭제하며, 종이 문서는 분쇄 또는 소각합니다.
            </p>
          </section>

          <section>
            <h2 className="text-gold/80 font-bold mb-2">6. 이용자의 권리</h2>
            <p className="text-foreground/60">
              이용자는 언제든지 자신의 개인정보에 대해 열람, 수정, 삭제를 요청할 수 있으며,
              회원 탈퇴를 통해 개인정보 처리를 중단할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-gold/80 font-bold mb-2">7. 개인정보 보호를 위한 조치</h2>
            <ul className="list-disc pl-5 space-y-1 text-foreground/60">
              <li>모든 데이터 전송은 HTTPS를 통해 암호화됩니다.</li>
              <li>비밀번호는 저장하지 않으며, 소셜 로그인(OAuth)을 통해 인증합니다.</li>
              <li>데이터베이스 접근은 인증된 요청에만 허용됩니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-gold/80 font-bold mb-2">8. 쿠키 및 로컬 스토리지</h2>
            <p className="text-foreground/60">
              Luna는 로그인 세션 유지를 위해 쿠키를 사용하며,
              일부 설정 정보를 브라우저 로컬 스토리지에 저장할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-gold/80 font-bold mb-2">9. 개인정보처리방침의 변경</h2>
            <p className="text-foreground/60">
              본 방침이 변경되는 경우, 변경 사항을 서비스 내 공지를 통해 안내합니다.
            </p>
          </section>

          <section>
            <h2 className="text-gold/80 font-bold mb-2">10. 문의</h2>
            <p className="text-foreground/60">
              개인정보 관련 문의는 아래로 연락해주세요.
            </p>
            <p className="text-gold/60 mt-2">서비스명: Luna</p>
            <p className="text-gold/60">시행일: 2026년 3월 25일</p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gold/10 text-center">
          <p className="text-foreground/20 text-xs">Luna · 타로 · 점성술 · 사주</p>
        </div>
      </div>
    </div>
  );
}
