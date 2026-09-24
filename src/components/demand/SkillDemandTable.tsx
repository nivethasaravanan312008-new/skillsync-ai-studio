/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Search,
  ArrowUpDown,
  TrendingUp,
  Building2,
  Briefcase,
  MapPin,
  Layers,
  ChevronRight,
  Info,
  ExternalLink
} from 'lucide-react';
import { SkillDemandIntelligenceItem } from '../../types/dataModel.ts';

interface SkillDemandTableProps {
  skills: SkillDemandIntelligenceItem[];
  onSelectSkill: (skillId: string) => void;
}

export function SkillDemandTable({ skills, onSelectSkill }: SkillDemandTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'openings' | 'employers' | 'growth'>('score');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredScoreSkillId, setHoveredScoreSkillId] = useState<string | null>(null);

  // Extract unique categories
  const categories = Array.from(new Set(skills.map(s => s.category))).filter(Boolean);

  // Filter skills
  const filtered = skills.filter(item => {
    const matchesSearch =
      searchTerm === '' ||
      item.skillName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.topJobRoles.some(r => r.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.topDistricts.some(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Sort skills
  const sorted = [...filtered].sort((a, b) => {
    let diff = 0;
    if (sortBy === 'score') diff = b.demandScore - a.demandScore;
    else if (sortBy === 'openings') diff = b.totalOpenings - a.totalOpenings;
    else if (sortBy === 'employers') diff = b.distinctEmployersCount - a.distinctEmployersCount;
    else if (sortBy === 'growth') diff = b.growthPercentage - a.growthPercentage;

    return sortOrder === 'desc' ? diff : -diff;
  });

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Table Header & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            Skill Demand Intelligence Index ({sorted.length} Competencies)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked by normalized 0-100 Demand Score combining postings volume, employer reach, geographic spread, and velocity. Click any skill for deep inspection.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search skill, role, district..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Skills Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px] bg-slate-900/60">
              <th className="py-3 px-3">#</th>
              <th className="py-3 px-3">Skill Competency</th>
              <th className="py-3 px-3 cursor-pointer select-none group" onClick={() => toggleSort('score')}>
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <span>Demand Score</span>
                  <ArrowUpDown className="w-3 h-3 group-hover:text-cyan-300" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer select-none group" onClick={() => toggleSort('openings')}>
                <div className="flex items-center gap-1.5">
                  <span>Jobs (Openings / Postings)</span>
                  <ArrowUpDown className="w-3 h-3 group-hover:text-white" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer select-none group" onClick={() => toggleSort('employers')}>
                <div className="flex items-center gap-1.5">
                  <span>Employers</span>
                  <ArrowUpDown className="w-3 h-3 group-hover:text-white" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer select-none group" onClick={() => toggleSort('growth')}>
                <div className="flex items-center gap-1.5">
                  <span>Trend</span>
                  <ArrowUpDown className="w-3 h-3 group-hover:text-white" />
                </div>
              </th>
              <th className="py-3 px-3">Top Job Roles</th>
              <th className="py-3 px-3">Top Districts</th>
              <th className="py-3 px-3">Top Sectors</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-10 text-center text-slate-500">
                  No skills match the selected filter criteria.
                </td>
              </tr>
            ) : (
              sorted.map((item, index) => {
                return (
                  <tr
                    key={`${item.skillId}-${index}`}
                    onClick={() => onSelectSkill(item.skillId)}
                    className="hover:bg-slate-900/80 transition-colors cursor-pointer group"
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-3 font-mono text-slate-500 text-[11px]">
                      {index + 1}
                    </td>

                    {/* Skill Name & Info */}
                    <td className="py-3.5 px-3 max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                          {item.skillName}
                        </span>
                        {item.isEmerging && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Emerging skill"></span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span className="text-cyan-400 font-semibold">{item.code}</span>
                        <span>&bull;</span>
                        <span>NSQF Level {item.nsqfLevel}</span>
                        <span>&bull;</span>
                        <span className="truncate max-w-[120px]">{item.category}</span>
                      </div>
                    </td>

                    {/* Demand Score with Explainability Popover */}
                    <td className="py-3.5 px-3 relative">
                      <div
                        onMouseEnter={() => setHoveredScoreSkillId(item.skillId)}
                        onMouseLeave={() => setHoveredScoreSkillId(null)}
                        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-700/60 font-mono font-bold text-cyan-300 shadow-sm"
                      >
                        <span className="text-sm">{item.demandScore}</span>
                        <span className="text-[10px] text-cyan-500">/100</span>
                        <Info className="w-3 h-3 text-cyan-400/80" />
                      </div>

                      {/* Tooltip / Popover showing explainable factors */}
                      {hoveredScoreSkillId === item.skillId && (
                        <div className="absolute left-0 bottom-full mb-2 w-72 bg-slate-900 border border-cyan-500/40 rounded-xl p-3 shadow-2xl z-50 pointer-events-none text-[11px]">
                          <div className="font-bold text-white mb-1.5 flex items-center justify-between">
                            <span>Score Breakdown: {item.demandScore} pts</span>
                            <span className="text-[10px] text-cyan-400 font-mono">0-100 Normalized</span>
                          </div>
                          <div className="space-y-1 font-mono text-[10px] text-slate-300">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Postings Volume (35%):</span>
                              <strong className="text-cyan-300">{item.scoreBreakdown.postingsFactor} / 35 pts</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Employer Reach (25%):</span>
                              <strong className="text-blue-300">{item.scoreBreakdown.employerFactor} / 25 pts</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Geographic Spread (20%):</span>
                              <strong className="text-indigo-300">{item.scoreBreakdown.geographicFactor} / 20 pts</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Growth Velocity (20%):</span>
                              <strong className="text-emerald-300">{item.scoreBreakdown.growthFactor} / 20 pts</strong>
                            </div>
                          </div>
                          <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 italic">
                            Click row to inspect full mathematical models & curriculum alignment.
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Jobs (Openings & Postings) */}
                    <td className="py-3.5 px-3 font-mono">
                      <div className="font-bold text-white text-xs">
                        {item.totalOpenings.toLocaleString()} Openings
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Across {item.jobPostingsCount} postings
                      </div>
                    </td>

                    {/* Employers */}
                    <td className="py-3.5 px-3 font-mono">
                      <div className="flex items-center gap-1.5 font-bold text-slate-200">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.distinctEmployersCount}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Corporate units</span>
                    </td>

                    {/* Trend */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        item.trend === 'surging'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : item.trend === 'declining'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {item.trend === 'surging' && <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>}
                        {item.growthPercentage > 0 ? `+${item.growthPercentage}%` : `${item.growthPercentage}%`}
                      </span>
                    </td>

                    {/* Top Job Roles */}
                    <td className="py-3.5 px-3 max-w-[170px]">
                      <div className="flex flex-wrap gap-1">
                        {item.topJobRoles.slice(0, 2).map((role, rIdx) => (
                          <span
                            key={rIdx}
                            className="px-1.5 py-0.5 bg-slate-900 text-slate-300 border border-slate-800 rounded text-[10px] truncate max-w-[140px]"
                            title={`${role.title} (${role.openings} openings)`}
                          >
                            {role.title}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Top Districts */}
                    <td className="py-3.5 px-3 max-w-[130px]">
                      <div className="flex flex-wrap gap-1">
                        {item.topDistricts.slice(0, 2).map((d, dIdx) => (
                          <span
                            key={dIdx}
                            className="px-1.5 py-0.5 bg-slate-900 text-slate-300 border border-slate-800 rounded text-[10px] truncate max-w-[90px]"
                            title={`${d.name} (${d.openings} openings)`}
                          >
                            {d.name}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Top Sectors */}
                    <td className="py-3.5 px-3 max-w-[120px]">
                      <div className="flex flex-wrap gap-1">
                        {item.topSectors.slice(0, 2).map((s, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-1.5 py-0.5 bg-slate-900 text-cyan-300 border border-slate-800 rounded text-[10px] truncate max-w-[85px]"
                            title={`${s.name} (${s.openings} openings)`}
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSkill(item.skillId);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-900/60 text-slate-300 hover:text-cyan-300 transition cursor-pointer"
                        title="Open detailed Skill Intelligence profile"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
