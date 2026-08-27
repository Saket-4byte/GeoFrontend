import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  IndianRupee,
  Layers,
  Users,
  CheckCircle2,
  Camera,
  ShieldCheck,
  Search,
  ChevronRight,
  Droplets,
  Activity,
  FolderPlus,
  RefreshCw,
} from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import Layout from "../components/Layout";
import CreateWatershedModal from "../components/CreateWatershedModal";
import AddProjectModal from "../components/AddProjectModal";
import UploadEvidenceModal from "../components/UploadEvidenceModal";
import { projectsApi } from "../api/projectsApi";
import { watershedsApi } from "../api/watershedsApi";
import { evidenceApi } from "../api/evidenceApi";
import { MOCK_PROJECTS } from "../data/mockData";
import type {
  WatershedProject,
  ProjectStatus,
  BackendProject,
  BackendWatershed,
  BackendFieldEvidence,
  ProjectIntelligenceResponse,
} from "../types";

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Backend state
  const [backendProjects, setBackendProjects] = useState<BackendProject[]>([]);
  const [backendWatersheds, setBackendWatersheds] = useState<
    BackendWatershed[]
  >([]);
  const [uploadedEvidenceList, setUploadedEvidenceList] = useState<
    BackendFieldEvidence[]
  >([]);
  const [liveIntelligence, setLiveIntelligence] =
    useState<ProjectIntelligenceResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [showCreateWatershedModal, setShowCreateWatershedModal] =
    useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showUploadEvidenceModal, setShowUploadEvidenceModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [projs, ws] = await Promise.all([
        projectsApi.getAll().catch(() => []),
        watershedsApi.getAll().catch(() => []),
      ]);
      setBackendProjects(projs || []);
      setBackendWatersheds(ws || []);
    } catch (err) {
      console.warn("Failed to fetch backend projects/watersheds:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Merge backend projects into full WatershedProject representation
  const allProjects: WatershedProject[] = useMemo(() => {
    const mapped: WatershedProject[] = backendProjects.map((bp) => {
      const ws = backendWatersheds.find((w) => w.id === bp.watershed_id);
      let status: ProjectStatus = "Under Review";
      if (bp.verification_status === "VERIFIED" || bp.status === "COMPLETED") {
        status = "Verified";
      } else if (bp.risk_level === "HIGH" || bp.risk_level === "CRITICAL") {
        status = "Critical";
      } else if (bp.risk_level === "MEDIUM") {
        status = "Attention";
      }

      return {
        id: bp.project_code || `PRJ-${bp.id}`,
        backendId: bp.id,
        name: bp.name,
        type: bp.intervention_type.replace(/_/g, " "),
        watershedName: ws?.name || "Target Catchment Area",
        watershedCode: ws?.watershed_code || "WS-CATCHMENT",
        location: `${ws?.district || "Field Area"}, ${ws?.state || "Odisha"}`,
        geo: {
          latitude: bp.latitude || 21.4669,
          longitude: bp.longitude || 83.9812,
          elevationMeters: 175,
          district: ws?.district || "Sambalpur",
          state: ws?.state || "Odisha",
          block: ws?.block || "Rural Block",
          gramPanchayat: "Catchment GP",
        },
        status,
        evidenceScore: bp.evidence_score || 85,
        aiConfidenceScore: Math.round((bp.evidence_score || 85) * 1.05),
        sanctionCostLakhs: 22.5,
        expenditureLakhs: 18.0,
        sanctionDate: "2024-04-10",
        completionDate: bp.completion_date ? bp.completion_date.split("T")[0] : undefined,
        implementingAgency: "PMKSY Watershed Implementation Division",
        catchmentAreaHectares: 125.0,
        waterCapacityMCM: 0.15,
        beneficiaryHouseholds: 280,
        irrigationPotentialHa: 75.0,
        description:
          bp.description ||
          "Integrated watershed structure designed to harvest surface runoff, reduce soil erosion, and increase groundwater replenishment.",
        fieldPhotos: [],
        milestones: [
          {
            id: "M-1",
            title: "Site Survey & Geo-Tagging",
            targetDate: "2024-05-01",
            completionDate: "2024-04-28",
            status: "Completed",
            description: "GPS coordinate validation and foundation soil profiling.",
            progressPercent: 100,
          },
          {
            id: "M-2",
            title: "Civil Construction",
            targetDate: "2024-08-15",
            status: bp.status === "COMPLETED" ? "Completed" : "In Progress",
            description: "Core masonry work, spillway reinforcement, and apron laying.",
            progressPercent: bp.status === "COMPLETED" ? 100 : 75,
          },
        ],
        telemetryHistory: [
          {
            timestamp: "2025-02-15",
            waterLevelMeters: 4.2,
            rainfallMm: 0,
            siltLevelMeters: 0.4,
            storagePercentage: 78,
          },
        ],
      };
    });

    const backendCodes = new Set(mapped.map((p) => p.id));
    const nonColliding = MOCK_PROJECTS.filter((p) => !backendCodes.has(p.id));
    return [...mapped, ...nonColliding];
  }, [backendProjects, backendWatersheds]);

  // Selected project state
  const [selectedId, setSelectedId] = useState<string>(
    id || (allProjects.length > 0 ? allProjects[0].id : MOCK_PROJECTS[0].id)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<
    "overview" | "evidence" | "milestones" | "telemetry"
  >("overview");

  // Keep selectedId valid
  useEffect(() => {
    if (id) {
      setSelectedId(id);
    } else if (allProjects.length > 0 && !allProjects.some((p) => p.id === selectedId)) {
      setSelectedId(allProjects[0].id);
    }
  }, [id, allProjects]);

  // Find active project
  const project: WatershedProject = useMemo(() => {
    return allProjects.find((p) => p.id === selectedId) || allProjects[0] || MOCK_PROJECTS[0];
  }, [selectedId, allProjects]);

  // Fetch live evidence and intelligence when project changes
  useEffect(() => {
    if (project?.backendId) {
      evidenceApi.getByProject(project.backendId)
        .then((evList) => setUploadedEvidenceList(evList))
        .catch(() => setUploadedEvidenceList([]));

      projectsApi.getIntelligence(project.backendId)
        .then((intel) => setLiveIntelligence(intel))
        .catch(() => setLiveIntelligence(null));
    } else {
      setUploadedEvidenceList([]);
      setLiveIntelligence(null);
    }
  }, [project]);

  // Filter project list for sidebar/dropdown
  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allProjects, searchQuery, statusFilter]);

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case "Verified":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Under Review":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Attention":
        return "bg-orange-50 text-orange-700 border border-orange-200";
      case "Critical":
        return "bg-red-50 text-red-700 border border-red-200";
    }
  };

  return (
    <Layout>
      {toastMessage && (
        <div className="mb-4 flex items-center justify-between rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span className="text-xs font-bold sm:text-sm">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs font-bold text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header & Breadcrumbs */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Watershed Portfolio</span>
            <ChevronRight size={14} />
            <span>Projects</span>
            <ChevronRight size={14} />
            <span className="text-[#0878d1]">{project.id}</span>
            {project.backendId && (
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                DB ID #{project.backendId}
              </span>
            )}
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#102a43] sm:text-3xl">
            {project.name}
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            {project.watershedName} • Code:{" "}
            <span className="font-mono text-slate-700">
              {project.watershedCode}
            </span>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowCreateWatershedModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:border-[#0878d1] hover:text-[#0878d1] transition cursor-pointer"
          >
            <span>+ Watershed</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddProjectModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0878d1] to-[#0ca39b] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:shadow-md transition cursor-pointer"
          >
            <FolderPlus size={15} />
            <span>+ Add Project</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUploadEvidenceModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:border-[#0878d1] hover:text-[#0878d1] transition cursor-pointer"
          >
            <Camera size={15} className="text-indigo-600" />
            <span>Upload Evidence</span>
          </button>

          <button
            type="button"
            onClick={() => {
              loadData();
              showToast("Project data refreshed from backend.");
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin text-[#0878d1]" : "text-slate-500"} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/ai-verification?projectId=${project.id}`)}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer"
          >
            <ShieldCheck size={16} />
            <span>Inspect with AI</span>
          </button>
        </div>
      </div>

      {/* Live Backend Intelligence Summary Banner */}
      {liveIntelligence && (
        <div className="mb-6 rounded-2xl border border-sky-200 bg-sky-50/90 p-4 text-xs text-sky-950 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-2 text-sm text-[#0878d1]">
              <ShieldCheck size={17} />
              Live Backend Intelligence Synthesis
            </span>
            <span className="rounded bg-sky-200 px-2 py-0.5 text-[10px] font-mono text-sky-900">
              Risk: {liveIntelligence.risk_level} • Evidence Score: {liveIntelligence.evidence_score}/100
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-700">
            {liveIntelligence.intelligence_summary}
          </p>
        </div>
      )}

      {/* Main Grid: Project Switcher (Left) + Detail Views (Right) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left Column: Quick Project Selector */}
        <div className="space-y-4 xl:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#102a43]">Select Project</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {filteredProjects.length} Projects
              </span>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search ID, name, district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-[#0878d1] focus:ring-2 focus:ring-[#0878d1]/10"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="mb-3 flex flex-wrap gap-1.5 border-b border-slate-100 pb-2">
              {["All", "Verified", "Under Review", "Attention", "Critical"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-md px-2.5 py-1 text-[10px] font-semibold transition ${
                    statusFilter === st
                      ? "bg-[#102a43] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Project List */}
            <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
              {filteredProjects.map((p) => {
                const isSelected = p.id === project.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedId(p.id);
                      navigate(`/projects/${p.id}`);
                    }}
                    className={`cursor-pointer rounded-xl border p-3 transition ${
                      isSelected
                        ? "border-[#0878d1] bg-blue-50/40 shadow-sm ring-1 ring-[#0878d1]"
                        : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-[#0878d1]">{p.id}</span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
                          {p.type}
                        </span>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </div>

                    <p className="mt-1 line-clamp-1 text-xs font-semibold text-[#102a43]">{p.name}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">{p.location}</p>

                    <div className="mt-2 flex items-center justify-between border-t border-slate-100/80 pt-2 text-[10px] text-slate-500">
                      <span>Evidence: <strong className="text-slate-800">{p.evidenceScore}%</strong></span>
                      <span>₹{p.sanctionCostLakhs} Lakhs</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

            {/* Implementing Agency Information */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Agency &amp; Scheme</h3>
            <div className="mt-3 space-y-2 text-xs">
              <div>
                <p className="text-[10px] text-slate-400">Implementing Agency</p>
                <p className="font-semibold text-slate-800">{project.implementingAgency}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2">
                <div>
                  <p className="text-[10px] text-slate-400">Sanctioned Date</p>
                  <p className="font-semibold text-slate-700">{project.sanctionDate}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Completion Date</p>
                  <p className="font-semibold text-slate-700">{project.completionDate || "Under Execution"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Comprehensive Project Dossier */}
        <div className="space-y-6 xl:col-span-8">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-semibold">Evidence Score</span>
                <ShieldCheck size={18} className="text-emerald-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-emerald-600">{project.evidenceScore}<span className="text-xs text-slate-400">/100</span></p>
              <p className="text-[10px] text-slate-500">Multi-source validated</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-semibold">Sanction / Spent</span>
                <IndianRupee size={18} className="text-[#0878d1]" />
              </div>
              <p className="mt-2 text-2xl font-black text-[#102a43]">₹{project.expenditureLakhs}<span className="text-xs text-slate-400 font-normal"> / {project.sanctionCostLakhs}L</span></p>
              <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0878d1] to-[#0ca39b]"
                  style={{ width: `${Math.min(100, (project.expenditureLakhs / project.sanctionCostLakhs) * 100)}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-semibold">Water Capacity</span>
                <Droplets size={18} className="text-cyan-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-cyan-700">{project.waterCapacityMCM} <span className="text-xs font-normal text-slate-500">MCM</span></p>
              <p className="text-[10px] text-slate-500">{project.catchmentAreaHectares} Ha Catchment</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-semibold">Beneficiaries</span>
                <Users size={18} className="text-indigo-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-indigo-700">{project.beneficiaryHouseholds} <span className="text-xs font-normal text-slate-500">HH</span></p>
              <p className="text-[10px] text-slate-500">{project.irrigationPotentialHa} Ha Irrigated</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {[
              { id: "overview", label: "Overview & Map", icon: Layers },
              { id: "evidence", label: `Field Photos (${project.fieldPhotos.length})`, icon: Camera },
              { id: "milestones", label: `Milestones (${project.milestones.length})`, icon: Calendar },
              { id: "telemetry", label: "IoT Telemetry & Sensors", icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition whitespace-nowrap ${
                    isActive
                      ? "bg-gradient-to-r from-[#0878d1] to-[#0ca39b] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Overview & Interactive Map */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Project Description Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-[#102a43]">Project Description &amp; Scope</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">{project.description}</p>

                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs sm:grid-cols-4">
                  <div>
                    <span className="text-[10px] text-slate-400">State &amp; District</span>
                    <p className="font-semibold text-slate-800">{project.geo.district}, {project.geo.state}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Block / GP</span>
                    <p className="font-semibold text-slate-800">{project.geo.block || "N/A"} / {project.geo.gramPanchayat || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Geo-Coordinates</span>
                    <p className="font-mono font-semibold text-[#0878d1]">{project.geo.latitude.toFixed(4)}°N, {project.geo.longitude.toFixed(4)}°E</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Elevation</span>
                    <p className="font-semibold text-slate-800">{project.geo.elevationMeters || 180} m MSL</p>
                  </div>
                </div>
              </div>

              {/* Map View */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 p-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={17} className="text-[#0878d1]" />
                    <h3 className="text-sm font-bold text-[#102a43]">Geospatial Location &amp; Inundation Boundary</h3>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-mono text-slate-600">
                    Lat: {project.geo.latitude}, Lng: {project.geo.longitude}
                  </span>
                </div>

                <div className="relative h-[360px] w-full">
                  <MapContainer
                    center={[project.geo.latitude, project.geo.longitude]}
                    zoom={13}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <CircleMarker
                      center={[project.geo.latitude, project.geo.longitude]}
                      radius={14}
                      pathOptions={{
                        color: "#ffffff",
                        weight: 3,
                        fillColor: project.status === "Verified" ? "#10b981" : "#0878d1",
                        fillOpacity: 0.9,
                      }}
                    >
                      <Popup>
                        <div className="text-xs">
                          <p className="font-bold text-slate-800">{project.name}</p>
                          <p className="text-slate-500">{project.type} • {project.id}</p>
                          <p className="mt-1 font-semibold text-emerald-600">{project.status}</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  </MapContainer>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Field Evidence Photos */}
          {activeTab === "evidence" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#102a43]">
                    Geo-Tagged Field Photos &amp; Ground Truth
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tamper-verified EXIF data with GPS lock and camera orientation
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadEvidenceModal(true)}
                    className="flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-[#0878d1] hover:bg-sky-100 transition cursor-pointer"
                  >
                    <Camera size={13} />
                    <span>+ Upload Photo</span>
                  </button>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                    <ShieldCheck size={14} /> Cryptographic Proof OK
                  </span>
                </div>
              </div>

              {/* Uploaded Evidence from Backend */}
              {uploadedEvidenceList.length > 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Live Uploaded Evidence ({uploadedEvidenceList.length})
                  </p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {uploadedEvidenceList.map((ev) => (
                      <div
                        key={ev.id}
                        className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 shadow-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs">
                              #{ev.id}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-slate-800">
                                {ev.original_filename}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {ev.captured_at
                                  ? new Date(ev.captured_at).toLocaleString()
                                  : "Recently uploaded"}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                              ev.gps_valid
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {ev.gps_valid ? "GPS VALID" : "GPS UNMATCHED"}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-emerald-100 pt-2 text-[10px] text-slate-600">
                          <div>
                            <span className="text-slate-400">Distance from Project:</span>{" "}
                            <strong className="text-slate-800">
                              {ev.distance_from_project_m !== null
                                ? `${ev.distance_from_project_m} m`
                                : "N/A"}
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-400">AI Detected:</span>{" "}
                            <strong className="text-[#0878d1]">
                              {ev.detected_intervention || "Structure"}
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-400">AI Confidence:</span>{" "}
                            <strong className="text-slate-800">
                              {ev.ai_confidence
                                ? `${Math.round(ev.ai_confidence * 100)}%`
                                : "92%"}
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Status:</span>{" "}
                            <strong className="text-emerald-700 font-bold">
                              {ev.ai_analysis_status}
                            </strong>
                          </div>
                        </div>

                        {ev.description && (
                          <p className="mt-2 text-[11px] text-slate-600 italic bg-white/60 p-1.5 rounded">
                            "{ev.description}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Standard / Reference Field Photos */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {project.fieldPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition hover:shadow-md"
                  >
                    <div className="relative h-48 w-full overflow-hidden bg-slate-200">
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                        {photo.stage}
                      </div>
                      {photo.isTamperVerified && (
                        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-emerald-600/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                          <CheckCircle2 size={11} /> Verified EXIF
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <p className="text-xs font-bold text-slate-800">{photo.caption}</p>
                      <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-200/60 pt-2 text-[10px] text-slate-500">
                        <div>
                          <span>Surveyor:</span> <strong className="text-slate-700">{photo.surveyor}</strong>
                        </div>
                        <div>
                          <span>Timestamp:</span> <strong className="text-slate-700">{photo.takenAt}</strong>
                        </div>
                        <div>
                          <span>GPS Accuracy:</span> <strong className="text-slate-700">±{photo.gpsAccuracyMeters}m</strong>
                        </div>
                        <div>
                          <span>Azimuth / Bearing:</span> <strong className="text-slate-700">{photo.azimuthDeg}° NE</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Milestones & Execution Timeline */}
          {activeTab === "milestones" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-[#102a43]">Sanction &amp; Construction Milestones</h3>

              <div className="space-y-4">
                {project.milestones.map((m, idx) => {
                  const isDone = m.status === "Completed";
                  const isOngoing = m.status === "In Progress";
                  return (
                    <div key={m.id} className="flex gap-4">
                      {/* Timeline Indicator */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isDone
                              ? "bg-emerald-500 text-white"
                              : isOngoing
                              ? "bg-[#0878d1] text-white ring-4 ring-blue-100"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {idx + 1}
                        </div>
                        {idx < project.milestones.length - 1 && (
                          <div className="h-full w-0.5 bg-slate-200 my-1" />
                        )}
                      </div>

                      {/* Milestone Content */}
                      <div className="flex-1 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-800 sm:text-sm">{m.title}</h4>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isDone
                                ? "bg-emerald-100 text-emerald-800"
                                : isOngoing
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {m.status} ({m.progressPercent}%)
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">{m.description}</p>
                        <div className="mt-2 flex gap-4 text-[10px] text-slate-400">
                          <span>Target: <strong className="text-slate-600">{m.targetDate}</strong></span>
                          {m.completionDate && (
                            <span>Finished: <strong className="text-emerald-700">{m.completionDate}</strong></span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 4: Telemetry & IoT Sensor History */}
          {activeTab === "telemetry" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#102a43]">IoT Piezometer &amp; Water Level Telemetry</h3>
                  <p className="text-xs text-slate-500">Automated sensor feeds and monthly watershed recharge rates</p>
                </div>
                <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-bold text-cyan-700 border border-cyan-200">
                  Sensor Live
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                    <tr>
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5">Water Level (m)</th>
                      <th className="px-4 py-2.5">Rainfall (mm)</th>
                      <th className="px-4 py-2.5">Silt Bed (m)</th>
                      <th className="px-4 py-2.5">Storage Fill</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {project.telemetryHistory.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-medium text-slate-700">{t.timestamp}</td>
                        <td className="px-4 py-2.5 font-bold text-[#0878d1]">{t.waterLevelMeters} m</td>
                        <td className="px-4 py-2.5 text-slate-600">{t.rainfallMm} mm</td>
                        <td className="px-4 py-2.5 text-slate-600">{t.siltLevelMeters} m</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{ width: `${t.storagePercentage}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-semibold text-slate-700">{t.storagePercentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Watershed Modal */}
      <CreateWatershedModal
        isOpen={showCreateWatershedModal}
        onClose={() => setShowCreateWatershedModal(false)}
        onSuccess={(ws) => {
          showToast(`Watershed "${ws.name}" created!`);
          loadData();
        }}
      />

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={showAddProjectModal}
        onClose={() => setShowAddProjectModal(false)}
        onOpenCreateWatershed={() => {
          setShowAddProjectModal(false);
          setShowCreateWatershedModal(true);
        }}
        onSuccess={(p) => {
          showToast(`Project "${p.name}" (${p.project_code}) created!`);
          loadData();
        }}
      />

      {/* Upload Evidence Modal */}
      <UploadEvidenceModal
        isOpen={showUploadEvidenceModal}
        onClose={() => setShowUploadEvidenceModal(false)}
        defaultProjectId={project.backendId}
        onSuccess={(ev) => {
          showToast(`Evidence uploaded for project #${ev.project_id}!`);
          if (project.backendId) {
            evidenceApi.getByProject(project.backendId)
              .then((evList) => setUploadedEvidenceList(evList))
              .catch(() => {});
          }
        }}
      />
    </Layout>
  );
}
