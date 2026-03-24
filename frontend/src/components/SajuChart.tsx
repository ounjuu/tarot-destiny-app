"use client";

interface PillarData {
  pillar: string;
  hanja: string;
  stem: string;
  branch: string;
  stemElement: string;
  branchElement: string;
  animal?: string;
}

interface SajuChartProps {
  year: PillarData;
  month: PillarData;
  day: PillarData;
  hour: PillarData;
  elements: Record<string, number>;
  ilgan: string;
  ilganElement: string;
}

const ELEMENT_COLORS: Record<string, string> = {
  목: "#4a9e5a",
  화: "#d45050",
  토: "#c9a84c",
  금: "#b0b0b0",
  수: "#4a7ab5",
};

export default function SajuChart({ year, month, day, hour, elements, ilgan, ilganElement }: SajuChartProps) {
  const pillars = [
    { label: "시주", data: hour },
    { label: "일주", data: day },
    { label: "월주", data: month },
    { label: "년주", data: year },
  ];

  return (
    <div className="w-full max-w-[320px] mx-auto mb-5">
      {/* 사주 표 */}
      <div className="grid grid-cols-4 gap-1.5 mb-4">
        {/* 헤더 */}
        {pillars.map((p) => (
          <div key={p.label} className="text-center">
            <span className="text-foreground/30 text-[10px]">{p.label}</span>
          </div>
        ))}

        {/* 천간 */}
        {pillars.map((p) => (
          <div
            key={`stem-${p.label}`}
            className="text-center py-2.5 rounded-t-xl border border-b-0 border-gold/15 bg-purple-dark/20"
          >
            <span
              className="text-lg font-bold"
              style={{ color: ELEMENT_COLORS[p.data.stemElement] || "#c9a84c" }}
            >
              {p.data.stem}
            </span>
            <p className="text-[9px] text-foreground/30 mt-0.5">{p.data.stemElement}</p>
          </div>
        ))}

        {/* 지지 */}
        {pillars.map((p) => (
          <div
            key={`branch-${p.label}`}
            className="text-center py-2.5 rounded-b-xl border border-t-0 border-gold/15 bg-purple-dark/30"
          >
            <span
              className="text-lg font-bold"
              style={{ color: ELEMENT_COLORS[p.data.branchElement] || "#c9a84c" }}
            >
              {p.data.branch}
            </span>
            <p className="text-[9px] text-foreground/30 mt-0.5">
              {p.data.branchElement}{p.data.animal ? ` · ${p.data.animal}` : ""}
            </p>
          </div>
        ))}
      </div>

      {/* 일간 표시 */}
      <div className="text-center mb-3">
        <span className="text-foreground/30 text-[10px]">일간 (나 자신): </span>
        <span className="text-sm font-bold" style={{ color: ELEMENT_COLORS[ilganElement] || "#c9a84c" }}>
          {ilgan}
        </span>
        <span className="text-foreground/30 text-[10px] ml-1">({ilganElement})</span>
      </div>

      {/* 오행 분포 바 */}
      <div className="space-y-1.5">
        {Object.entries(elements).map(([element, count]) => {
          const max = Math.max(...Object.values(elements), 1);
          return (
            <div key={element} className="flex items-center gap-2">
              <span className="text-[10px] w-5 text-right" style={{ color: ELEMENT_COLORS[element] }}>
                {element}
              </span>
              <div className="flex-1 h-3 bg-purple-dark/20 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(count / max) * 100}%`,
                    backgroundColor: ELEMENT_COLORS[element],
                    opacity: 0.6,
                  }}
                />
              </div>
              <span className="text-[10px] text-foreground/30 w-3">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
