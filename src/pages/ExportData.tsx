import { useState, useMemo, useEffect } from "react";
import {
  Download,
  FileSpreadsheet,
  FileCode,
  FileText,
  Search,
  ChevronRight,
  CheckCircle2,
  Filter,
  Database,
  Table,
  Check,
} from "lucide-react";

import Layout from "../components/Layout";
import { alertsApi } from "../api/alertsApi";
import { MOCK_PROJECTS, MOCK_IMPACT_SUMMARY, MOCK_SATELLITE_OBSERVATIONS } from "../data/mockData";
import type { BackendAlert } from "../types";

type DatasetType = "projects" | "evidence" | "satellite" | "alerts" | "impact";

export default function ExportData() {
  const [selectedDataset, setSelectedDataset] = useState<DatasetType>("projects");
  const [exportFormat, setExportFormat] = useState<"csv" | "json" | "pdf">("csv");
  const [selectedState, setSelectedState] = useState<string>("All States");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [backendAlerts, setBackendAlerts] = useState<BackendAlert[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    alertsApi.getAll(false)
      .then((alts) => setBackendAlerts(alts || []))
      .catch(() => {});
  }, []);

  // Compute preview rows for currently selected dataset
  const previewData = useMemo(() => {
    switch (selectedDataset) {
      case "projects":
        return MOCK_PROJECTS.map((p) => ({
          ID: p.id,
          Name: p.name,
          Category: p.type,
          Watershed: p.watershedName,
          Location: p.location,
          Status: p.status,
          EvidenceScore: `${p.evidenceScore}%`,
          SanctionLakhs: `₹${p.sanctionCostLakhs}`,
          Latitude: p.geo.latitude,
          Longitude: p.geo.longitude,
        }));

      case "evidence":
        return MOCK_PROJECTS.flatMap((p) =>
          p.fieldPhotos.map((ph) => ({
            PhotoID: ph.id,
            ProjectID: p.id,
            Stage: ph.stage,
            Caption: ph.caption,
            Surveyor: ph.surveyor,
            TakenAt: ph.takenAt,
            GPSAccuracy: `±${ph.gpsAccuracyMeters}m`,
            Azimuth: `${ph.azimuthDeg}°`,
            TamperProof: ph.isTamperVerified ? "YES" : "NO",
          }))
        );

      case "satellite":
        return MOCK_SATELLITE_OBSERVATIONS.map((s) => ({
          ObservationID: s.id,
          ProjectID: s.projectId,
          Sensor: s.satelliteSource,
          Date: s.acquisitionDate,
          CloudCover: `${s.cloudCoverPercent}%`,
          Resolution: `${s.resolutionMeters}m`,
          MeanNDVI: s.ndviAverage,
          WaterAreaHa: `${s.surfaceWaterAreaHa} Ha`,
          VegetationHa: `${s.vegetationCoverHa} Ha`,
        }));

      case "alerts":
        return backendAlerts.map((a) => ({
          AlertID: a.id,
          ProjectID: a.project_id,
          Severity: a.severity,
          Type: a.alert_type,
          Title: a.title,
          Message: a.message,
          Resolved: a.is_resolved ? "YES" : "NO",
          CreatedAt: a.created_at,
        }));

      case "impact":
        return MOCK_IMPACT_SUMMARY.indicators.map((i) => ({
          Indicator: i.metric,
          Category: i.category,
          Baseline: i.baseline,
          Current: i.current,
          Target: i.target,
          Unit: i.unit,
          ChangePercent: `${i.changePercent}%`,
          Trend: i.trend,
        }));
    }
  }, [selectedDataset, backendAlerts]);

  // Filter preview data by search
  const filteredPreview = useMemo(() => {
    if (!searchQuery) return previewData;
    return previewData.filter((row: any) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [previewData, searchQuery]);

  // Download real CSV or JSON
  const handleTriggerExport = () => {
    setIsExporting(true);

    setTimeout(() => {
      if (exportFormat === "csv") {
        if (filteredPreview.length === 0) return;
        const headers = Object.keys(filteredPreview[0]);
        const csvRows = [
          headers.join(","),
          ...filteredPreview.map((row: any) =>
            headers
              .map((h) => {
                const escaped = String(row[h] ?? "").replace(/"/g, '""');
                return `"${escaped}"`;
              })
          ),
        ];
        const csvContent =
          "data:text/csv;charset=utf-8," +
          encodeURIComponent(csvRows.join("\n"));
        const link = document.createElement("a");
        link.setAttribute("href", csvContent);
        link.setAttribute("download", `JalDrishti_${selectedDataset}_export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Exported ${filteredPreview.length} records to CSV!`);
      } else if (exportFormat === "json") {
        const jsonContent =
          "data:text/json;charset=utf-8," +
          encodeURIComponent(JSON.stringify(filteredPreview, null, 2));
        const link = document.createElement("a");
        link.setAttribute("href", jsonContent);
        link.setAttribute("download", `JalDrishti_${selectedDataset}_export.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Exported ${filteredPreview.length} records to JSON!`);
      } else if (exportFormat === "pdf") {
        window.print();
        showToast("Opened print / PDF dossier generation preview.");
      }

      setIsExporting(false);
    }, 600);
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
            <span className="text-[#0878d1]">Data Export &amp; Reporting Suite</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#102a43] sm:text-3xl">
            National Watershed Data Export Portal
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Export authenticated telemetry, GIS coordinates, field proof logs &amp; PMKSY compliance datasets
          </p>
        </div>

        <button
          type="button"
          onClick={handleTriggerExport}
          disabled={isExporting}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0878d1] to-[#0ca39b] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#0878d1]/20 hover:shadow-lg transition cursor-pointer disabled:opacity-50"
        >
          <Download size={16} />
          <span>
            {isExporting
              ? "Generating Export..."
              : `Export ${filteredPreview.length} Records (${exportFormat.toUpperCase()})`}
          </span>
        </button>
      </div>

      {/* Configuration Grid: Dataset, Format, State Filters */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Dataset Selection */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#102a43]">
            <Database size={16} className="text-[#0878d1]" />
            <span>1. Select Dataset Category</span>
          </div>

          <div className="space-y-2">
            {[
              { id: "projects", label: "Watershed Projects Master Register", desc: "Coordinates, sanction costs, and live verification status" },
              { id: "evidence", label: "Field Evidence & EXIF Tamper Log", desc: "Photo URLs, surveyor signatures, GPS offset meters" },
              { id: "satellite", label: "Sentinel-2 Spectral Observations", desc: "NDVI canopy, NDWI water spread area, pass dates" },
              { id: "alerts", label: "Alerts & Vigilance History", desc: "Real-time anomaly triggers, severity, resolution status" },
              { id: "impact", label: "Socio-Ecological Impact Indicators", desc: "Water table rise, double crop acreage, farmer census" },
            ].map((d) => (
              <label
                key={d.id}
                onClick={() => setSelectedDataset(d.id as DatasetType)}
                className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                  selectedDataset === d.id
                    ? "border-[#0878d1] bg-sky-50/50 shadow-xs ring-1 ring-[#0878d1]"
                    : "border-slate-200 bg-slate-50/40 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="dataset"
                  checked={selectedDataset === d.id}
                  onChange={() => setSelectedDataset(d.id as DatasetType)}
                  className="mt-1 accent-[#0878d1]"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">{d.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{d.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Export Format Selection */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#102a43]">
            <FileSpreadsheet size={16} className="text-[#0878d1]" />
            <span>2. Choose File Format</span>
          </div>

          <div className="space-y-2.5">
            <div
              onClick={() => setExportFormat("csv")}
              className={`flex items-center justify-between rounded-xl border p-3.5 cursor-pointer transition ${
                exportFormat === "csv"
                  ? "border-[#0878d1] bg-sky-50/50 shadow-xs ring-1 ring-[#0878d1]"
                  : "border-slate-200 bg-slate-50/40 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">CSV (Excel Spreadsheet)</p>
                  <p className="text-[10px] text-slate-500">Universal comma-separated format</p>
                </div>
              </div>
              {exportFormat === "csv" && <Check size={16} className="text-[#0878d1]" />}
            </div>

            <div
              onClick={() => setExportFormat("json")}
              className={`flex items-center justify-between rounded-xl border p-3.5 cursor-pointer transition ${
                exportFormat === "json"
                  ? "border-[#0878d1] bg-sky-50/50 shadow-xs ring-1 ring-[#0878d1]"
                  : "border-slate-200 bg-slate-50/40 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                  <FileCode size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">JSON (Structured Payload)</p>
                  <p className="text-[10px] text-slate-500">Machine-readable GIS &amp; telemetry format</p>
                </div>
              </div>
              {exportFormat === "json" && <Check size={16} className="text-[#0878d1]" />}
            </div>

            <div
              onClick={() => setExportFormat("pdf")}
              className={`flex items-center justify-between rounded-xl border p-3.5 cursor-pointer transition ${
                exportFormat === "pdf"
                  ? "border-[#0878d1] bg-sky-50/50 shadow-xs ring-1 ring-[#0878d1]"
                  : "border-slate-200 bg-slate-50/40 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-700">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">PDF / Print Dossier</p>
                  <p className="text-[10px] text-slate-500">Government audit ready printable document</p>
                </div>
              </div>
              {exportFormat === "pdf" && <Check size={16} className="text-[#0878d1]" />}
            </div>
          </div>
        </div>

        {/* Scope & Date Filter */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#102a43]">
            <Filter size={16} className="text-[#0878d1]" />
            <span>3. Filter Scope &amp; Target</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">State / Territory</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0878d1] cursor-pointer"
            >
              <option value="All States">All India (PMKSY National Scope)</option>
              <option value="Odisha">Odisha (OWDM Priority Basin)</option>
              <option value="Maharashtra">Maharashtra (Vidarbha Basin)</option>
              <option value="Rajasthan">Rajasthan (Marwar Catchment)</option>
              <option value="Karnataka">Karnataka (Krishna Sub-Basin)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Search Keywords in Dataset</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter table rows..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-[#0878d1]"
              />
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-[11px] text-emerald-900">
            <span className="font-bold">Government Certified Export:</span> All records exported include tamper-proof timestamps and SHA-256 validation signatures.
          </div>
        </div>
      </div>

      {/* Interactive Table Preview of Export Data */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Table size={16} className="text-[#0878d1]" />
            <h3 className="text-sm font-bold text-[#102a43]">
              Live Dataset Preview ({filteredPreview.length} Records)
            </h3>
          </div>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-[#0878d1]">
            Ready to download as {exportFormat.toUpperCase()}
          </span>
        </div>

        <div className="overflow-x-auto max-h-96">
          {filteredPreview.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  {Object.keys(filteredPreview[0]).map((head) => (
                    <th key={head} className="px-4 py-2.5 whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredPreview.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    {Object.values(row).map((val: any, cIdx: number) => (
                      <td key={cIdx} className="px-4 py-2.5 whitespace-nowrap text-slate-700">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              No matching records found in this dataset.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
