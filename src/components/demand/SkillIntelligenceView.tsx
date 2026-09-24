/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  MapPin,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  Award,
  Layers,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { apiService } from '../../services/apiService.ts';
import { DetailedSkillIntelligence } from '../../types/dataModel.ts';

interface SkillIntelligenceViewProps {
  skillId: string;
  onBack: () => void;
  onSelectSkill?: (newSkillId: string) => void;
}

export function SkillIntelligenceView({ skillId, onBack, onSelectSkill }: SkillIntelligenceViewProps) {
  const [data, setData] = useState<DetailedSkillIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'employers' | 'courses' | 'gap'>('overview');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    apiService.getSkillIntelligence(skillId)
      .then(res => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message || 'Failed to load skill intelligence');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [skillId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Synthesizing multi-dimensional skill intelligence...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-950/40 border border-red-800/80 rounded-2xl p-8 max-w-2xl mx-auto my-12 text-center">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Skill Intelligence Unavailable</h3>
        <p className="text-slate-400 text-sm mb-6">{error || 'Skill record could not be located.'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-lg border border-slate-700 transition cursor-pointer"
        >
          Return to Industry Demand
        </button>
      </div>
    );
  }

  const { skill, demandScore, scoreBreakdown, summary, demandTrendOverTime, relatedJobRoles, relatedSectors, districtDistribution, proficiencyBreakdown, employerDemand, teachingCourses, skillGapInfo } = data;

  const maxPeriodOpenings = Math.max(...demandTrendOverTime.map(d => d.openings), 1);
  const maxDistrictOpenings = Math.max(...districtDistribution.map(d => d.openings), 1);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Return Action */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition cursor-pointer group"
        >
          <div className="p-1 rounded-md bg-slate-800 group-hover:bg-slate-700 text-slate-300">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Back to Industry Demand Intelligence</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span>Competency ID:</span>
          <span className="text-cyan-400 font-bold">{skill.code}</span>
        </div>
      </div>

      {/* Main Skill Profile Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-xs font-mono font-bold">
                {skill.code}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold">
                NSQF Level {skill.nsqfLevel}
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs">
                {skill.category}
              </span>
              {skill.isEmerging && (
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Emerging Competency
                </span>
              )}
              <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                skill.demandTrend === 'surging'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : skill.demandTrend === 'declining'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                Trend: {skill.demandTrend}
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              {skill.name}
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              {skill.description}
            </p>

            {skill.aliases && skill.aliases.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                <span className="text-slate-500">Industry Aliases / Tooling:</span>
                {skill.aliases.map((alias, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-800/80 text-slate-300 rounded border border-slate-700/60 font-mono text-[11px]">
                    {alias}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Skill Demand Score Hero Badge */}
          <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-5 shrink-0 flex items-center gap-5 shadow-lg shadow-cyan-950/30">
            <div className="text-center">
              <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider mb-1">
                Skill Demand Score
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-mono">
                  {demandScore}
                </span>
                <span className="text-sm text-slate-500 font-mono">/100</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                Statewide Index
              </div>
            </div>

            <div className="w-px h-16 bg-slate-800"></div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between gap-3 text-slate-400">
                <span>Hiring Velocity:</span>
                <strong className={summary.growthPercentage >= 20 ? 'text-emerald-400' : 'text-slate-200'}>
                  {summary.growthPercentage > 0 ? `+${summary.growthPercentage}%` : `${summary.growthPercentage}%`}
                </strong>
              </div>
              <div className="flex items-center justify-between gap-3 text-slate-400">
                <span>Market Status:</span>
                <strong className="text-cyan-300">{summary.urgency}</strong>
              </div>
              <div className="flex items-center justify-between gap-3 text-slate-400">
                <span>Regional Spread:</span>
                <strong className="text-slate-200">{summary.districtsCount}/10 Districts</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Quick Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Active Openings</span>
            <Briefcase className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">{summary.totalOpenings.toLocaleString()}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">{summary.jobPostingsCount} distinct postings</p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Hiring Employers</span>
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">{summary.distinctEmployersCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Corporate partners</p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Avg Market Package</span>
            <Award className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-300 font-mono">
            ₹{(summary.avgSalaryINR / 100000).toFixed(1)} LPA
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">₹{summary.avgSalaryINR.toLocaleString()} / year</p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Accredited Courses</span>
            <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">{teachingCourses.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Active curriculum syllabi</p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Net Skill Deficit</span>
            <AlertTriangle className={`w-3.5 h-3.5 ${skillGapInfo.netDeficit > 0 ? 'text-red-400' : 'text-emerald-400'}`} />
          </div>
          <div className={`text-xl font-bold font-mono ${skillGapInfo.netDeficit > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {skillGapInfo.netDeficit > 0 ? `-${skillGapInfo.netDeficit.toLocaleString()}` : 'Balanced'}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">{skillGapInfo.urgencyLevel}</p>
        </div>
      </div>

      {/* Explainable Skill Demand Score Breakdown Hero */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              Explainable Skill Demand Score Breakdown (0 - 100)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic four-factor weighted formula normalizing job volume, employer breadth, regional presence, and velocity.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-300 bg-cyan-950 border border-cyan-800/80 px-2.5 py-1 rounded-md">
            Formula: 35% Volume + 25% Employers + 20% Geo Spread + 20% Velocity
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Factor 1: Postings Volume */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 font-medium">1. Job Postings Volume</span>
              <span className="font-mono text-cyan-400 font-bold">{scoreBreakdown.postingsFactor} / 35 pts</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(scoreBreakdown.postingsFactor / 35) * 100}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400">
              Evaluated against peak posting volume across Maharashtra requisitions ({summary.jobPostingsCount} active postings).
            </p>
          </div>

          {/* Factor 2: Employer Breadth */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 font-medium">2. Employer Diversity</span>
              <span className="font-mono text-blue-400 font-bold">{scoreBreakdown.employerFactor} / 25 pts</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(scoreBreakdown.employerFactor / 25) * 100}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400">
              Multi-employer reliance index across {summary.distinctEmployersCount} unique corporate hiring partners.
            </p>
          </div>

          {/* Factor 3: Geographic Spread */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 font-medium">3. Geographic Spread</span>
              <span className="font-mono text-indigo-400 font-bold">{scoreBreakdown.geographicFactor} / 20 pts</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(scoreBreakdown.geographicFactor / 20) * 100}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400">
              Spans {summary.districtsCount} of 10 industrial districts across Western, Northern, and Vidarbha corridors.
            </p>
          </div>

          {/* Factor 4: Growth Velocity */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 font-medium">4. Growth Velocity</span>
              <span className="font-mono text-emerald-400 font-bold">{scoreBreakdown.growthFactor} / 20 pts</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(scoreBreakdown.growthFactor / 20) * 100}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400">
              Momentum trajectory indicating {summary.growthPercentage > 0 ? `+${summary.growthPercentage}%` : `${summary.growthPercentage}%`} demand acceleration.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Demand & Market Analytics
        </button>
        <button
          onClick={() => setActiveTab('employers')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'employers'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Employer Demand ({employerDemand.length})
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'courses'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Teaching Courses ({teachingCourses.length})
        </button>
        <button
          onClick={() => setActiveTab('gap')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'gap'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Skill Gap & Seat Sanction
        </button>
      </div>

      {/* TAB CONTENT 1: OVERVIEW (Demand Trend, Roles, Sectors, Districts, Proficiency) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Row: Demand Over Time & Proficiency Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Demand Trend Over Time */}
            <div className="lg:col-span-2 bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    Demand Trajectory Over Time (Openings & Postings)
                  </h3>
                  <p className="text-xs text-slate-400">Monthly progression of active employer hiring requisitions</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {demandTrendOverTime.map((pt, idx) => {
                  const pct = maxPeriodOpenings > 0 ? (pt.openings / maxPeriodOpenings) * 100 : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-300">{pt.period}</span>
                        <div className="flex items-center gap-3 font-mono text-[11px]">
                          <span className="text-blue-400 font-bold">{pt.openings} openings</span>
                          <span className="text-slate-500">({pt.postings} postings)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Required Proficiency Breakdown */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-amber-400" />
                  Required Proficiency Level
                </h3>
                <p className="text-xs text-slate-400 mb-4">Distribution required by industry job postings</p>

                <div className="space-y-4">
                  {proficiencyBreakdown.map((item, idx) => {
                    const color = item.proficiency === 'advanced'
                      ? 'from-purple-600 to-indigo-500'
                      : item.proficiency === 'intermediate'
                        ? 'from-blue-600 to-cyan-500'
                        : 'from-emerald-600 to-teal-500';

                    const label = item.proficiency === 'basic'
                      ? 'Basic / Foundational (L1)'
                      : item.proficiency === 'intermediate'
                        ? 'Intermediate / Practitioner (L2)'
                        : 'Advanced / Master (L3)';

                    return (
                      <div key={idx} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-semibold text-slate-200">{label}</span>
                          <span className="font-mono font-bold text-white">{item.sharePercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1.5">
                          <div
                            className={`bg-gradient-to-r ${color} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${item.sharePercentage}%` }}
                          ></div>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.openings.toLocaleString()} openings require this level
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Primary industry benchmark is Intermediate/Practitioner proficiency.</span>
              </div>
            </div>
          </div>

          {/* Middle Row: Related Job Roles & Related Sectors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Related Job Roles */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-400" />
                    Related Job Roles
                  </h3>
                  <p className="text-xs text-slate-400">Positions demanding this core competency</p>
                </div>
                <span className="text-xs font-mono text-slate-400">{relatedJobRoles.length} roles</span>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {relatedJobRoles.map(role => (
                  <div
                    key={role.roleId}
                    className="p-3 bg-slate-900/70 hover:bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{role.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {role.sectorName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>Importance: <strong className="text-slate-300 capitalize">{role.importance}</strong></span>
                        <span>&bull;</span>
                        <span>Level: <strong className="text-slate-300 capitalize">{role.minProficiency}</strong></span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-cyan-300 font-mono">{role.openings} Openings</div>
                      <div className="text-[11px] text-amber-400 font-mono">
                        ₹{(role.avgSalaryINR / 100000).toFixed(1)} LPA
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Sectors & District Distribution */}
            <div className="space-y-6">
              {/* Related Sectors */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Related Industry Sectors
                </h3>
                <p className="text-xs text-slate-400 mb-3">Cross-sector demand distribution</p>

                <div className="space-y-2">
                  {relatedSectors.map(sec => (
                    <div key={sec.sectorId} className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-slate-300 font-medium truncate">{sec.name}</span>
                      <div className="flex items-center gap-2 w-48 shrink-0">
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full"
                            style={{ width: `${sec.sharePercentage}%` }}
                          ></div>
                        </div>
                        <span className="w-10 text-right font-mono font-bold text-slate-200">
                          {sec.sharePercentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Districts */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  District Distribution
                </h3>
                <p className="text-xs text-slate-400 mb-3">Regional concentrations across Maharashtra</p>

                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {districtDistribution.map(dist => (
                    <div key={dist.districtId} className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-200">{dist.name}</span>
                        {dist.topEmployerName && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Top recruiter: {dist.topEmployerName}
                          </span>
                        )}
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-emerald-400">{dist.openings} openings</span>
                        <span className="text-slate-500 text-[10px] ml-1.5">({dist.sharePercentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: EMPLOYER DEMAND */}
      {activeTab === 'employers' && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Active Employer Requisitions ({employerDemand.length} Organizations)
              </h3>
              <p className="text-xs text-slate-400">Employers currently seeking candidates skilled in {skill.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {employerDemand.map(emp => (
              <div
                key={emp.employerId}
                className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">{emp.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{emp.sectorName} &bull; {emp.districtName} District</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {emp.tier}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">{emp.postingsCount} Job Postings</span>
                  <span className="font-bold text-cyan-400">{emp.openings} Active Openings</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: TEACHING COURSES */}
      {activeTab === 'courses' && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-400" />
                Accredited Courses Teaching this Competency ({teachingCourses.length})
              </h3>
              <p className="text-xs text-slate-400">Vocational syllabi incorporating practical training in this skill</p>
            </div>
          </div>

          {teachingCourses.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800/60">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">No Accredited Courses Currently Cover This Skill</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                This represents a critical curriculum gap. The State Directorate of Vocational Education is advised to sanction new modules.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teachingCourses.map(course => (
                <div
                  key={course.courseId}
                  className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-purple-800/60 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/60">
                        {course.courseCode}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1.5">{course.courseTitle}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{course.instituteName} &bull; {course.districtName}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {course.healthScore}% Alignment
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-400">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Goal</span>
                      <strong className="text-slate-200 capitalize">{course.proficiencyGoal}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Hours</span>
                      <strong className="text-slate-200">{course.practicalHours}p / {course.theoryHours}t</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Capacity</span>
                      <strong className="text-slate-200">{course.annualCapacity} seats</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 4: SKILL GAP & SEAT SANCTION */}
      {activeTab === 'gap' && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Statewide Skill Gap Analysis & Seat Sanction Recommendation
              </h3>
              <p className="text-xs text-slate-400">Quantified supply vs demand equilibrium for strategic workforce planning</p>
            </div>
            <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono uppercase ${
              skillGapInfo.urgencyLevel === 'Severe Shortage'
                ? 'bg-red-950 text-red-300 border border-red-800'
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              {skillGapInfo.urgencyLevel}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <span className="text-xs text-slate-400">Market Openings Demand</span>
              <div className="text-2xl font-bold text-cyan-300 font-mono mt-1">
                {skillGapInfo.openingsDemand.toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <span className="text-xs text-slate-400">Annual Trainee Supply</span>
              <div className="text-2xl font-bold text-purple-300 font-mono mt-1">
                {skillGapInfo.traineeSupply.toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <span className="text-xs text-slate-400">Net Supply Deficit</span>
              <div className={`text-2xl font-bold font-mono mt-1 ${skillGapInfo.netDeficit > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {skillGapInfo.netDeficit > 0 ? `-${skillGapInfo.netDeficit.toLocaleString()}` : '0'}
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <span className="text-xs text-slate-400">Recommended Seats to Sanction</span>
              <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
                +{skillGapInfo.recommendedSeatsToSanction.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-950/30 border border-blue-800/60 rounded-xl">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Policy Sanction Directive</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {skillGapInfo.rationale} Based on an empirical 15% attrition buffer, the Directorate recommends expanding ITI and Polytechnic batch intake by <strong>+{skillGapInfo.recommendedSeatsToSanction} seats</strong> across regional industrial hubs.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
