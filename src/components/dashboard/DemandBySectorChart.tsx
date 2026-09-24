/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Building2, TrendingUp } from 'lucide-react';
import { SectorDemandItem } from '../../types/dataModel.ts';

interface DemandBySectorChartProps {
  sectors: SectorDemandItem[];
  onSelectSector: (sectorId: string) => void;
  selectedSectorId?: string;
}

export const DemandBySectorChart: React.FC<DemandBySectorChartProps> = ({
  sectors,
  onSelectSector,
  selectedSectorId
}) => {
  if (!sectors || sectors.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
        No sector demand records available.
      </div>
    );
  }

  const maxOpenings = Math.max(...sectors.map(s => s.openings), 1);

  return (
    <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-cyan-400" />
              Demand Distribution by Industry Sector
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sector share of total active job openings across Maharashtra
            </p>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            8 Sectors
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
          {sectors.map(sector => {
            const isSelected = selectedSectorId === sector.sectorId;
            const pct = Math.round((sector.openings / maxOpenings) * 100);

            return (
              <div
                key={sector.sectorId}
                onClick={() => onSelectSector(sector.sectorId)}
                className={`p-3 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-500 text-white'
                    : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {sector.name}
                      </span>
                      {sector.highGrowth && (
                        <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[9px] font-semibold shrink-0">
                          High Growth
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">{sector.code} &bull; {sector.postingsCount} Postings</span>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-cyan-400 font-mono">
                      {sector.sharePercentage}%
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {sector.openings} Openings
                    </div>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>Click any sector tile to filter dashboard scope</span>
        <span className="flex items-center gap-1 text-cyan-400">
          <TrendingUp className="w-3 h-3" /> Auto & IT dominate hiring volume
        </span>
      </div>
    </div>
  );
};
