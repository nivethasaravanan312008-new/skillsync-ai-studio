/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Users, Award, Briefcase } from 'lucide-react';
import { ExperienceDemandItem } from '../../types/dataModel.ts';

interface ExperienceDemandWidgetProps {
  experienceData: ExperienceDemandItem[];
}

export function ExperienceDemandWidget({ experienceData }: ExperienceDemandWidgetProps) {
  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            Demand by Experience Level
          </h3>
          <p className="text-xs text-slate-400">Employer requisition breakdown by required career stage</p>
        </div>
      </div>

      <div className="space-y-4">
        {experienceData.map((item, idx) => {
          const color = item.key === 'entry'
            ? 'from-emerald-500 to-teal-400'
            : item.key === 'mid'
              ? 'from-blue-500 to-cyan-400'
              : 'from-purple-500 to-indigo-400';

          return (
            <div key={idx} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white">{item.level}</span>
                  <span className="text-[11px] text-slate-400 block">{item.experienceRange}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-cyan-300 text-sm">{item.openings.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-400 block">({item.sharePercentage}% share)</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`bg-gradient-to-r ${color} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${Math.max(item.sharePercentage, 2)}%` }}
                ></div>
              </div>

              {/* Metrics line */}
              <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{item.postingsCount} Job Postings</span>
                {item.avgSalaryMinINR > 0 && (
                  <span className="text-amber-400">
                    Salary: ₹{(item.avgSalaryMinINR / 100000).toFixed(1)}L - {(item.avgSalaryMaxINR / 100000).toFixed(1)}L
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
