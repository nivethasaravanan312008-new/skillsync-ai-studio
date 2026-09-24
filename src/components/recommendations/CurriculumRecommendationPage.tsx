/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Layers,
  GraduationCap,
  Building2,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  ChevronDown,
  ChevronRight,
  Flame,
  CheckSquare,
  Square,
  Eye,
  MessageSquare
} from 'lucide-react';
import {
  CurriculumRecommendationItem,
  CourseCurriculumPlan,
  CurriculumRecommendationOverviewResponse,
  RecommendationStatus,
  RecommendationActionType,
  RecommendationPriority,
  RecommendationFilterParams,
  District,
  Sector,
  Course
} from '../../types/dataModel.ts';
import { apiService } from '../../services/apiService.ts';
import { RecommendationDetailModal } from './RecommendationDetailModal.tsx';

export const CurriculumRecommendationPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CurriculumRecommendationOverviewResponse | null>(null);

  // Entities for dropdown filters
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [districtsList, setDistrictsList] = useState<District[]>([]);
  const [sectorsList, setSectorsList] = useState<Sector[]>([]);

  // Filter State
  const [filters, setFilters] = useState<RecommendationFilterParams>({
    courseId: 'all',
    sectorId: 'all',
    districtId: 'all',
    actionType: 'all',
    status: 'all',
    priority: 'all',
    searchQuery: ''
  });

  // Active View Mode: Feed vs By Course Plans vs Audit Log
  const [viewMode, setViewMode] = useState<'feed' | 'course_plans' | 'audit_log'>('feed');

  // Selected recommendation for detailed modal
  const [selectedRecForModal, setSelectedRecForModal] = useState<CurriculumRecommendationItem | null>(null);

  // Batch action selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Expanded courses in Course Plans mode
  const [expandedCourseIds, setExpandedCourseIds] = useState<Set<string>>(new Set());

  // Inline Note Editor state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [inlineNoteText, setInlineNoteText] = useState('');

  // Load initial dataset & dropdown options
  useEffect(() => {
    loadDropdowns();
    loadRecommendations();
  }, []);

  const loadDropdowns = async () => {
    try {
      const [crs, dist, sec] = await Promise.all([
        apiService.getCourses(),
        apiService.getDistricts(),
        apiService.getSectors()
      ]);
      setCoursesList(crs);
      setDistrictsList(dist);
      setSectorsList(sec);
    } catch (err) {
      console.error('Failed to load dropdown entities', err);
    }
  };

  const loadRecommendations = async (customFilters?: RecommendationFilterParams) => {
    try {
      setLoading(true);
      setError(null);
      const activeFilters = customFilters || filters;
      const res = await apiService.getCurriculumRecommendationsOverview(activeFilters);
      setData(res);

      // Expand first 2 courses by default
      if (res.courses.length > 0) {
        setExpandedCourseIds(new Set([res.courses[0].courseId, res.courses[1]?.courseId].filter(Boolean)));
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load curriculum recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof RecommendationFilterParams, value: any) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    setSelectedIds(new Set());
    loadRecommendations(updated);
  };

  const handleClearFilters = () => {
    const reset: RecommendationFilterParams = {
      courseId: 'all',
      sectorId: 'all',
      districtId: 'all',
      actionType: 'all',
      status: 'all',
      priority: 'all',
      searchQuery: ''
    };
    setFilters(reset);
    setSelectedIds(new Set());
    loadRecommendations(reset);
  };

  // Status Action (Single)
  const handleUpdateStatus = async (id: string, newStatus: RecommendationStatus, note?: string) => {
    try {
      const updated = await apiService.updateRecommendationStatus(id, newStatus, note);
      // Update local state smoothly
      if (data) {
        const nextAll = data.allRecommendations.map(r => r.id === id ? updated : r);
        setData({
          ...data,
          allRecommendations: nextAll
        });
      }
      if (selectedRecForModal && selectedRecForModal.id === id) {
        setSelectedRecForModal(updated);
      }
      showFeedback(`Recommendation status updated to ${newStatus.replace(/_/g, ' ')}`);
      // Reload overview counts
      loadRecommendations();
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  // Add Note
  const handleAddNote = async (id: string, noteText: string) => {
    try {
      const updated = await apiService.addRecommendationNote(id, noteText);
      if (data) {
        const nextAll = data.allRecommendations.map(r => r.id === id ? updated : r);
        setData({
          ...data,
          allRecommendations: nextAll
        });
      }
      if (selectedRecForModal && selectedRecForModal.id === id) {
        setSelectedRecForModal(updated);
      }
      setEditingNoteId(null);
      setInlineNoteText('');
      showFeedback('Administrative note saved to audit trail');
    } catch (err: any) {
      alert(`Error adding note: ${err.message}`);
    }
  };

  // Batch Status Update
  const handleBatchStatusUpdate = async (status: RecommendationStatus) => {
    if (selectedIds.size === 0) return;
    try {
      setIsBatchProcessing(true);
      const ids = Array.from(selectedIds);
      const res = await apiService.batchUpdateRecommendations(ids, status);
      showFeedback(`Successfully updated ${res.updatedCount} recommendations to "${status.replace(/_/g, ' ')}"`);
      setSelectedIds(new Set());
      loadRecommendations();
    } catch (err: any) {
      alert(`Batch update failed: ${err.message}`);
    } finally {
      setIsBatchProcessing(false);
    }
  };

  // Regenerate Recommendations
  const handleRegenerate = async () => {
    try {
      setLoading(true);
      await apiService.regenerateRecommendations();
      showFeedback('Curriculum recommendations freshly synchronized with real-time job market requisitions!');
      loadRecommendations();
    } catch (err: any) {
      alert(`Regeneration failed: ${err.message}`);
      setLoading(false);
    }
  };

  const showFeedback = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const toggleSelectAll = () => {
    if (!data) return;
    if (selectedIds.size === data.allRecommendations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.allRecommendations.map(r => r.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleCourseExpand = (courseId: string) => {
    const next = new Set(expandedCourseIds);
    if (next.has(courseId)) next.delete(courseId);
    else next.add(courseId);
    setExpandedCourseIds(next);
  };

  const getActionBadge = (type: RecommendationActionType) => {
    switch (type) {
      case 'ADD':
        return {
          label: 'ADD SKILL',
          bg: 'bg-emerald-950 text-emerald-300 border-emerald-800',
          icon: <PlusCircle className="w-3 h-3 text-emerald-400" />
        };
      case 'INCREASE':
        return {
          label: 'INCREASE INTENSITY',
          bg: 'bg-blue-950 text-blue-300 border-blue-800',
          icon: <ArrowUpRight className="w-3 h-3 text-blue-400" />
        };
      case 'REDUCE':
        return {
          label: 'REDUCE HOURS',
          bg: 'bg-amber-950 text-amber-300 border-amber-800',
          icon: <ArrowDownRight className="w-3 h-3 text-amber-400" />
        };
      case 'OUTDATED_TOPIC':
        return {
          label: 'POTENTIALLY OUTDATED',
          bg: 'bg-rose-950 text-rose-300 border-rose-800',
          icon: <AlertTriangle className="w-3 h-3 text-rose-400" />
        };
      case 'PRACTICAL_PROJECT':
        return {
          label: 'CAPSTONE PROJECT',
          bg: 'bg-purple-950 text-purple-300 border-purple-800',
          icon: <Layers className="w-3 h-3 text-purple-400" />
        };
    }
  };

  const getPriorityBadge = (priority: RecommendationPriority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-950 text-red-300 border-red-800 animate-pulse';
      case 'High':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Medium':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'Low':
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-950 text-blue-400 border border-blue-800">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Curriculum Recommendation Engine
                <span className="text-xs px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700 font-mono font-normal">
                  Live Analytics
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated curriculum reform recommendations synthesizing industry demand, growth trends, employer feedback, and placement outcomes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            title="Re-run analytical synthesis across all employer job postings"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync with Live Requisitions
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMessage && (
        <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-4 py-2.5 rounded-lg text-xs flex items-center gap-2 animate-fadeIn shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* KPI Overview Metrics Cards */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Courses with Gaps</span>
            <span className="text-xl font-bold font-mono text-white mt-1 block">
              {data.overview.totalCoursesWithGaps}
            </span>
            <span className="text-[10px] text-slate-500">Need curriculum review</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Actionable</span>
            <span className="text-xl font-bold font-mono text-blue-400 mt-1 block">
              {data.overview.totalRecommendationsGenerated}
            </span>
            <span className="text-[10px] text-slate-500">Formulated proposals</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Skills to ADD</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
              {data.overview.skillsToAddCount}
            </span>
            <span className="text-[10px] text-slate-500">Missing from syllabus</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Skills to Increase</span>
            <span className="text-xl font-bold font-mono text-cyan-400 mt-1 block">
              {data.overview.skillsToIncreaseCount}
            </span>
            <span className="text-[10px] text-slate-500">Upgrade lab intensity</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Potentially Outdated</span>
            <span className="text-xl font-bold font-mono text-rose-400 mt-1 block">
              {data.overview.outdatedTopicsCount + data.overview.skillsToReduceCount}
            </span>
            <span className="text-[10px] text-slate-500">Declining market demand</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Board Status</span>
            <div className="flex items-center gap-1.5 mt-1 font-mono text-xs">
              <span className="text-emerald-400 font-bold" title="Accepted">{data.overview.acceptedCount}✓</span>
              <span className="text-slate-600">/</span>
              <span className="text-amber-400 font-bold" title="Under Review">{data.overview.underReviewCount}~</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400" title="Pending">{data.overview.pendingCount}⌛</span>
            </div>
            <span className="text-[10px] text-slate-500">Accepted / Review / Pending</span>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Course Filter */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Target Course</label>
            <select
              value={filters.courseId}
              onChange={e => handleFilterChange('courseId', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500 truncate"
            >
              <option value="all">All Accredited Courses ({coursesList.length})</option>
              {coursesList.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Sector Filter */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Industry Sector</label>
            <select
              value={filters.sectorId}
              onChange={e => handleFilterChange('sectorId', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Sectors ({sectorsList.length})</option>
              {sectorsList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">District</label>
            <select
              value={filters.districtId}
              onChange={e => handleFilterChange('districtId', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Districts ({districtsList.length})</option>
              {districtsList.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.division})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Decision Status</label>
            <select
              value={filters.status}
              onChange={e => handleFilterChange('status', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Decision</option>
              <option value="accepted">Accepted by Board</option>
              <option value="under_review">Under Review</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Search Query */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Search Keywords</label>
            <div className="relative">
              <input
                type="text"
                value={filters.searchQuery || ''}
                onChange={e => handleFilterChange('searchQuery', e.target.value)}
                placeholder="e.g. Docker, BMS, Python..."
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg pl-8 pr-2.5 py-2 focus:outline-none focus:border-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Action Type & View Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
          {/* Action Type Quick Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 mr-1">Action:</span>
            {[
              { id: 'all', label: 'All Types' },
              { id: 'ADD', label: 'Skills to ADD', color: 'emerald' },
              { id: 'INCREASE', label: 'Skills to INCREASE', color: 'blue' },
              { id: 'REDUCE', label: 'Skills to REDUCE', color: 'amber' },
              { id: 'OUTDATED_TOPIC', label: 'Potentially Outdated', color: 'rose' },
              { id: 'PRACTICAL_PROJECT', label: 'Capstone Projects', color: 'purple' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => handleFilterChange('actionType', type.id)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                  filters.actionType === type.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* View Modes */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('feed')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                viewMode === 'feed'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Recommendations Feed ({data?.allRecommendations.length || 0})
            </button>
            <button
              onClick={() => setViewMode('course_plans')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                viewMode === 'course_plans'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              By Course Plans ({data?.courses.length || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Batch Actions Bar (Visible when items selected) */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-950/80 border border-blue-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-white">
              {selectedIds.size} recommendation{selectedIds.size > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBatchStatusUpdate('accepted')}
              disabled={isBatchProcessing}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Accept Selected
            </button>

            <button
              onClick={() => handleBatchStatusUpdate('under_review')}
              disabled={isBatchProcessing}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <Clock className="w-3.5 h-3.5" />
              Mark for Review
            </button>

            <button
              onClick={() => handleBatchStatusUpdate('rejected')}
              disabled={isBatchProcessing}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject Selected
            </button>

            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* VIEW 1: RECOMMENDATIONS FEED */}
      {viewMode === 'feed' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 hover:text-white transition"
              >
                {data && selectedIds.size === data.allRecommendations.length && data.allRecommendations.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-blue-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <span>Select All ({data?.allRecommendations.length || 0})</span>
              </button>
            </div>
            <span>Showing verified curriculum recommendations</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-400" />
              <p className="text-sm">Evaluating skill gaps and formulating curriculum proposals...</p>
            </div>
          ) : !data || data.allRecommendations.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
              <h4 className="text-base font-semibold text-white">No Recommendations Found</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No active curriculum gaps match your filter criteria. Either the courses are fully industry-aligned, or you can clear filters to see more results.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {data.allRecommendations.map(rec => {
                const actionMeta = getActionBadge(rec.actionType);
                const isSelected = selectedIds.has(rec.id);

                return (
                  <div
                    key={rec.id}
                    className={`bg-slate-900 border rounded-xl p-4 transition-all shadow-sm ${
                      isSelected
                        ? 'border-blue-500 ring-1 ring-blue-500/50 bg-slate-900/90'
                        : rec.status === 'accepted'
                        ? 'border-emerald-800/60 bg-emerald-950/10'
                        : rec.status === 'rejected'
                        ? 'border-red-900/40 opacity-70 bg-slate-950/40'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      {/* Left: Checkbox + Action Tag + Skill Name + Course */}
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => toggleSelectOne(rec.id)}
                          className="mt-1 text-slate-500 hover:text-white transition"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600" />
                          )}
                        </button>

                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${actionMeta.bg}`}>
                              {actionMeta.icon}
                              {actionMeta.label}
                            </span>

                            <span className={`px-2 py-0.2 rounded border text-[10px] font-semibold uppercase tracking-wider ${getPriorityBadge(rec.priority)}`}>
                              {rec.priority} Priority
                            </span>

                            <span className={`px-2 py-0.2 rounded border text-[10px] font-semibold ${
                              rec.status === 'accepted' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                              rec.status === 'rejected' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                              rec.status === 'under_review' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                              'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>
                              Status: {rec.status.replace(/_/g, ' ')}
                            </span>

                            <span className="text-[11px] text-slate-500 font-mono">
                              &bull; {rec.category}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                            {rec.skillName}
                          </h3>

                          {/* Reason */}
                          <div className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                            <strong className="text-blue-400 font-semibold mr-1">Reason:</strong>
                            {rec.reason}
                          </div>

                          {/* Course Context info */}
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                            <span className="flex items-center gap-1 text-slate-300 font-semibold">
                              <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                              {rec.courseTitle}
                            </span>
                            <span>&bull;</span>
                            <span>{rec.instituteName}</span>
                            <span>&bull;</span>
                            <span className="text-cyan-400">{rec.sectorName}</span>
                            <span>&bull;</span>
                            <span>{rec.districtName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Evidence badges + Decision Buttons */}
                      <div className="flex flex-col items-end gap-2.5 shrink-0">
                        {/* Evidence Chips */}
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <div className="bg-slate-950 border border-slate-800 px-2 py-1 rounded text-right">
                            <span className="text-[9px] text-slate-500 block uppercase">Demand Score</span>
                            <span className="text-blue-400 font-bold">{rec.evidence.demandScore}/100</span>
                          </div>

                          <div className="bg-slate-950 border border-slate-800 px-2 py-1 rounded text-right">
                            <span className="text-[9px] text-slate-500 block uppercase">Openings</span>
                            <span className="text-emerald-400 font-bold">{rec.evidence.activeOpenings}</span>
                          </div>

                          <div className="bg-slate-950 border border-slate-800 px-2 py-1 rounded text-right">
                            <span className="text-[9px] text-slate-500 block uppercase">Trend</span>
                            <span className={rec.evidence.trend === 'surging' ? 'text-emerald-400 font-bold' : rec.evidence.trend === 'declining' ? 'text-rose-400 font-bold' : 'text-slate-300 font-bold'}>
                              {rec.evidence.trend}
                            </span>
                          </div>
                        </div>

                        {/* Decision Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedRecForModal(rec)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                            title="Inspect full evidence, labor market data, and audit history"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                            View
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(rec.id, 'accepted')}
                            disabled={rec.status === 'accepted'}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition disabled:opacity-40"
                            title="Accept this curriculum change"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Accept
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(rec.id, 'under_review')}
                            disabled={rec.status === 'under_review'}
                            className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1 transition disabled:opacity-40"
                            title="Mark for syllabus committee review"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            Review
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(rec.id, 'rejected')}
                            disabled={rec.status === 'rejected'}
                            className="px-2 py-1 rounded bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold transition disabled:opacity-40"
                            title="Reject recommendation"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Inline Admin Notes Display / Editor */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      {editingNoteId === rec.id ? (
                        <div className="flex items-center gap-2 flex-1 mr-4">
                          <input
                            type="text"
                            value={inlineNoteText}
                            onChange={e => setInlineNoteText(e.target.value)}
                            placeholder="Enter administrative review note..."
                            className="flex-1 bg-slate-950 border border-slate-700 text-xs text-white rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && handleAddNote(rec.id, inlineNoteText)}
                          />
                          <button
                            onClick={() => handleAddNote(rec.id, inlineNoteText)}
                            className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400 text-[11px] truncate flex-1 mr-4">
                          <MessageSquare className="w-3 h-3 text-slate-500 shrink-0" />
                          {rec.adminNotes ? (
                            <span className="truncate italic text-slate-300">"{rec.adminNotes}"</span>
                          ) : (
                            <span className="text-slate-500 italic">No administrative notes recorded yet.</span>
                          )}
                          <button
                            onClick={() => {
                              setEditingNoteId(rec.id);
                              setInlineNoteText(rec.adminNotes || '');
                            }}
                            className="text-blue-400 hover:underline text-[10px] ml-1 shrink-0"
                          >
                            {rec.adminNotes ? 'Edit' : '+ Add Note'}
                          </button>
                        </div>
                      )}

                      <div className="text-[11px] text-slate-500 shrink-0 font-mono">
                        Target Proficiency: <strong className="text-slate-300 capitalize">{rec.recommendedProficiency}</strong>
                        {rec.suggestedLabHours !== 0 && (
                          <span className="ml-2 font-bold text-blue-400">
                            ({rec.suggestedLabHours > 0 ? `+${rec.suggestedLabHours}h Lab` : `${rec.suggestedLabHours}h`})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: COURSE MODERNIZATION PLANS */}
      {viewMode === 'course_plans' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-400" />
              <p className="text-sm">Synthesizing comprehensive course modernization plans...</p>
            </div>
          ) : !data || data.courses.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-xl">
              <p>No courses match your filter criteria.</p>
            </div>
          ) : (
            data.courses.map(plan => {
              const isExpanded = expandedCourseIds.has(plan.courseId);
              const totalRecs = plan.stats.total;

              return (
                <div
                  key={plan.courseId}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm"
                >
                  {/* Course Plan Header Banner */}
                  <div
                    onClick={() => toggleCourseExpand(plan.courseId)}
                    className="p-4 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-slate-950/90 transition"
                  >
                    <div className="flex items-center gap-3">
                      <button className="text-slate-400">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-blue-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white tracking-tight">
                            {plan.courseTitle}
                          </h3>
                          <span className="text-xs text-slate-400 font-mono">({plan.courseCode})</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {plan.instituteName} &bull; {plan.districtName} &bull; <span className="text-cyan-400 font-semibold">{plan.sectorName}</span>
                        </p>
                      </div>
                    </div>

                    {/* Course Metrics Header Summary */}
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase block">Curriculum Alignment</span>
                        <span className={`font-bold text-sm ${
                          plan.alignmentScore >= 80 ? 'text-emerald-400' : plan.alignmentScore >= 60 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {plan.alignmentScore}%
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase block">Placement Rate</span>
                        <span className="font-bold text-sm text-cyan-400">
                          {plan.placementRate}%
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase block">Proposals</span>
                        <span className="font-bold text-sm text-purple-400">
                          {totalRecs} Total
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Content */}
                  {isExpanded && (
                    <div className="p-5 space-y-5 bg-slate-900/40">
                      {/* Section 1: Skills to ADD */}
                      {plan.recommendations.add.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2.5 flex items-center gap-1.5">
                            <PlusCircle className="w-4 h-4" />
                            1. Skills to ADD ({plan.recommendations.add.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {plan.recommendations.add.map(rec => (
                              <div key={rec.id} className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-white text-sm">{rec.skillName}</span>
                                  <span className={`px-2 py-0.2 rounded border text-[10px] font-semibold ${getPriorityBadge(rec.priority)}`}>
                                    {rec.priority}
                                  </span>
                                </div>
                                <p className="text-slate-300 text-[11px] leading-relaxed">
                                  {rec.reason}
                                </p>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800 font-mono">
                                  <span>Demand: <strong className="text-blue-400">{rec.evidence.demandScore}/100</strong> ({rec.evidence.activeOpenings} openings)</span>
                                  <button
                                    onClick={() => setSelectedRecForModal(rec)}
                                    className="text-blue-400 hover:underline font-sans font-semibold"
                                  >
                                    View Full Evidence ➔
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section 2: Skills to INCREASE */}
                      {plan.recommendations.increase.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2.5 flex items-center gap-1.5">
                            <ArrowUpRight className="w-4 h-4" />
                            2. Skills to INCREASE Intensity ({plan.recommendations.increase.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {plan.recommendations.increase.map(rec => (
                              <div key={rec.id} className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-white text-sm">{rec.skillName}</span>
                                  <span className="text-[10px] font-mono text-blue-300 bg-blue-950 border border-blue-800 px-2 py-0.5 rounded">
                                    Target: {rec.recommendedProficiency}
                                  </span>
                                </div>
                                <p className="text-slate-300 text-[11px] leading-relaxed">
                                  {rec.reason}
                                </p>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800 font-mono">
                                  <span>Suggested Lab: <strong className="text-emerald-400">+{rec.suggestedLabHours} Hours</strong></span>
                                  <button
                                    onClick={() => setSelectedRecForModal(rec)}
                                    className="text-blue-400 hover:underline font-sans font-semibold"
                                  >
                                    View Full Evidence ➔
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section 3: Potentially Outdated & REDUCE */}
                      {(plan.recommendations.reduce.length > 0 || plan.recommendations.outdatedTopics.length > 0) && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2.5 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4" />
                            3. Topics with Declining Demand / Potentially Outdated ({plan.recommendations.reduce.length + plan.recommendations.outdatedTopics.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[...plan.recommendations.reduce, ...plan.recommendations.outdatedTopics].map(rec => (
                              <div key={rec.id} className="bg-slate-950/80 border border-rose-950/50 rounded-lg p-3 text-xs space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-white text-sm">{rec.skillName}</span>
                                  <span className="text-[10px] font-mono text-rose-300 bg-rose-950 border border-rose-800 px-2 py-0.5 rounded">
                                    {rec.actionType === 'OUTDATED_TOPIC' ? 'Potentially Outdated' : 'Trim Allocation'}
                                  </span>
                                </div>
                                <p className="text-slate-300 text-[11px] leading-relaxed">
                                  {rec.reason}
                                </p>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800 font-mono">
                                  <span>Hours Recoverable: <strong className="text-rose-400">{Math.abs(rec.suggestedLabHours)} Hours</strong></span>
                                  <button
                                    onClick={() => setSelectedRecForModal(rec)}
                                    className="text-blue-400 hover:underline font-sans font-semibold"
                                  >
                                    View Evidence ➔
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section 4: Recommended Practical Projects */}
                      {plan.recommendations.practicalProjects.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2.5 flex items-center gap-1.5">
                            <Layers className="w-4 h-4" />
                            4. Recommended Practical Capstone Projects ({plan.recommendations.practicalProjects.length})
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                            {plan.recommendations.practicalProjects.map(rec => (
                              <div key={rec.id} className="bg-purple-950/20 border border-purple-800/40 rounded-lg p-3.5 text-xs space-y-2">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-bold text-white text-sm">
                                    {rec.practicalProject?.title || rec.skillName}
                                  </h5>
                                  <span className="text-xs font-mono text-purple-300 font-semibold">
                                    {rec.practicalProject?.suggestedHours} Lab Hours
                                  </span>
                                </div>
                                <p className="text-slate-300 text-xs leading-relaxed">
                                  {rec.practicalProject?.description || rec.reason}
                                </p>
                                {rec.practicalProject?.deliverables && (
                                  <div className="pt-2 border-t border-purple-900/40 space-y-1">
                                    <span className="text-[10px] text-purple-300 uppercase font-bold block">Deliverables:</span>
                                    {rec.practicalProject.deliverables.map((d, di) => (
                                      <span key={di} className="text-[11px] text-slate-400 block font-mono">
                                        &bull; {d}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Detail Modal Component */}
      {selectedRecForModal && (
        <RecommendationDetailModal
          recommendation={selectedRecForModal}
          onClose={() => setSelectedRecForModal(null)}
          onStatusChange={handleUpdateStatus}
          onAddNote={handleAddNote}
        />
      )}
    </div>
  );
};
