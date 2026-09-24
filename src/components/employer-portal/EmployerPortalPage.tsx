/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Briefcase,
  FileSpreadsheet,
  Layers,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  PlusCircle,
  TrendingUp,
  ShieldCheck,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { apiService } from '../../services/apiService.ts';
import { EmployerDashboardOverview } from './EmployerDashboardOverview.tsx';
import { JobRequirementPostingView } from './JobRequirementPostingView.tsx';
import { SkillDemandSurveyView } from './SkillDemandSurveyView.tsx';
import { CompanyProfileEditor } from './CompanyProfileEditor.tsx';
import {
  Employer,
  EmployerDashboardData,
  District,
  Sector,
  JobRole,
  Skill
} from '../../types/dataModel.ts';

export const EmployerPortalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'post_job' | 'survey' | 'profile'>('dashboard');

  // Master Reference Data
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [activeEmployerId, setActiveEmployerId] = useState<string>('emp-001'); // Tata Motors by default
  const [activeEmployer, setActiveEmployer] = useState<Employer | null>(null);

  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  // Employer Dashboard Data
  const [dashboardData, setDashboardData] = useState<EmployerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load baseline master data
  const loadMasterData = async () => {
    try {
      setIsLoading(true);
      const [empList, distList, secList, roleList, skillList] = await Promise.all([
        apiService.getEmployers(),
        apiService.getDistricts(),
        apiService.getSectors(),
        apiService.getJobRoles(),
        apiService.getSkills()
      ]);

      setEmployers(empList);
      setDistricts(distList);
      setSectors(secList);
      setJobRoles(roleList);
      setSkills(skillList);

      const defaultEmp = empList.find(e => e.id === activeEmployerId) || empList[0];
      if (defaultEmp) {
        setActiveEmployer(defaultEmp);
        setActiveEmployerId(defaultEmp.id);
        await loadEmployerDashboard(defaultEmp.id);
      }
    } catch (err: any) {
      console.error('Failed to load employer master data:', err);
      setError(err?.message || 'Failed to initialize Employer Portal.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmployerDashboard = async (empId: string) => {
    try {
      setIsRefreshing(true);
      const data = await apiService.getEmployerDashboard(empId);
      setDashboardData(data);
      setActiveEmployer(data.employer);
    } catch (err: any) {
      console.error('Failed to load employer dashboard:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  const handleSwitchEmployer = async (empId: string) => {
    setActiveEmployerId(empId);
    await loadEmployerDashboard(empId);
  };

  const handleSaveProfile = async (updated: Employer) => {
    const res = await apiService.updateEmployer(updated.id, updated);
    setActiveEmployer(res);
    await loadEmployerDashboard(res.id);
  };

  const handleRegisterNewCompany = async (newComp: Omit<Employer, 'id' | 'isVerified'>) => {
    const created = await apiService.registerEmployer(newComp);
    setEmployers(prev => [created, ...prev]);
    setActiveEmployerId(created.id);
    setActiveEmployer(created);
    await loadEmployerDashboard(created.id);
    setActiveTab('dashboard');
  };

  const handleJobSubmitted = async (newJob: any) => {
    if (activeEmployer) {
      await loadEmployerDashboard(activeEmployer.id);
      setActiveTab('dashboard');
    }
  };

  const handleSurveySubmitted = async (newSurvey: any) => {
    if (activeEmployer) {
      await loadEmployerDashboard(activeEmployer.id);
      setActiveTab('dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading Employer Portal & Ingestion Pipeline...</p>
      </div>
    );
  }

  if (error || !activeEmployer) {
    return (
      <div className="max-w-4xl mx-auto my-12 bg-rose-950/40 border border-rose-800 p-6 rounded-2xl text-center">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-white">Error Initializing Employer Portal</h3>
        <p className="text-xs text-rose-300 mt-1">{error || 'No registered employer found'}</p>
        <button
          onClick={loadMasterData}
          className="mt-4 px-4 py-2 bg-rose-800 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950/70 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">
              Maharashtra Employer & Industry Partner Portal
            </h1>
            <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-mono uppercase">
              Corporate Gateway
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Enterprise interface allowing companies to post verified job openings, execute <strong>skill validation workflows</strong> (grading Critical, Important, and Nice-to-have competencies), submit demand surveys, and directly steer state technical education curriculums.
          </p>
        </div>

        {/* Current Authenticated Employer Badge & Switcher */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs text-right">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Logged In As</span>
            <span className="text-white font-bold">{activeEmployer.name}</span>
            <span className="text-[10px] text-emerald-400 block">Tier: {activeEmployer.tier}</span>
          </div>

          <button
            onClick={() => loadEmployerDashboard(activeEmployer.id)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700 transition cursor-pointer"
            title="Refresh employer data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4 text-indigo-300" />
          <span>Employer Dashboard</span>
          {dashboardData && (
            <span className="bg-indigo-950 text-indigo-300 border border-indigo-700 text-[10px] px-1.5 py-0.2 rounded font-mono">
              {dashboardData.submittedJobs.length} Jobs
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('post_job')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'post_job'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Briefcase className="w-4 h-4 text-cyan-300" />
          <span>Submit Job Requirements & Skill Validation</span>
        </button>

        <button
          onClick={() => setActiveTab('survey')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'survey'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
          <span>Submit Skill-Demand Survey</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <UserCheck className="w-4 h-4 text-amber-300" />
          <span>Company Profile & Registration</span>
        </button>
      </div>

      {/* Main Tab Views */}
      <div>
        {activeTab === 'dashboard' && dashboardData && (
          <EmployerDashboardOverview
            data={dashboardData}
            onNavigateToPostJob={() => setActiveTab('post_job')}
            onNavigateToSurvey={() => setActiveTab('survey')}
          />
        )}

        {activeTab === 'post_job' && (
          <JobRequirementPostingView
            employer={activeEmployer}
            districts={districts}
            sectors={sectors}
            jobRoles={jobRoles}
            allSkills={skills}
            onJobSubmitted={handleJobSubmitted}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'survey' && (
          <SkillDemandSurveyView
            employer={activeEmployer}
            districts={districts}
            sectors={sectors}
            allSkills={skills}
            onSurveySubmitted={handleSurveySubmitted}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'profile' && (
          <CompanyProfileEditor
            employer={activeEmployer}
            districts={districts}
            sectors={sectors}
            onSaveProfile={handleSaveProfile}
            onRegisterNewCompany={handleRegisterNewCompany}
            allEmployers={employers}
            onSwitchEmployer={handleSwitchEmployer}
          />
        )}
      </div>
    </div>
  );
};
