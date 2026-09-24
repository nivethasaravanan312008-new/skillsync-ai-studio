/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ==========================================
// CORE DOMAIN TYPES FOR SKILLSYNC PLATFORM
// ==========================================

export type UserRole = 'admin' | 'employer' | 'candidate' | 'institute';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  entityId?: string; // Links to candidateId, employerId, or instituteId
  avatar: string;
  organization?: string;
}

export interface RoleDef {
  id: UserRole;
  name: string;
  description: string;
  permissions: string[];
}

export interface District {
  id: string;
  name: string;
  division: string;
  state: string; // 'Maharashtra'
  lat: number;
  lng: number;
  industrialHubType: string;
  majorIndustries: string[];
  approxWorkforce: number;
}

export interface Sector {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  highGrowth: boolean;
}

export interface SkillCategory {
  id: string;
  name: string;
  description: string;
}

export interface Skill {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  category?: string;
  sectorIds: string[];
  nsqfLevel: number; // 1 to 10
  isEmerging: boolean;
  demandTrend: 'surging' | 'stable' | 'declining';
  aliases: string[];
  description: string;
}

export interface JobRole {
  id: string;
  title: string;
  sectorId: string;
  minNsqfLevel: number;
  defaultSkillIds: string[];
  averageSalaryINR: number;
  entryLevelOpenings: number;
  description: string;
}

export interface Employer {
  id: string;
  name: string;
  sectorId: string;
  districtId: string;
  companySize: 'Small (<50)' | 'Mid-size (50-250)' | 'Enterprise (250-1000)' | 'Large Enterprise (1000+)';
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  isVerified: boolean;
  tier: 'Strategic Partner' | 'Standard' | 'MOU Signed';
}

export interface JobSkillRequirement {
  skillId: string;
  importance: 'critical' | 'preferred' | 'optional';
  minProficiency: 'basic' | 'intermediate' | 'advanced';
}

export interface ExtractedSkillMapping {
  rawTerm: string;
  normalizedTerm: string;
  matchedSkillId: string;
  matchedSkillName: string;
  confidence: number;
  isVariationMapped: boolean; // e.g. JS -> JavaScript
  importance: 'critical' | 'preferred' | 'optional';
  minProficiency: 'basic' | 'intermediate' | 'advanced';
}

export interface Job {
  id: string;
  title: string;
  jobRoleId: string;
  employerId: string;
  sectorId: string;
  districtId: string;
  openings: number;
  minSalaryINR: number;
  maxSalaryINR: number;
  experienceRequiredYears: number;
  requiredSkills: JobSkillRequirement[]; // Relational Job Skills
  educationRequired: string;
  description: string;
  rawSkillText?: string;
  extractedSkills?: ExtractedSkillMapping[];
  status: 'active' | 'filled' | 'closed';
  postedDate: string; // ISO String
  isRemoteFriendly: boolean;
  employmentType: 'Full-time' | 'Apprenticeship' | 'Contract';
  source: 'Simulated Industry Data' | 'CSV Ingestion' | 'Direct Employer Post';
}

export interface TrainingInstitute {
  id: string;
  name: string;
  type: 'Government ITI' | 'Polytechnic Institute' | 'MSDC Skill Center' | 'Engineering College' | 'Private Training Partner';
  districtId: string;
  address: string;
  accreditationRating: 'A+' | 'A' | 'B+' | 'B';
  totalCapacitySeats: number;
  principalContact: string;
  email: string;
  phone: string;
  establishedYear: number;
}

export interface CourseSkillCurriculum {
  skillId: string;
  proficiencyGoal: 'basic' | 'intermediate' | 'advanced';
  practicalHours: number;
  theoryHours: number;
}

export interface CurriculumModule {
  id: string;
  courseId: string;
  moduleNumber: number;
  title: string;
  description: string;
  durationHours: number;
  skillIds: string[];
  isOutdated: boolean;
  suggestedRevision?: string;
  lastUpdated: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  instituteId: string;
  districtId: string;
  sectorId: string;
  nsqfLevel: number;
  durationHours: number;
  annualBatchCapacity: number;
  currentEnrolled: number;
  graduatedLastYear: number;
  targetJobRoleId: string;
  coveredSkills: CourseSkillCurriculum[]; // Relational Course Skills
  curriculumModules: CurriculumModule[];
  feeStructureINR: number;
  certificationBody: string;
  healthScore: number; // 0-100 calculated from market alignment
  lastCurriculumReviewDate: string;
}

export interface Trainer {
  id: string;
  name: string;
  instituteId: string;
  email: string;
  specializationSkillIds: string[];
  certifiedNsqfLevel: number;
  yearsExperience: number;
  rating: number; // out of 5
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  districtId: string;
  educationLevel: '10th Pass' | '12th Pass' | 'ITI Diploma' | 'Polytechnic' | 'Graduate (Technical)' | 'Graduate (Non-Technical)';
  targetSectorId: string;
  targetJobRoleId: string;
  currentSkillIds: string[];
  experienceYears: number;
  resumeBio: string;
  status: 'seeking_job' | 'in_training' | 'placed' | 'upskilling';
  enrolledCourseId?: string;
  registrationDate: string;
}

export interface TrainingCapacity {
  id: string;
  districtId: string;
  sectorId: string;
  totalSanctionedSeats: number;
  enrolledSeats: number;
  vacantSeats: number;
  activeInstitutesCount: number;
  utilizationPercentage: number;
  fiscalYear: string;
}

export interface EmployerSurvey {
  id: string;
  employerId: string;
  sectorId: string;
  districtId: string;
  surveyDate: string;
  reportedHardToFillSkillIds: string[];
  hiringDifficultyScale: number; // 1-5 (5 = extremely hard)
  plannedHiringNext6Months: number;
  emergingSkillComments: string;
  readinessRating: number; // 1-5 satisfaction with current fresh graduates
}

export interface Placement {
  id: string;
  candidateId: string;
  courseId: string;
  instituteId: string;
  employerId: string;
  jobId: string;
  placedSalaryINR: number;
  placementDate: string;
  retentionMonths6: boolean;
  employerFeedbackScore: number; // 1-5
}

// ==========================================
// DERIVED / COMPUTED ANALYTICS ENTITIES
// ==========================================

export interface SkillDemandMetrics {
  skillId: string;
  skillName: string;
  sectorId: string;
  districtId?: string;
  totalOpenings: number;
  postingCount: number;
  averageSalaryMin: number;
  averageSalaryMax: number;
  growth12mPercentage: number;
  urgency: 'high' | 'medium' | 'low';
}

export interface SkillGap {
  id: string;
  skillId: string;
  skillName: string;
  districtId: string;
  districtName: string;
  sectorId: string;
  sectorName: string;
  openingsDemand: number;
  traineeSupply: number;
  netDeficit: number; // Demand - Supply
  gapIndex: number; // 0 - 100 severity
  urgencyLevel: 'Severe Shortage' | 'Moderate Gap' | 'Equilibrium' | 'Surplus Supply';
  recommendedSeatsToSanction: number;
}

