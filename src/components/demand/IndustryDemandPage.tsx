/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  Briefcase,
  Building2,
  TrendingUp,
  Layers,
  Award,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { apiService } from '../../services/apiService.ts';
import {
  District,
  Sector,
  JobRole,
  Skill,
  IndustryDemandFilters,
  IndustryDemandIntelligenceResponse
} from '../../types/dataModel.ts';
import { DemandFilters } from './DemandFilters.tsx';
import { SkillDemandTable } from './SkillDemandTable.tsx';
import { ExperienceDemandWidget } from './ExperienceDemandWidget.tsx';
import { ProficiencyDemandWidget } from './ProficiencyDemandWidget.tsx';
import { SkillIntelligenceView } from './SkillIntelligenceView.tsx';

// Charts from dashboard module
import { DemandOverTimeChart } from '../dashboard/DemandOverTimeChart.tsx';
import { DemandBySectorChart } from '../dashboard/DemandBySectorChart.tsx';
import { DemandByDistrictChart } from '../dashboard/DemandByDistrictChart.tsx';
import { TopJobRolesChart } from '../dashboard/TopJobRolesChart.tsx';
import { EmergingDecliningSkillsWidget } from '../dashboard/EmergingDecliningSkillsWidget.tsx';

interface IndustryDemandPageProps {
  initialSkillId?: string | null;
  onClearSkillSelection?: () => void;
}

export function IndustryDemandPage({ initialSkillId, onClearSkillSelection }: IndustryDemandPageProps = {}) {
  const [filters, setFilters] = useState<IndustryDemandFilters>({
    districtId: 'all',
    sectorId: 'all',
    jobRoleId: 'all',
    skillId: 'all',
    experienceLevel: 'all',
    dateRange: 'all'
  });

  const [data, setData] = useState<IndustryDemandIntelligenceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dedicated Skill Intelligence page selection
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(initialSkillId || null);

  useEffect(() => {
    if (initialSkillId) {
      setSelectedSkillId(initialSkillId);
    }
  }, [initialSkillId]);

  // Filter reference metadata
  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  // Load filter reference metadata once
  useEffect(() => {
    Promise.all([
      apiService.getDistricts(),
      apiService.getSectors(),
      apiService.getJobRoles(),
      apiService.getSkills()
    ]).then(([d, s, r, sk]) => {
      setDistricts(d);
      setSectors(s);
      setJobRoles(r);
      setSkills(sk);
    }).catch(err => {
      console.error('Error loading filter options:', err);
    });
  }, []);

  // Fetch Industry Demand Intelligence whenever filters change
  const fetchDemandIntelligence = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getIndustryDemandIntelligence(filters);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load industry demand intelligence');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandIntelligence();
  }, [filters]);

  // If a skill is selected, render the dedicated Skill Intelligence View
  if (selectedSkillId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <SkillIntelligenceView
          skillId={selectedSkillId}
          onBack={() => {
            setSelectedSkillId(null);
            if (onClearSkillSelection) onClearSkillSelection();
          }}
          onSelectSkill={(newId) => setSelectedSkillId(newId)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Module Title & Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono uppercase font-bold tracking-wider">
                Module: Industry Demand Intelligence
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-mono">
                Explainable 0-100 Algorithm
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Industry Demand Intelligence
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Real-time multi-dimensional analytics derived directly from active Maharashtra employer requisitions.
              Evaluates skill velocity, career experience thresholds, proficiency requirements, and regional geographic spread.
            </p>
          </div>

          {/* Quick Refresh / Metric status */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchDemandIntelligence}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Recalculating...' : 'Refresh Demand'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Banner */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Jobs Analyzed</span>
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {data.summary.totalJobsAnalyzed.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Matching active criteria</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Active Openings</span>
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-cyan-300 font-mono">
              {data.summary.totalOpenings.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Total statewide vacancies</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Skills Tracked</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {data.summary.skillsCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Scored competencies</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Distinct Employers</span>
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {data.summary.distinctEmployersCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Hiring corporations</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Avg Market Package</span>
              <Award className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300 font-mono">
              ₹{(data.summary.avgSalaryINR / 100000).toFixed(1)} LPA
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Annual compensation</p>
          </div>
        </div>
      )}

      {/* Multi-Dimensional Filters */}
      <DemandFilters
        filters={filters}
        onChange={setFilters}
        districts={districts}
        sectors={sectors}
        jobRoles={jobRoles}
        skills={skills}
      />

      {/* Demand Score Methodology Callout */}
      <div className="bg-slate-950/60 border border-slate-800/90 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Explainable Skill Demand Score (0 - 100 Index)
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Every skill is evaluated using four transparent, explainable factors:
              <strong className="text-cyan-300"> 35% Job Postings Volume</strong>,
              <strong className="text-blue-300"> 25% Employer Diversity</strong>,
              <strong className="text-indigo-300"> 20% Geographic Spread (10 Districts)</strong>, and
              <strong className="text-emerald-300"> 20% Growth Velocity</strong>.
              Normalized to an intuitive 0-100 scale.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Dynamic Real-Time Calculation</span>
        </div>
      </div>

      {loading && !data && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-mono">Aggregating employer demand models across Maharashtra...</p>
        </div>
      )}

      {error && (
        <div className="p-6 bg-red-950/30 border border-red-800 rounded-xl text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-white">{error}</p>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Main Table: Every Skill with Demand Score & Factors */}
          <SkillDemandTable
            skills={data.skillsRanked}
            onSelectSkill={(skillId) => setSelectedSkillId(skillId)}
          />

          {/* Experience & Proficiency Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExperienceDemandWidget experienceData={data.demandByExperience} />
            <ProficiencyDemandWidget proficiencyData={data.demandByProficiency} />
          </div>

          {/* Demand Over Time */}
          <DemandOverTimeChart
            data={data.demandOverTime}
          />

          {/* Sector & District Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DemandBySectorChart
              sectors={data.demandBySector}
              onSelectSector={(sectorId) => {
                setFilters({
                  ...filters,
                  sectorId: filters.sectorId === sectorId ? 'all' : sectorId,
                  jobRoleId: 'all',
                  skillId: 'all'
                });
              }}
              selectedSectorId={filters.sectorId}
            />

            <DemandByDistrictChart
              districts={data.demandByDistrict}
              onSelectDistrict={(districtId) => {
                setFilters({
                  ...filters,
                  districtId: filters.districtId === districtId ? 'all' : districtId
                });
              }}
              selectedDistrictId={filters.districtId}
            />
          </div>

          {/* Top Job Roles */}
          <TopJobRolesChart
            jobRoles={data.topJobRoles}
            onSelectRole={(roleId) => {
              setFilters({
                ...filters,
                jobRoleId: filters.jobRoleId === roleId ? 'all' : roleId
              });
            }}
            selectedRoleId={filters.jobRoleId}
          />

          {/* Emerging & Declining Skills */}
          <EmergingDecliningSkillsWidget
            emergingSkills={data.emergingSkills}
            decliningSkills={data.decliningSkills}
            onSelectSkill={(skillId) => setSelectedSkillId(skillId)}
          />
        </div>
      )}
    </div>
  );
}
