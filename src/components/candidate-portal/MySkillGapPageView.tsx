/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  ArrowDown,
  Layers,
  Sparkles,
  BookOpen,
  Compass,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock
} from 'lucide-react';
import { CandidateSkillGapProfile, JobRole } from '../../types/dataModel.ts';

interface MySkillGapPageViewProps {
  gapProfile: CandidateSkillGapProfile;
  jobRoles: JobRole[];
  onSelectRole: (roleId: string) => void;
  onNavigateToCourses: () => void;
}

export const MySkillGapPageView: React.FC<MySkillGapPageViewProps> = ({
  gapProfile,
  jobRoles,
  onSelectRole,
  onNavigateToCourses
}) => {
  return (
    <div className="space-y-6">
      {/* Target Role & High-Level Match Banner */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold bg-cyan-950/80 border border-cyan-800/80 px-2.5 py-0.5 rounded-full inline-block mb-1">
              Personalized Gap Analysis
            </span>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">TARGET ROLE: {gapProfile.targetRoleTitle}</h2>
              <span className="text-xs bg-slate-900 border border-slate-700 text-slate-300 px-2.5 py-0.5 rounded-lg">
                Sector: {gapProfile.targetSectorName}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Comparative matrix contrasting skills already verified against target role requisitions. Follow the step-by-step learning pathway to close deficits and qualify for high-tier industry placements.
            </p>
          </div>

          {/* Target Role Switcher & Match Dial */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <label className="block text-[11px] text-slate-400 font-medium mb-1">Change Target Role:</label>
              <select
                value={gapProfile.targetRoleId}
                onChange={(e) => onSelectRole(e.target.value)}
                className="bg-slate-900 text-slate-200 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer"
              >
                {jobRoles.map(r => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-950 to-indigo-900 border border-blue-600/50 flex flex-col items-center justify-center font-bold shrink-0 shadow-lg shadow-blue-500/10">
              <span className="text-xl text-cyan-300 leading-tight">{gapProfile.matchScore}%</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Match</span>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side: Already Have vs Need (Matches User Spec Exactly) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Already have */}
        <div className="bg-slate-800/70 border border-emerald-900/50 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider">Already have:</h3>
                <p className="text-[11px] text-slate-400">Verified competencies acquired</p>
              </div>
            </div>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">
              {gapProfile.alreadyHave.length} Skills
            </span>
          </div>

          {gapProfile.alreadyHave.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 italic bg-slate-900/60 rounded-xl">
              No overlapping skills verified yet. Start with fundamental modules in the pathway below!
            </div>
          ) : (
            <div className="space-y-2.5">
              {gapProfile.alreadyHave.map((skill, idx) => (
                <div
                  key={`have-${skill.id}-${idx}`}
                  className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-800/60 text-emerald-200 text-xs font-bold flex items-center justify-center shrink-0">
                      ✓
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{skill.name}</p>
                      {skill.code && <p className="text-[10px] text-emerald-400 font-mono">{skill.code}</p>}
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded-md font-medium">
                    Verified
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Need */}
        <div className="bg-slate-800/70 border border-rose-900/50 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-700/60 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-300 uppercase tracking-wider">Need:</h3>
                <p className="text-[11px] text-slate-400">Deficits required to achieve job readiness</p>
              </div>
            </div>
            <span className="bg-rose-950 text-rose-300 border border-rose-800 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">
              {gapProfile.need.length} Skills
            </span>
          </div>

          {gapProfile.need.length === 0 ? (
            <div className="p-6 text-center text-xs text-emerald-400 font-medium bg-emerald-950/30 rounded-xl border border-emerald-800/40">
              🎉 Zero skill gap! Candidate satisfies 100% of industry requirements for {gapProfile.targetRoleTitle}.
            </div>
          ) : (
            <div className="space-y-2.5">
              {gapProfile.need.map((skill, idx) => (
                <div
                  key={`need-${skill.id}-${idx}`}
                  className="p-3 bg-rose-950/20 border border-rose-800/40 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-rose-900/60 text-rose-200 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{skill.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        NSQF Level {skill.nsqfLevel} &bull; Trend: {skill.demandTrend}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium uppercase font-mono ${
                    skill.importance === 'critical'
                      ? 'bg-rose-900 text-rose-200 border border-rose-700'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {skill.importance}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Visual Learning Pathway: Python ↓ Git ↓ REST APIs ↓ FastAPI ↓ Docker ↓ Project */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Recommended Learning Pathway
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Progression sequence designed from fundamental competencies through to live production project execution.
            </p>
          </div>
          <button
            onClick={onNavigateToCourses}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition cursor-pointer self-start sm:self-auto"
          >
            <BookOpen className="w-4 h-4" />
            <span>View Recommended Courses</span>
          </button>
        </div>

        {/* Step-by-step Flow with Arrows */}
        <div className="max-w-2xl mx-auto space-y-2 py-2">
          {gapProfile.pathwaySequence.map((step, idx) => {
            const isLast = idx === gapProfile.pathwaySequence.length - 1;
            const isPossessed = step.isPossessed;
            const isCapstone = step.isCapstone;

            return (
              <React.Fragment key={`step-${step.skillId}-${step.stepIndex}-${idx}`}>
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    isPossessed
                      ? 'bg-emerald-950/40 border-emerald-700/60 shadow-md shadow-emerald-950/30'
                      : isCapstone
                      ? 'bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border-indigo-500/70 shadow-lg shadow-indigo-950/50'
                      : 'bg-slate-900/90 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                          isPossessed
                            ? 'bg-emerald-600 text-white'
                            : isCapstone
                            ? 'bg-indigo-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {isPossessed ? '✓' : step.stepIndex}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white tracking-tight">
                            {step.skillName}
                          </h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            isPossessed
                              ? 'bg-emerald-900 text-emerald-200'
                              : isCapstone
                              ? 'bg-purple-900 text-purple-200 font-semibold'
                              : 'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}>
                            {step.stageLabel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                      </div>
                    </div>

                    {step.estimatedWeeks > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>~{step.estimatedWeeks} Weeks</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Arrow Down Indicator between stages */}
                {!isLast && (
                  <div className="flex justify-center py-0.5">
                    <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-400 shadow-sm">
                      <ArrowDown className="w-4 h-4 text-cyan-400" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Suggested System Courses for this specific gap */}
      {gapProfile.recommendedCourses.length > 0 && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              Targeted Courses Covering These Gaps
            </h3>
            <button
              onClick={onNavigateToCourses}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <span>Explore All Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gapProfile.recommendedCourses.slice(0, 4).map(course => (
              <div
                key={course.courseId}
                className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 space-y-3 hover:border-slate-600 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-slate-800 px-2 py-0.5 rounded">
                      {course.courseCode}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{course.courseTitle}</h4>
                  </div>
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold shrink-0">
                    Health {course.healthScore}%
                  </span>
                </div>

                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <span>{course.instituteName}</span>
                  <span>&bull;</span>
                  <span>{course.districtName}</span>
                  <span>&bull;</span>
                  <span>{course.durationHours} Hours</span>
                </p>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">
                    Covers Your Missing Skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {course.coveredGapSkills.map((s, sIdx) => (
                      <span
                        key={`${course.courseId}-gap-${s.id}-${sIdx}`}
                        className="text-[11px] px-2 py-0.5 bg-blue-950 text-blue-200 border border-blue-800 rounded-md font-medium"
                      >
                        ✓ {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