export interface CurriculumRecommendation {
  id: string;
  courseId: string;
  courseTitle: string;
  instituteId: string;
  instituteName: string;
  districtId: string;
  overallAlignmentScore: number; // 0 - 100%
  healthStatus: 'Critical Outdated' | 'Moderate Revision Needed' | 'Industry Aligned';
  missingCriticalSkills: {
    skillId: string;
    skillName: string;
    marketDemandScore: number;
  }[];
  redundantSkills: {
    skillId: string;
    skillName: string;
  }[];
  recommendedModulesToAdd: {
    suggestedTitle: string;
    suggestedHours: number;
    targetSkills: string[];
    rationale: string;
  }[];
  generatedAt: string;
}

export interface LearningPathStep {
  stepNumber: number;
  skillId: string;
  skillName: string;
  recommendedCourseId?: string;
  recommendedCourseTitle?: string;
  estimatedWeeks: number;
  proficiencyGained: string;
}

export interface LearningPath {
  id: string;
  candidateId: string;
  targetJobRoleId: string;
  targetRoleTitle: string;
  currentEmployabilityScore: number; // 0 - 100%
  targetEmployabilityScore: number;
  gapSkillIds: string[];
  steps: LearningPathStep[];
  estimatedTotalWeeks: number;
  potentialSalaryUpliftINR: number;
}

// Complete Database Schema Payload
export interface AppDatabase {
  datasetMetadata: {
    title: string;
    version: string;
    type: 'Demo / Simulated Data';
    disclaimer: string;
    generatedAt: string;
    totalRecords: {
      jobs: number;
      skills: number;
      jobRoles: number;
      districts: number;
      sectors: number;
      courses: number;
      employers: number;
      candidates: number;
      placements: number;
      surveys: number;
      capacity: number;
    };
  };
  users: User[];
  roles: RoleDef[];
  districts: District[];
  sectors: Sector[];
  skillCategories: SkillCategory[];
  skills: Skill[];
  jobRoles: JobRole[];
  employers: Employer[];
  jobs: Job[];
  institutes: TrainingInstitute[];
  courses: Course[];
  trainers: Trainer[];
  equipment?: InstituteEquipment[];
  candidates: Candidate[];
  trainingCapacity: TrainingCapacity[];
  employerSurveys: EmployerSurvey[];
  placements: Placement[];
  ingestionHistory: IngestionBatchRecord[];
  curriculumRecommendations?: CurriculumRecommendationItem[];
  recommendationAuditLogs?: RecommendationAuditLog[];
}

// ==========================================
// ADMIN DASHBOARD & CHARTS CONTRACTS
// ==========================================

export interface DashboardFilters {
  dateRange: '30d' | '60d' | '90d' | 'all';
  districtId: string;
  sectorId: string;
  jobRoleId: string;
  skillId: string;
}

export interface JobDemandTimePoint {
  periodLabel: string;
  postingsCount: number;
  openingsCount: number;
  avgSalaryMin?: number;
  averageSalaryINR?: number;
}

export interface SkillDemandItem {
  skillId: string;
  skillName: string;
  categoryName: string;
  openings: number;
  postingsCount: number;
  avgSalary: number;
  isEmerging: boolean;
  demandTrend: 'surging' | 'stable' | 'declining';
}

export interface JobRoleDemandItem {
  roleId: string;
  title: string;
  sectorName: string;
  openings: number;
  postingsCount: number;
  averageSalaryINR: number;
}

export interface SectorDemandItem {
  sectorId: string;
  name: string;
  code: string;
  openings: number;
  postingsCount: number;
  sharePercentage: number;
  highGrowth: boolean;
}

export interface DistrictDemandItem {
  districtId: string;
  name: string;
  openings: number;
  postingsCount: number;
  sharePercentage: number;
  industrialHubType: string;
  approxWorkforce: number;
}

export interface TrendSkillItem {
  skillId: string;
  name: string;
  category: string;
  nsqfLevel: number;
  openings: number;
  growthPercentage: number;
  trend: 'surging' | 'stable' | 'declining';
  rationale: string;
}

export interface CourseAlignmentBreakdown {
  highAlignmentCount: number; // >= 80%
  moderateAlignmentCount: number; // 60-79%
  criticalOutdatedCount: number; // < 60%
  averageHealthScore: number;
  totalCoursesAnalyzed: number;
}

export interface PlacementOutcomesSummary {
  placementRatePercentage: number;
  totalPlaced: number;
  totalCandidatesAnalyzed: number;
  medianSalaryINR: number;
  retentionRate6Months: number;
  topPlacedSectors: { sectorName: string; count: number }[];
}

export interface AIInsightItem {
  id: string;
  type: 'trend' | 'gap_alert' | 'curriculum_warning' | 'policy_recommendation';
  title: string;
  description: string;
  metricHighlight?: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
}

export interface DashboardMetrics {
  filtersApplied: DashboardFilters;
  kpis: {
    jobsAnalyzed: number;
    totalOpenings: number;
    skillsTracked: number;
    employersCount: number;
    coursesCount: number;
    districtsCount: number;
    skillGapsDetected: number;
    placementRate: number;
    emergingSkillsCount: number;
  };
  charts: {
    jobDemandOverTime: JobDemandTimePoint[];
    topSkillsByDemand: SkillDemandItem[];
    topJobRoles: JobRoleDemandItem[];
    demandBySector: SectorDemandItem[];
    demandByDistrict: DistrictDemandItem[];
    emergingSkills: TrendSkillItem[];
    decliningSkills: TrendSkillItem[];
    courseAlignmentDistribution: CourseAlignmentBreakdown;
    placementOutcomes: PlacementOutcomesSummary;
  };
  aiInsights: AIInsightItem[];
  generatedAt: string;
}

// ==========================================
// INDUSTRY DEMAND INTELLIGENCE TYPES
// ==========================================

export interface IndustryDemandFilters {
  districtId?: string;
  sectorId?: string;
  jobRoleId?: string;
  skillId?: string;
  experienceLevel?: 'all' | 'entry' | 'mid' | 'senior';
  dateRange?: 'all' | '90d' | '60d' | '30d';
}

export interface SkillDemandScoreBreakdown {
  postingsFactor: number; // 0-35 points based on job postings volume
  employerFactor: number; // 0-25 points based on distinct employers count
  geographicFactor: number; // 0-20 points based on district spread
  growthFactor: number; // 0-20 points based on velocity / trend
  formulaExplanation: string;
}

