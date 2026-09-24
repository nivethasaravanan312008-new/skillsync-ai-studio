/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TrendingUp, Calendar, Info } from 'lucide-react';
import { JobDemandTimePoint } from '../../types/dataModel.ts';

interface DemandOverTimeChartProps {
  data: JobDemandTimePoint[];
}

export const DemandOverTimeChart: React.FC<DemandOverTimeChartProps> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
        No posting timeline data for selected filters.
      </div>
    );
  }

  const maxOpenings = Math.max(...data.map(d => d.openingsCount), 10);
  const totalOpeningsInPeriod = data.reduce((s, d) => s + d.openingsCount, 0);
  const totalPostingsInPeriod = data.reduce((s, d) => s + d.postingsCount, 0);

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  // Compute coordinates for line/area
  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * chartW;
    const y = paddingY + chartH - (d.openingsCount / maxOpenings) * chartH;
    return { x, y, data: d };
  });

  const pathD = points.length > 0
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${paddingY + chartH} L ${points[0].x} ${paddingY + chartH} Z`
    : '';

  const hoveredPoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Job Demand Trajectory Over Time
            </h3>
            <span className="bg-blue-950 text-blue-300 text-[10px] px-2 py-0.5 rounded border border-blue-800 font-mono">
              Live Aggregate
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological aggregation of industry hiring requisitions & openings
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-blue-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span>
            <span>{totalOpeningsInPeriod.toLocaleString()} Openings</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
            <span>{totalPostingsInPeriod} Postings</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-56 select-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingY + chartH * ratio;
            const val = Math.round(maxOpenings * (1 - ratio));
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={paddingX + chartW}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="3 3"
                  strokeWidth="0.8"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#blueGradient)" />

          {/* Line Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, i) => (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === i ? 6 : 4}
                fill={hoveredIdx === i ? '#60a5fa' : '#1e3a8a'}
                stroke="#93c5fd"
                strokeWidth={hoveredIdx === i ? 2.5 : 1.5}
                className="transition-all duration-150"
              />
              {/* Invisible touch target */}
              <circle cx={p.x} cy={p.y} r={16} fill="transparent" />
            </g>
          ))}

          {/* X Axis Labels */}
          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={svgHeight - 8}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="10"
              fontWeight="500"
            >
              {p.data.periodLabel}
            </text>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute top-2 right-4 bg-slate-900/95 border border-blue-500/50 rounded-lg p-2.5 shadow-2xl pointer-events-none text-xs z-20 backdrop-blur"
          >
            <div className="font-semibold text-white flex items-center gap-1">
              <Calendar className="w-3 h-3 text-blue-400" />
              {hoveredPoint.data.periodLabel}
            </div>
            <div className="mt-1 space-y-0.5 text-slate-300 font-mono text-[11px]">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Openings:</span>
                <span className="text-blue-400 font-bold">{hoveredPoint.data.openingsCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Postings:</span>
                <span className="text-slate-200">{hoveredPoint.data.postingsCount}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Avg Entry Salary:</span>
                <span className="text-emerald-400">
                  ₹{(((hoveredPoint.data.avgSalaryMin || hoveredPoint.data.averageSalaryINR || 0)) / 100000).toFixed(1)} LPA
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3" />
          Hover data points to inspect detailed volume and compensation
        </span>
        <span>Frequency: Weekly Rollup</span>
      </div>
    </div>
  );
};
