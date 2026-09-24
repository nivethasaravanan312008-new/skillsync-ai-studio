/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  FileCheck2,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { AIInsightItem } from '../../types/dataModel.ts';

interface AIInsightsCardProps {
  insights: AIInsightItem[];
  onRefresh: () => void;
  isLoading: boolean;
  source?: string;
}

export const AIInsightsCard: React.FC<AIInsightsCardProps> = ({
  insights,
  onRefresh,
  isLoading,
  source
}) => {
  const getIcon = (type: string, severity: string) => {
    switch (type) {
      case 'gap_alert':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'curriculum_warning':
        return <FileCheck2 className="w-4 h-4 text-amber-400" />;
      case 'trend':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      default:
        return <Lightbulb className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getBorderColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500/40 bg-red-950/20';
      case 'warning':
        return 'border-amber-500/40 bg-amber-950/20';
      case 'success':
        return 'border-emerald-500/40 bg-emerald-950/20';
      default:
        return 'border-blue-500/40 bg-blue-950/20';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-xl p-5 shadow-2xl relative overflow-hidden">
      {/* Background subtle glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              AI Market & Policy Insights Engine
            </h3>
            <span className="bg-indigo-950 text-indigo-300 text-[10px] font-mono px-2 py-0.5 rounded border border-indigo-700/60 font-semibold">
              {source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Dynamic Analysis'}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Real-time synthesized intelligence derived from active filters, hiring velocity, and regional training capacity
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 border border-indigo-700/60 rounded-lg text-xs font-semibold transition cursor-pointer self-start sm:self-auto shadow-md"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Synthesizing...' : 'Regenerate Insights'}</span>
        </button>
      </div>

      {/* Dynamic Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10 mt-4">
        {insights.map(item => (
          <div
            key={item.id}
            className={`p-4 rounded-xl border ${getBorderColor(item.severity)} backdrop-blur flex flex-col justify-between transition hover:-translate-y-0.5`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded bg-slate-900/80 border border-slate-700/60">
                    {getIcon(item.type, item.severity)}
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">
                    {item.title}
                  </h4>
                </div>
                {item.metricHighlight && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900/90 text-indigo-300 border border-indigo-500/40 shrink-0">
                    {item.metricHighlight}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                {item.description}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
              <span className="capitalize">{item.type.replace('_', ' ')}</span>
              <span className="text-indigo-400 font-medium">Grounded in Active Records &bull; Live</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
