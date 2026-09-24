/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  Download,
  Database,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react';

interface CSVUploadZoneProps {
  onFileLoaded: (csvContent: string, fileName: string) => void;
  onTemplateLoaded: (csvContent: string, templateName: string) => void;
  templates: { id: string; name: string; description: string; csv: string }[];
  isLoading: boolean;
}

export const CSVUploadZone: React.FC<CSVUploadZoneProps> = ({
  onFileLoaded,
  onTemplateLoaded,
  templates,
  isLoading
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setFileError(null);
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      setFileError('Invalid file format. Please upload a standard comma-separated (.csv) file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        if (!content.trim()) {
          setFileError('Uploaded CSV file is empty.');
          return;
        }
        onFileLoaded(content, file.name);
      }
    };
    reader.onerror = () => {
      setFileError('Error reading uploaded CSV file.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const templateContent = `job_title,company,district,sector,description,skills,experience,salary,date
Senior Backend Architect,TechCorp India Pvt Ltd,Pune,IT & Software,"Microservices platform engineering with Python, FastAPI, REST API, Docker and AWS.","Python, FastAPI, REST API, Docker, AWS",4 years,₹14.5 LPA,2026-09-20
Frontend React Developer,Apex Infotech,Pune,IT & Software,"User interface development using modern JS and React.js.","JS, React.js, TypeScript",2 years,₹6.5 LPA,2026-09-21
Data Engineer,FinServe Global,Mumbai,Banking & Finance,"ETL pipelines and warehouse maintenance using Postgres and ML.","Postgres, ML, Python",3 years,₹10.5 LPA,2026-09-22
5-Axis CNC Machinist,Bharat Precision Works,Kolhapur,Manufacturing,"5-axis CNC milling, G-Code programming and precision CMM inspection.","CNC, G-Code, CMM",3 years,₹4.2 LPA,2026-09-19
EV Powertrain Technician,E-Mobility Motors,Pune,Automotive,"Assembly and servicing of EV battery packs with BMS calibration.","BMS, EV, Electrical Safety",2 years,₹3.8 LPA,2026-09-20`;

    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'job_postings_ingestion_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Upload Drag & Drop Box */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50/50'
            : 'border-slate-300 hover:border-slate-400 bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleChange}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Upload Job Postings CSV File
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Drag and drop your spreadsheet file here, or click to browse.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Browse CSV File
            </button>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3.5 py-2 rounded-lg transition border border-slate-200 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Template
            </button>
          </div>

          {fileError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center justify-center gap-1.5 mt-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {fileError}
            </div>
          )}
        </div>

        {/* Expected Fields Checklist */}
        <div className="mt-6 pt-5 border-t border-slate-100 max-w-2xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Recognized CSV Column Headers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px] border border-slate-200">
              job_title*
            </span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px] border border-slate-200">
              company*
            </span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px] border border-slate-200">
              district*
            </span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px] border border-slate-200">
              sector*
            </span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px] border border-slate-200">
              description
            </span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px] border border-slate-200">
              skills
            </span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px] border border-slate-200">
              experience
            </span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px] border border-slate-200">
              salary
            </span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px] border border-slate-200">
              date
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">
            * Indicates mandatory columns. Flexible column naming (e.g. title, employer, location) is automatically resolved.
          </p>
        </div>
      </div>

      {/* Quick Test Datasets (1-Click Evaluation) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Instant Demo Datasets (One-Click Evaluation)
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">
            Click any batch to load, validate, and preview immediately
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {templates.map(tmpl => (
            <div
              key={tmpl.id}
              onClick={() => onTemplateLoaded(tmpl.csv, tmpl.name)}
              className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h5 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                    {tmpl.name}
                  </h5>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                    CSV
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {tmpl.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-indigo-600 font-medium">
                <span>Load & Preview Batch</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
