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

// 별자리 한국어 (대소문자 무관)
const SIGN_KO_MAP: Record<string, string> = {
  aries: "양자리", taurus: "황소자리", gemini: "쌍둥이자리", cancer: "게자리",
  leo: "사자자리", virgo: "처녀자리", libra: "천칭자리", scorpio: "전갈자리",
  sagittarius: "사수자리", capricorn: "염소자리", aquarius: "물병자리", pisces: "물고기자리",
};
function getSignKo(sign: string): string {
  return SIGN_KO_MAP[sign.toLowerCase()] || sign;
}

// 차트 내 별자리 심볼 (한글 1자)
const SIGN_SYMBOL: Record<string, string> = {
  Aries: "양", Taurus: "황", Gemini: "쌍", Cancer: "게",
  Leo: "사", Virgo: "처", Libra: "천", Scorpio: "전",
  Sagittarius: "궁", Capricorn: "염", Aquarius: "물", Pisces: "어",
};

// 별자리 원소별 색상 (대소문자 무관)
const SIGN_COLORS_MAP: Record<string, string> = {
  aries: "#e06050", taurus: "#80a050", gemini: "#e0c050", cancer: "#5090c0",
  leo: "#e08030", virgo: "#60a060", libra: "#c070a0", scorpio: "#8050a0",
  sagittarius: "#d06040", capricorn: "#607060", aquarius: "#4080b0", pisces: "#7070b0",
};
function getSignColor(sign: string): string {
  return SIGN_COLORS_MAP[sign.toLowerCase()] || "#c9a84c";
}

// 행성 한국어
const PLANET_KO: Record<string, string> = {
  Sun: "태양", Moon: "달", Mercury: "수성", Venus: "금성",
  Mars: "화성", Jupiter: "목성", Saturn: "토성", Uranus: "천왕성",
  Neptune: "해왕성", Pluto: "명왕성", Chiron: "키론", Sirius: "시리우스",
  Ascendant: "상승궁", MC: "천정", Midheaven: "천정",
  "North Node": "북교점", "South Node": "남교점",
  Lilith: "릴리스", Ceres: "세레스", Pallas: "팔라스",
  Juno: "주노", Vesta: "베스타", Eris: "에리스",
};