export interface SkillDemandIntelligenceItem {
  skillId: string;
  skillName: string;
  code: string;
  category: string;
  nsqfLevel: number;
  demandScore: number; // 0-100 normalized
  scoreBreakdown: SkillDemandScoreBreakdown;
  jobPostingsCount: number;
  totalOpenings: number;
  distinctEmployersCount: number;
  trend: 'surging' | 'stable' | 'declining';
  growthPercentage: number;
  isEmerging: boolean;
  topJobRoles: { roleId: string; title: string; openings: number }[];
  topDistricts: { districtId: string; name: string; openings: number }[];
  topSectors: { sectorId: string; name: string; openings: number }[];
  avgSalaryINR: number;
}

export interface ExperienceDemandItem {
  level: string;
  key: 'entry' | 'mid' | 'senior';
  experienceRange: string;
  openings: number;
  postingsCount: number;
  sharePercentage: number;
  avgSalaryMinINR: number;
  avgSalaryMaxINR: number;
}

export interface ProficiencyDemandItem {
  proficiency: 'basic' | 'intermediate' | 'advanced';
  label: string;
  openings: number;
  requirementsCount: number;
  sharePercentage: number;
}

export interface IndustryDemandIntelligenceResponse {
  filtersApplied: IndustryDemandFilters;
  summary: {
    totalJobsAnalyzed: number;
    totalOpenings: number;
    skillsCount: number;
    distinctEmployersCount: number;
    avgSalaryINR: number;
  };
  skillsRanked: SkillDemandIntelligenceItem[];
  topJobRoles: JobRoleDemandItem[];
  demandByDistrict: DistrictDemandItem[];
  demandBySector: SectorDemandItem[];
  demandByExperience: ExperienceDemandItem[];
  demandByProficiency: ProficiencyDemandItem[];
  demandOverTime: JobDemandTimePoint[];
  emergingSkills: TrendSkillItem[];
  decliningSkills: TrendSkillItem[];
}

export interface DetailedSkillIntelligence {
  skill: Skill;
  demandScore: number;
  scoreBreakdown: SkillDemandScoreBreakdown;
  summary: {
    totalOpenings: number;
    jobPostingsCount: number;
    distinctEmployersCount: number;
    districtsCount: number;
    avgSalaryINR: number;
    growthPercentage: number;
    urgency: string;
  };
  demandTrendOverTime: { period: string; openings: number; postings: number }[];
  relatedJobRoles: {
    roleId: string;
    title: string;
    sectorName: string;
    openings: number;
    avgSalaryINR: number;
    importance: string;
    minProficiency: string;
  }[];
  relatedSectors: {
    sectorId: string;
    name: string;
    openings: number;
    sharePercentage: number;
  }[];
  districtDistribution: {
    districtId: string;
    name: string;
    openings: number;
    sharePercentage: number;
    topEmployerName?: string;
  }[];
  proficiencyBreakdown: {
    proficiency: 'basic' | 'intermediate' | 'advanced';
    openings: number;
    sharePercentage: number;
  }[];
  employerDemand: {
    employerId: string;
    name: string;
    tier: string;
    districtName: string;
    sectorName: string;
    openings: number;
    postingsCount: number;
  }[];
  teachingCourses: {
    courseId: string;
    courseCode: string;
    courseTitle: string;
    instituteName: string;
    districtName: string;
    proficiencyGoal: string;
    practicalHours: number;
    theoryHours: number;
    healthScore: number;
    annualCapacity: number;
  }[];
  skillGapInfo: {
    hasGapRecord: boolean;
    openingsDemand: number;
    traineeSupply: number;
    netDeficit: number;
    gapIndex: number;
    urgencyLevel: string;
    recommendedSeatsToSanction: number;
    rationale: string;
  };
}

// ==========================================
// JOB DATA INGESTION & SKILL EXTRACTION TYPES
// ==========================================

export interface IngestionParsedRow {
  rowNumber: number;
  rawInput: Record<string, string>;
  parsedFields: {
    jobTitle: string;
    company: string;
    district: string;
    sector: string;
    description: string;
    rawSkillsString: string;
    experienceYears: number;
    minSalaryINR: number;
    maxSalaryINR: number;
    postedDate: string;
  };
  matchedEntities: {
    districtId?: string;
    districtName?: string;
    sectorId?: string;
    sectorName?: string;
    employerId?: string;
    employerName?: string;
    jobRoleId?: string;
    jobRoleTitle?: string;
  };
  extractedSkills: ExtractedSkillMapping[];
  unmatchedTerms: string[];
  status: 'valid' | 'warning' | 'error';
  validationErrors: string[];
  validationWarnings: string[];
}

export interface IngestionBatchRecord {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  uploadedAt: string;
  importedBy: string;
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  extractedSkillsCount: number;
  status: 'Completed' | 'Partial' | 'Failed';
  summary: {
    newEmployersAdded: number;
    newJobsAdded: number;
    totalOpeningsAdded: number;
    sectorsAffected: string[];
    districtsAffected: string[];
  };
}

export interface IngestionPreviewResponse {
  fileName: string;
  totalRows: number;
  validRowsCount: number;
  warningRowsCount: number;
  errorRowsCount: number;
  detectedHeaders: string[];
  missingHeaders: string[];
  rows: IngestionParsedRow[];
  extractedSkillsSummary: {
    uniqueNormalizedSkills: number;
    topIdentifiedSkills: { term: string; count: number; skillId: string; skillName: string }[];
    topVariationsMapped: { raw: string; normalized: string; count: number }[];
  };
}

export interface IngestionExecutionRequest {
  fileName: string;
  rows: IngestionParsedRow[];
  skipInvalidRows: boolean;
  createMissingEmployers: boolean;
}

export interface IngestionExecutionResponse {
  success: boolean;
  message: string;
  batch: IngestionBatchRecord;
  newTotalJobs: number;
  newTotalEmployers: number;
}

// ==========================================
// SKILL GAP ANALYSIS & COURSE ALIGNMENT TYPES
// ==========================================

export type SkillCoverageStatus = 'covered' | 'partially_covered' | 'missing';

export interface CourseSkillComparisonItem {
  skillId: string;
  skillName: string;
  category: string;
  nsqfLevel: number;
  status: SkillCoverageStatus; // 'covered' (green), 'partially_covered' (yellow), 'missing' (red)
  
  // Industry Demand Attributes
  industryDemandScore: number; // 0-100
  industryOpenings: number;
  industryPostingsCount: number;
  employerDemandCount: number;
  isCritical: boolean; // Critical missing skill
  importance: 'critical' | 'preferred' | 'optional';
  requiredProficiency: 'basic' | 'intermediate' | 'advanced';
  
  // Course Curriculum Coverage Attributes
  coveredProficiency?: 'basic' | 'intermediate' | 'advanced';
  practicalHoursTaught: number;
  theoryHoursTaught: number;
  moduleTitle?: string;
  isOutdatedModule?: boolean;
  
