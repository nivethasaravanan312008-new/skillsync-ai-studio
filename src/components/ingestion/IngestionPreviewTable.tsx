/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  FileText,
  Building2,
  MapPin,
  Tag,
  Briefcase,
  X,
  Eye,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { IngestionParsedRow, IngestionPreviewResponse } from '../../types/dataModel.ts';

interface IngestionPreviewTableProps {
  preview: IngestionPreviewResponse;
  activeFilter: 'all' | 'valid' | 'warning' | 'error';
  onFilterChange: (filter: 'all' | 'valid' | 'warning' | 'error') => void;
  onSkillClick?: (skillId: string) => void;
}

export const IngestionPreviewTable: React.FC<IngestionPreviewTableProps> = ({
  preview,
  activeFilter,
  onFilterChange,
  onSkillClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRowDetails, setSelectedRowDetails] = useState<IngestionParsedRow | null>(null);

  // Filter rows by status and search query
  const filteredRows = preview.rows.filter(row => {
    if (activeFilter !== 'all' && row.status !== activeFilter) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const p = row.parsedFields;
    return (
      p.jobTitle.toLowerCase().includes(q) ||
      p.company.toLowerCase().includes(q) ||
      p.district.toLowerCase().includes(q) ||
      p.sector.toLowerCase().includes(q) ||
      p.rawSkillsString.toLowerCase().includes(q) ||
      row.extractedSkills.some(s => s.normalizedTerm.toLowerCase().includes(q) || s.matchedSkillName.toLowerCase().includes(q))
    );
  });

  const validCount = preview.rows.filter(r => r.status === 'valid').length;
  const warningCount = preview.rows.filter(r => r.status === 'warning').length;
  const errorCount = preview.rows.filter(r => r.status === 'error').length;

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Rows ({preview.rows.length})
          </button>
          <button
            onClick={() => onFilterChange('valid')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
              activeFilter === 'valid'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            Valid ({validCount})
          </button>
          <button
            onClick={() => onFilterChange('warning')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
              activeFilter === 'warning'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            Warnings ({warningCount})
          </button>
          <button
            onClick={() => onFilterChange('error')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
              activeFilter === 'error'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
            }`}
          >
            Errors ({errorCount})
          </button>
        </div>

        {/* Search Box */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search titles, companies, skills..."
            className="w-full text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Rows Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 w-12 text-center">Row</th>
                <th className="py-2.5 px-3 w-20 text-center">Status</th>
                <th className="py-2.5 px-3 min-w-[180px]">Job Title & Role</th>
                <th className="py-2.5 px-3 min-w-[140px]">Employer / Company</th>
                <th className="py-2.5 px-3 min-w-[120px]">District & Sector</th>
                <th className="py-2.5 px-3 min-w-[240px]">Extracted & Normalized Skills</th>
                <th className="py-2.5 px-3 min-w-[100px]">Experience & CTC</th>
                <th className="py-2.5 px-3 w-16 text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <tr
                    key={row.rowNumber}
                    className={`hover:bg-slate-50/80 transition ${
                      row.status === 'error'
                        ? 'bg-rose-50/20'
                        : row.status === 'warning'
                        ? 'bg-amber-50/20'
                        : ''
                    }`}
                  >
                    {/* Row Number */}
                    <td className="py-2.5 px-3 font-mono text-center text-slate-400 text-[11px]">
                      {row.rowNumber}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 text-center">
                      {row.status === 'valid' && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Valid
                        </span>
                      )}
                      {row.status === 'warning' && (
                        <span
                          title={row.validationWarnings.join('\n')}
                          className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium cursor-help"
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Warning
                        </span>
                      )}
                      {row.status === 'error' && (
                        <span
                          title={row.validationErrors.join('\n')}
                          className="inline-flex items-center gap-1 text-[11px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-medium cursor-help"
                        >
                          <XCircle className="w-3 h-3 text-rose-600" />
                          Error
                        </span>
                      )}
                    </td>

                    {/* Job Title & Role */}
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">
                        {row.parsedFields.jobTitle || <span className="text-rose-500 italic">Missing Title</span>}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Role: {row.matchedEntities.jobRoleTitle || 'Auto-Inferred'}
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        {row.parsedFields.company || <span className="text-rose-500 italic">Missing</span>}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {row.matchedEntities.employerId ? 'Verified Employer' : 'Will Register New'}
                      </div>
                    </td>

                    {/* District & Sector */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {row.parsedFields.district}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {row.parsedFields.sector}
                      </div>
                    </td>

                    {/* Extracted & Normalized Skills */}
                    <td className="py-2.5 px-3">
                      {row.extractedSkills.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {row.extractedSkills.map((sk, skIdx) => (
                            <span
                              key={skIdx}
                              onClick={() => onSkillClick && onSkillClick(sk.matchedSkillId)}
                              title={`Raw: "${sk.rawTerm}" → Standardized: "${sk.matchedSkillName}"`}
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                                sk.isVariationMapped
                                  ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                                  : 'bg-indigo-50 text-indigo-800 border border-indigo-100 hover:bg-indigo-100'
                              }`}
                            >
                              <span>{sk.normalizedTerm}</span>
                              {sk.isVariationMapped && (
                                <span className="text-[9px] font-mono text-amber-700 bg-amber-100/80 px-1 rounded">
                                  from {sk.rawTerm}
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          No skills extracted
                        </span>
                      )}

                      {row.unmatchedTerms.length > 0 && (
                        <div className="mt-1 text-[10px] text-slate-400">
                          Unmatched: {row.unmatchedTerms.join(', ')}
                        </div>
                      )}
                    </td>

                    {/* Experience & Salary */}
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800">
                        ₹{(row.parsedFields.minSalaryINR / 100000).toFixed(1)} - {(row.parsedFields.maxSalaryINR / 100000).toFixed(1)} LPA
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {row.parsedFields.experienceYears} yrs exp
                      </div>
                    </td>

                    {/* View Detail Button */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setSelectedRowDetails(row)}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                        title="View complete row and original job description"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No rows match the selected filter or search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row Inspection Modal (Preserving Original Description) */}
      {selectedRowDetails && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded font-bold">
                    Row #{selectedRowDetails.rowNumber}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {selectedRowDetails.parsedFields.jobTitle}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedRowDetails.parsedFields.company} · {selectedRowDetails.parsedFields.district} · {selectedRowDetails.parsedFields.sector}
                </p>
              </div>

              <button
                onClick={() => setSelectedRowDetails(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Preserved Original Job Description */}
              <div>
                <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  Original Job Description (Preserved Verbatim)
                </h4>
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                  {selectedRowDetails.parsedFields.description || 'No long description provided in CSV.'}
                </div>
              </div>

              {/* Raw vs Normalized Skills Breakdown */}
              <div>
                <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  Raw Skills Text vs. Normalized Taxonomy Mapping
                </h4>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-2">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Raw Skills Input:</span>
                  <span className="font-mono text-slate-800">
                    {selectedRowDetails.parsedFields.rawSkillsString || '(Extracted directly from description)'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {selectedRowDetails.extractedSkills.map((sk, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white rounded border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{sk.normalizedTerm}</span>
                          {sk.isVariationMapped && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded font-mono">
                              normalized from "{sk.rawTerm}"
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Catalog: {sk.matchedSkillName} ({sk.matchedSkillId})
                        </span>
                      </div>

                      <span className="text-emerald-700 font-semibold text-[11px]">
                        {Math.round(sk.confidence * 100)}% match
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Entity Mappings */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Target District:</span>
                  <span className="font-medium text-slate-800">
                    {selectedRowDetails.matchedEntities.districtName} ({selectedRowDetails.matchedEntities.districtId})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Target Sector:</span>
                  <span className="font-medium text-slate-800">
                    {selectedRowDetails.matchedEntities.sectorName} ({selectedRowDetails.matchedEntities.sectorId})
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedRowDetails(null)}
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-medium transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
