/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { dbStore } from '../db/database.ts';
import {
  TrainingInstitute,
  Course,
  Trainer,
  InstituteEquipment,
  InstituteCourseAlignmentOverview,
  InstitutePortalDashboardData,
  CreateCourseRequest,
  Placement
} from '../../src/types/dataModel.ts';
import { analyticsService } from './analyticsService.ts';
import { curriculumRecommendationService } from './curriculumRecommendationService.ts';

export class InstituteService {
  /**
   * Retrieves full aggregated dashboard and alignment data for a specific institute
   */
  public getInstituteDashboardData(instituteId: string): InstitutePortalDashboardData {
    const db = dbStore.getFullDb();
    const institute = db.institutes.find(i => i.id === instituteId);
    if (!institute) {
      throw new Error(`Training Institute ${instituteId} not found`);
    }

    const courses = db.courses.filter(c => c.instituteId === instituteId);
    const trainers = db.trainers.filter(t => t.instituteId === instituteId);
    const equipment = db.equipment ? db.equipment.filter(e => e.instituteId === instituteId) : [];
    const placements = db.placements.filter(p => p.instituteId === instituteId);

    // Make sure all recommendations are populated in memory
    const allRecs = curriculumRecommendationService.generateAllRecommendations(false);

    // Compute course alignments
    const courseAlignments: InstituteCourseAlignmentOverview[] = courses.map(course => {
      const summary = analyticsService.analyzeCourseSkillGap(course);
      const sector = db.sectors.find(s => s.id === course.sectorId);
      const district = db.districts.find(d => d.id === course.districtId);
      const targetRole = db.jobRoles.find(r => r.id === course.targetJobRoleId);

      // Course-specific placements and placement rate
      const coursePlacements = placements.filter(p => p.courseId === course.id);
      const placedCount = coursePlacements.length;
      const graduated = course.graduatedLastYear || 45;
      const placementRate = Math.min(100, Math.max(40, Math.round((placedCount / graduated) * 100) || 76));

      // Industry demand metrics for course sector & role
      const sectorJobs = db.jobs.filter(j => j.status === 'active' && j.sectorId === course.sectorId);
      const activeOpenings = sectorJobs.reduce((sum, j) => sum + j.openings, 0);
      const uniqueEmployers = new Set(sectorJobs.map(j => j.employerId)).size;
      const avgSalary = sectorJobs.length > 0
        ? Math.round(sectorJobs.reduce((sum, j) => sum + (j.minSalaryINR + j.maxSalaryINR) / 2, 0) / sectorJobs.length)
        : (targetRole?.averageSalaryINR || 320000);

      // Skills covered
      const coveredSkillIds = new Set(course.coveredSkills.map(cs => cs.skillId));
      const skillsCovered = course.coveredSkills.map(cs => {
        const skill = db.skills.find(s => s.id === cs.skillId);
        const cat = db.skillCategories.find(c => c.id === skill?.categoryId);
        const matchingSkill = summary.skills?.find(s => s.skillId === cs.skillId);

        return {
          skillId: cs.skillId,
          skillName: skill ? skill.name : cs.skillId,
          category: cat ? cat.name : 'Technical Capability',
          proficiencyGoal: cs.proficiencyGoal,
          theoryHours: cs.theoryHours,
          practicalHours: cs.practicalHours,
          marketDemandScore: matchingSkill?.industryDemandScore || 65,
          isMarketCritical: matchingSkill ? matchingSkill.isCritical : false
        };
      });

      // Missing skills (industry required in sector/job role, but not taught in course)
      const missingSkillsSource = summary.missingSkillsList || [];
      const missingSkills = missingSkillsSource.map(ms => {
        const skill = db.skills.find(s => s.id === ms.skillId);
        const cat = db.skillCategories.find(c => c.id === skill?.categoryId);

        return {
          skillId: ms.skillId,
          skillName: ms.skillName,
          category: cat ? cat.name : (ms.category || 'Industry 4.0 Deficit'),
          urgency: ms.industryOpenings > 50 ? 'Surging' as const : 'High' as const,
          marketOpenings: ms.industryOpenings,
          suggestedProficiency: ms.requiredProficiency || 'intermediate',
          nsqfLevel: skill?.nsqfLevel || ms.nsqfLevel || course.nsqfLevel,
          isEmerging: skill?.isEmerging || false
        };
      });

      // Recommendations linked to this course
      const courseRecs = allRecs.filter(r => r.courseId === course.id);
      const formattedRecommendations = courseRecs.map(r => ({
        id: r.id,
        actionType: r.actionType as any,
        priority: r.priority as any,
        status: (r.status as any) || 'pending',
        skillId: r.skillId,
        skillName: r.skillName,
        reason: r.reason,
        detailedExplanation: r.detailedExplanation,
        suggestedLabHours: r.suggestedLabHours,
        suggestedModuleTitle: r.practicalProject?.title,
        implementationNotes: r.adminNotes || '',
        acknowledgedAt: r.reviewedAt,
        acknowledgedBy: r.reviewedBy
      }));

      return {
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        instituteId: course.instituteId,
        instituteName: institute.name,
        sectorId: course.sectorId,
        sectorName: sector?.name || 'Sector',
        districtId: course.districtId,
        districtName: district?.name || 'Maharashtra District',
        durationHours: course.durationHours,
        nsqfLevel: course.nsqfLevel,
        annualBatchCapacity: course.annualBatchCapacity,
        currentEnrolled: course.currentEnrolled,
        graduatedLastYear: course.graduatedLastYear,
        targetJobRoleId: course.targetJobRoleId,
        targetRoleTitle: targetRole?.title || 'Industry Specialist',
        alignmentScore: summary.alignmentScore,
        placementRate,
        industryDemand: {
          activeOpenings,
          employerCount: uniqueEmployers,
          urgencyLevel: activeOpenings > 100 ? 'Surging' : activeOpenings > 50 ? 'High' : 'Moderate',
          averageStartingSalaryINR: avgSalary
        },
        skillsCovered,
        missingSkills,
        recommendations: formattedRecommendations
      };
    });

    // Summary calculations
    const totalCourses = courses.length;
    const totalSanctionedCapacity = courses.reduce((sum, c) => sum + c.annualBatchCapacity, 0);
    const totalEnrolled = courses.reduce((sum, c) => sum + c.currentEnrolled, 0);
    const overallCapacityUtilization = totalSanctionedCapacity > 0
      ? Math.round((totalEnrolled / totalSanctionedCapacity) * 100)
      : 0;

    const averageInstituteAlignment = totalCourses > 0
      ? Math.round(courseAlignments.reduce((sum, ca) => sum + ca.alignmentScore, 0) / totalCourses)
      : 0;

    const averagePlacementRate = totalCourses > 0
      ? Math.round(courseAlignments.reduce((sum, ca) => sum + ca.placementRate, 0) / totalCourses)
      : 0;

    let pendingRecs = 0;
    let acknowledgedRecs = 0;
    courseAlignments.forEach(ca => {
      ca.recommendations.forEach(r => {
        if (r.status === 'pending') pendingRecs++;
        else acknowledgedRecs++;
      });
    });

    return {
      institute,
      courses,
      trainers,
      equipment,
      courseAlignments,
      placements,
      summary: {
        totalCourses,
        totalSanctionedCapacity,
        totalEnrolled,
        overallCapacityUtilization,
        averageInstituteAlignment,
        averagePlacementRate,
        totalTrainers: trainers.length,
        totalEquipmentCount: equipment.reduce((sum, e) => sum + e.quantity, 0),
        pendingRecommendationsCount: pendingRecs,
        acknowledgedRecommendationsCount: acknowledgedRecs
      }
    };
  }

