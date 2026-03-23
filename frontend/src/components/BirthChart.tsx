"use client";

import { useEffect, useRef } from "react";

interface BirthChartProps {
  birthday: string;
  birthTime: string | null;
  birthLat: number;
  birthLng: number;
}

export default function BirthChart({ birthday, birthTime, birthLat, birthLng }: BirthChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    async function renderChart() {
      try {
        // @ts-ignore
        const { Origin, Horoscope } = await import("circular-natal-horoscope-js");

        const [year, month, day] = birthday.split("-").map(Number);
        let hour = 12, minute = 0;
        if (birthTime) {
          [hour, minute] = birthTime.split(":").map(Number);
        }

        const origin = new Origin({
          year, month: month - 1, date: day,
          hour, minute, second: 0,
          latitude: birthLat, longitude: birthLng,
        });

        const horoscope = new Horoscope({
          origin,
          hpieces: 12,
          zodiac: "tropical",
          aspectPoints: ["bodies", "points", "angles"],
          aspectWithPoints: ["bodies", "points", "angles"],
          aspectTypes: ["major"],
          customOrbs: {},
          language: "en",
        });

        const bodies = horoscope.CelestialBodies?.all || [];
        const angles = horoscope.Angles?.all || [];

        const planetData = bodies.map((b: { label: string; Sign: { label: string }; ChartPosition: { Ecliptic: { DecimalDegrees: number } } }) => ({
          name: b.label,
          sign: b.Sign?.label || "",
          degree: b.ChartPosition?.Ecliptic?.DecimalDegrees || 0,
        }));

        const angleData = angles.map((a: { label: string; Sign: { label: string }; ChartPosition: { Ecliptic: { DecimalDegrees: number } } }) => ({
          name: a.label,
          sign: a.Sign?.label || "",
          degree: a.ChartPosition?.Ecliptic?.DecimalDegrees || 0,
        }));

        renderSvgChart(chartRef.current!, planetData, angleData);
      } catch {
        if (chartRef.current) {
          chartRef.current.innerHTML = '<p style="color: rgba(201,168,76,0.4); font-size: 12px; text-align: center;">차트를 불러오지 못했어요</p>';
        }
      }
    }

    renderChart();
  }, [birthday, birthTime, birthLat, birthLng]);

  return <div ref={chartRef} className="w-full max-w-[300px] mx-auto mb-4" />;
}

const SIGN_SHORT: Record<string, string> = {
  Aries: "양", Taurus: "황", Gemini: "쌍", Cancer: "게",
  Leo: "사", Virgo: "처", Libra: "천", Scorpio: "전",
  Sagittarius: "궁", Capricorn: "염", Aquarius: "물", Pisces: "어",
};

const PLANET_SHORT: Record<string, string> = {
  Sun: "일", Moon: "월", Mercury: "수", Venus: "금",
  Mars: "화", Jupiter: "목", Saturn: "토", Uranus: "천",
  Neptune: "해", Pluto: "명",
};

const PLANET_KO: Record<string, string> = {
  Sun: "태양", Moon: "달", Mercury: "수성", Venus: "금성",
  Mars: "화성", Jupiter: "목성", Saturn: "토성", Uranus: "천왕성",
  Neptune: "해왕성", Pluto: "명왕성", Ascendant: "상승궁", MC: "천정",
};

const SIGN_KO: Record<string, string> = {
  Aries: "양자리", Taurus: "황소자리", Gemini: "쌍둥이자리", Cancer: "게자리",
  Leo: "사자자리", Virgo: "처녀자리", Libra: "천칭자리", Scorpio: "전갈자리",
  Sagittarius: "사수자리", Capricorn: "염소자리", Aquarius: "물병자리", Pisces: "물고기자리",
};

interface PlanetInfo {
  name: string;
  sign: string;
  degree: number;
}

