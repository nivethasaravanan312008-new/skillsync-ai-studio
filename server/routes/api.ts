/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { dbStore } from '../db/database.ts';
import { analyticsService } from '../services/analyticsService.ts';
import { skillExtractionService } from '../services/skillExtractionService.ts';
import { curriculumRecommendationService } from '../services/curriculumRecommendationService.ts';
import { courseHealthService } from '../services/courseHealthService.ts';
import { districtPlannerService } from '../services/districtPlannerService.ts';
import { careerMatchService } from '../services/careerMatchService.ts';
import { employerPortalService } from '../services/employerPortalService.ts';
import { instituteService } from '../services/instituteService.ts';
import { placementService } from '../services/placementService.ts';
import { aiAssistantService } from '../services/aiAssistantService.ts';

export const apiRouter = Router();

// Health & System Metadata
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

apiRouter.get('/meta', (req, res) => {
  res.json(dbStore.getMetadata());
});

apiRouter.get('/summary', (req, res) => {
  res.json(analyticsService.getExecutiveSummary());
});

apiRouter.post('/reset', (req, res) => {
  const db = dbStore.resetToSeed();
  res.json({ success: true, message: 'Database reset to benchmark simulated seed data', metadata: db.datasetMetadata });
});

// Verification Endpoint checking all hackathon requirements
apiRouter.get('/verify', (req, res) => {
  const db = dbStore.getFullDb();
  const summary = analyticsService.getExecutiveSummary();

  const checks = {
    jobPostings: { target: 1000, actual: db.jobs.length, passed: db.jobs.length >= 1000 },
    skills: { target: 50, actual: db.skills.length, passed: db.skills.length >= 50 },
    jobRoles: { target: 30, actual: db.jobRoles.length, passed: db.jobRoles.length >= 30 },
    districts: { target: 10, actual: db.districts.length, passed: db.districts.length >= 10 },
    sectors: { target: 8, actual: db.sectors.length, passed: db.sectors.length >= 8 },
    courses: { target: 20, actual: db.courses.length, passed: db.courses.length >= 20 },
    employers: { target: 50, actual: db.employers.length, passed: db.employers.length >= 50 },
    candidates: { target: 100, actual: db.candidates.length, passed: db.candidates.length >= 100 },
    placementsPresent: { actual: db.placements.length, passed: db.placements.length > 0 },
    surveysPresent: { actual: db.employerSurveys.length, passed: db.employerSurveys.length > 0 },
    capacityRecordsPresent: { actual: db.trainingCapacity.length, passed: db.trainingCapacity.length > 0 },
    simulatedDataDisclaimer: { passed: !!db.datasetMetadata.disclaimer && db.datasetMetadata.type === 'Demo / Simulated Data' }
  };

  const allPassed = Object.values(checks).every(c => c.passed);

  res.json({
    status: allPassed ? 'verified' : 'incomplete',
    allPassed,
    checks,
    summary,
    sampleDistricts: db.districts.map(d => d.name),
    sampleSectors: db.sectors.map(s => s.name)
  });
});

// Districts & Sectors
apiRouter.get('/districts', (req, res) => {
  res.json(dbStore.getDistricts());
});

apiRouter.get('/sectors', (req, res) => {
  res.json(dbStore.getSectors());
});

// Skills & Taxonomy
apiRouter.get('/skills', (req, res) => {
  const { categoryId, sectorId, isEmerging, search } = req.query;
  const skills = dbStore.getSkills({
    categoryId: categoryId as string,
    sectorId: sectorId as string,
    isEmerging: isEmerging !== undefined ? isEmerging === 'true' : undefined,
    search: search as string
  });
  res.json(skills);
});

apiRouter.get('/skills/:id', (req, res) => {
  const skill = dbStore.getSkillById(req.params.id);
  if (!skill) return res.status(404).json({ error: 'Skill not found' });
  res.json(skill);
});

apiRouter.get('/job-roles', (req, res) => {
  const { sectorId } = req.query;
  res.json(dbStore.getJobRoles(sectorId as string));
});

