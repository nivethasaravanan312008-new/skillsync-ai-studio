/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building,
  MapPin,
  Award,
  Users,
  Mail,
  Phone,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { TrainingInstitute, District } from '../../types/dataModel.ts';
import { apiService } from '../../services/apiService.ts';

interface InstituteProfileEditorProps {
  institute: TrainingInstitute;
  districts: District[];
  onProfileUpdated: (updated: TrainingInstitute) => void;
  onInstituteCreated: (created: TrainingInstitute) => void;
}

export const InstituteProfileEditor: React.FC<InstituteProfileEditorProps> = ({
  institute,
  districts,
  onProfileUpdated,
  onInstituteCreated
}) => {
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<TrainingInstitute>>({
    name: institute.name,
    type: institute.type,
    districtId: institute.districtId,
    address: institute.address,
    accreditationRating: institute.accreditationRating,
    totalCapacitySeats: institute.totalCapacitySeats,
    principalContact: institute.principalContact,
    email: institute.email,
    phone: institute.phone,
    establishedYear: institute.establishedYear
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleToggleCreate = () => {
    if (!isCreatingNew) {
      setIsCreatingNew(true);
      setFormData({
        name: '',
        type: 'Government ITI',
        districtId: districts[0]?.id || 'dist-pune',
        address: '',
        accreditationRating: 'A',
        totalCapacitySeats: 600,
        principalContact: '',
        email: '',
        phone: '+91 ',
        establishedYear: 2015
      });
    } else {
      setIsCreatingNew(false);
      setFormData({
        name: institute.name,
        type: institute.type,
        districtId: institute.districtId,
        address: institute.address,
        accreditationRating: institute.accreditationRating,
        totalCapacitySeats: institute.totalCapacitySeats,
        principalContact: institute.principalContact,
        email: institute.email,
        phone: institute.phone,
        establishedYear: institute.establishedYear
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (!formData.name?.trim()) {
        throw new Error('Institute name is required');
      }

      if (isCreatingNew) {
        const created = await apiService.createInstitute(formData);
        setSuccessMsg(`Institute "${created.name}" successfully created and registered!`);
        setIsCreatingNew(false);
        onInstituteCreated(created);
      } else {
        const updated = await apiService.updateInstitute(institute.id, formData);
        setSuccessMsg('Institute profile details updated successfully!');
        onProfileUpdated(updated);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save institute profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isCreatingNew ? 'Register New Training Institute' : 'Institute Profile & Accreditation Details'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              DVET Maharashtra Registered
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Maintain accurate capacity figures, accreditation grade, and nodal leadership credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleCreate}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition"
        >
          <Plus className="w-3.5 h-3.5" />
          {isCreatingNew ? 'Cancel & Return to Current' : 'Register Another Institute'}
        </button>
      </div>

      {successMsg && (
        <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-sm rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 p-3 bg-rose-950/80 border border-rose-700 text-rose-200 text-sm rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="mt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Institute Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Institute Legal Name *
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Government ITI Aundh (Centre of Excellence)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Institute Type */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Institute Category / Governance Type
            </label>
            <select
              value={formData.type || 'Government ITI'}
              onChange={e => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Government ITI">Government ITI (Industrial Training Institute)</option>
              <option value="Polytechnic Institute">Polytechnic Institute (Diploma Engineering)</option>
              <option value="MSDC Skill Center">MSDC Skill Center (Maharashtra State)</option>
              <option value="Engineering College">Engineering College Vocational Unit</option>
              <option value="Private Training Partner">Private Training Partner / Corporate Academy</option>
            </select>
          </div>

          {/* District Headquarters */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              District Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <select
                value={formData.districtId || ''}
                onChange={e => setFormData({ ...formData, districtId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {districts.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.division} Division)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Physical Address */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Campus Address & Pincode
            </label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full street address, MIDC industrial area or road"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Accreditation Rating */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Accreditation Rating (NCVT / DGT / MSBTE)
            </label>
            <div className="relative">
              <Award className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <select
                value={formData.accreditationRating || 'A'}
                onChange={e => setFormData({ ...formData, accreditationRating: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="A+">Grade A+ (Premier Center of Excellence)</option>
                <option value="A">Grade A (High Performance Accredited)</option>
                <option value="B+">Grade B+ (Standard Certified)</option>
                <option value="B">Grade B (Provisional Approval)</option>
              </select>
            </div>
          </div>

          {/* Total Capacity Seats */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Total Sanctioned Annual Capacity (Seats)
            </label>
            <div className="relative">
              <Users className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="number"
                min="30"
                max="5000"
                value={formData.totalCapacitySeats || 600}
                onChange={e => setFormData({ ...formData, totalCapacitySeats: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Principal / Nodal Contact Person */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Principal / Institute Director Name
            </label>
            <input
              type="text"
              value={formData.principalContact || ''}
              onChange={e => setFormData({ ...formData, principalContact: e.target.value })}
              placeholder="e.g. Dr. S. K. Mahajan"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Established Year */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Established Year
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="number"
                min="1900"
                max="2026"
                value={formData.establishedYear || 1995}
                onChange={e => setFormData({ ...formData, establishedYear: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Official Administration Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={formData.email || ''}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="principal@institute.ac.in"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Official Contact Phone
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={formData.phone || ''}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 20 25691010"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-semibold text-sm shadow-md transition"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Profile...' : isCreatingNew ? 'Create Institute Record' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