  // Explainable Gap Rationale (WHY detected)
  gapExplanation: string;
}

export interface CourseSkillGapSummary {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  instituteId: string;
  instituteName: string;
  districtId: string;
  districtName: string;
  sectorId: string;
  sectorName: string;
  jobRoleId: string;
  jobRoleTitle: string;
  nsqfLevel: number;
  durationWeeks: number;
  annualBatchCapacity: number;
  currentEnrolled: number;
  
  // Metrics calculated from industry vs curriculum
  totalIndustrySkillsRequired: number;
  skillsCoveredCount: number;
  skillsPartiallyCoveredCount: number;
  skillsMissingCount: number;
  criticalMissingCount: number;
  
  coveragePercentage: number; // 0-100
  gapPercentage: number; // 0-100
  alignmentScore: number; // 0-100 (Curriculum Alignment Score)
  alignmentStatus: 'Industry Aligned' | 'Moderate Gap' | 'Critical Deficit';
  
  // Aggregate demand
  totalRelatedJobOpenings: number;
  avgJobSalaryINR: number;
  
  // Skill items list
  skills: CourseSkillComparisonItem[];
  missingSkillsList: CourseSkillComparisonItem[];
  criticalMissingSkillsList: CourseSkillComparisonItem[];
  coveredSkillsList: CourseSkillComparisonItem[];
  partiallyCoveredSkillsList: CourseSkillComparisonItem[];
}

export interface SkillGapFilterParams {
  courseId?: string;
  districtId?: string;
  sectorId?: string;
  skillId?: string;
  jobRoleId?: string;
}

export interface DetailedCourseAlignmentReport {
  course: Course;
  institute: TrainingInstitute;
  district: District;
  sector: Sector;
  primaryJobRole: JobRole;
  
  // Dynamic Calculations
  summary: CourseSkillGapSummary;
  
  // Industry Demand Context
  industryDemand: {
    targetJobRoles: { id: string; title: string; openings: number; avgSalaryINR: number }[];
    totalActiveOpenings: number;
    totalJobPostings: number;
    distinctHiringEmployers: number;
    topHiringEmployers: { id: string; name: string; tier: string; openings: number }[];
    averageSalaryINR: number;
    minSalaryINR: number;
    maxSalaryINR: number;
  };
  
  // Current Curriculum
  currentCurriculum: {
    totalHours: number;
    practicalHours: number;
    theoryHours: number;
    modulesCount: number;
    outdatedModulesCount: number;
    modules: CurriculumModule[];
  };
  
  // Detailed Skill Breakdown
  comparison: CourseSkillComparisonItem[];
  
  // Placement Outcome Analysis for this course
  placementOutcome: {
    historicalPlacedCount: number;
    enrolledCount: number;
    placementRate: number; // %
    medianPlacedSalaryINR: number;
    avgEmployerFeedbackScore: number; // 1-5
    retentionRate6Months: number; // %
    topPlacementEmployers: { name: string; placedCount: number }[];
  };
  
  // Recommendations (Dynamic & Explainable)
  recommendations: {
    id: string;
    type: 'add_module' | 'retire_module' | 'upgrade_proficiency' | 'faculty_training';
    priority: 'urgent' | 'high' | 'medium';
    title: string;
    rationale: string; // Explains WHY based on real market data
    suggestedHours: number;
    targetSkills: string[];
    marketMetricHighlight: string;
  }[];
}

export interface SkillGapMatrixResponse {
  filtersApplied: SkillGapFilterParams;
  overview: {
    totalCoursesAnalyzed: number;
    totalSkillsEvaluated: number;
    averageAlignmentScore: number;
    criticalDeficitCoursesCount: number;
    moderateGapCoursesCount: number;
    alignedCoursesCount: number;
    totalCriticalMissingSkills: number;
  };
  matrixCourses: CourseSkillGapSummary[];
  allTrackedSkills: { id: string; name: string; category: string; overallDemandScore: number }[];
}

// ==========================================
// CURRICULUM RECOMMENDATION ENGINE CONTRACTS
// ==========================================

export type RecommendationActionType = 'ADD' | 'INCREASE' | 'REDUCE' | 'OUTDATED_TOPIC' | 'PRACTICAL_PROJECT';
export type RecommendationPriority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type RecommendationStatus = 'pending' | 'accepted' | 'rejected' | 'under_review';

export interface RecommendationAuditLog {
  id: string;
  recommendationId: string;
  timestamp: string;
  action: 'created' | 'accepted' | 'rejected' | 'marked_for_review' | 'note_added';
  performedBy: string;
  previousStatus?: RecommendationStatus;
  newStatus?: RecommendationStatus;
  note?: string;
}

export interface CurriculumRecommendationItem {
  id: string;
  courseId: string;
  courseTitle: string;
  courseCode: string;
  instituteId: string;
  instituteName: string;
  districtId: string;
  districtName: string;
  sectorId: string;
  sectorName: string;
  
  actionType: RecommendationActionType;
  priority: RecommendationPriority;
  status: RecommendationStatus;
  
  skillId?: string;
  skillName: string;
  category: string;
  
  // Explanation and Reason
  reason: string;
  detailedExplanation: string;
  
  // Evidence data points
  evidence: {
    demandScore: number; // 0-100
    employerCount: number; // number of employers demanding this
    activeOpenings: number;
    trend: 'surging' | 'stable' | 'declining';
    currentTaughtHours: number;
    currentProficiency?: 'basic' | 'intermediate' | 'advanced';
    placementImpactNote?: string;
    sampleEmployers: string[];
    growth12mPercentage?: number;
  };
  
  // Recommended target state
  recommendedProficiency: 'basic' | 'intermediate' | 'advanced';
  suggestedLabHours: number;
  
  // Recommended Practical Project (lab module)
  practicalProject?: {
    title: string;
    description: string;
    deliverables: string[];
    suggestedHours: number;
  };
  
