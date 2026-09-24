/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GraduationCap, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { CourseAlignmentBreakdown } from '../../types/dataModel.ts';

interface CourseAlignmentChartProps {
  distribution: CourseAlignmentBreakdown;
  onViewCourses: () => void;
}

export const CourseAlignmentChart: React.FC<CourseAlignmentChartProps> = ({
  distribution,
  onViewCourses
}) => {
  const total = distribution.totalCoursesAnalyzed || 1;
  const highPct = Math.round((distribution.highAlignmentCount / total) * 100);
  const modPct = Math.round((distribution.moderateAlignmentCount / total) * 100);
  const critPct = Math.round((distribution.criticalOutdatedCount / total) * 100);

  return (
    <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              Course Curriculum Alignment Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Dynamic audit of vocational curricula against live industrial requisitions
            </p>
          </div>
          <button
            onClick={onViewCourses}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-mono underline"
          >
            View All Courses
          </button>
        </div>

        {/* Big Health Metric Bar */}
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg my-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              Statewide Curriculum Alignment Index
            </span>
            <div className="text-3xl font-extrabold text-white mt-0.5 flex items-baseline gap-2">
              <span className={distribution.averageHealthScore >= 80 ? 'text-emerald-400' : distribution.averageHealthScore >= 65 ? 'text-amber-400' : 'text-red-400'}>
                {distribution.averageHealthScore}%
              </span>
              <span className="text-xs text-slate-500 font-normal">
                Across {distribution.totalCoursesAnalyzed} Accredited Courses
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-950/60 border border-emerald-800 text-emerald-300">
              {distribution.highAlignmentCount} Aligned
            </span>
            <span className="px-2.5 py-1 rounded text-xs font-semibold bg-amber-950/60 border border-amber-800 text-amber-300">
              {distribution.moderateAlignmentCount} Needs Revision
            </span>
            <span className="px-2.5 py-1 rounded text-xs font-semibold bg-red-950/60 border border-red-800 text-red-300">
              {distribution.criticalOutdatedCount} Obsolete
            </span>
          </div>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex my-3">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${highPct}%` }}
            title={`High Alignment: ${distribution.highAlignmentCount} courses (${highPct}%)`}
          />
          <div
            className="bg-amber-500 h-full transition-all duration-500"
            style={{ width: `${modPct}%` }}
            title={`Moderate Alignment: ${distribution.moderateAlignmentCount} courses (${modPct}%)`}
          />
          <div
            className="bg-red-500 h-full transition-all duration-500"
            style={{ width: `${critPct}%` }}
            title={`Critical Outdated: ${distribution.criticalOutdatedCount} courses (${critPct}%)`}
          />
        </div>

        {/* Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="p-3 bg-emerald-950/20 border border-emerald-900/50 rounded-lg">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              High Alignment (&ge;80%)
            </div>
            <div className="text-xl font-extrabold text-white mt-1">
              {distribution.highAlignmentCount} Courses
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Strong match with active Industry 4.0 competencies.
            </p>
          </div>

          <div className="p-3 bg-amber-950/20 border border-amber-900/50 rounded-lg">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              Moderate Revision (60-79%)
            </div>
            <div className="text-xl font-extrabold text-white mt-1">
              {distribution.moderateAlignmentCount} Courses
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Requires injection of 1-2 new technical modules.
            </p>
          </div>

          <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-lg">
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
              <AlertOctagon className="w-3.5 h-3.5" />
              Critical Outdated (&lt;60%)
            </div>
            <div className="text-xl font-extrabold text-white mt-1">
              {distribution.criticalOutdatedCount} Courses
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Obsolete modules present; high graduate unemployment risk.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>Evaluated against 55 NSQF standardized competencies</span>
        <button
          onClick={onViewCourses}
          className="text-emerald-400 hover:text-emerald-300 font-medium"
        >
          Explore Course Syllabi &rarr;
        </button>
      </div>
    </div>
  );
};
