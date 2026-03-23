"use client";

import { useState } from "react";

interface SajuBirthFormProps {
  onSubmit: (data: { birthday: string; birthTime: string | null }) => void;
}

export default function SajuBirthForm({ onSubmit }: SajuBirthFormProps) {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [unknownTime, setUnknownTime] = useState(false);

  const isValid = year && month && day && (unknownTime || (hour && minute));

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({
      birthday: `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
      birthTime: unknownTime ? null : `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`,
    });
  };

  const years = Array.from({ length: 71 }, (_, i) => 2010 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="flex flex-col justify-center h-full px-5 py-6 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
      <div className="text-center mb-8">
        <img src="/icons/saju-service.svg" alt="" className="w-16 h-16 mx-auto mb-3" />
        <h2 className="text-gold text-lg font-bold mb-1">출생 정보 입력</h2>
        <p className="text-foreground/30 text-xs">정확한 사주팔자를 위해 필요해요</p>
      </div>

      <div className="w-full max-w-[320px] mx-auto space-y-5">
        {/* 생년월일 */}
        <div>
          <label className="text-gold/60 text-[11px] sm:text-xs mb-2 block">생년월일 (양력)</label>
          <div className="flex gap-1.5 sm:gap-2">
            <select value={year} onChange={(e) => setYear(e.target.value)}
              className="flex-1 bg-purple-dark/30 border border-gold/15 rounded-xl px-2 sm:px-3 py-2.5 text-xs sm:text-sm text-foreground/70 appearance-none">
              <option value="">년</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={month} onChange={(e) => setMonth(e.target.value)}
              className="flex-1 bg-purple-dark/30 border border-gold/15 rounded-xl px-2 sm:px-3 py-2.5 text-xs sm:text-sm text-foreground/70 appearance-none">
              <option value="">월</option>
              {months.map((m) => <option key={m} value={m}>{m}월</option>)}
            </select>
            <select value={day} onChange={(e) => setDay(e.target.value)}
              className="flex-1 bg-purple-dark/30 border border-gold/15 rounded-xl px-2 sm:px-3 py-2.5 text-xs sm:text-sm text-foreground/70 appearance-none">
              <option value="">일</option>
              {days.map((d) => <option key={d} value={d}>{d}일</option>)}
            </select>
          </div>
        </div>

        {/* 태어난 시간 */}
        <div>
          <label className="text-gold/60 text-[11px] sm:text-xs mb-2 block">태어난 시간</label>
          {!unknownTime && (
            <div className="flex gap-1.5 sm:gap-2 mb-2">
              <select value={hour} onChange={(e) => setHour(e.target.value)}
                className="flex-1 bg-purple-dark/30 border border-gold/15 rounded-xl px-2 sm:px-3 py-2.5 text-xs sm:text-sm text-foreground/70 appearance-none">
                <option value="">시</option>
                {hours.map((h) => <option key={h} value={h}>{h}시</option>)}
              </select>
              <select value={minute} onChange={(e) => setMinute(e.target.value)}
                className="flex-1 bg-purple-dark/30 border border-gold/15 rounded-xl px-2 sm:px-3 py-2.5 text-xs sm:text-sm text-foreground/70 appearance-none">
                <option value="">분</option>
                {minutes.map((m) => <option key={m} value={m}>{m}분</option>)}
              </select>
            </div>
          )}
          <button
            onClick={() => { setUnknownTime(!unknownTime); setHour(""); setMinute(""); }}
            className={`text-xs cursor-pointer transition-colors ${unknownTime ? "text-gold/70" : "text-foreground/30"}`}
          >
            {unknownTime ? "✦ 시간을 모르겠어요" : "✧ 시간을 모르겠어요"}
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm tracking-wider transition-all cursor-pointer ${
            isValid
              ? "bg-gradient-to-r from-purple to-gold/80 text-white shadow-lg shadow-purple/30 active:scale-[0.98]"
              : "bg-purple-dark/20 text-foreground/20 cursor-not-allowed"
          }`}
        >
          ✦ 사주 보기
        </button>
      </div>
    </div>
  );
}
