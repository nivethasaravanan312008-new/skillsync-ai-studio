/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Briefcase,
  Layers,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Plus,
  HelpCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Filter
} from 'lucide-react';
import {
  EmployerDashboardData,
  Job,
  EmployerSurvey
} from '../../types/dataModel.ts';

interface EmployerDashboardOverviewProps {
  data: EmployerDashboardData;
  onNavigateToPostJob: () => void;
  onNavigateToSurvey: () => void;
}

export const EmployerDashboardOverview: React.FC<EmployerDashboardOverviewProps> = ({
  data,
  onNavigateToPostJob,
  onNavigateToSurvey
}) => {
  const {
    employer,
    submittedJobs,
    submittedSurveys,
    totalOpeningsSubmitted,
    topDemandedSkills,
    marketSkillDemandOverview,
    recentValidationAudit
  } = data;

  const [activeTab, setActiveTab] = useState<'jobs' | 'skills' | 'surveys' | 'market'>('jobs');
  const [jobFilter, setJobFilter] = useState<'all' | 'direct' | 'simulated'>('all');

  const filteredJobs = submittedJobs.filter(j => {
    if (jobFilter === 'direct') return j.isDirectEmployerPost;
    if (jobFilter === 'simulated') return !j.isDirectEmployerPost;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Submitted Jobs */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Active Job Posts
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {submittedJobs.length}
            </div>
            <span className="text-[11px] text-indigo-400 font-medium mt-0.5 block">
              {submittedJobs.filter(j => j.isDirectEmployerPost).length} Direct Employer Posts
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center text-indigo-400">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Total Openings */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Openings
            </span>
            <div className="text-2xl font-black text-cyan-400 mt-1">
              {totalOpeningsSubmitted.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Across Maharashtra Facilities
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Validated Skills */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Required Skills
            </span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {topDemandedSkills.length}
            </div>
            <span className="text-[11px] text-amber-300 font-medium mt-0.5 block">
              {topDemandedSkills.filter(s => s.criticalCount > 0).length} Critical Competencies
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Survey Submissions */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Surveys Logged
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {submittedSurveys.length}
            </div>
            <span className="text-[11px] text-emerald-300 font-medium mt-0.5 block">
              Active Advisory Channel
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Action CTA Bar */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-800 border border-indigo-800/60 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Direct Industry Voice in Maharashtra Curriculum Alignment
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Your validated skill weights and job requisitions feed directly into state training seat allocations and ITI course modernization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onNavigateToPostJob}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Job Requirement</span>
          </button>

          <button
            onClick={onNavigateToSurvey}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Submit Demand Survey</span>
          </button>
        </div>
      </div>

      {/* Internal View Navigation */}
      <div className="flex border-b border-slate-700/80 gap-3">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
            activeTab === 'jobs'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Submitted Jobs ({submittedJobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={`pb-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
            activeTab === 'skills'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Required Skills Validation ({topDemandedSkills.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('surveys')}
          className={`pb-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
            activeTab === 'surveys'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Survey Submissions ({submittedSurveys.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('market')}
          className={`pb-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
            activeTab === 'market'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Market Skill Demand Context</span>
        </button>
      </div>

      {/* VIEW: SUBMITTED JOBS */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80 text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-medium">Filter Jobs:</span>
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value as any)}
                className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs outline-none cursor-pointer"
              >
                <option value="all">All Jobs ({submittedJobs.length})</option>
                <option value="direct">Direct Employer Posts Only</option>
                <option value="simulated">Simulated Industry Data Only</option>
              </select>
            </div>

            <div className="text-slate-400 text-[11px]">
              Showing <strong className="text-white">{filteredJobs.length}</strong> submitted postings
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.length === 0 ? (
              <div className="col-span-full bg-slate-900/50 border border-dashed border-slate-700 rounded-xl p-10 text-center text-slate-500 text-xs">
                No jobs found under the selected filter.
              </div>
            ) : (
              filteredJobs.map(job => {
                const isDirect = job.isDirectEmployerPost;

                return (
                  <div
                    key={job.id}
                    className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-600 transition"
                  >
                    <div className="space-y-3">
                      {/* Top Badges with Clear Distinctions */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {job.id}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isDirect ? (
                            <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                              ✓ Direct Employer Post
                            </span>
                          ) : (
                            <span className="bg-slate-900 text-slate-400 border border-slate-700 text-[10px] px-2 py-0.5 rounded-full font-mono">
                              Simulated Industry Data
                            </span>
                          )}

                          <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold">
                            {job.openings} Openings
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white hover:text-indigo-300 transition">
                          {job.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{job.description}</p>
                      </div>

                      {/* Salary and metadata */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          <span>₹{(job.minSalaryINR / 100000).toFixed(1)}L - {(job.maxSalaryINR / 100000).toFixed(1)}L PA</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{job.experienceRequiredYears} Yrs Exp</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{job.employmentType}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{new Date(job.postedDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Validated Skills Breakdown */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] text-slate-400 font-semibold block">
                          Validated Skill Requisitions ({job.requiredSkills.length}):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {job.requiredSkills.map((req, rIdx) => {
                            const isCrit = req.importance === 'critical';
                            const isImp = req.importance === 'preferred';

                            return (
                              <span
                                key={`${job.id}-${req.skillId}-${rIdx}`}
                                className={`text-[10px] px-2 py-0.5 rounded-md font-medium border flex items-center gap-1 ${
                                  isCrit
                                    ? 'bg-rose-950 text-rose-300 border-rose-700/80 font-semibold'
                                    : isImp
                                    ? 'bg-amber-950 text-amber-300 border-amber-800/80'
                                    : 'bg-slate-800 text-slate-300 border-slate-700'
                                }`}
                              >
                                <span>{req.skillId.replace('sk-', '')}</span>
                                <span className="opacity-70 text-[9px] uppercase font-mono">
                                  {isCrit ? 'Crit' : isImp ? 'Imp' : 'Nice'}
                                </span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW: REQUIRED SKILLS (CRITICAL VS IMPORTANT VS NICE-TO-HAVE) */}
      {activeTab === 'skills' && (
        <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/70 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                Aggregated Skill Requisition & Validation Matrix
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Breakdown of competencies validated across all your company's submitted job requirements.
              </p>
            </div>
            <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-700">
              Taxonomy Skills Monitored: <strong className="text-white">{topDemandedSkills.length}</strong>
            </span>
          </div>

          <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-900/50">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                  <th className="py-2.5 px-3">Skill Competency</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Critical Count</th>
                  <th className="py-2.5 px-3">Important Count</th>
                  <th className="py-2.5 px-3">Nice-To-Have</th>
                  <th className="py-2.5 px-3">Your Openings</th>
                  <th className="py-2.5 px-3">Statewide Market</th>
                  <th className="py-2.5 px-3">Data Origin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {topDemandedSkills.map((sk, skIdx) => (
                  <tr key={`${sk.skillId}-${skIdx}`} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-white">{sk.skillName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">NSQF Level {sk.nsqfLevel}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{sk.category}</td>
                    <td className="py-2.5 px-3">
                      {sk.criticalCount > 0 ? (
                        <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-700 rounded font-bold font-mono">
                          {sk.criticalCount}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-mono">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {sk.importantCount > 0 ? (
                        <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-700 rounded font-bold font-mono">
                          {sk.importantCount}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-mono">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {sk.niceToHaveCount > 0 ? (
                        <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-700 rounded font-bold font-mono">
                          {sk.niceToHaveCount}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-mono">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white font-mono">
                      {sk.totalEmployerOpenings}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">
                      {sk.marketWideOpenings}
                    </td>
                    <td className="py-2.5 px-3">
                      {!sk.isSimulatedInput ? (
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full font-semibold">
                          Direct Input
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 bg-slate-900 text-slate-400 border border-slate-700 rounded-full font-mono">
                          Demo Data
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: SURVEY SUBMISSIONS */}
      {activeTab === 'surveys' && (
        <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/70 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Submitted Skill-Demand Surveys
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Executive survey records submitted by your organization to the state planning council.
              </p>
            </div>
            <button
              onClick={onNavigateToSurvey}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Survey</span>
            </button>
          </div>

          {submittedSurveys.length === 0 ? (
            <div className="bg-slate-900/50 border border-dashed border-slate-700 rounded-xl p-8 text-center text-slate-500 text-xs">
              No surveys recorded yet. Click "Submit Demand Survey" to register institutional feedback.
            </div>
          ) : (
            <div className="space-y-3">
              {submittedSurveys.map(srv => (
                <div
                  key={srv.id}
                  className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 space-y-3 hover:border-slate-600 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-emerald-400 bg-slate-800 px-2 py-0.5 rounded">
                        {srv.id}
                      </span>
                      <span className="text-xs font-semibold text-white">
                        Survey Logged: {srv.surveyDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded font-mono">
                        Hiring Difficulty: {srv.hiringDifficultyScale}/5
                      </span>
                      <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-mono">
                        Graduate Readiness: {srv.readinessRating}/5
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300">
                    <strong>Planned 6-Month Hiring:</strong> {srv.plannedHiringNext6Months} candidates
                  </div>

                  {srv.reportedHardToFillSkillIds.length > 0 && (
                    <div>
                      <span className="text-[11px] text-slate-400 font-semibold block mb-1">
                        Hard-To-Fill Skills Reported:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {srv.reportedHardToFillSkillIds.map((skId, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 bg-rose-950/60 text-rose-300 border border-rose-800 rounded font-medium"
                          >
                            ! {skId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {srv.emergingSkillComments && (
                    <div className="p-2.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-xs text-slate-300 italic">
                      "{srv.emergingSkillComments}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW: MARKET SKILL DEMAND CONTEXT */}
      {activeTab === 'market' && (
        <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/70 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Statewide Sector Labour Market Demand (Employer Influence Weight)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Displays overall Maharashtra sector demand and how direct employer submissions contribute to the intelligence pipeline.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {marketSkillDemandOverview.map((sk, mIdx) => (
              <div
                key={`${sk.skillId}-${mIdx}`}
                className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white truncate mr-2">{sk.skillName}</h4>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono uppercase font-semibold ${
                      sk.urgency === 'high'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}
                  >
                    {sk.urgency}
                  </span>
                </div>

                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-400">Market Openings:</span>
                  <strong className="text-cyan-400 text-sm font-mono">{sk.openings}</strong>
                </div>

                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-400">12M Growth:</span>
                  <span className="text-emerald-400 font-mono">+{sk.growth12mPercentage}%</span>
                </div>

                {/* Direct Employer Input Weight */}
                <div className="pt-2 border-t border-slate-800 text-[11px] flex items-center justify-between">
                  <span className="text-slate-400">Employer Portal Weight:</span>
                  <span className="text-indigo-400 font-semibold font-mono">
                    {sk.employerDirectWeight}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
