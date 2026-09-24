/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Briefcase,
  Layers,
  Building2,
  GraduationCap,
  MapPin,
  AlertTriangle,
  Award,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { DashboardMetrics } from '../../types/dataModel.ts';

interface KPIGridProps {
  metrics: DashboardMetrics;
  onCardClick: (type: 'jobs' | 'skills' | 'employers' | 'courses' | 'districts' | 'gaps' | 'placements' | 'emerging') => void;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ metrics, onCardClick }) => {
  const { kpis } = metrics;

  const cards = [
    {
      id: 'jobs' as const,
      label: 'Jobs Analyzed',
      value: kpis.jobsAnalyzed.toLocaleString(),
      subtext: `${kpis.totalOpenings.toLocaleString()} Total Active Openings`,
      icon: Briefcase,
      color: 'blue',
      borderClass: 'hover:border-blue-500/60',
      badge: 'Live Postings'
    },
    {
      id: 'skills' as const,
      label: 'Skills Tracked',
      value: kpis.skillsTracked.toString(),
      subtext: 'Mapped to NSQF 3–7 Framework',
      icon: Layers,
      color: 'indigo',
      borderClass: 'hover:border-indigo-500/60',
      badge: 'Taxonomy'
    },
    {
      id: 'employers' as const,
      label: 'Employers',
      value: kpis.employersCount.toString(),
      subtext: 'Recruiting Active Trainees',
      icon: Building2,
      color: 'cyan',
      borderClass: 'hover:border-cyan-500/60',
      badge: 'Industry'
    },
    {
      id: 'courses' as const,
      label: 'Courses',
      value: kpis.coursesCount.toString(),
      subtext: `${metrics.charts.courseAlignmentDistribution.averageHealthScore}% Avg Health Score`,
      icon: GraduationCap,
      color: 'emerald',
      borderClass: 'hover:border-emerald-500/60',
      badge: 'Accredited'
    },
    {
      id: 'districts' as const,
      label: 'Districts',
      value: kpis.districtsCount.toString(),
      subtext: 'Across Maharashtra Regions',
      icon: MapPin,
      color: 'rose',
      borderClass: 'hover:border-rose-500/60',
      badge: 'Statewide'
    },
    {
      id: 'gaps' as const,
      label: 'Skill Gaps Detected',
      value: kpis.skillGapsDetected.toString(),
      subtext: 'High & Moderate Deficits',
      icon: AlertTriangle,
      color: 'amber',
      borderClass: 'hover:border-amber-500/60',
      badge: kpis.skillGapsDetected > 0 ? 'Urgent' : 'Balanced'
    },
    {
      id: 'placements' as const,
      label: 'Placement Rate',
      value: `${kpis.placementRate}%`,
      subtext: `₹${(metrics.charts.placementOutcomes.medianSalaryINR / 100000).toFixed(1)}L Median Package`,
      icon: Award,
      color: 'teal',
      borderClass: 'hover:border-teal-500/60',
      badge: `${metrics.charts.placementOutcomes.retentionRate6Months}% Retention`
    },
    {
      id: 'emerging' as const,
      label: 'Emerging Skills',
      value: kpis.emergingSkillsCount.toString(),
      subtext: 'High Velocity Growth (>25%)',
      icon: Sparkles,
      color: 'purple',
      borderClass: 'hover:border-purple-500/60',
      badge: 'Industry 4.0'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return { iconBg: 'bg-blue-950/70 border-blue-800 text-blue-400', badgeBg: 'bg-blue-950 text-blue-300 border-blue-800' };
      case 'indigo':
        return { iconBg: 'bg-indigo-950/70 border-indigo-800 text-indigo-400', badgeBg: 'bg-indigo-950 text-indigo-300 border-indigo-800' };
      case 'cyan':
        return { iconBg: 'bg-cyan-950/70 border-cyan-800 text-cyan-400', badgeBg: 'bg-cyan-950 text-cyan-300 border-cyan-800' };
      case 'emerald':
        return { iconBg: 'bg-emerald-950/70 border-emerald-800 text-emerald-400', badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
      case 'rose':
        return { iconBg: 'bg-rose-950/70 border-rose-800 text-rose-400', badgeBg: 'bg-rose-950 text-rose-300 border-rose-800' };
      case 'amber':
        return { iconBg: 'bg-amber-950/70 border-amber-800 text-amber-400', badgeBg: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'teal':
        return { iconBg: 'bg-teal-950/70 border-teal-800 text-teal-400', badgeBg: 'bg-teal-950 text-teal-300 border-teal-800' };
      case 'purple':
        return { iconBg: 'bg-purple-950/70 border-purple-800 text-purple-400', badgeBg: 'bg-purple-950 text-purple-300 border-purple-800' };
      default:
        return { iconBg: 'bg-slate-900 border-slate-700 text-slate-300', badgeBg: 'bg-slate-900 text-slate-400 border-slate-700' };
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {cards.map(card => {
        const Icon = card.icon;
        const cl = getColorClasses(card.color);

        return (
          <button
            key={card.id}
            onClick={() => onCardClick(card.id)}
            className={`group bg-slate-950/90 border border-slate-800/90 rounded-xl p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${card.borderClass} flex flex-col justify-between relative cursor-pointer overflow-hidden`}
          >
            {/* Top Row: Icon and Badge */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${cl.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${cl.badgeBg}`}>
                  {card.badge}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition shrink-0" />
              </div>
            </div>

            {/* Value & Label */}
            <div>
              <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight group-hover:text-blue-300 transition">
                {card.value}
              </div>
              <div className="text-xs font-semibold text-slate-300 mt-1">
                {card.label}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                {card.subtext}
              </div>
            </div>

            {/* Hover subtle glow accent */}
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/0 to-transparent group-hover:via-blue-500/50 transition duration-300"></div>
          </button>
        );
      })}
    </div>
  );
};
