/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Clock,
  Award,
  Filter,
  Search,
  ExternalLink,
  Sparkles,
  Info,
  Building2,
  Layers
} from 'lucide-react';
import { Course, TrainingInstitute, District, Sector, Candidate, JobRole } from '../../types/dataModel.ts';

interface RecommendedCourseItem {
  course: Course;
  institute?: TrainingInstitute;
  district?: District;
  sector?: Sector;
  matchedGapSkills: Array<{ skillId: string; name: string; proficiencyCovered: string; practicalHours: number }>;
  relevanceScore: number;
  isLocalDistrict: boolean;
  coveragePercentage: number;
}

interface RecommendedCoursesPageViewProps {
  candidate: Candidate;
  targetRole?: JobRole;
  missingSkillsCount: number;
  missingSkillsList: string[];
  courses: RecommendedCourseItem[];
  onEnrollOrSaveCourse?: (courseId: string) => void;
}

export const RecommendedCoursesPageView: React.FC<RecommendedCoursesPageViewProps> = ({
  candidate,
  targetRole,
  missingSkillsCount,
  missingSkillsList,
  courses,
  onEnrollOrSaveCourse
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<Course | null>(null);

  const filteredCourses = courses.filter(item => {
    const matchesSearch =
      searchTerm === '' ||
      item.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.institute?.name && item.institute.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDistrict =
      districtFilter === 'all' ||
      (districtFilter === 'local' && item.isLocalDistrict) ||
      item.course.districtId === districtFilter;

    return matchesSearch && matchesDistrict;
  });

  return (
    <div className="space-y-6">
      {/* Header & Strict Data Guarantee Banner */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Recommended Courses (Gap-Targeted)</h2>
              <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] px-2 py-0.5 rounded-full font-mono uppercase">
                Deterministic Skill Match
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              These course recommendations are mathematically derived by comparing your verified skill deficits against accredited course curriculums.
              <strong> Zero random recommendations:</strong> only programs teaching your required job competencies are ranked.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900 border border-slate-700/80 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Target Missing Skills</span>
              <span className="text-lg font-bold text-rose-400">{missingSkillsCount}</span>
            </div>
            <div className="bg-slate-900 border border-slate-700/80 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Eligible Courses</span>
              <span className="text-lg font-bold text-emerald-400">{courses.length}</span>
            </div>
          </div>
        </div>

        {/* Missing Skills Reference Badges */}
        {missingSkillsList.length > 0 && (
          <div className="pt-3 border-t border-slate-700/80">
            <span className="text-xs text-slate-400 font-semibold block mb-2">
              Filtering curriculum coverage for your needed competencies:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {missingSkillsList.map((skillName, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-rose-950/60 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-medium"
                >
                  Need: {skillName}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-700/80 text-xs">
          <div className="flex-1 min-w-[220px] relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search courses by title, code, or institute..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Location:</span>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
            >
              <option value="all">All Maharashtra Districts</option>
              <option value="local">My Preferred District Only</option>
              <option value="dist-pune">Pune</option>
              <option value="dist-mumbai">Mumbai Suburban</option>
              <option value="dist-nagpur">Nagpur</option>
              <option value="dist-aurangabad">Chhatrapati Sambhajinagar</option>
              <option value="dist-nashik">Nashik</option>
            </select>
          </div>

          <div className="text-slate-500">
            Showing <strong className="text-slate-300">{filteredCourses.length}</strong> qualified courses
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full bg-slate-800/40 border border-slate-700/60 rounded-2xl p-12 text-center text-slate-400">
            <BookOpen className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-slate-300">No courses match your filter criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the district or search keyword filters.</p>
          </div>
        ) : (
          filteredCourses.map(item => {
            const { course, institute, district, matchedGapSkills, relevanceScore, isLocalDistrict } = item;

            return (
              <div
                key={course.id}
                className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-600 transition-all group"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {course.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isLocalDistrict && (
                        <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] px-2 py-0.5 rounded-full font-medium">
                          In Your District
                        </span>
                      )}
                      <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold">
                        Health {course.healthScore}%
                      </span>
                    </div>
                  </div>

                  {/* Title & Institute */}
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{institute?.name || 'Accredited Technical Institute'}</span>
                    </p>
                  </div>

                  {/* Course Metadata Pills */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{course.durationHours} Hours</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-indigo-400" />
                      <span>NSQF Level {course.nsqfLevel}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="truncate">{district?.name || 'Maharashtra'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Fee: ₹{course.feeStructureINR.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Matched Gap Skills Taught in this Course */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-400 font-semibold block">
                      Target Gap Skills Covered: ({matchedGapSkills.length})
                    </span>
                    {matchedGapSkills.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic">Broad industry domain coverage.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {matchedGapSkills.map((sk, skIdx) => (
                          <span
                            key={`${course.id}-mgap-${sk.skillId}-${skIdx}`}
                            className="text-[10px] px-2 py-0.5 bg-blue-950 text-blue-200 border border-blue-700/60 rounded-md font-medium"
                          >
                            ✓ {sk.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Modules Preview */}
                  {course.curriculumModules && course.curriculumModules.length > 0 && (
                    <div className="text-[11px] text-slate-400">
                      <span className="font-semibold block mb-1">Curriculum Highlights:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[10px]">
                        {course.curriculumModules.slice(0, 2).map(m => (
                          <li key={m.moduleNumber} className="truncate">
                            {m.title} ({m.durationHours} hrs)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Bottom Action Card */}
                <div className="pt-4 mt-4 border-t border-slate-700/70 flex items-center justify-between">
                  <div className="text-[11px]">
                    <span className="text-slate-400 block">Gap Match Index:</span>
                    <strong className="text-emerald-400 text-sm">{relevanceScore}%</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onEnrollOrSaveCourse) {
                        onEnrollOrSaveCourse(course.id);
                      } else {
                        alert(`Enrollment interest registered for ${course.title} at ${institute?.name}. An admissions counselor will reach out.`);
                      }
                    }}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Enroll / Apply</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
