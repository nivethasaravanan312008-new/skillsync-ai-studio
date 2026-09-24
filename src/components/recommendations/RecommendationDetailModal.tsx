/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Building2,
  GraduationCap,
  Briefcase,
  Layers,
  FileText,
  Calendar,
  User,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Flame
} from 'lucide-react';
import {
  CurriculumRecommendationItem,
  RecommendationStatus,
  RecommendationActionType,
  RecommendationPriority
} from '../../types/dataModel.ts';

interface RecommendationDetailModalProps {
  recommendation: CurriculumRecommendationItem;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: RecommendationStatus, note?: string) => Promise<void>;
  onAddNote: (id: string, note: string) => Promise<void>;
}

export const RecommendationDetailModal: React.FC<RecommendationDetailModalProps> = ({
  recommendation,
  onClose,
  onStatusChange,
  onAddNote
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'project' | 'history'>('details');
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStatusNotePrompt, setShowStatusNotePrompt] = useState<RecommendationStatus | null>(null);
  const [statusPromptNote, setStatusPromptNote] = useState('');

  const getActionBadge = (type: RecommendationActionType) => {
    switch (type) {
      case 'ADD':
        return {
          label: 'SKILL TO ADD',
          bg: 'bg-emerald-950 text-emerald-300 border-emerald-800',
          icon: <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
        };
      case 'INCREASE':
        return {
          label: 'INCREASE INTENSITY',
          bg: 'bg-blue-950 text-blue-300 border-blue-800',
          icon: <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
        };
      case 'REDUCE':
        return {
          label: 'REDUCE / TRIM HOURS',
          bg: 'bg-amber-950 text-amber-300 border-amber-800',
          icon: <ArrowDownRight className="w-3.5 h-3.5 text-amber-400" />
        };
      case 'OUTDATED_TOPIC':
        return {
          label: 'POTENTIALLY OUTDATED TOPIC',
          bg: 'bg-rose-950 text-rose-300 border-rose-800',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
        };
      case 'PRACTICAL_PROJECT':
        return {
          label: 'APPLIED CAPSTONE PROJECT',
          bg: 'bg-purple-950 text-purple-300 border-purple-800',
          icon: <Layers className="w-3.5 h-3.5 text-purple-400" />
        };
    }
  };

  const getPriorityBadge = (priority: RecommendationPriority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-950 text-red-300 border-red-800 animate-pulse';
      case 'High':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Medium':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'Low':
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadge = (status: RecommendationStatus) => {
    switch (status) {
      case 'accepted':
        return {
          label: 'Accepted by Board',
          className: 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
        };
      case 'rejected':
        return {
          label: 'Rejected',
          className: 'bg-red-950/80 text-red-300 border-red-800'
        };
      case 'under_review':
        return {
          label: 'Under Governance Review',
          className: 'bg-amber-950/80 text-amber-300 border-amber-800'
        };
      case 'pending':
      default:
        return {
          label: 'Pending Decision',
          className: 'bg-slate-800 text-slate-300 border-slate-700'
        };
    }
  };

  const handleExecuteStatusChange = async (status: RecommendationStatus) => {
    try {
      setIsSubmitting(true);
      await onStatusChange(recommendation.id, status, statusPromptNote || undefined);
      setShowStatusNotePrompt(null);
      setStatusPromptNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    try {
      setIsSubmitting(true);
      await onAddNote(recommendation.id, newNote);
      setNewNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const actionMeta = getActionBadge(recommendation.actionType);
  const statusMeta = getStatusBadge(recommendation.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-bold uppercase tracking-wider ${actionMeta.bg}`}>
              {actionMeta.icon}
              {actionMeta.label}
            </span>
            <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold uppercase tracking-wider ${getPriorityBadge(recommendation.priority)}`}>
              Priority: {recommendation.priority}
            </span>
            <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${statusMeta.className}`}>
              Status: {statusMeta.label}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Course Banner */}
        <div className="px-6 py-3 bg-slate-950/30 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="font-semibold text-white">{recommendation.courseTitle}</span>
              <span className="text-slate-400 ml-2">({recommendation.courseCode})</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span>{recommendation.instituteName}</span>
            <span>&bull;</span>
            <span>{recommendation.districtName}</span>
            <span>&bull;</span>
            <span className="text-cyan-400 font-semibold">{recommendation.sectorName}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900 shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Recommendation Evidence & Rationale
          </button>
          {recommendation.practicalProject && (
            <button
              onClick={() => setActiveTab('project')}
              className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'project'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Applied Capstone Project
            </button>
          )}
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Audit History ({recommendation.auditLogs?.length || 0})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300">
          {/* TAB 1: DETAILS & EVIDENCE */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Target Skill Highlight */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Target Competency</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                    Category: {recommendation.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  {recommendation.skillName}
                </h3>
                <div className="mt-3 text-sm text-slate-200 leading-relaxed font-sans bg-slate-900/60 p-3 rounded border border-slate-800">
                  <strong className="text-white block text-xs uppercase tracking-wider text-blue-400 mb-1">
                    Direct Reason:
                  </strong>
                  {recommendation.reason}
                </div>
              </div>

              {/* Detailed Labour Market Explanation */}
              <div>
                <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Labour Market Rationale & Why Detected
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                  {recommendation.detailedExplanation}
                </p>
              </div>

              {/* Evidence Metrics Grid */}
              <div>
                <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Verified Labour Market Evidence
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                    <span className="text-[10px] text-slate-400 uppercase block">Market Demand Score</span>
                    <span className="text-xl font-bold font-mono text-blue-400 mt-1 block">
                      {recommendation.evidence.demandScore} / 100
                    </span>
                    <span className="text-[10px] text-slate-500">Live indexed score</span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                    <span className="text-[10px] text-slate-400 uppercase block">Hiring Employers</span>
                    <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                      {recommendation.evidence.employerCount} Firms
                    </span>
                    <span className="text-[10px] text-slate-500">Actively recruiting</span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                    <span className="text-[10px] text-slate-400 uppercase block">Active Job Openings</span>
                    <span className="text-xl font-bold font-mono text-cyan-400 mt-1 block">
                      {recommendation.evidence.activeOpenings} Seats
                    </span>
                    <span className="text-[10px] text-slate-500">Regional sector demand</span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                    <span className="text-[10px] text-slate-400 uppercase block">12-Mo Growth Trend</span>
                    <div className="flex items-center gap-1 mt-1">
                      {recommendation.evidence.trend === 'surging' ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <span className="text-base font-bold font-mono text-emerald-400">+{recommendation.evidence.growth12mPercentage || 35}%</span>
                        </>
                      ) : recommendation.evidence.trend === 'declining' ? (
                        <>
                          <TrendingDown className="w-4 h-4 text-rose-400" />
                          <span className="text-base font-bold font-mono text-rose-400">{recommendation.evidence.growth12mPercentage || -45}%</span>
                        </>
                      ) : (
                        <span className="text-base font-bold font-mono text-slate-300">Stable</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 capitalize">{recommendation.evidence.trend} trajectory</span>
                  </div>
                </div>
              </div>

              {/* Recommended Syllabus Action & Practical Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Recommended Proficiency Target
                  </h5>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded bg-blue-950 border border-blue-800 text-blue-300 font-bold uppercase text-xs">
                      {recommendation.recommendedProficiency} Level
                    </span>
                    {recommendation.evidence.currentProficiency && (
                      <span className="text-xs text-slate-400">
                        (Upgraded from <strong className="text-slate-300">{recommendation.evidence.currentProficiency}</strong>)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Meets the standardized NSQF industrial proficiency requirement expected by Tier 1 recruiters.
                  </p>
                </div>

                <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Recommended Lab Allocation
                  </h5>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded font-bold font-mono text-xs border ${
                      recommendation.suggestedLabHours > 0
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {recommendation.suggestedLabHours > 0 ? `+${recommendation.suggestedLabHours} Hours` : `${recommendation.suggestedLabHours} Hours`}
                    </span>
                    <span className="text-xs text-slate-400">
                      Current: {recommendation.evidence.currentTaughtHours} Hours
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Hands-on practical workstation hours dedicated to technical lab simulations.
                  </p>
                </div>
              </div>

              {/* Sample Employers & Placement Impact */}
              {(recommendation.evidence.sampleEmployers?.length > 0 || recommendation.evidence.placementImpactNote) && (
                <div className="space-y-3">
                  {recommendation.evidence.sampleEmployers?.length > 0 && (
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1.5 font-semibold">Active Hiring Employers Demanding This Competency:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {recommendation.evidence.sampleEmployers.map((emp, i) => (
                          <span key={i} className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700 text-slate-300 text-xs flex items-center gap-1.5">
                            <Building2 className="w-3 h-3 text-blue-400" />
                            {emp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {recommendation.evidence.placementImpactNote && (
                    <div className="bg-amber-950/40 border border-amber-800/60 rounded-lg p-3 text-xs text-amber-300 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{recommendation.evidence.placementImpactNote}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRACTICAL PROJECT */}
          {activeTab === 'project' && recommendation.practicalProject && (
            <div className="space-y-4">
              <div className="bg-purple-950/30 border border-purple-800/60 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-purple-300 uppercase tracking-wider font-semibold">
                    Accredited Applied Lab Capstone
                  </span>
                  <span className="text-xs font-mono text-purple-300 font-bold">
                    {recommendation.practicalProject.suggestedHours} Lab Hours
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white">
                  {recommendation.practicalProject.title}
                </h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {recommendation.practicalProject.description}
                </p>
              </div>

              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Required Student Deliverables & Verification Checklist
                </h5>
                <div className="space-y-2">
                  {recommendation.practicalProject.deliverables.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs bg-slate-950/60 p-2.5 rounded border border-slate-800">
                      <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-800 text-blue-300 font-mono text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-400" />
                Administrative Decision Trail & Review History
              </h4>

              {recommendation.auditLogs && recommendation.auditLogs.length > 0 ? (
                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-800">
                  {recommendation.auditLogs.map((log) => (
                    <div key={log.id} className="relative flex items-start gap-3 pl-8">
                      <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-slate-900" />
                      <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 flex-1 text-xs">
                        <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                          <span className="font-semibold text-slate-200">{log.performedBy}</span>
                          <span className="font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="font-semibold text-white capitalize">
                          Action: {log.action.replace(/_/g, ' ')}
                          {log.previousStatus && log.newStatus && (
                            <span className="text-slate-400 font-normal ml-2">
                              ({log.previousStatus} ➔ {log.newStatus})
                            </span>
                          )}
                        </div>
                        {log.note && (
                          <div className="mt-2 text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800 font-sans italic">
                            "{log.note}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  No governance history recorded yet.
                </div>
              )}
            </div>
          )}

          {/* Admin Notes Section */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Administrator Governance Notes
            </h4>
            {recommendation.adminNotes ? (
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 whitespace-pre-line mb-3 font-mono">
                {recommendation.adminNotes}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic mb-3">No administrative notes recorded yet.</p>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add note for curriculum committee or audit trail..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveNote()}
              />
              <button
                onClick={handleSaveNote}
                disabled={!newNote.trim() || isSubmitting}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold disabled:opacity-50 transition shrink-0"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer: Action Controls */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-400">
            Current Status: <strong className="text-white capitalize">{recommendation.status.replace(/_/g, ' ')}</strong>
          </span>

          {showStatusNotePrompt ? (
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <input
                type="text"
                value={statusPromptNote}
                onChange={(e) => setStatusPromptNote(e.target.value)}
                placeholder={`Optional justification for ${showStatusNotePrompt}...`}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <button
                onClick={() => handleExecuteStatusChange(showStatusNotePrompt)}
                disabled={isSubmitting}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setShowStatusNotePrompt(null);
                  setStatusPromptNote('');
                }}
                className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStatusNotePrompt('accepted')}
                disabled={isSubmitting || recommendation.status === 'accepted'}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Accept Recommendation
              </button>

              <button
                onClick={() => setShowStatusNotePrompt('under_review')}
                disabled={isSubmitting || recommendation.status === 'under_review'}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40"
              >
                <Clock className="w-3.5 h-3.5" />
                Mark for Review
              </button>

              <button
                onClick={() => setShowStatusNotePrompt('rejected')}
                disabled={isSubmitting || recommendation.status === 'rejected'}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
