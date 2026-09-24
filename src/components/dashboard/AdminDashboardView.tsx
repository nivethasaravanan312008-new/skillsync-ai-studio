/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle, ShieldCheck, Download, Sparkles } from 'lucide-react';
import { apiService } from '../../services/apiService.ts';
import {
  DashboardFilters,
  DashboardMetrics,
  District,
  Sector,
  JobRole,
  Skill,
  Job,
  Employer,
  Course,
  SkillGap,
  Placement
} from '../../types/dataModel.ts';

import { FilterBar } from './FilterBar.tsx';
import { KPIGrid } from './KPIGrid.tsx';
import { DemandOverTimeChart } from './DemandOverTimeChart.tsx';
import { TopSkillsBarChart } from './TopSkillsBarChart.tsx';
import { TopJobRolesChart } from './TopJobRolesChart.tsx';
import { DemandBySectorChart } from './DemandBySectorChart.tsx';
import { DemandByDistrictChart } from './DemandByDistrictChart.tsx';
import { EmergingDecliningSkillsWidget } from './EmergingDecliningSkillsWidget.tsx';
import { CourseAlignmentChart } from './CourseAlignmentChart.tsx';
import { PlacementOutcomesWidget } from './PlacementOutcomesWidget.tsx';
import { AIInsightsCard } from './AIInsightsCard.tsx';
import { DetailModal, DrilldownType } from './DetailModal.tsx';

const DEFAULT_FILTERS: DashboardFilters = {
  dateRange: 'all',
  districtId: 'all',
  sectorId: 'all',
  jobRoleId: 'all',
  skillId: 'all'
};

