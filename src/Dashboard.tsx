import { useMemo, useState, useEffect } from "react";
import type { ElementType } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronRight,
  Database,
  Eye,
  FolderKanban,
  Layers,
  MapPin,
  RefreshCw,
  Satellite,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  X,
  ExternalLink,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

import Layout from "./components/Layout";
import Logo from "./components/Logo";

// ======================================================
// TYPES
// ======================================================

type ProjectStatus =
  | "Verified"
  | "Under Review"
  | "Attention"
  | "Critical";

interface Project {
  id: string;
  name: string;
  type: string;
  location: string;
  state: string;
  district: string;
  evidence: number;
  aiConfidence: number;
  sanctionCostLakhs: number;
  status: ProjectStatus;
  latitude: number;
  longitude: number;
  lastUpdated: string;
}

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  change?: string;
  isPositive?: boolean;
  icon: ElementType;
  iconClass: string;
}

interface HealthBarProps {
  label: string;
  value: number;
  color?: string;
}

interface AlertItemProps {
  id: string;
  title: string;
  location: string;
  severity: "Critical" | "Warning" | "Info";
  time: string;
  projectId: string;
  onReview: (projectId: string) => void;
}

interface LegendProps {
  color: string;
  label: string;
  count: number;
}

interface EnvironmentalRowProps {
  label: string;
  value: string;
  sublabel: string;
  positive: boolean;
  progressPercent: number;
}

// ======================================================
// INDIAN STATES
// ======================================================

const STATES: string[] = [
  "All India",
  "Odisha",
  "Maharashtra",
  "Rajasthan",
  "Karnataka",
  "Madhya Pradesh",
  "Gujarat",
  "Andhra Pradesh",
  "Uttar Pradesh",
];

// ======================================================
// DATASET
// ======================================================

