/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Briefcase,
  Users,
  Award,
  Send
} from 'lucide-react';
import { Employer, District, Sector } from '../../types/dataModel.ts';

interface CompanyProfileEditorProps {
  employer: Employer;
  districts: District[];
  sectors: Sector[];
  onSaveProfile: (updated: Employer) => Promise<void>;
  onRegisterNewCompany?: (newComp: Omit<Employer, 'id' | 'isVerified'>) => Promise<void>;
  allEmployers: Employer[];
  onSwitchEmployer: (empId: string) => void;
}

export const CompanyProfileEditor: React.FC<CompanyProfileEditorProps> = ({
  employer,
  districts,
  sectors,
  onSaveProfile,
  onRegisterNewCompany,
  allEmployers,
  onSwitchEmployer
}) => {
  const [isRegisteringNew, setIsRegisteringNew] = useState(false);
  const [name, setName] = useState(employer.name);
  const [sectorId, setSectorId] = useState(employer.sectorId);
  const [districtId, setDistrictId] = useState(employer.districtId);
  const [companySize, setCompanySize] = useState(employer.companySize);
  const [contactPerson, setContactPerson] = useState(employer.contactPerson);
  const [email, setEmail] = useState(employer.email);
  const [phone, setPhone] = useState(employer.phone);
  const [address, setAddress] = useState(employer.address);
  const [tier, setTier] = useState(employer.tier);

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync state when active employer changes
  React.useEffect(() => {
    setName(employer.name);
    setSectorId(employer.sectorId);
    setDistrictId(employer.districtId);
    setCompanySize(employer.companySize);
    setContactPerson(employer.contactPerson);
    setEmail(employer.email);
    setPhone(employer.phone);
    setAddress(employer.address);
    setTier(employer.tier);
  }, [employer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setStatusMessage(null);

      if (isRegisteringNew && onRegisterNewCompany) {
        await onRegisterNewCompany({
          name: name.trim(),
          sectorId,
          districtId,
          companySize,
          contactPerson,
          email,
          phone,
          address,
          tier
        });
        setStatusMessage({ type: 'success', text: `New company profile "${name}" successfully registered and authenticated!` });
        setIsRegisteringNew(false);
      } else {
        await onSaveProfile({
          ...employer,
          name: name.trim(),
          sectorId,
          districtId,
          companySize,
          contactPerson,
          email,
          phone,
          address,
          tier
        });
        setStatusMessage({ type: 'success', text: 'Company profile successfully updated and synchronized across Maharashtra data layer!' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to update company profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header and Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">
              {isRegisteringNew ? 'Register New Industry Partner' : 'Employer Profile & Verification'}
            </h2>
            <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-mono uppercase">
              Corporate Account
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage corporate credentials, sector classification, and registered contact information for labour market surveys.
          </p>
        </div>

        {/* Employer Switcher (Simulating Login / Multi-tenant Portal) */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <label className="block text-[11px] text-slate-400 font-medium mb-1">Switch Active Employer Account:</label>
            <select
              value={employer.id}
              onChange={(e) => onSwitchEmployer(e.target.value)}
              className="bg-slate-900 text-slate-200 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              {allEmployers.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.tier})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsRegisteringNew(!isRegisteringNew);
              if (!isRegisteringNew) {
                setName('');
                setEmail('');
                setPhone('');
                setAddress('');
              }
            }}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition cursor-pointer self-end"
          >
            {isRegisteringNew ? 'Cancel Registration' : '+ Register New'}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-700/70 text-emerald-300'
              : 'bg-rose-950/60 border border-rose-700/70 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">Company / Entity Legal Name *</label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tata Motors Engineering Pvt Ltd"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Company Workforce Size *</label>
            <select
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="Small (<50)">Small (&lt;50 employees)</option>
              <option value="Mid-size (50-250)">Mid-size (50-250 employees)</option>
              <option value="Enterprise (250-1000)">Enterprise (250-1,000 employees)</option>
              <option value="Large Enterprise (1000+)">Large Enterprise (1,000+ employees)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Primary Industry Sector *</label>
            <select
              value={sectorId}
              onChange={(e) => setSectorId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              {sectors.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Headquarters / Plant District *</label>
            <select
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              {districts.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Partnership Tier</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="Strategic Partner">Strategic Partner (Direct Placement MoU)</option>
              <option value="MOU Signed">MOU Signed (Curriculum Advisory)</option>
              <option value="Standard">Standard Registered Employer</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Contact Person / Talent Lead *</label>
            <input
              type="text"
              required
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="e.g. Priya Deshmukh (Head of HR)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Corporate Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recruitment@tatamotors.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Telephone Contact *</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 20 6613 0000"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Facility / Campus Physical Address</label>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Plot No. B-4, Hinjawadi MIDC Phase II, Pune, Maharashtra 411057"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-700/80">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Government Accredited Corporate Profile</span>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{isSaving ? 'Synchronizing...' : isRegisteringNew ? 'Register Partner' : 'Save Company Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
