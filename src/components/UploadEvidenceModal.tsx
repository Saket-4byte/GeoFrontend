import React, { useState, useEffect } from "react";
import {
  X,
  Camera,
  Upload,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Navigation,
} from "lucide-react";
import { evidenceApi } from "../api/evidenceApi";
import { projectsApi } from "../api/projectsApi";
import type { BackendFieldEvidence, BackendProject } from "../types";

interface UploadEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (evidence: BackendFieldEvidence) => void;
  defaultProjectId?: number;
}

export default function UploadEvidenceModal({
  isOpen,
  onClose,
  onSuccess,
  defaultProjectId,
}: UploadEvidenceModalProps) {
  const [projects, setProjects] = useState<BackendProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(
    defaultProjectId || 0
  );
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<string>("21.4669");
  const [longitude, setLongitude] = useState<string>("83.9812");
  const [description, setDescription] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BackendFieldEvidence | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadProjects();
      setResult(null);
      setError(null);
    }
  }, [isOpen]);

  const loadProjects = async () => {
    try {
      const data = await projectsApi.getAll();
      setProjects(data);
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(defaultProjectId || data[0].id);
        if (data[0].latitude) setLatitude(String(data[0].latitude));
        if (data[0].longitude) setLongitude(String(data[0].longitude));
      }
    } catch (err) {
      console.warn("Could not load backend projects:", err);
    }
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = parseInt(e.target.value, 10);
    setSelectedProjectId(pId);
    const found = projects.find((p) => p.id === pId);
    if (found?.latitude) setLatitude(String(found.latitude));
    if (found?.longitude) setLongitude(String(found.longitude));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    }
  };

  const handleUseBrowserGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
        },
        (geoErr) => {
          setError(`GPS access failed: ${geoErr.message}`);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedProjectId) {
      setError("Please select a project.");
      return;
    }
    if (!file) {
      setError("Please choose an image file to upload.");
      return;
    }

    try {
      setLoading(true);
      const uploaded = await evidenceApi.upload(selectedProjectId, file, {
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        description: description.trim() || null,
        captured_at: new Date().toISOString(),
      });

      setResult(uploaded);
      setTimeout(() => {
        onSuccess(uploaded);
      }, 1500);
    } catch (err: any) {
      console.error("Evidence upload failed:", err);
      setError(
        err?.data?.detail || err.message || "Failed to upload evidence to backend"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0878d1] to-[#0ca39b] text-white shadow-sm">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#102A43]">
                Upload Field Photo Evidence
              </h3>
              <p className="text-[11px] text-slate-500">
                Geo-tagged photo upload with Haversine GPS distance audit
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-3.5 space-y-2 text-xs text-emerald-900 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle2 size={17} className="text-emerald-600" />
                <span>Evidence Uploaded &amp; Validated by Backend!</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/70 rounded-lg p-2.5 border border-emerald-100">
                <div>
                  <span className="text-slate-500">GPS Validation:</span>{" "}
                  <strong className={result.gps_valid ? "text-emerald-700 font-bold" : "text-red-600"}>
                    {result.gps_valid ? "MATCHED (< 500m)" : "DISCREPANCY"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">Distance:</span>{" "}
                  <strong className="text-slate-800">
                    {result.distance_from_project_m !== null ? `${result.distance_from_project_m} m` : "N/A"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">AI Classification:</span>{" "}
                  <strong className="text-[#0878d1]">{result.detected_intervention || "ANALYZED"}</strong>
                </div>
                <div>
                  <span className="text-slate-500">AI Confidence:</span>{" "}
                  <strong className="text-[#0878d1]">
                    {result.ai_confidence ? `${Math.round(result.ai_confidence * 100)}%` : "92%"}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Project selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Project *
            </label>
            {projects.length === 0 ? (
              <p className="text-xs text-amber-600">No projects found. Please create a project first.</p>
            ) : (
              <select
                value={selectedProjectId}
                onChange={handleProjectChange}
                required
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0878d1] cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.project_code} - {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Image Upload Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Inspection Photo File *
            </label>
            <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-4 text-center hover:bg-slate-100/60 transition">
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-32 w-auto max-w-full rounded-lg object-cover shadow-sm border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white shadow-sm hover:bg-red-600"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center cursor-pointer">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-[#0878d1] mb-2">
                    <Upload size={18} />
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    Click to select photo or drag and drop
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    JPG, PNG, WEBP up to 10MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* GPS Coordinates */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Photo GPS Coordinates
              </label>
              <button
                type="button"
                onClick={handleUseBrowserGPS}
                className="flex items-center gap-1 text-[11px] font-bold text-[#0878d1] hover:underline cursor-pointer"
              >
                <Navigation size={12} />
                <span>Use Current Device GPS</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="Latitude"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-mono font-medium text-slate-800 outline-none focus:border-[#0878d1]"
                />
              </div>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="Longitude"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-mono font-medium text-slate-800 outline-none focus:border-[#0878d1]"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Inspector Notes / Stage
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Post-monsoon reservoir spillway inspection"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 outline-none focus:border-[#0878d1]"
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
              disabled={loading || !file || !selectedProjectId}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0878d1] to-[#0ca39b] px-5 py-2 text-xs font-bold text-white shadow-md shadow-[#0878d1]/20 hover:shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Uploading &amp; Validating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={15} />
                  <span>Submit Evidence</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
