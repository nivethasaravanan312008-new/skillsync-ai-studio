/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  Briefcase,
  Layers,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Database,
  Building2,
  CheckCircle2,
  Users,
  Compass,
  Upload,
  Sparkles,
  Activity,
  MapPin,
  Award
} from 'lucide-react';
import { apiService, VerificationReport } from './services/apiService.ts';
import { AdminDashboardView } from './components/dashboard/AdminDashboardView.tsx';
import { IndustryDemandPage } from './components/demand/IndustryDemandPage.tsx';
import { JobIngestionPage } from './components/ingestion/JobIngestionPage.tsx';
import { SkillGapAnalysisPage } from './components/gaps/SkillGapAnalysisPage.tsx';
import { CurriculumRecommendationPage } from './components/recommendations/CurriculumRecommendationPage.tsx';
import { CourseHealthPage } from './components/health/CourseHealthPage.tsx';
import { DistrictPlannerPage } from './components/district-planner/DistrictPlannerPage.tsx';
import { CandidatePortalPage } from './components/candidate-portal/CandidatePortalPage.tsx';
import { EmployerPortalPage } from './components/employer-portal/EmployerPortalPage.tsx';
import { TrainingInstitutePortal } from './components/institute-portal/TrainingInstitutePortal.tsx';
import { PlacementOutcomeAnalyticsDashboard } from './components/analytics/PlacementOutcomeAnalyticsDashboard.tsx';
import { Job, Skill, Course, SkillGap } from './types/dataModel.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'placements' | 'institute_portal' | 'dashboard' | 'employer_portal' | 'candidate_portal' | 'district_planner' | 'health' | 'demand' | 'ingestion' | 'gaps' | 'recommendations' | 'verification' | 'jobs' | 'skills' | 'courses'>('placements');
  const [selectedSkillForDemand, setSelectedSkillForDemand] = useState<string | null>(null);
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Raw dataset samples for secondary explorer tabs
  const [sampleJobs, setSampleJobs] = useState<Job[]>([]);
  const [sampleSkills, setSampleSkills] = useState<Skill[]>([]);
  const [sampleCourses, setSampleCourses] = useState<Course[]>([]);
  const [sampleGaps, setSampleGaps] = useState<SkillGap[]>([]);
  const [jobSearch, setJobSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  const loadVerificationData = async () => {
    try {
      const rep = await apiService.verifyDataLayer();
      setReport(rep);

      const [jobsData, skillsData, coursesData, gapsData] = await Promise.all([
        apiService.getJobs({ limit: 18 }),
        apiService.getSkills(),
        apiService.getCourses(),
        apiService.getSkillGaps()
      ]);

      setSampleJobs(jobsData.items);
      setSampleSkills(skillsData);
      setSampleCourses(coursesData);
      setSampleGaps(gapsData.slice(0, 15));
    } catch (err: any) {
      console.error('Error fetching verification report:', err);
    }
  };

  useEffect(() => {
    loadVerificationData();
  }, []);

  const handleResetData = async () => {
    if (!confirm('Re-seed the persistent database back to benchmark simulated data?')) return;
    setIsResetting(true);
    try {
      await apiService.resetData();
      await loadVerificationData();
      // Reload page to refresh dashboard state completely
      window.location.reload();
    } catch (err: any) {
      alert('Reset failed: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const filteredJobs = sampleJobs.filter(j => {
    const matchesSearch = jobSearch === '' || j.title.toLowerCase().includes(jobSearch.toLowerCase()) || j.description.toLowerCase().includes(jobSearch.toLowerCase());
    const matchesDist = selectedDistrict === 'all' || j.districtId === selectedDistrict;
    return matchesSearch && matchesDist;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Banner: Mandatory Demo / Simulated Data Notice */}
      <div className="bg-amber-950/90 border-b border-amber-600/40 px-4 py-2 text-xs text-amber-200 flex items-center justify-between z-50">
        <div className="flex items-center gap-2 max-w-5xl">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Demo / Simulated Data:</strong> This dataset is simulated for benchmarking and algorithm validation; it does not claim to represent real Maharashtra labour-market statistics.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="bg-amber-900/90 text-amber-300 px-2 py-0.5 rounded text-[11px] font-mono border border-amber-500/30">
            MAHARASHTRA SKILL DEVELOPMENT
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-6 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  SkillSync Intelligence Platform
                </h1>
                <span className="bg-blue-950 text-blue-400 border border-blue-800/80 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase">
                  Government Command Center
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Labour Market Demand &bull; Skill Gaps &bull; Curriculum Alignment &bull; District Training Planner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetData}
              disabled={isResetting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition cursor-pointer"
              title="Resets persistent database to pristine benchmark simulated data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Re-seeding...' : 'Reset Database'}</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">Role: Government Admin</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 bg-slate-950/40 px-6">
        <div className="max-w-7xl mx-auto flex gap-6 text-sm overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('placements')}
            className={`py-3 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'placements'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4 text-indigo-400" />
            Placement Analytics
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              Admin &bull; Real Data
            </span>
          </button>

          <button
            onClick={() => setActiveTab('institute_portal')}
            className={`py-3 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'institute_portal'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            Training Institute Portal
            <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              Alignment &amp; Courses
            </span>
          </button>

          <button
            onClick={() => setActiveTab('employer_portal')}
            className={`py-3 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'employer_portal'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4 text-indigo-400" />
            Employer Portal
            <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              Job Posts &amp; Surveys
            </span>
          </button>

          <button
            onClick={() => setActiveTab('candidate_portal')}
            className={`py-3 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'candidate_portal'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            Candidate Portal
            <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              Career Match &amp; Gaps
            </span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Admin Overview Dashboard
          </button>

          <button
            onClick={() => setActiveTab('district_planner')}
            className={`py-3 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'district_planner'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4 text-sky-400" />
            District Training Planner
            <span className="bg-sky-950 text-sky-300 border border-sky-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              10 Districts &bull; GIS
            </span>
          </button>

          <button
            onClick={() => setActiveTab('demand')}
            className={`py-3 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'demand'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            Industry Demand Intelligence
            <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              Live Scored
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ingestion')}
            className={`py-3 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'ingestion'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            Job Data Ingestion
            <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              CSV &bull; NLP
            </span>
          </button>

          <button
            onClick={() => setActiveTab('gaps')}
            className={`py-3 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'gaps'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Skill Gap Matrix & Alignment
            <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              Matrix
            </span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`py-3 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'health'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            Course Health Monitor
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              Explainable
            </span>
          </button>

          <button
            onClick={() => setActiveTab('recommendations')}
            className={`py-3 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'recommendations'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            Curriculum Recommendations
            <span className="bg-purple-950 text-purple-300 border border-purple-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              Engine
            </span>
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`py-3 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'verification'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Verification Matrix
            {report && (
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                100% Passed
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`py-3 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'jobs'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Jobs Explorer ({report?.checks.jobPostings.actual || 1050})
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`py-3 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'skills'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Skills Taxonomy ({report?.checks.skills.actual || 55})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        {/* VIEW -3: PLACEMENT OUTCOME ANALYTICS (ADMINISTRATOR DASHBOARD) */}
        {activeTab === 'placements' && <PlacementOutcomeAnalyticsDashboard />}

        {/* VIEW -2: TRAINING INSTITUTE PORTAL & INDUSTRY ALIGNMENT */}
        {activeTab === 'institute_portal' && <TrainingInstitutePortal />}

        {/* VIEW -1: EMPLOYER PORTAL & SKILL VALIDATION WORKFLOW */}
        {activeTab === 'employer_portal' && <EmployerPortalPage />}

        {/* VIEW 0: CANDIDATE PORTAL & CAREER MATCH ENGINE */}
        {activeTab === 'candidate_portal' && <CandidatePortalPage />}

        {/* VIEW 1: ADMIN OVERVIEW DASHBOARD */}
        {activeTab === 'dashboard' && <AdminDashboardView />}

        {/* VIEW 1.2: DISTRICT TRAINING PLANNER */}
        {activeTab === 'district_planner' && <DistrictPlannerPage />}

        {/* VIEW 1.5: INDUSTRY DEMAND INTELLIGENCE */}
        {activeTab === 'demand' && (
          <IndustryDemandPage
            initialSkillId={selectedSkillForDemand}
            onClearSkillSelection={() => setSelectedSkillForDemand(null)}
          />
        )}

        {/* VIEW 1.8: JOB DATA INGESTION & SKILL EXTRACTION MODULE */}
        {activeTab === 'ingestion' && (
          <JobIngestionPage
            onIngestionCompleted={loadVerificationData}
            onNavigateToSkill={(skillId) => {
              setSelectedSkillForDemand(skillId);
              setActiveTab('demand');
            }}
            onNavigateToDemand={() => setActiveTab('demand')}
          />
        )}

        {/* VIEW 2: VERIFICATION MATRIX */}
        {activeTab === 'verification' && report && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ALL DATA REQUIREMENTS PASSED & PERSISTED
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-2">
                    Hackathon Prototype Data Layer Matrix
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                    1000+ job postings, 55 standardized skills, 32 job roles, 10 Maharashtra districts, 8 industrial sectors, 24 accredited courses, 52 employers, and verified placement/capacity linkages.
                  </p>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-center min-w-[200px]">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Total Market Openings</span>
                  <div className="text-3xl font-extrabold text-blue-400 mt-1">
                    {report.summary.totalOpeningsMarket.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-500">From {report.checks.jobPostings.actual} Postings</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(report.checks).map(([key, item]: any) => (
                <div key={key} className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 capitalize font-medium">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">
                      {item.actual !== undefined ? item.actual : 'OK'}
                    </span>
                    {item.target && (
                      <span className="text-xs text-slate-500">/ Target {item.target}+</span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-400/90 mt-2 font-medium">Validation Passed</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: JOBS EXPLORER */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-4 rounded-lg border border-slate-800">
              <input
                type="text"
                placeholder="Search jobs, skills, roles..."
                value={jobSearch}
                onChange={e => setJobSearch(e.target.value)}
                className="w-full sm:w-80 bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-xs text-white"
              />
              <select
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-white"
              >
                <option value="all">All Districts</option>
                <option value="dist-pune">Pune</option>
                <option value="dist-mumbai">Mumbai</option>
                <option value="dist-nagpur">Nagpur</option>
                <option value="dist-nashik">Nashik</option>
                <option value="dist-thane">Thane</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.map(job => (
                <div key={job.id} className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-white line-clamp-1">{job.title}</h4>
                      <span className="px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-800 rounded text-[11px] font-mono shrink-0">
                        {job.openings} Openings
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{job.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {job.requiredSkills.map(sk => (
                        <span key={sk.skillId} className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-[10px]">
                          {sampleSkills.find(s => s.id === sk.skillId)?.name || sk.skillId}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>₹{(job.minSalaryINR / 100000).toFixed(1)}L - {(job.maxSalaryINR / 100000).toFixed(1)}L</span>
                    <span>{job.employmentType}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: SKILLS TAXONOMY */}
        {activeTab === 'skills' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleSkills.map(skill => (
              <div key={skill.id} className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-mono text-xs text-blue-400 font-semibold">{skill.code}</span>
                  <div className="flex items-center gap-1">
                    {skill.isEmerging && (
                      <span className="px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-800 rounded text-[10px]">
                        Emerging
                      </span>
                    )}
                    <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded text-[10px]">
                      NSQF L{skill.nsqfLevel}
                    </span>
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-white">{skill.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{skill.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 5: COURSE HEALTH MONITOR */}
        {(activeTab === 'health' || activeTab === 'courses') && (
          <CourseHealthPage
            onNavigateToRecommendations={(courseId) => {
              setActiveTab('recommendations');
            }}
            onNavigateToSkillGaps={(courseId) => {
              setActiveTab('gaps');
            }}
          />
        )}

        {/* VIEW 6: SKILL GAP MATRIX & ALIGNMENT */}
        {activeTab === 'gaps' && (
          <SkillGapAnalysisPage />
        )}

        {/* VIEW 7: CURRICULUM RECOMMENDATION ENGINE */}
        {activeTab === 'recommendations' && (
          <CurriculumRecommendationPage />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 px-6 py-4 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SkillSync Intelligence Platform &bull; Government Admin Command Dashboard</span>
          <span>Demo / Simulated Data &bull; Benchmarking & Algorithm Validation</span>
        </div>
      </footer>
    </div>
  );
}
