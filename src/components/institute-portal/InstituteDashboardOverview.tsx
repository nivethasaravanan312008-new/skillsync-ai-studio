/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  BookOpen,
  Users,
  Award,
  GraduationCap,
  Wrench,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Layers,
  MapPin
} from 'lucide-react';
import {
  InstitutePortalDashboardData,
  TrainingInstitute
} from '../../types/dataModel.ts';

interface InstituteDashboardOverviewProps {
  data: InstitutePortalDashboardData;
  onNavigateToTab: (tab: 'alignment' | 'add_course' | 'trainers' | 'equipment' | 'profile') => void;
}

export const InstituteDashboardOverview: React.FC<InstituteDashboardOverviewProps> = ({
  data,
  onNavigateToTab
}) => {
  const { institute, courses, trainers, equipment, courseAlignments, summary } = data;

  return (
    <div className="space-y-6">
      {/* Institute Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
                {institute.type}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <Award className="w-3 h-3" />
                Accreditation: {institute.accreditationRating}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">{institute.name}</h1>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{institute.address} • {institute.districtId.replace('dist-', '').toUpperCase()} District</span>
              <span className="text-slate-500">•</span>
              <span>Principal: <strong>{institute.principalContact}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateToTab('alignment')}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
            >
              <Sparkles className="w-4 h-4" />
              View Industry Alignment Matrix
            </button>
            <button
              onClick={() => onNavigateToTab('add_course')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <BookOpen className="w-4 h-4" />
              Add Course
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Active Courses</span>
          <div className="text-2xl font-bold text-white mt-1">{summary.totalCourses}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Vocational programs</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Capacity</span>
          <div className="text-2xl font-bold text-white mt-1">{summary.totalSanctionedCapacity}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Sanctioned seats</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Enrolled Students</span>
          <div className="text-2xl font-bold text-indigo-400 mt-1">{summary.totalEnrolled}</div>
          <div className="text-[11px] text-indigo-300/80 mt-0.5">{summary.overallCapacityUtilization}% utilization</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Avg Alignment</span>
          <div className={`text-2xl font-bold mt-1 ${summary.averageInstituteAlignment >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {summary.averageInstituteAlignment}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Industry sync score</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Placement Rate</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{summary.averagePlacementRate}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Verified transitions</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Faculty & Labs</span>
          <div className="text-2xl font-bold text-white mt-1">{summary.totalTrainers} / {summary.totalEquipmentCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Trainers / Lab Assets</div>
        </div>
      </div>

      {/* Course Alignment Snapshot Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Course Alignment & Performance Matrix</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live alignment overview showing industry demand, skills coverage, missing competencies, and placement outcomes.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('alignment')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
          >
            Open Full Alignment Page <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Course & Sector</th>
                <th className="py-3 px-3">Industry Demand</th>
                <th className="py-3 px-3">Skills Covered</th>
                <th className="py-3 px-3">Missing Skills</th>
                <th className="py-3 px-3 text-center">Alignment Score</th>
                <th className="py-3 px-3 text-center">Placement Rate</th>
                <th className="py-3 px-3 text-right">Recommended Updates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
              {courseAlignments.map(ca => {
                const alignmentColor =
                  ca.alignmentScore >= 80
                    ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800'
                    : ca.alignmentScore >= 60
                    ? 'text-amber-400 bg-amber-950/60 border-amber-800'
                    : 'text-rose-400 bg-rose-950/60 border-rose-800';

                return (
                  <tr key={ca.courseId} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{ca.courseTitle}</div>
                      <div className="text-[11px] text-slate-400">
                        {ca.courseCode} • {ca.sectorName} (NSQF {ca.nsqfLevel})
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-white">{ca.industryDemand.activeOpenings} openings</span>
                      <span className="text-[11px] text-slate-400 block">{ca.industryDemand.employerCount} employers</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-200">{ca.skillsCovered.length} skills</span>
                      <span className="text-[10px] text-slate-500 block">
                        {ca.skillsCovered.filter(s => s.isMarketCritical).length} critical
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-amber-400">{ca.missingSkills.length} missing</span>
                      <span className="text-[10px] text-slate-500 block">Industry 4.0 gaps</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold border ${alignmentColor}`}>
                        {ca.alignmentScore}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-emerald-400">{ca.placementRate}%</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigateToTab('alignment')}
                        className="px-2.5 py-1 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 rounded font-semibold text-[11px] transition"
                      >
                        {ca.recommendations.length} Updates
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid: Quick Insights & Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Faculty & Equipment Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-indigo-400" />
              Infrastructure & Faculty Readiness
            </h4>
            <button
              onClick={() => onNavigateToTab('equipment')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Manage Assets →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white">Certified Master Trainers</span>
                <p className="text-[11px] text-slate-400">NSQF Level 5 to 7 Accredited Faculty</p>
              </div>
              <span className="text-base font-bold text-white">{trainers.length} Trainers</span>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white">Workshop Equipment & CNC Assets</span>
                <p className="text-[11px] text-slate-400">High-tech simulators, test benches & labs</p>
              </div>
              <span className="text-base font-bold text-white">{equipment.reduce((sum, e) => sum + e.quantity, 0)} Units</span>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white">Curriculum Revision Status</span>
                <p className="text-[11px] text-slate-400">Pending vs Acknowledged Recommendations</p>
              </div>
              <span className="text-xs font-bold text-indigo-300">
                {summary.acknowledgedRecommendationsCount} Acknowledged / {summary.pendingRecommendationsCount} Pending
              </span>
            </div>
          </div>
        </div>

        {/* Industry Synergy Recommendations Callout */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Priority Curriculum Directives
            </h4>
            <button
              onClick={() => onNavigateToTab('alignment')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Review Actions →
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            {courseAlignments.flatMap(ca => ca.recommendations).slice(0, 3).map((rec, idx) => (
              <div key={idx} className="p-3 bg-slate-950/70 border border-slate-800/90 rounded-lg">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white">{rec.skillName}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-950 text-rose-300 border border-rose-800">
                    {rec.priority}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{rec.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
