/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { dbStore } from '../db/database.ts';
import {
  Employer,
  Job,
  EmployerSurvey,
  EmployerDashboardData,
  EmployerJobSubmissionRequest,
  EmployerSurveySubmissionRequest,
  JobSkillRequirement
} from '../../src/types/dataModel.ts';

export class EmployerPortalService {
  /**
   * Retrieves or constructs full dashboard data for a specific employer
   */
  public getEmployerDashboard(employerId: string): EmployerDashboardData | null {
    const db = dbStore.getFullDb();
    const employer = db.employers.find(e => e.id === employerId);
    if (!employer) return null;

    // Jobs posted by this employer
    const employerJobs = db.jobs.filter(j => j.employerId === employerId).map(j => ({
      ...j,
      isDirectEmployerPost: j.source === 'Direct Employer Post'
    }));

    // Surveys submitted by this employer
    const employerSurveys = db.employerSurveys.filter(s => s.employerId === employerId);

    // Total openings submitted by this employer
    const totalOpeningsSubmitted = employerJobs.reduce((sum, j) => sum + j.openings, 0);

    // Aggregate skill breakdown from this employer's job postings and surveys
    const skillStats = new Map<string, {
      criticalCount: number;
      importantCount: number;
      niceToHaveCount: number;
      totalEmployerOpenings: number;
      isSimulatedInput: boolean;
    }>();

    employerJobs.forEach(job => {
      const isSimulated = job.source !== 'Direct Employer Post';
      job.requiredSkills.forEach(req => {
        const curr = skillStats.get(req.skillId) || {
          criticalCount: 0,
          importantCount: 0,
          niceToHaveCount: 0,
          totalEmployerOpenings: 0,
          isSimulatedInput: isSimulated
        };

        if (req.importance === 'critical') curr.criticalCount += 1;
        else if (req.importance === 'preferred') curr.importantCount += 1;
        else curr.niceToHaveCount += 1;

        curr.totalEmployerOpenings += job.openings;
        if (!isSimulated) curr.isSimulatedInput = false;

        skillStats.set(req.skillId, curr);
      });
    });

    // Market-wide skill openings map to compare employer vs statewide
    const marketSkillOpenings = new Map<string, number>();
    db.jobs.filter(j => j.status === 'active').forEach(j => {
      j.requiredSkills.forEach(rs => {
        marketSkillOpenings.set(rs.skillId, (marketSkillOpenings.get(rs.skillId) || 0) + j.openings);
      });
    });

    const topDemandedSkills: EmployerDashboardData['topDemandedSkills'] = [];
    skillStats.forEach((stats, skillId) => {
      const skill = db.skills.find(s => s.id === skillId);
      const category = db.skillCategories.find(c => c.id === skill?.categoryId);
      if (skill) {
        topDemandedSkills.push({
          skillId,
          skillName: skill.name,
          category: category?.name || 'Technical',
          criticalCount: stats.criticalCount,
          importantCount: stats.importantCount,
          niceToHaveCount: stats.niceToHaveCount,
          totalEmployerOpenings: stats.totalEmployerOpenings,
          marketWideOpenings: marketSkillOpenings.get(skillId) || stats.totalEmployerOpenings,
          nsqfLevel: skill.nsqfLevel,
          isSimulatedInput: stats.isSimulatedInput
        });
      }
    });

    topDemandedSkills.sort((a, b) => b.totalEmployerOpenings - a.totalEmployerOpenings || b.criticalCount - a.criticalCount);

    // Market skill demand overview in employer's sector
    const sectorJobs = db.jobs.filter(j => j.sectorId === employer.sectorId && j.status === 'active');
    const sectorSkillMap = new Map<string, { openings: number; directCount: number }>();

    sectorJobs.forEach(job => {
      const isDirect = job.source === 'Direct Employer Post';
      job.requiredSkills.forEach(req => {
        const prev = sectorSkillMap.get(req.skillId) || { openings: 0, directCount: 0 };
        prev.openings += job.openings;
        if (isDirect) prev.directCount += job.openings;
        sectorSkillMap.set(req.skillId, prev);
      });
    });

    const marketSkillDemandOverview: EmployerDashboardData['marketSkillDemandOverview'] = [];
    sectorSkillMap.forEach((val, skillId) => {
      const skill = db.skills.find(s => s.id === skillId);
      if (skill) {
        const directRatio = val.openings > 0 ? Math.round((val.directCount / val.openings) * 100) : 0;
        marketSkillDemandOverview.push({
          skillId,
          skillName: skill.name,
          openings: val.openings,
          growth12mPercentage: skill.isEmerging ? 45 : (skill.demandTrend === 'surging' ? 30 : 14),
          urgency: val.openings > 80 || skill.isEmerging ? 'high' : (val.openings > 35 ? 'medium' : 'low'),
          employerDirectWeight: directRatio
        });
      }
    });

    marketSkillDemandOverview.sort((a, b) => b.openings - a.openings);

    // Recent validation audit list
    const recentValidationAudit = employerJobs.slice(0, 8).map(j => {
      const critical = j.requiredSkills.filter(s => s.importance === 'critical').length;
      const important = j.requiredSkills.filter(s => s.importance === 'preferred').length;
      const nice = j.requiredSkills.filter(s => s.importance === 'optional').length;
      return {
        id: j.id,
        jobTitle: j.title,
        validatedAt: j.postedDate,
        skillsCount: j.requiredSkills.length,
        criticalCount: critical,
        importantCount: important,
        niceToHaveCount: nice
      };
    });

    return {
      employer,
      submittedJobs: employerJobs,
      submittedSurveys: employerSurveys,
      totalOpeningsSubmitted,
      topDemandedSkills,
      marketSkillDemandOverview: marketSkillDemandOverview.slice(0, 10),
      recentValidationAudit
    };
  }

