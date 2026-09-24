/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  AlertTriangle,
  AlertOctagon,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  Info,
  ShieldAlert
} from 'lucide-react';
import {
  CourseHealthProfile,
  CourseHealthOverviewResponse,
  CourseHealthStatus,
  CourseSupplyDemandAlert,
  District,
  Sector
} from '../../types/dataModel.ts';
import { apiService } from '../../services/apiService.ts';
import { CourseHealthDetailModal } from './CourseHealthDetailModal.tsx';

interface CourseHealthPageProps {
  onNavigateToRecommendations?: (courseId?: string) => void;
  onNavigateToSkillGaps?: (courseId?: string) => void;
}

export const CourseHealthPage: React.FC<CourseHealthPageProps> = ({
  onNavigateToRecommendations,
  onNavigateToSkillGaps
}) => {
  const [data, setData] = useState<CourseHealthOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [onlyAlerts, setOnlyAlerts] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('compositeHealthScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Metadata dropdowns
  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);

  // Selected Course for Detail Modal
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<CourseHealthProfile | null>(null);

  // Explain calculation quick modal
  const [explainCourse, setExplainCourse] = useState<CourseHealthProfile | null>(null);

  // Alert drawer collapsed/expanded
  const [showAlertsDrawer, setShowAlertsDrawer] = useState(true);
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<'all' | 'critical' | 'warning'>('all');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overview, distList, secList] = await Promise.all([
        apiService.getCourseHealthOverview({
          sectorId: selectedSector !== 'all' ? selectedSector : undefined,
          districtId: selectedDistrict !== 'all' ? selectedDistrict : undefined,
          status: selectedStatus !== 'all' ? (selectedStatus as CourseHealthStatus) : undefined,
          hasAlert: onlyAlerts ? true : undefined,
          searchQuery: searchQuery ? searchQuery : undefined,
          sortBy,
          sortOrder
        }),
        apiService.getDistricts(),
        apiService.getSectors()
      ]);

      setData(overview);
      setDistricts(distList);
      setSectors(secList);
    } catch (err: any) {
      console.error('Failed to load course health data:', err);
      setError(err?.message || 'Failed to compute course health');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStatus, selectedSector, selectedDistrict, onlyAlerts, sortBy, sortOrder]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleOpenDetail = async (courseId: string) => {
    setSelectedCourseId(courseId);
    try {
      const detail = await apiService.getCourseHealthDetail(courseId);
      setSelectedCourseDetail(detail);
    } catch (err: any) {
      alert('Failed to load course details: ' + err.message);
      setSelectedCourseId(null);
    }
  };

  const getStatusBadge = (status: CourseHealthStatus) => {
    switch (status) {
      case 'High Demand':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            High Demand
          </span>
        );
      case 'Growing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            <TrendingUp className="w-3 h-3" />
            Growing
          </span>
        );
      case 'Stable':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            Stable
          </span>
        );
      case 'Declining':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <TrendingDown className="w-3 h-3" />
            Declining
          </span>
        );
      case 'Oversupplied':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3 h-3" />
            Oversupplied
          </span>
        );
      default:
        return null;
    }
  };

  const filteredAlerts = data?.mismatchAlerts.filter(a => {
    if (alertSeverityFilter === 'all') return true;
    return a.severity === alertSeverityFilter;
  }) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Course Health Monitor
            </h1>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-xs font-semibold">
              Explainable Real-Time Scoring
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Multi-factor analytical health profiles for vocational courses across Maharashtra. Health status is computed dynamically using <strong>Industry Demand</strong>, <strong>Skill Alignment</strong>, <strong>Placement Outcomes</strong>, <strong>Demand Trends</strong>, <strong>Candidate Supply</strong>, and <strong>Employer Requirements</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto">
          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700 transition cursor-pointer font-medium"
            title="Recalculate metrics from live database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Health Profiles</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Health Status Distribution */}
      {data?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          
          <div
            onClick={() => setSelectedStatus('all')}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              selectedStatus === 'all'
                ? 'bg-slate-800/90 border-blue-500 shadow-md'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
              Total Courses
            </span>
            <div className="text-2xl font-bold text-white">
              {data.summary.totalMonitoredCourses}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              All 24 ITI / VTP Curricula
            </div>
          </div>

          <div
            onClick={() => setSelectedStatus(selectedStatus === 'High Demand' ? 'all' : 'High Demand')}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              selectedStatus === 'High Demand'
                ? 'bg-emerald-950/70 border-emerald-500 shadow-md shadow-emerald-900/20'
                : 'bg-slate-950/60 border-slate-800 hover:border-emerald-800/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-emerald-400 uppercase tracking-wider font-bold">
                High Demand
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="text-2xl font-bold text-white">
              {data.summary.highDemandCount}
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-1 font-medium">
              Acute Shortage & High Hiring
            </div>
          </div>

          <div
            onClick={() => setSelectedStatus(selectedStatus === 'Growing' ? 'all' : 'Growing')}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              selectedStatus === 'Growing'
                ? 'bg-cyan-950/70 border-cyan-500 shadow-md shadow-cyan-900/20'
                : 'bg-slate-950/60 border-slate-800 hover:border-cyan-800/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-cyan-400 uppercase tracking-wider font-bold">
                Growing
              </span>
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {data.summary.growingCount}
            </div>
            <div className="text-[10px] text-cyan-400/80 mt-1 font-medium">
              Expanding Requisitions
            </div>
          </div>

          <div
            onClick={() => setSelectedStatus(selectedStatus === 'Stable' ? 'all' : 'Stable')}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              selectedStatus === 'Stable'
                ? 'bg-blue-950/70 border-blue-500 shadow-md shadow-blue-900/20'
                : 'bg-slate-950/60 border-slate-800 hover:border-blue-800/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-blue-400 uppercase tracking-wider font-bold">
                Stable
              </span>
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            </div>
            <div className="text-2xl font-bold text-white">
              {data.summary.stableCount}
            </div>
            <div className="text-[10px] text-blue-400/80 mt-1 font-medium">
              Equilibrium Hiring Cycles
            </div>
          </div>

          <div
            onClick={() => setSelectedStatus(selectedStatus === 'Declining' ? 'all' : 'Declining')}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              selectedStatus === 'Declining'
                ? 'bg-rose-950/70 border-rose-500 shadow-md shadow-rose-900/20'
                : 'bg-slate-950/60 border-slate-800 hover:border-rose-800/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-rose-400 uppercase tracking-wider font-bold">
                Declining
              </span>
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {data.summary.decliningCount}
            </div>
            <div className="text-[10px] text-rose-400/80 mt-1 font-medium">
              Contracting Requisitions
            </div>
          </div>

          <div
            onClick={() => setSelectedStatus(selectedStatus === 'Oversupplied' ? 'all' : 'Oversupplied')}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              selectedStatus === 'Oversupplied'
                ? 'bg-amber-950/70 border-amber-500 shadow-md shadow-amber-900/20'
                : 'bg-slate-950/60 border-slate-800 hover:border-amber-800/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-amber-400 uppercase tracking-wider font-bold">
                Oversupplied
              </span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {data.summary.oversuppliedCount}
            </div>
            <div className="text-[10px] text-amber-400/80 mt-1 font-medium">
              Surplus vs Local Absorption
            </div>
          </div>

          <div
            onClick={() => setOnlyAlerts(!onlyAlerts)}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              onlyAlerts
                ? 'bg-rose-950/80 border-rose-500 shadow-md shadow-rose-900/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-rose-800/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-rose-300 uppercase tracking-wider font-bold">
                Mismatch Alerts
              </span>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {data.summary.totalAlertsCount}
            </div>
            <div className="text-[10px] text-rose-400/90 mt-1 font-semibold">
              {data.summary.criticalAlertsCount} Critical Policy Alerts
            </div>
          </div>

        </div>
      )}

      {/* Supply & Demand Mismatch Alert Center */}
      {data?.mismatchAlerts && data.mismatchAlerts.length > 0 && (
        <div className="bg-slate-950/80 rounded-2xl border border-rose-900/40 overflow-hidden shadow-lg">
          <div className="p-4 bg-gradient-to-r from-rose-950/60 via-amber-950/40 to-slate-950 flex flex-wrap items-center justify-between gap-3 border-b border-rose-900/30">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-rose-900/40 border border-rose-700/50 text-rose-300">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Supply & Demand Mismatch Early-Warning System</span>
                  <span className="bg-rose-900 text-rose-200 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                    {data.mismatchAlerts.length} Actionable Alerts
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Flags courses where trainee intake, local absorption capacity, or syllabus competencies show significant structural mismatch.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setAlertSeverityFilter('all')}
                  className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                    alertSeverityFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({data.mismatchAlerts.length})
                </button>
                <button
                  onClick={() => setAlertSeverityFilter('critical')}
                  className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                    alertSeverityFilter === 'critical' ? 'bg-rose-900 text-rose-200' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Critical ({data.summary.criticalAlertsCount})
                </button>
                <button
                  onClick={() => setAlertSeverityFilter('warning')}
                  className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                    alertSeverityFilter === 'warning' ? 'bg-amber-900 text-amber-200' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Warning
                </button>
              </div>

              <button
                onClick={() => setShowAlertsDrawer(!showAlertsDrawer)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800 transition cursor-pointer"
              >
                {showAlertsDrawer ? 'Hide Alerts' : 'Show Alerts'}
              </button>
            </div>
          </div>

          {showAlertsDrawer && (
            <div className="p-4 space-y-2.5 max-h-72 overflow-y-auto">
              {filteredAlerts.slice(0, 6).map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition hover:shadow-md ${
                    alert.severity === 'critical'
                      ? 'bg-rose-950/30 border-rose-700/40 text-rose-100 hover:border-rose-600'
                      : alert.severity === 'warning'
                      ? 'bg-amber-950/20 border-amber-700/40 text-amber-100 hover:border-amber-600'
                      : 'bg-blue-950/20 border-blue-700/40 text-blue-100 hover:border-blue-600'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        alert.severity === 'critical'
                          ? 'bg-rose-900 text-rose-200'
                          : 'bg-amber-900 text-amber-200'
                      }`}>
                        {alert.severity}
                      </span>
                      <strong className="text-white text-sm">{alert.courseTitle}</strong>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{alert.message}</p>
                    <p className="text-[11px] text-slate-400">
                      <strong className="text-slate-300">Policy Recommendation:</strong> {alert.recommendedAction}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <div className="font-mono text-xs bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-700 text-right">
                      <span className="text-slate-400 text-[10px] block">Supply/Demand Ratio</span>
                      <strong className="text-white text-sm">{alert.metrics.ratio}x</strong>
                    </div>
                    <button
                      onClick={() => handleOpenDetail(alert.courseId)}
                      className="px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      Audit Course
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredAlerts.length > 6 && (
                <div className="text-center text-xs text-slate-400 pt-1">
                  Showing 6 of {filteredAlerts.length} mismatch alerts. Filter by course or click on individual table rows below.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by course name, code, institute, or target job role..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Sector Filter */}
          <select
            value={selectedSector}
            onChange={e => setSelectedSector(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Sectors</option>
            {sectors.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* District Filter */}
          <select
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Districts</option>
            {districts.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
          >
            <option value="compositeHealthScore">Sort: Overall Health Score</option>
            <option value="demand">Sort: Industry Demand Openings</option>
            <option value="alignment">Sort: Skill Alignment Score</option>
            <option value="placementRate">Sort: Placement Rate (%)</option>
            <option value="supplyDemandRatio">Sort: Supply/Demand Ratio</option>
            <option value="demandTrend">Sort: 12M Growth Trend</option>
          </select>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title={`Toggle sort order: Currently ${sortOrder.toUpperCase()}`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Course Health Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Course Details</th>
                <th className="p-4">Demand</th>
                <th className="p-4">Alignment</th>
                <th className="p-4">Placement Rate</th>
                <th className="p-4">Supply</th>
                <th className="p-4">Trend</th>
                <th className="p-4">Health Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                      <span>Computing explainable course health metrics from live labor market data...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-rose-400">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-rose-500" />
                    <span>Error: {error}</span>
                  </td>
                </tr>
              ) : data?.courses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    No courses match the active filter criteria.
                  </td>
                </tr>
              ) : (
                data?.courses.map(course => (
                  <tr
                    key={course.courseId}
                    className="hover:bg-slate-800/40 transition group cursor-pointer"
                    onClick={() => handleOpenDetail(course.courseId)}
                  >
                    
                    {/* Course Column */}
                    <td className="p-4 max-w-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-blue-400 bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-900 font-semibold">
                            {course.courseCode}
                          </span>
                          <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded">
                            {course.sectorName}
                          </span>
                          {course.alerts && course.alerts.length > 0 && (
                            <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.2 rounded font-bold">
                              {course.alerts.length} Alert{course.alerts.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-white text-sm group-hover:text-blue-300 transition">
                          {course.courseTitle}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {course.instituteName} &bull; {course.districtName}
                        </div>
                      </div>
                    </td>

                    {/* Demand Column */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-mono font-bold text-white">
                            {course.industryDemand.activeOpenings}
                          </span>
                          <span className="text-[11px] text-slate-400">openings</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {course.industryDemand.uniqueEmployersCount} hiring employers
                        </div>
                        <div className="text-[10px]">
                          <span className={`px-1.5 py-0.2 rounded font-semibold uppercase ${
                            course.industryDemand.urgencyLevel === 'high' ? 'bg-rose-950 text-rose-300' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {course.industryDemand.urgencyLevel} Urgency
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Alignment Column */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-base font-mono font-bold ${
                            course.skillAlignment.alignmentScore >= 80 ? 'text-emerald-400' : course.skillAlignment.alignmentScore >= 60 ? 'text-blue-400' : 'text-amber-400'
                          }`}>
                            {course.skillAlignment.alignmentScore}%
                          </span>
                        </div>
                        <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              course.skillAlignment.alignmentScore >= 80 ? 'bg-emerald-500' : course.skillAlignment.alignmentScore >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${course.skillAlignment.alignmentScore}%` }}
                          ></div>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {course.skillAlignment.skillsTaughtCount} taught &bull; {course.skillAlignment.skillsMissingCount} missing
                        </div>
                      </div>
                    </td>

                    {/* Placement Rate Column */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-base font-mono font-bold ${
                            course.placementRate >= 70 ? 'text-emerald-400' : course.placementRate >= 50 ? 'text-blue-400' : 'text-amber-400'
                          }`}>
                            {course.placementRate}%
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          ₹{(course.placementOutcomes.averageSalaryINR / 100000).toFixed(1)}L avg package
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {course.placementOutcomes.retentionRate6m}% 6m retention
                        </div>
                      </div>
                    </td>

                    {/* Supply Column */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-mono font-bold text-white">
                            {course.candidateSupply.totalCandidateSupply}
                          </span>
                          <span className="text-[11px] text-slate-400">supply</span>
                        </div>
                        <div className="text-[11px] flex items-center gap-1 font-mono font-bold">
                          <span className={course.candidateSupply.supplyDemandRatio <= 0.6 ? 'text-emerald-400' : course.candidateSupply.supplyDemandRatio >= 1.4 ? 'text-amber-400' : 'text-blue-400'}>
                            {course.candidateSupply.supplyDemandRatio}x
                          </span>
                          <span className="text-[10px] font-normal text-slate-400">ratio</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {course.candidateSupply.currentEnrolled} currently enrolled
                        </div>
                      </div>
                    </td>

                    {/* Trend Column */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className={`flex items-center gap-1 font-mono font-bold text-sm ${
                          course.demandTrend.growth12mPercentage >= 15 ? 'text-emerald-400' : course.demandTrend.growth12mPercentage <= -8 ? 'text-rose-400' : 'text-blue-400'
                        }`}>
                          {course.demandTrend.growth12mPercentage >= 0 ? '+' : ''}{course.demandTrend.growth12mPercentage}%
                          {course.demandTrend.growth12mPercentage >= 15 && <TrendingUp className="w-3.5 h-3.5" />}
                          {course.demandTrend.growth12mPercentage <= -8 && <TrendingDown className="w-3.5 h-3.5" />}
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {course.demandTrend.direction}
                        </div>
                      </div>
                    </td>

                    {/* Health Status Column */}
                    <td className="p-4">
                      <div className="space-y-1">
                        {getStatusBadge(course.healthStatus)}
                        <div className="text-[10px] text-slate-400 font-mono">
                          Score: <strong className="text-white">{course.compositeHealthScore}</strong>/100
                        </div>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setExplainCourse(course)}
                          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition cursor-pointer"
                          title="View mathematical calculation explainability breakdown"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDetail(course.courseId)}
                          className="px-2.5 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          <span>Audit</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-slate-950 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
          <div>
            Showing <strong className="text-white">{data?.courses.length || 0}</strong> evaluated vocational courses across Maharashtra
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> High Demand (Shortage)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Growing
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span> Stable
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span> Declining
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Oversupplied
            </span>
          </div>
        </div>

      </div>

      {/* Quick Explain Calculation Modal */}
      {explainCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-start justify-between">
              <div>
                <span className="font-mono text-xs text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                  {explainCourse.courseCode}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{explainCourse.courseTitle}</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  Assigned Status: <strong className="text-white">{explainCourse.healthStatus}</strong> (Score: {explainCourse.compositeHealthScore}/100)
                </div>
              </div>
              <button
                onClick={() => setExplainCourse(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
                  Explainable Status Rationale:
                </span>
                <p className="leading-relaxed text-slate-200">{explainCourse.statusExplanation}</p>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Analytical Factor Weights & Contribution:
                </span>
                <div className="space-y-2">
                  {explainCourse.calculationFactors.map((cf, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-white">{cf.factor}</div>
                        <div className="text-[11px] text-slate-400">{cf.detail}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-slate-200">{cf.value}</div>
                        <div className="text-[10px] text-slate-400">{cf.weight}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setExplainCourse(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Course Health Detail Modal */}
      {selectedCourseDetail && (
        <CourseHealthDetailModal
          profile={selectedCourseDetail}
          onClose={() => {
            setSelectedCourseDetail(null);
            setSelectedCourseId(null);
          }}
          onOpenRecommendations={courseId => {
            setSelectedCourseDetail(null);
            setSelectedCourseId(null);
            onNavigateToRecommendations?.(courseId);
          }}
          onRefresh={() => {
            if (selectedCourseId) {
              handleOpenDetail(selectedCourseId);
            }
            fetchData();
          }}
        />
      )}

    </div>
  );
};
