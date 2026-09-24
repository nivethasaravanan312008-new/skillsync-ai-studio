/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Briefcase, Building2 } from 'lucide-react';
import { JobRoleDemandItem } from '../../types/dataModel.ts';

interface TopJobRolesChartProps {
  jobRoles: JobRoleDemandItem[];
  onSelectRole: (roleId: string) => void;
  selectedRoleId?: string;
}

export const TopJobRolesChart: React.FC<TopJobRolesChartProps> = ({
  jobRoles,
  onSelectRole,
  selectedRoleId
}) => {
  if (!jobRoles || jobRoles.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
        No job role data for selected filters.
      </div>
    );
  }

  const maxOpenings = Math.max(...jobRoles.map(r => r.openings), 1);

  return (
    <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-amber-400" />
              High Demand Job Roles
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Aggregated vacancy openings across industrial employers
            </p>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Click to Filter
          </span>
        </div>

        <div className="space-y-2.5 mt-4">
          {jobRoles.map(role => {
            const isSelected = selectedRoleId === role.roleId;
            const pct = Math.round((role.openings / maxOpenings) * 100);

            return (
              <div
                key={role.roleId}
                onClick={() => onSelectRole(role.roleId)}
                className={`p-2.5 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-950/60 border-amber-500 text-white'
                    : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-slate-200 truncate">
                      {role.title}
                    </span>
                    <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] shrink-0 flex items-center gap-1">
                      <Building2 className="w-2.5 h-2.5" />
                      {role.sectorName}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                    <span className="text-emerald-400">
                      ₹{(role.averageSalaryINR / 100000).toFixed(1)}L
                    </span>
                    <span className="font-bold text-amber-400">
                      {role.openings} Openings
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>Showing top {jobRoles.length} roles</span>
        <span>Average role compensation: ₹3.8L - 7.5L</span>
      </div>
    </div>
  );
};