  /**
   * Submits a new job requirement from employer with validated skills (Critical, Important, Nice-to-have)
   */
  public submitJobRequirement(req: EmployerJobSubmissionRequest): Job {
    // Map UI importance levels ('critical' | 'important' | 'nice_to_have') to internal model ('critical' | 'preferred' | 'optional')
    const mappedSkills: JobSkillRequirement[] = req.requiredSkills.map(s => {
      let mappedImportance: 'critical' | 'preferred' | 'optional' = 'preferred';
      if (s.importance === 'critical') mappedImportance = 'critical';
      else if (s.importance === 'nice_to_have') mappedImportance = 'optional';

      return {
        skillId: s.skillId,
        importance: mappedImportance,
        minProficiency: s.minProficiency
      };
    });

    const newJob = dbStore.createJob({
      title: req.title,
      jobRoleId: req.jobRoleId,
      employerId: req.employerId,
      sectorId: req.sectorId,
      districtId: req.districtId,
      openings: Number(req.openings) || 1,
      minSalaryINR: Number(req.minSalaryINR) || 300000,
      maxSalaryINR: Number(req.maxSalaryINR) || 600000,
      experienceRequiredYears: Number(req.experienceRequiredYears) || 0,
      requiredSkills: mappedSkills,
      educationRequired: req.educationRequired || 'Graduate / ITI Diploma',
      description: req.description,
      status: 'active',
      isRemoteFriendly: Boolean(req.isRemoteFriendly),
      employmentType: req.employmentType || 'Full-time',
      source: 'Direct Employer Post'
    });

    return newJob;
  }

  /**
   * Submits an employer skill-demand survey with priority feedback
   */
  public submitDemandSurvey(req: EmployerSurveySubmissionRequest): EmployerSurvey {
    const survey = dbStore.createEmployerSurvey({
      employerId: req.employerId,
      sectorId: req.sectorId,
      districtId: req.districtId,
      reportedHardToFillSkillIds: req.reportedHardToFillSkillIds,
      hiringDifficultyScale: Number(req.hiringDifficultyScale) || 3,
      plannedHiringNext6Months: Number(req.plannedHiringNext6Months) || 10,
      emergingSkillComments: req.emergingSkillComments || '',
      readinessRating: Number(req.readinessRating) || 3
    });

    return survey;
  }
}

export const employerPortalService = new EmployerPortalService();
