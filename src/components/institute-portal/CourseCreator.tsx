/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookPlus,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Award,
  BookOpen,
  Search
} from 'lucide-react';
import {
  TrainingInstitute,
  Sector,
  District,
  JobRole,
  Skill,
  CreateCourseRequest,
  Course
} from '../../types/dataModel.ts';
import { apiService } from '../../services/apiService.ts';

interface CourseCreatorProps {
  institute: TrainingInstitute;
  sectors: Sector[];
  districts: District[];
  jobRoles: JobRole[];
  skills: Skill[];
  onCourseCreated: (course: Course) => void;
}

export const CourseCreator: React.FC<CourseCreatorProps> = ({
  institute,
  sectors,
  districts,
  jobRoles,
  skills,
  onCourseCreated
}) => {
  const [sectorId, setSectorId] = useState<string>(sectors[0]?.id || 'sec-auto');
  const [districtId, setDistrictId] = useState<string>(institute.districtId);
  const [courseCode, setCourseCode] = useState<string>('CRS-MH-');
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [nsqfLevel, setNsqfLevel] = useState<number>(5);
  const [durationHours, setDurationHours] = useState<number>(480);
  const [annualCapacity, setAnnualCapacity] = useState<number>(60);
  const [feeStructureINR, setFeeStructureINR] = useState<number>(3500);
  const [certificationBody, setCertificationBody] = useState<string>('MSBTE & NCVET Accredited');
  const [targetJobRoleId, setTargetJobRoleId] = useState<string>('');

  // Course Skills
  const [selectedSkills, setSelectedSkills] = useState<Array<{
    skillId: string;
    proficiencyGoal: 'basic' | 'intermediate' | 'advanced';
    theoryHours: number;
    practicalHours: number;
  }>>([]);

  const [skillSearchQuery, setSkillSearchQuery] = useState<string>('');

  // Curriculum Modules
  const [modules, setModules] = useState<Array<{
    moduleNumber: number;
    title: string;
    description: string;
    durationHours: number;
    skillIds: string[];
    isOutdated: boolean;
  }>>([
    {
      moduleNumber: 1,
      title: 'Foundational Theory, Safety & Core Principles',
      description: 'Orientation, industry standards, hazard control, and operational safety protocols.',
      durationHours: 60,
      skillIds: [],
      isOutdated: false
    },
    {
      moduleNumber: 2,
      title: 'Hands-on Lab Practice & Equipment Operation',
      description: 'Rigorous workshop exercises, parameter optimization, and machine tooling.',
      durationHours: 140,
      skillIds: [],
      isOutdated: false
    }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter roles and skills by selected sector
  const availableRoles = jobRoles.filter(r => r.sectorId === sectorId);
  const availableSkills = skills.filter(s => s.sectorIds.includes(sectorId));

  // Set default role when sector changes
  React.useEffect(() => {
    if (availableRoles.length > 0 && !availableRoles.some(r => r.id === targetJobRoleId)) {
      setTargetJobRoleId(availableRoles[0].id);
    }
  }, [sectorId, availableRoles]);

  const handleAddSkill = (skillId: string) => {
    if (selectedSkills.some(s => s.skillId === skillId)) return;
    setSelectedSkills([
      ...selectedSkills,
      {
        skillId,
        proficiencyGoal: 'intermediate',
        theoryHours: 40,
        practicalHours: 80
      }
    ]);
  };

  const handleRemoveSkill = (skillId: string) => {
    setSelectedSkills(selectedSkills.filter(s => s.skillId !== skillId));
  };

  const handleAddModule = () => {
    const nextNum = modules.length + 1;
    setModules([
      ...modules,
      {
        moduleNumber: nextNum,
        title: `Module ${nextNum}: Advanced Industry Application`,
        description: 'Comprehensive practical project and diagnostic assessment.',
        durationHours: 80,
        skillIds: selectedSkills.slice(0, 2).map(s => s.skillId),
        isOutdated: false
      }
    ]);
  };

  const handleRemoveModule = (idx: number) => {
    const next = modules.filter((_, i) => i !== idx).map((m, i) => ({
      ...m,
      moduleNumber: i + 1
    }));
    setModules(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (!courseTitle.trim()) throw new Error('Please specify a Course Title');
      if (!courseCode.trim()) throw new Error('Please specify a Course Code');
      if (selectedSkills.length === 0) throw new Error('Please add at least one Skill to the Course curriculum');
      if (modules.length === 0) throw new Error('Please define at least one Curriculum Module');

      const payload: CreateCourseRequest = {
        instituteId: institute.id,
        code: courseCode,
        title: courseTitle,
        districtId,
        sectorId,
        nsqfLevel,
        durationHours,
        annualBatchCapacity: annualCapacity,
        feeStructureINR,
        certificationBody,
        targetJobRoleId: targetJobRoleId || availableRoles[0]?.id || 'jr-general-tech',
        coveredSkills: selectedSkills,
        curriculumModules: modules
      };

      const created = await apiService.addInstituteCourse(payload);
      setSuccessMsg(`Course "${created.title}" successfully added and integrated with Industry Alignment matrix!`);
      onCourseCreated(created);

      // Reset form
      setCourseTitle('');
      setCourseCode(`CRS-MH-${Math.floor(100 + Math.random() * 900)}`);
      setSelectedSkills([]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
      <div className="pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <BookPlus className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">Add New Vocational / Technical Course</h2>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Specify course competencies, NSQF alignment, curriculum modules, and annual batch intake capacity.
        </p>
      </div>

      {successMsg && (
        <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-sm rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 p-3 bg-rose-950/80 border border-rose-700 text-rose-200 text-sm rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Course Core Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Course Title *
            </label>
            <input
              type="text"
              value={courseTitle}
              onChange={e => setCourseTitle(e.target.value)}
              placeholder="e.g., EV Powertrain Diagnostics & High Voltage Battery Maintenance"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Course Code *
            </label>
            <input
              type="text"
              value={courseCode}
              onChange={e => setCourseCode(e.target.value)}
              placeholder="CRS-AUTO-EV-02"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Industry Sector
            </label>
            <select
              value={sectorId}
              onChange={e => setSectorId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {sectors.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              District Campus Location
            </label>
            <select
              value={districtId}
              onChange={e => setDistrictId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {districts.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Target Job Role (Career Outcome)
            </label>
            <select
              value={targetJobRoleId}
              onChange={e => setTargetJobRoleId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {availableRoles.map(r => (
                <option key={r.id} value={r.id}>
                  {r.title} (Avg: ₹{(r.averageSalaryINR / 100000).toFixed(1)}L/yr)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              NSQF Level (1 to 8)
            </label>
            <select
              value={nsqfLevel}
              onChange={e => setNsqfLevel(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value={3}>NSQF Level 3 (Basic Tradesman / Semi-Skilled)</option>
              <option value={4}>NSQF Level 4 (ITI Standard Craftsman)</option>
              <option value={5}>NSQF Level 5 (Senior Technician / Diploma)</option>
              <option value={6}>NSQF Level 6 (Advanced Specialist / Tech Lead)</option>
              <option value={7}>NSQF Level 7 (Engineering Graduate)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Annual Batch Capacity (Seats)
            </label>
            <input
              type="number"
              min="15"
              max="600"
              value={annualCapacity}
              onChange={e => setAnnualCapacity(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Total Duration (Hours)
            </label>
            <input
              type="number"
              min="80"
              max="2400"
              value={durationHours}
              onChange={e => setDurationHours(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
        </div>

        {/* Section: Define Course Skills */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Define Course Skills & Learning Outcomes
              </h3>
              <p className="text-xs text-slate-400">
                Select industry skills taught in this curriculum and specify required lab/theory hours.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={skillSearchQuery}
                onChange={e => setSkillSearchQuery(e.target.value)}
                placeholder="Search skills to add..."
                className="w-full bg-slate-950 border border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Quick Skill Tags Selection */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg max-h-36 overflow-y-auto flex flex-wrap gap-1.5 mb-4">
            {availableSkills
              .filter(s => !selectedSkills.some(sel => sel.skillId === s.id))
              .filter(s => !skillSearchQuery || s.name.toLowerCase().includes(skillSearchQuery.toLowerCase()))
              .slice(0, 15)
              .map(sk => (
                <button
                  key={sk.id}
                  type="button"
                  onClick={() => handleAddSkill(sk.id)}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-indigo-950/60 text-slate-300 hover:text-indigo-200 border border-slate-700 hover:border-indigo-500 rounded text-xs font-medium flex items-center gap-1 transition"
                >
                  <Plus className="w-3 h-3 text-indigo-400" />
                  {sk.name}
                  {sk.isEmerging && <span className="text-[10px] text-amber-400 font-bold ml-1">★ New</span>}
                </button>
              ))}
          </div>

          {/* Table of selected skills */}
          {selectedSkills.length === 0 ? (
            <div className="p-4 bg-slate-950/50 border border-dashed border-slate-700 rounded-lg text-center text-xs text-slate-400">
              No skills selected yet. Click any skill tag above to incorporate it into this curriculum.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Skill Name</th>
                    <th className="py-2.5 px-3">Proficiency Target</th>
                    <th className="py-2.5 px-3">Theory Hours</th>
                    <th className="py-2.5 px-3">Practical / Lab Hours</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                  {selectedSkills.map((item, idx) => {
                    const skObj = skills.find(s => s.id === item.skillId);
                    return (
                      <tr key={`crs-sk-${item.skillId}-${idx}`}>
                        <td className="py-2.5 px-3 font-medium text-white">
                          {skObj?.name || item.skillId}
                          {skObj?.isEmerging && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800">
                              Surging
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={item.proficiencyGoal}
                            onChange={e => {
                              const copy = [...selectedSkills];
                              copy[idx].proficiencyGoal = e.target.value as any;
                              setSelectedSkills(copy);
                            }}
                            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          >
                            <option value="basic">Basic (Foundational)</option>
                            <option value="intermediate">Intermediate (Working)</option>
                            <option value="advanced">Advanced (Industry Ready)</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="5"
                            max="300"
                            value={item.theoryHours}
                            onChange={e => {
                              const copy = [...selectedSkills];
                              copy[idx].theoryHours = Number(e.target.value);
                              setSelectedSkills(copy);
                            }}
                            className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="10"
                            max="600"
                            value={item.practicalHours}
                            onChange={e => {
                              const copy = [...selectedSkills];
                              copy[idx].practicalHours = Number(e.target.value);
                              setSelectedSkills(copy);
                            }}
                            className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(item.skillId)}
                            className="p-1 hover:bg-rose-950 text-rose-400 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section: Define Curriculum Modules */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                Define Curriculum Modules
              </h3>
              <p className="text-xs text-slate-400">
                Structure modules in syllabus order with estimated teaching duration.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddModule}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-md border border-slate-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Module
            </button>
          </div>

          <div className="space-y-3">
            {modules.map((mod, idx) => (
              <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-300">
                      Module {mod.moduleNumber}
                    </span>
                    <input
                      type="text"
                      value={mod.title}
                      onChange={e => {
                        const copy = [...modules];
                        copy[idx].title = e.target.value;
                        setModules(copy);
                      }}
                      placeholder="Module Title..."
                      className="bg-transparent font-medium text-sm text-white focus:outline-none focus:border-b border-indigo-500 w-72 md:w-96"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="number"
                        min="10"
                        max="400"
                        value={mod.durationHours}
                        onChange={e => {
                          const copy = [...modules];
                          copy[idx].durationHours = Number(e.target.value);
                          setModules(copy);
                        }}
                        className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white text-center"
                      />
                      <span className="text-xs text-slate-400">hrs</span>
                    </div>

                    {modules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveModule(idx)}
                        className="p-1 hover:bg-rose-950 text-rose-400 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  value={mod.description}
                  onChange={e => {
                    const copy = [...modules];
                    copy[idx].description = e.target.value;
                    setModules(copy);
                  }}
                  rows={2}
                  placeholder="Outline syllabus topics, practical workshop procedures, and terminal competencies..."
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-semibold text-sm shadow-md transition"
          >
            <BookPlus className="w-4 h-4" />
            <span>{isSubmitting ? 'Registering Course...' : 'Register Course into Central Directory'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
