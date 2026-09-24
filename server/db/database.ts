/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  AppDatabase,
  Job,
  Course,
  Candidate,
  Employer,
  Placement,
  EmployerSurvey,
  TrainingCapacity,
  TrainingInstitute,
  Trainer,
  InstituteEquipment
} from '../../src/types/dataModel.ts';
import { generateSeedData } from './seedGenerator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

class DatabaseStore {
  private db: AppDatabase | null = null;
  private isSaving = false;

  constructor() {
    this.init();
  }

  private init(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.db = JSON.parse(raw);
        this.ensureCoreIntegrity();
        console.log(`[Database] Loaded persistent data: ${this.db?.jobs.length} jobs, ${this.db?.skills.length} skills, ${this.db?.courses.length} courses.`);
      } else {
        console.log('[Database] database.json not found. Generating fresh simulated seed data...');
        this.resetToSeed();
      }
    } catch (err) {
      console.error('[Database] Error initializing database. Re-seeding:', err);
      this.resetToSeed();
    }
  }

  private ensureCoreIntegrity(): void {
    if (!this.db) return;
    if (!this.db.ingestionHistory) {
      this.db.ingestionHistory = [];
    }
    if (!this.db.curriculumRecommendations) {
      this.db.curriculumRecommendations = [];
    }
    if (!this.db.recommendationAuditLogs) {
      this.db.recommendationAuditLogs = [];
    }
    if (!this.db.equipment) {
      this.db.equipment = [
        {
          id: 'eq-inst-01-01',
          instituteId: 'inst-01',
          name: 'Siemens 828D 5-Axis CNC Milling Center',
          category: 'Machinery & CNC',
          modelOrMake: 'Siemens Sinumerik 828D VMC-850',
          quantity: 2,
          operationalStatus: 'Fully Operational',
          acquiredYear: 2023,
          nsqfAlignmentLevel: 6,
          supportedSkillIds: ['sk-cnc-prog', 'sk-cad-cam'],
          associatedCourseIds: ['crs-001', 'crs-002'],
          labRoomNumber: 'Advanced Manufacturing Bay - Lab 104'
        },
        {
          id: 'eq-inst-01-02',
          instituteId: 'inst-01',
          name: 'High-Voltage EV Battery Pack Diagnostics & BMS Simulator Bench',
          category: 'Testing & Diagnostics',
          modelOrMake: 'Chroma 17020 Regenerative Battery Test System',
          quantity: 3,
          operationalStatus: 'Fully Operational',
          acquiredYear: 2024,
          nsqfAlignmentLevel: 6,
          supportedSkillIds: ['sk-ev-battery', 'sk-ev-powertrain', 'sk-auto-diag'],
          associatedCourseIds: ['crs-001'],
          labRoomNumber: 'EV Centre of Excellence - Bay 2'
        },
        {
          id: 'eq-inst-01-03',
          instituteId: 'inst-01',
          name: 'Industrial PLC & SCADA Automation Workstation',
          category: 'Lab Workstation',
          modelOrMake: 'Rockwell Allen-Bradley ControlLogix & FactoryTalk SCADA',
          quantity: 8,
          operationalStatus: 'Fully Operational',
          acquiredYear: 2022,
          nsqfAlignmentLevel: 5,
          supportedSkillIds: ['sk-plc-scada', 'sk-iot-sensor'],
          associatedCourseIds: ['crs-002'],
          labRoomNumber: 'Mechatronics Lab 201'
        },
        {
          id: 'eq-inst-02-01',
          instituteId: 'inst-02',
          name: 'Cleanroom HVAC Laminar Flow & Particle Counter Rig',
          category: 'Lab Workstation',
          modelOrMake: 'Klenzaids ISO Class 5 Clean Bench',
          quantity: 4,
          operationalStatus: 'Fully Operational',
          acquiredYear: 2023,
          nsqfAlignmentLevel: 5,
          supportedSkillIds: ['sk-pharma-gmp', 'sk-cleanroom-sop'],
          associatedCourseIds: ['crs-003'],
          labRoomNumber: 'Pharma Cleanroom Suite'
        },
        {
          id: 'eq-inst-03-01',
          instituteId: 'inst-03',
          name: 'High-Speed Automated SMT Pick-and-Place Assembly Station',
          category: 'Machinery & CNC',
          modelOrMake: 'Yamaha YSM10 Modular SMT Mounter',
          quantity: 1,
          operationalStatus: 'Fully Operational',
          acquiredYear: 2024,
          nsqfAlignmentLevel: 6,
          supportedSkillIds: ['sk-smt-assembly', 'sk-pcb-design'],
          associatedCourseIds: ['crs-005'],
          labRoomNumber: 'VLSI & Electronics Bay 3'
        }
      ];
    }
    const coreSkillsToAdd = [
      { id: 'sk-git-vcs', code: 'IT-16', name: 'Git Version Control & Collaborative Workflows', categoryId: 'cat-software', sectorIds: ['sec-it', 'sec-bfsi'], nsqfLevel: 5, isEmerging: false, demandTrend: 'stable' as const, aliases: ['Git', 'GitHub', 'GitLab', 'Version Control', 'Branching'], description: 'Git branch management, merge conflict resolution, pull request workflows, and semantic commits.' },
      { id: 'sk-python-backend', code: 'IT-09', name: 'Python Programming & Backend Architecture', categoryId: 'cat-software', sectorIds: ['sec-it', 'sec-bfsi'], nsqfLevel: 6, isEmerging: false, demandTrend: 'surging' as const, aliases: ['Python', 'Python3', 'Py', 'Python Backend'], description: 'Server-side application logic, data structures, and backend services using Python.' },
      { id: 'sk-fastapi', code: 'IT-10', name: 'FastAPI High-Performance Web Services', categoryId: 'cat-software', sectorIds: ['sec-it'], nsqfLevel: 6, isEmerging: true, demandTrend: 'surging' as const, aliases: ['FastAPI', 'Fast API', 'ASGI', 'Uvicorn', 'Pydantic'], description: 'Asynchronous API development, Swagger OpenAPI generation, and microservices in Python FastAPI.' },
      { id: 'sk-rest-apis', code: 'IT-11', name: 'REST APIs & Microservice Architecture', categoryId: 'cat-software', sectorIds: ['sec-it', 'sec-bfsi'], nsqfLevel: 5, isEmerging: false, demandTrend: 'stable' as const, aliases: ['REST APIs', 'REST API', 'RESTful API', 'RESTful Services', 'OpenAPI'], description: 'Design and consumption of HTTP RESTful endpoints, API versioning, and JSON payloads.' },
      { id: 'sk-docker-containers', code: 'IT-12', name: 'Docker Containerization & Microservices', categoryId: 'cat-software', sectorIds: ['sec-it', 'sec-bfsi'], nsqfLevel: 6, isEmerging: true, demandTrend: 'surging' as const, aliases: ['Docker', 'Containers', 'Docker Compose', 'Containerization'], description: 'Docker image building, container networking, volume mounting, and microservice orchestration.' },
      { id: 'sk-aws-cloud', code: 'IT-13', name: 'AWS Cloud Infrastructure & Serverless Services', categoryId: 'cat-software', sectorIds: ['sec-it', 'sec-bfsi'], nsqfLevel: 6, isEmerging: true, demandTrend: 'surging' as const, aliases: ['AWS', 'Amazon Web Services', 'EC2', 'S3', 'Lambda', 'AWS Cloud'], description: 'Deployment, compute instances, IAM roles, and storage on Amazon Web Services.' },
      { id: 'sk-javascript-core', code: 'IT-14', name: 'JavaScript & Modern ECMAScript (ES6+)', categoryId: 'cat-software', sectorIds: ['sec-it', 'sec-retail'], nsqfLevel: 5, isEmerging: false, demandTrend: 'stable' as const, aliases: ['JavaScript', 'JS', 'Vanilla JS', 'ES6', 'ECMAScript'], description: 'Core JavaScript language fundamentals, DOM manipulation, asynchronous programming, and event loop.' },
      { id: 'sk-react-frontend', code: 'IT-15', name: 'React.js & Modern Component Architecture', categoryId: 'cat-software', sectorIds: ['sec-it', 'sec-bfsi'], nsqfLevel: 6, isEmerging: false, demandTrend: 'surging' as const, aliases: ['React', 'React.js', 'ReactJS', 'React Native'], description: 'Declarative component design, hooks, state management, and virtual DOM in React.' }
    ];

    let modified = false;
    for (const cs of coreSkillsToAdd) {
      if (!this.db.skills.some(s => s.id === cs.id)) {
        this.db.skills.push(cs);
        modified = true;
      }
    }

    // Ensure explicit 'Python Developer' role exists for exact canonical alignment
    if (!this.db.jobRoles.some(r => r.id === 'jr-python-dev')) {
      this.db.jobRoles.push({
        id: 'jr-python-dev',
        title: 'Python Developer',
        sectorId: 'sec-it',
        minNsqfLevel: 6,
        defaultSkillIds: ['sk-python-backend', 'sk-sql-rdbms', 'sk-git-vcs', 'sk-rest-apis', 'sk-fastapi', 'sk-docker-containers'],
        averageSalaryINR: 650000,
        entryLevelOpenings: 340,
        description: 'Design and deploy scalable Python backend microservices, REST APIs, database models, and containerized cloud services.'
      });
      modified = true;
    }

    // Ensure Python Web & Microservices Course exists
    if (!this.db.courses.some(c => c.id === 'crs-python-fastapi-01')) {
      this.db.courses.push({
        id: 'crs-python-fastapi-01',
        code: 'CRS-IT-PY-FASTAPI',
        title: 'Python Backend Engineering, REST APIs & Docker Microservices',
        sectorId: 'sec-it',
        districtId: 'dist-pune',
        instituteId: 'inst-01',
        nsqfLevel: 6,
        durationHours: 640,
        targetJobRoleId: 'jr-python-dev',
        annualBatchCapacity: 120,
        currentEnrolled: 98,
        graduatedLastYear: 84,
        feeStructureINR: 15000,
        certificationBody: 'MSBTE & NCVET Industry Accredited',
        healthScore: 94,
        lastCurriculumReviewDate: new Date().toISOString().split('T')[0],
        coveredSkills: [
          { skillId: 'sk-python-backend', proficiencyGoal: 'advanced', practicalHours: 180, theoryHours: 60 },
          { skillId: 'sk-git-vcs', proficiencyGoal: 'intermediate', practicalHours: 40, theoryHours: 20 },
          { skillId: 'sk-rest-apis', proficiencyGoal: 'advanced', practicalHours: 90, theoryHours: 40 },
          { skillId: 'sk-fastapi', proficiencyGoal: 'advanced', practicalHours: 110, theoryHours: 40 },
          { skillId: 'sk-docker-containers', proficiencyGoal: 'intermediate', practicalHours: 70, theoryHours: 30 },
          { skillId: 'sk-sql-rdbms', proficiencyGoal: 'intermediate', practicalHours: 50, theoryHours: 30 }
        ],
        curriculumModules: [
          { id: 'mod-crs-pune-001-1', courseId: 'crs-pune-001', moduleNumber: 1, title: 'Python Fundamentals & Data Structures', description: 'Core Python, OOP, decorators, generators, and virtual environments.', durationHours: 120, skillIds: ['sk-python-backend'], isOutdated: false, lastUpdated: '2025-01-15' },
          { id: 'mod-crs-pune-001-2', courseId: 'crs-pune-001', moduleNumber: 2, title: 'Git Version Control & Team Workflows', description: 'Branching, PRs, rebasing, and CI/CD triggers on GitHub/GitLab.', durationHours: 60, skillIds: ['sk-git-vcs'], isOutdated: false, lastUpdated: '2025-01-15' },
          { id: 'mod-crs-pune-001-3', courseId: 'crs-pune-001', moduleNumber: 3, title: 'RESTful API Architecture & Design', description: 'HTTP verbs, status codes, OpenAPI schema, authentication, and JWT tokens.', durationHours: 90, skillIds: ['sk-rest-apis'], isOutdated: false, lastUpdated: '2025-01-15' },
          { id: 'mod-crs-pune-001-4', courseId: 'crs-pune-001', moduleNumber: 4, title: 'FastAPI High-Performance Async Microservices', description: 'Async/await, Pydantic validation, dependency injection, and ORM integration.', durationHours: 150, skillIds: ['sk-fastapi', 'sk-sql-rdbms'], isOutdated: false, lastUpdated: '2025-01-15' },
          { id: 'mod-crs-pune-001-5', courseId: 'crs-pune-001', moduleNumber: 5, title: 'Docker Containerization & Capstone Project', description: 'Dockerfile, docker-compose multi-service architecture, and full microservice deployment.', durationHours: 140, skillIds: ['sk-docker-containers'], isOutdated: false, lastUpdated: '2025-01-15' }
        ]
      });
      modified = true;
    }

    // Ensure candidate cand-001 or sample candidate has Python + SQL to perfectly match user prompt example
    const sampleCand = this.db.candidates.find(c => c.id === 'cand-001');
    if (sampleCand) {
      sampleCand.targetJobRoleId = 'jr-python-dev';
      sampleCand.targetSectorId = 'sec-it';
      sampleCand.currentSkillIds = ['sk-python-backend', 'sk-sql-rdbms'];
      sampleCand.districtId = 'dist-pune';
      sampleCand.educationLevel = 'Graduate (Technical)';
      sampleCand.experienceYears = 1;
      sampleCand.resumeBio = 'Junior Software Engineer with foundation in Python programming and relational databases. Aspiring Python Developer looking to master modern web frameworks and containerization.';
      modified = true;
    }

    // Deduplicate job required skills
    for (const job of this.db.jobs) {
      if (job.requiredSkills && job.requiredSkills.length > 0) {
        const seen = new Set<string>();
        const uniqueReqs = [];
        for (const req of job.requiredSkills) {
          if (!seen.has(req.skillId)) {
            seen.add(req.skillId);
            uniqueReqs.push(req);
          } else {
            modified = true;
          }
        }
        job.requiredSkills = uniqueReqs;
      }
    }

    // Deduplicate candidate skills
    for (const cand of this.db.candidates) {
      if (cand.currentSkillIds && cand.currentSkillIds.length > 0) {
        const unique = Array.from(new Set(cand.currentSkillIds));
        if (unique.length !== cand.currentSkillIds.length) {
          cand.currentSkillIds = unique;
          modified = true;
        }
      }
    }

    // Deduplicate course skills
    for (const crs of this.db.courses) {
      if (crs.coveredSkills && crs.coveredSkills.length > 0) {
        const seen = new Set<string>();
        const uniqueSkills = [];
        for (const cs of crs.coveredSkills) {
          if (!seen.has(cs.skillId)) {
            seen.add(cs.skillId);
            uniqueSkills.push(cs);
          } else {
            modified = true;
          }
        }
        crs.coveredSkills = uniqueSkills;
      }
    }

    if (modified) {
      this.db.datasetMetadata.totalRecords.skills = this.db.skills.length;
      this.saveToFileSync();
    }
  }

  public resetToSeed(): AppDatabase {
    this.db = generateSeedData();
    this.ensureCoreIntegrity();
    this.saveToFileSync();
    console.log(`[Database] Seeded database with ${this.db.jobs.length} jobs, ${this.db.skills.length} skills, ${this.db.candidates.length} candidates.`);
    return this.db;
  }

  public saveCurrentDb(): void {
    this.saveToFileSync();
  }

  public getIngestionHistory() {
    return this.getFullDb().ingestionHistory || [];
  }

  private saveToFileSync(): void {
    if (!this.db) return;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Failed to write database.json:', err);
    }
  }

  private scheduleSave(): void {
    if (this.isSaving) return;
    this.isSaving = true;
    setTimeout(() => {
      this.saveToFileSync();
      this.isSaving = false;
    }, 100);
  }

  // Getters
  public getFullDb(): AppDatabase {
    if (!this.db) this.init();
    return this.db!;
  }

  public getMetadata() {
    return this.getFullDb().datasetMetadata;
  }

  public getDistricts() {
    return this.getFullDb().districts;
  }

  public getSectors() {
    return this.getFullDb().sectors;
  }

  public getSkillCategories() {
    return this.getFullDb().skillCategories;
  }

  public getSkills(options?: { categoryId?: string; sectorId?: string; isEmerging?: boolean; search?: string }) {
    let list = this.getFullDb().skills;
    if (options?.categoryId) list = list.filter(s => s.categoryId === options.categoryId);
    if (options?.sectorId) list = list.filter(s => s.sectorIds.includes(options.sectorId!));
    if (options?.isEmerging !== undefined) list = list.filter(s => s.isEmerging === options.isEmerging);
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.aliases.some(a => a.toLowerCase().includes(q)));
    }
    return list;
  }

  public getSkillById(id: string) {
    return this.getFullDb().skills.find(s => s.id === id);
  }

  public getJobRoles(sectorId?: string) {
    let list = this.getFullDb().jobRoles;
    if (sectorId) list = list.filter(r => r.sectorId === sectorId);
    return list;
  }

  public getEmployers(districtId?: string, sectorId?: string) {
    let list = this.getFullDb().employers;
    if (districtId) list = list.filter(e => e.districtId === districtId);
    if (sectorId) list = list.filter(e => e.sectorId === sectorId);
    return list;
  }

  public getEmployerById(id: string) {
    return this.getFullDb().employers.find(e => e.id === id);
  }

  public createEmployer(data: Omit<Employer, 'id' | 'isVerified'>): Employer {
    const db = this.getFullDb();
    const newId = `emp-${String(db.employers.length + 1).padStart(3, '0')}`;
    const newEmp: Employer = {
      ...data,
      id: newId,
      isVerified: true
    };
    db.employers.unshift(newEmp);
    db.datasetMetadata.totalRecords.employers = db.employers.length;
    this.scheduleSave();
    return newEmp;
  }

  public updateEmployer(id: string, updates: Partial<Employer>): Employer | null {
    const db = this.getFullDb();
    const emp = db.employers.find(e => e.id === id);
    if (!emp) return null;
    Object.assign(emp, updates);
    this.scheduleSave();
    return emp;
  }

  public getJobs(options?: {
    districtId?: string;
    sectorId?: string;
    jobRoleId?: string;
    employerId?: string;
    status?: string;
    minSalary?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    let list = this.getFullDb().jobs;
    if (options?.districtId) list = list.filter(j => j.districtId === options.districtId);
    if (options?.sectorId) list = list.filter(j => j.sectorId === options.sectorId);
    if (options?.jobRoleId) list = list.filter(j => j.jobRoleId === options.jobRoleId);
    if (options?.employerId) list = list.filter(j => j.employerId === options.employerId);
    if (options?.status) list = list.filter(j => j.status === options.status);
    if (options?.minSalary) list = list.filter(j => j.maxSalaryINR >= options.minSalary!);
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(j => j.title.toLowerCase().includes(q) || j.description.toLowerCase().includes(q));
    }

    const total = list.length;
    const offset = options?.offset || 0;
    const limit = options?.limit || 100;
    const items = list.slice(offset, offset + limit);

    return { items, total, offset, limit };
  }

  public getJobById(id: string) {
    return this.getFullDb().jobs.find(j => j.id === id);
  }

  public createJob(jobData: Omit<Job, 'id' | 'postedDate'> & { source?: Job['source'] }): Job {
    const db = this.getFullDb();
    const newId = `job-${String(db.jobs.length + 1).padStart(4, '0')}`;
    const newJob: Job = {
      ...jobData,
      id: newId,
      postedDate: new Date().toISOString(),
      source: jobData.source || 'Direct Employer Post'
    };
    db.jobs.unshift(newJob);
    db.datasetMetadata.totalRecords.jobs = db.jobs.length;
    this.scheduleSave();
    return newJob;
  }

  public getInstitutes(districtId?: string) {
    let list = this.getFullDb().institutes;
    if (districtId) list = list.filter(i => i.districtId === districtId);
    return list;
  }

  public getInstituteById(id: string) {
    return this.getFullDb().institutes.find(i => i.id === id);
  }

  public createInstitute(data: Omit<TrainingInstitute, 'id'>): TrainingInstitute {
    const db = this.getFullDb();
    const newId = `inst-${String(db.institutes.length + 1).padStart(2, '0')}`;
    const newInst: TrainingInstitute = {
      ...data,
      id: newId
    };
    db.institutes.unshift(newInst);
    this.scheduleSave();
    return newInst;
  }

  public updateInstitute(id: string, updates: Partial<TrainingInstitute>): TrainingInstitute | null {
    const db = this.getFullDb();
    const inst = db.institutes.find(i => i.id === id);
    if (!inst) return null;
    Object.assign(inst, updates);
    this.scheduleSave();
    return inst;
  }

  public getCourses(options?: { districtId?: string; sectorId?: string; instituteId?: string; minHealth?: number }) {
    let list = this.getFullDb().courses;
    if (options?.districtId) list = list.filter(c => c.districtId === options.districtId);
    if (options?.sectorId) list = list.filter(c => c.sectorId === options.sectorId);
    if (options?.instituteId) list = list.filter(c => c.instituteId === options.instituteId);
    if (options?.minHealth !== undefined) list = list.filter(c => c.healthScore >= options.minHealth!);
    return list;
  }

  public getCourseById(id: string) {
    return this.getFullDb().courses.find(c => c.id === id);
  }

  public createCourse(data: Omit<Course, 'id' | 'currentEnrolled' | 'graduatedLastYear' | 'healthScore' | 'lastCurriculumReviewDate'> & { healthScore?: number }): Course {
    const db = this.getFullDb();
    const newId = `crs-${String(db.courses.length + 1).padStart(3, '0')}`;
    const newCourse: Course = {
      ...data,
      id: newId,
      currentEnrolled: 0,
      graduatedLastYear: 0,
      healthScore: data.healthScore !== undefined ? data.healthScore : 90,
      lastCurriculumReviewDate: new Date().toISOString().split('T')[0]
    };
    db.courses.unshift(newCourse);
    db.datasetMetadata.totalRecords.courses = db.courses.length;
    this.scheduleSave();
    return newCourse;
  }

  public updateCourseModules(courseId: string, modules: Course['curriculumModules'], newHealthScore?: number): Course | null {
    const db = this.getFullDb();
    const course = db.courses.find(c => c.id === courseId);
    if (!course) return null;
    course.curriculumModules = modules;
    if (newHealthScore !== undefined) {
      course.healthScore = newHealthScore;
    }
    course.lastCurriculumReviewDate = new Date().toISOString().split('T')[0];
    this.scheduleSave();
    return course;
  }

  public getTrainers(instituteId?: string): Trainer[] {
    let list = this.getFullDb().trainers;
    if (instituteId) list = list.filter(t => t.instituteId === instituteId);
    return list;
  }

  public createTrainer(data: Omit<Trainer, 'id'>): Trainer {
    const db = this.getFullDb();
    const newId = `tr-${data.instituteId}-${Date.now().toString().slice(-4)}`;
    const newTrainer: Trainer = {
      ...data,
      id: newId
    };
    db.trainers.unshift(newTrainer);
    this.scheduleSave();
    return newTrainer;
  }

  public getEquipment(instituteId?: string): InstituteEquipment[] {
    const db = this.getFullDb();
    if (!db.equipment) db.equipment = [];
    let list = db.equipment;
    if (instituteId) list = list.filter(e => e.instituteId === instituteId);
    return list;
  }

  public createEquipment(data: Omit<InstituteEquipment, 'id'>): InstituteEquipment {
    const db = this.getFullDb();
    if (!db.equipment) db.equipment = [];
    const newId = `eq-${data.instituteId}-${Date.now().toString().slice(-4)}`;
    const newEq: InstituteEquipment = {
      ...data,
      id: newId
    };
    db.equipment.unshift(newEq);
    this.scheduleSave();
    return newEq;
  }

  public updateEquipment(id: string, updates: Partial<InstituteEquipment>): InstituteEquipment | null {
    const db = this.getFullDb();
    if (!db.equipment) return null;
    const item = db.equipment.find(e => e.id === id);
    if (!item) return null;
    Object.assign(item, updates);
    this.scheduleSave();
    return item;
  }

  public getCandidates(options?: { districtId?: string; sectorId?: string; status?: string; search?: string }) {
    let list = this.getFullDb().candidates;
    if (options?.districtId) list = list.filter(c => c.districtId === options.districtId);
    if (options?.sectorId) list = list.filter(c => c.targetSectorId === options.sectorId);
    if (options?.status) list = list.filter(c => c.status === options.status);
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
    }
    return list;
  }

  public getCandidateById(id: string) {
    return this.getFullDb().candidates.find(c => c.id === id);
  }

  public createCandidate(data: Omit<Candidate, 'id' | 'registrationDate'>): Candidate {
    const db = this.getFullDb();
    const newId = `cand-${String(db.candidates.length + 1).padStart(3, '0')}`;
    const newCand: Candidate = {
      ...data,
      id: newId,
      registrationDate: new Date().toISOString().split('T')[0]
    };
    db.candidates.unshift(newCand);
    db.datasetMetadata.totalRecords.candidates = db.candidates.length;
    this.scheduleSave();
    return newCand;
  }

  public updateCandidate(id: string, updates: Partial<Candidate>): Candidate | null {
    const db = this.getFullDb();
    const cand = db.candidates.find(c => c.id === id);
    if (!cand) return null;
    Object.assign(cand, updates);
    this.scheduleSave();
    return cand;
  }

  public updateCandidateSkills(id: string, skillIds: string[]): Candidate | null {
    const db = this.getFullDb();
    const cand = db.candidates.find(c => c.id === id);
    if (!cand) return null;
    cand.currentSkillIds = skillIds;
    this.scheduleSave();
    return cand;
  }

  public getPlacements(districtId?: string, sectorId?: string) {
    const db = this.getFullDb();
    let list = db.placements;
    if (districtId) {
      const distInstitutes = new Set(db.institutes.filter(i => i.districtId === districtId).map(i => i.id));
      list = list.filter(p => distInstitutes.has(p.instituteId));
    }
    if (sectorId) {
      const secCourses = new Set(db.courses.filter(c => c.sectorId === sectorId).map(c => c.id));
      list = list.filter(p => secCourses.has(p.courseId));
    }
    return list;
  }

  public getEmployerSurveys(districtId?: string, sectorId?: string) {
    let list = this.getFullDb().employerSurveys;
    if (districtId) list = list.filter(s => s.districtId === districtId);
    if (sectorId) list = list.filter(s => s.sectorId === sectorId);
    return list;
  }

  public createEmployerSurvey(data: Omit<EmployerSurvey, 'id' | 'surveyDate'>): EmployerSurvey {
    const db = this.getFullDb();
    const newId = `srv-${String(db.employerSurveys.length + 1).padStart(3, '0')}`;
    const survey: EmployerSurvey = {
      ...data,
      id: newId,
      surveyDate: new Date().toISOString().split('T')[0]
    };
    db.employerSurveys.unshift(survey);
    db.datasetMetadata.totalRecords.surveys = db.employerSurveys.length;
    this.scheduleSave();
    return survey;
  }

  public getTrainingCapacity(districtId?: string, sectorId?: string) {
    let list = this.getFullDb().trainingCapacity;
    if (districtId) list = list.filter(c => c.districtId === districtId);
    if (sectorId) list = list.filter(c => c.sectorId === sectorId);
    return list;
  }

  public updateCapacitySeats(id: string, additionalSeats: number): TrainingCapacity | null {
    const db = this.getFullDb();
    const cap = db.trainingCapacity.find(c => c.id === id);
    if (!cap) return null;
    cap.totalSanctionedSeats += additionalSeats;
    cap.vacantSeats += additionalSeats;
    cap.utilizationPercentage = Math.round((cap.enrolledSeats / cap.totalSanctionedSeats) * 100);
    this.scheduleSave();
    return cap;
  }

  public getUsers() {
    return this.getFullDb().users;
  }
}

export const dbStore = new DatabaseStore();
