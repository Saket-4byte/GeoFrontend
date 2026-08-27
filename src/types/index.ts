// ======================================================
// JALDRISHTI TYPES DEFINITIONS (ALIGNED WITH BACKEND)
// ======================================================

// ------------------------------------------------------
// BACKEND STATUS ENUMS & TYPES
// ------------------------------------------------------

export type ProjectStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "Verified" | "Under Review" | "Attention" | "Critical";

export type VerificationStatus = "VERIFIED" | "NEEDS_REVIEW" | "FIELD_INSPECTION_REQUIRED" | "PENDING" | "AI Verified" | "Flagged Anomaly" | "Rejected";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type InterventionType =
  | "CHECK_DAM"
  | "FARM_POND"
  | "PERCOLATION_TANK"
  | "CONTOUR_TRENCH"
  | "GULLY_PLUG"
  | "SUB_SURFACE_DYKE"
  | "PLANTATION"
  | "WATER_BODY"
  | string;

export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "Critical" | "Warning" | "Info";

// ------------------------------------------------------
// BACKEND SCHEMA INTERFACES
// ------------------------------------------------------

export interface BackendWatershed {
  id: number;
  watershed_code: string;
  name: string;
  state: string;
  district: string;
  block?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  area_sq_km?: number | null;
  health_score: number;
  risk_level: string;
  created_at: string;
  updated_at: string;
}

export interface WatershedCreateInput {
  watershed_code: string;
  name: string;
  state: string;
  district: string;
  block?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  area_sq_km?: number | null;
}

export interface WatershedUpdateInput {
  name?: string;
  state?: string;
  district?: string;
  block?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  area_sq_km?: number | null;
  health_score?: number;
  risk_level?: string;
}

export interface WatershedHealthBreakdown {
  verification_score: number;
  satellite_impact_score: number;
  risk_score: number;
  project_coverage_score: number;
}

export interface WatershedHealthSummary {
  total_projects: number;
  verified_projects: number;
  high_risk_projects: number;
  medium_risk_projects?: number;
}

export interface WatershedHealthResponse {
  watershed_id: number;
  health_score: number;
  status: "HEALTHY" | "NEEDS_MONITORING" | "CRITICAL" | "NO_PROJECT_DATA" | string;
  breakdown: WatershedHealthBreakdown;
  summary: WatershedHealthSummary;
}

// ------------------------------------------------------
// PROJECT SCHEMAS
// ------------------------------------------------------

