/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Upload,
  Building2,
  Briefcase,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import { IngestionPreviewResponse } from '../../types/dataModel.ts';

interface IngestionConfirmationModalProps {
  preview: IngestionPreviewResponse;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: { skipInvalidRows: boolean; createMissingEmployers: boolean }) => Promise<void>;
  isSubmitting: boolean;
}

export const IngestionConfirmationModal: React.FC<IngestionConfirmationModalProps> = ({
  preview,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting
}) => {
  const [skipInvalidRows, setSkipInvalidRows] = useState(true);
  const [createMissingEmployers, setCreateMissingEmployers] = useState(true);

  if (!isOpen) return null;

  const validRows = preview.rows.filter(r => r.status === 'valid' || (r.status === 'warning' && skipInvalidRows));
  const errorCount = preview.rows.filter(r => r.status === 'error').length;
  const newEmployersCount = preview.rows.filter(r => !r.matchedEntities.employerId).length;
  const totalSkillsCount = preview.rows.reduce((acc, r) => acc + r.extractedSkills.length, 0);

  const handleExecute = async () => {
    await onConfirm({ skipInvalidRows, createMissingEmployers });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Confirm Batch Data Ingestion
              </h3>
              <p className="text-xs text-slate-500">
                Target File: {preview.fileName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-center">
              <Briefcase className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              <div className="text-base font-bold text-indigo-900">
                {validRows.length}
              </div>
              <div className="text-[10px] text-indigo-700 uppercase font-semibold">
                Jobs To Ingest
              </div>
            </div>

            <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center">
              <Building2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <div className="text-base font-bold text-emerald-900">
                {newEmployersCount}
              </div>
              <div className="text-[10px] text-emerald-700 uppercase font-semibold">
                New Employers
              </div>
            </div>

            <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100 text-center">
              <Sparkles className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <div className="text-base font-bold text-amber-900">
                {preview.extractedSkillsSummary.uniqueNormalizedSkills}
              </div>
              <div className="text-[10px] text-amber-700 uppercase font-semibold">
                Unique Skills
              </div>
            </div>
          </div>

          {/* Impact Description */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <h4 className="font-semibold text-slate-800 text-xs">
              System State Updates on Confirmation:
            </h4>
            <ul className="space-y-1.5 text-slate-600 text-[11px] list-disc pl-4">
              <li>
                <strong>Immediate Analytics Recalculation:</strong> Demand scores, geographic spread, and growth rates will update automatically.
              </li>
              <li>
                <strong>Taxonomy Normalization:</strong> Raw skill terms (e.g. JS, React.js, Postgres, ML) will be stored alongside normalized standardized skills.
              </li>
              <li>
                <strong>Curriculum & Course Alignment:</strong> Missing skills will immediately reflect in the Skill Gap and Course Health engines.
              </li>
            </ul>
          </div>

          {/* Checkbox Options */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={skipInvalidRows}
                onChange={e => setSkipInvalidRows(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 text-xs">
                <strong>Skip rows with blocking errors</strong> ({errorCount} error row{errorCount === 1 ? '' : 's'} will be ignored).
              </span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={createMissingEmployers}
                onChange={e => setCreateMissingEmployers(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 text-xs">
                <strong>Auto-register new companies</strong> in the verified employer directory.
              </span>
            </label>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExecute}
            disabled={isSubmitting || validRows.length === 0}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Ingesting into Database...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Commit {validRows.length} Postings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
