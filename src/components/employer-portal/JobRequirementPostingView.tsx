/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  Sparkles,
  DollarSign,
  MapPin,
  Clock,
  Trash2,
  HelpCircle,
  Send,
  ShieldCheck
} from 'lucide-react';
import {
  District,
  Sector,
  JobRole,
  Skill,
  Employer,
  SkillImportanceLevel,
  EmployerJobSubmissionRequest
} from '../../types/dataModel.ts';

interface JobRequirementPostingViewProps {
  employer: Employer;
  districts: District[];
  sectors: Sector[];
  jobRoles: JobRole[];
  allSkills: Skill[];
  onJobSubmitted: (newJob: any) => void;
  onCancel?: () => void;
}

interface SkillValidationRow {
  skillId: string;
  importance: SkillImportanceLevel; // 'critical' | 'important' | 'nice_to_have'
  minProficiency: 'basic' | 'intermediate' | 'advanced';
  yearsExperience: number;
}

export const JobRequirementPostingView: React.FC<JobRequirementPostingViewProps> = ({
  employer,
  districts,
  sectors,
  jobRoles,
  allSkills,
  onJobSubmitted,
  onCancel
}) => {
  // Job Requisition State
  const [title, setTitle] = useState('');
  const [selectedSectorId, setSelectedSectorId] = useState(employer.sectorId || sectors[0]?.id || '');
  const [selectedDistrictId, setSelectedDistrictId] = useState(employer.districtId || districts[0]?.id || '');
  const [selectedJobRoleId, setSelectedJobRoleId] = useState('');
  const [openings, setOpenings] = useState<number>(5);
  const [minSalaryINR, setMinSalaryINR] = useState<number>(450000);
  const [maxSalaryINR, setMaxSalaryINR] = useState<number>(850000);
  const [experienceRequiredYears, setExperienceRequiredYears] = useState<number>(2);
  const [educationRequired, setEducationRequired] = useState('Bachelor of Engineering / Diploma / ITI Graduate');
  const [employmentType, setEmploymentType] = useState<'Full-time' | 'Apprenticeship' | 'Contract'>('Full-time');
  const [isRemoteFriendly, setIsRemoteFriendly] = useState<boolean>(false);
  const [description, setDescription] = useState('');

  // Skill Validation Workflow State
  const [skillRows, setSkillRows] = useState<SkillValidationRow[]>([]);
  const [searchSkillTerm, setSearchSkillTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Available roles for the selected sector
  const filteredRoles = jobRoles.filter(r => !selectedSectorId || r.sectorId === selectedSectorId);

  // When job role changes, auto-populate recommended skills for quick validation
  const handleRoleChange = (roleId: string) => {
    setSelectedJobRoleId(roleId);
    const role = jobRoles.find(r => r.id === roleId);
    if (role && !title) {
      setTitle(role.title);
    }

    if (role && role.defaultSkillIds.length > 0) {
      // Pre-seed skills with default importance if no skills selected yet
      const seededRows: SkillValidationRow[] = role.defaultSkillIds.map((skId, idx) => ({
        skillId: skId,
        importance: idx < 2 ? 'critical' : idx < 4 ? 'important' : 'nice_to_have',
        minProficiency: idx < 2 ? 'intermediate' : 'basic',
        yearsExperience: 1
      }));
      setSkillRows(seededRows);
    }
  };

  const handleAddSkill = (skillId: string) => {
    if (!skillId) return;
    if (skillRows.some(r => r.skillId === skillId)) return;

    setSkillRows(prev => [
      ...prev,
      {
        skillId,
        importance: 'important',
        minProficiency: 'intermediate',
        yearsExperience: 1
      }
    ]);
    setSearchSkillTerm('');
  };

  const handleRemoveSkill = (skillId: string) => {
    setSkillRows(prev => prev.filter(r => r.skillId !== skillId));
  };

  const handleUpdateImportance = (skillId: string, importance: SkillImportanceLevel) => {
    setSkillRows(prev =>
      prev.map(r => (r.skillId === skillId ? { ...r, importance } : r))
    );
  };

  const handleUpdateProficiency = (skillId: string, minProficiency: 'basic' | 'intermediate' | 'advanced') => {
    setSkillRows(prev =>
      prev.map(r => (r.skillId === skillId ? { ...r, minProficiency } : r))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a job title');
      return;
    }
    if (skillRows.length === 0) {
      setErrorMsg('Please select and validate at least one skill requirement');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const payload: EmployerJobSubmissionRequest = {
        employerId: employer.id,
        title: title.trim(),
        jobRoleId: selectedJobRoleId || filteredRoles[0]?.id || 'jr-swe-01',
        sectorId: selectedSectorId,
        districtId: selectedDistrictId,
        openings: Number(openings) || 1,
        minSalaryINR: Number(minSalaryINR) || 300000,
        maxSalaryINR: Number(maxSalaryINR) || 600000,
        experienceRequiredYears: Number(experienceRequiredYears) || 0,
        educationRequired,
        employmentType,
        isRemoteFriendly,
        description: description || `Direct employer hiring requirement for ${title} at ${employer.name}.`,
        requiredSkills: skillRows.map(r => ({
          skillId: r.skillId,
          importance: r.importance,
          minProficiency: r.minProficiency
        }))
      };

      const res = await fetch('/api/employer-portal/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to submit job requirement');
      }

      const createdJob = await res.json();
      setSuccessMsg(`Job Requirement for "${createdJob.title}" posted successfully with ${skillRows.length} validated skills!`);
      setTimeout(() => {
        onJobSubmitted(createdJob);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error submitting job requirement');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter skills for quick search
  const filteredSkills = allSkills
    .filter(s =>
      !skillRows.some(r => r.skillId === s.id) &&
      (s.name.toLowerCase().includes(searchSkillTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchSkillTerm.toLowerCase()))
    )
    .slice(0, 10);

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-700/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Post Job Requirement & Skill Validation Workflow</h2>
            <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-mono uppercase">
              Direct Employer Intake
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Submit verified hiring requisitions into the Maharashtra Labour Market Intelligence system. Classify competencies as <strong className="text-rose-400">Critical</strong>, <strong className="text-amber-400">Important</strong>, or <strong className="text-cyan-400">Nice-to-have</strong> to directly influence institutional curriculum planning.
          </p>
        </div>

        {/* Demo Data Clarity Badge */}
        <div className="flex items-center gap-2 bg-slate-900 border border-indigo-700/60 px-3 py-1.5 rounded-xl text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Source Tracking</span>
            <span className="text-slate-200 font-medium">Flagged as <strong>Direct Employer Post</strong></span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-700/70 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-950/60 border border-rose-700/70 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Job Requisition Parameters */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-[10px]">1</span>
            Job Core Specifications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Cloud DevOps Engineer"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Standardized Job Role *</label>
              <select
                value={selectedJobRoleId}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value="">-- Choose Standardized Role --</option>
                {filteredRoles.map(r => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Industry Sector *</label>
              <select
                value={selectedSectorId}
                onChange={(e) => setSelectedSectorId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                {sectors.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Maharashtra District *</label>
              <select
                value={selectedDistrictId}
                onChange={(e) => setSelectedDistrictId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                {districts.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Total Openings *</label>
              <input
                type="number"
                min={1}
                max={500}
                value={openings}
                onChange={(e) => setOpenings(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Experience (Years) *</label>
              <input
                type="number"
                min={0}
                max={15}
                value={experienceRequiredYears}
                onChange={(e) => setExperienceRequiredYears(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Salary Range Min (INR/yr)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-500">₹</span>
                <input
                  type="number"
                  step={25000}
                  value={minSalaryINR}
                  onChange={(e) => setMinSalaryINR(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Salary Range Max (INR/yr)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-500">₹</span>
                <input
                  type="number"
                  step={25000}
                  value={maxSalaryINR}
                  onChange={(e) => setMaxSalaryINR(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Employment Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value="Full-time">Full-time Regular</option>
                <option value="Apprenticeship">Apprenticeship (NAPS/NEEM)</option>
                <option value="Contract">Fixed Term Contract</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Job Description & Responsibilities</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe day-to-day responsibilities, lab expectations, shift structure..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Section 2: Skill Validation Workflow (Critical, Important, Nice-to-Have) */}
        <div className="space-y-4 pt-4 border-t border-slate-700/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                Skill Validation Workflow (Weight Grading)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Classify each requirement as <strong className="text-rose-400">Critical Skill</strong> (strict requirement), <strong className="text-amber-400">Important Skill</strong> (strong preference), or <strong className="text-cyan-400">Nice-to-have Skill</strong> (bonus).
              </p>
            </div>

            <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-700 self-start sm:self-auto font-mono">
              Validated Skills: <strong className="text-white">{skillRows.length}</strong>
            </span>
          </div>

          {/* Quick Skill Search & Add */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-3.5 space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Add Technical Competencies from Maharashtra Taxonomy:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchSkillTerm}
                onChange={(e) => setSearchSkillTerm(e.target.value)}
                placeholder="Search skill by name (e.g., Python, Docker, CNC Milling, PLC Programming, Git)..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {searchSkillTerm.trim().length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {filteredSkills.length === 0 ? (
                  <span className="text-[11px] text-slate-500 italic">No matching skills found in taxonomy.</span>
                ) : (
                  filteredSkills.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleAddSkill(s.id)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-900/60 border border-slate-700 hover:border-indigo-600 rounded-lg text-xs text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{s.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">L{s.nsqfLevel}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Skill Validation Table */}
          {skillRows.length === 0 ? (
            <div className="bg-slate-900/50 border border-dashed border-slate-700 rounded-xl p-8 text-center text-slate-500 text-xs">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              Select a standardized job role above or search skills to begin the skill validation workflow.
            </div>
          ) : (
            <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-900/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-700 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Skill Competency</th>
                    <th className="py-2.5 px-3">Validation Level (Weight)</th>
                    <th className="py-2.5 px-3">Proficiency Required</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {skillRows.map((row, rIdx) => {
                    const skill = allSkills.find(s => s.id === row.skillId);
                    if (!skill) return null;

                    return (
                      <tr key={`job-sk-${row.skillId}-${rIdx}`} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-white">{skill.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                            <span>{skill.code}</span>
                            <span>&bull;</span>
                            <span>NSQF Level {skill.nsqfLevel}</span>
                          </div>
                        </td>

                        {/* Validation Workflow: Critical vs Important vs Nice-to-have */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateImportance(row.skillId, 'critical')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                                row.importance === 'critical'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-600 shadow-sm'
                                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                              }`}
                            >
                              Critical Skill
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUpdateImportance(row.skillId, 'important')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                                row.importance === 'important'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-600 shadow-sm'
                                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                              }`}
                            >
                              Important Skill
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUpdateImportance(row.skillId, 'nice_to_have')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                                row.importance === 'nice_to_have'
                                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-600 shadow-sm'
                                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                              }`}
                            >
                              Nice-to-have
                            </button>
                          </div>
                        </td>

                        {/* Proficiency Dropdown */}
                        <td className="py-3 px-3">
                          <select
                            value={row.minProficiency}
                            onChange={(e) => handleUpdateProficiency(row.skillId, e.target.value as any)}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer"
                          >
                            <option value="basic">Basic Understanding</option>
                            <option value="intermediate">Intermediate Working Knowledge</option>
                            <option value="advanced">Advanced Industry Mastery</option>
                          </select>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(row.skillId)}
                            className="text-slate-500 hover:text-rose-400 transition cursor-pointer p-1 rounded-lg"
                            title="Remove Skill"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/80">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-medium transition cursor-pointer"
            >
              Cancel
            </button>
          )}

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="submit"
              disabled={isSubmitting || skillRows.length === 0}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Validating & Submitting...' : 'Submit Job Requirement'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
