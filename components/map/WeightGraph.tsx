"use client";

import { useRef } from "react";

interface WeightGraphProps {
  mode: string;
  k: number;
  onKChange: (k: number) => void;
}

const X0 = 36,
  X1 = 218,
  Y0 = 100,
  Y1 = 14;
const VW = 240,
  VH = 118;

const PW = 8,
  PH = 20;

const AXIS_COLOR = "#64748b";
const LABEL_COLOR = "#94a3b8";

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

  function onPointerDown(e: React.PointerEvent<SVGRectElement>) {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<SVGRectElement>) {
    if (!dragging.current) return;
    onKChange(getKFromPointer(e));
  }

  function onPointerUp() {
    dragging.current = false;
  }

  return (
    <div
      className="overflow-hidden transition-all duration-300 ease-in-out"
      style={{ maxHeight: visible ? "160px" : "0px", opacity: visible ? 1 : 0 }}
    >
      <div
        className="rounded-lg mx-1 mt-1 overflow-hidden"
        style={{ background: "#111827" }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VW} ${VH}`}
          className="w-full"
          style={{ height: "140px", display: "block" }}
          aria-label="Time weighting curve"
        >
          <defs>
            {/* Dot centered in each 12×12 tile */}
            <pattern
              id="wg-dots"
              x="0"
              y="0"
              width="12"
              height="12"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="6" cy="6" r="0.85" fill="#94a3b8" opacity="0.22" />
            </pattern>
            {/* Open chevron arrowhead for x-axis */}
            <marker
              id="wg-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3.5"
              orient="auto"
            >
              <path
                d="M1,1 L6,3.5 L1,6"
                fill="none"
                stroke={AXIS_COLOR}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </marker>
            <clipPath id="wg-clip">
              <rect x={X0} y={Y1 - 4} width={X1 - X0} height={Y0 - Y1 + 4} />
            </clipPath>
          </defs>

          {/* Full-area dot grid */}
          <rect x={0} y={0} width={VW} height={VH} fill="url(#wg-dots)" />

          {/* Y axis */}
          <line
            x1={X0}
            y1={Y1 - 6}
            x2={X0}
            y2={Y0}
            stroke={AXIS_COLOR}
            strokeWidth={1.5}
            strokeLinecap="round"
          />

          {/* X axis with arrowhead */}
          <line
            x1={X0}
            y1={Y0}
            x2={X1 + 10}
            y2={Y0}
            stroke={AXIS_COLOR}
            strokeWidth={1.5}
            strokeLinecap="round"
            markerEnd="url(#wg-arrow)"
          />

          {/* Y-axis ticks */}
          <line
            x1={X0 - 4}
            y1={Y1}
            x2={X0}
            y2={Y1}
            stroke={AXIS_COLOR}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <line
            x1={X0 - 4}
            y1={Y0}
            x2={X0}
            y2={Y0}
            stroke={AXIS_COLOR}
            strokeWidth={1.5}
            strokeLinecap="round"
          />

          {/* Y-axis label (rotated) */}
          <text
            x={9}
            y={(Y0 + Y1) / 2}
            fontSize={9}
            fill={LABEL_COLOR}
            textAnchor="middle"
            transform={`rotate(-90,9,${(Y0 + Y1) / 2})`}
          >
            weight
          </text>

          {/* Y-axis tick values */}
          <text
            x={X0 - 7}
            y={Y1 + 4}
            fontSize={8}
            fill={LABEL_COLOR}
            textAnchor="end"
            dominantBaseline="middle"
          >
            1
          </text>
          <text
            x={X0 - 7}
            y={Y0}
            fontSize={8}
            fill={LABEL_COLOR}
            textAnchor="end"
            dominantBaseline="middle"
          >
            0
          </text>

          {/* X-axis label */}
          <text
            x={X1 + 14}
            y={Y0 + 11}
            fontSize={9}
            fill={LABEL_COLOR}
            textAnchor="end"
          >
            Δt
          </text>

          {/* Curve */}
          {visible && (
            <path
              d={curvePath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              clipPath="url(#wg-clip)"
            />
          )}

          {/* Drag handle pill (Inv / InvQuad only) */}
          {hasHandle && (
            <>
              {/* line above handle */}
              <line
                x1={hx}
                y1={Y1 - 4}
                x2={hx}
                y2={hy - PH / 2 - 2}
                stroke={AXIS_COLOR}
                strokeWidth={1}
                strokeDasharray="3,2"
                opacity={0.5}
              />
              {/* line below handle */}
              <line
                x1={hx}
                y1={hy + PH / 2 + 2}
                x2={hx}
                y2={Y0}
                stroke={AXIS_COLOR}
                strokeWidth={1}
                strokeDasharray="3,2"
                opacity={0.5}
              />
              <rect
                x={hx - PW / 2}
                y={hy - PH / 2}
                width={PW}
                height={PH}
                rx={PW / 2}
                fill="#1e293b"
                stroke="#3b82f6"
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
