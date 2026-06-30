"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";

interface WheelPickerProps {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

const ITEM_HEIGHT = 32;
const VISIBLE_ITEMS = 3;
const CENTER_PADDING = Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT;

export default function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit = "",
}: WheelPickerProps) {
  const values = useMemo(() => {
    const result: number[] = [];
    for (let v = min; v <= max + 1e-9; v = Math.round((v + step) * 100) / 100) {
      result.push(Math.round(v * 100) / 100);
    }
    return result;
  }, [min, max, step]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const scrollStartOffset = useRef(0);

  const initialIndex =
    value !== undefined ? values.indexOf(value) : Math.floor(values.length / 2);
  const [currentIndex, setCurrentIndex] = useState(
    initialIndex >= 0 ? initialIndex : 0,
  );
  const [translateY, setTranslateY] = useState(-currentIndex * ITEM_HEIGHT);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (value === undefined) return;
    const idx = values.indexOf(value);
    if (idx >= 0 && idx !== currentIndex) {
      setCurrentIndex(idx);
      setTranslateY(-idx * ITEM_HEIGHT);
    }
  }, [value, values, currentIndex]);

  const togglePicker = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setIsDragging(true);
      dragStartY.current = e.clientY;
      scrollStartOffset.current = translateY;
    },
    [translateY],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const deltaY = e.clientY - dragStartY.current;
      setTranslateY(scrollStartOffset.current + deltaY);
    },
    [isDragging],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setIsDragging(false);

      const rawIndex = Math.round(-translateY / ITEM_HEIGHT);
      const clampedIndex = Math.min(values.length - 1, Math.max(0, rawIndex));

      setCurrentIndex(clampedIndex);
      setTranslateY(-clampedIndex * ITEM_HEIGHT);
      onChange(values[clampedIndex]);
    },
    [translateY, values, onChange],
  );

  const windowHeight = ITEM_HEIGHT * VISIBLE_ITEMS;
  const displayValue = value !== undefined ? `${value}${unit}` : "—";

  return (
    <div ref={wrapperRef} className="relative">
      <label className="text-xs text-card-ink-muted block mb-1">{label}</label>

      <div
        onClick={togglePicker}
        className="flex items-center justify-between h-9 px-3 rounded-lg bg-white border border-card-ink-muted/20 cursor-pointer"
      >
        <span className="font-mono text-sm text-card-ink">{displayValue}</span>
        <span className="text-card-ink-muted text-xs">
          {isOpen ? "▲" : "▼"}
        </span>
      </div>

      {isOpen && (
        <div
          ref={wheelRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="absolute top-full left-0 right-0 mt-1 overflow-hidden rounded-lg bg-white border border-accent-strong/40 select-none cursor-grab active:cursor-grabbing z-20 shadow-lg"
          style={{ height: windowHeight, touchAction: "none" }}
        >
          <div
            className="absolute left-0 right-0 bg-accent/10 border-y border-accent-strong/30 pointer-events-none z-10"
            style={{ top: CENTER_PADDING, height: ITEM_HEIGHT }}
          />
          <div
            className={isDragging ? "" : "transition-transform duration-150"}
            style={{
              transform: `translateY(${translateY + CENTER_PADDING}px)`,
            }}
          >
            {values.map((v, i) => (
              <div
                key={v}
                className="flex items-center justify-center font-mono text-sm"
                style={{
                  height: ITEM_HEIGHT,
                  color: i === currentIndex ? "#3d2a1f" : "#a89888",
                  fontWeight: i === currentIndex ? 600 : 400,
                }}
              >
                {v}
                {unit}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