const MOCK_DASHBOARD_PROJECTS: Project[] = [
  {
    id: "JD-1024",
    name: "Sambalpur Upstream Check Dam Phase II",
    type: "Check Dam",
    location: "Burla, Sambalpur",
    district: "Sambalpur",
    state: "Odisha",
    evidence: 94,
    aiConfidence: 96,
    sanctionCostLakhs: 18.5,
    status: "Verified",
    latitude: 21.4669,
    longitude: 83.9812,
    lastUpdated: "Today, 10:45 AM",
  },
  {
    id: "JD-1025",
    name: "Bargarh Agricultural Farm Pond Cluster",
    type: "Farm Pond",
    location: "Attabira, Bargarh",
    district: "Bargarh",
    state: "Odisha",
    evidence: 88,
    aiConfidence: 92,
    sanctionCostLakhs: 12.0,
    status: "Verified",
    latitude: 21.333,
    longitude: 83.619,
    lastUpdated: "Yesterday",
  },
  {
    id: "JD-1026",
    name: "Deogarh Micro-Percolation Tank A3",
    type: "Percolation Tank",
    location: "Barkote, Deogarh",
    district: "Deogarh",
    state: "Odisha",
    evidence: 72,
    aiConfidence: 78,
    sanctionCostLakhs: 14.8,
    status: "Under Review",
    latitude: 21.5383,
    longitude: 84.7333,
    lastUpdated: "2 days ago",
  },
  {
    id: "JD-1027",
    name: "Angul Sloped Contour Trench Network",
    type: "Contour Trench",
    location: "Athamallik, Angul",
    district: "Angul",
    state: "Odisha",
    evidence: 45,
    aiConfidence: 54,
    sanctionCostLakhs: 8.5,
    status: "Attention",
    latitude: 20.8443,
    longitude: 85.1511,
    lastUpdated: "3 days ago",
  },
  {
    id: "JD-1028",
    name: "Nuapada Masonry Check Dam Structure",
    type: "Check Dam",
    location: "Sinapali, Nuapada",
    district: "Nuapada",
    state: "Odisha",
    evidence: 38,
    aiConfidence: 41,
    sanctionCostLakhs: 22.0,
    status: "Critical",
    latitude: 20.8409,
    longitude: 82.5383,
    lastUpdated: "4 days ago",
  },
  {
    id: "JD-2011",
    name: "Ahmednagar Drought-Proof Percolation Basin",
    type: "Percolation Tank",
    location: "Rahata, Ahmednagar",
    district: "Ahmednagar",
    state: "Maharashtra",
    evidence: 96,
    aiConfidence: 98,
    sanctionCostLakhs: 24.5,
    status: "Verified",
    latitude: 19.8667,
    longitude: 74.4833,
    lastUpdated: "1 day ago",
  },
  {
    id: "JD-2012",
    name: "Aurangabad Farm Pond Ridge Sub-Catchment",
    type: "Farm Pond",
    location: "Gangapur, Chhatrapati Sambhaji Nagar",
    district: "Chhatrapati Sambhaji Nagar",
    state: "Maharashtra",
    evidence: 64,
    aiConfidence: 69,
    sanctionCostLakhs: 11.2,
    status: "Under Review",
    latitude: 19.7011,
    longitude: 75.0089,
    lastUpdated: "2 days ago",
  },
  {
    id: "JD-3015",
    name: "Jodhpur Desert Rainwater Retention Tank",
    type: "Percolation Tank",
    location: "Osian, Jodhpur",
    district: "Jodhpur",
    state: "Rajasthan",
    evidence: 91,
    aiConfidence: 94,
    sanctionCostLakhs: 28.0,
    status: "Verified",
    latitude: 26.7249,
    longitude: 72.9084,
    lastUpdated: "Today, 08:30 AM",
  },
  {
    id: "JD-3016",
    name: "Udaipur Catchment Gully Plug System",
    type: "Gully Plug",
    location: "Kotra, Udaipur",
    district: "Udaipur",
    state: "Rajasthan",
    evidence: 49,
    aiConfidence: 51,
    sanctionCostLakhs: 9.8,
    status: "Attention",
    latitude: 24.3541,
    longitude: 73.1811,
    lastUpdated: "3 days ago",
  },
  {
    id: "JD-4001",
    name: "Tumakuru Ground Recharge Percolation Sump",
    type: "Percolation Tank",
    location: "Pavagada, Tumakuru",
    district: "Tumakuru",
    state: "Karnataka",
    evidence: 92,
    aiConfidence: 95,
    sanctionCostLakhs: 19.4,
    status: "Verified",
    latitude: 14.1017,
    longitude: 77.2798,
    lastUpdated: "Yesterday",
  },
  {
    id: "JD-5002",
    name: "Ujjain Chambal Basin Sub-Surface Dyke",
    type: "Sub-Surface Dyke",
    location: "Nagda, Ujjain",
    district: "Ujjain",
    state: "Madhya Pradesh",
    evidence: 86,
    aiConfidence: 90,
    sanctionCostLakhs: 31.0,
    status: "Verified",
    latitude: 23.4542,
    longitude: 75.4124,
    lastUpdated: "2 days ago",
  },
];

// Status color helper
const getProjectColor = (status: ProjectStatus): string => {
  switch (status) {
    case "Verified":
      return "#10b981"; // Emerald
    case "Under Review":
      return "#0878d1"; // Blue
    case "Attention":
      return "#f97316"; // Orange
    case "Critical":
      return "#ef4444"; // Red
    default:
      return "#10b981";
  }
};

// ======================================================
// MAP AUTO BOUNDS
// ======================================================

function MapBounds({ projects }: { projects: Project[] }) {
  const map = useMap();

  useEffect(() => {
    if (projects.length === 0) {
      map.setView([22.5937, 78.9629], 5);
      return;
    }

    if (projects.length === 1) {
      map.setView([projects[0].latitude, projects[0].longitude], 11);
      return;
    }

    const bounds: LatLngBoundsExpression = projects.map((p) => [
      p.latitude,
      p.longitude,
    ]);

    try {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    } catch {
      map.setView([22.5937, 78.9629], 5);
    }
  }, [projects, map]);

  return null;
}

// ======================================================
// MAP COMPONENT
// ======================================================