  /**
   * Creates a new Course and connects it directly into central database model
   */
  public createCourseWithCurriculum(request: CreateCourseRequest): Course {
    const db = dbStore.getFullDb();
    const institute = db.institutes.find(i => i.id === request.instituteId);
    if (!institute) {
      throw new Error(`Institute ${request.instituteId} does not exist`);
    }

    // Verify covered skills exist in database taxonomy
    const coveredSkills = request.coveredSkills.map(cs => {
      const skill = db.skills.find(s => s.id === cs.skillId);
      if (!skill) {
        throw new Error(`Skill ${cs.skillId} not found in state taxonomy`);
      }
      return {
        skillId: cs.skillId,
        proficiencyGoal: cs.proficiencyGoal,
        practicalHours: Number(cs.practicalHours) || 80,
        theoryHours: Number(cs.theoryHours) || 40
      };
    });

    const newCourseId = `crs-${String(db.courses.length + 1).padStart(3, '0')}`;

    // Structure curriculum modules
    const modules = request.curriculumModules.map((m, idx) => ({
      id: `mod-${newCourseId}-${idx + 1}`,
      courseId: newCourseId,
      moduleNumber: m.moduleNumber || idx + 1,
      title: m.title,
      description: m.description,
      durationHours: Number(m.durationHours) || 60,
      skillIds: m.skillIds || [],
      isOutdated: !!m.isOutdated,
      suggestedRevision: m.suggestedRevision,
      lastUpdated: new Date().toISOString().split('T')[0]
    }));

    // Calculate initial health score based on modern vs outdated modules
    const outdatedCount = modules.filter(m => m.isOutdated).length;
    const initialHealth = Math.max(45, Math.min(98, 95 - (outdatedCount * 20)));

    const createdCourse = dbStore.createCourse({
      code: request.code,
      title: request.title,
      instituteId: request.instituteId,
      districtId: request.districtId || institute.districtId,
      sectorId: request.sectorId,
      nsqfLevel: Number(request.nsqfLevel) || 5,
      durationHours: Number(request.durationHours) || 600,
      annualBatchCapacity: Number(request.annualBatchCapacity) || 60,
      feeStructureINR: Number(request.feeStructureINR) || 4500,
      certificationBody: request.certificationBody || 'NCVT / MSBTE Accredited',
      targetJobRoleId: request.targetJobRoleId,
      coveredSkills,
      curriculumModules: modules,
      healthScore: initialHealth
    });

    // Also trigger curriculum recommendations generation so the new course has instant industry recommendations
    curriculumRecommendationService.generateAllRecommendations(true);

    return createdCourse;
  }