// 차트 내 행성 심볼 (한글 1자)
const PLANET_SYMBOL: Record<string, string> = {
  Sun: "일", Moon: "월", Mercury: "수", Venus: "금",
  Mars: "화", Jupiter: "목", Saturn: "토", Uranus: "천",
  Neptune: "해", Pluto: "명", Chiron: "키", Sirius: "시",
  Midheaven: "정", "North Node": "북", "South Node": "남",
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
  const outerR = 135;
  const signR = 112;
  const innerR = 90;
  const planetR = 68;
  const centerR = 40;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;

  // 배경 그라데이션
  svg += `<defs><radialGradient id="chartBg" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#1a1040" stop-opacity="0.3"/>
    <stop offset="100%" stop-color="#0a0a1a" stop-opacity="0.1"/>
  </radialGradient></defs>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="${outerR}" fill="url(#chartBg)"/>`;

  // 외곽 원들
  svg += `<circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="#c9a84c" stroke-width="1.2" opacity="0.25"/>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="${innerR}" fill="none" stroke="#c9a84c" stroke-width="0.8" opacity="0.2"/>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="${centerR}" fill="none" stroke="#c9a84c" stroke-width="0.5" opacity="0.1"/>`;

  // 12궁 구분선 + 별자리 심볼
  const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  signs.forEach((sign, i) => {
    const angle = (i * 30 - 90) * Math.PI / 180;
    const x1 = cx + innerR * Math.cos(angle);
    const y1 = cy + innerR * Math.sin(angle);
    const x2 = cx + outerR * Math.cos(angle);
    const y2 = cy + outerR * Math.sin(angle);
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#c9a84c" stroke-width="0.5" opacity="0.15"/>`;

    // 별자리 구간 배경색
    const startAngle = (i * 30 - 90) * Math.PI / 180;
    const endAngle = ((i + 1) * 30 - 90) * Math.PI / 180;
    const color = getSignColor(sign);
    const ax1 = cx + innerR * Math.cos(startAngle);
    const ay1 = cy + innerR * Math.sin(startAngle);
    const ax2 = cx + outerR * Math.cos(startAngle);
    const ay2 = cy + outerR * Math.sin(startAngle);
    const ax3 = cx + outerR * Math.cos(endAngle);
    const ay3 = cy + outerR * Math.sin(endAngle);
    const ax4 = cx + innerR * Math.cos(endAngle);
    const ay4 = cy + innerR * Math.sin(endAngle);
    svg += `<path d="M${ax1} ${ay1} L${ax2} ${ay2} A${outerR} ${outerR} 0 0 1 ${ax3} ${ay3} L${ax4} ${ay4} A${innerR} ${innerR} 0 0 0 ${ax1} ${ay1}" fill="${color}" opacity="0.06"/>`;

    // 별자리 심볼
    const midAngle = ((i * 30 + 15) - 90) * Math.PI / 180;
    const sx = cx + signR * Math.cos(midAngle);
    const sy = cy + signR * Math.sin(midAngle);
    svg += `<text x="${sx}" y="${sy}" text-anchor="middle" dominant-baseline="central" fill="${color}" font-size="9" opacity="0.7" font-family="sans-serif">${SIGN_SYMBOL[sign]}</text>`;
  });

  // 행성 배치
  planets.forEach((p) => {
    const angle = (p.degree - 90) * Math.PI / 180;
    const px = cx + planetR * Math.cos(angle);
    const py = cy + planetR * Math.sin(angle);
    const label = PLANET_SYMBOL[p.name] || p.name[0];
    const signColor = getSignColor(p.sign);
    svg += `<circle cx="${px}" cy="${py}" r="10" fill="#0a0a1a" stroke="${signColor}" stroke-width="0.8" opacity="0.9"/>`;
    svg += `<text x="${px}" y="${py}" text-anchor="middle" dominant-baseline="central" fill="#c9a84c" font-size="8" font-family="sans-serif" font-weight="bold">${label}</text>`;
  });

  // 상승궁/천정 마커
  angles.forEach((a) => {
    const angle = (a.degree - 90) * Math.PI / 180;
    const ax = cx + (outerR + 10) * Math.cos(angle);
    const ay = cy + (outerR + 10) * Math.sin(angle);
    const ix = cx + outerR * Math.cos(angle);
    const iy = cy + outerR * Math.sin(angle);
    const iix = cx + innerR * Math.cos(angle);
    const iiy = cy + innerR * Math.sin(angle);

    if (a.name === "Ascendant") {
      svg += `<line x1="${ix}" y1="${iy}" x2="${iix}" y2="${iiy}" stroke="#c9a84c" stroke-width="1.5" opacity="0.5"/>`;
      svg += `<text x="${ax}" y="${ay}" text-anchor="middle" dominant-baseline="central" fill="#c9a84c" font-size="7" font-weight="bold" font-family="sans-serif">ASC</text>`;
    }
    if (a.name === "MC") {
      svg += `<line x1="${ix}" y1="${iy}" x2="${iix}" y2="${iiy}" stroke="#c9a84c" stroke-width="1" opacity="0.3"/>`;
      svg += `<text x="${ax}" y="${ay}" text-anchor="middle" dominant-baseline="central" fill="#c9a84c" font-size="7" font-family="sans-serif" opacity="0.4">MC</text>`;
    }
  });

  // 중앙 장식
  svg += `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" fill="#c9a84c" font-size="10" opacity="0.2">✦</text>`;

  svg += `</svg>`;

  // 행성 목록 (한국어)
  let html = svg;
  html += '<div style="margin-top: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px 8px;">';
  planets.forEach((p) => {
    const ko = PLANET_KO[p.name] || p.name;
    const signKo = getSignKo(p.sign);
    const signColor = getSignColor(p.sign);
    html += `<div style="font-size: 10px; color: rgba(255,255,255,0.5); display: flex; align-items: center; gap: 5px; padding: 2px 0;">
      <span style="color: ${signColor}; font-size: 9px; width: 6px;">●</span>
      <span style="min-width: 28px;">${ko}</span>
      <span style="color: rgba(201,168,76,0.5);">${signKo}</span>
    </div>`;
  });
  angles.forEach((a) => {
    const ko = PLANET_KO[a.name] || a.name;
    const signKo = getSignKo(a.sign);
    html += `<div style="font-size: 10px; color: rgba(255,255,255,0.5); display: flex; align-items: center; gap: 5px; padding: 2px 0;">
      <span style="color: #c9a84c; font-size: 9px; width: 6px;">◆</span>
      <span style="min-width: 28px;">${ko}</span>
      <span style="color: rgba(201,168,76,0.5);">${signKo}</span>
    </div>`;
  });
  html += '</div>';

  container.innerHTML = html;
}
