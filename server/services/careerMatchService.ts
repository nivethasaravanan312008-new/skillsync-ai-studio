/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { dbStore } from '../db/database.ts';
import {
  Candidate,
  JobRole,
  CandidateCareerMatch,
  CandidateSkillGapProfile,
  Course
} from '../../src/types/dataModel.ts';

export class CareerMatchService {
  /**
   * Generates career matches across all job roles for a given candidate or ad-hoc candidate profile
   */
  public matchCandidateToCareers(candidateIdOrProfile: string | Partial<Candidate>): CandidateCareerMatch[] {
    const db = dbStore.getFullDb();

    let candidate: Partial<Candidate> | undefined;
    if (typeof candidateIdOrProfile === 'string') {
      candidate = db.candidates.find(c => c.id === candidateIdOrProfile);
    } else {
      candidate = candidateIdOrProfile;
    }

    if (!candidate) {
      return [];
    }

    const currentSkillIds = new Set(candidate.currentSkillIds || []);
    const preferredDistrictId = candidate.districtId;
    const preferredSectorId = candidate.targetSectorId;

    const matches: CandidateCareerMatch[] = [];

    // Evaluate each job role in the database
    for (const role of db.jobRoles) {
      const sector = db.sectors.find(s => s.id === role.sectorId);
      const roleSkillIds = role.defaultSkillIds || [];

      // Find active jobs for this role to calculate demand, salary, and geographic relevance
      const activeJobs = db.jobs.filter(j => j.jobRoleId === role.id && j.status === 'active');
      const totalOpenings = activeJobs.reduce((sum, j) => sum + j.openings, 0) || role.entryLevelOpenings;

      // Identify possessed vs missing skills
      const possessedSkills: CandidateCareerMatch['possessedSkills'] = [];
      const missingSkills: CandidateCareerMatch['missingSkills'] = [];

      for (const skillId of roleSkillIds) {
        const skill = db.skills.find(s => s.id === skillId);
        if (!skill) continue;

        if (currentSkillIds.has(skillId)) {
          possessedSkills.push({
            id: skill.id,
            name: skill.name,
            code: skill.code
          });
        } else {
          // Openings requiring this skill
          const skillOpenings = activeJobs
            .filter(j => j.requiredSkills.some(rs => rs.skillId === skillId))
            .reduce((sum, j) => sum + j.openings, 0) || Math.round(totalOpenings * 0.7);

          missingSkills.push({
            id: skill.id,
            name: skill.name,
            code: skill.code,
            importance: roleSkillIds.indexOf(skillId) === 0 ? 'critical' : 'preferred',
            openings: skillOpenings
          });
        }
      }

      // Calculate Match Percentage
      let matchPercentage = 0;
      if (roleSkillIds.length > 0) {
        matchPercentage = Math.round((possessedSkills.length / roleSkillIds.length) * 100);
      }

      // Determine Demand Level
      let demandLevel: CandidateCareerMatch['demandLevel'] = 'Moderate';
      if (totalOpenings > 300) demandLevel = 'Surging';
      else if (totalOpenings > 180) demandLevel = 'Very High';
      else if (totalOpenings > 100) demandLevel = 'High';

      // Find recommended courses that teach missing skills or role skills
      const missingSkillIds = new Set(missingSkills.map(m => m.id));
      const relevantCourses: CandidateCareerMatch['recommendedCourses'] = [];

      // Look for courses covering missing skills
      for (const course of db.courses) {
        const institute = db.institutes.find(i => i.id === course.instituteId);
        const district = db.districts.find(d => d.id === course.districtId);

        const coveredIds = course.coveredSkills.map(cs => cs.skillId);
        const overlap = coveredIds.filter(id => missingSkillIds.has(id));

        if (overlap.length > 0 || (course.targetJobRoleId === role.id && missingSkills.length > 0)) {
          const matchingSkillNames = overlap.map(id => {
            const sk = db.skills.find(s => s.id === id);
            return sk ? sk.name : id;
          });

          relevantCourses.push({
            id: course.id,
            title: course.title,
            courseCode: course.code,
            instituteName: institute?.name || 'Accredited Institute',
            districtName: district?.name || 'Maharashtra',
            durationHours: course.durationHours,
            nsqfLevel: course.nsqfLevel,
            healthScore: course.healthScore,
            matchingSkillsCovered: matchingSkillNames,
            skillsCount: matchingSkillNames.length
          });
        }
      }

      // Sort courses by healthScore and overlap count
      relevantCourses.sort((a, b) => b.healthScore - a.healthScore || b.skillsCount - a.skillsCount);

      // Construct a structured logical Learning Sequence
      const learningSequence: CandidateCareerMatch['learningSequence'] = [];
      let stepCounter = 1;

      // First step: acknowledge already possessed skills
      if (possessedSkills.length > 0) {
        possessedSkills.forEach(ps => {
          learningSequence.push({
            step: stepCounter++,
            skillId: ps.id,
            skillName: ps.name,
            type: 'possessed',
            rationale: 'Core foundation already acquired. Ready for intermediate advancement.',
            estimatedWeeks: 0
          });
        });
      }

      // Next steps: missing skills in progression order
      missingSkills.forEach((ms, idx) => {
        // Find matching course for this specific skill
        const matchingCourse = relevantCourses.find(c => c.matchingSkillsCovered.includes(ms.name)) || relevantCourses[0];
        learningSequence.push({
          step: stepCounter++,
          skillId: ms.id,
          skillName: ms.name,
          type: 'to_learn',
          rationale: ms.importance === 'critical'
            ? `Critical requirement demanded across ${ms.openings} industry job openings.`
            : `Recommended competency to achieve high-tier salary and productivity.`,
          recommendedCourseTitle: matchingCourse?.title,
          estimatedWeeks: 3 + idx * 2
        });
      });

      // Final step: Capstone / Live Project
      learningSequence.push({
        step: stepCounter++,
        skillId: `capstone-${role.id}`,
        skillName: `${role.title} Real-World Industry Capstone Project`,
        type: 'capstone',
        rationale: 'Portfolio demonstration, employer interview showcase, and practical system deployment.',
        estimatedWeeks: 4
      });

      // Relevant districts with active requisitions
      const districtOpeningsMap = new Map<string, number>();
      activeJobs.forEach(job => {
        districtOpeningsMap.set(job.districtId, (districtOpeningsMap.get(job.districtId) || 0) + job.openings);
      });

      const relevantDistricts = Array.from(districtOpeningsMap.entries())
        .map(([distId, count]) => {
          const dist = db.districts.find(d => d.id === distId);
          return {
            districtId: distId,
            districtName: dist ? dist.name : distId,
            openings: count
          };
        })
        .sort((a, b) => b.openings - a.openings)
        .slice(0, 4);

      // If no active jobs, add candidate district or main districts
      if (relevantDistricts.length === 0) {
        const pune = db.districts.find(d => d.id === 'dist-pune');
        const mumbai = db.districts.find(d => d.id === 'dist-mumbai');
        if (pune) relevantDistricts.push({ districtId: pune.id, districtName: pune.name, openings: 120 });
        if (mumbai) relevantDistricts.push({ districtId: mumbai.id, districtName: mumbai.name, openings: 150 });
      }

      matches.push({
        jobRoleId: role.id,
        jobRoleTitle: role.title,
        sectorId: role.sectorId,
        sectorName: sector?.name || 'Industry',
        matchPercentage,
        averageSalaryINR: role.averageSalaryINR,
        openingsCount: totalOpenings,
        demandLevel,
        possessedSkills,
        missingSkills,
        recommendedCourses: relevantCourses.slice(0, 4),
        learningSequence,
        relevantDistricts
      });
    }

    // Sort matches: boost user's selected sector or target role, then by matchPercentage descending
    return matches.sort((a, b) => {
      const aIsTargetRole = a.jobRoleId === candidate.targetJobRoleId;
      const bIsTargetRole = b.jobRoleId === candidate.targetJobRoleId;
      if (aIsTargetRole && !bIsTargetRole) return -1;
      if (!aIsTargetRole && bIsTargetRole) return 1;

      const aIsPrefSector = a.sectorId === preferredSectorId;
      const bIsPrefSector = b.sectorId === preferredSectorId;
      if (aIsPrefSector && !bIsPrefSector) return -1;
      if (!aIsPrefSector && bIsPrefSector) return 1;

      return b.matchPercentage - a.matchPercentage;
    });
  }

