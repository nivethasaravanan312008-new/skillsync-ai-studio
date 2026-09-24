/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Filter, RotateCcw, Calendar, MapPin, Building2, Briefcase, Sparkles } from 'lucide-react';
import { DashboardFilters, District, Sector, JobRole, Skill } from '../../types/dataModel.ts';

interface FilterBarProps {
  filters: DashboardFilters;
  onFilterChange: (newFilters: Partial<DashboardFilters>) => void;
  onReset: () => void;
  districts: District[];
  sectors: Sector[];
  jobRoles: JobRole[];
  skills: Skill[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  districts,
  sectors,
  jobRoles,
  skills
}) => {
  const activeCount = [
    filters.dateRange !== 'all',
    filters.districtId !== 'all',
    filters.sectorId !== 'all',
    filters.jobRoleId !== 'all',
    filters.skillId !== 'all'
  ].filter(Boolean).length;

  // Filter job roles if a sector is selected
  const availableJobRoles = filters.sectorId !== 'all'
    ? jobRoles.filter(r => r.sectorId === filters.sectorId)
    : jobRoles;

  // Filter skills if a sector is selected
  const availableSkills = filters.sectorId !== 'all'
    ? skills.filter(s => s.sectorIds?.includes(filters.sectorId))
    : skills;

  return (
    <div className="bg-slate-950/80 backdrop-blur border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Filter Icon & Label */}
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span>Interactive Filters</span>
              {activeCount > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {activeCount} Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-normal">All metrics update dynamically</p>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 flex-1">
          {/* 1. Date Range */}
          <div className="relative">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              Time Window
            </label>
            <select
              value={filters.dateRange}
              onChange={e => onFilterChange({ dateRange: e.target.value as any })}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="all">All Time Records</option>
              <option value="90d">Past 90 Days</option>
              <option value="60d">Past 60 Days</option>
              <option value="30d">Past 30 Days</option>
            </select>
          </div>

          {/* 2. District Filter */}
          <div className="relative">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-400" />
              District
            </label>
            <select
              value={filters.districtId}
              onChange={e => onFilterChange({ districtId: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="all">All 10 Districts</option>
              {districts.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Sector Filter */}
          <div className="relative">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-cyan-400" />
              Sector
            </label>
            <select
              value={filters.sectorId}
              onChange={e => {
                // If sector changes, reset job role if it doesn't match new sector
                onFilterChange({
                  sectorId: e.target.value,
                  jobRoleId: 'all',
                  skillId: 'all'
                });
              }}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="all">All 8 Sectors</option>
              {sectors.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Job Role Filter */}
          <div className="relative">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1 flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-amber-400" />
              Job Role
            </label>
            <select
              value={filters.jobRoleId}
              onChange={e => onFilterChange({ jobRoleId: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="all">All Job Roles ({availableJobRoles.length})</option>
              {availableJobRoles.map(r => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Specific Skill Filter */}
          <div className="relative">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Skill
            </label>
            <select
              value={filters.skillId}
              onChange={e => onFilterChange({ skillId: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="all">All Competencies ({availableSkills.length})</option>
              {availableSkills.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex items-end justify-end shrink-0">
          <button
            onClick={onReset}
            disabled={activeCount === 0}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition ${
              activeCount > 0
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600 cursor-pointer shadow'
                : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
            title="Clear all active filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