export const AdminDashboardView: React.FC = () => {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Raw entity lists for filter dropdowns & modal drilldowns
  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [rawJobs, setRawJobs] = useState<Job[]>([]);
  const [rawEmployers, setRawEmployers] = useState<Employer[]>([]);
  const [rawCourses, setRawCourses] = useState<Course[]>([]);
  const [rawGaps, setRawGaps] = useState<SkillGap[]>([]);
  const [rawPlacements, setRawPlacements] = useState<Placement[]>([]);

  // Modal drilldown state
  const [activeDrilldown, setActiveDrilldown] = useState<DrilldownType | null>(null);

  // AI insights state
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiSource, setAiSource] = useState<string>('Live Dynamic Engine');

  // Initial metadata and lookup loads
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [dList, sList, rList, skList, empList, crsList, plList] = await Promise.all([
          apiService.getDistricts(),
          apiService.getSectors(),
          apiService.getJobRoles(),
          apiService.getSkills(),
          apiService.getEmployers(),
          apiService.getCourses(),
          apiService.getPlacements()
        ]);
        setDistricts(dList);
        setSectors(sList);
        setJobRoles(rList);
        setSkills(skList);
        setRawEmployers(empList);
        setRawCourses(crsList);
        setRawPlacements(plList);
      } catch (err: any) {
        console.error('Error loading taxonomy lookups:', err);
      }
    };
    loadLookups();
  }, []);

  // Fetch metrics dynamically whenever filters change
  const fetchDashboard = async (currentFilters: DashboardFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getDashboardMetrics(currentFilters);
      setMetrics(data);

      // Also refresh matching raw jobs and gaps for the drilldown modal
      const [matchingJobs, matchingGaps] = await Promise.all([
        apiService.getJobs({
          districtId: currentFilters.districtId !== 'all' ? currentFilters.districtId : undefined,
          sectorId: currentFilters.sectorId !== 'all' ? currentFilters.sectorId : undefined,
          jobRoleId: currentFilters.jobRoleId !== 'all' ? currentFilters.jobRoleId : undefined,
          limit: 100
        }),
        apiService.getSkillGaps(
          currentFilters.districtId !== 'all' ? currentFilters.districtId : undefined,
          currentFilters.sectorId !== 'all' ? currentFilters.sectorId : undefined
        )
      ]);

      setRawJobs(matchingJobs.items);
      setRawGaps(matchingGaps);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(filters);
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleRefreshAI = async () => {
    setIsAILoading(true);
    try {
      const res = await apiService.fetchAIInsights(filters);
      if (metrics && res.insights) {
        setMetrics({
          ...metrics,
          aiInsights: res.insights
        });
        setAiSource(res.source);
      }
    } catch (err) {
      console.error('Failed to regenerate AI insights:', err);
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        districts={districts}
        sectors={sectors}
        jobRoles={jobRoles}
        skills={skills}
      />

      {loading && !metrics ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-3" />
          <p className="text-sm font-medium">Aggregating live job requisitions, skills, and course alignment...</p>
          <p className="text-xs text-slate-500 mt-1">Calculating dynamic metrics across Maharashtra database</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/40 border border-red-800 rounded-xl text-red-200">
          <div className="flex items-center gap-2 font-bold text-red-400 mb-1">
            <AlertTriangle className="w-5 h-5" />
            <span>Dashboard Calculation Error</span>
          </div>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => fetchDashboard(filters)}
            className="mt-3 px-4 py-1.5 bg-red-800 hover:bg-red-700 text-white rounded text-xs transition"
          >
            Retry Calculation
          </button>
        </div>
      ) : metrics ? (
        <>
          {/* Section 1: 8 Clickable KPI Cards */}
          <KPIGrid
            metrics={metrics}
            onCardClick={type => setActiveDrilldown(type)}
          />

          {/* Section 2: AI Insights Section */}
          <AIInsightsCard
            insights={metrics.aiInsights}
            onRefresh={handleRefreshAI}
            isLoading={isAILoading}
            source={aiSource}
          />

          {/* Section 3: Time Trajectory & Top Skills */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DemandOverTimeChart data={metrics.charts.jobDemandOverTime} />
            </div>
            <div className="lg:col-span-1">
              <TopSkillsBarChart
                skills={metrics.charts.topSkillsByDemand}
                selectedSkillId={filters.skillId !== 'all' ? filters.skillId : undefined}
                onSelectSkill={skillId => {
                  handleFilterChange({
                    skillId: filters.skillId === skillId ? 'all' : skillId
                  });
                }}
              />
            </div>
          </div>

          {/* Section 4: Top Job Roles & Sector Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopJobRolesChart
              jobRoles={metrics.charts.topJobRoles}
              selectedRoleId={filters.jobRoleId !== 'all' ? filters.jobRoleId : undefined}
              onSelectRole={roleId => {
                handleFilterChange({
                  jobRoleId: filters.jobRoleId === roleId ? 'all' : roleId
                });
              }}
            />
            <DemandBySectorChart
              sectors={metrics.charts.demandBySector}
              selectedSectorId={filters.sectorId !== 'all' ? filters.sectorId : undefined}
              onSelectSector={sectorId => {
                handleFilterChange({
                  sectorId: filters.sectorId === sectorId ? 'all' : sectorId,
                  jobRoleId: 'all',
                  skillId: 'all'
                });
              }}
            />
          </div>

          {/* Section 5: Geographical Demand (10 Maharashtra Districts) */}
          <DemandByDistrictChart
            districts={metrics.charts.demandByDistrict}
            selectedDistrictId={filters.districtId !== 'all' ? filters.districtId : undefined}
            onSelectDistrict={districtId => {
              handleFilterChange({
                districtId: filters.districtId === districtId ? 'all' : districtId
              });
            }}
          />

          {/* Section 6: Emerging & Declining Skills */}
          <EmergingDecliningSkillsWidget
            emergingSkills={metrics.charts.emergingSkills}
            decliningSkills={metrics.charts.decliningSkills}
            onSelectSkill={skillId => {
              handleFilterChange({
                skillId: filters.skillId === skillId ? 'all' : skillId
              });
            }}
          />

          {/* Section 7: Course Alignment & Placement Outcomes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CourseAlignmentChart
              distribution={metrics.charts.courseAlignmentDistribution}
              onViewCourses={() => setActiveDrilldown('courses')}
            />
            <PlacementOutcomesWidget
              outcomes={metrics.charts.placementOutcomes}
              onViewPlacements={() => setActiveDrilldown('placements')}
            />
          </div>

          {/* Modal Drilldown for Details */}
          <DetailModal
            type={activeDrilldown}
            onClose={() => setActiveDrilldown(null)}
            jobs={rawJobs}
            skills={skills}
            employers={rawEmployers}
            courses={rawCourses}
            districts={districts}
            gaps={rawGaps}
            placements={rawPlacements}
          />
        </>
      ) : null}
    </div>
  );
};
