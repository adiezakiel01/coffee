"use client";

interface SliderInputProps {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

export default function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
}: SliderInputProps) {
  const sliderValue = value ?? (min + max) / 2;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-card-ink-muted">{label}</label>
        <span className="text-xs font-mono text-accent-strong">
          {value !== undefined ? `${value}${unit ?? ""}` : "—"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={sliderValue}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-accent-strong"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value ?? ""}
          onChange={(e) =>
            onChange(e.target.value ? Number(e.target.value) : undefined)
          }
          className="w-16 rounded-lg px-2 py-1 text-xs bg-white text-card-ink border border-card-ink-muted/20"
        />
      </div>
    </div>
  );
}
