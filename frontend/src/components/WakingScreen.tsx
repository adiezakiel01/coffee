"use client";

import { useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const STAGES = [
  { at: 0, label: "Grinding the beans" },
  { at: 15, label: "Boiling water" },
  { at: 30, label: "Blooming the grounds" },
  { at: 45, label: "Almost ready" },
];

const SLOW_THRESHOLD_SECONDS = 60;

export default function WakingScreen({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAwake, setIsAwake] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    let cancelled = false;
    let pollTimeout: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
        if (!cancelled && res.ok) {
          setIsAwake(true);
          return;
        }
      } catch {
        // backend still asleep or unreachable, keep polling
      }
      if (!cancelled) {
        pollTimeout = setTimeout(poll, 2500);
      }
    }

    poll();

    const tick = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);

    return () => {
      cancelled = true;
      clearTimeout(pollTimeout);
      clearInterval(tick);
    };
  }, []);

  if (isAwake) return <>{children}</>;

  const stage = [...STAGES].reverse().find((s) => elapsed >= s.at) ?? STAGES[0];
  const isSlow = elapsed >= SLOW_THRESHOLD_SECONDS;
  const fillPercent = Math.min(15 + (elapsed / 50) * 70, 85);

  return (
    <div
      style={{
        background: "#2b2420",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        padding: "2rem",
      }}
    >
      <svg
        width="88"
        height="88"
        viewBox="0 0 88 88"
        fill="none"
        style={{ marginBottom: "1.5rem" }}
      >
        <defs>
          <clipPath id="cupInterior">
            {/* interior of the cup only, inset from the outline so the fill sits inside the walls */}
            <path d="M20 34 L23.5 66 a10 10 0 0 0 10 8.5 h9 a10 10 0 0 0 10-8.5 L56 34 Z" />
          </clipPath>
        </defs>

        {/* coffee fill, clipped to cup interior, animates upward */}
        <g clipPath="url(#cupInterior)">
          <rect
            x="18"
            width="52"
            fill="#8b5a2b"
            style={{ transition: "y 1.2s ease, height 1.2s ease" }}
            y={74 - (fillPercent / 100) * 40}
            height={(fillPercent / 100) * 40}
          />
          <ellipse
            cx="44"
            fill="#d4a574"
            rx="18"
            ry="2.5"
            style={{ transition: "cy 1.2s ease" }}
            cy={74 - (fillPercent / 100) * 40}
          />
        </g>

        {/* cup outline, drawn on top so the fill never overlaps the walls */}
        <path
          d="M18 32h44l-3.2 34.5A12 12 0 0 1 46.9 77h-9.8a12 12 0 0 1-11.9-10.5L18 32z"
          stroke="#c89666"
          strokeWidth="2.5"
        />
        <path d="M18 32h44" stroke="#c89666" strokeWidth="2.5" />
        <path
          d="M62 36c7 0 12 4 12 10s-5 10-12 10"
          stroke="#c89666"
          strokeWidth="2.5"
        />

        {/* steam wisps */}
        <g
          stroke="#8b5a2b"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.7"
        >
          <path d="M28 20c0 3.5-3.5 3.5-3.5 7s3.5 3.5 3.5 7">
            <animate
              attributeName="opacity"
              values="0;0.7;0"
              dur="2.6s"
              repeatCount="indefinite"
            />
          </path>
          <path d="M40 17c0 3.5-3.5 3.5-3.5 7s3.5 3.5 3.5 7">
            <animate
              attributeName="opacity"
              values="0;0.7;0"
              dur="2.6s"
              begin="0.5s"
              repeatCount="indefinite"
            />
          </path>
          <path d="M52 20c0 3.5-3.5 3.5-3.5 7s3.5 3.5 3.5 7">
            <animate
              attributeName="opacity"
              values="0;0.7;0"
              dur="2.6s"
              begin="1s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </svg>

      <p
        style={{
          color: "#f5efe6",
          fontSize: 16,
          fontWeight: 500,
          margin: "0 0 8px",
        }}
      >
        {isSlow ? "Taking longer than usual" : stage.label}
      </p>
      <p
        style={{
          color: "#c4b8aa",
          fontSize: 13,
          margin: "0 0 20px",
          textAlign: "center",
          maxWidth: 280,
        }}
      >
        {isSlow
          ? "Render may be having a slow start. Still trying to connect."
          : "Waking the server, this can take up to a minute."}
      </p>

      <div
        style={{
          width: 200,
          height: 4,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.min((elapsed / 50) * 100, 90)}%`,
            height: "100%",
            background: "#c89666",
            borderRadius: 4,
            transition: "width 1s linear",
          }}
        />
      </div>
    </div>
  );
}
