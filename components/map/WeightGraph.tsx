"use client";

import { useRef } from "react";

interface WeightGraphProps {
  mode: string;
  k: number;
  onKChange: (k: number) => void;
}

const X0 = 24,
  X1 = 216,
  Y0 = 82,
  Y1 = 8;
const VW = 240,
  VH = 100;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function toSVGX(t: number) {
  return X0 + t * (X1 - X0);
}
function toSVGY(w: number) {
  return Y0 + clamp(w, 0, 1) * (Y1 - Y0);
}

function computeWeight(mode: string, t: number, k: number): number {
  if (mode === "Lin") return Math.max(0, 1 - t);
  if (mode === "Inv") return k / (t + k);
  if (mode === "InvQuad") return k / (t * t + k);
  return 0;
}

function buildCurvePath(mode: string, k: number): string {
  let d = "";
  for (let i = 0; i <= 120; i++) {
    const t = i / 120;
    const x = toSVGX(t);
    const y = toSVGY(computeWeight(mode, t, k));
    d += i === 0 ? `M ${x},${y}` : ` L ${x},${y}`;
  }
  return d;
}

function halfT(mode: string, k: number): number {
  if (mode === "Inv") return clamp(k, 0, 1);
  if (mode === "InvQuad") return clamp(Math.sqrt(k), 0, 1);
  return 0;
}

export function WeightGraph({ mode, k, onKChange }: WeightGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const visible = mode !== "None";
  const hasHandle = mode === "Inv" || mode === "InvQuad";

  const curvePath = visible ? buildCurvePath(mode, k) : "";

  const ht = halfT(mode, k);
  const hx = toSVGX(ht);
  const hy = toSVGY(0.5);

  function getKFromPointer(e: React.PointerEvent): number {
    const svg = svgRef.current;
    if (!svg) return k;
    const rect = svg.getBoundingClientRect();
    const ratio = VW / rect.width;
    const svgX = (e.clientX - rect.left) * ratio;
    const t = clamp((svgX - X0) / (X1 - X0), 0.02, 0.98);
    const raw = mode === "Inv" ? t : t * t;
    return clamp(raw, 0.05, 2.0);
  }

  function onPointerDown(e: React.PointerEvent<SVGCircleElement>) {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<SVGCircleElement>) {
    if (!dragging.current) return;
    onKChange(getKFromPointer(e));
  }

  function onPointerUp() {
    dragging.current = false;
  }

  return (
    <div
      className="overflow-hidden transition-all duration-300 ease-in-out"
      style={{ maxHeight: visible ? "130px" : "0px", opacity: visible ? 1 : 0 }}
    >
      <div
        className="rounded-lg mx-1 mt-1 overflow-hidden"
        style={{ background: "#0d1117" }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VW} ${VH}`}
          className="w-full"
          style={{ height: "100px", display: "block" }}
          aria-label="Time weighting curve"
        >
          <defs>
            <pattern
              id="wg-dots"
              x="0"
              y="0"
              width="12"
              height="12"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="0.8" fill="#f59e0b" opacity="0.2" />
            </pattern>
            <clipPath id="wg-clip">
              <rect x={X0} y={Y1} width={X1 - X0} height={Y0 - Y1} />
            </clipPath>
          </defs>

          {/* Dot grid */}
          <rect
            x={X0}
            y={Y1}
            width={X1 - X0}
            height={Y0 - Y1}
            fill="url(#wg-dots)"
          />

          {/* Axes */}
          <line
            x1={X0}
            y1={Y1 - 2}
            x2={X0}
            y2={Y0}
            stroke="#f59e0b"
            strokeWidth={1}
            strokeOpacity={0.45}
            strokeLinecap="round"
          />
          <line
            x1={X0}
            y1={Y0}
            x2={X1 + 4}
            y2={Y0}
            stroke="#f59e0b"
            strokeWidth={1}
            strokeOpacity={0.45}
            strokeLinecap="round"
          />

          {/* Axis labels */}
          <text
            x={12}
            y={(Y0 + Y1) / 2}
            fontSize={7}
            fill="#f59e0b"
            fillOpacity={0.45}
            textAnchor="middle"
            transform={`rotate(-90,12,${(Y0 + Y1) / 2})`}
          >
            weight
          </text>
          <text
            x={X1 + 4}
            y={Y0 + 9}
            fontSize={7}
            fill="#f59e0b"
            fillOpacity={0.45}
            textAnchor="end"
          >
            Δt
          </text>

          {/* Curve */}
          {visible && (
            <path
              d={curvePath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              clipPath="url(#wg-clip)"
            />
          )}

          {/* Drag handle (Inv / InvQuad only) */}
          {hasHandle && (
            <>
              <line
                x1={hx}
                y1={hy + 6}
                x2={hx}
                y2={Y0}
                stroke="#f59e0b"
                strokeWidth={1}
                strokeDasharray="3,2"
                opacity={0.35}
              />
              <circle
                cx={hx}
                cy={hy}
                r={5}
                fill="#f59e0b"
                stroke="#0d1117"
                strokeWidth={1.5}
                style={{ cursor: "ew-resize" }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              />
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
