/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  GraduationCap,
  Building2,
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  ChevronRight,
  Info,
  HelpCircle,
  ExternalLink,
  Award,
  Zap,
  ArrowRight,
  FileText,
  UserCheck
} from 'lucide-react';
import { DetailedCourseAlignmentReport, CourseSkillComparisonItem } from '../../types/dataModel.ts';
import { apiService } from '../../services/apiService.ts';

interface CourseAlignmentModalProps {
  courseId: string;
  onClose: () => void;
  onSelectSkill?: (skillId: string) => void;
}

export const CourseAlignmentModal: React.FC<CourseAlignmentModalProps> = ({
  courseId,
  onClose,
  onSelectSkill
}) => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<DetailedCourseAlignmentReport | null>(null);
  const [activeTab, setActiveTab] = useState<'comparison' | 'curriculum' | 'demand' | 'placement' | 'recommendations'>('comparison');
  const [skillFilter, setSkillFilter] = useState<'all' | 'covered' | 'partially_covered' | 'missing'>('all');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    apiService.getCourseAlignmentReport(courseId)
      .then(data => {
        if (isMounted) {
          setReport(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load course alignment report:', err);
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [courseId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-base font-semibold text-white">Analyzing Course Alignment...</h3>
          <p className="text-xs text-slate-400 mt-1">
            Synthesizing employer requisitions, comparing syllabus modules, and evaluating placement outcomes.
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">Report Not Found</h3>
          <p className="text-xs text-slate-400 mt-1">Could not load the alignment report for this course.</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const { course, institute, district, sector, primaryJobRole, summary, industryDemand, currentCurriculum, placementOutcome, recommendations } = report;

  const filteredSkills = summary.skills.filter(s => {
    if (skillFilter === 'all') return true;
    return s.status === skillFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/60 font-mono text-[11px] font-bold">
                {course.code}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-medium flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                {institute.name}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {district.name}
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 text-[11px] font-medium">
                {sector.name}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-400" />
              {course.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Target Pathway: <strong className="text-slate-200">{primaryJobRole.title}</strong> &bull; Total Curriculum: {course.durationHours} Hours &bull; NSQF Level {course.nsqfLevel} &bull; Batch Capacity: {course.annualBatchCapacity} trainees
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alignment Score KPI Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-slate-950/40 border-b border-slate-800">
          {/* Alignment Score */}
          <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Curriculum Alignment</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-black font-mono ${
                summary.alignmentScore >= 80 ? 'text-emerald-400' :
                summary.alignmentScore >= 60 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {summary.alignmentScore}%
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                summary.alignmentStatus === 'Industry Aligned' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80' :
                summary.alignmentStatus === 'Moderate Gap' ? 'bg-amber-950 text-amber-300 border border-amber-800/80' :
                'bg-red-950 text-red-300 border border-red-800/80'
              }`}>
                {summary.alignmentStatus}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  summary.alignmentScore >= 80 ? 'bg-emerald-500' :
                  summary.alignmentScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${summary.alignmentScore}%` }}
              />
            </div>
          </div>

          {/* Industry Demand */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">Industry Openings</span>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
              {industryDemand.totalActiveOpenings.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Across {industryDemand.distinctHiringEmployers} hiring employers
            </span>
          </div>

          {/* Skills Coverage */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">Skills Coverage</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {summary.skillsCoveredCount} <span className="text-xs text-slate-400 font-normal">/ {summary.totalIndustrySkillsRequired}</span>
            </div>
            <span className="text-[10px] text-emerald-400 mt-0.5 block">
              {summary.coveragePercentage}% match rate
            </span>
          </div>

          {/* Skills Missing / Gap */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">Skills Gap</span>
            <div className="text-xl font-bold font-mono text-red-400 mt-1">
              {summary.skillsMissingCount} <span className="text-xs text-red-300 font-normal">missing</span>
            </div>
            <span className="text-[10px] text-red-400 mt-0.5 block font-medium">
              {summary.criticalMissingCount} critical deficits
            </span>
          </div>

          {/* Placement Rate */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">Placement Outcome</span>
            <div className="text-xl font-bold font-mono text-indigo-400 mt-1">
              {placementOutcome.placementRate}%
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
              Median ₹{(placementOutcome.medianPlacedSalaryINR / 100000).toFixed(1)} LPA
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-6 text-xs overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`py-3 px-3 font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'comparison'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Skills Comparison ({summary.skills.length})
          </button>

          <button
            onClick={() => setActiveTab('curriculum')}
            className={`py-3 px-3 font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'curriculum'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Current Curriculum ({currentCurriculum.modulesCount} Modules)
          </button>

          <button
            onClick={() => setActiveTab('demand')}
            className={`py-3 px-3 font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'demand'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Industry Demand ({industryDemand.totalActiveOpenings} Openings)
          </button>

          <button
            onClick={() => setActiveTab('placement')}
            className={`py-3 px-3 font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'placement'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Placement Outcomes
          </button>

          <button
            onClick={() => setActiveTab('recommendations')}
            className={`py-3 px-3 font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'recommendations'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Recommendations ({recommendations.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: SKILLS COMPARISON */}
          {activeTab === 'comparison' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Filter by status:</span>
                  <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                    <button
                      onClick={() => setSkillFilter('all')}
                      className={`px-2.5 py-1 rounded cursor-pointer transition ${
                        skillFilter === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All ({summary.skills.length})
                    </button>
                    <button
                      onClick={() => setSkillFilter('covered')}
                      className={`px-2.5 py-1 rounded cursor-pointer transition flex items-center gap-1 ${
                        skillFilter === 'covered' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Covered ({summary.skillsCoveredCount})
                    </button>
                    <button
                      onClick={() => setSkillFilter('partially_covered')}
                      className={`px-2.5 py-1 rounded cursor-pointer transition flex items-center gap-1 ${
                        skillFilter === 'partially_covered' ? 'bg-amber-950 text-amber-300 border border-amber-800 font-semibold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Partially Covered ({summary.skillsPartiallyCoveredCount})
                    </button>
                    <button
                      onClick={() => setSkillFilter('missing')}
                      className={`px-2.5 py-1 rounded cursor-pointer transition flex items-center gap-1 ${
                        skillFilter === 'missing' ? 'bg-red-950 text-red-300 border border-red-800 font-semibold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      Missing ({summary.skillsMissingCount})
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Green = Covered
                  </span>
                  <span className="inline-flex items-center gap-1 text-amber-400 ml-2">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500" /> Yellow = Partially Covered
                  </span>
                  <span className="inline-flex items-center gap-1 text-red-400 ml-2">
                    <span className="w-2.5 h-2.5 rounded bg-red-500" /> Red = Missing
                  </span>
                </div>
              </div>

              {/* Skills Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Competency / Skill</th>
                      <th className="px-3 py-3 text-center">Status</th>
                      <th className="px-3 py-3 text-right">Industry Demand</th>
                      <th className="px-3 py-3">Required Proficiency</th>
                      <th className="px-3 py-3">Course Hours</th>
                      <th className="px-4 py-3">Why Detected (Explainability Rationale)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                    {filteredSkills.map((item, idx) => {
                      const isGreen = item.status === 'covered';
                      const isYellow = item.status === 'partially_covered';
                      const isRed = item.status === 'missing';

                      return (
                        <tr
                          key={`${item.skillId}-${idx}`}
                          className={`hover:bg-slate-900/60 transition ${
                            isRed ? 'bg-red-950/10' : isYellow ? 'bg-amber-950/10' : 'bg-emerald-950/10'
                          }`}
                        >
                          <td className="px-4 py-3 font-sans">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${
                                isGreen ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' :
                                isYellow ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' :
                                'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                              }`} />
                              <div>
                                <span className="font-semibold text-white block text-xs">{item.skillName}</span>
                                <span className="text-[10px] text-slate-400 font-mono font-normal">{item.category} &bull; NSQF {item.nsqfLevel}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-3 text-center font-sans">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isGreen ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              isYellow ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                              'bg-red-950 text-red-300 border border-red-800'
                            }`}>
                              {isGreen ? '✓ Covered' : isYellow ? '~ Partial' : '✗ Missing'}
                            </span>
                            {item.isCritical && (
                              <span className="block mt-1 text-[9px] text-red-400 font-bold uppercase tracking-tight">
                                Critical
                              </span>
                            )}
                          </td>

                          <td className="px-3 py-3 text-right font-mono">
                            <span className="text-cyan-400 font-bold block">{item.industryOpenings} Openings</span>
                            <span className="text-[10px] text-slate-400 font-normal">Score: {item.industryDemandScore}/100</span>
                          </td>

                          <td className="px-3 py-3 font-sans">
                            <span className="capitalize text-slate-200 font-medium">{item.requiredProficiency}</span>
                            <span className="block text-[10px] text-slate-400">
                              Import.: {item.importance}
                            </span>
                          </td>

                          <td className="px-3 py-3 font-mono">
                            {item.practicalHoursTaught + item.theoryHoursTaught > 0 ? (
                              <div>
                                <span className="text-white font-bold">{item.practicalHoursTaught + item.theoryHoursTaught} hrs</span>
                                <span className="block text-[10px] text-slate-400">{item.practicalHoursTaught} practical &bull; {item.theoryHoursTaught} theory</span>
                              </div>
                            ) : (
                              <span className="text-red-400 font-sans text-xs">0 hours</span>
                            )}
                          </td>

                          <td className="px-4 py-3 font-sans text-slate-300 text-xs">
                            <p className={`p-2 rounded-lg text-xs leading-relaxed border ${
                              isRed ? 'bg-red-950/40 border-red-900/60 text-red-200' :
                              isYellow ? 'bg-amber-950/40 border-amber-900/60 text-amber-200' :
                              'bg-emerald-950/30 border-emerald-900/50 text-emerald-200'
                            }`}>
                              {item.gapExplanation}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CURRENT CURRICULUM */}
          {activeTab === 'curriculum' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Curriculum</span>
                    <strong className="text-white text-base">{currentCurriculum.totalHours} hrs</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Practical Labs</span>
                    <strong className="text-emerald-400 text-base">{currentCurriculum.practicalHours} hrs</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Theory Classroom</span>
                    <strong className="text-blue-400 text-base">{currentCurriculum.theoryHours} hrs</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Outdated Modules</span>
                    <strong className={`text-base ${currentCurriculum.outdatedModulesCount > 0 ? 'text-red-400' : 'text-slate-300'}`}>
                      {currentCurriculum.outdatedModulesCount}
                    </strong>
                  </div>
                </div>

                <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  Practical Ratio: {Math.round((currentCurriculum.practicalHours / Math.max(1, currentCurriculum.totalHours)) * 100)}%
                </span>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Syllabus Modules</h4>
                {currentCurriculum.modules.map(mod => (
                  <div
                    key={mod.id}
                    className={`p-4 rounded-xl border ${
                      mod.isOutdated
                        ? 'bg-red-950/20 border-red-800/60'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-semibold text-white">{mod.title}</h5>
                          {mod.isOutdated && (
                            <span className="bg-red-950 text-red-300 border border-red-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                              Outdated Standard
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{mod.description}</p>
                      </div>

                      <div className="text-right shrink-0 font-mono text-xs">
                        <span className="text-blue-400 font-bold">{mod.durationHours} Hours</span>
                        <span className="block text-[10px] text-slate-500">Module #{mod.moduleNumber}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] text-slate-500">Competencies covered:</span>
                        {mod.skillIds.map(skId => (
                          <span key={skId} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                            {skId}
                          </span>
                        ))}
                      </div>

                      {mod.isOutdated && (
                        <span className="text-[11px] text-red-400 font-medium">
                          ⚠ Recommended to retire or replace with modern lab coursework
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: INDUSTRY DEMAND */}
          {activeTab === 'demand' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Total Active Job Requisitions</span>
                  <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                    {industryDemand.totalActiveOpenings.toLocaleString()} Openings
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Across {industryDemand.totalJobPostings} verified postings in Maharashtra
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Average Offered Compensation</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    ₹{(industryDemand.averageSalaryINR / 100000).toFixed(1)} LPA
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Band: ₹{(industryDemand.minSalaryINR / 100000).toFixed(1)} - ₹{(industryDemand.maxSalaryINR / 100000).toFixed(1)} LPA
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Hiring Employers Count</span>
                  <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">
                    {industryDemand.distinctHiringEmployers} Employers
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Actively seeking candidates with these credentials
                  </span>
                </div>
              </div>

              {/* Target Job Roles */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Direct Career Pathways in Market
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {industryDemand.targetJobRoles.map(role => (
                    <div key={role.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-white text-xs block">{role.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Avg Salary: ₹{(role.avgSalaryINR / 100000).toFixed(1)} LPA</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono text-xs font-bold">
                        {role.openings} Openings
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Hiring Employers */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Leading Employers Actively Recruiting in this Domain
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {industryDemand.topHiringEmployers.map(emp => (
                    <div key={emp.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-white text-xs block">{emp.name}</span>
                        <span className="text-[10px] text-slate-400">{emp.tier}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-xs font-bold">
                        {emp.openings} Openings
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PLACEMENT OUTCOMES */}
          {activeTab === 'placement' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Placement Rate</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    {placementOutcome.placementRate}%
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {placementOutcome.historicalPlacedCount} candidates placed from current batch
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Median Placed Salary</span>
                  <div className="text-2xl font-bold font-mono text-blue-400 mt-1">
                    ₹{(placementOutcome.medianPlacedSalaryINR / 100000).toFixed(1)} LPA
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    ₹{placementOutcome.medianPlacedSalaryINR.toLocaleString()} annual CTC
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Employer Rating</span>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                    {placementOutcome.avgEmployerFeedbackScore} <span className="text-xs font-normal text-slate-400">/ 5.0</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Direct industry feedback score
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block">6-Month Retention</span>
                  <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">
                    {placementOutcome.retentionRate6Months}%
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Post-placement job continuity
                  </span>
                </div>
              </div>

              {/* Alumni Placement Distribution */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Top Employers Hiring Alumni from this Program
                </h4>
                {placementOutcome.topPlacementEmployers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {placementOutcome.topPlacementEmployers.map(item => (
                      <div key={item.name} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="font-semibold text-white text-xs">{item.name}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-xs font-bold">
                          {item.placedCount} Placed
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Placement tracking records will accumulate as graduating batches complete industry assessments.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  These recommendations are calculated dynamically by cross-referencing real-time employer requisitions in Maharashtra with current syllabus credit allocations.
                </span>
              </div>

              <div className="space-y-3">
                {recommendations.map(rec => (
                  <div
                    key={rec.id}
                    className={`p-4 rounded-xl border ${
                      rec.priority === 'urgent'
                        ? 'bg-red-950/15 border-red-800/60'
                        : rec.priority === 'high'
                        ? 'bg-amber-950/15 border-amber-800/60'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            rec.priority === 'urgent' ? 'bg-red-950 text-red-300 border border-red-800' :
                            rec.priority === 'high' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                            'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}>
                            {rec.priority} Priority
                          </span>
                          <span className="text-xs text-slate-400 uppercase font-mono">
                            Action: {rec.type.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1.5">{rec.title}</h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{rec.rationale}</p>
                      </div>

                      <div className="text-right shrink-0 font-mono text-xs">
                        <span className="text-emerald-400 font-bold block">{rec.suggestedHours} Practical Hours</span>
                        <span className="text-[10px] text-slate-400" dangerouslySetInnerHTML={{ __html: rec.marketMetricHighlight }} />
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">Target Competencies:</span>
                        {rec.targetSkills.map(skId => (
                          <span key={skId} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                            {skId}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => alert(`Proposed syllabus change '${rec.title}' queued for State Board of Technical Education review.`)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold cursor-pointer transition flex items-center gap-1"
                      >
                        Adopt Module <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Alignment calculations are dynamic & explainable based on current employer postings.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg cursor-pointer transition"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
