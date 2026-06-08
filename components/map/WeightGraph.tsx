"use client";

import { useEffect, useRef, useState } from "react";

interface WeightGraphProps {
  mode: string;
  k: number;
  onKChange: (k: number) => void;
  histBins?: number[];
  flipped?: boolean;
  onFlipToggle?: () => void;
}

// X0/X1/Y0/Y1 snap to the dot grid (dots at multiples of 12, offset 6)
// dots at x: 6,18,30,42,54,...,210  y: 6,18,30,...,102
const X0 = 42,
  X1 = 210,
  Y0 = 102,
  Y1 = 18;

// Consistent gap between the x-axis line, the range labels, and the chart border —
// keeping both offsets equal to LABEL_PAD gives the labels even breathing room.
const LABEL_PAD = 14;
const LABEL_Y = Y0 + LABEL_PAD;
// VW = X0 + X1 gives the plot rectangle equal left/right margins, centering
// the chart inside the viewBox.
const VW = X0 + X1,
  VH = LABEL_Y + LABEL_PAD;

const PW = 8,
  PH = 20;

const AXIS = "#64748b";
const LABEL = "#94a3b8";

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

export function WeightGraph({
  mode,
  k,
  onKChange,
  histBins,
  flipped = false,
  onFlipToggle = () => {}
}: WeightGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const pendingK = useRef(k);

  // localK drives the visual; onKChange fires only on pointer-up
  const [localK, setLocalK] = useState(k);

  useEffect(() => {
    if (!dragging.current) {
      setLocalK(k);
      pendingK.current = k;
    }
  }, [k]);

  const visible = mode !== "None";
  const hasHandle = mode === "Inv" || mode === "InvQuad";

  const curvePath = visible ? buildCurvePath(mode, localK) : "";
  const ht = halfT(mode, localK);
  const hx = toSVGX(ht);
  const hy = toSVGY(0.5);

  function getKFromPointer(e: React.PointerEvent): number {
    const svg = svgRef.current;
    if (!svg) return localK;
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
    const newK = getKFromPointer(e);
    setLocalK(newK);
    pendingK.current = newK;
  }

  function onPointerUp() {
    dragging.current = false;
    onKChange(pendingK.current);
  }

  const midY = (Y0 + Y1) / 2;

  return (
    // CSS grid-row trick: collapses cleanly to zero with no gap
    <div
      style={{
        display: "grid",
        gridTemplateRows: visible ? "1fr" : "0fr",
        transition: "grid-template-rows 300ms ease"
      }}
    >
      <div style={{ overflow: "hidden", minHeight: 0 }}>
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
              {/* Small open-chevron arrowhead */}
              <marker
                id="wg-arrow"
                markerWidth="5"
                markerHeight="5"
                refX="4"
                refY="2.5"
                orient="auto"
              >
                <path
                  d="M0.5,0.5 L4,2.5 L0.5,4.5"
                  fill="none"
                  stroke={AXIS}
                  strokeWidth="1"
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
              stroke={AXIS}
              strokeWidth={1.5}
              strokeLinecap="round"
            />

            {/* X axis with arrow */}
            <line
              x1={X0}
              y1={Y0}
              x2={X1 + 8}
              y2={Y0}
              stroke={AXIS}
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
              stroke={AXIS}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <line
              x1={X0 - 4}
              y1={Y0}
              x2={X0}
              y2={Y0}
              stroke={AXIS}
              strokeWidth={1.5}
              strokeLinecap="round"
            />

            {/* Y-axis "weight" label — snug to the axis */}
            <text
              x={26}
              y={midY}
              fontSize={9}
              fill={LABEL}
              textAnchor="middle"
              transform={`rotate(-90,26,${midY})`}
            >
              WEIGHT
            </text>

            {/* Y-axis tick values */}
            <text
              x={X0 - 7}
              y={Y1 + 4}
              fontSize={8}
              fill={LABEL}
              textAnchor="end"
              dominantBaseline="middle"
            >
              1
            </text>
            <text
              x={X0 - 7}
              y={Y0}
              fontSize={8}
              fill={LABEL}
              textAnchor="end"
              dominantBaseline="middle"
            >
              0
            </text>

            {/* X-axis range labels — reflect the selected date range's actual ends */}
            <text
              x={X0}
              y={LABEL_Y}
              fontSize={9}
              fill={LABEL}
              textAnchor="start"
              dominantBaseline="middle"
            >
              {flipped ? "START" : "END"}
            </text>
            <text
              x={X1 + 8}
              y={LABEL_Y}
              fontSize={9}
              fill={LABEL}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {flipped ? "END" : "START"}
            </text>

            {/* Flip-direction button — placeholder glyph, exact design TBD */}
            <g
              role="button"
              aria-label="Flip weighting direction"
              onClick={onFlipToggle}
              style={{ cursor: "pointer" }}
            >
              <text
                x={(X0 + X1) / 2}
                y={LABEL_Y}
                fontSize={14}
                fill={LABEL}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                ⇄
              </text>
            </g>

            {/* Time-delta histogram — dim bars behind the curve */}
            {histBins && histBins.length > 0 && (
              <g clipPath="url(#wg-clip)">
                {histBins.map((v, i) => {
                  const bw = (X1 - X0) / histBins.length;
                  const bh = v * (Y0 - Y1);
                  return (
                    <rect
                      key={i}
                      x={X0 + i * bw}
                      y={Y0 - bh}
                      width={bw - 1}
                      height={bh}
                      fill="#3b82f6"
                      opacity={0.2}
                    />
                  );
                })}
              </g>
            )}

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
                <line
                  x1={hx}
                  y1={Y1 - 4}
                  x2={hx}
                  y2={hy - PH / 2 - 2}
                  stroke={AXIS}
                  strokeWidth={1}
                  strokeDasharray="3,2"
                  opacity={0.5}
                />
                <line
                  x1={hx}
                  y1={hy + PH / 2 + 2}
                  x2={hx}
                  y2={Y0}
                  stroke={AXIS}
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
    </div>
  );
}