function renderSvgChart(container: HTMLElement, planets: PlanetInfo[], angles: PlanetInfo[]) {
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 130;
  const innerR = 95;
  const planetR = 75;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;

  // 배경 원
  svg += `<circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="#c9a84c" stroke-width="1" opacity="0.3"/>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="${innerR}" fill="none" stroke="#c9a84c" stroke-width="0.5" opacity="0.2"/>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="${planetR}" fill="none" stroke="#c9a84c" stroke-width="0.3" opacity="0.1"/>`;

  // 12궁 구분선 + 별자리 약자
  const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  signs.forEach((sign, i) => {
    const angle = (i * 30 - 90) * Math.PI / 180;
    const x1 = cx + innerR * Math.cos(angle);
    const y1 = cy + innerR * Math.sin(angle);
    const x2 = cx + outerR * Math.cos(angle);
    const y2 = cy + outerR * Math.sin(angle);
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#c9a84c" stroke-width="0.5" opacity="0.2"/>`;

    const midAngle = ((i * 30 + 15) - 90) * Math.PI / 180;
    const sx = cx + (outerR + innerR) / 2 * Math.cos(midAngle);
    const sy = cy + (outerR + innerR) / 2 * Math.sin(midAngle);
    svg += `<text x="${sx}" y="${sy}" text-anchor="middle" dominant-baseline="central" fill="#c9a84c" font-size="10" opacity="0.6" font-family="sans-serif">${SIGN_SHORT[sign]}</text>`;
  });

  // 행성 배치 (한글 약자)
  planets.forEach((p) => {
    const angle = (p.degree - 90) * Math.PI / 180;
    const px = cx + planetR * Math.cos(angle);
    const py = cy + planetR * Math.sin(angle);
    const label = PLANET_SHORT[p.name] || p.name[0];
    svg += `<circle cx="${px}" cy="${py}" r="9" fill="#1a1040" stroke="#c9a84c" stroke-width="0.5" opacity="0.8"/>`;
    svg += `<text x="${px}" y="${py}" text-anchor="middle" dominant-baseline="central" fill="#c9a84c" font-size="9" font-family="sans-serif">${label}</text>`;
  });

  // 상승궁 표시
  angles.forEach((a) => {
    if (a.name === "Ascendant") {
      const angle = (a.degree - 90) * Math.PI / 180;
      const ax = cx + (outerR + 12) * Math.cos(angle);
      const ay = cy + (outerR + 12) * Math.sin(angle);
      svg += `<text x="${ax}" y="${ay}" text-anchor="middle" dominant-baseline="central" fill="#c9a84c" font-size="8" font-weight="bold" font-family="sans-serif">상승</text>`;
    }
    if (a.name === "MC") {
      const angle = (a.degree - 90) * Math.PI / 180;
      const mx = cx + (outerR + 12) * Math.cos(angle);
      const my = cy + (outerR + 12) * Math.sin(angle);
      svg += `<text x="${mx}" y="${my}" text-anchor="middle" dominant-baseline="central" fill="#c9a84c" font-size="8" font-family="sans-serif" opacity="0.5">천정</text>`;
    }
  });

  svg += `</svg>`;

  // 행성 목록 (한국어)
  let html = svg;
  html += '<div style="margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px;">';
  planets.forEach((p) => {
    const ko = PLANET_KO[p.name] || p.name;
    const signKo = SIGN_KO[p.sign] || p.sign;
    html += `<div style="font-size: 11px; color: rgba(255,255,255,0.5); display: flex; align-items: center; gap: 6px;">
      <span style="color: #c9a84c; font-size: 10px;">✦</span>
      <span>${ko}</span>
      <span style="color: rgba(201,168,76,0.6);">${signKo}</span>
    </div>`;
  });
  angles.forEach((a) => {
    const ko = PLANET_KO[a.name] || a.name;
    const signKo = SIGN_KO[a.sign] || a.sign;
    html += `<div style="font-size: 11px; color: rgba(255,255,255,0.5); display: flex; align-items: center; gap: 6px;">
      <span style="color: #c9a84c; font-size: 10px;">✧</span>
      <span>${ko}</span>
      <span style="color: rgba(201,168,76,0.6);">${signKo}</span>
    </div>`;
  });
  html += '</div>';

  container.innerHTML = html;
}
