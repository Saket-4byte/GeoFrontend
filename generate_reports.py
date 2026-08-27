# -*- coding: utf-8 -*-
import os

# =============================================================================
# 2. REPORTS AND ALERTS PAGE
# =============================================================================
reports_alerts_code = """import { useState, useMemo, useEffect } from "react";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Printer,
  Search,
  ChevronRight,
  ShieldCheck,
  Download,
  Filter,
  Check,
  Sparkles,
  QrCode,
  Calendar,
  Layers,
  MapPin,
  RefreshCw,
  Plus,
} from "lucide-react";

import Layout from "../components/Layout";
import { alertsApi } from "../api/alertsApi";
import { projectsApi } from "../api/projectsApi";
import { MOCK_PROJECTS, MOCK_IMPACT_SUMMARY } from "../data/mockData";
import type { BackendAlert, BackendProject } from "../types";

export default function ReportsAndAlerts() {
  const [activeTab, setActiveTab] = useState<"alerts" | "reports">("alerts");

  // Alerts State
  const [backendAlerts, setBackendAlerts] = useState<BackendAlert[]>([]);
  const [backendProjects, setBackendProjects] = useState<BackendProject[]>([]);
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<string>("All");
  const [alertStatusFilter, setAlertStatusFilter] = useState<string>("Active");
  const [searchAlertQuery, setSearchAlertQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Reports State
  const [selectedReportType, setSelectedReportType] = useState<
    "pmksy_statutory" | "satellite_impact" | "evidence_audit" | "roi_evaluation"
  >("pmksy_statutory");
  const [selectedProjectId, setSelectedProjectId] = useState<string>(MOCK_PROJECTS[0].id);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [alts, projs] = await Promise.all([
        alertsApi.getAll(false).catch(() => []),
        projectsApi.getAll().catch(() => []),
      ]);
      setBackendAlerts(alts || []);
      setBackendProjects(projs || []);
    } catch (err) {
      console.warn("Failed to load alerts/projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolveAlert = async (alertId: number) => {
    try {
      await alertsApi.resolve(alertId);
      showToast(`Alert #${alertId} marked as resolved on backend.`);
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to resolve alert");
    }
  };

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return backendAlerts.filter((alt) => {
      const matchSeverity =
        alertSeverityFilter === "All" || alt.severity === alertSeverityFilter;
      const matchStatus =
        alertStatusFilter === "All" ||
        (alertStatusFilter === "Active" && !alt.is_resolved) ||
        (alertStatusFilter === "Resolved" && alt.is_resolved);
      const matchQuery =
        alt.title.toLowerCase().includes(searchAlertQuery.toLowerCase()) ||
        alt.message.toLowerCase().includes(searchAlertQuery.toLowerCase()) ||
        alt.alert_type.toLowerCase().includes(searchAlertQuery.toLowerCase());

      return matchSeverity && matchStatus && matchQuery;
    });
  }, [backendAlerts, alertSeverityFilter, alertStatusFilter, searchAlertQuery]);

  const selectedProject = useMemo(() => {
    return MOCK_PROJECTS.find((p) => p.id === selectedProjectId) || MOCK_PROJECTS[0];
  }, [selectedProjectId]);

  const handlePrint = () => {
    window.print();
  };

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
            <span className="text-[#0878d1]">Compliance &amp; Reports</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#102a43] sm:text-3xl">
            Alert Center &amp; Statutory Compliance Reports
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Continuous vigilance alert triage, geofence anomaly tracking &amp; official PMKSY-WDC certification dossiers
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("alerts")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === "alerts"
                ? "bg-[#102a43] text-white shadow-sm"
                : "text-slate-600 hover:text-[#0878d1]"
            }`}
          >
            <Bell size={14} />
            <span>Alerts Triage ({backendAlerts.filter((a) => !a.is_resolved).length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === "reports"
                ? "bg-[#102a43] text-white shadow-sm"
                : "text-slate-600 hover:text-[#0878d1]"
            }`}
          >
            <FileText size={14} />
            <span>Statutory Audit Reports</span>
          </button>
        </div>
      </div>

      {activeTab === "alerts" ? (
        /* ====================================================================
           ALERTS TRIAGE VIEW
        ==================================================================== */
        <div className="space-y-6">
          {/* Severity Stats Banner */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 shadow-2xs">
              <div className="flex items-center justify-between text-red-600">
                <span className="text-xs font-bold">Critical Anomalies</span>
                <AlertTriangle size={18} />
              </div>
              <p className="mt-2 text-2xl font-black text-red-700">
                {backendAlerts.filter((a) => a.severity === "CRITICAL" && !a.is_resolved).length}
              </p>
              <p className="text-[10px] text-red-500">Zero physical progress or severe offset</p>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-4 shadow-2xs">
              <div className="flex items-center justify-between text-orange-600">
                <span className="text-xs font-bold">High Risk Warnings</span>
                <AlertTriangle size={18} />
              </div>
              <p className="mt-2 text-2xl font-black text-orange-700">
                {backendAlerts.filter((a) => a.severity === "HIGH" && !a.is_resolved).length}
              </p>
              <p className="text-[10px] text-orange-500">GPS geofence discrepancy &gt; 500m</p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-2xs">
              <div className="flex items-center justify-between text-amber-600">
                <span className="text-xs font-bold">Medium Attention</span>
                <AlertTriangle size={18} />
              </div>
              <p className="mt-2 text-2xl font-black text-amber-700">
                {backendAlerts.filter((a) => a.severity === "MEDIUM" && !a.is_resolved).length}
              </p>
              <p className="text-[10px] text-amber-600">Milestone delay or intermediate check</p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-2xs">
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-xs font-bold">Resolved Alerts</span>
                <CheckCircle2 size={18} />
              </div>
              <p className="mt-2 text-2xl font-black text-emerald-700">
                {backendAlerts.filter((a) => a.is_resolved).length}
              </p>
              <p className="text-[10px] text-emerald-600">Statutory officer cleared</p>
            </div>
          </div>

          {/* Alert Filter Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Search */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchAlertQuery}
                  onChange={(e) => setSearchAlertQuery(e.target.value)}
                  placeholder="Search alert title, project ID or keyword..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-[#0878d1] focus:ring-2 focus:ring-[#0878d1]/10"
                />
              </div>

              {/* Severity Filter */}
              <div>
                <select
                  value={alertSeverityFilter}
                  onChange={(e) => setAlertSeverityFilter(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0878d1] cursor-pointer"
                >
                  <option value="All">All Severity Levels</option>
                  <option value="CRITICAL">Critical Severity</option>
                  <option value="HIGH">High Severity</option>
                  <option value="MEDIUM">Medium Severity</option>
                  <option value="LOW">Low / Info</option>
                </select>
              </div>

              {/* Resolution Status */}
              <div>
                <select
                  value={alertStatusFilter}
                  onChange={(e) => setAlertStatusFilter(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0878d1] cursor-pointer"
                >
                  <option value="Active">Active Unresolved Alerts</option>
                  <option value="Resolved">Resolved / Closed Alerts</option>
                  <option value="All">All Alerts History</option>
                </select>
              </div>
            </div>
          </div>

          {/* Alert Cards Feed */}
          <div className="space-y-3">
            {filteredAlerts.map((alt) => {
              const isCrit = alt.severity === "CRITICAL";
              const isHigh = alt.severity === "HIGH";
              const isMed = alt.severity === "MEDIUM";

              return (
                <div
                  key={alt.id}
                  className={`rounded-2xl border p-4.5 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs ${
                    alt.is_resolved
                      ? "border-slate-200 bg-slate-50/70 opacity-75"
                      : isCrit
                      ? "border-red-200 bg-red-50/40"
                      : isHigh
                      ? "border-orange-200 bg-orange-50/40"
                      : isMed
                      ? "border-amber-200 bg-amber-50/40"
                      : "border-blue-200 bg-blue-50/40"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold shadow-2xs ${
                        alt.is_resolved
                          ? "bg-emerald-100 text-emerald-700"
                          : isCrit
                          ? "bg-red-600 text-white"
                          : isHigh
                          ? "bg-orange-500 text-white"
                          : isMed
                          ? "bg-amber-500 text-white"
                          : "bg-[#0878d1] text-white"
                      }`}
                    >
                      {alt.is_resolved ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <AlertTriangle size={20} />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            isCrit
                              ? "bg-red-100 text-red-800"
                              : isHigh
                              ? "bg-orange-100 text-orange-800"
                              : isMed
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {alt.severity}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-700">
                          Alert #{alt.id} • Project ID #{alt.project_id}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(alt.created_at).toLocaleString()}
                        </span>
                      </div>

                      <h3 className="mt-1 text-sm font-bold text-[#102a43]">{alt.title}</h3>
                      <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">{alt.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {!alt.is_resolved ? (
                      <button
                        type="button"
                        onClick={() => handleResolveAlert(alt.id)}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition cursor-pointer"
                      >
                        <Check size={14} />
                        <span>Resolve Alert</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">
                        <CheckCircle2 size={14} /> Resolved
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredAlerts.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-3" />
                <h3 className="text-sm font-bold text-slate-800">All alerts in this filter are clear!</h3>
                <p className="text-xs text-slate-400 mt-1">Zero pending vigilance triggers detected.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ====================================================================
           STATUTORY REPORTS GENERATOR VIEW
        ==================================================================== */
        <div className="space-y-6">
          {/* Report Selection Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Select Statutory Report Template
                </label>
                <select
                  value={selectedReportType}
                  onChange={(e: any) => setSelectedReportType(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0878d1] cursor-pointer"
                >
                  <option value="pmksy_statutory">PMKSY-WDC Statutory Project Verification Dossier</option>
                  <option value="satellite_impact">Multi-Temporal Satellite Earth Observation Impact Report</option>
                  <option value="evidence_audit">Geo-Tagged Ground Evidence &amp; Tamper Verification Certificate</option>
                  <option value="roi_evaluation">Socio-Economic &amp; Cropping Double-Harvest ROI Evaluation</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Target Project
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0878d1] cursor-pointer"
                >
                  {MOCK_PROJECTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0878d1] to-[#0ca39b] px-4 text-xs font-bold text-white shadow-md hover:shadow-lg transition cursor-pointer"
                >
                  <Printer size={15} />
                  <span>Print Official Government Dossier</span>
                </button>
              </div>
            </div>
          </div>

          {/* Printable Official Government Report Document Preview */}
          <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-lg print:border-none print:shadow-none">
            {/* Government Letterhead */}
            <div className="border-b-2 border-[#102a43] bg-gradient-to-r from-[#062c46] to-[#102a43] p-6 text-white text-center">
              <div className="mx-auto flex max-w-2xl flex-col items-center justify-center">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                  <span>Government of India</span> • <span>Ministry of Jal Shakti</span>
                </div>
                <h2 className="mt-2 text-xl font-black uppercase tracking-wide sm:text-2xl">
                  Pradhan Mantri Krishi Sinchayee Yojana (PMKSY-WDC)
                </h2>
                <p className="mt-1 text-xs text-slate-200">
                  Jal Drishti Automated Geo-Spatial Intelligence &amp; Physical Evidence Audit Directorate
                </p>
                <div className="mt-3 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-1 text-[11px] font-mono text-cyan-200">
                  <span>Dossier Ref: JAL-WDC-{selectedProject.id}-2025</span>
                  <span>•</span>
                  <span>Date: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
              </div>
            </div>

            {/* Document Body */}
            <div className="p-8 space-y-6 text-slate-800">
              {/* Executive Summary Grid */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-1 mb-3">
                  I. Project Identification &amp; Statutory Sanction
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500">Project Code:</span>
                    <p className="font-mono font-bold text-[#102a43] mt-0.5">{selectedProject.id}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Intervention Type:</span>
                    <p className="font-bold text-[#0878d1] mt-0.5">{selectedProject.type}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Catchment Watershed:</span>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedProject.watershedName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Location:</span>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedProject.location}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Sanctioned Cost:</span>
                    <p className="font-mono font-bold text-slate-900 mt-0.5">₹{selectedProject.sanctionCostLakhs} Lakhs</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Actual Expenditure:</span>
                    <p className="font-mono font-bold text-emerald-700 mt-0.5">₹{selectedProject.expenditureLakhs} Lakhs</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Sanction Date:</span>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedProject.sanctionDate}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Implementing Agency:</span>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedProject.implementingAgency}</p>
                  </div>
                </div>
              </div>

              {/* Multi-Source Fusion Audit Scores */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-1 mb-3">
                  II. AI Multi-Source Forensic Verification Scores
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
                    <p className="text-[10px] font-bold text-emerald-800 uppercase">Composite Verification</p>
                    <p className="text-2xl font-black text-emerald-700 mt-1">{selectedProject.aiConfidenceScore}%</p>
                    <p className="text-[10px] text-emerald-600 font-bold">Status: VERIFIED</p>
                  </div>
                  <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-3.5">
                    <p className="text-[10px] font-bold text-sky-800 uppercase">Ground EXIF Lock</p>
                    <p className="text-2xl font-black text-[#0878d1] mt-1">{selectedProject.evidenceScore}%</p>
                    <p className="text-[10px] text-sky-600">Offset: 14.2m (&lt; 500m)</p>
                  </div>
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3.5">
                    <p className="text-[10px] font-bold text-indigo-800 uppercase">Sentinel-2 Shift</p>
                    <p className="text-2xl font-black text-indigo-700 mt-1">+0.34</p>
                    <p className="text-[10px] text-indigo-600">NDVI Biomass Vigor</p>
                  </div>
                  <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-3.5">
                    <p className="text-[10px] font-bold text-teal-800 uppercase">Water Spread Gain</p>
                    <p className="text-2xl font-black text-teal-700 mt-1">+{selectedProject.waterCapacityMCM} MCM</p>
                    <p className="text-[10px] text-teal-600">Capacity Created</p>
                  </div>
                </div>
              </div>

              {/* Physical Evidence Photo Strip */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-1 mb-3">
                  III. Authenticated Field Photo Ground Truth &amp; Azimuth
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {selectedProject.fieldPhotos.map((photo) => (
                    <div key={photo.id} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      <img src={photo.url} alt={photo.caption} className="h-28 w-full object-cover" />
                      <div className="p-2 text-[10px] space-y-0.5">
                        <p className="font-bold text-slate-800">{photo.stage}</p>
                        <p className="text-slate-500 truncate">{photo.caption}</p>
                        <p className="font-mono text-[9px] text-emerald-700">GPS: ±{photo.gpsAccuracyMeters}m • {photo.azimuthDeg}°</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statutory Sign-off & Verification Seal */}
              <div className="mt-8 pt-6 border-t-2 border-slate-200 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 border border-slate-300">
                    <QrCode size={36} className="text-slate-800" />
                  </div>
                  <div className="text-[10px] text-slate-500">
                    <p className="font-bold text-slate-800">Digital Audit Hash Validated</p>
                    <p className="font-mono">SHA256: 4f8b9e...7a2d10</p>
                    <p>Statutory Verification Certificate Issued</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block border-b-2 border-slate-400 pb-1 px-8 text-center">
                    <span className="font-bold text-xs text-slate-800 font-serif italic">Subhashree Mohanty</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-700 mt-1">Authorized Inspection Officer</p>
                  <p className="text-[9px] text-slate-500">Odisha Watershed Development Mission (OWDM)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
"""

with open("src/pages/ReportsAndAlerts.tsx", "w", encoding="utf-8") as f:
    f.write(reports_alerts_code)

print("ReportsAndAlerts.tsx written.")