  // Administrative workflow
  adminNotes: string;
  reviewedAt?: string;
  reviewedBy?: string;
  auditLogs: RecommendationAuditLog[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseCurriculumPlan {
  courseId: string;
  courseTitle: string;
  courseCode: string;
  instituteName: string;
  districtName: string;
  sectorName: string;
  nsqfLevel: number;
  alignmentScore: number;
  gapPercentage: number;
  placementRate: number;
  medianSalaryINR: number;
  totalOpenings: number;
  hasSignificantGaps: boolean;
  
  recommendations: {
    add: CurriculumRecommendationItem[];
    increase: CurriculumRecommendationItem[];
    reduce: CurriculumRecommendationItem[];
    outdatedTopics: CurriculumRecommendationItem[];
    practicalProjects: CurriculumRecommendationItem[];
  };
  
  stats: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    underReview: number;
  };
}

export interface CurriculumRecommendationOverviewResponse {
  overview: {
    totalCoursesWithGaps: number;
    totalRecommendationsGenerated: number;
    pendingCount: number;
    acceptedCount: number;
    rejectedCount: number;
    underReviewCount: number;
    skillsToAddCount: number;
    skillsToIncreaseCount: number;
    skillsToReduceCount: number;
    outdatedTopicsCount: number;
    projectsCount: number;
  };
  courses: CourseCurriculumPlan[];
  allRecommendations: CurriculumRecommendationItem[];
}

export interface RecommendationFilterParams {
  courseId?: string;
  sectorId?: string;
  districtId?: string;
  actionType?: RecommendationActionType | 'all';
  status?: RecommendationStatus | 'all';
  priority?: RecommendationPriority | 'all';
  searchQuery?: string;
}

// ==========================================
// COURSE HEALTH MONITOR TYPES
// ==========================================

export type CourseHealthStatus =
  | 'High Demand'
  | 'Growing'
  | 'Stable'
  | 'Declining'
  | 'Oversupplied';

export type SupplyDemandAlertSeverity = 'critical' | 'warning' | 'info';
export type SupplyDemandAlertType =
  | 'critical_shortage'
  | 'severe_oversupply'
  | 'curriculum_misalignment'
  | 'placement_risk';

export interface CourseSupplyDemandAlert {
  id: string;
  courseId: string;
  courseTitle: string;
  type: SupplyDemandAlertType;
  severity: SupplyDemandAlertSeverity;
  title: string;
  message: string;
  metrics: {
    candidateSupply: number;
    activeOpenings: number;
    ratio: number;
    placementRate: number;
    alignmentScore: number;
  };
  recommendedAction: string;
  urgency: 'Immediate Intervention' | 'Board Review' | 'Monitor Closely';
}

export interface CourseHealthProfile {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  instituteId: string;
  instituteName: string;
  districtId: string;
  districtName: string;
  sectorId: string;
  sectorName: string;
  nsqfLevel: number;
  durationHours: number;
  targetJobRoleId: string;
  targetJobRoleTitle: string;

  // 1. Demand Display & Metrics
  industryDemand: {
    activeOpenings: number;
    uniqueEmployersCount: number;
    topHiringCompanies: Array<{ name: string; openings: number }>;
    averageSalaryMin: number;
    averageSalaryMax: number;
    demandScore: number; // 0-100 normalized score
    urgencyLevel: 'high' | 'medium' | 'low';
  };

  // 2. Alignment Display & Metrics
  skillAlignment: {
    alignmentScore: number; // 0-100%
    gapPercentage: number;
    skillsTaughtCount: number;
    skillsMissingCount: number;
    criticalMissingSkillsCount: number;
    practicalHoursTotal: number;
    theoryHoursTotal: number;
    practicalIntensityRatio: number; // e.g. 0.62 (62%)
    alignmentStatus: 'Industry Aligned' | 'Moderate Gap' | 'Critical Deficit';
  };

  // 3. Placement Rate Display & Outcomes
  placementRate: number; // percentage e.g. 78.5%
  placementOutcomes: {
    placedCount: number;
    totalTrackedCandidates: number;
    placementRate: number;
    averageSalaryINR: number;
    medianSalaryINR: number;
    retentionRate6m: number; // percentage e.g. 84%
    averageEmployerRating: number; // 1-5
    recentPlacements: Array<{
      id: string;
      candidateName: string;
      employerName: string;
      jobTitle: string;
      placedSalaryINR: number;
      placementDate: string;
      retentionMonths6: boolean;
      feedbackScore: number;
    }>;
  };

  // 4. Supply Display & Metrics
  candidateSupply: {
    annualBatchCapacity: number;
    currentEnrolled: number;
    graduatedLastYear: number;
    totalCandidateSupply: number; // enrolled + job seekers in role
    activeJobSeekersForRole: number;
    supplyDemandRatio: number; // supply / openings
    supplyStatus: 'Severe Deficit' | 'Moderate Deficit' | 'Balanced' | 'Surplus' | 'Acute Oversupply';
  };

  // 5. Trend Display & Metrics
  demandTrend: {
    growth12mPercentage: number; // e.g. +28% or -16%
    direction: 'surging' | 'stable' | 'declining';
    monthlyTrajectory: Array<{ month: string; postings: number; placements: number }>;
    trendDescription: string;
  };

  // 6. Health Status Display (Strict enum)
  healthStatus: CourseHealthStatus;

  // Explainable Calculation Breakdown
  compositeHealthScore: number; // 0-100
  scoreBreakdown: {
    demandScore: number;       // 25% weight
    alignmentScore: number;    // 25% weight
    placementScore: number;    // 20% weight
    trendScore: number;        // 15% weight
    supplyBalanceScore: number;// 15% weight
  };
  statusExplanation: string; // Plain-English rationale detailing exactly which thresholds triggered this status
  calculationFactors: Array<{
    factor: string;
    value: string | number;
    weight: string;
    impact: 'positive' | 'neutral' | 'negative';
    detail: string;
  }>;

  // Employer Requirements & Surveys
  employerRequirements: {
    hiringDifficultyRating: number; // 1-5
    graduateReadinessRating: number; // 1-5
    reportedHardToFillSkills: Array<{ skillId: string; skillName: string }>;
    topIndustryRoleTitles: string[];
    sampleRequirementsNotes: string[];
  };

  // Skills Taught List
  skillsTaught: Array<{
    skillId: string;
    skillName: string;
    categoryName: string;
    practicalHours: number;
    theoryHours: number;
    coveredProficiency: 'basic' | 'intermediate' | 'advanced';
    industryOpenings: number;
    demandTrend: 'surging' | 'stable' | 'declining';
    status: 'aligned' | 'partially_covered';
  }>;

  // Skills Missing List
  skillsMissing: Array<{
    skillId: string;
    skillName: string;
    categoryName: string;
    industryOpenings: number;
    employersRequiringCount: number;
    requiredProficiency: 'basic' | 'intermediate' | 'advanced';
    growth12mPercentage: number;
    isCritical: boolean;
  }>;

  // Curriculum Recommendations
  curriculumRecommendations: Array<{
    id: string;
    actionType: 'ADD' | 'INCREASE' | 'REDUCE' | 'OUTDATED_TOPIC' | 'PROJECT';
    title: string;
    skillName?: string;
    reason: string;
    priority: 'Urgent' | 'High' | 'Medium' | 'Low';
    status: RecommendationStatus;
    suggestedHours: number;
    recommendedProficiency?: string;
  }>;

