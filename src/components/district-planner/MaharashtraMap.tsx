/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { DistrictOverviewItem } from '../../types/dataModel.ts';
import { MapPin, ArrowRight, AlertTriangle, Users, Building2, TrendingUp, Info } from 'lucide-react';

interface MaharashtraMapProps {
  districts: DistrictOverviewItem[];
  selectedDistrictId: string | null;
  onSelectDistrict: (districtId: string) => void;
}

// Relative SVG Coordinates calibrated for Maharashtra's geographic shape (viewBox: 0 0 800 550)
// Longitude range ~72.6°E to ~80.2°E -> X mapped ~60 to ~740
// Latitude range ~15.8°N to ~22.0°N -> Y mapped ~500 (South) to ~60 (North)
const DISTRICT_GEO_POSITIONS: Record<string, { x: number; y: number; labelPos: 'top' | 'bottom' | 'left' | 'right' }> = {
  'dist-mumbai': { x: 105, y: 265, labelPos: 'left' },
  'dist-navimumbai': { x: 135, y: 280, labelPos: 'bottom' },
  'dist-thane': { x: 125, y: 235, labelPos: 'left' },
  'dist-nashik': { x: 210, y: 175, labelPos: 'top' },
  'dist-pune': { x: 225, y: 320, labelPos: 'bottom' },
  'dist-satara': { x: 235, y: 405, labelPos: 'left' },
  'dist-kolhapur': { x: 260, y: 475, labelPos: 'bottom' },
  'dist-aurangabad': { x: 370, y: 215, labelPos: 'top' },
  'dist-solapur': { x: 410, y: 410, labelPos: 'right' },
  'dist-nagpur': { x: 680, y: 110, labelPos: 'top' }
};

