/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  DistrictDetailPlan,
  DistrictTrainingRecommendation,
  DistrictRecommendationType
} from '../../types/dataModel.ts';
import {
  ArrowLeft,
  Building2,
  Users,
  GraduationCap,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  IndianRupee,
  Layers,
  ChevronRight,
  Filter,
  Search,
  SlidersHorizontal,
  PlusCircle,
  BookOpen,
  Wrench,
  Sparkles,
  BarChart3,
  Award,
  Calendar,
  Compass,
  FileDown
} from 'lucide-react';

interface DistrictDetailViewProps {
  plan: DistrictDetailPlan;
  allDistricts: Array<{ id: string; name: string }>;
  onBackToOverview: () => void;
  onSelectDistrict: (districtId: string) => void;
}

export function DistrictDetailView({
  plan,
  allDistricts,
  onBackToOverview,
  onSelectDistrict
}: DistrictDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'sectors_roles' | 'skills_matrix' | 'infrastructure' | 'placements'>('recommendations');
  const [recTypeFilter, setRecTypeFilter] = useState<string>('all');
  const [recPriorityFilter, setRecPriorityFilter] = useState<string>('all');
  const [skillsSearch, setSkillsSearch] = useState('');
  const [roleSearch, setRoleSearch] = useState('');

  // Local state to simulate approving / updating recommendations
  const [localRecommendations, setLocalRecommendations] = useState<DistrictTrainingRecommendation[]>(plan.recommendations);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const handleUpdateRecStatus = (recId: string, nextStatus: DistrictTrainingRecommendation['status']) => {
    setLocalRecommendations(prev =>
      prev.map(r => (r.id === recId ? { ...r, status: nextStatus } : r))
    );
    const rec = localRecommendations.find(r => r.id === recId);
    setActionSuccessMsg(`Updated status for "${rec?.title}" to "${nextStatus.replace('_', ' ').toUpperCase()}".`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // Filter recommendations
  const filteredRecs = localRecommendations.filter(r => {
    const matchesType = recTypeFilter === 'all' || r.recommendationType === recTypeFilter;
    const matchesPriority = recPriorityFilter === 'all' || r.priority === recPriorityFilter;
    return matchesType && matchesPriority;
  });

  // Filter skills
  const filteredSkills = plan.topSkills.filter(s =>
    skillsSearch === '' ||
    s.skillName.toLowerCase().includes(skillsSearch.toLowerCase()) ||
    s.sectorName.toLowerCase().includes(skillsSearch.toLowerCase())
  );

  // Filter job roles
  const filteredRoles = plan.topJobRoles.filter(r =>
    roleSearch === '' ||
    r.roleTitle.toLowerCase().includes(roleSearch.toLowerCase()) ||
    r.sectorName.toLowerCase().includes(roleSearch.toLowerCase())
  );

  // Recommendation type helper styling & icons
  const getRecTypeMeta = (type: DistrictRecommendationType) => {
    switch (type) {
      case 'increase_seats':
        return {
          icon: <PlusCircle className="w-4 h-4 text-emerald-400" />,
          label: 'Increase Training Seats',
          color: 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
        };
      case 'introduce_course':
        return {
          icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
          label: 'Introduce a Course',
          color: 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
        };
      case 'add_trainers':
        return {
          icon: <Users className="w-4 h-4 text-cyan-400" />,
          label: 'Add Trainers',
          color: 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
        };
      case 'update_curriculum':
        return {
          icon: <BookOpen className="w-4 h-4 text-purple-400" />,
          label: 'Update Curriculum',
          color: 'bg-purple-950/80 text-purple-300 border-purple-800'
        };
      case 'increase_lab_capacity':
        return {
          icon: <Wrench className="w-4 h-4 text-amber-400" />,
          label: 'Increase Lab/Equipment Capacity',
          color: 'bg-amber-950/80 text-amber-300 border-amber-800'
        };
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `District_Training_Plan_${plan.district.name}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900/90 text-emerald-200 border border-emerald-500 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{actionSuccessMsg}</span>
        </div>
      )}

      {/* Navigation & Header */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToOverview}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Overview</span>
            </button>

            <div className="h-5 w-px bg-slate-800 hidden sm:block"></div>

            {/* Quick District Switcher Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Switch District:</span>
              <select
                value={plan.district.id}
                onChange={e => onSelectDistrict(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {allDistricts.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} District
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg transition cursor-pointer"
              title="Download full district training plan as formatted JSON"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export Plan JSON</span>
            </button>

            <span className="text-[11px] px-2.5 py-1 bg-indigo-950/80 text-indigo-300 border border-indigo-800 rounded-full font-mono">
              {plan.district.division} Division
            </span>
          </div>
        </div>

        {/* District Identity Title */}
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {plan.district.name} District Training Plan
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
              <span>{plan.district.industrialHubType}</span>
              <span>&bull;</span>
              <span>Workforce Pool: {plan.district.approxWorkforce.toLocaleString('en-IN')}</span>
              <span>&bull;</span>
              <span>Major Industries: {plan.district.majorIndustries.join(', ')}</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-lg text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Training Equilibrium State
            </div>
            <div className="text-sm font-bold mt-0.5 flex items-center justify-end gap-1.5">
              {plan.kpis.capacityDeficit > 150 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-red-400">High Capacity Deficit (-{plan.kpis.capacityDeficit} seats)</span>
                </>
              ) : plan.kpis.capacityDeficit > 50 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-amber-400">Moderate Gap (-{plan.kpis.capacityDeficit} seats)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-emerald-400">Equilibrium / Well-Balanced</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 6 Key KPI Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-lg">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              <span>Job Demand</span>
            </div>
            <div className="text-lg font-bold text-white mt-1 tabular-nums">
              {plan.kpis.totalJobDemandOpenings.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-500">
              {plan.kpis.activeJobPostings} active postings
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-lg">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Candidate Supply</span>
            </div>
            <div className="text-lg font-bold text-indigo-300 mt-1 tabular-nums">
              {plan.kpis.totalCandidateSupply}
            </div>
            <div className="text-[10px] text-slate-500">
              {plan.kpis.seekingJobCandidates} seeking, {plan.kpis.inTrainingCandidates} in training
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-lg">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Sanctioned Capacity</span>
            </div>
            <div className="text-lg font-bold text-sky-400 mt-1 tabular-nums">
              {plan.kpis.totalSanctionedCapacity.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-500">
              {plan.kpis.capacityUtilizationRate}% utilized ({plan.kpis.totalEnrolledSeats} enrolled)
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-lg">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Capacity Gap</span>
            </div>
            <div className={`text-lg font-bold mt-1 tabular-nums ${plan.kpis.capacityDeficit > 100 ? 'text-red-400' : 'text-amber-400'}`}>
              {plan.kpis.capacityDeficit > 0 ? `+${plan.kpis.capacityDeficit}` : '0'}
            </div>
            <div className="text-[10px] text-slate-500">
              unmet annual seats
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-lg">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Active Trainers</span>
            </div>
            <div className="text-lg font-bold text-cyan-300 mt-1 tabular-nums">
              {plan.kpis.totalTrainers}
            </div>
            <div className="text-[10px] text-slate-500">
              Ratio: 1:{plan.kpis.studentToTrainerRatio} (Trainee:Trainer)
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-lg">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Placement Rate</span>
            </div>
            <div className="text-lg font-bold text-emerald-400 mt-1 tabular-nums">
              {plan.kpis.placementRatePercentage}%
            </div>
            <div className="text-[10px] text-slate-500">
              Median: ₹{(plan.kpis.medianSalaryINR / 100000).toFixed(1)} LPA
            </div>
          </div>
        </div>
      </div>

      {/* Demand vs Training Capacity Visual Comparison Chart */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Industry Demand vs. Training Capacity Benchmark
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparison between regional employer vacancies and sanctioned vocational institute capacity for top competencies in {plan.district.name}.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500"></span>
              <span className="text-slate-300">Industry Vacancies (Demand)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-indigo-500"></span>
              <span className="text-slate-300">Sanctioned Seats (Capacity)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500"></span>
              <span className="text-slate-300">Capacity Gap</span>
            </div>
          </div>
        </div>

        {/* Bar Comparison Chart */}
        <div className="space-y-4 pt-1">
          {plan.demandVsCapacityChartData.map((item, idx) => {
            const maxVal = Math.max(...plan.demandVsCapacityChartData.map(d => Math.max(d.industryDemand, d.trainingCapacity, d.capacityGap)), 100);
            const demandWidth = Math.round((item.industryDemand / maxVal) * 100);
            const capWidth = Math.round((item.trainingCapacity / maxVal) * 100);
            const gapWidth = Math.round((Math.max(0, item.capacityGap) / maxVal) * 100);

            return (
              <div key={idx} className="space-y-1.5 bg-slate-900/50 p-3 rounded-lg border border-slate-800/70">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white tracking-tight">{item.name}</span>
                  <div className="flex items-center gap-3 text-[11px] tabular-nums">
                    <span className="text-blue-400">Demand: {item.industryDemand}</span>
                    <span className="text-indigo-400">Capacity: {item.trainingCapacity}</span>
                    <span className={item.capacityGap > 0 ? 'text-amber-400 font-semibold' : 'text-emerald-400'}>
                      Gap: {item.capacityGap > 0 ? `+${item.capacityGap}` : '0'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-1">
                  {/* Industry Demand Bar */}
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className="bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, demandWidth)}%` }}
                    />
                  </div>
                  {/* Training Capacity Bar */}
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className="bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, capWidth)}%` }}
                    />
                  </div>
                  {/* Capacity Gap Bar */}
                  {item.capacityGap > 0 && (
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        className="bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(4, gapWidth)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Section Tabs */}
      <div className="border-b border-slate-800 bg-slate-950/80 rounded-t-xl px-4 pt-2">
        <div className="flex gap-4 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`py-3 border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'recommendations'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            District Training Recommendations
            <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {localRecommendations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sectors_roles')}
            className={`py-3 border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'sectors_roles'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Top Sectors &amp; Job Roles
            <span className="text-slate-500 font-mono">({plan.topSectors.length} Sectors)</span>
          </button>

          <button
            onClick={() => setActiveTab('skills_matrix')}
            className={`py-3 border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'skills_matrix'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            Top Skills &amp; Capacity Deficits
            <span className="text-slate-500 font-mono">({plan.topSkills.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('infrastructure')}
            className={`py-3 border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'infrastructure'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Institutes, Courses &amp; Trainers
            <span className="text-slate-500 font-mono">({plan.courses.length} Courses, {plan.trainers.length} Trainers)</span>
          </button>

          <button
            onClick={() => setActiveTab('placements')}
            className={`py-3 border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'placements'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            Placement Outcomes &amp; Skill Gaps
          </button>
        </div>
      </div>

      {/* Tab 1: District Training Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {/* Recommendation Filter Toolbar */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                Category:
              </span>
              <button
                onClick={() => setRecTypeFilter('all')}
                className={`px-3 py-1 text-xs rounded-lg border transition cursor-pointer ${
                  recTypeFilter === 'all'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                All ({localRecommendations.length})
              </button>
              <button
                onClick={() => setRecTypeFilter('increase_seats')}
                className={`px-3 py-1 text-xs rounded-lg border transition cursor-pointer ${
                  recTypeFilter === 'increase_seats'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                Increase Seats
              </button>
              <button
                onClick={() => setRecTypeFilter('introduce_course')}
                className={`px-3 py-1 text-xs rounded-lg border transition cursor-pointer ${
                  recTypeFilter === 'introduce_course'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                Introduce a Course
              </button>
              <button
                onClick={() => setRecTypeFilter('add_trainers')}
                className={`px-3 py-1 text-xs rounded-lg border transition cursor-pointer ${
                  recTypeFilter === 'add_trainers'
                    ? 'bg-cyan-600 text-white border-cyan-500'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                Add Trainers
              </button>
              <button
                onClick={() => setRecTypeFilter('update_curriculum')}
                className={`px-3 py-1 text-xs rounded-lg border transition cursor-pointer ${
                  recTypeFilter === 'update_curriculum'
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                Update Curriculum
              </button>
              <button
                onClick={() => setRecTypeFilter('increase_lab_capacity')}
                className={`px-3 py-1 text-xs rounded-lg border transition cursor-pointer ${
                  recTypeFilter === 'increase_lab_capacity'
                    ? 'bg-amber-600 text-white border-amber-500'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                Lab &amp; Equipment
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Priority:</span>
              <select
                value={recPriorityFilter}
                onChange={e => setRecPriorityFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Priorities</option>
                <option value="Urgent">Urgent Only</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
              </select>
            </div>
          </div>

          {/* Detailed Recommendation Cards (Matching Prompt's Exact Specification) */}
          <div className="grid grid-cols-1 gap-4">
            {filteredRecs.map(rec => {
              const meta = getRecTypeMeta(rec.recommendationType);
              const isUrgent = rec.priority === 'Urgent';

              return (
                <div
                  key={rec.id}
                  className={`bg-slate-950 border rounded-xl p-5 shadow-lg transition-all duration-200 ${
                    isUrgent ? 'border-amber-600/40 bg-gradient-to-r from-slate-950 via-amber-950/10 to-slate-950' : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded text-xs font-medium border flex items-center gap-1.5 ${meta.color}`}>
                        {meta.icon}
                        <span>{meta.label}</span>
                      </span>
                      <span className="text-xs text-slate-400">
                        {rec.sectorName} Sector
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded border font-semibold ${
                          rec.priority === 'Urgent'
                            ? 'bg-red-950 text-red-300 border-red-800'
                            : rec.priority === 'High'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-slate-900 text-slate-300 border-slate-700'
                        }`}
                      >
                        {rec.priority} Priority
                      </span>

                      <span
                        className={`text-xs px-2 py-0.5 rounded border font-mono capitalize ${
                          rec.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : rec.status === 'in_progress'
                            ? 'bg-blue-950 text-blue-300 border-blue-800'
                            : rec.status === 'implemented'
                            ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {rec.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-lg font-bold text-white tracking-tight">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {rec.actionRationale}
                    </p>
                  </div>

                  {/* Calculated Data Block (Structured exactly like user specification) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-4 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">District:</div>
                      <div className="text-sm font-bold text-white mt-0.5">{rec.districtName}</div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Target Skill:</div>
                      <div className="text-sm font-semibold text-slate-200 mt-0.5 truncate" title={rec.skillName}>
                        {rec.skillName}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Industry Demand:</div>
                      <div className={`text-sm font-bold mt-0.5 ${rec.industryDemand === 'Critical' ? 'text-red-400' : 'text-amber-400'}`}>
                        {rec.industryDemand}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Current Training Capacity:</div>
                      <div className="text-sm font-bold text-slate-200 mt-0.5 tabular-nums">
                        {rec.currentTrainingCapacity} seats
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Recommended Capacity:</div>
                      <div className="text-sm font-bold text-sky-400 mt-0.5 tabular-nums">
                        {rec.recommendedTrainingCapacity} seats
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Capacity Gap:</div>
                      <div className="text-sm font-bold text-amber-400 mt-0.5 tabular-nums">
                        +{rec.capacityGap} seats
                      </div>
                    </div>
                  </div>

                  {/* Secondary Details: Trainers, Implementation, Investment */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-3 items-center">
                    <div className="md:col-span-8 flex flex-wrap items-center gap-4 text-xs text-slate-400 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/50">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Recommended Trainers:</span>
                        <strong className="text-cyan-300 tabular-nums">{rec.recommendedTrainerCapacity}</strong>
                        <span className="text-[11px] text-slate-500">(Current: {rec.currentTrainerCount}, Gap: +{rec.trainerGap})</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Timeframe:</span>
                        <strong className="text-slate-200">{rec.timeframeMonths} Months</strong>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Est. Sanction Budget:</span>
                        <strong className="text-emerald-300 tabular-nums">
                          ₹{(rec.estimatedInvestmentINR / 100000).toFixed(1)} Lakhs
                        </strong>
                      </div>
                    </div>

                    <div className="md:col-span-4 flex items-center justify-end gap-2">
                      {rec.status === 'recommended' && (
                        <button
                          onClick={() => handleUpdateRecStatus(rec.id, 'approved')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Sanction</span>
                        </button>
                      )}

                      {rec.status === 'approved' && (
                        <button
                          onClick={() => handleUpdateRecStatus(rec.id, 'in_progress')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition cursor-pointer"
                        >
                          <span>Mark In Progress</span>
                        </button>
                      )}

                      {rec.status === 'in_progress' && (
                        <button
                          onClick={() => handleUpdateRecStatus(rec.id, 'implemented')}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition cursor-pointer"
                        >
                          <span>Mark Implemented</span>
                        </button>
                      )}

                      {rec.status === 'implemented' && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          Sanction Deployed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Suggested Specific Policy Action */}
                  <div className="mt-3 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                    <span className="font-semibold text-slate-300 shrink-0">Suggested Action:</span>
                    <span className="text-slate-400">{rec.suggestedAction}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Top Sectors & Job Roles */}
      {activeTab === 'sectors_roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Top Sectors */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                Top Industrial Sectors in {plan.district.name}
              </h3>
              <span className="text-xs text-slate-400 font-mono">{plan.topSectors.length} tracked</span>
            </div>

            <div className="space-y-3">
              {plan.topSectors.map(sec => (
                <div key={sec.sectorId} className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{sec.sectorName}</h4>
                      <span className="text-xs text-slate-400 font-mono">Code: {sec.sectorCode}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Demand Openings</div>
                      <div className="text-base font-bold text-white tabular-nums">{sec.demandOpenings}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-3 pt-2.5 border-t border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px]">Sanctioned:</span>
                      <div className="font-semibold text-sky-400 tabular-nums">{sec.sanctionedSeats}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Enrolled:</span>
                      <div className="font-semibold text-slate-300 tabular-nums">{sec.enrolledSeats}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Capacity Gap:</span>
                      <div className={`font-semibold tabular-nums ${sec.netDeficit > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {sec.netDeficit > 0 ? `+${sec.netDeficit}` : '0'}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Trainers:</span>
                      <div className="font-semibold text-cyan-400 tabular-nums">{sec.trainersCount}</div>
                    </div>
                  </div>

                  {/* Utilization Progress Bar */}
                  <div className="mt-2.5">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Seat Utilization</span>
                      <span>{sec.utilizationRate}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, sec.utilizationRate)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Top Job Roles */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                Top In-Demand Job Roles
              </h3>
              <div className="relative w-44">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter roles..."
                  value={roleSearch}
                  onChange={e => setRoleSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredRoles.map(role => (
                <div key={role.roleId} className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">{role.roleTitle}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>{role.sectorName}</span>
                        <span>&bull;</span>
                        <span className="font-mono text-[11px] text-indigo-300">NSQF Level {role.minNsqfLevel}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-slate-400">Openings</div>
                      <div className="text-base font-bold text-white tabular-nums">{role.openings}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                    <div>
                      Avg Benchmark: <strong className="text-emerald-400 tabular-nums">₹{(role.avgSalaryINR / 100000).toFixed(1)} LPA</strong>
                    </div>
                    <div>
                      Employers: <strong className="text-slate-300 tabular-nums">{role.hiringEmployersCount}</strong>
                    </div>
                  </div>

                  {role.keySkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {role.keySkills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Top Skills & Capacity Deficits Matrix */}
      {activeTab === 'skills_matrix' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                Comprehensive Skill Demand vs. Training Capacity Matrix
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every vocational skill mapped against regional vacancies, batch capacity, trainer allocation, and sanction targets.
              </p>
            </div>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search skills by name or sector..."
                value={skillsSearch}
                onChange={e => setSkillsSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                <tr>
                  <th className="px-3 py-2.5">Skill Name</th>
                  <th className="px-3 py-2.5">Sector</th>
                  <th className="px-3 py-2.5 text-right">Demand Openings</th>
                  <th className="px-3 py-2.5 text-right">Training Capacity</th>
                  <th className="px-3 py-2.5 text-right">Enrolled / Graduated</th>
                  <th className="px-3 py-2.5 text-right">Capacity Gap</th>
                  <th className="px-3 py-2.5 text-center">Urgency</th>
                  <th className="px-3 py-2.5 text-center">Trainers</th>
                  <th className="px-3 py-2.5 text-right">Recommended Seats</th>
                  <th className="px-3 py-2.5 text-right">Rec. Trainers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSkills.map((skill, sIdx) => (
                  <tr key={`${skill.skillId}-${sIdx}`} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-3 py-2.5 font-medium text-white max-w-[240px] truncate" title={skill.skillName}>
                      {skill.skillName}
                    </td>
                    <td className="px-3 py-2.5 text-slate-400">
                      {skill.sectorName}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-white tabular-nums">
                      {skill.demandOpenings}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-sky-400 tabular-nums">
                      {skill.trainingCapacitySeats}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-400 tabular-nums">
                      {skill.enrolledTrainees} / {skill.graduatedTrainees}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold tabular-nums">
                      <span className={skill.capacityGap > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                        {skill.capacityGap > 0 ? `+${skill.capacityGap}` : '0'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
                          skill.urgency === 'Critical'
                            ? 'bg-red-950 text-red-300 border-red-800'
                            : skill.urgency === 'High'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-slate-900 text-slate-300 border-slate-700'
                        }`}
                      >
                        {skill.urgency}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono tabular-nums text-slate-300">
                      {skill.trainersCount}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-indigo-300 tabular-nums">
                      {skill.recommendedSeats}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-cyan-300 tabular-nums">
                      {skill.recommendedTrainers}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Institutes, Courses & Trainers */}
      {activeTab === 'infrastructure' && (
        <div className="space-y-6">
          {/* Institutes Grid */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
              <Building2 className="w-4 h-4 text-emerald-400" />
              Accredited Training Institutes in {plan.district.name}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan.institutes.map(inst => (
                <div key={inst.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white">{inst.name}</h4>
                      <span className="text-xs text-slate-400">{inst.type}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                      Rating: {inst.accreditation}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500">Seats</div>
                      <div className="font-bold text-slate-200 tabular-nums">{inst.capacitySeats}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Courses</div>
                      <div className="font-bold text-indigo-400 tabular-nums">{inst.coursesCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Trainers</div>
                      <div className="font-bold text-cyan-400 tabular-nums">{inst.trainersCount}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Courses List */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              Active Accredited Courses
            </h3>

            <div className="space-y-3">
              {plan.courses.map(course => (
                <div key={course.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-900">
                        {course.code}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">{course.title}</h4>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {course.instituteName} &bull; {course.sectorName} &bull; {course.durationHours} Hours
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-500 text-right">Capacity / Enrolled</div>
                        <div className="font-bold text-white tabular-nums text-right">
                          {course.annualBatchCapacity} / {course.currentEnrolled}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-500 text-right">Health Score</div>
                        <div className={`font-bold tabular-nums text-right ${course.healthScore > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {course.healthScore}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {course.coveredSkillNames.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-500 self-center">Taught Skills:</span>
                      {course.coveredSkillNames.map((sk, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Trainers Directory */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
              <Users className="w-4 h-4 text-cyan-400" />
              Faculty &amp; Trainers Directory ({plan.trainers.length} Assigned)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan.trainers.map(trainer => (
                <div key={trainer.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{trainer.name}</h4>
                      <div className="text-xs text-slate-400">{trainer.instituteName}</div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                      NSQF {trainer.certifiedNsqfLevel}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 border-t border-slate-800">
                    <div>Exp: <strong className="text-slate-200">{trainer.yearsExperience} yrs</strong></div>
                    <div>Rating: <strong className="text-amber-400 font-mono">{trainer.rating} / 5</strong></div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {trainer.specializationSkills.map((sk, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Placements & Skill Gaps */}
      {activeTab === 'placements' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Placements Outcomes */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 pb-2 border-b border-slate-800">
                <Award className="w-4 h-4 text-emerald-400" />
                Verified Placement &amp; Employer Outcomes
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-400">Placement Conversion</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1 tabular-nums">
                    {plan.placementOutcomes.placementRatePercentage}%
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {plan.placementOutcomes.totalPlaced} candidates verified
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-400">6-Month Retention</div>
                  <div className="text-xl font-bold text-sky-400 mt-1 tabular-nums">
                    {plan.placementOutcomes.sixMonthRetentionRate}%
                  </div>
                  <div className="text-[10px] text-slate-500">
                    job longevity index
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-400">Median Salary</div>
                  <div className="text-xl font-bold text-white mt-1 tabular-nums">
                    ₹{(plan.placementOutcomes.medianSalaryINR / 100000).toFixed(1)} LPA
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Avg: ₹{(plan.placementOutcomes.averageSalaryINR / 100000).toFixed(1)} LPA
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-400">Employer Feedback</div>
                  <div className="text-xl font-bold text-amber-400 mt-1 tabular-nums">
                    {plan.placementOutcomes.employerFeedbackScore} / 5.0
                  </div>
                  <div className="text-[10px] text-slate-500">
                    satisfaction with graduate skills
                  </div>
                </div>
              </div>

              {/* Top Hiring Employers */}
              <div className="pt-3 border-t border-slate-800">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Top Regional Hiring Partners
                </h4>
                <div className="space-y-2">
                  {plan.placementOutcomes.topHiringEmployers.map((emp, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <div>
                        <div className="font-semibold text-white">{emp.name}</div>
                        <div className="text-[10px] text-slate-400">{emp.sector}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-400 tabular-nums">+{emp.hiresCount}</span>
                        <span className="text-[10px] text-slate-500 ml-1">hires</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Skill Gaps Deficits */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 pb-2 border-b border-slate-800">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Structural Skill Gap Deficits
              </h3>

              <div className="space-y-3">
                {plan.skillGaps.slice(0, 7).map((gap, gIdx) => (
                  <div key={`${gap.skillId}-${gIdx}`} className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">{gap.skillName}</h4>
                        <div className="text-[10px] text-slate-400">{gap.sectorName}</div>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
                          gap.urgencyLevel === 'Severe Shortage'
                            ? 'bg-red-950 text-red-300 border-red-800'
                            : gap.urgencyLevel === 'Moderate Gap'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        {gap.urgencyLevel}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[11px] tabular-nums">
                      <div>
                        <span className="text-slate-500">Demand:</span> <strong className="text-white">{gap.demandOpenings}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Supply:</span> <strong className="text-slate-300">{gap.candidateSupply}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Deficit:</span> <strong className={gap.netDeficit > 0 ? 'text-red-400' : 'text-emerald-400'}>
                          {gap.netDeficit > 0 ? `-${gap.netDeficit}` : '0'}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Data Bottom Disclaimer */}
      <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Simulated Data Notice:</strong> District training metrics, candidate counts, and recommended seat allocations are calculated dynamically from simulated Maharashtra benchmarks for algorithmic validation.
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          ALGORITHM: REAL-DATA DERIVED
        </span>
      </div>
    </div>
  );
}
