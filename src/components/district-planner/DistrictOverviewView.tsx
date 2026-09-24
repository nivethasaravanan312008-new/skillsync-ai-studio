/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  DistrictPlannerOverviewResponse,
  DistrictOverviewItem
} from '../../types/dataModel.ts';
import { MaharashtraMap } from './MaharashtraMap.tsx';
import {
  Building2,
  Users,
  GraduationCap,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Layers,
  Search,
  Filter,
  SlidersHorizontal,
  Compass,
  Sparkles,
  MapPin,
  CheckCircle2
} from 'lucide-react';

interface DistrictOverviewViewProps {
  overview: DistrictPlannerOverviewResponse;
  selectedDistrictId: string | null;
  onSelectDistrict: (districtId: string) => void;
}

export function DistrictOverviewView({
  overview,
  selectedDistrictId,
  onSelectDistrict
}: DistrictOverviewViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [deficitSort, setDeficitSort] = useState<'desc' | 'asc'>('desc');

  const { statewideKpis, districts } = overview;

  // Filter and sort districts
  const filteredDistricts = districts.filter(d => {
    const matchesSearch =
      searchQuery === '' ||
      d.districtName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.division.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.industrialHubType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiv = divisionFilter === 'all' || d.division.toLowerCase() === divisionFilter.toLowerCase();
    return matchesSearch && matchesDiv;
  }).sort((a, b) => {
    if (deficitSort === 'desc') {
      return b.capacityDeficit - a.capacityDeficit;
    }
    return a.capacityDeficit - b.capacityDeficit;
  });

  // Extract unique divisions
  const divisions = Array.from(new Set(districts.map(d => d.division)));

  return (
    <div className="space-y-6">
      {/* Overview Top Welcome Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-semibold px-2 py-0.5 rounded tracking-wide uppercase">
                Directorate of Vocational Education &amp; Training
              </span>
              <span className="text-xs text-slate-500 font-mono">Government of Maharashtra</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1.5">
              District Training Planner
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Real-time strategic synthesis of industrial labour-market hiring demand versus vocational institute capacity across Maharashtra districts. Algorithmic recommendations for seat expansions, course introductions, trainer recruitment, and curriculum modernization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-right">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Districts Monitored</div>
              <div className="text-xl font-bold text-white tabular-nums">
                {statewideKpis.totalDistricts} Industrial Hubs
              </div>
            </div>
          </div>
        </div>

        {/* 6 Statewide KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-lg">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              <span>Job Demand</span>
            </div>
            <div className="text-lg font-bold text-white mt-1 tabular-nums">
              {statewideKpis.totalJobDemandOpenings.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-500">
              Statewide verified vacancies
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-lg">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Training Capacity</span>
            </div>
            <div className="text-lg font-bold text-indigo-300 mt-1 tabular-nums">
              {statewideKpis.totalSanctionedCapacity.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-500">
              {statewideKpis.totalEnrolledSeats.toLocaleString('en-IN')} enrolled
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-lg">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Capacity Deficit</span>
            </div>
            <div className="text-lg font-bold text-amber-400 mt-1 tabular-nums">
              +{statewideKpis.totalCapacityDeficit.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-500">
              unmet hiring demand
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-lg">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Certified Trainers</span>
            </div>
            <div className="text-lg font-bold text-cyan-300 mt-1 tabular-nums">
              {statewideKpis.totalTrainers}
            </div>
            <div className="text-[10px] text-slate-500">
              Avg Ratio: 1:{statewideKpis.overallStudentToTrainerRatio}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-lg">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Avg Placement</span>
            </div>
            <div className="text-lg font-bold text-emerald-400 mt-1 tabular-nums">
              {statewideKpis.averagePlacementRate}%
            </div>
            <div className="text-[10px] text-slate-500">
              across accredited ITIs
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-lg">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Urgent Actions</span>
            </div>
            <div className="text-lg font-bold text-purple-400 mt-1 tabular-nums">
              {statewideKpis.urgentRecommendations}
            </div>
            <div className="text-[10px] text-slate-500">
              high-priority sanctions
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Maharashtra Map Visualization */}
      <MaharashtraMap
        districts={districts}
        selectedDistrictId={selectedDistrictId}
        onSelectDistrict={onSelectDistrict}
      />

      {/* District Cards Grid */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              Maharashtra Industrial Districts &bull; Tactical Planning Cards
            </h3>
            <p className="text-xs text-slate-400">
              Click &quot;Plan District&quot; on any hub to view granular seat allocations, missing courses, and trainer requirements.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
              <input
                type="text"
                placeholder="Search district..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={divisionFilter}
              onChange={e => setDivisionFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Divisions</option>
              {divisions.map(div => (
                <option key={div} value={div}>
                  {div} Division
                </option>
              ))}
            </select>

            <select
              value={deficitSort}
              onChange={e => setDeficitSort(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
            >
              <option value="desc">Highest Deficit First</option>
              <option value="asc">Lowest Deficit First</option>
            </select>
          </div>
        </div>

        {/* District Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDistricts.map(district => {
            const isSevere = district.capacityDeficit > 200;

            return (
              <div
                key={district.districtId}
                className={`bg-slate-950 border rounded-xl p-5 shadow-lg flex flex-col justify-between transition-all duration-200 hover:border-slate-700 ${
                  isSevere ? 'border-red-900/40 bg-gradient-to-b from-slate-950 to-red-950/10' : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                      {district.division} Division
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border font-mono ${
                        isSevere
                          ? 'bg-red-950 text-red-300 border-red-800'
                          : district.capacityDeficit > 50
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}
                    >
                      {district.capacityDeficit > 0 ? `-${district.capacityDeficit} Deficit` : 'Balanced'}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-white mt-1">
                    {district.districtName}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    {district.industrialHubType}
                  </p>

                  {/* Demand vs Capacity Meter */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500">Demand Openings</div>
                      <div className="text-base font-bold text-white tabular-nums">
                        {district.totalJobDemandOpenings}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Capacity Seats</div>
                      <div className="text-base font-bold text-sky-400 tabular-nums">
                        {district.sanctionedCapacity}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Placement</div>
                      <div className="text-base font-bold text-emerald-400 tabular-nums">
                        {district.placementRatePercentage}%
                      </div>
                    </div>
                  </div>

                  {/* Top Sectors & Deficit Skills */}
                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="text-[11px] text-slate-400">
                      <span className="text-slate-500">Key Sectors:</span> {district.topSectorNames.join(', ')}
                    </div>
                    {district.topDeficitSkillNames.length > 0 && (
                      <div className="text-[11px] text-amber-300/90">
                        <span className="text-slate-500">Gap Skills:</span> {district.topDeficitSkillNames.slice(0, 2).join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    Faculty: <strong className="text-cyan-400 tabular-nums">{district.totalTrainers} Trainers</strong> (1:{district.studentToTrainerRatio})
                  </div>

                  <button
                    onClick={() => onSelectDistrict(district.districtId)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-sm shadow-indigo-600/20"
                  >
                    <span>Plan District</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparative Ranking Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              Maharashtra District Training Infrastructure Comparative Table
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cross-district benchmarking of labour demand, capacity gaps, student-trainer ratios, and urgent policy actions.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Showing {filteredDistricts.length} of {districts.length} Districts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
              <tr>
                <th className="px-3 py-2.5">District</th>
                <th className="px-3 py-2.5">Division</th>
                <th className="px-3 py-2.5 text-right">Job Openings</th>
                <th className="px-3 py-2.5 text-right">Sanctioned Seats</th>
                <th className="px-3 py-2.5 text-right">Enrolled Seats</th>
                <th className="px-3 py-2.5 text-right">Capacity Deficit</th>
                <th className="px-3 py-2.5 text-center">Trainers (Ratio)</th>
                <th className="px-3 py-2.5 text-center">Courses</th>
                <th className="px-3 py-2.5 text-right">Placement Rate</th>
                <th className="px-3 py-2.5 text-center">Urgent Recs</th>
                <th className="px-3 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDistricts.map(d => (
                <tr key={d.districtId} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-3 py-2.5 font-bold text-white">
                    {d.districtName}
                  </td>
                  <td className="px-3 py-2.5 text-slate-400 font-mono text-[11px]">
                    {d.division}
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold text-white tabular-nums">
                    {d.totalJobDemandOpenings}
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-sky-400 tabular-nums">
                    {d.sanctionedCapacity}
                  </td>
                  <td className="px-3 py-2.5 text-right text-slate-300 tabular-nums">
                    {d.enrolledSeats} ({d.capacityUtilizationRate}%)
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold tabular-nums">
                    <span className={d.capacityDeficit > 150 ? 'text-red-400' : d.capacityDeficit > 50 ? 'text-amber-400' : 'text-emerald-400'}>
                      {d.capacityDeficit > 0 ? `+${d.capacityDeficit}` : '0'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center tabular-nums text-slate-300">
                    <span className="font-semibold text-cyan-300">{d.totalTrainers}</span>
                    <span className="text-slate-500 text-[10px] ml-1">(1:{d.studentToTrainerRatio})</span>
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono text-slate-300 tabular-nums">
                    {d.coursesAvailableCount}
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold text-emerald-400 tabular-nums">
                    {d.placementRatePercentage}%
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        d.urgentRecommendationsCount > 0
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : 'text-slate-500'
                      }`}
                    >
                      {d.urgentRecommendationsCount} Actions
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => onSelectDistrict(d.districtId)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs rounded transition cursor-pointer font-medium"
                    >
                      Open Plan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulated Data Bottom Disclaimer */}
      <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Demo / Simulated Data:</strong> Figures and recommendations in the District Training Planner are generated from calibrated simulated datasets for analytical and capacity planning validation.
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          GOVT OF MAHARASHTRA &bull; SKILL DEVELOPMENT
        </span>
      </div>
    </div>
  );
}