  /**
   * Generates deep Skill Gap Analysis and customized learning pathway for candidate
   * specifically focused on their target role or requested role
   */
  public getCandidateSkillGapProfile(candidateId: string, customRoleId?: string): CandidateSkillGapProfile | null {
    const db = dbStore.getFullDb();
    const candidate = db.candidates.find(c => c.id === candidateId);
    if (!candidate) return null;

    const targetRoleId = customRoleId || candidate.targetJobRoleId;
    const targetRole = db.jobRoles.find(r => r.id === targetRoleId) || db.jobRoles[0];
    const sector = db.sectors.find(s => s.id === targetRole.sectorId);

    const currentSkillSet = new Set(candidate.currentSkillIds);
    const roleSkillIds = targetRole.defaultSkillIds || [];

    // Already Have
    const alreadyHave: CandidateSkillGapProfile['alreadyHave'] = [];
    const need: CandidateSkillGapProfile['need'] = [];

    roleSkillIds.forEach((skId, idx) => {
      const skill = db.skills.find(s => s.id === skId);
      if (!skill) return;

      if (currentSkillSet.has(skId)) {
        alreadyHave.push({
          id: skill.id,
          name: skill.name,
          code: skill.code
        });
      } else {
        need.push({
          id: skill.id,
          name: skill.name,
          code: skill.code,
          nsqfLevel: skill.nsqfLevel,
          demandTrend: skill.demandTrend,
          importance: idx < 2 ? 'critical' : 'preferred'
        });
      }
    });

    const matchScore = roleSkillIds.length > 0
      ? Math.round((alreadyHave.length / roleSkillIds.length) * 100)
      : 0;

    // Pathway sequence: (Already possessed skills) -> (Needed skills in pedagogical order) -> (Project)
    const pathwaySequence: CandidateSkillGapProfile['pathwaySequence'] = [];
    let stepIndex = 1;

    // 1. Possessed
    alreadyHave.forEach(sk => {
      pathwaySequence.push({
        stepIndex: stepIndex++,
        skillId: sk.id,
        skillName: sk.name,
        isPossessed: true,
        stageLabel: 'Acquired Foundation',
        description: `Verified baseline proficiency in ${sk.name}.`,
        estimatedWeeks: 0
      });
    });

    // 2. Needed
    need.forEach((sk, idx) => {
      pathwaySequence.push({
        stepIndex: stepIndex++,
        skillId: sk.id,
        skillName: sk.name,
        isPossessed: false,
        stageLabel: `Skill Gap Milestone ${idx + 1}`,
        description: `Target NSQF Level ${sk.nsqfLevel} training with hands-on lab exercises and micro-credential.`,
        estimatedWeeks: 3 + idx * 2
      });
    });

    // 3. Final Capstone Project
    pathwaySequence.push({
      stepIndex: stepIndex++,
      skillId: `capstone-${targetRole.id}`,
      skillName: `${targetRole.title} Production Capstone Project`,
      isPossessed: false,
      isCapstone: true,
      stageLabel: 'Final Portfolio & Capstone',
      description: 'End-to-end industry prototype, automated CI/CD pipeline, and technical employer interview prep.',
      estimatedWeeks: 4
    });

    // Recommended Courses based on candidate's skill gaps
    const neededIds = new Set(need.map(n => n.id));
    const matchingCourses: CandidateSkillGapProfile['recommendedCourses'] = [];

    for (const course of db.courses) {
      const institute = db.institutes.find(i => i.id === course.instituteId);
      const district = db.districts.find(d => d.id === course.districtId);

      const coveredGapSkills = course.coveredSkills
        .filter(cs => neededIds.has(cs.skillId))
        .map(cs => {
          const s = db.skills.find(sk => sk.id === cs.skillId);
          return {
            id: cs.skillId,
            name: s ? s.name : cs.skillId
          };
        });

      if (coveredGapSkills.length > 0 || (course.targetJobRoleId === targetRole.id && neededIds.size > 0)) {
        const totalPractical = course.coveredSkills.reduce((sum, cs) => sum + (cs.practicalHours || 0), 0);
        const totalTheory = course.coveredSkills.reduce((sum, cs) => sum + (cs.theoryHours || 0), 0);

        matchingCourses.push({
          courseId: course.id,
          courseTitle: course.title,
          courseCode: course.code,
          instituteName: institute?.name || 'State Polytechnic Institute',
          districtName: district?.name || 'Maharashtra',
          nsqfLevel: course.nsqfLevel,
          durationHours: course.durationHours,
          healthScore: course.healthScore,
          coveredGapSkills,
          practicalHours: totalPractical,
          theoryHours: totalTheory
        });
      }
    }

    // Sort recommended courses: prefer candidate's district, then by count of gap skills covered, then healthScore
    matchingCourses.sort((a, b) => {
      const aInDist = a.districtName === db.districts.find(d => d.id === candidate.districtId)?.name;
      const bInDist = b.districtName === db.districts.find(d => d.id === candidate.districtId)?.name;
      if (aInDist && !bInDist) return -1;
      if (!aInDist && bInDist) return 1;

      return b.coveredGapSkills.length - a.coveredGapSkills.length || b.healthScore - a.healthScore;
    });

    return {
      candidateId: candidate.id,
      candidateName: candidate.name,
      targetRoleId: targetRole.id,
      targetRoleTitle: targetRole.title,
      targetSectorName: sector?.name || 'Industry',
      matchScore,
      alreadyHave,
      need,
      pathwaySequence,
      recommendedCourses: matchingCourses
    };
  }

