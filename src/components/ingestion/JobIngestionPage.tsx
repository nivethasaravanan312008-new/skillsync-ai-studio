/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Wand2,
  History,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Building2,
  Sparkles,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../../services/apiService.ts';
import {
  IngestionPreviewResponse,
  IngestionBatchRecord,
  IngestionExecutionResponse
} from '../../types/dataModel.ts';
import { CSVUploadZone } from './CSVUploadZone.tsx';
import { IngestionPreviewTable } from './IngestionPreviewTable.tsx';
import { ValidationErrorsDrawer } from './ValidationErrorsDrawer.tsx';
import { IngestionConfirmationModal } from './IngestionConfirmationModal.tsx';
import { SkillExtractionPlayground } from './SkillExtractionPlayground.tsx';
import { IngestionHistoryTable } from './IngestionHistoryTable.tsx';

interface JobIngestionPageProps {
  onIngestionCompleted?: () => void;
  onNavigateToSkill?: (skillId: string) => void;
  onNavigateToDemand?: () => void;
}

export const JobIngestionPage: React.FC<JobIngestionPageProps> = ({
  onIngestionCompleted,
  onNavigateToSkill,
  onNavigateToDemand
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'playground' | 'history'>('upload');
  const [templates, setTemplates] = useState<{ id: string; name: string; description: string; csv: string }[]>([]);
  const [history, setHistory] = useState<IngestionBatchRecord[]>([]);
  const [preview, setPreview] = useState<IngestionPreviewResponse | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'valid' | 'warning' | 'error'>('all');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<IngestionExecutionResponse | null>(null);
  const [systemStats, setSystemStats] = useState<{ totalJobs: number; totalEmployers: number; totalSkills: number }>({
    totalJobs: 1050,
    totalEmployers: 54,
    totalSkills: 62
  });

  // Load initial templates, history, and stats
  const loadInitialData = async () => {
    try {
      const [tmplData, histData, healthData] = await Promise.all([
        apiService.getIngestionTemplates().catch(() => []),
        apiService.getIngestionHistory().catch(() => []),
        apiService.verifyDataLayer().catch(() => null)
      ]);
      setTemplates(tmplData);
      setHistory(histData);
      if (healthData && healthData.summary) {
        setSystemStats({
          totalJobs: healthData.summary.totalJobsActive || 1050,
          totalEmployers: healthData.checks.employers.actual || 54,
          totalSkills: healthData.checks.skills.actual || 62
        });
      }
    } catch (err) {
      console.error('Failed to load ingestion metadata:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleFileLoaded = async (csvContent: string, fileName: string) => {
    setIsLoadingPreview(true);
    setErrorMsg(null);
    setSuccessResult(null);
    try {
      const data = await apiService.previewCSV(csvContent, fileName);
      setPreview(data);
      setActiveFilter('all');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to parse CSV file');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleTemplateLoaded = async (csvContent: string, templateName: string) => {
    await handleFileLoaded(csvContent, `${templateName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`);
  };

  const handleExecuteIngestion = async (options: { skipInvalidRows: boolean; createMissingEmployers: boolean }) => {
    if (!preview) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const result = await apiService.executeIngestion({
        fileName: preview.fileName,
        rows: preview.rows,
        skipInvalidRows: options.skipInvalidRows,
        createMissingEmployers: options.createMissingEmployers
      });

      setSuccessResult(result);
      setIsConfirmationOpen(false);
      setPreview(null);

      // Update local system counts
      setSystemStats(prev => ({
        ...prev,
        totalJobs: result.newTotalJobs,
        totalEmployers: result.newTotalEmployers
      }));

      // Reload audit history
      const updatedHistory = await apiService.getIngestionHistory().catch(() => []);
      setHistory(updatedHistory);

      // Trigger callback to re-fetch dashboards and analytics across the app
      if (onIngestionCompleted) {
        onIngestionCompleted();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to commit batch ingestion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                <Upload className="w-3 h-3" />
                Data Ingestion & Extraction Engine
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 font-medium">
                Admin Government Portal
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1.5">
              Job Market Data Ingestion & Skill Normalization
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Ingest real-world employer job requisitions via CSV, automatically parse and normalize technical competencies against national qualification frameworks, map acronyms and aliases (e.g. JS → JavaScript, React.js → React, Postgres → PostgreSQL, ML → Machine Learning), and instantly propagate live demand analytics.
            </p>
          </div>

          {/* KPI Indicators */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-right">
              <div className="text-xs text-slate-500 uppercase font-semibold">
                Total Jobs Analyzed
              </div>
              <div className="text-lg font-bold text-slate-900">
                {systemStats.totalJobs.toLocaleString()}
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-right">
              <div className="text-xs text-slate-500 uppercase font-semibold">
                Employers
              </div>
              <div className="text-lg font-bold text-slate-900">
                {systemStats.totalEmployers.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('upload')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            CSV Ingestion Pipeline
          </button>

          <button
            onClick={() => setActiveTab('playground')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'playground'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            Skill Normalization Playground
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Ingestion History ({history.length})
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-950 text-sm">
                Batch Ingestion Successful!
              </h4>
              <p className="text-emerald-800 mt-0.5">
                {successResult.message} Database now tracks <strong>{successResult.newTotalJobs}</strong> total jobs and <strong>{successResult.newTotalEmployers}</strong> employers. Demand intelligence analytics have updated dynamically.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onNavigateToDemand && (
              <button
                onClick={onNavigateToDemand}
                className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3.5 py-1.5 rounded-lg transition"
              >
                View Updated Demand <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setSuccessResult(null)}
              className="text-emerald-700 hover:text-emerald-900 px-2.5 py-1.5 rounded"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Error Notification Banner */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-rose-600 hover:text-rose-800 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: CSV Ingestion Pipeline */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          {!preview ? (
            <CSVUploadZone
              onFileLoaded={handleFileLoaded}
              onTemplateLoaded={handleTemplateLoaded}
              templates={templates}
              isLoading={isLoadingPreview}
            />
          ) : (
            <div className="space-y-6">
              {/* Preview Header & Action Bar */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    CSV
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      File Preview: {preview.fileName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {preview.totalRows} records parsed · {preview.validRowsCount} valid · {preview.warningRowsCount} with warnings · {preview.errorRowsCount} errors
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setPreview(null)}
                    className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition"
                  >
                    Upload Different File
                  </button>

                  <button
                    onClick={() => setIsConfirmationOpen(true)}
                    disabled={preview.validRowsCount === 0 && preview.warningRowsCount === 0}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Review & Ingest {preview.validRowsCount + preview.warningRowsCount} Records
                  </button>
                </div>
              </div>

              {/* Validation Errors & Warnings Drawer */}
              <ValidationErrorsDrawer
                preview={preview}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />

              {/* Extracted Skills Summary Strip */}
              <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Extracted & Normalized Competencies Summary
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {preview.extractedSkillsSummary.uniqueNormalizedSkills} unique standardized competencies identified from job descriptions and skills columns.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {preview.extractedSkillsSummary.topIdentifiedSkills.slice(0, 6).map((item, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-800 text-slate-200 border border-slate-700 px-2 py-0.5 rounded text-[11px] flex items-center gap-1"
                      >
                        <span className="font-medium text-indigo-300">{item.term}</span>
                        <span className="text-[10px] text-slate-400 bg-slate-900 px-1 rounded font-mono">
                          {item.count}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detailed Parsed Rows Preview Table */}
              <IngestionPreviewTable
                preview={preview}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                onSkillClick={onNavigateToSkill}
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Skill Extraction Playground */}
      {activeTab === 'playground' && (
        <SkillExtractionPlayground onSkillSelected={onNavigateToSkill} />
      )}

      {/* TAB 3: Ingestion History & Audit Log */}
      {activeTab === 'history' && (
        <IngestionHistoryTable
          history={history}
          isLoading={false}
          onRefresh={loadInitialData}
        />
      )}

      {/* Confirmation Modal */}
      {preview && (
        <IngestionConfirmationModal
          preview={preview}
          isOpen={isConfirmationOpen}
          onClose={() => setIsConfirmationOpen(false)}
          onConfirm={handleExecuteIngestion}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};
