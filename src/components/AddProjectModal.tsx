import React, { useState, useEffect } from "react";
import {
  X,
  FolderPlus,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
} from "lucide-react";
import { projectsApi } from "../api/projectsApi";
import { watershedsApi } from "../api/watershedsApi";
import type { BackendProject, BackendWatershed, ProjectCreateInput } from "../types";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: BackendProject) => void;
  onOpenCreateWatershed?: () => void;
  preselectedWatershedId?: number;
}

const INTERVENTION_TYPES = [
  { value: "CHECK_DAM", label: "Masonry / Concrete Check Dam" },
  { value: "FARM_POND", label: "Agricultural Farm Pond" },
  { value: "PERCOLATION_TANK", label: "Percolation Recharge Tank" },
  { value: "CONTOUR_TRENCH", label: "Contour Trench / Bunding Network" },
  { value: "GULLY_PLUG", label: "Catchment Gully Plug System" },
  { value: "SUB_SURFACE_DYKE", label: "Sub-Surface Groundwater Dyke" },
  { value: "PLANTATION", label: "Agro-Forestry & Catchment Plantation" },
  { value: "WATER_BODY", label: "Traditional Water Body / Village Tank" },
];

const PROJECT_STATUSES = [
  { value: "PLANNED", label: "Planned / Sanctioned" },
  { value: "IN_PROGRESS", label: "Under Execution / Construction" },
  { value: "COMPLETED", label: "Completed & Operational" },
];

export default function AddProjectModal({
  isOpen,
  onClose,
  onSuccess,
  onOpenCreateWatershed,
  preselectedWatershedId,
}: AddProjectModalProps) {
  const [watersheds, setWatersheds] = useState<BackendWatershed[]>([]);
  const [loadingWatersheds, setLoadingWatersheds] = useState(false);

  const [formData, setFormData] = useState<ProjectCreateInput>({
    project_code: "",
    name: "",
    intervention_type: "CHECK_DAM",
    watershed_id: preselectedWatershedId || 0,
    description: "",
    latitude: 21.4669,
    longitude: 83.9812,
    status: "PLANNED",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load watersheds list when modal opens
  useEffect(() => {
    if (isOpen) {
      loadWatersheds();
    }
  }, [isOpen]);

  const loadWatersheds = async () => {
    try {
      setLoadingWatersheds(true);
      const data = await watershedsApi.getAll();
      setWatersheds(data);
      if (data.length > 0 && (!formData.watershed_id || formData.watershed_id === 0)) {
        setFormData((prev) => ({
          ...prev,
          watershed_id: preselectedWatershedId || data[0].id,
        }));
      }
    } catch (err) {
      console.warn("Could not load backend watersheds list:", err);
    } finally {
      setLoadingWatersheds(false);
    }
  };

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? value === ""
            ? null
            : parseFloat(value)
          : name === "watershed_id"
          ? parseInt(value, 10)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.project_code.trim()) {
      setError("Project Code is required (e.g. PRJ-OD-001)");
      return;
    }
    if (!formData.name.trim()) {
      setError("Project Name is required");
      return;
    }
    if (!formData.watershed_id || formData.watershed_id === 0) {
      setError(
        "Please select a target Watershed. If none exist, click 'Register Watershed' first."
      );
      return;
    }

    try {
      setLoading(true);
      const created = await projectsApi.create({
        ...formData,
        project_code: formData.project_code.trim().toUpperCase(),
        name: formData.name.trim(),
        intervention_type: formData.intervention_type,
        watershed_id: Number(formData.watershed_id),
        description: formData.description?.trim() || null,
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
        status: formData.status || "PLANNED",
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess(created);
        onClose();
      }, 900);
    } catch (err: any) {
      console.error("Project creation failed:", err);
      setError(
        err?.data?.detail || err.message || "Failed to create project on backend database"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0878d1] to-[#0ca39b] text-white shadow-sm">
              <FolderPlus size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#102A43]">
                Add Watershed Intervention Project
              </h3>
              <p className="text-[11px] text-slate-500">
                Register geo-tagged asset for AI verification and remote sensing audit
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
              <CheckCircle2 size={16} className="shrink-0" />
              <span className="font-bold">
                Project created successfully and stored in backend database!
              </span>
            </div>
          )}

          {/* Watershed Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Parent Watershed *
              </label>
              {onOpenCreateWatershed && (
                <button
                  type="button"
                  onClick={onOpenCreateWatershed}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#0878d1] hover:underline cursor-pointer"
                >
                  <Plus size={12} />
                  <span>Register New Watershed</span>
                </button>
              )}
            </div>

            {loadingWatersheds ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                <Loader2 size={14} className="animate-spin text-[#0878d1]" />
                <span>Loading available watersheds...</span>
              </div>
            ) : watersheds.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <p className="font-semibold">No watersheds registered in database yet.</p>
                <p className="mt-0.5 text-[11px] text-amber-700">
                  Please click "+ Register New Watershed" above to create one first.
                </p>
              </div>
            ) : (
              <select
                name="watershed_id"
                value={formData.watershed_id}
                onChange={handleChange}
                required
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0878d1] cursor-pointer"
              >
                {watersheds.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.watershed_code} - {ws.name} ({ws.district}, {ws.state})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Project Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Project Code *
              </label>
              <input
                type="text"
                name="project_code"
                value={formData.project_code}
                onChange={handleChange}
                placeholder="e.g. PRJ-OD-1024"
                required
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0878d1] focus:ring-2 focus:ring-[#0878d1]/10 font-mono"
              />
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Burla Upstream Masonry Check Dam"
                required
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0878d1] focus:ring-2 focus:ring-[#0878d1]/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Intervention Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Intervention Category *
              </label>
              <select
                name="intervention_type"
                value={formData.intervention_type}
                onChange={handleChange}
                required
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0878d1] cursor-pointer"
              >
                {INTERVENTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Execution Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0878d1] cursor-pointer"
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Structure Latitude (GPS) *
              </label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude ?? ""}
                  onChange={handleChange}
                  placeholder="e.g. 21.4669"
                  required
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-mono font-medium text-slate-800 outline-none focus:border-[#0878d1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Structure Longitude (GPS) *
              </label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude ?? ""}
                  onChange={handleChange}
                  placeholder="e.g. 83.9812"
                  required
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-mono font-medium text-slate-800 outline-none focus:border-[#0878d1]"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description &amp; Objective
            </label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={2}
              placeholder="e.g. Masonry gravity check dam to harvest seasonal runoff and recharge village aquifers."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 outline-none focus:border-[#0878d1] focus:ring-2 focus:ring-[#0878d1]/10"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (watersheds.length === 0 && !formData.watershed_id)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0878d1] to-[#0ca39b] px-5 py-2 text-xs font-bold text-white shadow-md shadow-[#0878d1]/20 hover:shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Persisting Project...</span>
                </>
              ) : (
                <>
                  <FolderPlus size={15} />
                  <span>Create Project</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
