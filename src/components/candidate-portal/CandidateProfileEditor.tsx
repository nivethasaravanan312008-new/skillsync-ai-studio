/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Save,
  CheckCircle2,
  Sparkles,
  Plus,
  X,
  Code
} from 'lucide-react';
import { Candidate, District, Sector, JobRole, Skill } from '../../types/dataModel.ts';

interface CandidateProfileEditorProps {
  candidate: Candidate;
  districts: District[];
  sectors: Sector[];
  jobRoles: JobRole[];
  allSkills: Skill[];
  onSave: (updatedCandidate: Candidate) => Promise<void>;
  onSelectCandidate: (candidateId: string) => void;
  availableCandidates: Candidate[];
}

export const CandidateProfileEditor: React.FC<CandidateProfileEditorProps> = ({
  candidate,
  districts,
  sectors,
  jobRoles,
  allSkills,
  onSave,
  onSelectCandidate,
  availableCandidates
}) => {
  const [formData, setFormData] = useState<Candidate>({ ...candidate });
  const [skillSearch, setSkillSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if external candidate selection changes
  React.useEffect(() => {
    setFormData({ ...candidate });
    setSaveSuccess(false);
  }, [candidate.id]);

  const currentSectorRoles = jobRoles.filter(r => r.sectorId === formData.targetSectorId);

  const handleFieldChange = (field: keyof Candidate, value: any) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      // If sector changes, default targetJobRoleId to the first role in that sector
      if (field === 'targetSectorId') {
        const matchingRoles = jobRoles.filter(r => r.sectorId === value);
        if (matchingRoles.length > 0 && !matchingRoles.some(r => r.id === prev.targetJobRoleId)) {
          next.targetJobRoleId = matchingRoles[0].id;
        }
      }
      return next;
    });
    setSaveSuccess(false);
  };

  const handleAddSkill = (skillId: string) => {
    if (!formData.currentSkillIds.includes(skillId)) {
      setFormData(prev => ({
        ...prev,
        currentSkillIds: [...prev.currentSkillIds, skillId]
      }));
      setSkillSearch('');
      setSaveSuccess(false);
    }
  };

  const handleRemoveSkill = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      currentSkillIds: prev.currentSkillIds.filter(id => id !== skillId)
    }));
    setSaveSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      alert('Failed to update candidate profile: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSkillOptions = allSkills
    .filter(s => !formData.currentSkillIds.includes(s.id))
    .filter(s => skillSearch === '' || s.name.toLowerCase().includes(skillSearch.toLowerCase()) || (s.code && s.code.toLowerCase().includes(skillSearch.toLowerCase())))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Top Bar: Switch Active Demo Candidate & Quick Stats */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20">
            {formData.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{formData.name}</h2>
              <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[11px] px-2 py-0.5 rounded-full font-medium">
                {formData.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>{formData.email}</span>
              <span>&bull;</span>
              <span>{districts.find(d => d.id === formData.districtId)?.name || 'Maharashtra'}</span>
              <span>&bull;</span>
              <span>{formData.educationLevel}</span>
            </p>
          </div>
        </div>

        {/* Quick Switcher for Testing Different Candidate Profiles */}
        <div className="flex items-center gap-2 self-stretch md:self-auto bg-slate-900/90 border border-slate-700/60 p-2 rounded-xl">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap pl-1">Switch Candidate:</span>
          <select
            value={formData.id}
            onChange={(e) => onSelectCandidate(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            {availableCandidates.slice(0, 25).map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({jobRoles.find(r => r.id === c.targetJobRoleId)?.title || 'Technical Specialist'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-600/60 text-emerald-200 px-4 py-3 rounded-xl flex items-center gap-2 text-sm shadow-lg animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Profile and career preferences successfully updated! Career matches and skill gaps have been dynamically recalculated.</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="border-b border-slate-700/80 pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Candidate Profile & Preferences
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Update personal info, qualifications, current technical skills, experience, and career aspirations.
            </p>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition cursor-pointer"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Aditya Kadam"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. aditya@gmail.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Contact Phone
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="+91 9876543210"
            />
          </div>

          {/* Preferred District */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Preferred Maharashtra District
            </label>
            <select
              value={formData.districtId}
              onChange={(e) => handleFieldChange('districtId', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              {districts.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.division} Division)
                </option>
              ))}
            </select>
          </div>

          {/* Qualification */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              Educational Qualification
            </label>
            <select
              value={formData.educationLevel}
              onChange={(e) => handleFieldChange('educationLevel', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              <option value="10th Pass">10th Pass</option>
              <option value="12th Pass">12th Pass</option>
              <option value="ITI Diploma">ITI Technical Diploma</option>
              <option value="Polytechnic">State Polytechnic Diploma</option>
              <option value="Graduate (Technical)">Graduate (BE / B.Tech / BCA / B.Sc)</option>
              <option value="Graduate (Non-Technical)">Graduate (B.Com / BA / BBA)</option>
            </select>
          </div>

          {/* Experience Years */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              Prior Work Experience (Years)
            </label>
            <select
              value={formData.experienceYears}
              onChange={(e) => handleFieldChange('experienceYears', Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              <option value={0}>0 Years (Fresher / Fresh Graduate)</option>
              <option value={1}>1 Year (Junior / Apprentice)</option>
              <option value={2}>2 Years</option>
              <option value={3}>3 Years</option>
              <option value={4}>4+ Years (Mid-level Experienced)</option>
            </select>
          </div>

          {/* Preferred Sector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              Preferred Sector (Aspiration)
            </label>
            <select
              value={formData.targetSectorId}
              onChange={(e) => handleFieldChange('targetSectorId', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              {sectors.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Career Interest: Target Job Role */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              Target Career Role Interest
            </label>
            <select
              value={formData.targetJobRoleId}
              onChange={(e) => handleFieldChange('targetJobRoleId', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer font-medium"
            >
              {jobRoles.map(r => (
                <option key={r.id} value={r.id}>
                  {r.title} &bull; {sectors.find(s => s.id === r.sectorId)?.name || 'Industry'} &bull; Avg ₹{(r.averageSalaryINR / 100000).toFixed(1)} LPA
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Skills Section */}
        <div className="border-t border-slate-700/80 pt-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                Current Technical & Professional Skills
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Add skills you already possess. The match engine compares these against job-role requirements.
              </p>
            </div>
            <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
              Possessed Skills: <strong className="text-cyan-300">{formData.currentSkillIds.length}</strong>
            </span>
          </div>

          {/* Badges of possessed skills */}
          <div className="flex flex-wrap gap-2 min-h-12 p-3 bg-slate-900/80 border border-slate-700/70 rounded-xl">
            {formData.currentSkillIds.length === 0 ? (
              <p className="text-xs text-slate-500 italic flex items-center gap-1.5">
                No skills added yet. Select or search from the repository below.
              </p>
            ) : (
              formData.currentSkillIds.map(skId => {
                const skill = allSkills.find(s => s.id === skId);
                return (
                  <span
                    key={skId}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-950/80 text-blue-200 border border-blue-700/60 rounded-lg text-xs font-medium shadow-sm"
                  >
                    <span>{skill ? skill.name : skId}</span>
                    {skill?.code && (
                      <span className="text-[10px] text-blue-400 font-mono">({skill.code})</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skId)}
                      className="text-blue-400 hover:text-rose-400 transition cursor-pointer ml-1"
                      title="Remove skill"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                );
              })
            )}
          </div>

          {/* Add skill input & suggestions */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                placeholder="Search skills to add (e.g. Python, SQL, Git, Docker, REST APIs, Fast API, CNC, EV Battery)..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>

            {skillSearch && (
              <div className="p-3 bg-slate-900/90 border border-slate-700 rounded-xl space-y-1.5 max-h-48 overflow-y-auto">
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                  Matching Skills in Taxonomy:
                </p>
                {filteredSkillOptions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No unselected skills match "{skillSearch}"</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredSkillOptions.map(sk => (
                      <button
                        key={sk.id}
                        type="button"
                        onClick={() => handleAddSkill(sk.id)}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 text-left transition cursor-pointer"
                      >
                        <div className="truncate mr-2">
                          <p className="text-xs text-slate-200 font-medium truncate">{sk.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">NSQF {sk.nsqfLevel} &bull; {sk.code}</p>
                        </div>
                        <Plus className="w-4 h-4 text-cyan-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Resume Bio */}
        <div className="border-t border-slate-700/80 pt-5">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Professional Summary & Bio
          </label>
          <textarea
            rows={3}
            value={formData.resumeBio}
            onChange={(e) => handleFieldChange('resumeBio', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
            placeholder="Describe your practical interests, vocational coursework, or target career aspirations..."
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition cursor-pointer"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Saving Profile...' : 'Save & Recalculate Career Matches'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
