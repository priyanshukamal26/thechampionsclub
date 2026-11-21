"use client";

import React, { useMemo } from "react";
import { Trophy } from "lucide-react";

interface QRCodeProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  className?: string;
}

export default function QRCode({
  value,
  size = 180,
  fgColor = "#CCFF00",
  bgColor = "#0A0A0A",
  className = "",
}: QRCodeProps) {
  // Deterministic pseudo-random matrix generation from string value
  const { matrix, gridCount } = useMemo(() => {
    const grid = 21; // Standard Version 1 QR matrix is 21x21
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }

    const cells: boolean[][] = [];
    for (let r = 0; r < grid; r++) {
      cells[r] = [];
      for (let c = 0; c < grid; c++) {
        // Finder pattern top-left
        if (r < 7 && c < 7) {
          cells[r][c] = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
          continue;
        }
        // Finder pattern top-right
        if (r < 7 && c >= grid - 7) {
          const cc = c - (grid - 7);
          cells[r][c] = r === 0 || r === 6 || cc === 0 || cc === 6 || (r >= 2 && r <= 4 && cc >= 2 && cc <= 4);
          continue;
        }
        // Finder pattern bottom-left
        if (r >= grid - 7 && c < 7) {
          const rr = r - (grid - 7);
          cells[r][c] = rr === 0 || rr === 6 || c === 0 || c === 6 || (rr >= 2 && rr <= 4 && c >= 2 && c <= 4);
          continue;
        }
        // Center badge cutout
        if (r >= 9 && r <= 11 && c >= 9 && c <= 11) {
          cells[r][c] = false;
          continue;
        }
        // Timing patterns
        if (r === 6 || c === 6) {
          cells[r][c] = (r + c) % 2 === 0;
          continue;
        }
        // Data bits seeded deterministically
        const bitVal = Math.sin(hash + r * 31 + c * 17) * 10000;
        cells[r][c] = bitVal - Math.floor(bitVal) > 0.42;
      }
    }
    return { matrix: cells, gridCount: grid };
  }, [value]);

  const cellSize = size / gridCount;

  return (
    <div
      className={`relative inline-flex items-center justify-center p-3 rounded-2xl bg-[#0D0D0D] border border-[#222222] shadow-[0_0_25px_rgba(0,0,0,0.8)] ${className}`}
      style={{ width: size + 24, height: size + 24 }}
    >
      {/* Corner Crosshair scan brackets */}
      <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#CCFF00]" />
      <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#CCFF00]" />
      <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#CCFF00]" />
      <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#CCFF00]" />

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect width={size} height={size} fill={bgColor} rx={8} />
        {matrix.map((row, r) =>
          row.map((active, c) => {
            if (!active) return null;
            return (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize + 0.5}
                y={r * cellSize + 0.5}
                width={cellSize - 1}
                height={cellSize - 1}
                fill={fgColor}
                rx={1.5}
              />
            );
          })
        )}
      </svg>

      {/* Center Champions Badge */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-8 h-8 rounded-lg bg-[#0A0A0A] border border-[#CCFF00]/50 flex items-center justify-center text-[#CCFF00] shadow-[0_0_12px_rgba(204,255,0,0.5)]">
          <Trophy className="w-4 h-4 fill-current" />
        </div>
      </div>
    </div>
  );
}
