/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  GraduationCap,
  Layers,
  Filter,
  RefreshCw,
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building2,
  MapPin,
  Briefcase,
  FileSpreadsheet,
  Download,
  Info,
  ChevronRight,
  Zap,
  BookOpen
} from 'lucide-react';
import { apiService } from '../../services/apiService.ts';
import {
  SkillGapMatrixResponse,
  SkillGapFilterParams,
  District,
  Sector,
  JobRole,
  Skill,
  Course
} from '../../types/dataModel.ts';
import { SkillGapMatrixView } from './SkillGapMatrixView.tsx';
import { CourseAlignmentModal } from './CourseAlignmentModal.tsx';

export const SkillGapAnalysisPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [matrixData, setMatrixData] = useState<SkillGapMatrixResponse | null>(null);
  const [selectedCourseForAlignment, setSelectedCourseForAlignment] = useState<string | null>(null);

  // Filter lists
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [districtsList, setDistrictsList] = useState<District[]>([]);
  const [sectorsList, setSectorsList] = useState<Sector[]>([]);
  const [jobRolesList, setJobRolesList] = useState<JobRole[]>([]);
  const [skillsList, setSkillsList] = useState<Skill[]>([]);

  // Filter State
  const [filters, setFilters] = useState<SkillGapFilterParams>({
    courseId: 'all',
    districtId: 'all',
    sectorId: 'all',
    skillId: 'all',
    jobRoleId: 'all'
  });

  const [showCanonicalExample, setShowCanonicalExample] = useState(true);

  const loadData = async (currentFilters: SkillGapFilterParams) => {
    setLoading(true);
    try {
      const matrix = await apiService.getSkillGapMatrix(currentFilters);
      setMatrixData(matrix);
    } catch (err) {
      console.error('Failed to load skill gap matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load of reference metadata
    Promise.all([
      apiService.getCourses(),
      apiService.getDistricts(),
      apiService.getSectors(),
      apiService.getJobRoles(),
      apiService.getSkills()
    ]).then(([crs, dists, secs, roles, sks]) => {
      setCoursesList(crs);
      setDistrictsList(dists);
      setSectorsList(secs);
      setJobRolesList(roles);
      setSkillsList(sks);
    }).catch(console.error);

    loadData(filters);
  }, []);

  const handleFilterChange = (key: keyof SkillGapFilterParams, value: string) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    loadData(updated);
  };

  const handleResetFilters = () => {
    const reset: SkillGapFilterParams = {
      courseId: 'all',
      districtId: 'all',
      sectorId: 'all',
      skillId: 'all',
      jobRoleId: 'all'
    };
    setFilters(reset);
    loadData(reset);
  };

  // Find Full Stack course for quick benchmark click
  const fullStackCourse = coursesList.find(c =>
    c.title.toLowerCase().includes('full-stack') || c.title.toLowerCase().includes('full stack')
  );

  return (
    <div className="space-y-6">
      {/* Title & Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-blue-950 text-blue-400 border border-blue-800/80 font-mono">
              Curriculum Modernization & Labour Alignment Engine
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-blue-400" />
            Skill Gap Analysis & Course Alignment Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Compares live <strong className="text-slate-200">Industry Required Skills</strong> against accredited <strong className="text-slate-200">Course-Covered Skills</strong> across Maharashtra ITIs and polytechnics. Generates explainable gap diagnostics, alignment scores, and syllabus reform recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => loadData(filters)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Analysis</span>
          </button>

          {fullStackCourse && (
            <button
              onClick={() => setSelectedCourseForAlignment(fullStackCourse.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Inspect Full Stack Benchmark</span>
            </button>
          )}
        </div>
      </div>

      {/* Canonical Example Callout Banner */}
      {showCanonicalExample && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-800/50 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <button
            onClick={() => setShowCanonicalExample(false)}
            className="absolute right-4 top-4 text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
            title="Dismiss spotlight"
          >
            ×
          </button>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">
                  Demonstration Case: Full Stack Development Curriculum vs Industry Demand
                </h4>
                <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] px-2 py-0.2 rounded font-mono">
                  Canonical Evaluation
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Evaluating candidate courses against current employer expectations in Pune and Mumbai IT corridors:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3 font-mono text-xs">
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans font-bold">
                    Industry Required Skills (IT):
                  </span>
                  <div className="mt-1.5 space-y-1">
                    <div className="text-emerald-400">✓ React &bull; Covered</div>
                    <div className="text-emerald-400">✓ JavaScript &bull; Covered</div>
                    <div className="text-emerald-400">✓ Git &bull; Covered</div>
                    <div className="text-red-400 font-bold">✗ Docker &bull; Missing (Critical Gap)</div>
                    <div className="text-red-400 font-bold">✗ Cloud / AWS &bull; Missing (Critical Gap)</div>
                    <div className="text-emerald-400">✓ REST APIs &bull; Covered</div>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans font-bold">
                    Identified Gap:
                  </span>
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-red-300 font-bold">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      Docker Containerization
                    </div>
                    <div className="flex items-center gap-1.5 text-red-300 font-bold">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      Cloud Infrastructure (AWS/GCP)
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 font-sans font-normal leading-relaxed">
                    Why: Demanded in 84% of active software requisitions, but missing from legacy semester modules.
                  </p>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans font-bold">
                      Recommended Action:
                    </span>
                    <p className="text-xs text-slate-300 mt-1 font-sans leading-relaxed">
                      Retire legacy modules (e.g. jQuery/FTP) and sanction 80-hour Containerization & Cloud practical labs.
                    </p>
                  </div>
                  {fullStackCourse && (
                    <button
                      onClick={() => setSelectedCourseForAlignment(fullStackCourse.id)}
                      className="mt-2 w-full py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold font-sans transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      Audit Full Stack Course Report <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aggregate Overview KPI Banner */}
      {matrixData && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Courses Analyzed</span>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {matrixData.overview.totalCoursesAnalyzed}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Statewide programs</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Avg Alignment Score</span>
            <div className={`text-2xl font-black font-mono mt-1 ${
              matrixData.overview.averageAlignmentScore >= 80 ? 'text-emerald-400' :
              matrixData.overview.averageAlignmentScore >= 60 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {matrixData.overview.averageAlignmentScore}%
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Curriculum health</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Critical Deficit Courses</span>
            <div className="text-2xl font-black font-mono text-red-400 mt-1">
              {matrixData.overview.criticalDeficitCoursesCount}
            </div>
            <span className="text-[10px] text-red-400/80 mt-0.5 block font-medium">&lt;60% alignment score</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Moderate Gaps</span>
            <div className="text-2xl font-black font-mono text-amber-400 mt-1">
              {matrixData.overview.moderateGapCoursesCount}
            </div>
            <span className="text-[10px] text-amber-400/80 mt-0.5 block">60-79% score</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Aligned Curricula</span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              {matrixData.overview.alignedCoursesCount}
            </div>
            <span className="text-[10px] text-emerald-400/80 mt-0.5 block">≥80% score</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Critical Skills Missing</span>
            <div className="text-2xl font-black font-mono text-red-400 mt-1">
              {matrixData.overview.totalCriticalMissingSkills}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">High industry deficit</span>
          </div>
        </div>
      )}

      {/* FILTER BAR (Course, District, Sector, Skill, Job Role) */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            Dynamic Skill Gap Filters
          </span>
          {(filters.courseId !== 'all' || filters.districtId !== 'all' || filters.sectorId !== 'all' || filters.skillId !== 'all' || filters.jobRoleId !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Course Filter */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Course</label>
            <select
              value={filters.courseId}
              onChange={e => handleFilterChange('courseId', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Courses ({coursesList.length})</option>
              {coursesList.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.code})
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
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Districts ({districtsList.length})</option>
              {districtsList.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.division})
                </option>
              ))}
            </select>
          </div>

          {/* Sector Filter */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Sector</label>
            <select
              value={filters.sectorId}
              onChange={e => handleFilterChange('sectorId', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Sectors ({sectorsList.length})</option>
              {sectorsList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Skill Filter */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Skill</label>
            <select
              value={filters.skillId}
              onChange={e => handleFilterChange('skillId', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Skills ({skillsList.length})</option>
              {skillsList.map(sk => (
                <option key={sk.id} value={sk.id}>
                  {sk.name}
                </option>
              ))}
            </select>
          </div>

          {/* Job Role Filter */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Job Role</label>
            <select
              value={filters.jobRoleId}
              onChange={e => handleFilterChange('jobRoleId', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Job Roles ({jobRolesList.length})</option>
              {jobRolesList.map(r => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Matrix Content */}
      {loading ? (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <h3 className="text-sm font-semibold text-white">Generating Visual Skill Gap Matrix...</h3>
          <p className="text-xs text-slate-400 mt-1">Cross-referencing industry skill requirements with syllabus hours...</p>
        </div>
      ) : matrixData ? (
        <SkillGapMatrixView
          matrixCourses={matrixData.matrixCourses}
          allTrackedSkills={matrixData.allTrackedSkills}
          onSelectCourse={id => setSelectedCourseForAlignment(id)}
        />
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
          No skill gap data found for the selected filter combination.
        </div>
      )}

      {/* Detailed Course Alignment Modal */}
      {selectedCourseForAlignment && (
        <CourseAlignmentModal
          courseId={selectedCourseForAlignment}
          onClose={() => setSelectedCourseForAlignment(null)}
        />
      )}
    </div>
  );
};
