"use client";

import { useRef, useState, useCallback } from "react";

interface ScrubInputProps {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  sensitivity?: number;
}

export default function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  sensitivity = 4,
}: ScrubInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartValue = useRef(0);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      setIsDragging(true);
      dragStartY.current = e.clientY;
      dragStartValue.current = value ?? (min + max) / 2;
    },
    [value, min, max],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;

      const deltaY = dragStartY.current - e.clientY;
      const deltaSteps = Math.round(deltaY / sensitivity);
      const rawValue = dragStartValue.current + deltaSteps * step;

      const clamped = Math.min(max, Math.max(min, rawValue));
      const rounded = Math.round(clamped / step) * step;

      onChange(rounded);
    },
    [isDragging, sensitivity, step, min, max, onChange],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setIsDragging(false);
  }, []);

  const displayValue = value !== undefined ? value : "-";

  return (
    <div>
      <label className="text-xs text-card-ink-muted block mb-1">{label}</label>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`select-none cursor-ns-resize rounded-lg px-3 py-2 bg-white border transition-colors ${
          isDragging
            ? "border-accent-strong ring-1 ring-accent-strong/40"
            : "border-card-ink-muted/20"
        }`}
        style={{ touchAction: "none" }}
      >
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-base text-card-ink">
            {displayValue}
            <span className="text-xs text-card-ink-muted">{unit}</span>
          </span>
          <span className="text-card-ink-muted text-xs">↕</span>
        </div>
      </div>
    </div>
  );
}