export interface BackendProject {
  id: number;
  project_code: string;
  name: string;
  intervention_type: string;
  description?: string | null;
  watershed_id: number;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
  verification_status: string;
  evidence_score: number;
  risk_level: string;
  completion_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreateInput {
  project_code: string;
  name: string;
  intervention_type: string;
  description?: string | null;
  watershed_id: number;
  latitude?: number | null;
  longitude?: number | null;
  status?: string;
  completion_date?: string | null;
}

export interface ProjectUpdateInput {
  name?: string;
  intervention_type?: string;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status?: string;
  verification_status?: string;
  evidence_score?: number;
  risk_level?: string;
  completion_date?: string | null;
}

// ------------------------------------------------------
// FIELD EVIDENCE SCHEMAS
// ------------------------------------------------------

export interface BackendFieldEvidence {
  id: number;
  project_id: number;
  image_path: string;
  original_filename: string;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  captured_at?: string | null;
  gps_valid?: boolean | null;
  distance_from_project_m?: number | null;
  detected_intervention?: string | null;
  ai_confidence?: number | null;
  ai_analysis_status: string;
  created_at: string;
}

export interface EvidenceUploadInput {
  project_id: number;
  file: File;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  captured_at?: string | null;
}

// ------------------------------------------------------
// SATELLITE ANALYSIS SCHEMAS
// ------------------------------------------------------

export interface BackendSatelliteAnalysis {
  id: number;
  project_id: number;
  before_date?: string | null;
  after_date?: string | null;
  ndvi_before?: number | null;
  ndvi_after?: number | null;
  ndvi_change?: number | null;
  water_before?: number | null;
  water_after?: number | null;
  water_change_percent?: number | null;
  vegetation_change_percent?: number | null;
  change_classification?: string | null;
  analysis_details?: Record<string, any> | null;
  created_at: string;
}

export interface SatelliteAnalysisCreateInput {
  before_date?: string | null;
  after_date?: string | null;
  ndvi_before?: number | null;
  ndvi_after?: number | null;
  water_before?: number | null;
  water_after?: number | null;
}

// ------------------------------------------------------
// VERIFICATION SCHEMAS
// ------------------------------------------------------

export interface VerificationComponentScores {
  ai_score?: number | null;
  gps_score?: number | null;
  satellite_score?: number | null;
  metadata_score?: number | null;
}

export interface BackendVerification {
  id: number;
  project_id: number;
  verification_score: number;
  status: string;
  ai_score?: number | null;
  gps_score?: number | null;
  satellite_score?: number | null;
  metadata_score?: number | null;
  analysis_details?: {
    verification_score: number;
    status: string;
    component_scores: VerificationComponentScores;
    weights: Record<string, number>;
    [key: string]: any;
  } | null;
  created_at: string;
}

// ------------------------------------------------------
// ALERTS SCHEMAS
// ------------------------------------------------------

export interface BackendAlert {
  id: number;
  project_id: number;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
}

// ------------------------------------------------------
// PROJECT INTELLIGENCE SCHEMAS
// ------------------------------------------------------

export interface IntelligenceEvidence {
  evidence_id: number;
  original_filename: string;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  gps_valid?: boolean | null;
  distance_from_project_m?: number | null;
  detected_intervention?: string | null;
  ai_confidence?: number | null;
  ai_analysis_status: string;
  captured_at?: string | null;
  created_at: string;
}

export interface IntelligenceSatelliteAnalysis {
  analysis_id: number;
  before_date?: string | null;
  after_date?: string | null;
  ndvi_before?: number | null;
  ndvi_after?: number | null;
  ndvi_change?: number | null;
  water_before?: number | null;
  water_after?: number | null;
  water_change_percent?: number | null;
  vegetation_change_percent?: number | null;
  change_classification?: string | null;
}

export interface IntelligenceVerification {
  verification_id: number;
  verification_score: number;
  status: string;
  ai_score?: number | null;
  gps_score?: number | null;
  satellite_score?: number | null;
  metadata_score?: number | null;
  created_at: string;
}

export interface IntelligenceAlert {
  alert_id: number;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
}

export interface ProjectIntelligenceResponse {
  project_id: number;
  project_code: string;
  name: string;
  intervention_type: string;
  description?: string | null;
  watershed_id: number;
  latitude?: number | null;
  longitude?: number | null;
  project_status: string;
  verification_status: string;
  evidence_score: number;
  risk_level: string;
  latest_evidence?: IntelligenceEvidence | null;
  latest_satellite_analysis?: IntelligenceSatelliteAnalysis | null;
  latest_verification?: IntelligenceVerification | null;
  alerts: IntelligenceAlert[];
  intelligence_summary: string;
}

// ------------------------------------------------------
// DASHBOARD OVERVIEW SCHEMAS
// ------------------------------------------------------

export interface DashboardKPIs {
  total_watersheds: number;
  total_projects: number;
  verified_projects: number;
  projects_needing_attention: number;
  active_alerts: number;
  critical_alerts: number;
}

export interface PriorityProject {
  project_id: number;
  project_name: string;
  project_type: string;
  verification_score: number;
  verification_status: string;
}

export interface DashboardAlert {
  alert_id: number;
  project_id: number;
  title: string;
  message: string;
  severity: string;
  created_at: string;
}

export interface WatershedHealthItem {
  watershed_id: number;
  watershed_name: string;
  health_score: number;
  status: string;
}

export interface WatershedHealthOverview {
  healthy: number;
  needs_monitoring: number;
  critical: number;
  watersheds: WatershedHealthItem[];
}

export interface MapProject {
  project_id: number;
  project_name: string;
  project_type: string;
  status?: string;
  verification_status?: string;
  risk_level?: string;
  latitude?: number | null;
  longitude?: number | null;
  watershed_id: number;
}

export interface DashboardOverviewResponse {
  kpis: DashboardKPIs;
  priority_projects: PriorityProject[];
  recent_alerts: DashboardAlert[];
  watershed_health_summary: WatershedHealthOverview;
  map_projects: MapProject[];
}

// ------------------------------------------------------
// COMPATIBILITY & PRESENTATION TYPES
// ------------------------------------------------------

export interface GeoLocation {
  latitude: number;
  longitude: number;
  elevationMeters?: number;
  district: string;
  state: string;
  block?: string;
  gramPanchayat?: string;
}

export interface FieldEvidencePhoto {
  id: string;
  url: string;
  caption: string;
  takenAt: string;
  stage: "Pre-Construction" | "During Construction" | "Post-Completion" | "Recent Monitoring" | string;
  surveyor: string;
  gpsAccuracyMeters: number;
  azimuthDeg: number;
  isTamperVerified: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  completionDate?: string;
  status: "Completed" | "In Progress" | "Pending" | "Delayed" | string;
  description: string;
  progressPercent: number;
}

export interface TelemetryReading {
  timestamp: string;
  waterLevelMeters: number;
  rainfallMm: number;
  siltLevelMeters: number;
  storagePercentage: number;
}

export interface WatershedProject {
  id: string;
  backendId?: number;
  name: string;
  type: string;
  watershedName: string;
  watershedCode: string;
  location: string;
  geo: GeoLocation;
  status: ProjectStatus;
  evidenceScore: number;
  aiConfidenceScore: number;
  sanctionCostLakhs: number;
  expenditureLakhs: number;
  sanctionDate: string;
  completionDate?: string;
  implementingAgency: string;
  catchmentAreaHectares: number;
  waterCapacityMCM: number;
  beneficiaryHouseholds: number;
  irrigationPotentialHa: number;
  fieldPhotos: FieldEvidencePhoto[];
  milestones: Milestone[];
  telemetryHistory: TelemetryReading[];
  description: string;
}

export interface AIVerificationRecord {
  projectId: string;
  backendId?: number;
  projectName: string;
  projectType: string;
  location: string;
  verificationStatus: VerificationStatus;
  overallScore: number;
  fraudRiskScore: number;
  lastAnalyzedAt: string;
  satelliteMatchScore: number;
  gpsDiscrepancyMeters: number;
  tamperingDetected: boolean;
  checks: {
    name: string;
    description: string;
    passed: boolean;
    confidence: number;
    details: string;
  }[];
  detectedFeatures: {
    feature: string;
    expected: string;
    detected: string;
    status: "Pass" | "Warning" | "Fail";
  }[];
  satelliteBeforeUrl: string;
  satelliteAfterUrl: string;
  droneInspectionUrl?: string;
  groundPhotoUrl?: string;
  aiExplanation: string;
  reviewedBy?: string;
  reviewDecisionNotes?: string;
}

export interface SatelliteObservation {
  id: string;
  projectId: string;
  satelliteSource: "Sentinel-2 L2A" | "Landsat-9 OLI" | "Cartosat-3" | "RISAT-1A" | string;
  acquisitionDate: string;
  cloudCoverPercent: number;
  resolutionMeters: number;
  ndviAverage: number;
  ndwiAverage: number;
  surfaceWaterAreaHa: number;
  vegetationCoverHa: number;
  spectralBands: {
    band: string;
    wavelengthNm: string;
    value: number;
  }[];
  tileUrl: string;
  maskType: "True Color" | "NDVI Vigor" | "NDWI Water" | "False Color Infrared" | string;
}

export interface ImpactIndicator {
  metric: string;
  baseline: string | number;
  current: string | number;
  target: string | number;
  unit: string;
  changePercent: number;
  trend: "positive" | "neutral" | "negative";
  category: "Hydrological" | "Agricultural" | "Socio-Economic" | "Ecological";
  description: string;
}

export interface WatershedImpactSummary {
  watershedId: string;
  watershedName: string;
  district: string;
  state: string;
  overallHealthScore: number;
  groundwaterTableRiseMeters: number;
  totalWaterHarvestedMCM: number;
  cropYieldIncreasePercent: number;
  rabiSeasonCultivationGainHa: number;
  beneficiaryFarmersCount: number;
  droughtVulnerabilityScore: number;
  soilErosionReductionTonnes: number;
  carbonSequestrationTonnes: number;
  monthlyGroundwaterTrends: {
    month: string;
    preInterventionDepth: number;
    postInterventionDepth: number;
  }[];
  cropDistribution: {
    cropName: string;
    preAreaHa: number;
    postAreaHa: number;
    yieldChangePercent: number;
  }[];
  indicators: ImpactIndicator[];
}