  /**
   * Updates institute profile details
   */
  public updateInstituteProfile(instituteId: string, updates: Partial<TrainingInstitute>): TrainingInstitute {
    const updated = dbStore.updateInstitute(instituteId, updates);
    if (!updated) {
      throw new Error(`Institute ${instituteId} not found`);
    }
    return updated;
  }

  /**
   * Adds a new trainer to an institute
   */
  public addTrainer(trainerData: Omit<Trainer, 'id'>): Trainer {
    return dbStore.createTrainer(trainerData);
  }

  /**
   * Adds new equipment/lab resource to an institute
   */
  public addEquipment(equipmentData: Omit<InstituteEquipment, 'id'>): InstituteEquipment {
    return dbStore.createEquipment(equipmentData);
  }

  /**
   * Acknowledges or accepts a recommendation with implementation notes
   */
  public acknowledgeRecommendation(
    recommendationId: string,
    status: 'acknowledged' | 'accepted' | 'in_progress' | 'implemented' | 'rejected',
    implementationNotes: string,
    acknowledgedBy = 'Institute Head of Department'
  ) {
    const db = dbStore.getFullDb();
    if (!db.curriculumRecommendations) {
      db.curriculumRecommendations = curriculumRecommendationService.generateAllRecommendations(false);
    }

    const rec = db.curriculumRecommendations.find(r => r.id === recommendationId);
    if (!rec) {
      throw new Error(`Recommendation ${recommendationId} not found`);
    }

    rec.status = status as any;
    rec.reviewedAt = new Date().toISOString();
    rec.reviewedBy = acknowledgedBy;
    rec.updatedAt = new Date().toISOString();

    const timestamp = new Date().toLocaleDateString();
    if (implementationNotes && implementationNotes.trim()) {
      rec.adminNotes = rec.adminNotes
        ? `${rec.adminNotes}\n[${timestamp} - ${acknowledgedBy}]: ${implementationNotes}`
        : `[${timestamp} - ${acknowledgedBy}]: ${implementationNotes}`;
    }

    dbStore.saveCurrentDb();
    return rec;
  }
}

export const instituteService = new InstituteService();
