/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Wand2,
  CheckCircle2,
  ArrowRight,
  Code2,
  Sparkles,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { apiService } from '../../services/apiService.ts';
import { ExtractedSkillMapping } from '../../types/dataModel.ts';

interface SkillExtractionPlaygroundProps {
  onSkillSelected?: (skillId: string) => void;
}

export const SkillExtractionPlayground: React.FC<SkillExtractionPlaygroundProps> = ({ onSkillSelected }) => {
  const [inputText, setInputText] = useState(
    'We are hiring a Senior Backend Architect to lead our microservices platform. Requirements include Python, FastAPI, REST API, Docker and AWS. In addition, the candidate should be familiar with JS and React.js on the frontend, with Postgres for persistence and ML model deployment.'
  );
  const [skillsColumnText, setSkillsColumnText] = useState('Python, FastAPI, REST API, Docker, AWS, JS, React.js, Postgres, ML');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    extractedSkills: ExtractedSkillMapping[];
    unmatchedTerms: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExtract = async () => {
    if (!inputText.trim() && !skillsColumnText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.extractSkillsFromText(inputText, skillsColumnText);
      setResults(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to extract skills');
    } finally {
      setLoading(false);
    }
  };

  const handlePreset = (presetText: string, presetSkills: string) => {
    setInputText(presetText);
    setSkillsColumnText(presetSkills);
  };

  const handleCopyJson = () => {
    if (!results) return;
    navigator.clipboard.writeText(JSON.stringify(results.extractedSkills, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Run initial extraction on mount
  React.useEffect(() => {
    handleExtract();
  }, []);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-semibold text-white">
                Live NLP Skill Extraction & Normalization Engine
              </h3>
            </div>
            <p className="text-sm text-slate-300 max-w-3xl">
              Paste raw job descriptions or comma-separated requirements. The engine parses technical tokens, normalizes industry acronyms (e.g. <span className="text-indigo-300 font-mono text-xs">JS → JavaScript</span>, <span className="text-indigo-300 font-mono text-xs">React.js → React</span>, <span className="text-indigo-300 font-mono text-xs">Postgres → PostgreSQL</span>, <span className="text-indigo-300 font-mono text-xs">ML → Machine Learning</span>), and maps them directly to the NSQF standardized qualification taxonomy.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => handlePreset(
                'Looking for a developer with Python, FastAPI, REST API, Docker and AWS experience. Candidate must know JS and React.js with Postgres and ML.',
                'Python, FastAPI, REST API, Docker, AWS, JS, React.js, Postgres, ML'
              )}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              Load Hackathon Spec Preset
            </button>
            <button
              onClick={() => handlePreset(
                'Industrial technician to operate 5-axis CNC machining centers. Must understand G-Code, PLC and SCADA automation with OSHA industrial safety.',
                'CNC, G-Code, PLC, SCADA, OSHA'
              )}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              Load Manufacturing Preset
            </button>
          </div>
        </div>
      </div>

      {/* Input Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Input Form */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Free-Form Job Description (Text Extraction)
            </label>
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              rows={4}
              placeholder="Paste job posting text here..."
              className="w-full text-sm border border-slate-200 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
            />

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Explicit Skills Column / Tag Input (Comma or Delimited)
              </label>
              <input
                type="text"
                value={skillsColumnText}
                onChange={e => setSkillsColumnText(e.target.value)}
                placeholder="e.g. Python, FastAPI, REST API, Docker, AWS, JS, React.js, Postgres, ML"
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Supports variations, acronyms, and multi-word skills
              </span>
              <button
                onClick={handleExtract}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5" />
                {loading ? 'Extracting...' : 'Extract & Normalize'}
              </button>
            </div>
          </div>

          {/* Quick Variation Mapping Matrix */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Standard Normalization Rules In Effect
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="font-mono text-slate-500">"JS"</span>
                <span className="text-slate-400 mx-1">→</span>
                <span className="font-medium text-emerald-700">JavaScript</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="font-mono text-slate-500">"React.js"</span>
                <span className="text-slate-400 mx-1">→</span>
                <span className="font-medium text-emerald-700">React</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="font-mono text-slate-500">"Postgres"</span>
                <span className="text-slate-400 mx-1">→</span>
                <span className="font-medium text-emerald-700">PostgreSQL</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="font-mono text-slate-500">"ML"</span>
                <span className="text-slate-400 mx-1">→</span>
                <span className="font-medium text-emerald-700">Machine Learning</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="font-mono text-slate-500">"REST API"</span>
                <span className="text-slate-400 mx-1">→</span>
                <span className="font-medium text-emerald-700">REST APIs</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="font-mono text-slate-500">"Docker"</span>
                <span className="text-slate-400 mx-1">→</span>
                <span className="font-medium text-emerald-700">Docker</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="font-mono text-slate-500">"AWS"</span>
                <span className="text-slate-400 mx-1">→</span>
                <span className="font-medium text-emerald-700">AWS Cloud</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="font-mono text-slate-500">"FastAPI"</span>
                <span className="text-slate-400 mx-1">→</span>
                <span className="font-medium text-emerald-700">FastAPI</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Results */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Extracted Competencies
                </h4>
                <p className="text-xs text-slate-500">
                  {results ? `${results.extractedSkills.length} normalized skills mapped` : 'Awaiting input extraction'}
                </p>
              </div>

              {results && results.extractedSkills.length > 0 && (
                <button
                  onClick={handleCopyJson}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 transition"
                  title="Copy extracted mapping JSON"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'JSON'}
                </button>
              )}
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs">Normalizing terms against National Skill Taxonomy...</p>
              </div>
            ) : results && results.extractedSkills.length > 0 ? (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {results.extractedSkills.map((skill, idx) => (
                  <div
                    key={`${skill.matchedSkillId}-${idx}`}
                    className="p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-lg border border-slate-200 hover:border-indigo-200 transition flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-900 text-sm">
                            {skill.normalizedTerm}
                          </span>

                          {skill.isVariationMapped && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-mono">
                              from "{skill.rawTerm}"
                            </span>
                          )}

                          <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded font-mono">
                            {skill.matchedSkillId}
                          </span>
                        </div>

                        <p className="text-slate-500 text-[11px] truncate mt-0.5">
                          Standardized: {skill.matchedSkillName}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-emerald-700 font-semibold text-[11px] block">
                        {Math.round(skill.confidence * 100)}% match
                      </span>
                      {onSkillSelected && (
                        <button
                          onClick={() => onSkillSelected(skill.matchedSkillId)}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-0.5 justify-end mt-0.5"
                        >
                          View Intel <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <Code2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">No skills extracted yet. Click "Extract & Normalize" above.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
