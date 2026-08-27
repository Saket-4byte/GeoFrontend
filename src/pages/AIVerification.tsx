import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  ChevronRight,
  Bot,
  Sparkles,
} from "lucide-react";

import Layout from "../components/Layout";
import { MOCK_AI_VERIFICATIONS } from "../data/mockData";
import type { AIVerificationRecord, VerificationStatus } from "../types";

export default function AIVerification() {
  const [searchParams] = useSearchParams();
  const urlProjectId = searchParams.get("projectId");

  // Selected verification record
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    urlProjectId || MOCK_AI_VERIFICATIONS[0].projectId
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [decisionNotes, setDecisionNotes] = useState("");
  const [decisionStatus, setDecisionStatus] = useState<string | null>(null);
  const [comparisonMode, setComparisonMode] = useState<"side-by-side" | "overlay">("side-by-side");
  const [sliderPosition, setSliderPosition] = useState(50);

  // Active record
  const record: AIVerificationRecord = useMemo(() => {
    return (
      MOCK_AI_VERIFICATIONS.find((r) => r.projectId === selectedProjectId) ||
      MOCK_AI_VERIFICATIONS[0]
    );
  }, [selectedProjectId]);

  // Filtered queue
  const filteredQueue = useMemo(() => {
    return MOCK_AI_VERIFICATIONS.filter((r) => {
      const matchesSearch =
        r.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.projectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || r.verificationStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case "AI Verified":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Pending Review":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Flagged Anomaly":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";
    }
  };

  const handleAction = (action: string) => {
    setDecisionStatus(action);
    setTimeout(() => {
      setDecisionStatus(null);
    }, 4000);
  };

  return (
    <Layout>
      {/* Top Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Watershed Intelligence</span>
            <ChevronRight size={14} />
            <span className="text-[#0878d1]">AI Verification &amp; Evidence Audit</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#102a43] sm:text-3xl">
            AI Automated Evidence Verification
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Deep-learning forensic verification combining Sentinel-2 / Cartosat-3 satellite data, drone telemetry &amp; EXIF metadata
          </p>
        </div>

        {/* Global stats pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <Bot size={18} className="text-[#0878d1]" />
            <div className="text-left text-xs">
              <span className="text-[10px] text-slate-400">Neural Model</span>
              <p className="font-bold text-slate-800">HydroVision v4.2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Toast Feedback */}
      {decisionStatus && (
        <div className="mb-4 flex items-center justify-between rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span className="text-xs font-bold sm:text-sm">
              Decision recorded successfully: <span className="underline">{decisionStatus}</span> for {record.projectId}
            </span>
          </div>
          <button onClick={() => setDecisionStatus(null)} className="text-xs font-bold text-emerald-200 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Verification Queue (Left) + Detail Dossier (Right) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left Column: Verification Queue */}
        <div className="space-y-4 xl:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#0878d1]" />
                <h2 className="text-sm font-bold text-[#102a43]">Verification Queue</h2>
              </div>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#0878d1]">
                {filteredQueue.length} Cases
              </span>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search project or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-[#0878d1]"
              />
            </div>

            {/* Status Filter */}
            <div className="mb-3 flex flex-wrap gap-1 border-b border-slate-100 pb-2">
              {["All", "AI Verified", "Pending Review", "Flagged Anomaly", "Rejected"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-md px-2 py-1 text-[10px] font-semibold transition ${
                    statusFilter === st
                      ? "bg-[#102a43] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Queue List */}
            <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
              {filteredQueue.map((item) => {
                const isSelected = item.projectId === record.projectId;
                return (
                  <div
                    key={item.projectId}
                    onClick={() => setSelectedProjectId(item.projectId)}
                    className={`cursor-pointer rounded-xl border p-3 transition ${
                      isSelected
                        ? "border-[#0878d1] bg-blue-50/40 shadow-sm ring-1 ring-[#0878d1]"
                        : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-bold text-[#0878d1]">{item.projectId}</span>
                        <h4 className="line-clamp-1 text-xs font-semibold text-[#102a43]">{item.projectName}</h4>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block rounded-full border px-2 py-0.5 text-[9px] font-bold ${getStatusBadge(item.verificationStatus)}`}>
                          {item.verificationStatus}
                        </span>
                      </div>
                    </div>

                    <p className="mt-1 text-[11px] text-slate-500">{item.location}</p>

                    <div className="mt-2 flex items-center justify-between border-t border-slate-100/80 pt-2 text-[10px] text-slate-500">
                      <span>AI Score: <strong className="text-slate-800">{item.overallScore}%</strong></span>
                      <span className={item.fraudRiskScore > 20 ? "font-bold text-red-600" : "text-emerald-700"}>
                        Fraud Risk: {item.fraudRiskScore}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: In-Depth Verification Dossier */}
        <div className="space-y-6 xl:col-span-8">
          {/* Executive Verification Summary Card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-[#062c46] to-[#0878d1] p-5 text-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-white/20 px-2 py-0.5 font-mono text-xs font-bold">
                      {record.projectId}
                    </span>
                    <span className="text-xs text-cyan-200">{record.projectType}</span>
                  </div>
                  <h2 className="mt-1 text-lg font-bold sm:text-xl">{record.projectName}</h2>
                  <p className="text-xs text-slate-200">{record.location}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur">
                    <p className="text-[10px] font-semibold text-slate-300">Confidence Score</p>
                    <p className="text-2xl font-black text-white">{record.overallScore}%</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur">
                    <p className="text-[10px] font-semibold text-slate-300">Fraud Risk</p>
                    <p className={`text-2xl font-black ${record.fraudRiskScore > 20 ? "text-red-300" : "text-emerald-300"}`}>
                      {record.fraudRiskScore}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Diagnostic Ribbon */}
            <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50 sm:grid-cols-4">
              <div className="p-3 text-center">
                <p className="text-[10px] text-slate-500">Status</p>
                <p className="mt-0.5 text-xs font-bold text-slate-800">{record.verificationStatus}</p>
              </div>
              <div className="p-3 text-center">
                <p className="text-[10px] text-slate-500">Satellite Match</p>
                <p className="mt-0.5 text-xs font-bold text-emerald-600">{record.satelliteMatchScore}%</p>
              </div>
              <div className="p-3 text-center">
                <p className="text-[10px] text-slate-500">GPS Offset</p>
                <p className="mt-0.5 text-xs font-bold text-slate-800">{record.gpsDiscrepancyMeters}m</p>
              </div>
              <div className="p-3 text-center">
                <p className="text-[10px] text-slate-500">EXIF Tampering</p>
                <p className={`mt-0.5 text-xs font-bold ${record.tamperingDetected ? "text-red-600" : "text-emerald-600"}`}>
                  {record.tamperingDetected ? "Tamper Detected" : "Clean"}
                </p>
              </div>
            </div>

            {/* AI Explanation & Natural Language Reasoning */}
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold text-[#0878d1]">
                <Sparkles size={16} />
                <span>AI Forensic Evaluation Summary</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700 sm:text-sm bg-blue-50/50 p-3.5 rounded-xl border border-blue-100">
                {record.aiExplanation}
              </p>
            </div>
          </div>

          {/* Visual Evidence Inspector (Before vs After Imagery) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#102a43]">Satellite &amp; Ground Evidence Inspector</h3>
                <p className="text-xs text-slate-500">Multi-temporal optical verification vs uploaded site imagery</p>
              </div>

              {/* Mode Toggle */}
              <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                <button
                  onClick={() => setComparisonMode("side-by-side")}
                  className={`rounded-md px-3 py-1 text-xs font-bold transition ${
                    comparisonMode === "side-by-side" ? "bg-white text-[#0878d1] shadow-sm" : "text-slate-500"
                  }`}
                >
                  Side-by-Side
                </button>
                <button
                  onClick={() => setComparisonMode("overlay")}
                  className={`rounded-md px-3 py-1 text-xs font-bold transition ${
                    comparisonMode === "overlay" ? "bg-white text-[#0878d1] shadow-sm" : "text-slate-500"
                  }`}
                >
                  Split Slider
                </button>
              </div>
            </div>

            {comparisonMode === "side-by-side" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <div className="relative h-56 w-full">
                    <img
                      src={record.satelliteBeforeUrl}
                      alt="Pre-Construction Baseline"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                      Baseline (Pre-Construction)
                    </div>
                  </div>
                  <div className="p-2.5 text-[11px] text-slate-600">
                    <p className="font-semibold text-slate-800">Historical Satellite Baseline</p>
                    <p className="text-[10px] text-slate-400">Zero surface water retention signature</p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <div className="relative h-56 w-full">
                    <img
                      src={record.satelliteAfterUrl}
                      alt="Post-Construction Verification"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute left-2 top-2 rounded-md bg-emerald-800/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                      Post-Construction (Current)
                    </div>
                  </div>
                  <div className="p-2.5 text-[11px] text-slate-600">
                    <p className="font-semibold text-slate-800">Post-Construction Water &amp; Masonry</p>
                    <p className="text-[10px] text-slate-400">Clear spectral reflectance shift verified</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative h-64 w-full overflow-hidden rounded-xl border border-slate-200">
                  <img
                    src={record.satelliteAfterUrl}
                    alt="After"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${sliderPosition}%` }}
                  >
                    <img
                      src={record.satelliteBeforeUrl}
                      alt="Before"
                      className="h-full w-full object-cover max-w-none"
                      style={{ width: "100%" }}
                    />
                  </div>
                  {/* Slider divider line */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                    style={{ left: `${sliderPosition}%` }}
                  />
                  <div className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
                    Before (Left)
                  </div>
                  <div className="absolute right-2 top-2 rounded bg-emerald-700/90 px-2 py-0.5 text-[10px] font-bold text-white">
                    After (Right)
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">Drag to inspect:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPosition}
                    onChange={(e) => setSliderPosition(Number(e.target.value))}
                    className="flex-1 accent-[#0878d1]"
                  />
                  <span className="text-xs font-mono font-bold text-slate-700">{sliderPosition}%</span>
                </div>
              </div>
            )}
          </div>

          {/* AI Automated Inspection Checklist */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-[#102a43]">Automated Verification Checks</h3>

            <div className="space-y-3">
              {record.checks.map((check, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border p-3.5 transition ${
                    check.passed ? "border-emerald-100 bg-emerald-50/30" : "border-red-100 bg-red-50/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      {check.passed ? (
                        <CheckCircle2 size={18} className="mt-0.5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle size={18} className="mt-0.5 text-red-600 shrink-0" />
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 sm:text-sm">{check.name}</h4>
                        <p className="text-xs text-slate-500">{check.description}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-700">{check.details}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400">Confidence</span>
                      <p className="font-mono text-xs font-bold text-slate-700">{check.confidence}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detected Dimensions & Structural Specs */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-[#102a43]">Physical Dimension &amp; Feature Verification</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5">Feature Specification</th>
                    <th className="px-4 py-2.5">Sanctioned Norm</th>
                    <th className="px-4 py-2.5">AI Detected Value</th>
                    <th className="px-4 py-2.5">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {record.detectedFeatures.map((f, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-semibold text-slate-800">{f.feature}</td>
                      <td className="px-4 py-2.5 text-slate-600">{f.expected}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-700">{f.detected}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            f.status === "Pass"
                              ? "bg-emerald-100 text-emerald-800"
                              : f.status === "Warning"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Officer Decision & Action Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#102a43]">Authorized Officer Decision &amp; Audit Log</h3>
            <p className="text-xs text-slate-500">Review AI recommendations and record formal statutory decision</p>

            <div className="mt-4 space-y-3">
              <textarea
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Enter statutory inspection notes or justification for approval/rejection..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 outline-none focus:border-[#0878d1] focus:ring-2 focus:ring-[#0878d1]/10"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  Logged in as: <strong className="text-slate-700">Admin User (OWDM)</strong>
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleAction("Rejected Claim & Alerted Vigilance")}
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                  >
                    Reject Claim
                  </button>
                  <button
                    onClick={() => handleAction("Requested Drone Re-survey")}
                    className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold text-orange-700 transition hover:bg-orange-100"
                  >
                    Request Re-Survey
                  </button>
                  <button
                    onClick={() => handleAction("Approved & Verification Certificate Issued")}
                    className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:shadow-md hover:brightness-105"
                  >
                    Approve &amp; Issue Certificate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
