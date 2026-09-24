/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { TrendSkillItem } from '../../types/dataModel.ts';

interface EmergingDecliningSkillsWidgetProps {
  emergingSkills: TrendSkillItem[];
  decliningSkills: TrendSkillItem[];
  onSelectSkill: (skillId: string) => void;
}

export const EmergingDecliningSkillsWidget: React.FC<EmergingDecliningSkillsWidgetProps> = ({
  emergingSkills,
  decliningSkills,
  onSelectSkill
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Emerging Skills Box */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Emerging & High Velocity Skills
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Competencies exhibiting rapid annual requisition acceleration
              </p>
            </div>
            <span className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 rounded text-[10px] font-mono">
              +25% to +45% YoY
            </span>
          </div>

          <div className="space-y-2.5 mt-4">
            {emergingSkills.slice(0, 5).map((skill, eIdx) => (
              <div
                key={`emg-${skill.skillId}-${eIdx}`}
                onClick={() => onSelectSkill(skill.skillId)}
                className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-lg hover:border-purple-500/50 hover:bg-slate-900/80 transition cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {skill.name}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded shrink-0">
                        NSQF L{skill.nsqfLevel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {skill.rationale}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-0.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                      <ArrowUpRight className="w-3 h-3" />
                      +{skill.growthPercentage}%
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      {skill.openings} Openings
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Priority candidates for curriculum modernization</span>
          <span className="text-purple-400">Click to filter postings</span>
        </div>
      </div>

      {/* Declining / Obsolete Skills Box */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-red-400" />
                Declining & At-Risk Competencies
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Skills phasing out due to automation, CNC machining & cloud workflows
              </p>
            </div>
            <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-800 rounded text-[10px] font-mono">
              Negative Momentum
            </span>
          </div>

          <div className="space-y-2.5 mt-4">
            {decliningSkills.slice(0, 5).map((skill, dIdx) => (
              <div
                key={`dec-${skill.skillId}-${dIdx}`}
                onClick={() => onSelectSkill(skill.skillId)}
                className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-lg hover:border-red-500/50 hover:bg-slate-900/80 transition cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300 line-through decoration-red-500/50 truncate">
                        {skill.name}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded shrink-0">
                        {skill.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {skill.rationale}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-0.5 text-xs font-mono font-bold text-red-400 bg-red-950/60 border border-red-800/60 px-2 py-0.5 rounded">
                      <ArrowDownRight className="w-3 h-3" />
                      {skill.growthPercentage}%
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      Low Market Demand
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Target for phase-out in ITI training matrices</span>
          <span className="text-red-400">Avoid re-licensing seats</span>
        </div>
      </div>
    </div>
  );
};