  // Supply-Demand Mismatch Alerts
  alerts: CourseSupplyDemandAlert[];
}

export interface CourseHealthOverviewResponse {
  summary: {
    totalMonitoredCourses: number;
    highDemandCount: number;
    growingCount: number;
    stableCount: number;
    decliningCount: number;
    oversuppliedCount: number;
    totalAlertsCount: number;
    criticalAlertsCount: number;
    averageAlignmentScore: number;
    averagePlacementRate: number;
    totalIndustryOpenings: number;
    totalTraineeSupply: number;
  };
  mismatchAlerts: CourseSupplyDemandAlert[];
  courses: CourseHealthProfile[];
}

export interface CourseHealthFilterParams {
  sectorId?: string;
  districtId?: string;
  status?: CourseHealthStatus | 'all';
  hasAlert?: boolean;
  searchQuery?: string;
  sortBy?: 'health' | 'demand' | 'alignment' | 'placement' | 'supply' | 'trend';
  sortOrder?: 'asc' | 'desc';
}

// ==========================================
// DISTRICT TRAINING PLANNER TYPES
// ==========================================

export type DistrictRecommendationType = 
  | 'increase_seats'
  | 'introduce_course'
  | 'add_trainers'
  | 'update_curriculum'
  | 'increase_lab_capacity';

export interface DistrictTrainingRecommendation {
  id: string;
  districtId: string;
  districtName: string;
  skillId?: string;
  skillName: string;
  sectorId: string;
  sectorName: string;
  recommendationType: DistrictRecommendationType;
  title: string;
  industryDemand: 'Critical' | 'High' | 'Moderate' | 'Low';
  currentTrainingCapacity: number;
  recommendedTrainingCapacity: number;
  capacityGap: number; // recommended - current
  currentTrainerCount: number;
  recommendedTrainerCapacity: number; // e.g. based on student-to-trainer ratio
  trainerGap: number; // recommended - current
  priority: 'Urgent' | 'High' | 'Medium';
  actionRationale: string;
  suggestedAction: string;
  targetCourseId?: string;
  targetCourseTitle?: string;
  status: 'recommended' | 'approved' | 'in_progress' | 'implemented';
  estimatedInvestmentINR: number;
  timeframeMonths: number;
}

export interface DistrictSkillDemandCapacityItem {
  skillId: string;
  skillName: string;
  sectorId: string;
  sectorName: string;
  demandOpenings: number;
  trainingCapacitySeats: number;
  enrolledTrainees: number;
  graduatedTrainees: number;
  capacityGap: number; // demand - capacity
  urgency: 'Critical' | 'High' | 'Moderate' | 'Surplus';
  demandTrend: 'surging' | 'stable' | 'declining';
  existingCoursesCount: number;
  trainersCount: number;
  recommendedSeats: number;
  recommendedTrainers: number;
}

export interface DistrictSectorCapacityItem {
  sectorId: string;
  sectorName: string;
  sectorCode: string;
  demandOpenings: number;
  sanctionedSeats: number;
  enrolledSeats: number;
  vacantSeats: number;
  utilizationRate: number;
  activeCoursesCount: number;
  trainersCount: number;
  netDeficit: number; // demand - capacity
}

export interface DistrictTopJobRole {
  roleId: string;
  roleTitle: string;
  sectorName: string;
  openings: number;
  hiringEmployersCount: number;
  avgSalaryINR: number;
  minNsqfLevel: number;
  keySkills: string[];
}

export interface DistrictTrainerProfile {
  id: string;
  name: string;
  instituteId: string;
  instituteName: string;
  specializationSkills: string[];
  certifiedNsqfLevel: number;
  yearsExperience: number;
  rating: number;
}

export interface DistrictCourseSummary {
  id: string;
  code: string;
  title: string;
  instituteName: string;
  sectorName: string;
  durationHours: number;
  annualBatchCapacity: number;
  currentEnrolled: number;
  graduatedLastYear: number;
  healthScore: number;
  coveredSkillNames: string[];
}

export interface DistrictPlacementOutcomes {
  totalPlaced: number;
  totalCandidates: number;
  placementRatePercentage: number;
  medianSalaryINR: number;
  averageSalaryINR: number;
  sixMonthRetentionRate: number;
  employerFeedbackScore: number; // out of 5
  topHiringEmployers: Array<{ name: string; hiresCount: number; sector: string }>;
}

export interface DistrictSkillGapItem {
  skillId: string;
  skillName: string;
  sectorName: string;
  demandOpenings: number;
  candidateSupply: number;
  netDeficit: number;
  urgencyLevel: 'Severe Shortage' | 'Moderate Gap' | 'Equilibrium' | 'Surplus Supply';
  recommendedSeatsToSanction: number;
}

export interface DistrictDetailPlan {
  district: District;
  kpis: {
    totalJobDemandOpenings: number;
    activeJobPostings: number;
    uniqueHiringEmployers: number;
    totalCandidateSupply: number;
    seekingJobCandidates: number;
    inTrainingCandidates: number;
    totalSanctionedCapacity: number;
    totalEnrolledSeats: number;
    totalVacantSeats: number;
    capacityUtilizationRate: number;
    capacityDeficit: number; // demand - capacity
    totalTrainers: number;
    studentToTrainerRatio: number;
    totalCoursesAvailable: number;
    placementRatePercentage: number;
    medianSalaryINR: number;
  };
  topSectors: DistrictSectorCapacityItem[];
  topJobRoles: DistrictTopJobRole[];
  topSkills: DistrictSkillDemandCapacityItem[];
  demandVsCapacityChartData: Array<{
    name: string;
    industryDemand: number;
    trainingCapacity: number;
    capacityGap: number;
  }>;
  institutes: Array<{
    id: string;
    name: string;
    type: string;
    capacitySeats: number;
    accreditation: string;
    coursesCount: number;
    trainersCount: number;
  }>;
  courses: DistrictCourseSummary[];
  trainers: DistrictTrainerProfile[];
  placementOutcomes: DistrictPlacementOutcomes;
  skillGaps: DistrictSkillGapItem[];
  recommendations: DistrictTrainingRecommendation[];
}

export interface DistrictOverviewItem {
  districtId: string;
  districtName: string;
  division: string;
  industrialHubType: string;
  approxWorkforce: number;
  lat: number;
  lng: number;
  totalJobDemandOpenings: number;
  activeJobPostings: number;
  hiringEmployersCount: number;
  candidateSupply: number;
  sanctionedCapacity: number;
  enrolledSeats: number;
  capacityDeficit: number;
  capacityUtilizationRate: number;
  totalTrainers: number;
  studentToTrainerRatio: number;
  coursesAvailableCount: number;
  institutesCount: number;
  placementRatePercentage: number;
  avgSalaryINR: number;
  urgentRecommendationsCount: number;
  topSectorNames: string[];
  topDeficitSkillNames: string[];
  demandPressureIndex: number; // 0-100 score indicating urgent need for training expansion
}

export interface DistrictPlannerOverviewResponse {
  statewideKpis: {
    totalDistricts: number;
    totalJobDemandOpenings: number;
    totalSanctionedCapacity: number;
    totalEnrolledSeats: number;
    totalCapacityDeficit: number;
    totalTrainers: number;
    overallStudentToTrainerRatio: number;
    totalCourses: number;
    averagePlacementRate: number;
    totalRecommendations: number;
    urgentRecommendations: number;
  };
  districts: DistrictOverviewItem[];
}

// ==========================================
// CANDIDATE PORTAL & CAREER MATCH ENGINE
// ==========================================

export interface CandidateCareerMatch {
  jobRoleId: string;
  jobRoleTitle: string;
  sectorId: string;
  sectorName: string;
  matchPercentage: number;
  averageSalaryINR: number;
  openingsCount: number;
  demandLevel: 'High' | 'Very High' | 'Moderate' | 'Surging';
  possessedSkills: {
    id: string;
    name: string;
    code?: string;
  }[];
  missingSkills: {
    id: string;
    name: string;
    code?: string;
    importance: 'critical' | 'preferred';
    openings: number;
  }[];
  recommendedCourses: {
    id: string;
    title: string;
    courseCode: string;
    instituteName: string;
    districtName: string;
    durationHours: number;
    nsqfLevel: number;
    healthScore: number;
    matchingSkillsCovered: string[];
    skillsCount: number;
  }[];
  learningSequence: {
    step: number;
    skillId: string;
    skillName: string;
    type: 'possessed' | 'to_learn' | 'capstone';
    rationale: string;
    recommendedCourseTitle?: string;
    estimatedWeeks: number;
  }[];
  relevantDistricts: {
    districtId: string;
    districtName: string;
    openings: number;
  }[];
}

export interface CandidateSkillGapProfile {
  candidateId: string;
  candidateName: string;
  targetRoleId: string;
  targetRoleTitle: string;
  targetSectorName: string;
  matchScore: number;
  alreadyHave: {
    id: string;
    name: string;
    code?: string;
  }[];
  need: {
    id: string;
    name: string;
    code?: string;
    nsqfLevel: number;
    demandTrend: string;
    importance: 'critical' | 'preferred';
  }[];
  pathwaySequence: {
    stepIndex: number;
    skillId: string;
    skillName: string;
    isPossessed: boolean;
    isCapstone?: boolean;
    stageLabel: string;
    description: string;
    estimatedWeeks: number;
  }[];
  recommendedCourses: {
    courseId: string;
    courseTitle: string;
    courseCode: string;
    instituteName: string;
    districtName: string;
    nsqfLevel: number;
    durationHours: number;
    healthScore: number;
    coveredGapSkills: {
      id: string;
      name: string;
    }[];
    practicalHours: number;
    theoryHours: number;
  }[];
}

// ==========================================
// EMPLOYER PORTAL & SKILL VALIDATION WORKFLOW
// ==========================================

export type SkillImportanceLevel = 'critical' | 'important' | 'nice_to_have';

export interface EmployerSkillValidationInput {
  skillId: string;
  importance: SkillImportanceLevel;
  minProficiency: 'basic' | 'intermediate' | 'advanced';
  yearsExperience: number;
  expectedHiringCount: number;
  notes?: string;
}

export interface EmployerJobSubmissionRequest {
  employerId: string;
  title: string;
  jobRoleId: string;
  sectorId: string;
  districtId: string;
  openings: number;
  minSalaryINR: number;
  maxSalaryINR: number;
  experienceRequiredYears: number;
  educationRequired: string;
  description: string;
  employmentType: 'Full-time' | 'Apprenticeship' | 'Contract';
  isRemoteFriendly: boolean;
  requiredSkills: Array<{
    skillId: string;
    importance: SkillImportanceLevel;
    minProficiency: 'basic' | 'intermediate' | 'advanced';
  }>;
  isSimulatedDemoData?: boolean;
}

export interface EmployerSurveySubmissionRequest {
  employerId: string;
  sectorId: string;
  districtId: string;
  reportedHardToFillSkillIds: string[];
  hiringDifficultyScale: number; // 1-5
  plannedHiringNext6Months: number;
  readinessRating: number; // 1-5
  emergingSkillComments: string;
  skillPriorityFeedback: Array<{
    skillId: string;
    importance: SkillImportanceLevel;
    urgencyTrend: 'surging' | 'stable' | 'declining';
  }>;
}

export interface EmployerDashboardData {
  employer: Employer;
  submittedJobs: Array<Job & { isDirectEmployerPost: boolean }>;
  submittedSurveys: EmployerSurvey[];
  totalOpeningsSubmitted: number;
  topDemandedSkills: Array<{
    skillId: string;
    skillName: string;
    category: string;
    criticalCount: number;
    importantCount: number;
    niceToHaveCount: number;
    totalEmployerOpenings: number;
    marketWideOpenings: number;
    nsqfLevel: number;
    isSimulatedInput: boolean;
  }>;
  marketSkillDemandOverview: Array<{
    skillId: string;
    skillName: string;
    openings: number;
    growth12mPercentage: number;
    urgency: 'high' | 'medium' | 'low';
    employerDirectWeight: number; // Percentage contribution from employer portal
  }>;
  recentValidationAudit: Array<{
    id: string;
    jobTitle: string;
    validatedAt: string;
    skillsCount: number;
    criticalCount: number;
    importantCount: number;
    niceToHaveCount: number;
  }>;
}

// ==========================================
// TRAINING INSTITUTE PORTAL & INDUSTRY ALIGNMENT
// ==========================================

export interface InstituteEquipment {
  id: string;
  instituteId: string;
  name: string;
  category: 'Machinery & CNC' | 'Lab Workstation' | 'Testing & Diagnostics' | 'Computing & Servers' | 'Simulation Kit' | 'Safety & Tooling';
  modelOrMake: string;
  quantity: number;
  operationalStatus: 'Fully Operational' | 'Maintenance Required' | 'Upgraded' | 'Decommissioned';
  acquiredYear: number;
  nsqfAlignmentLevel: number;
  supportedSkillIds: string[];
  associatedCourseIds: string[];
  labRoomNumber?: string;
}

export interface InstituteCourseAlignmentOverview {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  instituteId: string;
  instituteName: string;
  sectorId: string;
  sectorName: string;
  districtId: string;
  districtName: string;
  durationHours: number;
  nsqfLevel: number;
  annualBatchCapacity: number;
  currentEnrolled: number;
  graduatedLastYear: number;
  targetJobRoleId: string;
  targetRoleTitle: string;

