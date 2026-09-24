/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AppDatabase,
  District,
  Sector,
  Skill,
  JobRole,
  Employer,
  Job,
  TrainingInstitute,
  Course,
  Candidate,
  TrainingCapacity,
  EmployerSurvey,
  Placement,
  SkillDemandMetrics,
  SkillGap,
  CurriculumRecommendation,
  LearningPath,
  User,
  DashboardFilters,
  DashboardMetrics,
  AIInsightItem,
  IndustryDemandFilters,
  IndustryDemandIntelligenceResponse,
  DetailedSkillIntelligence,
  IngestionPreviewResponse,
  IngestionExecutionRequest,
  IngestionExecutionResponse,
  IngestionBatchRecord,
  ExtractedSkillMapping,
  SkillGapFilterParams,
  SkillGapMatrixResponse,
  DetailedCourseAlignmentReport,
  CurriculumRecommendationOverviewResponse,
  CurriculumRecommendationItem,
  RecommendationFilterParams,
  RecommendationStatus,
  CourseHealthOverviewResponse,
  CourseHealthProfile,
  CourseSupplyDemandAlert,
  CourseHealthStatus,
  DistrictPlannerOverviewResponse,
  DistrictDetailPlan,
  CandidateCareerMatch,
  CandidateSkillGapProfile,
  EmployerDashboardData,
  EmployerJobSubmissionRequest,
  EmployerSurveySubmissionRequest,
  InstitutePortalDashboardData,
  InstituteEquipment,
  Trainer,
  CreateCourseRequest,
  InstituteCourseAlignmentOverview,
  PlacementOutcomeAnalyticsResponse
} from '../types/dataModel.ts';

export interface VerificationReport {
  status: 'verified' | 'incomplete';
  allPassed: boolean;
  checks: {
    jobPostings: { target: number; actual: number; passed: boolean };
    skills: { target: number; actual: number; passed: boolean };
    jobRoles: { target: number; actual: number; passed: boolean };
    districts: { target: number; actual: number; passed: boolean };
    sectors: { target: number; actual: number; passed: boolean };
    courses: { target: number; actual: number; passed: boolean };
    employers: { target: number; actual: number; passed: boolean };
    candidates: { target: number; actual: number; passed: boolean };
    placementsPresent: { actual: number; passed: boolean };
    surveysPresent: { actual: number; passed: boolean };
    capacityRecordsPresent: { actual: number; passed: boolean };
    simulatedDataDisclaimer: { passed: boolean };
  };
  summary: {
    totalJobsActive: number;
    totalOpeningsMarket: number;
    totalSanctionedSeats: number;
    totalEnrolled: number;
    totalPlaced: number;
    overallAverageCourseHealth: number;
    criticalCurriculaCount: number;
    severeShortageSkillsCount: number;
    districtsCount: number;
    sectorsCount: number;
    metadata: AppDatabase['datasetMetadata'];
  };
  sampleDistricts: string[];
  sampleSectors: string[];
}

