/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Briefcase,
  Layers,
  Building2,
  GraduationCap,
  MapPin,
  AlertTriangle,
  Award,
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';
import { Job, Skill, Employer, Course, District, SkillGap, Placement } from '../../types/dataModel.ts';

export type DrilldownType =
  | 'jobs'
  | 'skills'
  | 'employers'
  | 'courses'
  | 'districts'
  | 'gaps'
  | 'placements'
  | 'emerging';

interface DetailModalProps {
  type: DrilldownType | null;
  onClose: () => void;
  jobs: Job[];
  skills: Skill[];
  employers: Employer[];
  courses: Course[];
  districts: District[];
  gaps: SkillGap[];
  placements: Placement[];
}

export const DetailModal: React.FC<DetailModalProps> = ({
  type,
  onClose,
  jobs,
  skills,
  employers,
  courses,
  districts,
  gaps,
  placements
}) => {
  const [search, setSearch] = useState('');

  if (!type) return null;

  const getTitleAndIcon = () => {
    switch (type) {
      case 'jobs':
        return { title: `Jobs Analyzed (${jobs.length} Postings)`, icon: Briefcase, color: 'text-blue-400' };
      case 'skills':
        return { title: `Skills Taxonomy (${skills.length} Competencies)`, icon: Layers, color: 'text-indigo-400' };
      case 'employers':
        return { title: `Registered Employers (${employers.length} Organizations)`, icon: Building2, color: 'text-cyan-400' };
      case 'courses':
        return { title: `Accredited Courses (${courses.length} Programs)`, icon: GraduationCap, color: 'text-emerald-400' };
      case 'districts':
        return { title: `Maharashtra Districts (${districts.length} Regions)`, icon: MapPin, color: 'text-rose-400' };
      case 'gaps':
        return { title: `Skill Gaps Detected (${gaps.length} Deficits)`, icon: AlertTriangle, color: 'text-amber-400' };
      case 'placements':
        return { title: `Placement Records (${placements.length} Verified Outcomes)`, icon: Award, color: 'text-teal-400' };
      case 'emerging':
        return { title: `Emerging & Industry 4.0 Skills`, icon: Sparkles, color: 'text-purple-400' };
    }
  };

  const { title, icon: Icon, color } = getTitleAndIcon();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{title}</h3>
              <p className="text-xs text-slate-400">Drill-down into underlying application records</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Filter in Modal */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder={`Search in ${type}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Modal Content Table / List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {/* 1. JOBS DRILLDOWN */}
          {type === 'jobs' && (
            <div className="space-y-2.5">
              {jobs
                .filter(j => !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.description.toLowerCase().includes(search.toLowerCase()))
                .slice(0, 30)
                .map(job => (
                  <div key={job.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{job.title}</span>
                        <span className="text-[11px] px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded font-mono">
                          {job.openings} Openings
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{job.description}</p>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Posted: {new Date(job.postedDate).toLocaleDateString()} &bull; {job.employmentType}
                      </div>
                    </div>
                    <div className="text-right shrink-0 font-mono text-xs">
                      <div className="text-emerald-400 font-bold">
                        ₹{(job.minSalaryINR / 100000).toFixed(1)}L - {(job.maxSalaryINR / 100000).toFixed(1)}L
                      </div>
                      <div className="text-[11px] text-slate-400 capitalize">{job.experienceRequiredYears}+ Yrs Exp</div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* 2. SKILLS DRILLDOWN */}
          {(type === 'skills' || type === 'emerging') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {skills
                .filter(s => type !== 'emerging' || s.isEmerging || s.demandTrend === 'surging')
                .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase()))
                .map(skill => (
                  <div key={skill.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-xs text-indigo-400 font-semibold">{skill.code}</span>
                        <div className="flex items-center gap-1">
                          {skill.isEmerging && (
                            <span className="px-1.5 py-0.2 bg-purple-950 text-purple-300 border border-purple-800 rounded text-[9px] font-semibold">
                              Emerging
                            </span>
                          )}
                          <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded text-[9px]">
                            NSQF {skill.nsqfLevel}
                          </span>
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-white">{skill.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{skill.description}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Trend: <strong className="text-slate-300 capitalize">{skill.demandTrend}</strong></span>
                      <span>Level: NSQF-{skill.nsqfLevel}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* 3. EMPLOYERS DRILLDOWN */}
          {type === 'employers' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {employers
                .filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()))
                .map(emp => (
                  <div key={emp.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-white">{emp.name}</h4>
                        <span className="px-1.5 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded text-[9px]">
                          {emp.tier}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{emp.companySize} &bull; {emp.address}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>{emp.email}</span>
                      <span className="text-emerald-400">Verified</span>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* 4. COURSES DRILLDOWN */}
          {type === 'courses' && (
            <div className="space-y-2.5">
              {courses
                .filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
                .map(course => (
                  <div key={course.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">{course.code}</span>
                        <h4 className="text-sm font-semibold text-white">{course.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Body: {course.certificationBody} &bull; {course.durationHours} Hours &bull; NSQF Level {course.nsqfLevel}
                      </p>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Modules: {course.curriculumModules.length} ({course.curriculumModules.filter(m => m.isOutdated).length} outdated)
                      </div>
                    </div>
                    <div className="text-right shrink-0 font-mono text-xs">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        course.healthScore >= 80 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        Health: {course.healthScore}%
                      </span>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Enrolled: {course.currentEnrolled} / {course.annualBatchCapacity}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* 5. DISTRICTS DRILLDOWN */}
          {type === 'districts' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {districts.map(dist => (
                <div key={dist.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{dist.name}</h4>
                    <span className="text-xs font-mono text-rose-400 font-bold">{dist.state}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{dist.industrialHubType}</p>
                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Workforce: {dist.approxWorkforce.toLocaleString()}</span>
                    <span>Hub: {dist.majorIndustries.slice(0, 2).join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 6. GAPS DRILLDOWN */}
          {type === 'gaps' && (
            <div className="space-y-2">
              {gaps
                .filter(g => !search || g.skillName.toLowerCase().includes(search.toLowerCase()))
                .map(gap => (
                  <div key={gap.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{gap.skillName}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                          gap.urgencyLevel === 'Severe Shortage' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {gap.urgencyLevel}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Sector: {gap.sectorName} &bull; Region: {gap.districtName}
                      </div>
                    </div>
                    <div className="text-right shrink-0 font-mono text-xs">
                      <div className="text-red-400 font-bold">Deficit: -{gap.netDeficit}</div>
                      <div className="text-emerald-400 text-[11px]">Recommended: +{gap.recommendedSeatsToSanction} seats</div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* 7. PLACEMENTS DRILLDOWN */}
          {type === 'placements' && (
            <div className="space-y-2">
              {placements.slice(0, 30).map(p => (
                <div key={p.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-white">Placement Record #{p.id}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Date: {new Date(p.placementDate).toLocaleDateString()} &bull; Candidate ID: {p.candidateId}
                    </div>
                  </div>
                  <div className="text-right shrink-0 font-mono text-xs">
                    <div className="text-emerald-400 font-bold">₹{p.placedSalaryINR.toLocaleString()}/yr</div>
                    <div className="text-[11px] text-slate-400">
                      {p.retentionMonths6 ? '✓ Retained 6+ Months' : 'Under probation'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
          <span>All records actively queried from persistent data store</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
          >
            Close Drilldown
          </button>
        </div>
      </div>
    </div>
  );
};