  // Alignment KPIs
  alignmentScore: number; // 0 - 100%
  placementRate: number; // calculated from placements or historic
  industryDemand: {
    activeOpenings: number;
    employerCount: number;
    urgencyLevel: 'Surging' | 'High' | 'Moderate' | 'Low';
    averageStartingSalaryINR: number;
  };

  // Skills Breakdown
  skillsCovered: Array<{
    skillId: string;
    skillName: string;
    category: string;
    proficiencyGoal: 'basic' | 'intermediate' | 'advanced';
    theoryHours: number;
    practicalHours: number;
    marketDemandScore: number;
    isMarketCritical: boolean;
  }>;

  missingSkills: Array<{
    skillId: string;
    skillName: string;
    category: string;
    urgency: 'Surging' | 'High' | 'Moderate';
    marketOpenings: number;
    suggestedProficiency: 'basic' | 'intermediate' | 'advanced';
    nsqfLevel: number;
    isEmerging: boolean;
  }>;

  // Recommendations & Curricular Updates
  recommendations: Array<{
    id: string;
    actionType: 'ADD' | 'INCREASE' | 'REDUCE' | 'REMOVE' | 'UPGRADE_LAB';
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    status: 'pending' | 'acknowledged' | 'accepted' | 'in_progress' | 'implemented' | 'rejected';
    skillId?: string;
    skillName: string;
    reason: string;
    detailedExplanation: string;
    suggestedLabHours?: number;
    suggestedModuleTitle?: string;
    implementationNotes?: string;
    acknowledgedAt?: string;
    acknowledgedBy?: string;
  }>;
}

export interface InstitutePortalDashboardData {
  institute: TrainingInstitute;
  courses: Course[];
  trainers: Trainer[];
  equipment: InstituteEquipment[];
  courseAlignments: InstituteCourseAlignmentOverview[];
  placements: Placement[];
  summary: {
    totalCourses: number;
    totalSanctionedCapacity: number;
    totalEnrolled: number;
    overallCapacityUtilization: number;
    averageInstituteAlignment: number;
    averagePlacementRate: number;
    totalTrainers: number;
    totalEquipmentCount: number;
    pendingRecommendationsCount: number;
    acknowledgedRecommendationsCount: number;
  };
}

export interface CreateCourseRequest {
  instituteId: string;
  code: string;
  title: string;
  districtId: string;
  sectorId: string;
  nsqfLevel: number;
  durationHours: number;
  annualBatchCapacity: number;
  feeStructureINR: number;
  certificationBody: string;
  targetJobRoleId: string;
  coveredSkills: Array<{
    skillId: string;
    proficiencyGoal: 'basic' | 'intermediate' | 'advanced';
    practicalHours: number;
    theoryHours: number;
  }>;
  curriculumModules: Array<{
    moduleNumber: number;
    title: string;
    description: string;
    durationHours: number;
    skillIds: string[];
    isOutdated: boolean;
    suggestedRevision?: string;
  }>;
}

// ==========================================
// PLACEMENT OUTCOME ANALYTICS INTERFACES
// ==========================================

export interface PlacementOutcomeRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateEducation: string;
  courseId: string;
  courseTitle: string;
  courseCode: string;
  jobRoleId: string;
  jobRoleTitle: string;
  instituteId: string;
  instituteName: string;
  employerId: string;
  employerName: string;
  districtId: string;
  districtName: string;
  sectorId: string;
  sectorName: string;
  placementStatus: 'Placed' | 'Pending Offer' | 'In Training' | 'Seeking';
  salaryINR: number;
  placementDate: string;
  daysToPlacement: number;
  retentionMonths6: boolean;
  employerFeedbackScore: number; // 1 to 5
  topSkillsAcquired: string[];
}

