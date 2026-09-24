/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Filter, RotateCcw, Search } from 'lucide-react';
import { District, Sector, JobRole, Skill, IndustryDemandFilters } from '../../types/dataModel.ts';

interface DemandFiltersProps {
  filters: IndustryDemandFilters;
  onChange: (newFilters: IndustryDemandFilters) => void;
  districts: District[];
  sectors: Sector[];
  jobRoles: JobRole[];
  skills: Skill[];
}

export function DemandFilters({
  filters,
  onChange,
  districts,
  sectors,
  jobRoles,
  skills
}: DemandFiltersProps) {
  const activeCount = Object.entries(filters).filter(
    ([_, val]) => val && val !== 'all'
  ).length;

  const handleReset = () => {
    onChange({
      districtId: 'all',
      sectorId: 'all',
      jobRoleId: 'all',
      skillId: 'all',
      experienceLevel: 'all',
      dateRange: 'all'
    });
  };

  // Filter job roles if sector is selected
  const availableRoles = filters.sectorId && filters.sectorId !== 'all'
    ? jobRoles.filter(r => r.sectorId === filters.sectorId)
    : jobRoles;

  // Filter skills if sector is selected
  const availableSkills = filters.sectorId && filters.sectorId !== 'all'
    ? skills.filter(s => s.sectorIds?.includes(filters.sectorId!))
    : skills;

  return (
    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 shadow-sm backdrop-blur">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Industry Demand Filters
          </span>
          {activeCount > 0 && (
            <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono px-2 py-0.5 rounded-full">
              {activeCount} active
            </span>
          )}
        </div>

        <button
          onClick={handleReset}
          disabled={activeCount === 0}
          className={`flex items-center gap-1.5 text-xs transition cursor-pointer self-start lg:self-auto ${
            activeCount > 0
              ? 'text-cyan-400 hover:text-cyan-300'
              : 'text-slate-600 cursor-not-allowed'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Filter 1: District */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            District Hub
          </label>
          <select
            value={filters.districtId || 'all'}
            onChange={e => onChange({ ...filters, districtId: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
          >
            <option value="all">All 10 Districts</option>
            {districts.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter 2: Sector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Industry Sector
          </label>
          <select
            value={filters.sectorId || 'all'}
            onChange={e => {
              const newSector = e.target.value;
              onChange({
                ...filters,
                sectorId: newSector,
                jobRoleId: 'all', // Reset dependent role if sector changes
                skillId: 'all'
              });
            }}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
          >
            <option value="all">All 8 Sectors</option>
            {sectors.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        {/* Filter 3: Job Role */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Job Role
          </label>
          <select
            value={filters.jobRoleId || 'all'}
            onChange={e => onChange({ ...filters, jobRoleId: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
          >
            <option value="all">All Job Roles ({availableRoles.length})</option>
            {availableRoles.map(r => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>

        {/* Filter 4: Skill */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Target Skill
          </label>
          <select
            value={filters.skillId || 'all'}
            onChange={e => onChange({ ...filters, skillId: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
          >
            <option value="all">All Tracked Skills ({availableSkills.length})</option>
            {availableSkills.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter 5: Experience */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Experience Level
          </label>
          <select
            value={filters.experienceLevel || 'all'}
            onChange={e => onChange({ ...filters, experienceLevel: e.target.value as any })}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
          >
            <option value="all">All Experience Levels</option>
            <option value="entry">Entry (0 - 1 Years)</option>
            <option value="mid">Mid-Level (2 - 4 Years)</option>
            <option value="senior">Senior (5+ Years)</option>
          </select>
        </div>

        {/* Filter 6: Date Range */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Time Horizon
          </label>
          <select
            value={filters.dateRange || 'all'}
            onChange={e => onChange({ ...filters, dateRange: e.target.value as any })}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
          >
            <option value="all">All Time (Benchmark)</option>
            <option value="90d">Past 90 Days</option>
            <option value="60d">Past 60 Days</option>
            <option value="30d">Past 30 Days</option>
          </select>
        </div>
      </div>
    </div>
  );
}