// Employers & Surveys
apiRouter.get('/employers', (req, res) => {
  const { districtId, sectorId } = req.query;
  res.json(dbStore.getEmployers(districtId as string, sectorId as string));
});

apiRouter.get('/employers/:id', (req, res) => {
  const employer = dbStore.getEmployerById(req.params.id);
  if (!employer) return res.status(404).json({ error: 'Employer not found' });
  res.json(employer);
});

apiRouter.post('/employers', (req, res) => {
  try {
    const newEmployer = dbStore.createEmployer(req.body);
    res.status(201).json(newEmployer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/employers/:id', (req, res) => {
  try {
    const updated = dbStore.updateEmployer(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Employer not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/employer-portal/:id/dashboard', (req, res) => {
  try {
    const dashboardData = employerPortalService.getEmployerDashboard(req.params.id);
    if (!dashboardData) return res.status(404).json({ error: 'Employer not found' });
    res.json(dashboardData);
  } catch (err: any) {
    console.error('[API] Employer Dashboard Error:', err);
    res.status(500).json({ error: 'Failed to generate employer dashboard', details: err?.message });
  }
});

apiRouter.post('/employer-portal/jobs', (req, res) => {
  try {
    const job = employerPortalService.submitJobRequirement(req.body);
    res.status(201).json(job);
  } catch (err: any) {
    console.error('[API] Employer Submit Job Error:', err);
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/employer-portal/surveys', (req, res) => {
  try {
    const survey = employerPortalService.submitDemandSurvey(req.body);
    res.status(201).json(survey);
  } catch (err: any) {
    console.error('[API] Employer Submit Survey Error:', err);
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/surveys', (req, res) => {
  const { districtId, sectorId } = req.query;
  res.json(dbStore.getEmployerSurveys(districtId as string, sectorId as string));
});

apiRouter.post('/surveys', (req, res) => {
  try {
    const survey = dbStore.createEmployerSurvey(req.body);
    res.status(201).json(survey);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Jobs
apiRouter.get('/jobs', (req, res) => {
  const { districtId, sectorId, jobRoleId, employerId, status, minSalary, search, limit, offset } = req.query;
  const result = dbStore.getJobs({
    districtId: districtId as string,
    sectorId: sectorId as string,
    jobRoleId: jobRoleId as string,
    employerId: employerId as string,
    status: status as string,
    minSalary: minSalary ? Number(minSalary) : undefined,
    search: search as string,
    limit: limit ? Number(limit) : 50,
    offset: offset ? Number(offset) : 0
  });
  res.json(result);
});

apiRouter.get('/jobs/:id', (req, res) => {
  const job = dbStore.getJobById(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

apiRouter.post('/jobs', (req, res) => {
  try {
    const job = dbStore.createJob(req.body);
    res.status(201).json(job);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Institutes & Courses
apiRouter.get('/institutes', (req, res) => {
  const { districtId } = req.query;
  res.json(dbStore.getInstitutes(districtId as string));
});

apiRouter.get('/institutes/:id', (req, res) => {
  const inst = dbStore.getInstituteById(req.params.id);
  if (!inst) return res.status(404).json({ error: 'Institute not found' });
  res.json(inst);
});

apiRouter.post('/institutes', (req, res) => {
  try {
    const inst = dbStore.createInstitute(req.body);
    res.status(201).json(inst);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/institutes/:id', (req, res) => {
  try {
    const updated = instituteService.updateInstituteProfile(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Training Institute Portal Aggregated Dashboard & Alignment
apiRouter.get('/institutes/:id/dashboard', (req, res) => {
  try {
    const data = instituteService.getInstituteDashboardData(req.params.id);
    res.json(data);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// Add Trainer to Institute
apiRouter.get('/institutes/:id/trainers', (req, res) => {
  res.json(dbStore.getTrainers(req.params.id));
});

apiRouter.post('/institutes/:id/trainers', (req, res) => {
  try {
    const trainer = instituteService.addTrainer({
      ...req.body,
      instituteId: req.params.id
    });
    res.status(201).json(trainer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Add Equipment / Resources to Institute
apiRouter.get('/institutes/:id/equipment', (req, res) => {
  res.json(dbStore.getEquipment(req.params.id));
});

apiRouter.post('/institutes/:id/equipment', (req, res) => {
  try {
    const eq = instituteService.addEquipment({
      ...req.body,
      instituteId: req.params.id
    });
    res.status(201).json(eq);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/equipment/:id', (req, res) => {
  try {
    const updated = dbStore.updateEquipment(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Equipment not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Create Course with modules and skills
apiRouter.post('/courses', (req, res) => {
  try {
    const course = instituteService.createCourseWithCurriculum(req.body);
    res.status(201).json(course);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Acknowledge Curriculum Recommendation with notes
apiRouter.post('/institutes/recommendations/:id/acknowledge', (req, res) => {
  try {
    const { status, notes, acknowledgedBy } = req.body;
    const result = instituteService.acknowledgeRecommendation(
      req.params.id,
      status || 'acknowledged',
      notes || '',
      acknowledgedBy
    );
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/courses', (req, res) => {
  const { districtId, sectorId, instituteId, minHealth } = req.query;
  res.json(dbStore.getCourses({
    districtId: districtId as string,
    sectorId: sectorId as string,
    instituteId: instituteId as string,
    minHealth: minHealth ? Number(minHealth) : undefined
  }));
});

apiRouter.get('/courses/:id', (req, res) => {
  const course = dbStore.getCourseById(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json(course);
});

apiRouter.put('/courses/:id/modules', (req, res) => {
  const { modules, healthScore } = req.body;
  const updated = dbStore.updateCourseModules(req.params.id, modules, healthScore);
  if (!updated) return res.status(404).json({ error: 'Course not found' });
  res.json(updated);
});

// Candidates & Pathways
apiRouter.get('/candidates', (req, res) => {
  const { districtId, sectorId, status, search } = req.query;
  res.json(dbStore.getCandidates({
    districtId: districtId as string,
    sectorId: sectorId as string,
    status: status as string,
    search: search as string
  }));
});

apiRouter.get('/candidates/:id', (req, res) => {
  const candidate = dbStore.getCandidateById(req.params.id);
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
  res.json(candidate);
});

apiRouter.put('/candidates/:id', (req, res) => {
  const updated = dbStore.updateCandidate(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Candidate not found' });
  res.json(updated);
});

apiRouter.post('/candidates', (req, res) => {
  try {
    const candidate = dbStore.createCandidate(req.body);
    res.status(201).json(candidate);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/candidates/:id/pathway', (req, res) => {
  const pathway = analyticsService.getCandidateLearningPath(req.params.id);
  if (!pathway) return res.status(404).json({ error: 'Could not generate learning path' });
  res.json(pathway);
});

// Candidate Portal & Career Match Engine Endpoints
apiRouter.get('/candidates/:id/career-matches', (req, res) => {
  try {
    const matches = careerMatchService.matchCandidateToCareers(req.params.id);
    res.json(matches);
  } catch (err: any) {
    console.error('[API] Career Matches Error:', err);
    res.status(500).json({ error: 'Failed to calculate career matches', details: err?.message });
  }
});

apiRouter.post('/candidates/match-ad-hoc', (req, res) => {
  try {
    const matches = careerMatchService.matchCandidateToCareers(req.body);
    res.json(matches);
  } catch (err: any) {
    console.error('[API] Ad-Hoc Career Matches Error:', err);
    res.status(500).json({ error: 'Failed to calculate career matches', details: err?.message });
  }
});

apiRouter.get('/candidates/:id/skill-gap', (req, res) => {
  try {
    const { targetRoleId } = req.query;
    const gapProfile = careerMatchService.getCandidateSkillGapProfile(req.params.id, targetRoleId as string);
    if (!gapProfile) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json(gapProfile);
  } catch (err: any) {
    console.error('[API] Candidate Skill Gap Error:', err);
    res.status(500).json({ error: 'Failed to get candidate skill gap profile', details: err?.message });
  }
});

apiRouter.get('/candidates/:id/recommended-courses', (req, res) => {
  try {
    const result = careerMatchService.getCandidateRecommendedCourses(req.params.id);
    if (!result.candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json(result);
  } catch (err: any) {
    console.error('[API] Candidate Recommended Courses Error:', err);
    res.status(500).json({ error: 'Failed to get recommended courses', details: err?.message });
  }
});

// Placements & Capacity
apiRouter.get('/placements', (req, res) => {
  const { districtId, sectorId } = req.query;
  res.json(dbStore.getPlacements(districtId as string, sectorId as string));
});

// Comprehensive Administrator Placement Outcome Analytics
apiRouter.get('/analytics/placements', (req, res) => {
  try {
    const { districtId, sectorId, courseId, employerId } = req.query;
    const analytics = placementService.getPlacementAnalytics({
      districtId: districtId as string,
      sectorId: sectorId as string,
      courseId: courseId as string,
      employerId: employerId as string
    });
    res.json(analytics);
  } catch (err: any) {
    console.error('[API] Placement Analytics Error:', err);
    res.status(500).json({ error: 'Failed to calculate placement analytics', details: err?.message });
  }
});

apiRouter.get('/capacity', (req, res) => {
  const { districtId, sectorId } = req.query;
  res.json(dbStore.getTrainingCapacity(districtId as string, sectorId as string));
});

apiRouter.put('/capacity/:id', (req, res) => {
  const { additionalSeats } = req.body;
  const updated = dbStore.updateCapacitySeats(req.params.id, Number(additionalSeats));
  if (!updated) return res.status(404).json({ error: 'Capacity record not found' });
  res.json(updated);
});

// Dynamic Analytics Endpoints
apiRouter.get('/analytics/dashboard', (req, res) => {
  const { dateRange, districtId, sectorId, jobRoleId, skillId } = req.query;
  const filters = {
    dateRange: (dateRange as any) || 'all',
    districtId: (districtId as string) || 'all',
    sectorId: (sectorId as string) || 'all',
    jobRoleId: (jobRoleId as string) || 'all',
    skillId: (skillId as string) || 'all'
  };
  const metrics = analyticsService.getDashboardMetrics(filters);
  res.json(metrics);
});

apiRouter.post('/ai/insights', async (req, res) => {
  const { filters } = req.body;
  const activeFilters = filters || {
    dateRange: 'all',
    districtId: 'all',
    sectorId: 'all',
    jobRoleId: 'all',
    skillId: 'all'
  };

  const metrics = analyticsService.getDashboardMetrics(activeFilters);

  // Check if GEMINI_API_KEY is available for enhanced generative synthesis
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({});
      const prompt = `You are the AI Chief Labour Economist for the SkillSync Intelligence Platform in Maharashtra.
Analyze the following live labour market data and return 4-5 high-impact, actionable policy and curriculum insights in JSON format.

Active Filters: ${JSON.stringify(activeFilters)}
Market Summary:
- Jobs Analyzed: ${metrics.kpis.jobsAnalyzed} (${metrics.kpis.totalOpenings} Total Openings)
- Skills Tracked: ${metrics.kpis.skillsTracked}
- Employers: ${metrics.kpis.employersCount}
- Top Demanded Skills: ${metrics.charts.topSkillsByDemand.slice(0, 4).map(s => `${s.skillName} (${s.openings} openings, ₹${(s.avgSalary/100000).toFixed(1)} LPA)`).join(', ')}
- Top Job Roles: ${metrics.charts.topJobRoles.slice(0, 4).map(r => `${r.title} in ${r.sectorName}`).join(', ')}
- Top Emerging Skills: ${metrics.charts.emergingSkills.slice(0, 3).map(s => s.name).join(', ')}
- Course Health Breakdown: ${metrics.charts.courseAlignmentDistribution.highAlignmentCount} High, ${metrics.charts.courseAlignmentDistribution.moderateAlignmentCount} Moderate, ${metrics.charts.courseAlignmentDistribution.criticalOutdatedCount} Outdated (Avg: ${metrics.charts.courseAlignmentDistribution.averageHealthScore}%)
- Placement Rate: ${metrics.kpis.placementRate}%, Median Salary: ₹${metrics.charts.placementOutcomes.medianSalaryINR}/yr

Return ONLY a JSON array of objects with the exact schema:
[
  {
    "id": "ins-1",
    "type": "trend" | "gap_alert" | "curriculum_warning" | "policy_recommendation",
    "title": "Concise headline (under 8 words)",
    "description": "2 sentence clear actionable description grounded in the numbers above.",
    "metricHighlight": "Short quantitative pill (e.g., '+42% Surge' or '1,200 Deficit')",
    "severity": "info" | "warning" | "critical" | "success"
  }
]`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (aiResponse.text) {
        const parsed = JSON.parse(aiResponse.text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return res.json({ insights: parsed, source: 'gemini-3.8-flash' });
        }
      }
    } catch (aiErr) {
      console.warn('[AI Insights] Gemini generation fallback to deterministic synthesis:', aiErr);
    }
  }

  // Fallback to real-time deterministic insights derived from actual underlying data
  res.json({
    insights: metrics.aiInsights,
    source: 'deterministic-analytical-engine'
  });
});

// ==========================================
// AI INSIGHTS ASSISTANT ROUTES
// ==========================================

apiRouter.post('/ai/assistant/chat', async (req, res) => {
  try {
    const response = await aiAssistantService.answerQuestion(req.body);
    res.json(response);
  } catch (err: any) {
    console.error('[AIAssistant] Error answering question:', err);
    res.status(500).json({ error: err.message || 'Failed to generate assistant response' });
  }
});

apiRouter.get('/ai/assistant/suggestions', (req, res) => {
  try {
    const suggestions = aiAssistantService.getSuggestions();
    res.json(suggestions);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch suggestions' });
  }
});


apiRouter.get('/analytics/demand', (req, res) => {
  const { districtId, sectorId } = req.query;
  res.json(analyticsService.getSkillDemand(districtId as string, sectorId as string));
});

// Dedicated Industry Demand Intelligence
apiRouter.get('/analytics/industry-demand', (req, res) => {
  const { districtId, sectorId, jobRoleId, skillId, experienceLevel, dateRange } = req.query;
  const filters = {
    districtId: (districtId as string) || 'all',
    sectorId: (sectorId as string) || 'all',
    jobRoleId: (jobRoleId as string) || 'all',
    skillId: (skillId as string) || 'all',
    experienceLevel: (experienceLevel as any) || 'all',
    dateRange: (dateRange as any) || 'all'
  };
  const results = analyticsService.getIndustryDemandIntelligence(filters);
  res.json(results);
});

// Detailed Skill Intelligence Profile
apiRouter.get('/analytics/skills/:id/intelligence', (req, res) => {
  const intelligence = analyticsService.getSkillIntelligence(req.params.id);
  if (!intelligence) {
    return res.status(404).json({ error: 'Skill not found or no intelligence data available' });
  }
  res.json(intelligence);
});

apiRouter.get('/analytics/gaps', (req, res) => {
  const { districtId, sectorId } = req.query;
  res.json(analyticsService.getSkillGaps(districtId as string, sectorId as string));
});

// Dedicated Visual Skill Gap Matrix with Dynamic Filters
apiRouter.get('/analytics/skill-gap-matrix', (req, res) => {
  const { courseId, districtId, sectorId, skillId, jobRoleId } = req.query;
  const filters = {
    courseId: (courseId as string) || 'all',
    districtId: (districtId as string) || 'all',
    sectorId: (sectorId as string) || 'all',
    skillId: (skillId as string) || 'all',
    jobRoleId: (jobRoleId as string) || 'all'
  };
  const matrix = analyticsService.getSkillGapMatrix(filters);
  res.json(matrix);
});

// Detailed Course Alignment Report & Recommendations
apiRouter.get('/analytics/course-alignment/:id', (req, res) => {
  const report = analyticsService.getDetailedCourseAlignment(req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Course not found or could not generate alignment report' });
  }
  res.json(report);
});

apiRouter.get('/analytics/recommendations', (req, res) => {
  const { courseId } = req.query;
  res.json(analyticsService.getCurriculumRecommendations(courseId as string));
});

// Dedicated Curriculum Recommendation Engine Endpoints
apiRouter.get('/recommendations', (req, res) => {
  try {
    const { courseId, sectorId, districtId, actionType, status, priority, searchQuery } = req.query;
    const filters = {
      courseId: courseId as string,
      sectorId: sectorId as string,
      districtId: districtId as string,
      actionType: actionType as any,
      status: status as any,
      priority: priority as any,
      searchQuery: searchQuery as string
    };
    const result = curriculumRecommendationService.getOverview(filters);
    res.json(result);
  } catch (err: any) {
    console.error('[API] Recommendations Overview Error:', err);
    res.status(500).json({ error: 'Failed to fetch curriculum recommendations', details: err?.message });
  }
});

apiRouter.post('/recommendations/:id/status', (req, res) => {
  try {
    const { status, note, performedBy } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Missing status in request body' });
    }
    const updated = curriculumRecommendationService.updateStatus(req.params.id, status, note, performedBy);
    res.json(updated);
  } catch (err: any) {
    console.error('[API] Update Recommendation Status Error:', err);
    res.status(500).json({ error: 'Failed to update recommendation status', details: err?.message });
  }
});

apiRouter.post('/recommendations/:id/note', (req, res) => {
  try {
    const { note, performedBy } = req.body;
    if (!note) {
      return res.status(400).json({ error: 'Missing note in request body' });
    }
    const updated = curriculumRecommendationService.addNote(req.params.id, note, performedBy);
    res.json(updated);
  } catch (err: any) {
    console.error('[API] Add Recommendation Note Error:', err);
    res.status(500).json({ error: 'Failed to add recommendation note', details: err?.message });
  }
});

apiRouter.post('/recommendations/batch-action', (req, res) => {
  try {
    const { recommendationIds, status, note, performedBy } = req.body;
    if (!recommendationIds || !Array.isArray(recommendationIds) || !status) {
      return res.status(400).json({ error: 'Invalid batch action parameters' });
    }
    const result = curriculumRecommendationService.batchUpdateStatus(recommendationIds, status, note, performedBy);
    res.json(result);
  } catch (err: any) {
    console.error('[API] Batch Action Error:', err);
    res.status(500).json({ error: 'Failed to perform batch action', details: err?.message });
  }
});

apiRouter.post('/recommendations/regenerate', (req, res) => {
  try {
    const recs = curriculumRecommendationService.generateAllRecommendations(true);
    res.json({ message: 'Curriculum recommendations regenerated successfully', count: recs.length });
  } catch (err: any) {
    console.error('[API] Regenerate Recommendations Error:', err);
    res.status(500).json({ error: 'Failed to regenerate recommendations', details: err?.message });
  }
});

// Users (Personas)
apiRouter.get('/users', (req, res) => {
  res.json(dbStore.getUsers());
});

// ==========================================
// JOB DATA INGESTION & SKILL EXTRACTION APIS
// ==========================================

// 1. Ingestion Templates (for quick demo testing)
apiRouter.get('/ingestion/templates', (req, res) => {
  res.json(skillExtractionService.getSampleCSVTemplates());
});

// 2. Ingestion Audit History
apiRouter.get('/ingestion/history', (req, res) => {
  res.json(dbStore.getIngestionHistory());
});

// 3. Preview & Validation of CSV
apiRouter.post('/ingestion/preview', (req, res) => {
  try {
    const { csvContent, fileName } = req.body;
    if (!csvContent || typeof csvContent !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid csvContent in request body' });
    }
    const preview = skillExtractionService.validateAndPreview(csvContent, fileName || 'job_postings.csv');
    res.json(preview);
  } catch (err: any) {
    console.error('[API] CSV Preview Error:', err);
    res.status(500).json({ error: 'Failed to parse and validate CSV', details: err?.message });
  }
});

// 4. Ingestion Execution
apiRouter.post('/ingestion/execute', (req, res) => {
  try {
    const { fileName, rows, skipInvalidRows = true, createMissingEmployers = true } = req.body;
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'Missing or empty rows array in execution request' });
    }
    const result = skillExtractionService.executeIngestion({
      fileName: fileName || 'uploaded_jobs.csv',
      rows,
      skipInvalidRows: Boolean(skipInvalidRows),
      createMissingEmployers: Boolean(createMissingEmployers)
    });
    res.json(result);
  } catch (err: any) {
    console.error('[API] Ingestion Execution Error:', err);
    res.status(500).json({ error: 'Failed to execute job ingestion batch', details: err?.message });
  }
});

// 5. Standalone Skill Extraction & Normalization Playground
apiRouter.post('/skills/extract-text', (req, res) => {
  try {
    const { text, skillsInput } = req.body;
    const result = skillExtractionService.extractAndNormalizeSkills(skillsInput, text);
    res.json(result);
  } catch (err: any) {
    console.error('[API] Skill Extraction Error:', err);
    res.status(500).json({ error: 'Failed to extract skills', details: err?.message });
  }
});

// ==========================================
// 6. COURSE HEALTH MONITOR ENDPOINTS
// ==========================================

// Overview & List of Course Health Profiles with filtering & mismatch alerts
apiRouter.get('/course-health', (req, res) => {
  try {
    const { sectorId, districtId, status, hasAlert, searchQuery, sortBy, sortOrder } = req.query;
    const overview = courseHealthService.getAllCourseHealthProfiles({
      sectorId: sectorId as string,
      districtId: districtId as string,
      status: status as any,
      hasAlert: hasAlert === 'true',
      searchQuery: searchQuery as string,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any
    });
    res.json(overview);
  } catch (err: any) {
    console.error('[API] Course Health Error:', err);
    res.status(500).json({ error: 'Failed to compute course health profiles', details: err?.message });
  }
});

// Standalone endpoint for all supply-demand mismatch alerts
apiRouter.get('/course-health-alerts', (req, res) => {
  try {
    const overview = courseHealthService.getAllCourseHealthProfiles();
    res.json({
      totalAlerts: overview.mismatchAlerts.length,
      alerts: overview.mismatchAlerts
    });
  } catch (err: any) {
    console.error('[API] Course Health Alerts Error:', err);
    res.status(500).json({ error: 'Failed to get course health alerts', details: err?.message });
  }
});

// Detailed Course Health Profile for a single course
apiRouter.get('/course-health/:id', (req, res) => {
  try {
    const profile = courseHealthService.getCourseHealthDetail(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Course health profile not found' });
    }
    res.json(profile);
  } catch (err: any) {
    console.error('[API] Course Health Detail Error:', err);
    res.status(500).json({ error: 'Failed to get course health detail', details: err?.message });
  }
});

// ==========================================
// 7. DISTRICT TRAINING PLANNER ENDPOINTS
// ==========================================

// Statewide District Planner Overview
apiRouter.get('/district-planner/overview', (req, res) => {
  try {
    const overview = districtPlannerService.getDistrictsOverview();
    res.json(overview);
  } catch (err: any) {
    console.error('[API] District Planner Overview Error:', err);
    res.status(500).json({ error: 'Failed to get district planner overview', details: err?.message });
  }
});

// Single District Training Plan Detail
apiRouter.get('/district-planner/:districtId', (req, res) => {
  try {
    const detail = districtPlannerService.getDistrictDetail(req.params.districtId);
    if (!detail) {
      return res.status(404).json({ error: 'District not found or no training plan available' });
    }
    res.json(detail);
  } catch (err: any) {
    console.error('[API] District Detail Plan Error:', err);
    res.status(500).json({ error: 'Failed to get district detail plan', details: err?.message });
  }
});



