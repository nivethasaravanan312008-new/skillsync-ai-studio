/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Eye,
  Layers,
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  MapPin,
  Clock,
  Briefcase
} from 'lucide-react';
import { CourseSkillGapSummary, CourseSkillComparisonItem } from '../../types/dataModel.ts';

interface SkillGapMatrixViewProps {
  matrixCourses: CourseSkillGapSummary[];
  allTrackedSkills: { id: string; name: string; category: string; overallDemandScore: number }[];
  onSelectCourse: (courseId: string) => void;
  onSelectSkill?: (skillId: string) => void;
}

export const SkillGapMatrixView: React.FC<SkillGapMatrixViewProps> = ({
  matrixCourses,
  allTrackedSkills,
  onSelectCourse,
  onSelectSkill
}) => {
  const [viewMode, setViewMode] = useState<'card_matrix' | 'table_grid'>('card_matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score_asc' | 'score_desc' | 'gap_desc' | 'openings_desc'>('score_asc');
  const [selectedSkillTooltip, setSelectedSkillTooltip] = useState<{
    courseTitle: string;
    item: CourseSkillComparisonItem;
  } | null>(null);

  // Filter courses by search
  const filteredCourses = matrixCourses.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.courseTitle.toLowerCase().includes(q) ||
      c.courseCode.toLowerCase().includes(q) ||
      c.instituteName.toLowerCase().includes(q) ||
      c.districtName.toLowerCase().includes(q) ||
      c.sectorName.toLowerCase().includes(q) ||
      c.jobRoleTitle.toLowerCase().includes(q) ||
      c.skills.some(s => s.skillName.toLowerCase().includes(q))
    );
  });

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === 'score_asc') return a.alignmentScore - b.alignmentScore;
    if (sortBy === 'score_desc') return b.alignmentScore - a.alignmentScore;
    if (sortBy === 'gap_desc') return b.gapPercentage - a.gapPercentage;
    if (sortBy === 'openings_desc') return b.totalRelatedJobOpenings - a.totalRelatedJobOpenings;
    return 0;
  });

  // Top tracked skills to display as columns in the table grid mode
  const topMatrixSkills = allTrackedSkills.slice(0, 16);

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses, skills, or job roles..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs cursor-pointer"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="score_asc">Worst Alignment First (Priority)</option>
              <option value="score_desc">Best Alignment First</option>
              <option value="gap_desc">Highest Gap % First</option>
              <option value="openings_desc">Highest Industry Openings</option>
            </select>
          </div>

          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => setViewMode('card_matrix')}
              className={`px-3 py-1 rounded cursor-pointer transition ${
                viewMode === 'card_matrix' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Course Comparison Cards
            </button>
            <button
              onClick={() => setViewMode('table_grid')}
              className={`px-3 py-1 rounded cursor-pointer transition ${
                viewMode === 'table_grid' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Competency Heatmap Grid
            </button>
          </div>
        </div>
      </div>

      {/* Legend Notice */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">Status Color Legend:</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            Green = Covered (✓)
          </span>
          <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
            Yellow = Partially Covered (~)
          </span>
          <span className="inline-flex items-center gap-1.5 text-red-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            Red = Missing (✗)
          </span>
        </div>

        <span className="text-[11px] text-slate-400">
          Showing {sortedCourses.length} of {matrixCourses.length} accredited courses analyzed
        </span>
      </div>

      {/* VIEW MODE 1: DETAILED COURSE COMPARISON CARDS */}
      {viewMode === 'card_matrix' && (
        <div className="grid grid-cols-1 gap-4">
          {sortedCourses.map(course => {
            const isAligned = course.alignmentStatus === 'Industry Aligned';
            const isModerate = course.alignmentStatus === 'Moderate Gap';
            const isCritical = course.alignmentStatus === 'Critical Deficit';

            return (
              <div
                key={course.courseId}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition shadow-lg space-y-4"
              >
                {/* Course Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60 font-mono text-[11px] font-bold">
                        {course.courseCode}
                      </span>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        {course.instituteName}
                      </span>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {course.districtName}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px] uppercase font-mono">
                        {course.sectorName}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white tracking-tight">
                      {course.courseTitle}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Target Role: <strong className="text-slate-200">{course.jobRoleTitle}</strong> &bull; Openings in Market: <strong className="text-cyan-400 font-mono">{course.totalRelatedJobOpenings}</strong> &bull; Avg Salary: <strong className="text-emerald-400 font-mono">₹{(course.avgJobSalaryINR / 100000).toFixed(1)} LPA</strong>
                    </p>
                  </div>

                  {/* Alignment Badge & Metrics */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right font-mono">
                      <div className="flex items-baseline justify-end gap-2">
                        <span className="text-xs text-slate-400 font-sans">Alignment Score:</span>
                        <span className={`text-2xl font-black ${
                          isAligned ? 'text-emerald-400' : isModerate ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {course.alignmentScore}%
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-2 text-[11px] mt-0.5">
                        <span className="text-emerald-400">Coverage: {course.coveragePercentage}%</span>
                        <span className="text-slate-600">&bull;</span>
                        <span className="text-red-400">Gap: {course.gapPercentage}%</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectCourse(course.courseId)}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 shadow-md shadow-blue-500/20 shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Inspect Alignment
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${course.coveragePercentage}%` }}
                    title={`Covered: ${course.coveragePercentage}%`}
                  />
                  <div
                    className="bg-red-500/80 h-full transition-all duration-500"
                    style={{ width: `${course.gapPercentage}%` }}
                    title={`Gap: ${course.gapPercentage}%`}
                  />
                </div>

                {/* Visual Skill Matrix Chips comparing Industry Required Skills vs Course Covered */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      Industry Required Skills vs Course Curriculum:
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {course.skillsCoveredCount} Covered &bull; {course.skillsPartiallyCoveredCount} Partial &bull; {course.skillsMissingCount} Missing ({course.criticalMissingCount} Critical)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {course.skills.map((skillItem, sIdx) => {
                      const isGreen = skillItem.status === 'covered';
                      const isYellow = skillItem.status === 'partially_covered';
                      const isRed = skillItem.status === 'missing';

                      return (
                        <div
                          key={`${course.courseId}-${skillItem.skillId}-${sIdx}`}
                          onClick={() => setSelectedSkillTooltip({ courseTitle: course.courseTitle, item: skillItem })}
                          className={`group relative px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition flex items-center gap-2 ${
                            isGreen
                              ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200 hover:bg-emerald-900/50'
                              : isYellow
                              ? 'bg-amber-950/40 border-amber-700/60 text-amber-200 hover:bg-amber-900/50'
                              : 'bg-red-950/40 border-red-700/60 text-red-200 hover:bg-red-900/50'
                          }`}
                          title="Click to view explainable rationale"
                        >
                          <span className="font-bold">
                            {isGreen ? '✓' : isYellow ? '~' : '✗'}
                          </span>
                          <span className="font-medium">{skillItem.skillName}</span>

                          {skillItem.isCritical && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                          )}

                          <span className="text-[10px] opacity-75 font-mono">
                            {skillItem.industryOpenings > 0 ? `${skillItem.industryOpenings} op` : 'course-only'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Critical Missing Skills Warning Callout if present */}
                {course.criticalMissingSkillsList.length > 0 && (
                  <div className="bg-red-950/25 border border-red-900/50 rounded-lg p-3 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-red-200 block">
                        Critical Industry Skills Missing from Curriculum ({course.criticalMissingSkillsList.length}):
                      </span>
                      <p className="text-red-300/90 text-xs mt-0.5">
                        {course.criticalMissingSkillsList.map(s => s.skillName).join(', ')} — these high-demand competencies are actively demanded by employers but missing from the current syllabus.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: HEATMAP GRID (Courses on Rows x Top Skills on Columns) */}
      {viewMode === 'table_grid' && (
        <div className="border border-slate-800 rounded-xl overflow-x-auto bg-slate-950 shadow-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900 text-slate-300 border-b border-slate-800 sticky top-0 z-20">
              <tr>
                <th className="p-3 font-semibold min-w-[240px] sticky left-0 bg-slate-900 z-30 border-r border-slate-800">
                  Course Title / Institute
                </th>
                <th className="p-3 text-center min-w-[90px] border-r border-slate-800">
                  Alignment
                </th>
                <th className="p-3 text-center min-w-[90px] border-r border-slate-800">
                  Coverage
                </th>
                {topMatrixSkills.map(sk => (
                  <th
                    key={sk.id}
                    className="p-2.5 text-center min-w-[110px] text-[11px] font-medium border-r border-slate-800/80"
                    title={`Category: ${sk.category} | Demand Score: ${sk.overallDemandScore}`}
                  >
                    <div className="line-clamp-2">{sk.name}</div>
                    <span className="text-[9px] font-mono text-cyan-400 font-normal">Score {sk.overallDemandScore}</span>
                  </th>
                ))}
                <th className="p-3 text-center min-w-[100px]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans text-xs">
              {sortedCourses.map(course => {
                const skillMap = new Map(course.skills.map(s => [s.skillId, s]));

                return (
                  <tr key={course.courseId} className="hover:bg-slate-900/50 transition">
                    <td className="p-3 font-medium text-white sticky left-0 bg-slate-950 border-r border-slate-800 z-10">
                      <span className="font-semibold block text-xs">{course.courseTitle}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {course.courseCode} &bull; {course.districtName}
                      </span>
                    </td>

                    <td className="p-3 text-center font-mono font-bold border-r border-slate-800">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        course.alignmentScore >= 80 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        course.alignmentScore >= 60 ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-red-950 text-red-300 border border-red-800'
                      }`}>
                        {course.alignmentScore}%
                      </span>
                    </td>

                    <td className="p-3 text-center font-mono text-xs border-r border-slate-800">
                      <span className="text-emerald-400 font-bold">{course.coveragePercentage}%</span>
                      <span className="text-slate-500 block text-[10px]">Gap: {course.gapPercentage}%</span>
                    </td>

                    {topMatrixSkills.map(sk => {
                      const item = skillMap.get(sk.id);
                      if (!item) {
                        return (
                          <td key={sk.id} className="p-2 text-center text-slate-700 border-r border-slate-800/80">
                            -
                          </td>
                        );
                      }

                      const isGreen = item.status === 'covered';
                      const isYellow = item.status === 'partially_covered';
                      const isRed = item.status === 'missing';

                      return (
                        <td
                          key={sk.id}
                          onClick={() => setSelectedSkillTooltip({ courseTitle: course.courseTitle, item })}
                          className={`p-2 text-center cursor-pointer transition border-r border-slate-800/80 ${
                            isGreen
                              ? 'bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-300'
                              : isYellow
                              ? 'bg-amber-950/50 hover:bg-amber-900/70 text-amber-300'
                              : 'bg-red-950/50 hover:bg-red-900/70 text-red-300'
                          }`}
                          title="Click to view explainable details"
                        >
                          <span className="font-bold text-sm block">
                            {isGreen ? '✓' : isYellow ? '~' : '✗'}
                          </span>
                          <span className="text-[9px] uppercase tracking-tighter opacity-80 block font-mono">
                            {isGreen ? 'Covered' : isYellow ? 'Partial' : 'Missing'}
                          </span>
                        </td>
                      );
                    })}

                    <td className="p-3 text-center">
                      <button
                        onClick={() => onSelectCourse(course.courseId)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600 text-white rounded text-[11px] font-semibold transition cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL / TOOLTIP POPUP: EXPLAINABLE GAP RATIONALE (WHY DETECTED) */}
      {selectedSkillTooltip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                  Skill Gap Explainability Diagnostic
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">
                  {selectedSkillTooltip.item.skillName}
                </h4>
                <p className="text-xs text-slate-400">
                  Course: <strong className="text-slate-200">{selectedSkillTooltip.courseTitle}</strong>
                </p>
              </div>

              <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                selectedSkillTooltip.item.status === 'covered' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                selectedSkillTooltip.item.status === 'partially_covered' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                'bg-red-950 text-red-300 border border-red-800'
              }`}>
                {selectedSkillTooltip.item.status === 'covered' ? '✓ Covered' : selectedSkillTooltip.item.status === 'partially_covered' ? '~ Partially Covered' : '✗ Missing'}
              </span>
            </div>

            {/* Explainability Rationale */}
            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
              selectedSkillTooltip.item.status === 'missing' ? 'bg-red-950/30 border-red-800/60 text-red-200' :
              selectedSkillTooltip.item.status === 'partially_covered' ? 'bg-amber-950/30 border-amber-800/60 text-amber-200' :
              'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
            }`}>
              <span className="font-bold block mb-1 text-[11px] uppercase tracking-wider">
                Why was this status detected?
              </span>
              {selectedSkillTooltip.item.gapExplanation}
            </div>

            {/* Supporting Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px]">Industry Demand Score</span>
                <strong className="text-cyan-400 text-sm">{selectedSkillTooltip.item.industryDemandScore} / 100</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Active Market Openings</span>
                <strong className="text-white text-sm">{selectedSkillTooltip.item.industryOpenings} Openings</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Required Proficiency</span>
                <strong className="text-slate-200 capitalize text-sm">{selectedSkillTooltip.item.requiredProficiency}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Curriculum Hours</span>
                <strong className="text-slate-200 text-sm">
                  {selectedSkillTooltip.item.practicalHoursTaught + selectedSkillTooltip.item.theoryHoursTaught} hrs
                </strong>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedSkillTooltip(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition"
              >
                Close Diagnostic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
