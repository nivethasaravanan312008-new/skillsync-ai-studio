/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPin, Building } from 'lucide-react';
import { DistrictDemandItem } from '../../types/dataModel.ts';

interface DemandByDistrictChartProps {
  districts: DistrictDemandItem[];
  onSelectDistrict: (districtId: string) => void;
  selectedDistrictId?: string;
}

export const DemandByDistrictChart: React.FC<DemandByDistrictChartProps> = ({
  districts,
  onSelectDistrict,
  selectedDistrictId
}) => {
  if (!districts || districts.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
        No district records found.
      </div>
    );
  }

  const maxOpenings = Math.max(...districts.map(d => d.openings), 1);

  return (
    <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-400" />
              Geographical Demand Across 10 Maharashtra Districts
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Regional concentration of industrial clusters & skill openings
            </p>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Statewide Matrix
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 mt-4">
          {districts.map(dist => {
            const isSelected = selectedDistrictId === dist.districtId;
            const pct = Math.round((dist.openings / maxOpenings) * 100);

            return (
              <div
                key={dist.districtId}
                onClick={() => onSelectDistrict(dist.districtId)}
                className={`p-3 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-rose-950/70 border-rose-500 text-white'
                    : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-200 truncate">
                      {dist.name}
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-400">
                      {dist.sharePercentage}%
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-1" title={dist.industrialHubType}>
                    {dist.industrialHubType}
                  </p>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span>{dist.openings} Openings</span>
                    <span className="text-[10px] text-slate-500">{dist.postingsCount} Postings</span>
                  </div>

                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>Click any district tile to isolate district-level demand</span>
        <span className="flex items-center gap-1 text-rose-400">
          <Building className="w-3 h-3" /> Pune & Mumbai account for &gt;50% of total openings
        </span>
      </div>
    </div>
  );
};
