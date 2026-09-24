/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { IngestionPreviewResponse } from '../../types/dataModel.ts';

interface ValidationErrorsDrawerProps {
  preview: IngestionPreviewResponse;
  onFilterChange: (status: 'all' | 'valid' | 'warning' | 'error') => void;
  activeFilter: 'all' | 'valid' | 'warning' | 'error';
}

export const ValidationErrorsDrawer: React.FC<ValidationErrorsDrawerProps> = ({
  preview,
  onFilterChange,
  activeFilter
}) => {
  const [expanded, setExpanded] = React.useState(true);

  const errorRows = preview.rows.filter(r => r.status === 'error');
  const warningRows = preview.rows.filter(r => r.status === 'warning');

  if (errorRows.length === 0 && warningRows.length === 0 && preview.missingHeaders.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between text-xs text-emerald-800">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">All Records Verified:</span>
          <span>100% of uploaded rows conform to the qualification structure with zero errors or warnings.</span>
        </div>
        <span className="text-[11px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded">
          Ready for Ingestion
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition"
      >
        <div className="flex items-center gap-3">
          {errorRows.length > 0 ? (
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </span>
          ) : (
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </span>
          )}

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              CSV Validation Diagnostics & Row Quality Audit
            </h4>
            <p className="text-[11px] text-slate-500">
              {errorRows.length} blocking error(s), {warningRows.length} non-blocking warning(s) identified across {preview.totalRows} records.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onFilterChange('error'); }}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                activeFilter === 'error'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              {errorRows.length} Errors
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onFilterChange('warning'); }}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                activeFilter === 'warning'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              {warningRows.length} Warnings
            </button>
          </div>

          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 space-y-3 text-xs">
          {/* Missing Required Headers */}
          {preview.missingHeaders.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
              <div className="flex items-center gap-1.5 font-semibold text-rose-900 mb-1">
                <XCircle className="w-4 h-4" />
                Missing Critical Headers:
              </div>
              <p className="text-[11px]">
                The uploaded file is missing the following standard columns: <span className="font-mono">{preview.missingHeaders.join(', ')}</span>. Please add these columns to ensure reliable entity matching.
              </p>
            </div>
          )}

          {/* Row-Level Errors */}
          {errorRows.length > 0 && (
            <div className="space-y-1.5">
              <h5 className="font-semibold text-rose-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                Blocking Row Errors (Must be fixed or skipped):
              </h5>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {errorRows.map(row => (
                  <div key={row.rowNumber} className="p-2 bg-rose-50/70 border border-rose-100 rounded text-rose-800 text-[11px] flex items-start gap-2">
                    <span className="font-mono font-bold shrink-0 bg-rose-200 text-rose-900 px-1 rounded text-[10px]">
                      Row {row.rowNumber}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-slate-900 mr-1">
                        "{row.parsedFields.jobTitle || 'Untitled'}" at "{row.parsedFields.company || 'Unknown Firm'}":
                      </span>
                      <span>{row.validationErrors.join(' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Row-Level Warnings */}
          {warningRows.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <h5 className="font-semibold text-amber-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Non-Blocking Warnings (Auto-handled during ingestion):
              </h5>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {warningRows.map(row => (
                  <div key={row.rowNumber} className="p-2 bg-amber-50/70 border border-amber-100 rounded text-amber-900 text-[11px] flex items-start gap-2">
                    <span className="font-mono font-bold shrink-0 bg-amber-200 text-amber-900 px-1 rounded text-[10px]">
                      Row {row.rowNumber}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-slate-900 mr-1">
                        "{row.parsedFields.jobTitle}" ({row.parsedFields.company}):
                      </span>
                      <span>{row.validationWarnings.join(' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
