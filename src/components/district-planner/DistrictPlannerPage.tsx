/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService.ts';
import {
  DistrictPlannerOverviewResponse,
  DistrictDetailPlan
} from '../../types/dataModel.ts';
import { DistrictOverviewView } from './DistrictOverviewView.tsx';
import { DistrictDetailView } from './DistrictDetailView.tsx';
import { MapPin, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

interface DistrictPlannerPageProps {
  initialDistrictId?: string | null;
}

export function DistrictPlannerPage({ initialDistrictId }: DistrictPlannerPageProps) {
  const [overview, setOverview] = useState<DistrictPlannerOverviewResponse | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(initialDistrictId || null);
  const [districtPlan, setDistrictPlan] = useState<DistrictDetailPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [planLoading, setPlanLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load Overview Data
  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getDistrictPlannerOverview();
      setOverview(data);
    } catch (err: any) {
      console.error('[District Planner] Error fetching overview:', err);
      setError(err?.message || 'Failed to load district planner overview');
    } finally {
      setLoading(false);
    }
  };

  // Load Detail Plan when a district is selected
  const fetchDistrictPlan = async (districtId: string) => {
    setPlanLoading(true);
    setError(null);
    try {
      const plan = await apiService.getDistrictDetailPlan(districtId);
      setDistrictPlan(plan);
      setSelectedDistrictId(districtId);
    } catch (err: any) {
      console.error(`[District Planner] Error fetching plan for ${districtId}:`, err);
      setError(err?.message || `Failed to load district training plan for ${districtId}`);
    } finally {
      setPlanLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (selectedDistrictId) {
      fetchDistrictPlan(selectedDistrictId);
    } else {
      setDistrictPlan(null);
    }
  }, [selectedDistrictId]);

  const handleSelectDistrict = (districtId: string) => {
    setSelectedDistrictId(districtId);
  };

  const handleBackToOverview = () => {
    setSelectedDistrictId(null);
    setDistrictPlan(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] text-center p-8 bg-slate-950 border border-slate-800 rounded-xl">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
        <h3 className="text-base font-semibold text-white">Synthesizing Maharashtra District Training Data...</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md">
          Aggregating verified employer vacancies, ITI training capacity, student-to-trainer ratios, and skill gap deficits.
        </p>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="bg-slate-950 border border-red-900/50 rounded-xl p-8 text-center max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">Unable to Load District Planner</h3>
        <p className="text-xs text-red-300 mt-1.5">{error || 'An unexpected error occurred.'}</p>
        <button
          onClick={() => {
            if (selectedDistrictId) {
              fetchDistrictPlan(selectedDistrictId);
            } else {
              fetchOverview();
            }
          }}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // If a district is selected and its plan is loaded, show District Detail View
  if (selectedDistrictId && districtPlan) {
    return (
      <div>
        {planLoading && (
          <div className="fixed top-4 right-4 z-50 bg-slate-900/90 text-indigo-300 border border-indigo-500/50 px-3 py-2 rounded-lg text-xs flex items-center gap-2 shadow-xl backdrop-blur">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Updating district plan metrics...</span>
          </div>
        )}
        <DistrictDetailView
          plan={districtPlan}
          allDistricts={overview.districts.map(d => ({ id: d.districtId, name: d.districtName }))}
          onBackToOverview={handleBackToOverview}
          onSelectDistrict={handleSelectDistrict}
        />
      </div>
    );
  }

  // Otherwise, show District Overview View
  return (
    <div>
      <DistrictOverviewView
        overview={overview}
        selectedDistrictId={selectedDistrictId}
        onSelectDistrict={handleSelectDistrict}
      />
    </div>
  );
}
