/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
  Calendar,
  Sparkles
} from 'lucide-react';
import { InstituteEquipment, Skill, Course, TrainingInstitute } from '../../types/dataModel.ts';
import { apiService } from '../../services/apiService.ts';

interface EquipmentManagerProps {
  institute: TrainingInstitute;
  equipment: InstituteEquipment[];
  skills: Skill[];
  courses: Course[];
  onEquipmentAdded: (equipment: InstituteEquipment) => void;
}

export const EquipmentManager: React.FC<EquipmentManagerProps> = ({
  institute,
  equipment,
  skills,
  courses,
  onEquipmentAdded
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InstituteEquipment['category']>('Machinery & CNC');
  const [modelOrMake, setModelOrMake] = useState('');
  const [quantity, setQuantity] = useState<number>(2);
  const [operationalStatus, setOperationalStatus] = useState<InstituteEquipment['operationalStatus']>('Fully Operational');
  const [acquiredYear, setAcquiredYear] = useState<number>(2024);
  const [nsqfAlignmentLevel, setNsqfAlignmentLevel] = useState<number>(5);
  const [labRoomNumber, setLabRoomNumber] = useState('');
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleToggleSkill = (skillId: string) => {
    if (selectedSkillIds.includes(skillId)) {
      setSelectedSkillIds(selectedSkillIds.filter(id => id !== skillId));
    } else {
      setSelectedSkillIds([...selectedSkillIds, skillId]);
    }
  };

  const handleToggleCourse = (courseId: string) => {
    if (selectedCourseIds.includes(courseId)) {
      setSelectedCourseIds(selectedCourseIds.filter(id => id !== courseId));
    } else {
      setSelectedCourseIds([...selectedCourseIds, courseId]);
    }
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (!name.trim()) throw new Error('Equipment name is required');
      if (!modelOrMake.trim()) throw new Error('Model / Manufacturer is required');

      const created = await apiService.addInstituteEquipment(institute.id, {
        name,
        category,
        modelOrMake,
        quantity,
        operationalStatus,
        acquiredYear,
        nsqfAlignmentLevel,
        labRoomNumber,
        supportedSkillIds: selectedSkillIds,
        associatedCourseIds: selectedCourseIds
      });

      setSuccessMsg(`Equipment resource "${created.name}" successfully registered!`);
      onEquipmentAdded(created);

      // Reset
      setName('');
      setModelOrMake('');
      setLabRoomNumber('');
      setSelectedSkillIds([]);
      setSelectedCourseIds([]);
      setShowAddForm(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add equipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Workshop Equipment & Lab Infrastructure</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Track industry machinery, CNC tooling, simulator test benches, and modern laboratory resources.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Close Form' : 'Add Equipment / Asset'}
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

      {/* Add Equipment Form */}
      {showAddForm && (
        <form onSubmit={handleAddEquipment} className="mt-6 p-5 bg-slate-950/80 border border-slate-700 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            Register Workshop Machinery / Diagnostic Asset
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Equipment Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Bosch High-Pressure Common Rail Diesel Injector Test Bench"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Machinery & CNC">Machinery & CNC</option>
                <option value="Lab Workstation">Lab Workstation</option>
                <option value="Testing & Diagnostics">Testing & Diagnostics</option>
                <option value="Computing & Servers">Computing & Servers</option>
                <option value="Simulation Kit">Simulation Kit</option>
                <option value="Safety & Tooling">Safety & Tooling</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Model / Make *</label>
              <input
                type="text"
                value={modelOrMake}
                onChange={e => setModelOrMake(e.target.value)}
                placeholder="e.g. Bosch EPS 205"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Quantity (Units)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Operational Status</label>
              <select
                value={operationalStatus}
                onChange={e => setOperationalStatus(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Fully Operational">Fully Operational</option>
                <option value="Maintenance Required">Maintenance Required</option>
                <option value="Upgraded">Upgraded</option>
                <option value="Decommissioned">Decommissioned</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Acquired Year</label>
              <input
                type="number"
                min="2010"
                max="2026"
                value={acquiredYear}
                onChange={e => setAcquiredYear(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">NSQF Alignment Level</label>
              <select
                value={nsqfAlignmentLevel}
                onChange={e => setNsqfAlignmentLevel(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={4}>NSQF Level 4</option>
                <option value={5}>NSQF Level 5</option>
                <option value={6}>NSQF Level 6</option>
                <option value={7}>NSQF Level 7</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Lab / Workshop Room Location</label>
              <input
                type="text"
                value={labRoomNumber}
                onChange={e => setLabRoomNumber(e.target.value)}
                placeholder="e.g. Mechatronics Lab - Bay 4"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Associated Courses Utilizing this Asset:
            </label>
            <div className="flex flex-wrap gap-2">
              {courses.map(crs => {
                const isSel = selectedCourseIds.includes(crs.id);
                return (
                  <button
                    key={crs.id}
                    type="button"
                    onClick={() => handleToggleCourse(crs.id)}
                    className={`px-2.5 py-1 rounded text-xs font-medium border transition ${
                      isSel
                        ? 'bg-indigo-950 text-indigo-200 border-indigo-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {isSel && '✓ '}
                    {crs.title} ({crs.code})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Register Equipment'}
            </button>
          </div>
        </form>
      )}

      {/* Equipment Table / Grid */}
      <div className="mt-6 overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Equipment & Model</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-center">Qty</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">NSQF Level</th>
              <th className="py-3 px-4">Lab / Room</th>
              <th className="py-3 px-4">Associated Courses</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/50">
            {equipment.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No equipment recorded yet. Click "Add Equipment / Asset" above.
                </td>
              </tr>
            ) : (
              equipment.map(item => {
                const statusColor =
                  item.operationalStatus === 'Fully Operational'
                    ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
                    : item.operationalStatus === 'Maintenance Required'
                    ? 'text-amber-400 bg-amber-950/80 border-amber-800'
                    : 'text-indigo-400 bg-indigo-950/80 border-indigo-800';

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-medium text-white">
                      <div>{item.name}</div>
                      <div className="text-[11px] text-slate-400">{item.modelOrMake} ({item.acquiredYear})</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{item.category}</td>
                    <td className="py-3 px-4 text-center font-bold text-white">{item.quantity}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColor}`}>
                        {item.operationalStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-indigo-300">Level {item.nsqfAlignmentLevel}</td>
                    <td className="py-3 px-4 text-slate-400">{item.labRoomNumber || 'Main Technical Bay'}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {item.associatedCourseIds.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.associatedCourseIds.map(cid => {
                            const c = courses.find(cr => cr.id === cid);
                            return (
                              <span key={cid} className="px-1.5 py-0.5 bg-slate-800 text-[10px] rounded text-slate-300">
                                {c?.code || cid}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Institute-wide shared</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