  /**
   * Generates Recommended Courses page based strictly on candidate's skill gaps
   */
  public getCandidateRecommendedCourses(candidateId: string) {
    const db = dbStore.getFullDb();
    const candidate = db.candidates.find(c => c.id === candidateId);
    if (!candidate) return { candidate: null, courses: [] };

    const targetRole = db.jobRoles.find(r => r.id === candidate.targetJobRoleId);
    const candidateSkillSet = new Set(candidate.currentSkillIds);

    // Identify needed skills
    const missingSkillIds = new Set<string>();
    if (targetRole) {
      targetRole.defaultSkillIds.forEach(id => {
        if (!candidateSkillSet.has(id)) missingSkillIds.add(id);
      });
    }

    // Score all courses strictly based on covered missing skills & proximity
    const results = db.courses.map(course => {
      const institute = db.institutes.find(i => i.id === course.instituteId);
      const district = db.districts.find(d => d.id === course.districtId);
      const sector = db.sectors.find(s => s.id === course.sectorId);

      const matchedGapSkills = course.coveredSkills.filter(cs => missingSkillIds.has(cs.skillId)).map(cs => {
        const sk = db.skills.find(s => s.id === cs.skillId);
        return {
          skillId: cs.skillId,
          name: sk ? sk.name : cs.skillId,
          proficiencyCovered: cs.proficiencyGoal,
          practicalHours: cs.practicalHours
        };
      });

      const isLocalDistrict = course.districtId === candidate.districtId;
      const isTargetSector = course.sectorId === candidate.targetSectorId;
      const isDirectRoleMatch = course.targetJobRoleId === candidate.targetJobRoleId;

      // Relevance Score
      let relevanceScore = (matchedGapSkills.length * 28);
      if (isDirectRoleMatch) relevanceScore += 30;
      if (isTargetSector) relevanceScore += 15;
      if (isLocalDistrict) relevanceScore += 15;
      if (course.healthScore >= 80) relevanceScore += 10;

      return {
        course,
        institute,
        district,
        sector,
        matchedGapSkills,
        relevanceScore: Math.min(100, Math.max(10, relevanceScore)),
        isLocalDistrict,
        coveragePercentage: missingSkillIds.size > 0
          ? Math.round((matchedGapSkills.length / missingSkillIds.size) * 100)
          : 50
      };
    });

    // Return courses that have at least 1 gap match or target sector alignment, sorted descending
    const filteredCourses = results
      .filter(r => r.matchedGapSkills.length > 0 || r.relevanceScore >= 45)
      .sort((a, b) => b.relevanceScore - a.relevanceScore || b.matchedGapSkills.length - a.matchedGapSkills.length);

    return {
      candidate,
      targetRole,
      missingSkillsCount: missingSkillIds.size,
      missingSkillsList: Array.from(missingSkillIds).map(id => db.skills.find(s => s.id === id)?.name || id),
      courses: filteredCourses
    };
  }
}

export const careerMatchService = new CareerMatchService();
