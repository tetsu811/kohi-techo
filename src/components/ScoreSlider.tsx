'use client';

import { getColors, Theme, FONT } from '@/lib/theme';

type Props = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  theme?: Theme;
  hint?: string;
};

export default function ScoreSlider({ label, value, onChange, theme = 'light', hint }: Props) {
  const c = getColors(theme);

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontFamily: FONT.cute, fontSize: 15, color: c.text, fontWeight: 500 }}>
          {label}
          {hint && <span style={{ fontSize: 11, color: c.textMuted, marginLeft: 8, fontWeight: 400 }}>{hint}</span>}
        </span>
        <span
          style={{
            fontFamily: FONT.serif,
            fontSize: 18,
            color: c.accent,
            fontWeight: 600,
            minWidth: 36,
            textAlign: 'right',
          }}
        >
          {value.toFixed(1)}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={5}
        step={0.5}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          accentColor: c.accent,
          cursor: 'pointer',
        }}
      />
    </div>
  );
}
