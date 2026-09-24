/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  GraduationCap,
  Building2,
  Users,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ChevronRight,
  Info,
  Check,
  Award,
  Layers
} from 'lucide-react';
import { CourseHealthProfile, CourseHealthStatus, RecommendationStatus } from '../../types/dataModel.ts';
import { apiService } from '../../services/apiService.ts';

interface CourseHealthDetailModalProps {
  profile: CourseHealthProfile;
  onClose: () => void;
  onOpenRecommendations?: (courseId: string) => void;
  onRefresh?: () => void;
}

export const CourseHealthDetailModal: React.FC<CourseHealthDetailModalProps> = ({
  profile,
  onClose,
  onOpenRecommendations,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'outcomes' | 'supply_demand' | 'recommendations'>('overview');
  const [recommendations, setRecommendations] = useState(profile.curriculumRecommendations);
  const [updatingRecId, setUpdatingRecId] = useState<string | null>(null);

  const handleUpdateStatus = async (id: string, status: 'accepted' | 'rejected' | 'under_review') => {
    try {
      setUpdatingRecId(id);
      await apiService.updateRecommendationStatus(id, status, 'Updated via Course Health Audit', 'Admin Auditor');
      setRecommendations(prev =>
        prev.map(r => (r.id === id ? { ...r, status: status as RecommendationStatus } : r))
      );
      onRefresh?.();
    } catch (err: any) {
      alert('Failed to update recommendation status: ' + err.message);
    } finally {
      setUpdatingRecId(null);
    }
  };

  const getStatusBadge = (status: CourseHealthStatus) => {
    switch (status) {
      case 'High Demand':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            High Demand
          </span>
        );
      case 'Growing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            <TrendingUp className="w-3.5 h-3.5" />
            Growing
          </span>
        );
      case 'Stable':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            Stable
          </span>
        );
      case 'Declining':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <TrendingDown className="w-3.5 h-3.5" />
            Declining
          </span>
        );
      case 'Oversupplied':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3.5 h-3.5" />
            Oversupplied
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/70 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs text-blue-400 bg-blue-950/80 border border-blue-800 px-2 py-0.5 rounded">
                {profile.courseCode}
              </span>
              <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                {profile.sectorName}
              </span>
              <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                {profile.districtName} District
              </span>
              <span className="text-xs text-indigo-400 bg-indigo-950/80 border border-indigo-900 px-2 py-0.5 rounded">
                NSQF Level {profile.nsqfLevel} &bull; {profile.durationHours} hrs
              </span>
              {getStatusBadge(profile.healthStatus)}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {profile.courseTitle}
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Institution: <strong className="text-slate-200">{profile.instituteName}</strong></span>
              <span>&bull;</span>
              <span>Target Role: <strong className="text-blue-300">{profile.targetJobRoleTitle}</strong></span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer shrink-0"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mismatch Alerts (if any) */}
        {profile.alerts && profile.alerts.length > 0 && (
          <div className="bg-amber-950/40 border-b border-amber-600/30 px-6 py-3">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Training Supply & Industry Demand Mismatch Alerts ({profile.alerts.length})</span>
            </div>
            <div className="space-y-2">
              {profile.alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    alert.severity === 'critical'
                      ? 'bg-rose-950/40 border-rose-600/40 text-rose-200'
                      : alert.severity === 'warning'
                      ? 'bg-amber-950/30 border-amber-600/40 text-amber-200'
                      : 'bg-blue-950/30 border-blue-600/40 text-blue-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        alert.severity === 'critical' ? 'bg-rose-900 text-rose-200' : 'bg-amber-900 text-amber-200'
                      }`}>
                        {alert.severity}
                      </span>
                      <strong className="text-white text-sm">{alert.title}</strong>
                    </div>
                    <p className="text-slate-300">{alert.message}</p>
                    <p className="text-[11px] text-slate-400">
                      <strong>Policy Recommendation:</strong> {alert.recommendedAction}
                    </p>
                  </div>
                  <div className="shrink-0 font-mono text-xs bg-slate-900/80 px-2.5 py-1.5 rounded border border-slate-700/80 text-right">
                    <div className="text-slate-400 text-[10px]">Supply/Demand Ratio</div>
                    <div className="font-bold text-white">{alert.metrics.ratio}x</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 gap-6 text-sm overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 font-medium border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Health Profile & Calculation
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`py-3 font-medium border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'skills'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Skills Taught vs Missing ({profile.skillAlignment.skillsTaughtCount} / {profile.skillAlignment.skillsMissingCount})
          </button>
          <button
            onClick={() => setActiveTab('supply_demand')}
            className={`py-3 font-medium border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'supply_demand'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Supply vs Employer Demand
          </button>
          <button
            onClick={() => setActiveTab('outcomes')}
            className={`py-3 font-medium border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'outcomes'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Placement Outcomes ({profile.placementRate}%)
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`py-3 font-medium border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'recommendations'
                ? 'border-purple-500 text-purple-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            Curriculum Recommendations ({recommendations.length})
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          
          {/* TAB 1: OVERVIEW & EXPLAINABLE CALCULATION */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Primary 6 Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Industry Demand
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-white">{profile.industryDemand.activeOpenings}</span>
                    <span className="text-xs text-slate-400">openings</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {profile.industryDemand.uniqueEmployersCount} active employers
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Skill Alignment
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl font-bold ${
                      profile.skillAlignment.alignmentScore >= 80 ? 'text-emerald-400' : profile.skillAlignment.alignmentScore >= 60 ? 'text-blue-400' : 'text-amber-400'
                    }`}>
                      {profile.skillAlignment.alignmentScore}%
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Score</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {profile.skillAlignment.gapPercentage}% deficit gap
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Placement Rate
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl font-bold ${
                      profile.placementRate >= 70 ? 'text-emerald-400' : profile.placementRate >= 50 ? 'text-blue-400' : 'text-amber-400'
                    }`}>
                      {profile.placementRate}%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    ₹{(profile.placementOutcomes.averageSalaryINR / 100000).toFixed(1)}L avg package
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Candidate Supply
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-white">{profile.candidateSupply.totalCandidateSupply}</span>
                    <span className="text-xs text-slate-400">candidates</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {profile.candidateSupply.currentEnrolled} enrolled &bull; {profile.candidateSupply.annualBatchCapacity} cap
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Demand Trend (YoY)
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl font-bold flex items-center ${
                      profile.demandTrend.growth12mPercentage >= 15 ? 'text-emerald-400' : profile.demandTrend.growth12mPercentage <= -8 ? 'text-rose-400' : 'text-blue-400'
                    }`}>
                      {profile.demandTrend.growth12mPercentage >= 0 ? '+' : ''}{profile.demandTrend.growth12mPercentage}%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 capitalize">
                    {profile.demandTrend.direction} momentum
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                    Supply/Demand Ratio
                  </span>
                  <div>
                    <span className={`text-2xl font-mono font-bold ${
                      profile.candidateSupply.supplyDemandRatio <= 0.6 ? 'text-emerald-400' : profile.candidateSupply.supplyDemandRatio >= 1.4 ? 'text-amber-400' : 'text-blue-400'
                    }`}>
                      {profile.candidateSupply.supplyDemandRatio}x
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {profile.candidateSupply.supplyStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Explanation Card */}
              <div className="p-5 rounded-xl border border-slate-700 bg-slate-950/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                      Explainable Status Assessment: <strong className="text-blue-300">{profile.healthStatus}</strong>
                    </h3>
                  </div>
                  <div className="text-xs text-slate-400">
                    Composite Health Score: <strong className="text-white font-mono text-sm">{profile.compositeHealthScore}/100</strong>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                  {profile.statusExplanation}
                </p>
              </div>

              {/* Underlying Calculation Breakdown (Explainability) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    Underlying Calculation Factors & Formula Weights
                  </h3>
                  <span className="text-xs text-slate-400">
                    Composite Formula: Demand (25%) + Alignment (25%) + Placement (20%) + Trend (15%) + Supply (15%)
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Evaluation Factor</th>
                        <th className="p-3">Calculated Value</th>
                        <th className="p-3">Component Weight</th>
                        <th className="p-3">Market Impact</th>
                        <th className="p-3">Analytical Detail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                      {profile.calculationFactors.map((cf, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 font-semibold text-white flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            {cf.factor}
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-200">{cf.value}</td>
                          <td className="p-3 text-slate-400 font-mono">{cf.weight}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                              cf.impact === 'positive'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : cf.impact === 'negative'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
                              {cf.impact === 'positive' && <ArrowUpRight className="w-3 h-3" />}
                              {cf.impact === 'negative' && <ArrowDownRight className="w-3 h-3" />}
                              {cf.impact}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300">{cf.detail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Demand Trend Trajectory Chart (Past 6 Months) */}
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">6-Month Demand & Placement Trajectory</h3>
                    <p className="text-xs text-slate-400">{profile.demandTrend.trendDescription}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                    profile.demandTrend.growth12mPercentage >= 15 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : profile.demandTrend.growth12mPercentage <= -8 ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-blue-950 text-blue-300 border border-blue-800'
                  }`}>
                    {profile.demandTrend.growth12mPercentage >= 0 ? '+' : ''}{profile.demandTrend.growth12mPercentage}% YoY Growth
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-2 pt-2">
                  {profile.demandTrend.monthlyTrajectory.map((m, idx) => (
                    <div key={idx} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-center flex flex-col justify-between">
                      <span className="text-xs font-semibold text-slate-400">{m.month}</span>
                      <div className="my-2 space-y-1">
                        <div className="text-sm font-bold text-cyan-400">{m.postings} <span className="text-[10px] text-slate-500 font-normal">reqs</span></div>
                        <div className="text-xs font-bold text-emerald-400">{m.placements} <span className="text-[10px] text-slate-500 font-normal">hires</span></div>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                        <div className="bg-cyan-500 h-full" style={{ width: `${Math.min(100, (m.postings / 80) * 100)}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-cyan-500"></span>
                    <span>Monthly Requisitions (Job Postings)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
                    <span>Trainee Placements</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SKILLS TAUGHT VS MISSING */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                    Syllabus Curriculum vs Market Requirements
                  </h3>
                  <p className="text-xs text-slate-400">
                    Direct comparison of {profile.skillsTaught.length} skills taught in this course against {profile.skillsMissing.length} high-demand industry skills
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded font-medium">
                    {profile.skillsTaught.length} Taught
                  </span>
                  <span className="text-xs bg-rose-950 text-rose-300 border border-rose-800 px-2.5 py-1 rounded font-medium">
                    {profile.skillsMissing.length} Deficit Gaps
                  </span>
                </div>
              </div>

              {/* Skills Taught Section */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Skills Covered in Course Syllabus
                </h4>
                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Skill Competency</th>
                        <th className="p-3">Domain Category</th>
                        <th className="p-3">Practical Hrs</th>
                        <th className="p-3">Theory Hrs</th>
                        <th className="p-3">Taught Proficiency</th>
                        <th className="p-3">Active Openings</th>
                        <th className="p-3">Demand Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                      {profile.skillsTaught.map((st, idx) => (
                        <tr key={`st-${st.skillId}-${idx}`} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 font-semibold text-white">{st.skillName}</td>
                          <td className="p-3 text-slate-400">{st.categoryName}</td>
                          <td className="p-3 text-emerald-400 font-mono font-bold">{st.practicalHours} hrs</td>
                          <td className="p-3 text-slate-400 font-mono">{st.theoryHours} hrs</td>
                          <td className="p-3 capitalize">
                            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
                              {st.coveredProficiency}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-200">{st.industryOpenings}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                              st.demandTrend === 'surging' ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-800' : 'text-slate-300 bg-slate-800'
                            }`}>
                              {st.demandTrend}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Skills Missing Section */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Skills Missing from Course Syllabus (Required by Industry)
                </h4>
                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Missing Competency</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Market Openings</th>
                        <th className="p-3">Hiring Employers</th>
                        <th className="p-3">Required Proficiency</th>
                        <th className="p-3">12M Growth</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                      {profile.skillsMissing.map((sm, idx) => (
                        <tr key={`sm-${sm.skillId}-${idx}`} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 font-semibold text-white flex items-center gap-2">
                            {sm.isCritical && (
                              <span className="bg-rose-900 text-rose-200 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                                Critical
                              </span>
                            )}
                            {sm.skillName}
                          </td>
                          <td className="p-3 text-slate-400">{sm.categoryName}</td>
                          <td className="p-3 font-mono font-bold text-amber-300">{sm.industryOpenings}</td>
                          <td className="p-3 font-mono text-slate-300">{sm.employersRequiringCount} employers</td>
                          <td className="p-3 capitalize">
                            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
                              {sm.requiredProficiency}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-emerald-400">
                            +{sm.growth12mPercentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: SUPPLY VS EMPLOYER DEMAND */}
          {activeTab === 'supply_demand' && (
            <div className="space-y-6">
              
              {/* Supply vs Demand Comparison Gauge */}
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Labor Market Supply & Demand Balance</h3>
                    <p className="text-xs text-slate-400">
                      Candidate output from {profile.instituteName} relative to industry hiring requisitions
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Supply / Demand Ratio</span>
                    <span className={`text-xl font-mono font-bold ${
                      profile.candidateSupply.supplyDemandRatio <= 0.6 ? 'text-emerald-400' : profile.candidateSupply.supplyDemandRatio >= 1.4 ? 'text-amber-400' : 'text-blue-400'
                    }`}>
                      {profile.candidateSupply.supplyDemandRatio}x ({profile.candidateSupply.supplyStatus})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Candidate Supply Breakdown */}
                  <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Candidate Supply Pool ({profile.candidateSupply.totalCandidateSupply} total)
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Current Enrolled Trainees:</span>
                        <strong className="text-white font-mono">{profile.candidateSupply.currentEnrolled}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Annual Sanctioned Batch Capacity:</span>
                        <strong className="text-white font-mono">{profile.candidateSupply.annualBatchCapacity} seats</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Graduates from Previous Batch:</span>
                        <strong className="text-white font-mono">{profile.candidateSupply.graduatedLastYear}</strong>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Active Job Seekers in Domain:</span>
                        <strong className="text-white font-mono">{profile.candidateSupply.activeJobSeekersForRole}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Industry Demand Breakdown */}
                  <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Industry Hiring Demand ({profile.industryDemand.activeOpenings} openings)
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Active Openings Statewide:</span>
                        <strong className="text-white font-mono">{profile.industryDemand.activeOpenings}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Hiring Enterprises:</span>
                        <strong className="text-white font-mono">{profile.industryDemand.uniqueEmployersCount} companies</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Urgency Level:</span>
                        <strong className="text-rose-400 capitalize">{profile.industryDemand.urgencyLevel}</strong>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Salary Range INR:</span>
                        <strong className="text-white font-mono">
                          ₹{(profile.industryDemand.averageSalaryMin / 100000).toFixed(1)}L - ₹{(profile.industryDemand.averageSalaryMax / 100000).toFixed(1)}L
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employer Requirements & Hiring Feedback */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    Top Hiring Employers
                  </h4>
                  <div className="space-y-2">
                    {profile.industryDemand.topHiringCompanies.map((c, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-slate-900/60 border border-slate-800/80">
                        <span className="font-semibold text-white">{c.name}</span>
                        <span className="font-mono text-cyan-400 font-bold">{c.openings} openings</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    Employer Survey Intelligence
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Hiring Difficulty Rating:</span>
                      <span className="font-bold text-amber-400 font-mono">{profile.employerRequirements.hiringDifficultyRating} / 5.0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Graduate Readiness Rating:</span>
                      <span className="font-bold text-emerald-400 font-mono">{profile.employerRequirements.graduateReadinessRating} / 5.0</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Reported Hard-To-Fill Competencies:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.employerRequirements.reportedHardToFillSkills.map((s, idx) => (
                          <span key={`htf-${s.skillId}-${idx}`} className="bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded text-[11px]">
                            {s.skillName}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: PLACEMENT OUTCOMES */}
          {activeTab === 'outcomes' && (
            <div className="space-y-6">
              
              {/* Placement KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60">
                  <span className="text-xs text-slate-400 block mb-1">Placement Rate</span>
                  <span className="text-2xl font-bold text-emerald-400">{profile.placementOutcomes.placementRate}%</span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    {profile.placementOutcomes.placedCount} of {profile.placementOutcomes.totalTrackedCandidates} tracked
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60">
                  <span className="text-xs text-slate-400 block mb-1">Average Starting Salary</span>
                  <span className="text-2xl font-bold text-white">₹{(profile.placementOutcomes.averageSalaryINR / 100000).toFixed(2)}L</span>
                  <span className="text-[11px] text-slate-400 block mt-1">Median: ₹{(profile.placementOutcomes.medianSalaryINR / 100000).toFixed(2)}L/yr</span>
                </div>
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60">
                  <span className="text-xs text-slate-400 block mb-1">6-Month Retention</span>
                  <span className="text-2xl font-bold text-cyan-400">{profile.placementOutcomes.retentionRate6m}%</span>
                  <span className="text-[11px] text-slate-400 block mt-1">Sustained employment</span>
                </div>
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60">
                  <span className="text-xs text-slate-400 block mb-1">Employer Rating</span>
                  <span className="text-2xl font-bold text-purple-400">{profile.placementOutcomes.averageEmployerRating} / 5.0</span>
                  <span className="text-[11px] text-slate-400 block mt-1">Supervisor satisfaction</span>
                </div>
              </div>

              {/* Recent Alumni Placements Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  Recent Verified Graduate Placements
                </h4>
                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Candidate Graduate</th>
                        <th className="p-3">Hiring Enterprise</th>
                        <th className="p-3">Designation / Role</th>
                        <th className="p-3">Placed Package</th>
                        <th className="p-3">Placement Date</th>
                        <th className="p-3">6-Month Retention</th>
                        <th className="p-3">Employer Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                      {profile.placementOutcomes.recentPlacements.map(p => (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 font-semibold text-white">{p.candidateName}</td>
                          <td className="p-3 text-slate-300">{p.employerName}</td>
                          <td className="p-3 text-blue-300">{p.jobTitle}</td>
                          <td className="p-3 font-mono font-bold text-emerald-400">
                            ₹{(p.placedSalaryINR / 100000).toFixed(2)}L/yr
                          </td>
                          <td className="p-3 text-slate-400">{p.placementDate}</td>
                          <td className="p-3">
                            {p.retentionMonths6 ? (
                              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                                <Check className="w-3.5 h-3.5" /> Retained
                              </span>
                            ) : (
                              <span className="text-slate-500">In Probation</span>
                            )}
                          </td>
                          <td className="p-3 font-mono text-purple-300 font-bold">{p.feedbackScore} / 5.0</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: CURRICULUM RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Targeted Curriculum Recommendations
                  </h3>
                  <p className="text-xs text-slate-400">
                    Data-driven syllabus adjustments based on market demand, placement feedback, and skill gap deficits
                  </p>
                </div>
                {onOpenRecommendations && (
                  <button
                    onClick={() => onOpenRecommendations(profile.courseId)}
                    className="px-3 py-1.5 bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    Open in Recommendation Engine
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {recommendations.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-400 text-xs">
                  No pending curriculum adjustments generated for this course.
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map(rec => (
                    <div
                      key={rec.id}
                      className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3 hover:border-slate-700 transition"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              rec.actionType === 'ADD' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              rec.actionType === 'INCREASE' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                              rec.actionType === 'REDUCE' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                              rec.actionType === 'OUTDATED_TOPIC' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                              'bg-purple-950 text-purple-300 border border-purple-800'
                            }`}>
                              {rec.actionType}: {rec.skillName || rec.title}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              rec.priority === 'High' || rec.priority === 'Urgent' ? 'bg-rose-900/80 text-rose-200' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {rec.priority} Priority
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                              rec.status === 'accepted' ? 'bg-emerald-900/60 text-emerald-200' :
                              rec.status === 'rejected' ? 'bg-rose-900/60 text-rose-200' :
                              rec.status === 'under_review' ? 'bg-amber-900/60 text-amber-200' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              Status: {rec.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-200">{rec.reason}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {rec.status !== 'accepted' && (
                            <button
                              onClick={() => handleUpdateStatus(rec.id, 'accepted')}
                              disabled={updatingRecId === rec.id}
                              className="px-2.5 py-1 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 text-xs rounded font-medium border border-emerald-700 transition cursor-pointer"
                            >
                              Accept
                            </button>
                          )}
                          {rec.status !== 'rejected' && (
                            <button
                              onClick={() => handleUpdateStatus(rec.id, 'rejected')}
                              disabled={updatingRecId === rec.id}
                              className="px-2.5 py-1 bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-xs rounded font-medium border border-rose-700 transition cursor-pointer"
                            >
                              Reject
                            </button>
                          )}
                          {rec.status !== 'under_review' && (
                            <button
                              onClick={() => handleUpdateStatus(rec.id, 'under_review')}
                              disabled={updatingRecId === rec.id}
                              className="px-2.5 py-1 bg-amber-900/80 hover:bg-amber-800 text-amber-200 text-xs rounded font-medium border border-amber-700 transition cursor-pointer"
                            >
                              Review
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                        <div className="bg-slate-900/60 p-2 rounded">
                          <span className="text-slate-400 block">Suggested Hours:</span>
                          <strong className="text-white font-mono">{rec.suggestedHours} hrs</strong>
                        </div>
                        {rec.recommendedProficiency && (
                          <div className="bg-slate-900/60 p-2 rounded">
                            <span className="text-slate-400 block">Recommended Proficiency:</span>
                            <strong className="text-cyan-400 capitalize">{rec.recommendedProficiency}</strong>
                          </div>
                        )}
                        <div className="bg-slate-900/60 p-2 rounded">
                          <span className="text-slate-400 block">Action Category:</span>
                          <strong className="text-emerald-400 capitalize">{rec.actionType}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Course Health Profile validated with real-time labor market analytics</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition cursor-pointer font-medium"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};
