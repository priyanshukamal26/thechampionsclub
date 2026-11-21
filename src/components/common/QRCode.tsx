"use client";

import { useMemo } from "react";

/**
 * Offline-friendly procedural pass pattern.
 * Deterministic from the member code, so the same pass renders on every device
 * with zero network access. The demo build has no camera scanner; the front desk
 * identifies members by code, phone or email.
 */
export default function QRCode({
  value,
  size = 180,
  fgColor = "#17150f",
  bgColor = "#fbf7ee",
  className = "",
}: {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  className?: string;
}) {
  const { matrix, grid } = useMemo(() => {
    const gridCount = 25;
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const rand = (seed: number) => {
      let t = (seed + 0x6d2b79f5) >>> 0;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const cells: boolean[][] = [];
    for (let r = 0; r < gridCount; r += 1) {
      cells[r] = [];
      for (let c = 0; c < gridCount; c += 1) {
        const finder =
          (r < 7 && c < 7) || (r < 7 && c >= gridCount - 7) || (r >= gridCount - 7 && c < 7);
        if (finder) {
          const rr = r < 7 ? r : r - (gridCount - 7);
          const cc = c < 7 ? c : c - (gridCount - 7);
          cells[r][c] =
            rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4);
          continue;
        }
        if (r === 6 || c === 6) {
          cells[r][c] = (r + c) % 2 === 0;
          continue;
        }
        if (r >= 11 && r <= 13 && c >= 11 && c <= 13) {
          cells[r][c] = false;
          continue;
        }
        cells[r][c] = rand(hash + r * 131 + c * 197) > 0.5;
      }
    }
    return { matrix: cells, grid: gridCount };
  }, [value]);

  const cell = size / grid;
  const quiet = 4;
  const total = size + quiet * 2;

  return (
    <svg
      viewBox={`0 0 ${total} ${total}`}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Membership pass pattern for ${value}`}
      shapeRendering="crispEdges"
    >
      <rect width={total} height={total} fill={bgColor} />
      <g transform={`translate(${quiet},${quiet})`}>
        {matrix.map((row, r) =>
          row.map((active, c) =>
            active ? (
              <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill={fgColor} />
            ) : null
          )
        )}
        <rect
          x={11 * cell}
          y={11 * cell}
          width={3 * cell}
          height={3 * cell}
          fill="#c4502b"
          rx={cell * 0.2}
        />
      </g>
    </svg>
  );
}