export interface PlacementByCourseItem {
  courseId: string;
  courseTitle: string;
  courseCode: string;
  sectorName: string;
  instituteName: string;
  totalGraduates: number;
  placedCount: number;
  placementRate: number; // percentage 0-100
  avgSalaryINR: number;
  medianSalaryINR: number;
  avgDaysToPlacement: number;
  alignmentScore: number;
}

export interface PlacementByDistrictItem {
  districtId: string;
  districtName: string;
  division: string;
  totalCandidates: number;
  placedCount: number;
  placementRate: number;
  avgSalaryINR: number;
  topSectorName: string;
  activeHiringEmployersCount: number;
}

export interface PlacementBySectorItem {
  sectorId: string;
  sectorName: string;
  placedCount: number;
  totalCandidates: number;
  placementRate: number;
  avgSalaryINR: number;
  avgDaysToPlacement: number;
  topJobRoleTitle: string;
}

export interface PlacementBySkillItem {
  skillId: string;
  skillName: string;
  sectorName: string;
  placedCandidatesCount: number;
  avgSalaryINR: number;
  demandUrgency: string;
  alignmentImpact: 'High Driver' | 'Moderate Driver' | 'Emerging Catalyst';
}

export interface PlacementOutcomeAnalyticsResponse {
  summary: {
    totalGraduatesTracked: number;
    totalPlaced: number;
    overallPlacementRate: number; // percentage
    averageSalaryINR: number;
    medianSalaryINR: number;
    highestSalaryINR: number;
    averageDaysToPlacement: number;
    retentionRate6Months: number; // percentage
    employerSatisfactionAvg: number; // 1-5
  };
  filters: {
    districtId?: string;
    sectorId?: string;
    courseId?: string;
    employerId?: string;
    timeRange?: string;
  };
  placements: PlacementOutcomeRecord[];
  placementByCourse: PlacementByCourseItem[];
  placementByDistrict: PlacementByDistrictItem[];
  placementBySector: PlacementBySectorItem[];
  placementBySkill: PlacementBySkillItem[];
  timeToPlacementDistribution: Array<{
    bracket: string; // e.g., '< 30 days', '31-60 days', '61-90 days', '90+ days'
    count: number;
    percentage: number;
    avgSalaryINR: number;
  }>;
  salaryDistribution: Array<{
    bracket: string; // e.g., '< ₹3L', '₹3L - ₹5L', '₹5L - ₹7L', '> ₹7L'
    count: number;
    percentage: number;
  }>;
  curriculumAlignmentInsights: Array<{
    courseId: string;
    courseTitle: string;
    placementRate: number;
    alignmentScore: number;
    diagnosis: string;
    recommendationAction: string;
  }>;
}

// ==========================================
// AI INSIGHTS ASSISTANT TYPES
// ==========================================

export interface AIAssistantSource {
  title: string;
  detail: string;
  category: 'market' | 'course' | 'district' | 'employer' | 'curriculum';
  badge?: string;
}

export interface AIAssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: AIAssistantSource[];
  suggestedFollowUps?: string[];
  isThinking?: boolean;
  dataContextUsed?: string;
  model?: string;
  isError?: boolean;
}

export interface AIAssistantSuggestionCategory {
  category: string;
  iconName: string;
  questions: string[];
}

export interface AIAssistantQueryRequest {
  question: string;
  contextDistrictId?: string;
  contextCourseId?: string;
  contextSectorId?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; text: string }>;
}

export interface AIAssistantQueryResponse {
  answer: string;
  sources: AIAssistantSource[];
  suggestedFollowUps: string[];
  dataContextUsed: string;
  model: string;
}








