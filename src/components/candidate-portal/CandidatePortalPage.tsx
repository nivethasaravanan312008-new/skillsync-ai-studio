/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  Compass,
  TrendingUp,
  BookOpen,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Layers,
  MapPin,
  Briefcase
} from 'lucide-react';
import { apiService } from '../../services/apiService.ts';
import { CandidateProfileEditor } from './CandidateProfileEditor.tsx';
import { CareerMatchEngineView } from './CareerMatchEngineView.tsx';
import { MySkillGapPageView } from './MySkillGapPageView.tsx';
import { RecommendedCoursesPageView } from './RecommendedCoursesPageView.tsx';
import {
  Candidate,
  District,
  Sector,
  JobRole,
  Skill,
  CandidateCareerMatch,
  CandidateSkillGapProfile
} from '../../types/dataModel.ts';

export const CandidatePortalPage: React.FC = () => {
  const [activePortalTab, setActivePortalTab] = useState<'profile' | 'career_matches' | 'skill_gap' | 'courses'>('skill_gap');

  // Master Reference Data
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeCandidateId, setActiveCandidateId] = useState<string>('cand-001');
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);

  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  // Computed Engine State
  const [careerMatches, setCareerMatches] = useState<CandidateCareerMatch[]>([]);
  const [skillGapProfile, setSkillGapProfile] = useState<CandidateSkillGapProfile | null>(null);
  const [recommendedCoursesData, setRecommendedCoursesData] = useState<any>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load baseline master data
  const loadMasterData = async () => {
    try {
      setIsLoading(true);
      const [candList, distList, secList, roleList, skillList] = await Promise.all([
        apiService.getCandidates(),
        apiService.getDistricts(),
        apiService.getSectors(),
        apiService.getJobRoles(),
        apiService.getSkills()
      ]);

      setCandidates(candList);
      setDistricts(distList);
      setSectors(secList);
      setJobRoles(roleList);
      setSkills(skillList);

      // Default active candidate
      const target = candList.find(c => c.id === activeCandidateId) || candList[0];
      if (target) {
        setActiveCandidate(target);
        setActiveCandidateId(target.id);
        await loadCandidateAnalytics(target.id);
      }
    } catch (err: any) {
      console.error('Failed to load candidate portal data:', err);
      setError(err?.message || 'Failed to initialize Candidate Portal.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load analytical computations for the selected candidate
  const loadCandidateAnalytics = async (candidateId: string, customRoleId?: string) => {
    try {
      setIsRefreshing(true);
      const [matches, gapProfile, coursesResult, cand] = await Promise.all([
        apiService.getCandidateCareerMatches(candidateId),
        apiService.getCandidateSkillGapProfile(candidateId, customRoleId),
        apiService.getCandidateRecommendedCourses(candidateId),
        apiService.getCandidateById(candidateId)
      ]);

      setCareerMatches(matches);
      setSkillGapProfile(gapProfile);
      setRecommendedCoursesData(coursesResult);
      setActiveCandidate(cand);
    } catch (err: any) {
      console.error('Failed to recalculate candidate matches:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  const handleSelectCandidate = async (candId: string) => {
    setActiveCandidateId(candId);
    await loadCandidateAnalytics(candId);
  };

  const handleSaveProfile = async (updatedCandidate: Candidate) => {
    const updated = await apiService.updateCandidate(updatedCandidate.id, updatedCandidate);
    setActiveCandidate(updated);
    // Refresh analytical data
    await loadCandidateAnalytics(updated.id);
  };

  const handleSelectRoleForGap = async (roleId: string) => {
    if (activeCandidate) {
      await loadCandidateAnalytics(activeCandidate.id, roleId);
      setActivePortalTab('skill_gap');
    }
  };

  const handleExploreCourse = (courseId: string) => {
    setActivePortalTab('courses');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading Candidate Portal & Initializing Career Match Engine...</p>
      </div>
    );
  }

  if (error || !activeCandidate) {
    return (
      <div className="max-w-4xl mx-auto my-12 bg-rose-950/40 border border-rose-800 p-6 rounded-2xl text-center">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-white">Error Initializing Portal</h3>
        <p className="text-xs text-rose-300 mt-1">{error || 'No candidate found'}</p>
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
            <GraduationCap className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">
              Candidate Vocational Portal & Career Match Engine
            </h1>
            <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-mono uppercase">
              Student / Jobseeker View
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Personalized dashboard empowering Maharashtra candidates to curate their profile, benchmark skills against industry requisitions, explore career trajectories, view step-by-step learning pathways, and enroll in gap-aligned accredited courses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadCandidateAnalytics(activeCandidate.id)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700 transition cursor-pointer"
            title="Recalculate matches"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isRefreshing ? 'Matching...' : 'Refresh Matches'}</span>
          </button>
        </div>
      </div>

      {/* Internal Navigation Tabs: Profile | Career Matches | My Skill Gap | Recommended Courses */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActivePortalTab('skill_gap')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activePortalTab === 'skill_gap'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Layers className="w-4 h-4 text-cyan-300" />
          <span>My Skill Gap</span>
          {skillGapProfile && (
            <span className="bg-blue-950 text-cyan-300 border border-blue-700 text-[10px] px-1.5 py-0.2 rounded font-mono">
              {skillGapProfile.matchScore}% Match
            </span>
          )}
        </button>

        <button
          onClick={() => setActivePortalTab('career_matches')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activePortalTab === 'career_matches'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Compass className="w-4 h-4 text-cyan-300" />
          <span>Career Match Engine</span>
          <span className="bg-slate-900 text-slate-400 border border-slate-700 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
            {careerMatches.length} Paths
          </span>
        </button>

        <button
          onClick={() => setActivePortalTab('courses')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activePortalTab === 'courses'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-300" />
          <span>Recommended Courses</span>
          {recommendedCoursesData && (
            <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] px-1.5 py-0.2 rounded font-mono">
              {recommendedCoursesData.courses?.length || 0}
            </span>
          )}
        </button>

        <button
          onClick={() => setActivePortalTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activePortalTab === 'profile'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <User className="w-4 h-4 text-slate-300" />
          <span>Edit Profile & Preferences</span>
        </button>
      </div>

      {/* Main Content Pane */}
      <div>
        {activePortalTab === 'profile' && (
          <CandidateProfileEditor
            candidate={activeCandidate}
            districts={districts}
            sectors={sectors}
            jobRoles={jobRoles}
            allSkills={skills}
            onSave={handleSaveProfile}
            onSelectCandidate={handleSelectCandidate}
            availableCandidates={candidates}
          />
        )}

        {activePortalTab === 'career_matches' && (
          <CareerMatchEngineView
            matches={careerMatches}
            sectors={sectors}
            onSelectRoleForGap={handleSelectRoleForGap}
            onExploreCourse={handleExploreCourse}
          />
        )}

        {activePortalTab === 'skill_gap' && skillGapProfile && (
          <MySkillGapPageView
            gapProfile={skillGapProfile}
            jobRoles={jobRoles}
            onSelectRole={(roleId) => handleSelectRoleForGap(roleId)}
            onNavigateToCourses={() => setActivePortalTab('courses')}
          />
        )}

        {activePortalTab === 'courses' && recommendedCoursesData && (
          <RecommendedCoursesPageView
            candidate={activeCandidate}
            targetRole={recommendedCoursesData.targetRole}
            missingSkillsCount={recommendedCoursesData.missingSkillsCount || 0}
            missingSkillsList={recommendedCoursesData.missingSkillsList || []}
            courses={recommendedCoursesData.courses || []}
          />
        )}
      </div>
    </div>
  );
};
