/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Layers, Sparkles, Filter } from 'lucide-react';
import { SkillDemandItem } from '../../types/dataModel.ts';

interface TopSkillsBarChartProps {
  skills: SkillDemandItem[];
  onSelectSkill: (skillId: string) => void;
  selectedSkillId?: string;
}

export const TopSkillsBarChart: React.FC<TopSkillsBarChartProps> = ({
  skills,
  onSelectSkill,
  selectedSkillId
}) => {
  if (!skills || skills.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
        No skill demand records found for the active filter combination.
      </div>
    );
  }

  const maxOpenings = Math.max(...skills.map(s => s.openings), 1);

  return (
    <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              Top Skills Demanded by Employers
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked by aggregate vacancy requisitions in filtered job postings
            </p>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Click to Filter
          </span>
        </div>

        {/* Skill Rows */}
        <div className="space-y-3 mt-4">
          {skills.map((skill, idx) => {
            const isSelected = selectedSkillId === skill.skillId;
            const pct = Math.round((skill.openings / maxOpenings) * 100);

            return (
              <div
                key={`${skill.skillId}-${idx}`}
                onClick={() => onSelectSkill(skill.skillId)}
                className={`group p-2 rounded-lg transition cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-950/70 border-indigo-500 text-white'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/90 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 text-[11px] font-mono text-slate-500 font-bold shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-slate-200 group-hover:text-indigo-300 transition truncate">
                      {skill.skillName}
                    </span>
                    {skill.isEmerging && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-purple-950/80 text-purple-300 border border-purple-800 rounded text-[9px] font-semibold shrink-0">
                        <Sparkles className="w-2.5 h-2.5" />
                        Emerging
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                    <span className="text-slate-400 hidden sm:inline">
                      ₹{(skill.avgSalary / 100000).toFixed(1)}L
                    </span>
                    <span className="font-bold text-indigo-400">
                      {skill.openings.toLocaleString()} Openings
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full transition-all duration-500 group-hover:from-indigo-500 group-hover:to-cyan-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>Showing top {skills.length} high-demand skills</span>
        <span className="flex items-center gap-1 text-indigo-400">
          <Filter className="w-3 h-3" /> Click any skill to isolate demand
        </span>
      </div>
    </div>
  );
};
