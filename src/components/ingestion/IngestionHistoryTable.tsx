/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  History,
  CheckCircle2,
  Clock,
  Building2,
  Briefcase,
  Layers,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { IngestionBatchRecord } from '../../types/dataModel.ts';

interface IngestionHistoryTableProps {
  history: IngestionBatchRecord[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const IngestionHistoryTable: React.FC<IngestionHistoryTableProps> = ({
  history,
  isLoading,
  onRefresh
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs">Loading ingestion audit history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600" />
            Ingestion Batch Audit Log & Provenance
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Full compliance audit trail of all CSV data imports, parsed record counts, and taxonomy updates.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition"
        >
          Refresh Log
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Batch ID & File</th>
                <th className="py-3 px-4">Uploaded At</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4 text-center">Imported / Total</th>
                <th className="py-3 px-4 text-center">Skills Linked</th>
                <th className="py-3 px-4 text-center">New Employers</th>
                <th className="py-3 px-4">Districts & Sectors</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length > 0 ? (
                history.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-50/80 transition">
                    {/* Batch ID & File */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        {batch.fileName}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                        {batch.id}
                      </div>
                    </td>

                    {/* Uploaded At */}
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(batch.uploadedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(batch.uploadedAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>

                    {/* Operator */}
                    <td className="py-3 px-4 text-slate-700">
                      {batch.importedBy}
                    </td>

                    {/* Imported / Total */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-slate-900 text-sm">
                        {batch.importedCount}
                      </span>
                      <span className="text-slate-400 text-[11px]"> / {batch.totalRows}</span>
                      {batch.skippedCount > 0 && (
                        <div className="text-[10px] text-rose-500">
                          {batch.skippedCount} skipped
                        </div>
                      )}
                    </td>

                    {/* Skills Linked */}
                    <td className="py-3 px-4 text-center font-medium text-indigo-700">
                      {batch.extractedSkillsCount}
                    </td>

                    {/* New Employers */}
                    <td className="py-3 px-4 text-center font-medium text-slate-700">
                      {batch.summary.newEmployersAdded > 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[11px] border border-emerald-200">
                          +{batch.summary.newEmployersAdded}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Districts & Sectors Affected */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {batch.summary.districtsAffected.slice(0, 3).map((dist, dIdx) => (
                          <span key={dIdx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {dist.replace('dist-', '')}
                          </span>
                        ))}
                        {batch.summary.sectorsAffected.slice(0, 2).map((sec, sIdx) => (
                          <span key={sIdx} className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                            {sec.replace('sec-', '')}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      {batch.status === 'Completed' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Partial
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No historical batch records yet. Ingest your first CSV file above to establish the audit log.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
