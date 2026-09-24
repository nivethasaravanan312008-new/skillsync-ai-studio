/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Star,
  Users,
  Send,
  Sparkles,
  ShieldCheck,
  Building2
} from 'lucide-react';
import {
  Employer,
  District,
  Sector,
  Skill,
  SkillImportanceLevel,
  EmployerSurveySubmissionRequest
} from '../../types/dataModel.ts';

interface SkillDemandSurveyViewProps {
  employer: Employer;
  districts: District[];
  sectors: Sector[];
  allSkills: Skill[];
  onSurveySubmitted: (newSurvey: any) => void;
  onCancel?: () => void;
}

export const SkillDemandSurveyView: React.FC<SkillDemandSurveyViewProps> = ({
  employer,
  districts,
  sectors,
  allSkills,
  onSurveySubmitted,
  onCancel
}) => {
  const [sectorId, setSectorId] = useState(employer.sectorId || sectors[0]?.id || '');
  const [districtId, setDistrictId] = useState(employer.districtId || districts[0]?.id || '');
  const [hiringDifficultyScale, setHiringDifficultyScale] = useState<number>(4);
  const [plannedHiringNext6Months, setPlannedHiringNext6Months] = useState<number>(25);
  const [readinessRating, setReadinessRating] = useState<number>(3);
  const [emergingSkillComments, setEmergingSkillComments] = useState('');

  // Hard-to-fill skill selection
  const [selectedHardSkills, setSelectedHardSkills] = useState<string[]>([
    'sk-cloud-comp',
    'sk-docker-k8s',
    'sk-python-prog'
  ]);

  // Skill Priority Feedback (Critical, Important, Nice-to-Have)
  const [skillFeedback, setSkillFeedback] = useState<
    Array<{
      skillId: string;
      importance: SkillImportanceLevel;
      urgencyTrend: 'surging' | 'stable' | 'declining';
    }>
  >([
    { skillId: 'sk-cloud-comp', importance: 'critical', urgencyTrend: 'surging' },
    { skillId: 'sk-docker-k8s', importance: 'critical', urgencyTrend: 'surging' },
    { skillId: 'sk-fastapi-dev', importance: 'important', urgencyTrend: 'surging' },
    { skillId: 'sk-git-vcs', importance: 'important', urgencyTrend: 'stable' },
    { skillId: 'sk-ml-python', importance: 'nice_to_have', urgencyTrend: 'surging' }
  ]);

  const [skillSearch, setSkillSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleHardToFillSkill = (skillId: string) => {
    setSelectedHardSkills(prev =>
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  const handleUpdateFeedbackImportance = (skillId: string, importance: SkillImportanceLevel) => {
    setSkillFeedback(prev =>
      prev.map(item => (item.skillId === skillId ? { ...item, importance } : item))
    );
  };

  const handleUpdateFeedbackUrgency = (
    skillId: string,
    urgencyTrend: 'surging' | 'stable' | 'declining'
  ) => {
    setSkillFeedback(prev =>
      prev.map(item => (item.skillId === skillId ? { ...item, urgencyTrend } : item))
    );
  };

  const handleAddFeedbackSkill = (skillId: string) => {
    if (skillFeedback.some(item => item.skillId === skillId)) return;
    setSkillFeedback(prev => [
      ...prev,
      { skillId, importance: 'important', urgencyTrend: 'surging' }
    ]);
    setSkillSearch('');
  };

  const handleRemoveFeedbackSkill = (skillId: string) => {
    setSkillFeedback(prev => prev.filter(item => item.skillId !== skillId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const payload: EmployerSurveySubmissionRequest = {
        employerId: employer.id,
        sectorId,
        districtId,
        reportedHardToFillSkillIds: selectedHardSkills,
        hiringDifficultyScale,
        plannedHiringNext6Months: Number(plannedHiringNext6Months) || 10,
        readinessRating,
        emergingSkillComments,
        skillPriorityFeedback: skillFeedback
      };

      const res = await fetch('/api/employer-portal/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to submit employer demand survey');
      }

      const survey = await res.json();
      setSuccessMsg(`Survey recorded successfully! Responses have been integrated into platform demand intelligence.`);
      setTimeout(() => {
        onSurveySubmitted(survey);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error recording survey');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSearchSkills = allSkills
    .filter(
      s =>
        !skillFeedback.some(item => item.skillId === s.id) &&
        s.name.toLowerCase().includes(skillSearch.toLowerCase())
    )
    .slice(0, 8);

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-700/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Bi-Annual Employer Skill-Demand Survey</h2>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-mono uppercase">
              Curriculum Advisory Channel
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Provide executive intelligence on hiring bottlenecks, graduate job-readiness, and emerging skill needs to directly guide state training budgets.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
          <Building2 className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300 font-semibold">{employer.name}</span>
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
        {/* Metric 1 & 2: Difficulty & Volume */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Sector Scope</label>
            <select
              value={sectorId}
              onChange={(e) => setSectorId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
            >
              {sectors.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target District</label>
            <select
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
            >
              {districts.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Planned Hiring (Next 6 Mo.)</label>
            <input
              type="number"
              min={1}
              max={2000}
              value={plannedHiringNext6Months}
              onChange={(e) => setPlannedHiringNext6Months(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Hiring Difficulty (1 = Easy, 5 = Severe)
            </label>
            <div className="flex items-center gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setHiringDifficultyScale(val)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    hiringDifficultyScale === val
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Metric 3: Fresh Graduate Readiness Rating */}
        <div className="bg-slate-900/60 border border-slate-700/80 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">
              Fresh Graduate Job-Readiness Satisfaction (1-5 Stars)
            </span>
            <span className="text-xs text-amber-400 font-bold font-mono">
              Rating: {readinessRating} / 5
            </span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setReadinessRating(star)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                  readinessRating >= star
                    ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{star} Star{star > 1 ? 's' : ''}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 4: Hard-to-Fill Skills Multi-Select */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Reported Hard-To-Fill Skill Deficits (Select all that apply)
          </label>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 bg-slate-900/60 border border-slate-700 rounded-xl">
            {allSkills.slice(0, 30).map(skill => {
              const isSelected = selectedHardSkills.includes(skill.id);
              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => toggleHardToFillSkill(skill.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-rose-950 text-rose-300 border border-rose-600 shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                  }`}
                >
                  <span>{isSelected ? '✕' : '+'}</span>
                  <span>{skill.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 5: Skill Importance & Urgency Grading Workflow */}
        <div className="space-y-3 pt-3 border-t border-slate-700/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Curriculum Prioritization Feedback (Critical vs Important vs Nice-to-Have)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Flag priority skills for state curriculum revision.
              </p>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                placeholder="Add other skill to feedback..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
              {skillSearch && filteredSearchSkills.length > 0 && (
                <div className="absolute z-10 bg-slate-900 border border-slate-700 rounded-lg shadow-xl mt-1 p-1 max-w-xs space-y-1">
                  {filteredSearchSkills.map(s => (
                    <div
                      key={s.id}
                      onClick={() => handleAddFeedbackSkill(s.id)}
                      className="px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800 rounded cursor-pointer"
                    >
                      + {s.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-900/50">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                  <th className="py-2.5 px-3">Skill Competency</th>
                  <th className="py-2.5 px-3">Employer Priority Level</th>
                  <th className="py-2.5 px-3">Urgency Trajectory</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {skillFeedback.map((item, fbIdx) => {
                  const skill = allSkills.find(s => s.id === item.skillId);
                  if (!skill) return null;

                  return (
                    <tr key={`fb-sk-${item.skillId}-${fbIdx}`} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3 font-semibold text-white">
                        {skill.name}
                        <span className="block text-[10px] text-slate-500 font-mono">
                          NSQF Level {skill.nsqfLevel}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateFeedbackImportance(item.skillId, 'critical')}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                              item.importance === 'critical'
                                ? 'bg-rose-950 text-rose-300 border border-rose-600'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            Critical Skill
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateFeedbackImportance(item.skillId, 'important')}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                              item.importance === 'important'
                                ? 'bg-amber-950 text-amber-300 border border-amber-600'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            Important Skill
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateFeedbackImportance(item.skillId, 'nice_to_have')}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                              item.importance === 'nice_to_have'
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-600'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            Nice-to-Have
                          </button>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <select
                          value={item.urgencyTrend}
                          onChange={(e) =>
                            handleUpdateFeedbackUrgency(item.skillId, e.target.value as any)
                          }
                          className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200 outline-none cursor-pointer"
                        >
                          <option value="surging">Surging (&gt;30% YoY)</option>
                          <option value="stable">Stable / Consistent</option>
                          <option value="declining">Declining / Sunset</option>
                        </select>
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveFeedbackSkill(item.skillId)}
                          className="text-slate-500 hover:text-rose-400 text-xs cursor-pointer p-1"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Qualitative Comments */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Emerging Skill Comments & Technology Advisory
          </label>
          <textarea
            rows={2}
            value={emergingSkillComments}
            onChange={(e) => setEmergingSkillComments(e.target.value)}
            placeholder="e.g. Candidates often know theoretical Python but lack exposure to FastAPI async frameworks and Docker containerization during college labs."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* Submit */}
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer ml-auto"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Recording Survey...' : 'Submit Skill-Demand Survey'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
