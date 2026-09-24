/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Award,
  Users,
  Briefcase,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Clock,
  Send,
  ExternalLink,
  ShieldCheck,
  Zap,
  BarChart3
} from 'lucide-react';
import {
  InstituteCourseAlignmentOverview,
  TrainingInstitute
} from '../../types/dataModel.ts';
import { apiService } from '../../services/apiService.ts';

interface IndustryAlignmentViewProps {
  institute: TrainingInstitute;
  alignments: InstituteCourseAlignmentOverview[];
  onRecommendationUpdated: (recommendationId: string, status: string, notes: string) => void;
}

export const IndustryAlignmentView: React.FC<IndustryAlignmentViewProps> = ({
  institute,
  alignments,
  onRecommendationUpdated
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(alignments[0]?.courseId || '');
  const [activeModalRec, setActiveModalRec] = useState<{
    id: string;
    courseTitle: string;
    skillName: string;
    actionType: string;
    reason: string;
    currentNotes: string;
    currentStatus: string;
  } | null>(null);

  const [modalNotes, setModalNotes] = useState<string>('');
  const [modalStatus, setModalStatus] = useState<'acknowledged' | 'accepted' | 'in_progress' | 'implemented' | 'rejected'>('acknowledged');
  const [isSubmittingRec, setIsSubmittingRec] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const activeCourse = alignments.find(a => a.courseId === selectedCourseId) || alignments[0];

  const handleOpenRecModal = (courseTitle: string, rec: any) => {
    setActiveModalRec({
      id: rec.id,
      courseTitle,
      skillName: rec.skillName,
      actionType: rec.actionType,
      reason: rec.reason,
      currentNotes: rec.implementationNotes || '',
      currentStatus: rec.status
    });
    setModalNotes(rec.implementationNotes || '');
    setModalStatus(rec.status === 'pending' ? 'acknowledged' : (rec.status as any));
  };

  const handleSaveRecommendationResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalRec) return;

    setIsSubmittingRec(true);
    try {
      await apiService.acknowledgeInstituteRecommendation(
        activeModalRec.id,
        modalStatus,
        modalNotes,
        `${institute.name} Academic Committee`
      );

      setSuccessToast(`Recommendation for "${activeModalRec.skillName}" marked as ${modalStatus.toUpperCase()}!`);
      onRecommendationUpdated(activeModalRec.id, modalStatus, modalNotes);
      setActiveModalRec(null);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      alert(`Error updating recommendation: ${err.message}`);
    } finally {
      setIsSubmittingRec(false);
    }
  };

  if (!activeCourse) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        No courses available for industry alignment analysis yet. Add courses using the Course Creator tab.
      </div>
    );
  }

  const alignmentColor =
    activeCourse.alignmentScore >= 80
      ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
      : activeCourse.alignmentScore >= 60
      ? 'text-amber-400 bg-amber-950/80 border-amber-800'
      : 'text-rose-400 bg-rose-950/80 border-rose-800';

  return (
    <div className="space-y-6">
      {/* Top Banner & Course Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Course-by-Course Industry Alignment & Demand Analytics
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Real-time synchronization between institute curriculum competencies and active Maharashtra industrial hiring requisitions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase text-slate-400">Select Course:</span>
            <select
              value={activeCourse.courseId}
              onChange={e => setSelectedCourseId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 max-w-xs md:max-w-md"
            >
              {alignments.map(ca => (
                <option key={ca.courseId} value={ca.courseId}>
                  {ca.courseCode} - {ca.courseTitle} ({ca.alignmentScore}% Aligned)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {successToast && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-700 text-emerald-200 text-sm rounded-lg flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Course Summary & 6 Mandatory Requirement KPIs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                {activeCourse.courseCode}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {activeCourse.sectorName} • {activeCourse.districtName} District
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">{activeCourse.courseTitle}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Target Career Role: <strong className="text-slate-200">{activeCourse.targetRoleTitle}</strong> (NSQF Level {activeCourse.nsqfLevel} • {activeCourse.durationHours} Hours)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl border text-center ${alignmentColor}`}>
              <div className="text-2xl font-black">{activeCourse.alignmentScore}%</div>
              <div className="text-[10px] font-bold uppercase tracking-wider">Alignment Score</div>
            </div>
          </div>
        </div>

        {/* 6 User-Required Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-5">
          {/* 1. Industry Demand */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              1. Industry Demand
            </span>
            <div className="text-xl font-bold text-white mt-1">
              {activeCourse.industryDemand.activeOpenings} <span className="text-xs font-normal text-slate-400">jobs</span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1 font-medium">
              <Zap className="w-3 h-3" />
              {activeCourse.industryDemand.urgencyLevel} Need
            </div>
          </div>

          {/* 2. Skills Covered */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              2. Skills Covered
            </span>
            <div className="text-xl font-bold text-white mt-1">
              {activeCourse.skillsCovered.length} <span className="text-xs font-normal text-slate-400">skills</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {activeCourse.skillsCovered.filter(s => s.isMarketCritical).length} high market critical
            </div>
          </div>

          {/* 3. Missing Skills */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              3. Missing Skills
            </span>
            <div className="text-xl font-bold text-amber-400 mt-1">
              {activeCourse.missingSkills.length} <span className="text-xs font-normal text-slate-400">gaps</span>
            </div>
            <div className="text-[11px] text-amber-300/80 mt-0.5">
              Industry 4.0 deficits
            </div>
          </div>

          {/* 4. Alignment Score */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              4. Alignment Score
            </span>
            <div className="text-xl font-bold text-white mt-1">
              {activeCourse.alignmentScore}/100
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {activeCourse.alignmentScore >= 80 ? 'Well Synced' : 'Action Required'}
            </div>
          </div>

          {/* 5. Placement Rate */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              5. Placement Rate
            </span>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {activeCourse.placementRate}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Avg ₹{(activeCourse.industryDemand.averageStartingSalaryINR / 100000).toFixed(1)}L starting
            </div>
          </div>

          {/* 6. Recommended Updates */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              6. Recommended Updates
            </span>
            <div className="text-xl font-bold text-indigo-400 mt-1">
              {activeCourse.recommendations.length} <span className="text-xs font-normal text-slate-400">updates</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {activeCourse.recommendations.filter(r => r.status === 'acknowledged').length} acknowledged
            </div>
          </div>
        </div>
      </div>

      {/* Skills Covered vs Missing Skills Comparison Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Skills Covered */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Skills Covered in Curriculum ({activeCourse.skillsCovered.length})
              </h4>
            </div>
            <span className="text-xs text-slate-400 font-medium">Practical / Theory Split</span>
          </div>

          <div className="mt-4 space-y-3">
            {activeCourse.skillsCovered.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No skills listed for this course.</p>
            ) : (
              activeCourse.skillsCovered.map((sk, skIdx) => (
                <div key={`${activeCourse.courseId}-cov-${sk.skillId}-${skIdx}`} className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{sk.skillName}</span>
                      {sk.isMarketCritical && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                          High Demand
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {sk.category} • Target: <span className="capitalize text-slate-300">{sk.proficiencyGoal}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-medium text-slate-300 block">
                      {sk.practicalHours}h lab / {sk.theoryHours}h lec
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Demand Score: {sk.marketDemandScore}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Missing Skills Identified from Employer Hiring */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Industry Skill Gaps & Missing Competencies ({activeCourse.missingSkills.length})
              </h4>
            </div>
            <span className="text-xs text-amber-400/90 font-medium">Employer Demand</span>
          </div>

          <div className="mt-4 space-y-3">
            {activeCourse.missingSkills.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                Outstanding alignment! No high-volume missing skills identified in current requisitions.
              </p>
            ) : (
              activeCourse.missingSkills.map((gap, gIdx) => (
                <div key={`${activeCourse.courseId}-gap-${gap.skillId}-${gIdx}`} className="p-3 bg-slate-950/70 border border-amber-900/30 rounded-lg flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{gap.skillName}</span>
                      {gap.isEmerging && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                          ★ Emerging
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {gap.category} • NSQF Level {gap.nsqfLevel}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-amber-400 block">
                      {gap.marketOpenings} Active Openings
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Rec proficiency: <span className="capitalize">{gap.suggestedProficiency}</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recommended Curriculum Updates & Acknowledgment Workflow */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Curriculum Recommendations & Institute Acknowledgment Workflow
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Institutes can review algorithm recommendations, acknowledge actions, and record implementation notes directly into the system.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-slate-800 text-xs font-mono font-medium text-slate-300 self-start sm:self-auto">
            {activeCourse.recommendations.length} Actionable Items
          </span>
        </div>

        <div className="mt-4 space-y-4">
          {activeCourse.recommendations.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No outstanding curriculum revisions required for this course at this moment.
            </div>
          ) : (
            activeCourse.recommendations.map(rec => {
              const priorityBadge =
                rec.priority === 'Critical'
                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                  : rec.priority === 'High'
                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                  : 'bg-indigo-950 text-indigo-300 border-indigo-800';

              const statusBadge =
                rec.status === 'acknowledged'
                  ? 'bg-blue-950 text-blue-300 border-blue-800'
                  : rec.status === 'accepted' || rec.status === 'implemented'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : rec.status === 'in_progress'
                  ? 'bg-purple-950 text-purple-300 border-purple-800'
                  : 'bg-slate-800 text-slate-300 border-slate-700';

              return (
                <div
                  key={rec.id}
                  className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl transition"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono uppercase bg-slate-800 text-white">
                          {rec.actionType}
                        </span>
                        <h4 className="text-sm font-bold text-white">{rec.skillName}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${priorityBadge}`}>
                          {rec.priority} Priority
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusBadge}`}>
                          Status: {rec.status.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-2 font-medium">
                        {rec.reason}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {rec.detailedExplanation}
                      </p>

                      {rec.suggestedLabHours && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-indigo-300 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          Suggested Practical Lab Addition: {rec.suggestedLabHours} Hours
                        </div>
                      )}

                      {/* Existing Implementation Notes */}
                      {rec.implementationNotes && (
                        <div className="mt-3 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-indigo-400" />
                            Institute Implementation Notes & Audit Trail:
                          </div>
                          <p className="whitespace-pre-line text-slate-200">{rec.implementationNotes}</p>
                          {rec.acknowledgedAt && (
                            <div className="text-[10px] text-slate-500 mt-1">
                              Recorded: {new Date(rec.acknowledgedAt).toLocaleString()} by {rec.acknowledgedBy || 'Institute Coordinator'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenRecModal(activeCourse.courseTitle, rec)}
                      className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition self-start"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{rec.status === 'pending' ? 'Acknowledge & Add Notes' : 'Edit Implementation Notes'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Acknowledgment & Notes Modal */}
      {activeModalRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  {activeModalRec.courseTitle}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Acknowledge Curriculum Recommendation: {activeModalRec.skillName}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalRec(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg text-xs text-slate-300">
              <strong className="text-white">Recommendation Rationale:</strong> {activeModalRec.reason}
            </div>

            <form onSubmit={handleSaveRecommendationResponse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Institute Adoption Decision / Status:
                </label>
                <select
                  value={modalStatus}
                  onChange={e => setModalStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="acknowledged">Acknowledged (Under Review by Academic Board)</option>
                  <option value="accepted">Accepted (Approved for Next Semester Batch)</option>
                  <option value="in_progress">In Progress (Developing Lab Manuals & Equipment Purchase)</option>
                  <option value="implemented">Implemented (Integrated into Active Syllabus)</option>
                  <option value="rejected">Rejected (Not Feasible within Current Infrastructure)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Implementation Notes & Action Plan *
                </label>
                <textarea
                  value={modalNotes}
                  onChange={e => setModalNotes(e.target.value)}
                  rows={4}
                  placeholder="Detail curriculum committee decisions, equipment requisition status, trainer allocation, or timeline (e.g. 'Lab setup planned for Q3 2026; trainer certified')..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalRec(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRec}
                  className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingRec ? 'Saving...' : 'Save & Record in Central Model'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
