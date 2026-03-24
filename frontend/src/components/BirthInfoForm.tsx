"use client";

import { useState, useEffect, useRef } from "react";

interface BirthInfoFormProps {
  onSubmit: (data: {
    birthday: string;
    birthTime: string | null;
    birthCity: string;
    birthLat: number;
    birthLng: number;
    gender: string;
  }) => void;
}

interface CityResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function BirthInfoForm({ onSubmit }: BirthInfoFormProps) {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [unknownTime, setUnknownTime] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [cityResults, setCityResults] = useState<CityResult[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityResult | null>(null);
  const [gender, setGender] = useState("");
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // 도시 검색 (Nominatim)
  useEffect(() => {
    if (cityQuery.length < 2 || selectedCity) {
      setCityResults([]);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityQuery)}&format=json&limit=5&accept-language=ko&addressdetails=1&featuretype=city`,
          { headers: { "User-Agent": "LunaTarot/1.0" } }
        );
        const data = await res.json();
        setCityResults(data);
      } catch {}
      setSearching(false);
    }, 300);
  }, [cityQuery, selectedCity]);

  const handleCitySelect = (city: CityResult) => {
    setSelectedCity(city);
    setCityQuery(city.display_name.split(",")[0]);
    setCityResults([]);
  };

  const isValid = year && month && day && (unknownTime || (hour && minute)) && selectedCity && gender;

  const handleSubmit = () => {
    if (!isValid || !selectedCity) return;
    onSubmit({
      birthday: `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
      birthTime: unknownTime ? null : `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`,
      birthCity: selectedCity.display_name.split(",")[0],
      birthLat: parseFloat(selectedCity.lat),
      birthLng: parseFloat(selectedCity.lon),
      gender,
    });
  };

  // 년도 옵션 (1940~2010)
  const years = Array.from({ length: 71 }, (_, i) => 2010 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="flex flex-col justify-center h-full px-5 py-6 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
      <div className="text-center mb-8">
        <img src="/icons/astrology-service.svg" alt="" className="w-16 h-16 mx-auto mb-3" />
        <h2 className="text-gold text-lg font-bold mb-1">출생 정보 입력</h2>
        <p className="text-foreground/30 text-xs">정확한 별자리 차트를 위해 필요해요</p>
      </div>

      <div className="w-full max-w-[320px] mx-auto space-y-5">
        {/* 생년월일 */}
        <div>
          <label className="text-gold/60 text-xs mb-2 block">생년월일</label>
          <div className="flex gap-1.5 sm:gap-2">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="flex-1 bg-purple-dark/30 border border-gold/15 rounded-xl px-2 sm:px-3 py-2.5 text-xs sm:text-sm text-foreground/70 appearance-none"
            >
              <option value="">년</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="flex-1 bg-purple-dark/30 border border-gold/15 rounded-xl px-2 sm:px-3 py-2.5 text-xs sm:text-sm text-foreground/70 appearance-none"
            >
              <option value="">월</option>
              {months.map((m) => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="flex-1 bg-purple-dark/30 border border-gold/15 rounded-xl px-2 sm:px-3 py-2.5 text-xs sm:text-sm text-foreground/70 appearance-none"
            >
              <option value="">일</option>
              {days.map((d) => (
                <option key={d} value={d}>{d}일</option>
              ))}
            </select>
          </div>
        </div>

        {/* 태어난 시간 */}
        <div>
          <label className="text-gold/60 text-xs mb-2 block">태어난 시간</label>
          {!unknownTime && (
            <div className="flex gap-1.5 sm:gap-2 mb-2">
              <select
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="flex-1 bg-purple-dark/30 border border-gold/15 rounded-xl px-2 sm:px-3 py-2.5 text-xs sm:text-sm text-foreground/70 appearance-none"
              >
                <option value="">시</option>
                {hours.map((h) => (
                  <option key={h} value={h}>{h}시</option>
                ))}
              </select>
              <select
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="flex-1 bg-purple-dark/30 border border-gold/15 rounded-xl px-2 sm:px-3 py-2.5 text-xs sm:text-sm text-foreground/70 appearance-none"
              >
                <option value="">분</option>
                {minutes.map((m) => (
                  <option key={m} value={m}>{m}분</option>
                ))}
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

        {/* 성별 */}
        <div>
          <label className="text-gold/60 text-[11px] sm:text-xs mb-2 block">성별</label>
          <div className="flex gap-2">
            {[{ value: "male", label: "남성" }, { value: "female", label: "여성" }].map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setGender(g.value)}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                  gender === g.value
                    ? "bg-gradient-to-r from-purple/50 to-gold/20 border border-gold/30 text-gold font-bold"
                    : "bg-purple-dark/30 border border-gold/15 text-foreground/40"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* 태어난 장소 */}
        <div className="relative">
          <label className="text-gold/60 text-[11px] sm:text-xs mb-2 block">태어난 장소</label>
          <input
            type="text"
            value={cityQuery}
            onChange={(e) => { setCityQuery(e.target.value); setSelectedCity(null); }}
            placeholder="도시명을 검색하세요"
            className="w-full bg-purple-dark/30 border border-gold/15 rounded-xl px-2 sm:px-3 py-2.5 text-xs sm:text-sm text-foreground/70 placeholder:text-foreground/20 outline-none focus:border-gold/30 transition-colors"
          />
          {searching && (
            <p className="text-foreground/20 text-[10px] mt-1 pl-1">검색 중...</p>
          )}
          {cityResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-[#1a1040] border border-gold/15 rounded-xl overflow-hidden z-50 max-h-32 sm:max-h-40 overflow-y-auto">
              {cityResults.map((city, i) => (
                <button
                  key={i}
                  onClick={() => handleCitySelect(city)}
                  className="w-full text-left px-3 py-2.5 text-xs text-foreground/60 hover:bg-purple-dark/50 active:bg-purple-dark/50 cursor-pointer border-b border-gold/5 last:border-b-0 transition-colors"
                >
                  {city.display_name}
                </button>
              ))}
            </div>
          )}
          {selectedCity && (
            <p className="text-gold/40 text-[10px] mt-1 pl-1">✦ {selectedCity.display_name}</p>
          )}
        </div>

        {/* 제출 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm tracking-wider transition-all cursor-pointer ${
            isValid
              ? "bg-gradient-to-r from-purple to-gold/80 text-white shadow-lg shadow-purple/30 active:scale-[0.98]"
              : "bg-purple-dark/20 text-foreground/20 cursor-not-allowed"
          }`}
        >
          ✦ 별자리 차트 보기
        </button>
      </div>
    </div>
  );
}
