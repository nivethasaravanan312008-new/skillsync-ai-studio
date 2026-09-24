/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, CheckCircle2, TrendingUp, IndianRupee, ShieldCheck } from 'lucide-react';
import { PlacementOutcomesSummary } from '../../types/dataModel.ts';

interface PlacementOutcomesWidgetProps {
  outcomes: PlacementOutcomesSummary;
  onViewPlacements: () => void;
}

export const PlacementOutcomesWidget: React.FC<PlacementOutcomesWidgetProps> = ({
  outcomes,
  onViewPlacements
}) => {
  return (
    <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-teal-400" />
              Verified Placement & Retention Outcomes
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Graduate employment conversion, starting salary, and tenure stability
            </p>
          </div>
          <button
            onClick={onViewPlacements}
            className="text-[11px] text-teal-400 hover:text-teal-300 font-mono underline"
          >
            Placement Records
          </button>
        </div>

        {/* Primary Placement Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Placement Conversion
            </span>
            <div className="text-2xl font-extrabold text-teal-400 mt-1">
              {outcomes.placementRatePercentage}%
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {outcomes.totalPlaced} of {outcomes.totalCandidatesAnalyzed} Placed
            </span>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Median Salary
            </span>
            <div className="text-2xl font-extrabold text-white mt-1">
              ₹{(outcomes.medianSalaryINR / 100000).toFixed(1)}L
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block font-mono">
              Per Annum Entry
            </span>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              6-Month Retention
            </span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              {outcomes.retentionRate6Months}%
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              On-Job Stability
            </span>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Active Candidates
            </span>
            <div className="text-2xl font-extrabold text-blue-400 mt-1">
              {outcomes.totalCandidatesAnalyzed}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              In Talent Pipeline
            </span>
          </div>
        </div>

        {/* Top Placed Sectors */}
        <div className="mt-4">
          <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
            <span>Leading Placement Sectors</span>
            <span className="text-[11px] text-slate-500">Graduates Hired</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {outcomes.topPlacedSectors.map(s => (
              <div key={s.sectorName} className="p-2.5 bg-slate-900/40 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                <span className="text-slate-300 truncate pr-2 font-medium">{s.sectorName}</span>
                <span className="font-mono font-bold text-teal-400">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1 text-slate-400">
          <ShieldCheck className="w-3 h-3 text-teal-400" /> All placements tied to employer surveys & PF verification
        </span>
        <button
          onClick={onViewPlacements}
          className="text-teal-400 hover:text-teal-300 font-medium"
        >
          View Full Placement Log &rarr;
        </button>
      </div>
    </div>
  );
};
