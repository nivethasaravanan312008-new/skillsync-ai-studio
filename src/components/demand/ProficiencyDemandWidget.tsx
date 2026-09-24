/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Award, CheckCircle2 } from 'lucide-react';
import { ProficiencyDemandItem } from '../../types/dataModel.ts';

interface ProficiencyDemandWidgetProps {
  proficiencyData: ProficiencyDemandItem[];
}

export function ProficiencyDemandWidget({ proficiencyData }: ProficiencyDemandWidgetProps) {
  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Demand by Proficiency Level
          </h3>
          <p className="text-xs text-slate-400">Employer skill depth requirement distribution</p>
        </div>
      </div>

      <div className="space-y-4">
        {proficiencyData.map((item, idx) => {
          const color = item.proficiency === 'advanced'
            ? 'from-purple-500 to-indigo-500'
            : item.proficiency === 'intermediate'
              ? 'from-blue-500 to-cyan-500'
              : 'from-emerald-500 to-teal-500';

          return (
            <div key={idx} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white">{item.label}</span>
                  <span className="text-[11px] text-slate-400 block font-mono">
                    {item.requirementsCount.toLocaleString()} job requirements
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-cyan-300 text-sm">{item.openings.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-400 block font-mono">({item.sharePercentage}% share)</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`bg-gradient-to-r ${color} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${Math.max(item.sharePercentage, 2)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>70%+ of positions require Intermediate or Advanced vocational mastery.</span>
      </div>
    </div>
  );
}