function WatershedMap({
  projects,
  fullScreen = false,
}: {
  projects: Project[];
  fullScreen?: boolean;
}) {
  const navigate = useNavigate();

  return (
    <div className={`relative w-full ${fullScreen ? "h-full" : "h-[440px] sm:h-[480px]"}`}>
      <MapContainer
        center={[20.9517, 85.0985]}
        zoom={6}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBounds projects={projects} />

        {projects.map((project) => {
          const markerColor = getProjectColor(project.status);

          return (
            <CircleMarker
              key={project.id}
              center={[project.latitude, project.longitude]}
              radius={9}
              pathOptions={{
                color: "#ffffff",
                weight: 2.5,
                fillColor: markerColor,
                fillOpacity: 0.95,
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="min-w-[220px] p-1 font-sans">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-white font-bold text-xs"
                        style={{ backgroundColor: markerColor }}
                      >
                        <MapPin size={14} />
                      </div>
                      <div>
                        <span className="font-extrabold text-xs text-[#102A43]">
                          {project.id}
                        </span>
                        <p className="text-[10px] text-slate-500">{project.type}</p>
                      </div>
                    </div>

                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                      style={{
                        backgroundColor: `${markerColor}18`,
                        color: markerColor,
                      }}
                    >
                      {project.status}
                    </span>
                  </div>

                  {/* Body Info */}
                  <div className="space-y-1.5 text-[11px] text-slate-600 mb-3">
                    <p className="font-semibold text-slate-800 line-clamp-1">
                      {project.name}
                    </p>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Location:</span>
                      <span className="font-medium text-slate-700">{project.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Evidence Score:</span>
                      <span className="font-bold text-emerald-600">{project.evidence}/100</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">AI Confidence:</span>
                      <span className="font-bold text-[#0878d1]">{project.aiConfidence}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Sanction Cost:</span>
                      <span className="font-bold text-slate-700">₹{project.sanctionCostLakhs} L</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="flex items-center justify-center gap-1 rounded-lg bg-[#0878d1] px-2 py-1.5 text-[10px] font-bold text-white hover:bg-[#0768b5] transition cursor-pointer"
                    >
                      <span>Project Details</span>
                      <ExternalLink size={10} />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/ai-verification?projectId=${project.id}`)}
                      className="flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                      <Bot size={11} className="text-[#0878d1]" />
                      <span>AI Audit</span>
                    </button>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Top Left Brand Badge */}
      <div className="pointer-events-none absolute left-3 top-3 z-[400]">
        <div className="flex items-center gap-2 rounded-xl border border-white/90 bg-white/95 px-3 py-2 shadow-md backdrop-blur-md">
          <Logo variant="icon-only" size="sm" />
          <div>
            <p className="text-xs font-bold text-[#102A43]">
              Geospatial Asset Map
            </p>
            <p className="text-[10px] text-slate-500">
              {projects.length} structure{projects.length === 1 ? "" : "s"} plotted
            </p>
          </div>
        </div>
      </div>

      {/* Empty state overlay if 0 results */}
      {projects.length === 0 && (
        <div className="pointer-events-none absolute bottom-8 left-1/2 z-[400] -translate-x-1/2 rounded-xl bg-white/95 px-5 py-2.5 text-xs font-semibold text-slate-600 shadow-xl border border-slate-200 backdrop-blur-sm">
          No watershed structures registered for selected state.
        </div>
      )}
    </div>
  );
}

// ======================================================
// STAT CARD COMPONENT
// ======================================================

function StatCard({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  iconClass,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="mt-1.5 text-2xl font-extrabold text-[#102A43] sm:text-3xl">
            {typeof value === "number" ? value.toLocaleString() : value}
          </h3>
          <p className="mt-1 text-xs text-slate-400 font-medium">
            {subtitle}
          </p>
        </div>

        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}>
          <Icon size={22} />
        </div>
      </div>

      {change && (
        <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-2.5 text-xs font-bold">
          {isPositive ? (
            <span className="flex items-center gap-0.5 text-emerald-600">
              <TrendingUp size={14} />
              {change}
            </span>
          ) : (
            <span className="flex items-center gap-0.5 text-orange-600">
              <TrendingDown size={14} />
              {change}
            </span>
          )}
          <span className="text-[10px] font-normal text-slate-400">vs last audit cycle</span>
        </div>
      )}
    </div>
  );
}

// ======================================================
// STATUS BADGE
// ======================================================

function StatusBadge({ status }: { status: ProjectStatus }) {
  const styles: Record<ProjectStatus, string> = {
    Verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Under Review": "bg-blue-50 text-blue-700 border-blue-200",
    Attention: "bg-orange-50 text-orange-700 border-orange-200",
    Critical: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${styles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

// ======================================================
// HEALTH BAR
// ======================================================

function HealthBar({ label, value, color = "bg-emerald-500" }: HealthBarProps) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="font-bold text-slate-800">{value}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// ======================================================
// ALERT ITEM
// ======================================================

function AlertItem({
  title,
  location,
  severity,
  time,
  projectId,
  onReview,
}: AlertItemProps) {
  const isCritical = severity === "Critical";
  const isWarning = severity === "Warning";

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-slate-50 transition">
      <div className="flex items-start gap-2.5">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            isCritical
              ? "bg-red-100 text-red-600"
              : isWarning
              ? "bg-orange-100 text-orange-600"
              : "bg-blue-100 text-[#0878d1]"
          }`}
        >
          <AlertTriangle size={16} />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-slate-800">{title}</p>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                isCritical
                  ? "bg-red-50 text-red-600"
                  : isWarning
                  ? "bg-orange-50 text-orange-600"
                  : "bg-blue-50 text-[#0878d1]"
              }`}
            >
              {severity}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {location} • <span className="font-semibold text-slate-600">{projectId}</span> • {time}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onReview(projectId)}
        className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-[#0878d1] hover:bg-sky-50 transition cursor-pointer"
      >
        Audit
      </button>
    </div>
  );
}

// ======================================================
// LEGEND
// ======================================================

function Legend({ color, label, count }: LegendProps) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      <span>{label}</span>
      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
        {count}
      </span>
    </div>
  );
}

// ======================================================
// ENVIRONMENTAL ROW
// ======================================================

function EnvironmentalRow({
  label,
  value,
  sublabel,
  positive,
  progressPercent,
}: EnvironmentalRowProps) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-slate-700">{label}</span>
          <p className="text-[10px] text-slate-400">{sublabel}</p>
        </div>

        <div className="text-right">
          <span
            className={`flex items-center justify-end gap-1 text-sm font-extrabold ${
              positive ? "text-emerald-600" : "text-orange-600"
            }`}
          >
            {positive ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
            {value}
          </span>
        </div>
      </div>

      <div className="mt-1.5 h-1.5 rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${
            positive ? "bg-emerald-500" : "bg-orange-500"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

// ======================================================
// FULL MAP MODAL
// ======================================================

function FullMapModal({
  selectedState,
  filteredProjects,
  onClose,
}: {
  selectedState: string;
  filteredProjects: Project[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-sm">
      <div className="relative flex h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <Logo variant="icon-only" size="sm" />
            <div>
              <h2 className="text-sm font-bold text-[#102A43]">
                National Watershed Asset Map — High Resolution
              </h2>
              <p className="text-xs text-slate-500">
                Displaying {filteredProjects.length} geo-tagged structures in {selectedState}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Map */}
        <div className="relative flex-1 min-h-0">
          <WatershedMap projects={filteredProjects} fullScreen={true} />
        </div>
      </div>
    </div>
  );
}

// ======================================================
// MAIN DASHBOARD EXPORT
// ======================================================

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState<string>("All India");
  const [showFullMap, setShowFullMap] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filter projects by state
  const filteredProjects = useMemo(() => {
    if (selectedState === "All India") {
      return MOCK_DASHBOARD_PROJECTS;
    }
    return MOCK_DASHBOARD_PROJECTS.filter((p) => p.state === selectedState);
  }, [selectedState]);

  // Statistics calculation
  const totalProjects = filteredProjects.length;
  const verifiedProjects = filteredProjects.filter((p) => p.status === "Verified").length;
  const reviewProjects = filteredProjects.filter((p) => p.status === "Under Review").length;
  const attentionProjects = filteredProjects.filter((p) => p.status === "Attention").length;
  const criticalProjects = filteredProjects.filter((p) => p.status === "Critical").length;

  const totalSanctionedCost = useMemo(() => {
    return filteredProjects.reduce((acc, curr) => acc + curr.sanctionCostLakhs, 0).toFixed(1);
  }, [filteredProjects]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* ====================================================
            PAGE HEADER & CONTROLS
        ===================================================== */}
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 border border-cyan-200 px-3 py-1 text-xs font-extrabold text-[#0878d1]">
                <Logo variant="icon-only" size="sm" />
                Command Center Overview
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Sentinel-2 Telemetry Active
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-black tracking-tight text-[#102A43] sm:text-3xl">
              Watershed Intelligence Dashboard
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Real-time monitoring, AI tamper-verification, and multi-temporal satellite analytics for PMKSY-WDC projects.
            </p>
          </div>

          {/* Controls: State Selector & Quick Links */}
          <div className="flex flex-wrap items-center gap-3">
            {/* State Filter */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-2xs">
              <MapPin size={16} className="text-[#0878d1]" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#102A43] outline-none cursor-pointer"
              >
                {STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
            >
              <RefreshCw
                size={14}
                className={`text-slate-500 ${refreshing ? "animate-spin text-[#0878d1]" : ""}`}
              />
              <span>Refresh</span>
            </button>

            {/* Quick Action to AI Verification */}
            <button
              type="button"
              onClick={() => navigate("/ai-verification")}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0878d1] to-[#0ca39b] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#0878d1]/20 hover:shadow-lg transition cursor-pointer"
            >
              <Bot size={15} />
              <span>AI Verification Queue</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* ====================================================
            KPI SUMMARY STAT CARDS
        ===================================================== */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Monitored"
            value={totalProjects}
            subtitle={`₹${totalSanctionedCost} Lakhs Sanctioned`}
            change="+14.2%"
            isPositive={true}
            icon={FolderKanban}
            iconClass="bg-sky-50 text-[#0878d1] border border-sky-100"
          />

          <StatCard
            title="AI Verified"
            value={verifiedProjects}
            subtitle={`${totalProjects > 0 ? Math.round((verifiedProjects / totalProjects) * 100) : 0}% verification rate`}
            change="+8.6%"
            isPositive={true}
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600 border border-emerald-100"
          />

          <StatCard
            title="Under AI Review"
            value={reviewProjects}
            subtitle="Satellite & drone cross-check"
            change="Pending"
            isPositive={true}
            icon={Eye}
            iconClass="bg-blue-50 text-blue-600 border border-blue-100"
          />

          <StatCard
            title="Requires Attention"
            value={attentionProjects + criticalProjects}
            subtitle={`${criticalProjects} Critical • ${attentionProjects} Warnings`}
            change="-4.1%"
            isPositive={false}
            icon={AlertTriangle}
            iconClass="bg-orange-50 text-orange-600 border border-orange-100"
          />
        </div>

        {/* ====================================================
            MAP + HEALTH SCORE & ALERTS
        ===================================================== */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* MAP CONTAINER (Col Span 2) */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs xl:col-span-2 flex flex-col justify-between">
            {/* Map Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#102A43]">
                    Interactive Geospatial Asset Map
                  </h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    {selectedState}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Geo-tagged watershed structures with real-time status and telemetry
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowFullMap(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-white hover:border-[#0878d1] transition cursor-pointer"
              >
                <Layers size={13} />
                <span>Full Map</span>
              </button>
            </div>

            {/* The Leaflet Map */}
            <div className="flex-1 min-h-0">
              <WatershedMap projects={filteredProjects} />
            </div>

            {/* Map Status Legends */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-5 py-3.5 bg-slate-50/50">
              <div className="flex flex-wrap items-center gap-4">
                <Legend color="bg-emerald-500" label="Verified" count={verifiedProjects} />
                <Legend color="bg-[#0878d1]" label="Under Review" count={reviewProjects} />
                <Legend color="bg-orange-500" label="Attention" count={attentionProjects} />
                <Legend color="bg-red-500" label="Critical" count={criticalProjects} />
              </div>

              <div className="text-[11px] text-slate-400 font-medium">
                Click any marker for project details
              </div>
            </div>
          </section>

          {/* RIGHT SIDE: HEALTH GAUGE & PRIORITY ALERTS */}
          <div className="space-y-6">
            {/* Composite Health Index Card */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h2 className="text-sm font-bold text-[#102A43]">
                    Composite Watershed Health
                  </h2>
                  <p className="text-xs text-slate-500">
                    Satellite NDVI &amp; telemetry composite
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <Activity size={18} />
                </div>
              </div>

              <div className="flex items-center gap-5">
                {/* Score Circular Badge */}
                <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full border-[6px] border-emerald-100 bg-emerald-50/50 shadow-inner">
                  <span className="text-3xl font-black text-emerald-600">82</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">/ 100</span>
                </div>

                {/* Breakdown Progress Bars */}
                <div className="flex-1 space-y-2.5">
                  <HealthBar label="Vegetation Canopy (NDVI)" value={84} color="bg-emerald-500" />
                  <HealthBar label="Surface Water Area" value={76} color="bg-[#0878d1]" />
                  <HealthBar label="Soil Moisture Index" value={81} color="bg-teal-500" />
                  <HealthBar label="Tamper Proof Score" value={92} color="bg-indigo-500" />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 size={13} /> Highly Favorable Trend
                </span>
                <button
                  type="button"
                  onClick={() => navigate("/impact-analysis")}
                  className="text-xs font-bold text-[#0878d1] hover:underline"
                >
                  View Impact Trends →
                </button>
              </div>
            </section>

            {/* Priority Alerts Card */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 p-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#102A43]">
                    Priority Field Alerts
                  </h2>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-red-600">
                    4 Active
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/reports")}
                  className="text-xs font-bold text-[#0878d1] hover:underline"
                >
                  All Alerts
                </button>
              </div>

              <div className="space-y-2.5 p-4">
                <AlertItem
                  id="ALT-1"
                  title="GPS Azimuth Discrepancy"
                  location="Nuapada, Odisha"
                  severity="Critical"
                  time="2h ago"
                  projectId="JD-1028"
                  onReview={(pid) => navigate(`/ai-verification?projectId=${pid}`)}
                />
                <AlertItem
                  id="ALT-2"
                  title="Low Recent Evidence Score"
                  location="Angul, Odisha"
                  severity="Warning"
                  time="5h ago"
                  projectId="JD-1027"
                  onReview={(pid) => navigate(`/ai-verification?projectId=${pid}`)}
                />
                <AlertItem
                  id="ALT-3"
                  title="Vegetation Index Dip"
                  location="Kotra, Udaipur"
                  severity="Warning"
                  time="1d ago"
                  projectId="JD-3016"
                  onReview={(pid) => navigate(`/ai-verification?projectId=${pid}`)}
                />
                <AlertItem
                  id="ALT-4"
                  title="Spillway Silt Accumulation"
                  location="Deogarh, Odisha"
                  severity="Info"
                  time="2d ago"
                  projectId="JD-1026"
                  onReview={(pid) => navigate(`/projects/${pid}`)}
                />
              </div>
            </section>
          </div>
        </div>

        {/* ====================================================
            RECENT PROJECTS INTERACTIVE TABLE
        ===================================================== */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 p-5 gap-3">
            <div>
              <h2 className="text-sm font-bold text-[#102A43]">
                Monitored Watershed Interventions
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Detailed record of geo-tagged assets for {selectedState}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/projects")}
                className="flex items-center gap-1 text-xs font-bold text-[#0878d1] hover:underline"
              >
                <span>Full Project Catalog</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Project ID &amp; Name</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Location &amp; District</th>
                  <th className="px-6 py-3.5">Evidence Score</th>
                  <th className="px-6 py-3.5">AI Confidence</th>
                  <th className="px-6 py-3.5">Cost</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-slate-50/80 transition group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-[#0878d1] font-bold text-xs">
                          {project.id.split("-")[1]}
                        </div>
                        <div>
                          <span className="font-extrabold text-[#102A43] group-hover:text-[#0878d1] transition">
                            {project.id}
                          </span>
                          <p className="text-[11px] text-slate-500 font-medium line-clamp-1 max-w-[200px]">
                            {project.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {project.type}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      <span className="font-medium text-slate-800">{project.district}</span>
                      <p className="text-[10px] text-slate-400">{project.state}</p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{project.evidence}/100</span>
                        <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              project.evidence >= 80
                                ? "bg-emerald-500"
                                : project.evidence >= 60
                                ? "bg-[#0878d1]"
                                : "bg-orange-500"
                            }`}
                            style={{ width: `${project.evidence}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 font-bold text-[#0878d1]">
                        <Bot size={13} />
                        {project.aiConfidence}%
                      </span>
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-700">
                      ₹{project.sanctionCostLakhs} L
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={project.status} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-[#0878d1] hover:text-[#0878d1] transition cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/ai-verification?projectId=${project.id}`)}
                          className="rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs font-bold text-[#0878d1] hover:bg-sky-100 transition cursor-pointer"
                        >
                          Audit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      No projects registered for {selectedState}. Try selecting "All India".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ====================================================
            BOTTOM DUAL PANELS: SATELLITE & DATA INTEGRATION
        ===================================================== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Satellite Multi-Temporal Telemetry */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
              <div>
                <h2 className="text-sm font-bold text-[#102A43]">
                  Multi-Temporal Satellite Indicators
                </h2>
                <p className="text-xs text-slate-500">
                  Sentinel-2 L2A &amp; Landsat-9 temporal change analysis
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-[#0878d1]">
                <Satellite size={18} />
              </div>
            </div>

            <div className="space-y-4">
              <EnvironmentalRow
                label="Vegetation Cover (NDVI > 0.4)"
                value="+18.4%"
                sublabel="Pre-monsoon vs Post-monsoon canopy"
                positive={true}
                progressPercent={82}
              />
              <EnvironmentalRow
                label="Surface Water Spread Area"
                value="+11.2%"
                sublabel="NDWI water accumulation index"
                positive={true}
                progressPercent={74}
              />
              <EnvironmentalRow
                label="Mean NDVI Vegetation Vigor"
                value="+0.14"
                sublabel="Chlorophyll reflectance surge"
                positive={true}
                progressPercent={68}
              />
              <EnvironmentalRow
                label="Soil Erosion Risk Index"
                value="-3.6%"
                sublabel="Reduced runoff velocity across check dams"
                positive={true}
                progressPercent={40}
              />
            </div>

            <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Latest acquisition: Sentinel-2 L2A (10m Res)
              </span>
              <button
                type="button"
                onClick={() => navigate("/satellite-analysis")}
                className="text-xs font-bold text-[#0878d1] hover:underline"
              >
                Inspect Spectral Bands →
              </button>
            </div>
          </section>

          {/* JALDRISHTI Multi-Source Data Pipeline */}
          <section className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-sky-50/70 via-cyan-50/50 to-teal-50/60 p-5">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#0878d1] shadow-xs border border-sky-100">
                <Database size={22} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#102A43]">
                  JALDRISHTI Multi-Source Data Ingestion
                </h2>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  The unified data engine blends official PMKSY-WDC registry records, multi-spectral satellite observations, field surveyor geo-tags, and edge AI models into a tamper-proof audit trail.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 rounded-xl border border-white bg-white/80 p-3 shadow-2xs">
                <Database size={16} className="text-[#0878d1]" />
                <div>
                  <p className="text-xs font-bold text-slate-800">PMKSY Registry</p>
                  <p className="text-[10px] text-slate-500">National Sanctions</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-white bg-white/80 p-3 shadow-2xs">
                <Satellite size={16} className="text-indigo-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Sentinel &amp; Cartosat</p>
                  <p className="text-[10px] text-slate-500">5-day pass frequency</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-white bg-white/80 p-3 shadow-2xs">
                <MapPin size={16} className="text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Field Mobile App</p>
                  <p className="text-[10px] text-slate-500">EXIF Tamper Check</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-white bg-white/80 p-3 shadow-2xs">
                <Bot size={16} className="text-teal-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800">AI Inference Edge</p>
                  <p className="text-[10px] text-slate-500">YOLOv8 &amp; ResNet</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-cyan-200/40 pt-3 text-xs">
              <span className="text-slate-600 font-medium">Data freshness: &lt; 15 mins</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <ShieldCheck size={14} /> 100% Tamper Verified
              </span>
            </div>
          </section>
        </div>
      </div>

      {/* Full Map Modal */}
      {showFullMap && (
        <FullMapModal
          selectedState={selectedState}
          filteredProjects={filteredProjects}
          onClose={() => setShowFullMap(false)}
        />
      )}
    </Layout>
  );
}