export function MaharashtraMap({ districts, selectedDistrictId, onSelectDistrict }: MaharashtraMapProps) {
  const [hoveredDistrictId, setHoveredDistrictId] = useState<string | null>(null);

  const hoveredDistrict = districts.find(d => d.districtId === (hoveredDistrictId || selectedDistrictId));

  // Determine color based on capacity deficit & demand pressure
  const getDistrictColor = (d: DistrictOverviewItem) => {
    if (d.capacityDeficit > 250) {
      return {
        fill: 'rgba(239, 68, 68, 0.25)',
        stroke: '#ef4444',
        text: 'text-red-400',
        badge: 'bg-red-950/80 text-red-300 border-red-800/80',
        label: 'Severe Deficit'
      };
    }
    if (d.capacityDeficit > 100) {
      return {
        fill: 'rgba(245, 158, 11, 0.25)',
        stroke: '#f59e0b',
        text: 'text-amber-400',
        badge: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
        label: 'Moderate Gap'
      };
    }
    return {
      fill: 'rgba(14, 165, 233, 0.25)',
      stroke: '#0ea5e9',
      text: 'text-sky-400',
      badge: 'bg-sky-950/80 text-sky-300 border-sky-800/80',
      label: 'Balanced'
    };
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white tracking-tight">
              Maharashtra Geographic Training Deficit Map
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              (Interactive GIS Node View)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Click on any district hub to inspect local training capacity, industry job vacancies, and faculty recommendations.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></span>
            <span className="text-slate-300">Severe Deficit (&gt;250 seats)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span>
            <span className="text-slate-300">Moderate Gap (&gt;100 seats)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-sky-500 shadow-sm shadow-sky-500/50"></span>
            <span className="text-slate-300">Balanced Capacity</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Map Canvas */}
        <div className="lg:col-span-8 relative bg-slate-900/60 rounded-xl border border-slate-800/80 p-2 flex items-center justify-center min-h-[380px]">
          <svg
            viewBox="0 0 800 550"
            className="w-full h-auto max-h-[440px] select-none"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}
          >
            <defs>
              <linearGradient id="maharashtraBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
              </linearGradient>
              <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148, 163, 184, 0.05)" strokeWidth="1" />
              </pattern>
            </defs>

            {/* Background Grid */}
            <rect width="800" height="550" fill="url(#gridPattern)" />

            {/* Stylized Maharashtra State Boundary Polygon */}
            <path
              d="M 80,240 
                 L 110,210 
                 L 160,160 
                 L 220,130 
                 L 280,120 
                 L 350,110 
                 L 430,90 
                 L 520,70 
                 L 640,60 
                 L 730,70 
                 L 760,110 
                 L 750,160 
                 L 710,210 
                 L 660,250 
                 L 600,280 
                 L 540,320 
                 L 470,360 
                 L 440,430 
                 L 380,470 
                 L 310,500 
                 L 250,520 
                 L 230,480 
                 L 210,430 
                 L 190,380 
                 L 160,340 
                 L 120,310 
                 L 80,290 
                 Z"
              fill="url(#maharashtraBgGradient)"
              stroke="#334155"
              strokeWidth="2.5"
              strokeDasharray="4 2"
              className="transition-colors duration-300"
            />

            {/* Inter-District Economic Corridor Connections */}
            <g stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1.5" strokeDasharray="3 3">
              {/* Mumbai - Pune Expressway */}
              <line x1="105" y1="265" x2="225" y2="320" />
              {/* Pune - Nashik Triangle */}
              <line x1="225" y1="320" x2="210" y2="175" />
              <line x1="105" y1="265" x2="210" y2="175" />
              {/* Pune - Satara - Kolhapur Highway */}
              <line x1="225" y1="320" x2="235" y2="405" />
              <line x1="235" y1="405" x2="260" y2="475" />
              {/* Pune - Solapur */}
              <line x1="225" y1="320" x2="410" y2="410" />
              {/* Nashik - Chhatrapati Sambhajinagar - Nagpur Samruddhi Corridor */}
              <line x1="210" y1="175" x2="370" y2="215" />
              <line x1="370" y1="215" x2="680" y2="110" />
              {/* Mumbai - Thane - Navi Mumbai Cluster */}
              <line x1="105" y1="265" x2="125" y2="235" />
              <line x1="105" y1="265" x2="135" y2="280" />
            </g>

            {/* District Hub Nodes */}
            {districts.map(district => {
              const pos = DISTRICT_GEO_POSITIONS[district.districtId] || { x: 300, y: 300, labelPos: 'top' };
              const color = getDistrictColor(district);
              const isSelected = selectedDistrictId === district.districtId;
              const isHovered = hoveredDistrictId === district.districtId;

              return (
                <g
                  key={district.districtId}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => onSelectDistrict(district.districtId)}
                  onMouseEnter={() => setHoveredDistrictId(district.districtId)}
                  onMouseLeave={() => setHoveredDistrictId(null)}
                >
                  {/* Outer Pulsing Halo when selected or hovered */}
                  {(isSelected || isHovered) && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSelected ? 32 : 24}
                      fill={color.fill}
                      stroke={color.stroke}
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                      className="animate-pulse"
                    />
                  )}

                  {/* Secondary Capacity Bubble */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 18 : 14}
                    fill={isSelected ? '#1e1b4b' : '#0f172a'}
                    stroke={isSelected ? '#6366f1' : color.stroke}
                    strokeWidth={isSelected ? 3 : 2}
                  />

                  {/* Center Dot Indicator */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 6 : 4}
                    fill={color.stroke}
                  />

                  {/* District Label Text */}
                  <text
                    x={pos.x}
                    y={pos.labelPos === 'bottom' ? pos.y + 26 : (pos.labelPos === 'top' ? pos.y - 18 : pos.y + 4)}
                    textAnchor={pos.labelPos === 'left' ? 'end' : (pos.labelPos === 'right' ? 'start' : 'middle')}
                    dx={pos.labelPos === 'left' ? -18 : (pos.labelPos === 'right' ? 18 : 0)}
                    className={`text-[12px] font-semibold tracking-tight transition-all duration-150 ${
                      isSelected
                        ? 'fill-white font-bold'
                        : isHovered
                        ? 'fill-indigo-300'
                        : 'fill-slate-300'
                    }`}
                  >
                    {district.districtName}
                  </text>

                  {/* Deficit Badge Subtext */}
                  <text
                    x={pos.x}
                    y={pos.labelPos === 'bottom' ? pos.y + 38 : (pos.labelPos === 'top' ? pos.y - 6 : pos.y + 16)}
                    textAnchor={pos.labelPos === 'left' ? 'end' : (pos.labelPos === 'right' ? 'start' : 'middle')}
                    dx={pos.labelPos === 'left' ? -18 : (pos.labelPos === 'right' ? 18 : 0)}
                    className="text-[9px] fill-slate-400 font-mono"
                  >
                    {district.capacityDeficit > 0 ? `-${district.capacityDeficit} gap` : 'Equilibrium'}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="absolute bottom-2 left-3 text-[10px] text-slate-500 font-mono">
            Projection: Maharashtra WGS84 Normalized &bull; 10 Industrial Hub Districts
          </div>
        </div>

        {/* Dynamic District Tooltip / Sidebar Card */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          {hoveredDistrict ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    {hoveredDistrict.division} Division
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded border font-mono ${getDistrictColor(hoveredDistrict).badge}`}>
                    {getDistrictColor(hoveredDistrict).label}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-white mt-1">
                  {hoveredDistrict.districtName} District
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {hoveredDistrict.industrialHubType}
                </p>
              </div>

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">Industry Vacancies</div>
                  <div className="text-base font-bold text-white tabular-nums">
                    {hoveredDistrict.totalJobDemandOpenings.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    across {hoveredDistrict.activeJobPostings} postings
                  </div>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">Training Capacity</div>
                  <div className="text-base font-bold text-sky-400 tabular-nums">
                    {hoveredDistrict.sanctionedCapacity.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {hoveredDistrict.capacityUtilizationRate}% utilized
                  </div>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">Net Capacity Gap</div>
                  <div className={`text-base font-bold tabular-nums ${hoveredDistrict.capacityDeficit > 150 ? 'text-red-400' : 'text-amber-400'}`}>
                    {hoveredDistrict.capacityDeficit > 0 ? `+${hoveredDistrict.capacityDeficit}` : '0'} seats
                  </div>
                  <div className="text-[10px] text-slate-500">
                    unmet recruitment need
                  </div>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">Certified Trainers</div>
                  <div className="text-base font-bold text-emerald-400 tabular-nums">
                    {hoveredDistrict.totalTrainers}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Ratio: 1:{hoveredDistrict.studentToTrainerRatio}
                  </div>
                </div>
              </div>

              {/* Key Deficit Skills */}
              {hoveredDistrict.topDeficitSkillNames.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="text-xs text-slate-400 mb-1.5 font-medium">Critical Talent Bottlenecks:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {hoveredDistrict.topDeficitSkillNames.map((skillName, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded border border-slate-700"
                      >
                        {skillName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => onSelectDistrict(hoveredDistrict.districtId)}
                className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
              >
                <span>Inspect Full {hoveredDistrict.districtName} Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 text-slate-400">
              <MapPin className="w-8 h-8 text-slate-600 mb-2 animate-bounce" />
              <p className="text-sm font-medium text-slate-300">Hover or click any district node</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Examine training seats, faculty ratios, and calculated curriculum interventions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