export const apiService = {
  async getHealth() {
    const res = await fetch('/api/health');
    return res.json();
  },

  async verifyDataLayer(): Promise<VerificationReport> {
    const res = await fetch('/api/verify');
    if (!res.ok) throw new Error('Failed to verify data layer');
    return res.json();
  },

  async getMetadata(): Promise<AppDatabase['datasetMetadata']> {
    const res = await fetch('/api/meta');
    return res.json();
  },

  async getSummary() {
    const res = await fetch('/api/summary');
    return res.json();
  },

  async resetData(): Promise<{ success: boolean; metadata: AppDatabase['datasetMetadata'] }> {
    const res = await fetch('/api/reset', { method: 'POST' });
    return res.json();
  },

  async getDistricts(): Promise<District[]> {
    const res = await fetch('/api/districts');
    return res.json();
  },

  async getSectors(): Promise<Sector[]> {
    const res = await fetch('/api/sectors');
    return res.json();
  },

  async getSkills(params?: { categoryId?: string; sectorId?: string; isEmerging?: boolean; search?: string }): Promise<Skill[]> {
    const q = new URLSearchParams();
    if (params?.categoryId) q.set('categoryId', params.categoryId);
    if (params?.sectorId) q.set('sectorId', params.sectorId);
    if (params?.isEmerging !== undefined) q.set('isEmerging', String(params.isEmerging));
    if (params?.search) q.set('search', params.search);
    const res = await fetch(`/api/skills?${q.toString()}`);
    return res.json();
  },

  async getJobRoles(sectorId?: string): Promise<JobRole[]> {
    const res = await fetch(`/api/job-roles${sectorId ? `?sectorId=${sectorId}` : ''}`);
    return res.json();
  },

  async getEmployers(districtId?: string, sectorId?: string): Promise<Employer[]> {
    const q = new URLSearchParams();
    if (districtId) q.set('districtId', districtId);
    if (sectorId) q.set('sectorId', sectorId);
    const res = await fetch(`/api/employers?${q.toString()}`);
    return res.json();
  },

  async getJobs(params?: {
    districtId?: string;
    sectorId?: string;
    jobRoleId?: string;
    employerId?: string;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<{ items: Job[]; total: number; offset: number; limit: number }> {
    const q = new URLSearchParams();
    if (params?.districtId) q.set('districtId', params.districtId);
    if (params?.sectorId) q.set('sectorId', params.sectorId);
    if (params?.jobRoleId) q.set('jobRoleId', params.jobRoleId);
    if (params?.employerId) q.set('employerId', params.employerId);
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.offset) q.set('offset', String(params.offset));
    if (params?.search) q.set('search', params.search);
    const res = await fetch(`/api/jobs?${q.toString()}`);
    return res.json();
  },

  async getJobById(id: string): Promise<Job> {
    const res = await fetch(`/api/jobs/${id}`);
    return res.json();
  },

  async createJob(jobData: Partial<Job>): Promise<Job> {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });
    return res.json();
  },

  async getInstitutes(districtId?: string): Promise<TrainingInstitute[]> {
    const res = await fetch(`/api/institutes${districtId ? `?districtId=${districtId}` : ''}`);
    return res.json();
  },

  async getInstituteById(id: string): Promise<TrainingInstitute> {
    const res = await fetch(`/api/institutes/${id}`);
    return res.json();
  },

  async createInstitute(data: Partial<TrainingInstitute>): Promise<TrainingInstitute> {
    const res = await fetch('/api/institutes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create institute profile');
    return res.json();
  },

  async updateInstitute(id: string, updates: Partial<TrainingInstitute>): Promise<TrainingInstitute> {
    const res = await fetch(`/api/institutes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update institute profile');
    return res.json();
  },

  async getInstituteDashboardData(instituteId: string): Promise<InstitutePortalDashboardData> {
    const res = await fetch(`/api/institutes/${instituteId}/dashboard`);
    if (!res.ok) throw new Error(`Failed to fetch institute dashboard for ${instituteId}`);
    return res.json();
  },

  async addInstituteCourse(courseData: CreateCourseRequest): Promise<Course> {
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create course' }));
      throw new Error(err.details || err.error || 'Failed to create course');
    }
    return res.json();
  },

  async getInstituteTrainers(instituteId: string): Promise<Trainer[]> {
    const res = await fetch(`/api/institutes/${instituteId}/trainers`);
    return res.json();
  },

  async addInstituteTrainer(instituteId: string, trainerData: Omit<Trainer, 'id' | 'instituteId'>): Promise<Trainer> {
    const res = await fetch(`/api/institutes/${instituteId}/trainers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trainerData)
    });
    if (!res.ok) throw new Error('Failed to add trainer');
    return res.json();
  },

  async getInstituteEquipment(instituteId: string): Promise<InstituteEquipment[]> {
    const res = await fetch(`/api/institutes/${instituteId}/equipment`);
    return res.json();
  },

  async addInstituteEquipment(instituteId: string, equipmentData: Omit<InstituteEquipment, 'id' | 'instituteId'>): Promise<InstituteEquipment> {
    const res = await fetch(`/api/institutes/${instituteId}/equipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(equipmentData)
    });
    if (!res.ok) throw new Error('Failed to add equipment');
    return res.json();
  },

  async acknowledgeInstituteRecommendation(
    recommendationId: string,
    status: 'acknowledged' | 'accepted' | 'in_progress' | 'implemented' | 'rejected',
    notes: string,
    acknowledgedBy?: string
  ): Promise<any> {
    const res = await fetch(`/api/institutes/recommendations/${recommendationId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes, acknowledgedBy })
    });
    if (!res.ok) throw new Error('Failed to acknowledge recommendation');
    return res.json();
  },

  async getCourses(params?: { districtId?: string; sectorId?: string; instituteId?: string; minHealth?: number }): Promise<Course[]> {
    const q = new URLSearchParams();
    if (params?.districtId) q.set('districtId', params.districtId);
    if (params?.sectorId) q.set('sectorId', params.sectorId);
    if (params?.instituteId) q.set('instituteId', params.instituteId);
    if (params?.minHealth) q.set('minHealth', String(params.minHealth));
    const res = await fetch(`/api/courses?${q.toString()}`);
    return res.json();
  },

  async getCandidates(params?: { districtId?: string; sectorId?: string; status?: string; search?: string }): Promise<Candidate[]> {
    const q = new URLSearchParams();
    if (params?.districtId) q.set('districtId', params.districtId);
    if (params?.sectorId) q.set('sectorId', params.sectorId);
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    const res = await fetch(`/api/candidates?${q.toString()}`);
    return res.json();
  },

  async getCandidateById(candidateId: string): Promise<Candidate> {
    const res = await fetch(`/api/candidates/${candidateId}`);
    return res.json();
  },

  async updateCandidate(candidateId: string, updates: Partial<Candidate>): Promise<Candidate> {
    const res = await fetch(`/api/candidates/${candidateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async createCandidate(candidateData: Partial<Candidate>): Promise<Candidate> {
    const res = await fetch('/api/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(candidateData)
    });
    return res.json();
  },

  async getCandidateCareerMatches(candidateId: string): Promise<CandidateCareerMatch[]> {
    const res = await fetch(`/api/candidates/${candidateId}/career-matches`);
    return res.json();
  },

  async matchAdHocCandidate(profile: Partial<Candidate>): Promise<CandidateCareerMatch[]> {
    const res = await fetch('/api/candidates/match-ad-hoc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    return res.json();
  },

  async getCandidateSkillGapProfile(candidateId: string, targetRoleId?: string): Promise<CandidateSkillGapProfile> {
    const q = targetRoleId ? `?targetRoleId=${targetRoleId}` : '';
    const res = await fetch(`/api/candidates/${candidateId}/skill-gap${q}`);
    return res.json();
  },

  async getCandidateRecommendedCourses(candidateId: string): Promise<{
    candidate: Candidate;
    targetRole?: JobRole;
    missingSkillsCount: number;
    missingSkillsList: string[];
    courses: Array<{
      course: Course;
      institute?: TrainingInstitute;
      district?: District;
      sector?: Sector;
      matchedGapSkills: Array<{ skillId: string; name: string; proficiencyCovered: string; practicalHours: number }>;
      relevanceScore: number;
      isLocalDistrict: boolean;
      coveragePercentage: number;
    }>;
  }> {
    const res = await fetch(`/api/candidates/${candidateId}/recommended-courses`);
    return res.json();
  },

  async getCandidatePathway(candidateId: string): Promise<LearningPath> {
    const res = await fetch(`/api/candidates/${candidateId}/pathway`);
    return res.json();
  },

  async getPlacements(districtId?: string, sectorId?: string): Promise<Placement[]> {
    const q = new URLSearchParams();
    if (districtId) q.set('districtId', districtId);
    if (sectorId) q.set('sectorId', sectorId);
    const res = await fetch(`/api/placements?${q.toString()}`);
    return res.json();
  },

  async getSurveys(districtId?: string, sectorId?: string): Promise<EmployerSurvey[]> {
    const q = new URLSearchParams();
    if (districtId) q.set('districtId', districtId);
    if (sectorId) q.set('sectorId', sectorId);
    const res = await fetch(`/api/surveys?${q.toString()}`);
    return res.json();
  },

  async getEmployerById(employerId: string): Promise<Employer> {
    const res = await fetch(`/api/employers/${employerId}`);
    return res.json();
  },

  async registerEmployer(data: Omit<Employer, 'id' | 'isVerified'>): Promise<Employer> {
    const res = await fetch('/api/employers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateEmployer(employerId: string, updates: Partial<Employer>): Promise<Employer> {
    const res = await fetch(`/api/employers/${employerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async getEmployerDashboard(employerId: string): Promise<EmployerDashboardData> {
    const res = await fetch(`/api/employer-portal/${employerId}/dashboard`);
    return res.json();
  },

  async submitEmployerJob(jobData: EmployerJobSubmissionRequest): Promise<Job> {
    const res = await fetch('/api/employer-portal/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });
    return res.json();
  },

  async submitEmployerSurvey(surveyData: EmployerSurveySubmissionRequest): Promise<EmployerSurvey> {
    const res = await fetch('/api/employer-portal/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(surveyData)
    });
    return res.json();
  },

  async getCapacity(districtId?: string, sectorId?: string): Promise<TrainingCapacity[]> {
    const q = new URLSearchParams();
    if (districtId) q.set('districtId', districtId);
    if (sectorId) q.set('sectorId', sectorId);
    const res = await fetch(`/api/capacity?${q.toString()}`);
    return res.json();
  },

  async getSkillDemand(districtId?: string, sectorId?: string): Promise<SkillDemandMetrics[]> {
    const q = new URLSearchParams();
    if (districtId) q.set('districtId', districtId);
    if (sectorId) q.set('sectorId', sectorId);
    const res = await fetch(`/api/analytics/demand?${q.toString()}`);
    return res.json();
  },

  async getSkillGaps(districtId?: string, sectorId?: string): Promise<SkillGap[]> {
    const q = new URLSearchParams();
    if (districtId) q.set('districtId', districtId);
    if (sectorId) q.set('sectorId', sectorId);
    const res = await fetch(`/api/analytics/gaps?${q.toString()}`);
    return res.json();
  },

  async getCurriculumRecommendations(courseId?: string): Promise<CurriculumRecommendation[]> {
    const res = await fetch(`/api/analytics/recommendations${courseId ? `?courseId=${courseId}` : ''}`);
    return res.json();
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/users');
    return res.json();
  },

  async getDashboardMetrics(filters: DashboardFilters): Promise<DashboardMetrics> {
    const q = new URLSearchParams();
    if (filters.dateRange) q.set('dateRange', filters.dateRange);
    if (filters.districtId) q.set('districtId', filters.districtId);
    if (filters.sectorId) q.set('sectorId', filters.sectorId);
    if (filters.jobRoleId) q.set('jobRoleId', filters.jobRoleId);
    if (filters.skillId) q.set('skillId', filters.skillId);

    const res = await fetch(`/api/analytics/dashboard?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
    return res.json();
  },

  async fetchAIInsights(filters: DashboardFilters): Promise<{ insights: AIInsightItem[]; source: string }> {
    const res = await fetch('/api/ai/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filters })
    });
    if (!res.ok) throw new Error('Failed to fetch AI insights');
    return res.json();
  },

  async getIndustryDemandIntelligence(filters: IndustryDemandFilters = {}): Promise<IndustryDemandIntelligenceResponse> {
    const q = new URLSearchParams();
    if (filters.districtId) q.set('districtId', filters.districtId);
    if (filters.sectorId) q.set('sectorId', filters.sectorId);
    if (filters.jobRoleId) q.set('jobRoleId', filters.jobRoleId);
    if (filters.skillId) q.set('skillId', filters.skillId);
    if (filters.experienceLevel) q.set('experienceLevel', filters.experienceLevel);
    if (filters.dateRange) q.set('dateRange', filters.dateRange);

    const res = await fetch(`/api/analytics/industry-demand?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch industry demand intelligence');
    return res.json();
  },

  async getSkillIntelligence(skillId: string): Promise<DetailedSkillIntelligence> {
    const res = await fetch(`/api/analytics/skills/${encodeURIComponent(skillId)}/intelligence`);
    if (!res.ok) throw new Error(`Failed to fetch intelligence for skill ${skillId}`);
    return res.json();
  },

  // Job Data Ingestion & Skill Extraction
  async getIngestionTemplates(): Promise<{ id: string; name: string; description: string; csv: string }[]> {
    const res = await fetch('/api/ingestion/templates');
    if (!res.ok) throw new Error('Failed to fetch sample CSV templates');
    return res.json();
  },

  async getIngestionHistory(): Promise<IngestionBatchRecord[]> {
    const res = await fetch('/api/ingestion/history');
    if (!res.ok) throw new Error('Failed to fetch ingestion history');
    return res.json();
  },

  async previewCSV(csvContent: string, fileName = 'job_postings.csv'): Promise<IngestionPreviewResponse> {
    const res = await fetch('/api/ingestion/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvContent, fileName })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to preview CSV' }));
      throw new Error(err.details || err.error || 'Failed to preview CSV');
    }
    return res.json();
  },

  async executeIngestion(request: IngestionExecutionRequest): Promise<IngestionExecutionResponse> {
    const res = await fetch('/api/ingestion/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to execute ingestion' }));
      throw new Error(err.details || err.error || 'Failed to execute ingestion');
    }
    return res.json();
  },

  async extractSkillsFromText(text: string, skillsInput?: string): Promise<{
    extractedSkills: ExtractedSkillMapping[];
    unmatchedTerms: string[];
    rawSkillText: string;
  }> {
    const res = await fetch('/api/skills/extract-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, skillsInput })
    });
    if (!res.ok) throw new Error('Failed to extract skills from text');
    return res.json();
  },

  // Skill Gap Analysis & Course Alignment
  async getSkillGapMatrix(filters?: SkillGapFilterParams): Promise<SkillGapMatrixResponse> {
    const params = new URLSearchParams();
    if (filters?.courseId && filters.courseId !== 'all') params.append('courseId', filters.courseId);
    if (filters?.districtId && filters.districtId !== 'all') params.append('districtId', filters.districtId);
    if (filters?.sectorId && filters.sectorId !== 'all') params.append('sectorId', filters.sectorId);
    if (filters?.skillId && filters.skillId !== 'all') params.append('skillId', filters.skillId);
    if (filters?.jobRoleId && filters.jobRoleId !== 'all') params.append('jobRoleId', filters.jobRoleId);

    const res = await fetch(`/api/analytics/skill-gap-matrix?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch skill gap matrix');
    return res.json();
  },

  async getCourseAlignmentReport(courseId: string): Promise<DetailedCourseAlignmentReport> {
    const res = await fetch(`/api/analytics/course-alignment/${encodeURIComponent(courseId)}`);
    if (!res.ok) throw new Error('Failed to fetch detailed course alignment report');
    return res.json();
  },

  // Curriculum Recommendation Engine Methods
  async getCurriculumRecommendationsOverview(filters?: RecommendationFilterParams): Promise<CurriculumRecommendationOverviewResponse> {
    const params = new URLSearchParams();
    if (filters?.courseId && filters.courseId !== 'all') params.append('courseId', filters.courseId);
    if (filters?.sectorId && filters.sectorId !== 'all') params.append('sectorId', filters.sectorId);
    if (filters?.districtId && filters.districtId !== 'all') params.append('districtId', filters.districtId);
    if (filters?.actionType && filters.actionType !== 'all') params.append('actionType', filters.actionType);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.priority && filters.priority !== 'all') params.append('priority', filters.priority);
    if (filters?.searchQuery) params.append('searchQuery', filters.searchQuery);

    const res = await fetch(`/api/recommendations?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch curriculum recommendations');
    return res.json();
  },

  async updateRecommendationStatus(
    id: string,
    status: RecommendationStatus,
    note?: string,
    performedBy?: string
  ): Promise<CurriculumRecommendationItem> {
    const res = await fetch(`/api/recommendations/${encodeURIComponent(id)}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note, performedBy })
    });
    if (!res.ok) throw new Error('Failed to update recommendation status');
    return res.json();
  },

  async addRecommendationNote(
    id: string,
    note: string,
    performedBy?: string
  ): Promise<CurriculumRecommendationItem> {
    const res = await fetch(`/api/recommendations/${encodeURIComponent(id)}/note`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note, performedBy })
    });
    if (!res.ok) throw new Error('Failed to add note to recommendation');
    return res.json();
  },

  async batchUpdateRecommendations(
    recommendationIds: string[],
    status: RecommendationStatus,
    note?: string,
    performedBy?: string
  ): Promise<{ updatedCount: number; items: CurriculumRecommendationItem[] }> {
    const res = await fetch('/api/recommendations/batch-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recommendationIds, status, note, performedBy })
    });
    if (!res.ok) throw new Error('Failed to perform batch update on recommendations');
    return res.json();
  },

  async regenerateRecommendations(): Promise<{ message: string; count: number }> {
    const res = await fetch('/api/recommendations/regenerate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to regenerate recommendations');
    return res.json();
  },

  // ==========================================
  // COURSE HEALTH MONITOR API METHODS
  // ==========================================

  async getCourseHealthOverview(params?: {
    sectorId?: string;
    districtId?: string;
    status?: CourseHealthStatus;
    hasAlert?: boolean;
    searchQuery?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<CourseHealthOverviewResponse> {
    const q = new URLSearchParams();
    if (params?.sectorId) q.set('sectorId', params.sectorId);
    if (params?.districtId) q.set('districtId', params.districtId);
    if (params?.status) q.set('status', params.status);
    if (params?.hasAlert !== undefined) q.set('hasAlert', String(params.hasAlert));
    if (params?.searchQuery) q.set('searchQuery', params.searchQuery);
    if (params?.sortBy) q.set('sortBy', params.sortBy);
    if (params?.sortOrder) q.set('sortOrder', params.sortOrder);

    const res = await fetch(`/api/course-health?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch course health overview');
    return res.json();
  },

  async getCourseHealthAlerts(): Promise<{ totalAlerts: number; alerts: CourseSupplyDemandAlert[] }> {
    const res = await fetch('/api/course-health-alerts');
    if (!res.ok) throw new Error('Failed to fetch course health alerts');
    return res.json();
  },

  async getCourseHealthDetail(courseId: string): Promise<CourseHealthProfile> {
    const res = await fetch(`/api/course-health/${encodeURIComponent(courseId)}`);
    if (!res.ok) throw new Error(`Failed to fetch course health detail for ${courseId}`);
    return res.json();
  },

  // ==========================================
  // DISTRICT TRAINING PLANNER API METHODS
  // ==========================================

  async getDistrictPlannerOverview(): Promise<DistrictPlannerOverviewResponse> {
    const res = await fetch('/api/district-planner/overview');
    if (!res.ok) throw new Error('Failed to fetch district planner overview');
    return res.json();
  },

  async getDistrictDetailPlan(districtId: string): Promise<DistrictDetailPlan> {
    const res = await fetch(`/api/district-planner/${encodeURIComponent(districtId)}`);
    if (!res.ok) throw new Error(`Failed to fetch district training plan for ${districtId}`);
    return res.json();
  },

  // ==========================================
  // PLACEMENT OUTCOME ANALYTICS API METHODS
  // ==========================================

  async getPlacementAnalytics(filters?: {
    districtId?: string;
    sectorId?: string;
    courseId?: string;
    employerId?: string;
  }): Promise<PlacementOutcomeAnalyticsResponse> {
    const params = new URLSearchParams();
    if (filters?.districtId) params.append('districtId', filters.districtId);
    if (filters?.sectorId) params.append('sectorId', filters.sectorId);
    if (filters?.courseId) params.append('courseId', filters.courseId);
    if (filters?.employerId) params.append('employerId', filters.employerId);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`/api/analytics/placements${qs}`);
    if (!res.ok) throw new Error('Failed to fetch placement analytics');
    return res.json();
  }
};
