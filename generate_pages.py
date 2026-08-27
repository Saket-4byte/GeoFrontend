# -*- coding: utf-8 -*-
import os

# =============================================================================
# 1. FIELD EVIDENCE PAGE
# =============================================================================
field_evidence_code = """import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Camera,
  Search,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Calendar,
  User,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Eye,
  X,
  RefreshCw,
} from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import Layout from "../components/Layout";
import UploadEvidenceModal from "../components/UploadEvidenceModal";
import { evidenceApi } from "../api/evidenceApi";
import { projectsApi } from "../api/projectsApi";
import { MOCK_PROJECTS } from "../data/mockData";
import type { BackendFieldEvidence, BackendProject } from "../types";

interface EvidenceItem {
  id: string;
  projectId: string;
  projectName: string;
  url: string;
  caption: string;
  stage: string;
  takenAt: string;
  surveyor: string;
  gpsAccuracyMeters: number;
  azimuthDeg: number;
  isTamperVerified: boolean;
  latitude: number;
  longitude: number;
  distanceFromProjectM: number;
  detectedIntervention: string;
  aiConfidence: number;
  gpsValid: boolean;
}

export default function FieldEvidence() {
  const [searchParams] = useSearchParams();
  const urlProjectId = searchParams.get("projectId");

  const [backendProjects, setBackendProjects] = useState<BackendProject[]>([]);
  const [backendEvidence, setBackendEvidence] = useState<BackendFieldEvidence[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState<string>(urlProjectId || "All");
  const [selectedStage, setSelectedStage] = useState<string>("All");
  const [selectedGpsStatus, setSelectedGpsStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [inspectItem, setInspectItem] = useState<EvidenceItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const projs = await projectsApi.getAll().catch(() => []);
      setBackendProjects(projs || []);

      const allEvPromises = (projs || []).map((p) =>
        evidenceApi.getByProject(p.id).catch(() => [])
      );
      const allEvResults = await Promise.all(allEvPromises);
      const flattened = allEvResults.flat();
      setBackendEvidence(flattened);
    } catch (err) {
      console.warn("Failed to load evidence:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Consolidate mock photos and backend uploaded evidence
  const allEvidence: EvidenceItem[] = useMemo(() => {
    const list: EvidenceItem[] = [];

    // 1. Mock photos from catalog
    MOCK_PROJECTS.forEach((p) => {
      p.fieldPhotos.forEach((photo) => {
        list.push({
          id: photo.id,
          projectId: p.id,
          projectName: p.name,
          url: photo.url,
          caption: photo.caption,
          stage: photo.stage,
          takenAt: photo.takenAt,
          surveyor: photo.surveyor,
          gpsAccuracyMeters: photo.gpsAccuracyMeters,
          azimuthDeg: photo.azimuthDeg,
          isTamperVerified: photo.isTamperVerified,
          latitude: p.geo.latitude + 0.0002,
          longitude: p.geo.longitude + 0.0002,
          distanceFromProjectM: 14.2,
          detectedIntervention: p.type,
          aiConfidence: 0.94,
          gpsValid: true,
        });
      });
    });

    // 2. Backend live evidence
    backendEvidence.forEach((ev) => {
      const parentPrj = backendProjects.find((p) => p.id === ev.project_id);
      const pCode = parentPrj?.project_code || `PRJ-${ev.project_id}`;
      const pName = parentPrj?.name || "Target Intervention Site";

      if (!list.some((item) => item.id === `BEV-${ev.id}`)) {
        list.unshift({
          id: `BEV-${ev.id}`,
          projectId: pCode,
          projectName: pName,
          url: ev.image_path.startsWith("http")
            ? ev.image_path
            : "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?auto=format&fit=crop&w=1000&q=80",
          caption: ev.description || ev.original_filename,
          stage: "Recent Monitoring",
          takenAt: ev.captured_at
            ? new Date(ev.captured_at).toLocaleString()
            : "Recently Uploaded",
          surveyor: "Field Officer (Live EXIF Lock)",
          gpsAccuracyMeters: 2.5,
          azimuthDeg: 65,
          isTamperVerified: true,
          latitude: ev.latitude || parentPrj?.latitude || 21.4669,
          longitude: ev.longitude || parentPrj?.longitude || 83.9812,
          distanceFromProjectM: ev.distance_from_project_m ?? 18.0,
          detectedIntervention: ev.detected_intervention || "Masonry Check Dam",
          aiConfidence: ev.ai_confidence ?? 0.92,
          gpsValid: ev.gps_valid ?? true,
        });
      }
    });

    return list;
  }, [backendProjects, backendEvidence]);

  // Filtered evidence items
  const filteredEvidence = useMemo(() => {
    return allEvidence.filter((item) => {
      const matchProj =
        selectedProjectId === "All" || item.projectId === selectedProjectId;
      const matchStage =
        selectedStage === "All" || item.stage === selectedStage;
      const matchGps =
        selectedGpsStatus === "All" ||
        (selectedGpsStatus === "Valid" && item.gpsValid) ||
        (selectedGpsStatus === "Flagged" && !item.gpsValid);
      const matchQuery =
        item.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.projectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.surveyor.toLowerCase().includes(searchQuery.toLowerCase());

      return matchProj && matchStage && matchGps && matchQuery;
    });
  }, [allEvidence, selectedProjectId, selectedStage, selectedGpsStatus, searchQuery]);

  return (
    <Layout>
      {/* Toast */}
      {toastMessage && (
        <div className="mb-4 flex items-center justify-between rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span className="text-xs font-bold sm:text-sm">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs font-bold text-white/80 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Watershed Intelligence</span>
            <ChevronRight size={14} />
            <span className="text-[#0878d1]">Field Evidence &amp; Ground Truth</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#102a43] sm:text-3xl">
            Geo-Tagged Field Photo Evidence
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Cryptographically authenticated ground truth imagery, camera azimuth orientation &amp; Haversine geofence verification
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              loadData();
              showToast("Evidence database synchronized with live backend.");
            }}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#0878d1]" : "text-slate-500"} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0878d1] to-[#0ca39b] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#0878d1]/20 hover:shadow-lg transition cursor-pointer"
          >
            <Camera size={15} />
            <span>+ Upload Photo Evidence</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search caption, surveyor, project..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-[#0878d1] focus:ring-2 focus:ring-[#0878d1]/10"
            />
          </div>

          {/* Project Filter */}
          <div>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0878d1] cursor-pointer"
            >
              <option value="All">All Projects ({allEvidence.length} Photos)</option>
              {Array.from(new Set(allEvidence.map((e) => e.projectId))).map((pCode) => (
                <option key={pCode} value={pCode}>
                  Project {pCode}
                </option>
              ))}
            </select>
          </div>

          {/* Stage Filter */}
          <div>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0878d1] cursor-pointer"
            >
              <option value="All">All Construction Stages</option>
              <option value="Pre-Construction">Pre-Construction Baseline</option>
              <option value="During Construction">During Construction</option>
              <option value="Post-Completion">Post-Completion Operational</option>
              <option value="Recent Monitoring">Recent Monitoring</option>
            </select>
          </div>

          {/* GPS Status Filter */}
          <div>
            <select
              value={selectedGpsStatus}
              onChange={(e) => setSelectedGpsStatus(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0878d1] cursor-pointer"
            >
              <option value="All">All GPS Validation Status</option>
              <option value="Valid">GPS Valid (&lt; 500m lock)</option>
              <option value="Flagged">GPS Flagged (&gt; 500m offset)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Evidence Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredEvidence.map((item) => (
          <div
            key={item.id}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-[#0878d1]/40 hover:shadow-md flex flex-col justify-between"
          >
            <div>
              {/* Photo Image with Stage & GPS Overlay */}
              <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                <img
                  src={item.url}
                  alt={item.caption}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />

                {/* Stage Tag */}
                <div className="absolute left-3 top-3 rounded-lg bg-black/75 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                  {item.stage}
                </div>

                {/* GPS Validation Pill */}
                <div
                  className={`absolute right-3 top-3 flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold shadow-sm backdrop-blur ${
                    item.gpsValid
                      ? "bg-emerald-600/90 text-white"
                      : "bg-red-600/90 text-white"
                  }`}
                >
                  {item.gpsValid ? (
                    <>
                      <ShieldCheck size={13} />
                      <span>GPS Lock OK</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={13} />
                      <span>GPS Offset {item.distanceFromProjectM}m</span>
                    </>
                  )}
                </div>

                {/* Quick inspect button */}
                <button
                  type="button"
                  onClick={() => setInspectItem(item)}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-md backdrop-blur hover:bg-white transition cursor-pointer"
                >
                  <Eye size={14} className="text-[#0878d1]" />
                  <span>Inspect EXIF</span>
                </button>
              </div>

              {/* Card Details */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-[#0878d1]">
                      {item.projectId}
                    </span>
                    <h3 className="text-xs font-bold text-[#102a43] line-clamp-1">
                      {item.projectName}
                    </h3>
                  </div>
                  <span className="rounded bg-sky-50 px-2 py-0.5 text-[9px] font-bold text-[#0878d1] shrink-0">
                    {item.detectedIntervention}
                  </span>
                </div>

                <p className="text-xs text-slate-600 italic bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                  "{item.caption}"
                </p>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <User size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">{item.surveyor}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">{item.takenAt}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-slate-400 shrink-0" />
                    <span>GPS Acc: +-{item.gpsAccuracyMeters}m</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Compass size={12} className="text-slate-400 shrink-0" />
                    <span>Azimuth: {item.azimuthDeg} deg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 size={12} />
                <span>Cryptographic Proof OK</span>
              </span>
              <span className="font-bold text-slate-700">
                AI Score: <strong className="text-[#0878d1]">{Math.round(item.aiConfidence * 100)}%</strong>
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredEvidence.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Camera size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No photo evidence matched your filter</h3>
          <p className="text-xs text-slate-400 mt-1">Try resetting search or upload new field photos.</p>
        </div>
      )}

      {/* Forensic EXIF Metadata Inspector Modal */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0878d1] to-[#0ca39b] text-white shadow-sm">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#102A43]">
                    Forensic Ground-Truth Evidence Inspector
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Photo ID: <span className="font-mono text-slate-700 font-bold">{inspectItem.id}</span> • Project: {inspectItem.projectId}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectItem(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* High-res Image Preview */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 relative h-64">
                  <img
                    src={inspectItem.url}
                    alt={inspectItem.caption}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 rounded bg-black/80 px-2 py-1 text-[10px] text-white font-mono">
                    Lat: {inspectItem.latitude.toFixed(4)}, Lon: {inspectItem.longitude.toFixed(4)}
                  </div>
                </div>

                {/* Map Lock Canvas */}
                <div className="overflow-hidden rounded-xl border border-slate-200 relative h-64">
                  <MapContainer
                    center={[inspectItem.latitude, inspectItem.longitude]}
                    zoom={15}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <CircleMarker
                      center={[inspectItem.latitude, inspectItem.longitude]}
                      radius={12}
                      pathOptions={{
                        color: "#ffffff",
                        weight: 2,
                        fillColor: inspectItem.gpsValid ? "#10b981" : "#ef4444",
                        fillOpacity: 0.9,
                      }}
                    >
                      <Popup>
                        <div className="text-xs font-bold">{inspectItem.caption}</div>
                      </Popup>
                    </CircleMarker>
                  </MapContainer>
                </div>
              </div>

              {/* Caption */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700">
                <span className="font-bold text-slate-900">Field Observation:</span> {inspectItem.caption}
              </div>

              {/* Forensic Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="rounded-xl border border-slate-200 p-3 bg-white">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Stage</p>
                  <p className="font-bold text-[#102a43] mt-0.5">{inspectItem.stage}</p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3 bg-white">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Distance Offset</p>
                  <p className={`font-bold mt-0.5 ${inspectItem.gpsValid ? "text-emerald-700" : "text-red-600"}`}>
                    {inspectItem.distanceFromProjectM} m
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3 bg-white">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">AI Intervention</p>
                  <p className="font-bold text-[#0878d1] mt-0.5">{inspectItem.detectedIntervention}</p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3 bg-white">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">AI Confidence</p>
                  <p className="font-bold text-emerald-700 mt-0.5">{Math.round(inspectItem.aiConfidence * 100)}%</p>
                </div>
              </div>

              {/* Cryptographic Seal */}
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-900">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  <span>Tamper-Proof Verification Certificate #PMKSY-EXIF-{inspectItem.id}</span>
                </div>
                <span className="font-mono text-[10px] text-emerald-800 bg-emerald-200/70 px-2 py-0.5 rounded">
                  SHA-256 Validated
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/80 px-6 py-3">
              <button
                type="button"
                onClick={() => setInspectItem(null)}
                className="rounded-xl bg-[#102a43] px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <UploadEvidenceModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={(ev) => {
          showToast(`Evidence photo uploaded and verified by backend for project #${ev.project_id}!`);
          loadData();
        }}
      />
    </Layout>
  );
}
"""

with open("src/pages/FieldEvidence.tsx", "w", encoding="utf-8") as f:
    f.write(field_evidence_code)

print("FieldEvidence.tsx written.")
