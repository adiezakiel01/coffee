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
}
