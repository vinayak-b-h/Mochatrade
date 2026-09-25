"use client";

type Point = { t: number; totalFlow: number };

export default function LineChart({ data }: { data: Point[] }) {
  if (data.length < 2) {
    return <div className="text-xs text-[#94A0AD] h-36 flex items-center">Collecting live data…</div>;
  }

  const width = 600;
  const height = 140;
  const pad = 12;
  const values = data.map((d) => d.totalFlow);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = height - pad - ((d.totalFlow - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  });

  const path = `M${points.join(" L")}`;
  const areaPath = `${path} L${width - pad},${height - pad} L${pad},${height - pad} Z`;
  const last = points[points.length - 1].split(",");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36">
      <defs>
        <linearGradient id="flowGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A9723F" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#A9723F" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#flowGradient)" stroke="none" />
      <path d={path} fill="none" stroke="#A9723F" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill="#A9723F" />
    </svg>
  );
}
