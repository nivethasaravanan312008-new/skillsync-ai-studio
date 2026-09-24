/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Building2,
  BookOpen,
  Wrench,
  Sparkles,
  BarChart3,
  Layers,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  PlusCircle,
  TrendingUp,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { apiService } from '../../services/apiService.ts';
import { InstituteDashboardOverview } from './InstituteDashboardOverview.tsx';
import { IndustryAlignmentView } from './IndustryAlignmentView.tsx';
import { CourseCreator } from './CourseCreator.tsx';
import { TrainersManager } from './TrainersManager.tsx';
import { EquipmentManager } from './EquipmentManager.tsx';
import { InstituteProfileEditor } from './InstituteProfileEditor.tsx';
import {
  TrainingInstitute,
  District,
  Sector,
  JobRole,
  Skill,
  Course,
  Trainer,
  InstituteEquipment,
  InstitutePortalDashboardData
} from '../../types/dataModel.ts';

export const TrainingInstitutePortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alignment' | 'add_course' | 'trainers' | 'equipment' | 'profile'>('dashboard');

  // Master References
  const [institutes, setInstitutes] = useState<TrainingInstitute[]>([]);
  const [activeInstituteId, setActiveInstituteId] = useState<string>('inst-01'); // ITI Aundh by default
  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  // Institute Dashboard Data
  const [dashboardData, setDashboardData] = useState<InstitutePortalDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial institutes list and master data
  const loadMasterData = async () => {
    try {
      setIsLoading(true);
      const [instList, distList, secList, roleList, skillList] = await Promise.all([
        apiService.getInstitutes(),
        apiService.getDistricts(),
        apiService.getSectors(),
        apiService.getJobRoles(),
        apiService.getSkills()
      ]);

      setInstitutes(instList);
      setDistricts(distList);
      setSectors(secList);
      setJobRoles(roleList);
      setSkills(skillList);

      const defaultInst = instList.find(i => i.id === activeInstituteId) || instList[0];
      if (defaultInst) {
        setActiveInstituteId(defaultInst.id);
        await loadInstituteData(defaultInst.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load institute reference data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadInstituteData = async (instId: string) => {
    try {
      setIsRefreshing(true);
      const data = await apiService.getInstituteDashboardData(instId);
      setDashboardData(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch institute dashboard details');
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  const handleInstituteChange = async (instId: string) => {
    setActiveInstituteId(instId);
    await loadInstituteData(instId);
  };

  const handleProfileUpdated = (updated: TrainingInstitute) => {
    setInstitutes(institutes.map(i => (i.id === updated.id ? updated : i)));
    if (dashboardData) {
      setDashboardData({
        ...dashboardData,
        institute: updated
      });
    }
  };

  const handleInstituteCreated = async (created: TrainingInstitute) => {
    setInstitutes([created, ...institutes]);
    setActiveInstituteId(created.id);
    await loadInstituteData(created.id);
  };

  const handleCourseCreated = async (course: Course) => {
    await loadInstituteData(activeInstituteId);
    setActiveTab('alignment');
  };

  const handleTrainerAdded = (trainer: Trainer) => {
    if (dashboardData) {
      setDashboardData({
        ...dashboardData,
        trainers: [trainer, ...dashboardData.trainers],
        summary: {
          ...dashboardData.summary,
          totalTrainers: dashboardData.summary.totalTrainers + 1
        }
      });
    }
  };

  const handleEquipmentAdded = (eq: InstituteEquipment) => {
    if (dashboardData) {
      setDashboardData({
        ...dashboardData,
        equipment: [eq, ...dashboardData.equipment],
        summary: {
          ...dashboardData.summary,
          totalEquipmentCount: dashboardData.summary.totalEquipmentCount + eq.quantity
        }
      });
    }
  };

  const handleRecommendationUpdated = (recId: string, status: string, notes: string) => {
    if (!dashboardData) return;
    const updatedAlignments = dashboardData.courseAlignments.map(ca => ({
      ...ca,
      recommendations: ca.recommendations.map(r =>
        r.id === recId
          ? {
              ...r,
              status: status as any,
              implementationNotes: notes,
              acknowledgedAt: new Date().toISOString()
            }
          : r
      )
    }));

    setDashboardData({
      ...dashboardData,
      courseAlignments: updatedAlignments
    });
  };

  if (isLoading && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm">Loading Training Institute portal & alignment matrix...</p>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="p-8 max-w-2xl mx-auto bg-rose-950/40 border border-rose-800 rounded-xl text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Failed to Load Institute Portal</h2>
        <p className="text-sm text-rose-300">{error}</p>
        <button
          onClick={loadMasterData}
          className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  const activeInstitute = dashboardData?.institute || institutes.find(i => i.id === activeInstituteId);

  return (
    <div className="space-y-6">
      {/* Institute Portal Header & Institute Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Training Institute Portal & Curriculum Hub
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Vocational Hub
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage institute courses, faculty trainers, lab equipment, and inspect industry alignment against real-time Maharashtra labor demands.
              </p>
            </div>
          </div>

          {/* Quick Institute Switcher */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl p-1.5 self-start lg:self-auto">
            <Building2 className="w-4 h-4 text-slate-400 ml-2" />
            <select
              value={activeInstituteId}
              onChange={e => handleInstituteChange(e.target.value)}
              className="bg-transparent text-white text-xs font-semibold rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[280px]"
            >
              {institutes.map(inst => (
                <option key={inst.id} value={inst.id} className="bg-slate-900 text-white">
                  {inst.name} ({inst.accreditationRating})
                </option>
              ))}
            </select>
            <button
              onClick={() => loadInstituteData(activeInstituteId)}
              disabled={isRefreshing}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              title="Refresh institute data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-5 border-t border-slate-800/80 pt-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Overview Dashboard
          </button>

          <button
            onClick={() => setActiveTab('alignment')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'alignment'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Industry Alignment Page
            {dashboardData && dashboardData.summary.pendingRecommendationsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white">
                {dashboardData.summary.pendingRecommendationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('add_course')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'add_course'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Add Course & Curriculum
          </button>

          <button
            onClick={() => setActiveTab('trainers')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'trainers'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Trainers & Faculty ({dashboardData?.trainers.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('equipment')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'equipment'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Equipment & Resources ({dashboardData?.equipment.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Institute Profile
          </button>
        </div>
      </div>

      {/* Main Tab Content View */}
      {activeTab === 'dashboard' && dashboardData && (
        <InstituteDashboardOverview
          data={dashboardData}
          onNavigateToTab={tab => setActiveTab(tab)}
        />
      )}

      {activeTab === 'alignment' && dashboardData && (
        <IndustryAlignmentView
          institute={dashboardData.institute}
          alignments={dashboardData.courseAlignments}
          onRecommendationUpdated={handleRecommendationUpdated}
        />
      )}

      {activeTab === 'add_course' && activeInstitute && (
        <CourseCreator
          institute={activeInstitute}
          sectors={sectors}
          districts={districts}
          jobRoles={jobRoles}
          skills={skills}
          onCourseCreated={handleCourseCreated}
        />
      )}

      {activeTab === 'trainers' && activeInstitute && dashboardData && (
        <TrainersManager
          institute={activeInstitute}
          trainers={dashboardData.trainers}
          skills={skills}
          onTrainerAdded={handleTrainerAdded}
        />
      )}

      {activeTab === 'equipment' && activeInstitute && dashboardData && (
        <EquipmentManager
          institute={activeInstitute}
          equipment={dashboardData.equipment}
          skills={skills}
          courses={dashboardData.courses}
          onEquipmentAdded={handleEquipmentAdded}
        />
      )}

      {activeTab === 'profile' && activeInstitute && (
        <InstituteProfileEditor
          institute={activeInstitute}
          districts={districts}
          onProfileUpdated={handleProfileUpdated}
          onInstituteCreated={handleInstituteCreated}
        />
      )}
    </div>
  );
};
