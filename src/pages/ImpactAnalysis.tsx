import { useState, useMemo } from "react";
import {
  TrendingUp,
  Droplets,
  Sprout,
  Users,
  Shield,
  ChevronRight,
  Download,
  CheckCircle2,
  Layers,
  ArrowUpRight,
} from "lucide-react";

import Layout from "../components/Layout";
import { MOCK_IMPACT_SUMMARY } from "../data/mockData";

export default function ImpactAnalysis() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [reportGenerated, setReportGenerated] = useState(false);

  const data = MOCK_IMPACT_SUMMARY;

  const filteredIndicators = useMemo(() => {
    if (selectedCategory === "All") return data.indicators;
    return data.indicators.filter((ind) => ind.category === selectedCategory);
  }, [selectedCategory]);

  const handleExport = () => {
    setReportGenerated(true);
    setTimeout(() => {
      setReportGenerated(false);
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
            <span className="text-[#0878d1]">Socio-Hydrological Impact Analysis</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#102a43] sm:text-3xl">
            Watershed Impact &amp; Socio-Ecological ROI
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            {data.watershedName} ({data.watershedId}) • {data.district}, {data.state}
          </p>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0878d1] to-[#0ca39b] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:shadow-md hover:brightness-105"
        >
          <Download size={16} />
          <span>Export Impact Dossier (PDF)</span>
        </button>
      </div>

      {/* Export Toast */}
      {reportGenerated && (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span className="text-xs font-bold sm:text-sm">
              Official Watershed Impact Assessment Dossier generated and compiled for PMKSY audit.
            </span>
          </div>
          <button onClick={() => setReportGenerated(false)} className="text-xs font-bold text-emerald-200 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Executive Impact Scorecard */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Water Table Rise</span>
            <Droplets size={18} className="text-[#0878d1]" />
          </div>
          <p className="mt-2 text-2xl font-black text-[#0878d1]">+{data.groundwaterTableRiseMeters}m</p>
          <p className="text-[10px] text-slate-500">Piezometer verified rise</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Water Harvested</span>
            <Layers size={18} className="text-cyan-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-cyan-700">{data.totalWaterHarvestedMCM} <span className="text-xs font-normal text-slate-500">MCM</span></p>
          <p className="text-[10px] text-slate-500">Storage capacity created</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Crop Yield Gain</span>
            <TrendingUp size={18} className="text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">+{data.cropYieldIncreasePercent}%</p>
          <p className="text-[10px] text-slate-500">Kharif &amp; Rabi weighted</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Rabi Area Gain</span>
            <Sprout size={18} className="text-lime-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-lime-700">+{data.rabiSeasonCultivationGainHa} <span className="text-xs font-normal text-slate-500">Ha</span></p>
          <p className="text-[10px] text-slate-500">Double cropped acreage</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Farmer Families</span>
            <Users size={18} className="text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-indigo-700">{data.beneficiaryFarmersCount}</p>
          <p className="text-[10px] text-slate-500">Assured irrigation access</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Drought Risk</span>
            <Shield size={18} className="text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">{data.droughtVulnerabilityScore}<span className="text-xs text-slate-400 font-normal">/100</span></p>
          <p className="text-[10px] text-emerald-700 font-semibold">Low Vulnerability</p>
        </div>
      </div>

      {/* Main Grid: Groundwater Trends & Crop Shift */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 mb-6">
        {/* Groundwater Table Dynamics */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#102a43]">Monthly Groundwater Table Depth (m bgl)</h3>
              <p className="text-xs text-slate-500">Comparison of Pre-Intervention vs Post-Intervention water table</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="h-2 w-2 rounded-full bg-slate-300" /> Pre-Intervention
              </span>
              <span className="flex items-center gap-1 text-[#0878d1]">
                <span className="h-2 w-2 rounded-full bg-[#0878d1]" /> Post-Intervention
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {data.monthlyGroundwaterTrends.map((t) => {
              const diff = (t.preInterventionDepth - t.postInterventionDepth).toFixed(1);
              return (
                <div key={t.month} className="flex items-center gap-3 text-xs">
                  <span className="w-8 font-bold text-slate-600">{t.month}</span>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden flex-1">
                        <div
                          className="h-full bg-slate-400"
                          style={{ width: `${(t.preInterventionDepth / 16) * 100}%` }}
                        />
                      </div>
                      <span className="w-12 font-mono text-[10px] text-slate-400">{t.preInterventionDepth}m</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 rounded-full bg-blue-100 overflow-hidden flex-1">
                        <div
                          className="h-full bg-[#0878d1]"
                          style={{ width: `${(t.postInterventionDepth / 16) * 100}%` }}
                        />
                      </div>
                      <span className="w-12 font-mono text-[10px] font-bold text-[#0878d1]">{t.postInterventionDepth}m</span>
                    </div>
                  </div>
                  <span className="w-14 text-right font-mono text-[10px] font-bold text-emerald-600">
                    +{diff}m
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agricultural Transformation & Crop Diversification */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-5">
          <h3 className="text-sm font-bold text-[#102a43]">Agricultural Cropping Pattern Shift</h3>
          <p className="text-xs text-slate-500 mb-4">Acreage expansion in high-value Rabi &amp; Zaid crops</p>

          <div className="space-y-4">
            {data.cropDistribution.map((crop) => (
              <div key={crop.cropName} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">{crop.cropName}</h4>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    +{crop.yieldChangePercent}% Yield
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                  <span>Pre: <strong>{crop.preAreaHa} Ha</strong></span>
                  <ArrowUpRight size={14} className="text-emerald-500" />
                  <span>Post: <strong className="text-slate-900">{crop.postAreaHa} Ha</strong></span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    style={{ width: `${Math.min(100, (crop.postAreaHa / 500) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Impact Indicators Table with Category Tabs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-bold text-[#102a43]">Socio-Ecological Impact Indicators</h3>
            <p className="text-xs text-slate-500">Measurable key performance indicators tracked across project cycle</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-1.5">
            {["All", "Hydrological", "Agricultural", "Socio-Economic", "Ecological"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  selectedCategory === cat
                    ? "bg-[#102a43] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
              <tr>
                <th className="px-4 py-3">Indicator Name &amp; Scope</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Baseline</th>
                <th className="px-4 py-3">Current Impact</th>
                <th className="px-4 py-3">Target Norm</th>
                <th className="px-4 py-3 text-right">Net Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIndicators.map((ind, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-800">{ind.metric}</p>
                    <p className="text-[10px] text-slate-500">{ind.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {ind.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">{ind.baseline}</td>
                  <td className="px-4 py-3 font-mono font-bold text-[#0878d1]">{ind.current}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{ind.target}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        ind.trend === "positive"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {ind.changePercent > 0 ? `+${ind.changePercent.toFixed(1)}%` : `${ind.changePercent.toFixed(1)}%`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
