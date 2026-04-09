'use client';

/**
 * 六角雷達圖 — 展示六個維度的 0-5 分評分
 * 純 SVG，無第三方依賴
 */

type Props = {
  values: number[];      // length 6, each 0–5
  labels: string[];      // length 6
  size?: number;         // px
  color?: string;        // accent color
  textColor?: string;
  gridColor?: string;
  labelFont?: string;
};

export default function HexRadar({
  values,
  labels,
  size = 280,
  color = '#C75B12',
  textColor = '#3E2723',
  gridColor = '#E8DED0',
  labelFont = '"Zen Maru Gothic", "Noto Sans TC", sans-serif',
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.32;
  const labelRadius = radius + 22;
  const maxScore = 5;

  // 6 angles, start from top (-90°), every 60°
  const angle = (i: number) => (-Math.PI / 2) + (i * Math.PI * 2) / 6;

  const pointOnCircle = (i: number, r: number) => ({
    x: cx + Math.cos(angle(i)) * r,
    y: cy + Math.sin(angle(i)) * r,
  });

  // Concentric grid rings
  const rings = [1, 2, 3, 4, 5].map((level) => {
    const r = (radius * level) / maxScore;
    const pts = Array.from({ length: 6 }, (_, i) => {
      const p = pointOnCircle(i, r);
      return `${p.x},${p.y}`;
    }).join(' ');
    return { level, pts };
  });

  // Axes
  const axes = Array.from({ length: 6 }, (_, i) => pointOnCircle(i, radius));

  // Value polygon
  const valuePts = values
    .map((v, i) => {
      const clamped = Math.max(0, Math.min(maxScore, v));
      const r = (radius * clamped) / maxScore;
      const p = pointOnCircle(i, r);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  const labelPoints = Array.from({ length: 6 }, (_, i) => pointOnCircle(i, labelRadius));

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid rings */}
      {rings.map((r) => (
        <polygon
          key={r.level}
          points={r.pts}
          fill="none"
          stroke={gridColor}
          strokeWidth={r.level === 5 ? 1.5 : 1}
          opacity={r.level === 5 ? 0.9 : 0.5}
        />
      ))}

      {/* Axes */}
      {axes.map((p, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={p.x}
          y2={p.y}
          stroke={gridColor}
          strokeWidth={1}
          opacity={0.5}
        />
      ))}

      {/* Value polygon */}
      <polygon points={valuePts} fill={color} fillOpacity={0.22} stroke={color} strokeWidth={2} strokeLinejoin="round" />

      {/* Value dots */}
      {values.map((v, i) => {
        const clamped = Math.max(0, Math.min(maxScore, v));
        const r = (radius * clamped) / maxScore;
        const p = pointOnCircle(i, r);
        return <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} />;
      })}

      {/* Labels */}
      {labels.map((label, i) => {
        const p = labelPoints[i];
        const isTop = i === 0;
        const isBottom = i === 3;
        const anchor = isTop || isBottom ? 'middle' : p.x > cx ? 'start' : 'end';
        return (
          <g key={i}>
            <text
              x={p.x}
              y={p.y}
              fontFamily={labelFont}
              fontSize={13}
              fontWeight={500}
              fill={textColor}
              textAnchor={anchor}
              dominantBaseline="middle"
            >
              {label}
            </text>
            <text
              x={p.x}
              y={p.y + 14}
              fontFamily={labelFont}
              fontSize={11}
              fill={color}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontWeight={600}
            >
              {values[i].toFixed(1)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
