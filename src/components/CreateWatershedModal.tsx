import React, { useState } from "react";
import { X, Map, Layers, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { watershedsApi } from "../api/watershedsApi";
import type { BackendWatershed, WatershedCreateInput } from "../types";

interface CreateWatershedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (watershed: BackendWatershed) => void;
}

const INDIAN_STATES = [
  "Odisha",
  "Maharashtra",
  "Rajasthan",
  "Karnataka",
  "Madhya Pradesh",
  "Gujarat",
  "Andhra Pradesh",
  "Uttar Pradesh",
  "Bihar",
  "Jharkhand",
  "Chhattisgarh",
  "Tamil Nadu",
  "Telangana",
  "West Bengal",
  "Punjab",
  "Haryana",
];

export default function CreateWatershedModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateWatershedModalProps) {
  const [formData, setFormData] = useState<WatershedCreateInput>({
    watershed_code: "",
    name: "",
    state: "Odisha",
    district: "",
    block: "",
    latitude: 21.4669,
    longitude: 83.9812,
    area_sq_km: 120.5,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" ? (value === "" ? null : parseFloat(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.watershed_code.trim()) {
      setError("Watershed Code is required (e.g. WS-OD-001)");
      return;
    }
    if (!formData.name.trim()) {
      setError("Watershed Name is required");
      return;
    }
    if (!formData.state.trim()) {
      setError("State is required");
      return;
    }
    if (!formData.district.trim()) {
      setError("District is required");
      return;
    }

    try {
      setLoading(true);
      const created = await watershedsApi.create({
        ...formData,
        watershed_code: formData.watershed_code.trim().toUpperCase(),
        name: formData.name.trim(),
        state: formData.state.trim(),
        district: formData.district.trim(),
        block: formData.block?.trim() || null,
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
        area_sq_km: formData.area_sq_km ? Number(formData.area_sq_km) : null,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess(created);
        onClose();
      }, 900);
    } catch (err: any) {
      console.error("Watershed creation failed:", err);
      setError(
        err?.data?.detail || err.message || "Failed to create watershed on backend"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0878d1] to-[#0ca39b] text-white shadow-sm">
              <Map size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#102A43]">
                Register New Watershed
              </h3>
              <p className="text-[11px] text-slate-500">
                PMKSY-WDC Hydrological Catchment Boundary
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
              <CheckCircle2 size={16} className="shrink-0" />
              <span className="font-bold">Watershed registered successfully in database!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Watershed Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Watershed Code *
              </label>
              <input
                type="text"
                name="watershed_code"
                value={formData.watershed_code}
                onChange={handleChange}
                placeholder="e.g. WS-OD-MHN-01"
                required
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0878d1] focus:ring-2 focus:ring-[#0878d1]/10 font-mono"
              />
            </div>

            {/* Watershed Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Watershed Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Mahanadi Upper Catchment"
                required
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0878d1] focus:ring-2 focus:ring-[#0878d1]/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* State */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                State *
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#0878d1] cursor-pointer"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                District *
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="e.g. Sambalpur"
                required
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0878d1] focus:ring-2 focus:ring-[#0878d1]/10"
              />
            </div>

            {/* Block */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Block / Tehsil
              </label>
              <input
                type="text"
                name="block"
                value={formData.block || ""}
                onChange={handleChange}
                placeholder="e.g. Dhankauda"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0878d1] focus:ring-2 focus:ring-[#0878d1]/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Latitude */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Center Latitude
              </label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude ?? ""}
                onChange={handleChange}
                placeholder="e.g. 21.4669"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-mono font-medium text-slate-800 outline-none focus:border-[#0878d1]"
              />
            </div>

            {/* Longitude */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Center Longitude
              </label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude ?? ""}
                onChange={handleChange}
                placeholder="e.g. 83.9812"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-mono font-medium text-slate-800 outline-none focus:border-[#0878d1]"
              />
            </div>

            {/* Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Area (Sq Km)
              </label>
              <input
                type="number"
                step="any"
                name="area_sq_km"
                value={formData.area_sq_km ?? ""}
                onChange={handleChange}
                placeholder="e.g. 145.5"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 outline-none focus:border-[#0878d1]"
              />
            </div>
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
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0878d1] to-[#0ca39b] px-5 py-2 text-xs font-bold text-white shadow-md shadow-[#0878d1]/20 hover:shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Layers size={15} />
                  <span>Create Watershed</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
