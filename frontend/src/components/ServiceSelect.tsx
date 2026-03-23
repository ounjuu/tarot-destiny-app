"use client";

interface ServiceSelectProps {
  onSelect: (service: "tarot" | "astrology") => void;
}

export default function ServiceSelect({ onSelect }: ServiceSelectProps) {
  return (
    <div className="flex flex-col justify-center items-center h-full px-5 py-6">
      {/* 인사말 */}
      <div className="text-center mb-10">
        <img src="/logo.png" alt="Luna" className="w-20 h-20 mx-auto mb-4" />
        <h2 className="text-gold text-xl font-bold mb-2">어서오세요</h2>
        <p className="text-foreground/40 text-sm">오늘은 어떤 이야기를 들려드릴까요?</p>
      </div>

      {/* 서비스 선택 */}
      <div className="w-full max-w-[320px] space-y-4">
        <button
          onClick={() => onSelect("tarot")}
          className="fade-in w-full p-5 bg-purple-dark/30 border border-gold/15 rounded-2xl active:scale-[0.97] active:bg-purple-dark/50 transition-all cursor-pointer flex items-center gap-4"
          style={{ animationDelay: "0.1s" }}
        >
          <img src="/icons/tarot-service.svg" alt="" className="w-14 h-14" />
          <div className="text-left">
            <p className="text-gold font-bold text-base">타로 카드</p>
            <p className="text-foreground/30 text-xs mt-1">78장의 카드로 보는 오늘의 운세</p>
          </div>
        </button>

        <button
          onClick={() => onSelect("astrology")}
          className="fade-in w-full p-5 bg-purple-dark/30 border border-gold/15 rounded-2xl active:scale-[0.97] active:bg-purple-dark/50 transition-all cursor-pointer flex items-center gap-4"
          style={{ animationDelay: "0.2s" }}
        >
          <img src="/icons/astrology-service.svg" alt="" className="w-14 h-14" />
          <div className="text-left">
            <p className="text-gold font-bold text-base">점성술</p>
            <p className="text-foreground/30 text-xs mt-1">별자리로 읽는 나의 운명</p>
          </div>
        </button>
      </div>

      {/* 하단 장식 */}
      <div className="mt-10 flex gap-3">
        {[0, 1, 2].map((i) => (
          <span key={i} className="text-gold/15 text-xs">✦</span>
        ))}
      </div>
    </div>
  );
}
