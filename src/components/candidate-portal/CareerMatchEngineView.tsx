/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  MapPin,
  TrendingUp,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  DollarSign,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { CandidateCareerMatch, Sector } from '../../types/dataModel.ts';

interface CareerMatchEngineViewProps {
  matches: CandidateCareerMatch[];
  sectors: Sector[];
  onSelectRoleForGap: (roleId: string) => void;
  onExploreCourse: (courseId: string) => void;
}

export const CareerMatchEngineView: React.FC<CareerMatchEngineViewProps> = ({
  matches,
  sectors,
  onSelectRoleForGap,
  onExploreCourse
}) => {
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [minMatch, setMinMatch] = useState<number>(0);
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(matches[0]?.jobRoleId || null);

  const filteredMatches = matches.filter(m => {
    const matchesSector = selectedSector === 'all' || m.sectorId === selectedSector;
    const matchesScore = m.matchPercentage >= minMatch;
    return matchesSector && matchesScore;
  });

  return (
    <div className="space-y-6">
      {/* Intro & Filter Header */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Career Match Engine</h2>
              <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px] px-2 py-0.5 rounded-full font-mono">
                Comparative Skill Alignment
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Dynamically evaluates your currently possessed skills against standardized industry skill requisitions across Maharashtra job roles.
              Displays match percentage, already acquired competencies, missing gaps, recommended courses, pedagogical learning sequence, relevant districts, and demand levels.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900 border border-slate-700/80 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Career Paths</span>
              <span className="text-lg font-bold text-white">{matches.length}</span>
            </div>
            <div className="bg-slate-900 border border-slate-700/80 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">High Match (&gt;50%)</span>
              <span className="text-lg font-bold text-emerald-400">
                {matches.filter(m => m.matchPercentage >= 50).length}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-700/80 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Filter by Sector:</span>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer"
            >
              <option value="all">All Sectors ({sectors.length})</option>
              {sectors.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Min Match Score:</span>
            <select
              value={minMatch}
              onChange={(e) => setMinMatch(Number(e.target.value))}
              className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer"
            >
              <option value={0}>All Scores (0%+)</option>
              <option value={20}>20%+ Overlap</option>
              <option value={40}>40%+ Overlap</option>
              <option value={60}>60%+ High Match</option>
            </select>
          </div>

          <div className="text-slate-500 ml-auto">
            Showing <strong className="text-slate-300">{filteredMatches.length}</strong> matching career pathways
          </div>
        </div>
      </div>

      {/* Career Match Cards */}
      <div className="space-y-4">
        {filteredMatches.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-12 text-center text-slate-400">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No career paths match the current filter threshold.</p>
            <p className="text-xs text-slate-500 mt-1">Try lowering the minimum match score or switching sector filters.</p>
          </div>
        ) : (
          filteredMatches.map(match => {
            const isExpanded = expandedRoleId === match.jobRoleId;
            const matchColor =
              match.matchPercentage >= 70 ? 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40' :
              match.matchPercentage >= 40 ? 'text-cyan-400 border-cyan-500/50 bg-cyan-950/40' :
              'text-amber-400 border-amber-500/50 bg-amber-950/40';

            const demandBadgeColor =
              match.demandLevel === 'Surging' ? 'bg-rose-950/90 text-rose-300 border-rose-700' :
              match.demandLevel === 'Very High' ? 'bg-amber-950/90 text-amber-300 border-amber-700' :
              'bg-blue-950/90 text-blue-300 border-blue-700';

            return (
              <div
                key={match.jobRoleId}
                className="bg-slate-800/70 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden transition-all hover:border-slate-600"
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedRoleId(isExpanded ? null : match.jobRoleId)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-700/30 transition"
                >
                  <div className="flex items-start md:items-center gap-4">
                    {/* Radial or score badge */}
                    <div className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center font-bold shrink-0 ${matchColor}`}>
                      <span className="text-lg leading-tight">{match.matchPercentage}%</span>
                      <span className="text-[9px] uppercase tracking-wider font-semibold opacity-80">Match</span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white hover:text-cyan-300 transition">
                          {match.jobRoleTitle}
                        </h3>
                        <span className="bg-slate-900 text-slate-300 border border-slate-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                          {match.sectorName}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${demandBadgeColor}`}>
                          Demand: {match.demandLevel} ({match.openingsCount} Openings)
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <DollarSign className="w-3.5 h-3.5" />
                          Avg ₹{(match.averageSalaryINR / 100000).toFixed(1)} LPA
                        </span>
                        <span>&bull;</span>
                        <span className="text-slate-300">
                          Possessed: <strong className="text-emerald-400">{match.possessedSkills.length}</strong> skills
                        </span>
                        <span>&bull;</span>
                        <span className="text-slate-300">
                          Missing: <strong className="text-rose-400">{match.missingSkills.length}</strong> skills
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRoleForGap(match.jobRoleId);
                      }}
                      className="px-3.5 py-1.5 bg-blue-600/90 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-blue-600/20"
                    >
                      <span>Analyze Skill Gap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="p-1 rounded-lg text-slate-400 hover:text-white transition">
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-700/60 bg-slate-900/50 space-y-6">
                    {/* Skills Breakdown Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Skills Already Possessed */}
                      <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Skills Already Possessed ({match.possessedSkills.length})
                        </h4>
                        {match.possessedSkills.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">None of the specific core skills acquired yet.</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {match.possessedSkills.map(ps => (
                              <span
                                key={ps.id}
                                className="px-2.5 py-1 bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 rounded-lg text-xs font-medium"
                              >
                                {ps.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Missing Skills */}
                      <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                          Missing Skills Needed ({match.missingSkills.length})
                        </h4>
                        {match.missingSkills.length === 0 ? (
                          <p className="text-xs text-emerald-400 font-medium">100% Complete! You meet all role requirements.</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {match.missingSkills.map(ms => (
                              <span
                                key={ms.id}
                                className="px-2.5 py-1 bg-rose-950/60 text-rose-300 border border-rose-700/60 rounded-lg text-xs font-medium flex items-center gap-1"
                              >
                                <span>{ms.name}</span>
                                {ms.importance === 'critical' && (
                                  <span className="text-[10px] bg-rose-900 text-rose-200 px-1 py-0.2 rounded font-mono">Critical</span>
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recommended Learning Sequence */}
                    <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-indigo-400" />
                        Recommended Step-by-Step Learning Sequence
                      </h4>
                      <div className="space-y-2">
                        {match.learningSequence.map((step, idx) => {
                          const isPossessed = step.type === 'possessed';
                          const isCapstone = step.type === 'capstone';

                          return (
                            <div
                              key={idx}
                              className={`flex items-start gap-3 p-2.5 rounded-xl border text-xs ${
                                isPossessed
                                  ? 'bg-emerald-950/30 border-emerald-800/40 text-slate-300'
                                  : isCapstone
                                  ? 'bg-indigo-950/40 border-indigo-700/60 text-indigo-200'
                                  : 'bg-slate-900/80 border-slate-700 text-slate-300'
                              }`}
                            >
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 text-[11px] ${
                                  isPossessed
                                    ? 'bg-emerald-600 text-white'
                                    : isCapstone
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-blue-600 text-white'
                                }`}
                              >
                                {step.step}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-semibold text-white">
                                    {step.skillName}
                                  </span>
                                  {step.estimatedWeeks > 0 && (
                                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
                                      ~{step.estimatedWeeks} Weeks
                                    </span>
                                  )}
                                  {isPossessed && (
                                    <span className="text-[10px] text-emerald-400 font-semibold uppercase">Already Possessed</span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5">{step.rationale}</p>
                                {step.recommendedCourseTitle && (
                                  <p className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1">
                                    <BookOpen className="w-3 h-3 shrink-0" />
                                    <span>Recommended Course: <strong>{step.recommendedCourseTitle}</strong></span>
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Relevant Districts & Recommended Courses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Relevant Districts */}
                      <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-cyan-400" />
                          Relevant Maharashtra Districts for this Role
                        </h4>
                        <div className="space-y-2">
                          {match.relevantDistricts.map(dist => (
                            <div
                              key={dist.districtId}
                              className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-700/60 text-xs"
                            >
                              <span className="text-slate-200 font-medium">{dist.districtName}</span>
                              <span className="text-cyan-400 font-mono font-semibold">{dist.openings} Openings</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommended Courses based on Actual System Data */}
                      <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-amber-400" />
                          Actual System Courses Covering Missing Skills
                        </h4>
                        {match.recommendedCourses.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">No direct course mappings configured in demo data.</p>
                        ) : (
                          <div className="space-y-2">
                            {match.recommendedCourses.slice(0, 3).map(crs => (
                              <div
                                key={crs.id}
                                onClick={() => onExploreCourse(crs.id)}
                                className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-700/60 border border-slate-700/80 transition cursor-pointer text-xs"
                              >
                                <div className="flex items-center justify-between">
                                  <h5 className="font-semibold text-slate-200 hover:text-cyan-300 truncate mr-2">
                                    {crs.title}
                                  </h5>
                                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-mono shrink-0">
                                    Health {crs.healthScore}%
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">
                                  {crs.instituteName} &bull; {crs.districtName} &bull; {crs.durationHours} hrs
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {crs.matchingSkillsCovered.slice(0, 3).map((skName, i) => (
                                    <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                                      + {skName}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
