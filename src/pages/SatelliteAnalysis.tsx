import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Satellite,
  Layers,
  Calendar,
  ChevronRight,
  Droplets,
  Trees,
  Activity,
} from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import Layout from "../components/Layout";
import { MOCK_PROJECTS, MOCK_SATELLITE_OBSERVATIONS } from "../data/mockData";
import type { SatelliteObservation } from "../types";

export default function SatelliteAnalysis() {
  const [searchParams] = useSearchParams();
  const urlProjectId = searchParams.get("projectId");

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    urlProjectId || MOCK_PROJECTS[0].id
  );
  const [selectedSensor, setSelectedSensor] = useState<string>("Sentinel-2 L2A");
  const [spectralIndex, setSpectralIndex] = useState<"NDVI" | "NDWI" | "True Color" | "False Color">("NDVI");
  const [selectedDate, setSelectedDate] = useState<string>("2025-02-15");
  const [opacity, setOpacity] = useState<number>(85);

  const currentProject = useMemo(() => {
    return MOCK_PROJECTS.find((p) => p.id === selectedProjectId) || MOCK_PROJECTS[0];
  }, [selectedProjectId]);

  const observation: SatelliteObservation = useMemo(() => {
    return (
      MOCK_SATELLITE_OBSERVATIONS.find((o) => o.projectId === selectedProjectId) ||
      MOCK_SATELLITE_OBSERVATIONS[0]
    );
  }, [selectedProjectId]);

  return (
    <Layout>
      {/* Top Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Watershed Intelligence</span>
            <ChevronRight size={14} />
            <span className="text-[#0878d1]">Satellite &amp; Spectral Analysis</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#102a43] sm:text-3xl">
            Earth Observation &amp; Multi-Spectral Indices
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Continuous remote sensing monitoring for water spread area, NDVI vegetation health &amp; moisture dynamics
          </p>
        </div>

        {/* Sensor Source Selection */}
        <div className="flex flex-wrap items-center gap-2">
          {["Sentinel-2 L2A", "Landsat-9 OLI", "Cartosat-3"].map((sensor) => (
            <button
              key={sensor}
              onClick={() => setSelectedSensor(sensor)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                selectedSensor === sensor
                  ? "border-[#0878d1] bg-blue-50/80 text-[#0878d1] shadow-sm ring-1 ring-[#0878d1]"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Satellite size={14} />
              <span>{sensor}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Control Bar: Project Selector, Date Timeline & Spectral Indices */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Target Watershed Project */}
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Target Project
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0878d1]"
            >
              {MOCK_PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} - {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Spectral Mask Selector */}
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Spectral Index Layer
            </label>
            <div className="grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
              {(["NDVI", "NDWI", "True Color", "False Color"] as const).map((idx) => (
                <button
                  key={idx}
                  onClick={() => setSpectralIndex(idx)}
                  className={`rounded-lg py-1 text-center text-xs font-bold transition ${
                    spectralIndex === idx
                      ? "bg-[#0878d1] text-white shadow-sm"
                      : "text-slate-600 hover:bg-white/60"
                  }`}
                >
                  {idx}
                </button>
              ))}
            </div>
          </div>

          {/* Acquisition Pass Date */}
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Satellite Pass Acquisition
            </label>
            <div className="relative">
              <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0878d1]"
              >
                <option value="2025-02-15">15 Feb 2025 (Post-Winter Clear)</option>
                <option value="2024-11-20">20 Nov 2024 (Post-Monsoon Peak)</option>
                <option value="2024-05-18">18 May 2024 (Pre-Monsoon Dry)</option>
              </select>
            </div>
          </div>

          {/* Layer Opacity Slider */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Layer Opacity
              </label>
              <span className="font-mono text-xs font-bold text-slate-700">{opacity}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="mt-2 w-full accent-[#0878d1]"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Spectral Map (Left) + Analysis Metrics (Right) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left Column: Interactive GIS / Spectral Map */}
        <div className="space-y-4 xl:col-span-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Map Header */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 p-4">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-[#0878d1]" />
                <h3 className="text-sm font-bold text-[#102a43]">
                  {spectralIndex} Multi-Spectral Raster Layer
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700">
                  Cloud: {observation.cloudCoverPercent}%
                </span>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[#0878d1]">
                  Res: {observation.resolutionMeters}m
                </span>
              </div>
            </div>

            {/* Map Canvas */}
            <div className="relative h-[480px] w-full">
              <MapContainer
                center={[currentProject.geo.latitude, currentProject.geo.longitude]}
                zoom={14}
                scrollWheelZoom={true}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <CircleMarker
                  center={[currentProject.geo.latitude, currentProject.geo.longitude]}
                  radius={18}
                  pathOptions={{
                    color: "#ffffff",
                    weight: 3,
                    fillColor: spectralIndex === "NDWI" ? "#0284c7" : "#16a34a",
                    fillOpacity: opacity / 100,
                  }}
                >
                  <Popup>
                    <div className="text-xs">
                      <p className="font-bold text-slate-800">{currentProject.name}</p>
                      <p className="text-slate-500">{selectedSensor} • {selectedDate}</p>
                      <p className="mt-1 font-bold text-emerald-600">NDVI: {observation.ndviAverage}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              </MapContainer>

              {/* Spectral Gradient Legend Overlay */}
              <div className="pointer-events-none absolute bottom-4 left-4 z-[1000] rounded-xl border border-white/80 bg-white/95 p-3 shadow-lg backdrop-blur">
                <p className="text-[10px] font-bold text-slate-800">
                  {spectralIndex === "NDVI" ? "NDVI Vigor Gradient (-0.2 to +1.0)" : "NDWI Moisture Gradient"}
                </p>
                <div className="mt-1.5 flex h-3 w-48 overflow-hidden rounded-full border border-slate-200">
                  <div className="h-full w-1/4 bg-[#e5f5e0]" />
                  <div className="h-full w-1/4 bg-[#a1d99b]" />
                  <div className="h-full w-1/4 bg-[#31a354]" />
                  <div className="h-full w-1/4 bg-[#006d2c]" />
                </div>
                <div className="mt-1 flex justify-between text-[9px] font-bold text-slate-500">
                  <span>Barren (0.1)</span>
                  <span>Moderate (0.4)</span>
                  <span>Dense (0.8+)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Key Remote Sensing Metrics */}
        <div className="space-y-4 xl:col-span-4">
          {/* Highlights */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-[#102a43]">Spectral Indices Summary</h3>

            <div className="space-y-3">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-900">Mean NDVI Index</span>
                  <Trees size={18} className="text-emerald-600" />
                </div>
                <p className="mt-1 text-2xl font-black text-emerald-700">+{observation.ndviAverage}</p>
                <p className="text-[10px] text-emerald-800">High biomass vigor in catchment</p>
              </div>

              <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-sky-900">Water Spread Area</span>
                  <Droplets size={18} className="text-sky-600" />
                </div>
                <p className="mt-1 text-2xl font-black text-sky-700">{observation.surfaceWaterAreaHa} Ha</p>
                <p className="text-[10px] text-sky-800">+1.18 Ha expansion post-monsoon</p>
              </div>

              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-900">Vegetation Coverage</span>
                  <Activity size={18} className="text-indigo-600" />
                </div>
                <p className="mt-1 text-2xl font-black text-indigo-700">{observation.vegetationCoverHa} Ha</p>
                <p className="text-[10px] text-indigo-800">Cultivated &amp; turf buffer zone</p>
              </div>
            </div>
          </div>

          {/* Spectral Bands Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-[#102a43]">Band Reflectance Radiometry</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Band</th>
                    <th className="px-3 py-2">Wavelength</th>
                    <th className="px-3 py-2">Reflectance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {observation.spectralBands.map((band, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-medium text-slate-800">{band.band}</td>
                      <td className="px-3 py-2 text-slate-500 font-mono">{band.wavelengthNm}</td>
                      <td className="px-3 py-2 font-mono font-bold text-[#0878d1]">{band.value.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
