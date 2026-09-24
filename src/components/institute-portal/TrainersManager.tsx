/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  Plus,
  Mail,
  Award,
  Star,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { Trainer, Skill, TrainingInstitute } from '../../types/dataModel.ts';
import { apiService } from '../../services/apiService.ts';

interface TrainersManagerProps {
  institute: TrainingInstitute;
  trainers: Trainer[];
  skills: Skill[];
  onTrainerAdded: (trainer: Trainer) => void;
}

export const TrainersManager: React.FC<TrainersManagerProps> = ({
  institute,
  trainers,
  skills,
  onTrainerAdded
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nsqfLevel, setNsqfLevel] = useState<number>(5);
  const [yearsExperience, setYearsExperience] = useState<number>(6);
  const [rating, setRating] = useState<number>(4.5);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleToggleSkill = (skillId: string) => {
    if (selectedSkillIds.includes(skillId)) {
      setSelectedSkillIds(selectedSkillIds.filter(id => id !== skillId));
    } else {
      setSelectedSkillIds([...selectedSkillIds, skillId]);
    }
  };

  const handleAddTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (!name.trim()) throw new Error('Trainer name is required');
      if (!email.trim()) throw new Error('Trainer official email is required');
      if (selectedSkillIds.length === 0) throw new Error('Please select at least one core specialization skill');

      const created = await apiService.addInstituteTrainer(institute.id, {
        name,
        email,
        certifiedNsqfLevel: nsqfLevel,
        yearsExperience,
        rating,
        specializationSkillIds: selectedSkillIds
      });

      setSuccessMsg(`Instructor "${created.name}" successfully registered and accredited!`);
      onTrainerAdded(created);

      // Reset form
      setName('');
      setEmail('');
      setSelectedSkillIds([]);
      setShowAddForm(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add trainer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Faculty & Certified Instructors</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Maintain Master Trainer profiles, NSQF certified expertise, and instructor domain mappings.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Close Form' : 'Register New Trainer'}
        </button>
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

      {/* Add Trainer Form Modal / Dropdown */}
      {showAddForm && (
        <form onSubmit={handleAddTrainer} className="mt-6 p-5 bg-slate-950/80 border border-slate-700 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            New Faculty Accreditation Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Prof. Rajesh Kulkarni"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Official Email *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="rajesh.kulkarni@iti-aundh.ac.in"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Certified NSQF Level</label>
              <select
                value={nsqfLevel}
                onChange={e => setNsqfLevel(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={5}>NSQF Level 5 (Senior Vocational Trainer)</option>
                <option value={6}>NSQF Level 6 (Lead Instructor / SME)</option>
                <option value={7}>NSQF Level 7 (Master Trainer / Industry Specialist)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Experience (Years)</label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={yearsExperience}
                  onChange={e => setYearsExperience(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Initial Rating (1-5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={e => setRating(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Trainer Specialization & Domain Competencies *
            </label>
            <div className="max-h-32 overflow-y-auto p-2 bg-slate-900 border border-slate-800 rounded-lg flex flex-wrap gap-1.5">
              {skills.slice(0, 30).map(sk => {
                const isSel = selectedSkillIds.includes(sk.id);
                return (
                  <button
                    key={sk.id}
                    type="button"
                    onClick={() => handleToggleSkill(sk.id)}
                    className={`px-2.5 py-1 rounded text-xs font-medium border transition ${
                      isSel
                        ? 'bg-indigo-950 text-indigo-200 border-indigo-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {isSel && '✓ '}
                    {sk.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Add Trainer'}
            </button>
          </div>
        </form>
      )}

      {/* Trainers Cards List */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trainers.map(tr => (
          <div key={tr.id} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl hover:border-slate-700 transition">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-white">{tr.name}</h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                  <Mail className="w-3 h-3 text-slate-500" />
                  <span>{tr.email}</span>
                </div>
              </div>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800 text-xs font-semibold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {tr.rating.toFixed(1)}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-indigo-400" />
                NSQF Level {tr.certifiedNsqfLevel}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                {tr.yearsExperience} yrs exp
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Specialized Competencies:
              </span>
              <div className="flex flex-wrap gap-1">
                {tr.specializationSkillIds.map((skId, sIdx) => {
                  const sObj = skills.find(s => s.id === skId);
                  return (
                    <span
                      key={`${tr.id}-skill-${skId}-${sIdx}`}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300"
                    >
                      {sObj?.name || skId}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
