import { useState, useRef, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Globe2,
  ChevronDown,
  MapPin,
  Cpu,
  Satellite,
  Leaf,
  ShieldCheck,
  Building2,
  Waves,
} from "lucide-react";
import Logo from "./components/Logo";

interface Language {
  code: string;
  label: string;
}

const LANGUAGES: Language[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
];

export default function Login() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("admin.jal@gov.in");
  const [password, setPassword] = useState("JalDrishti@2026");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [language, setLanguage] = useState<Language>(LANGUAGES[0]);
  const [langOpen, setLangOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);

  // Close language dropdown on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/dashboard");
    }, 400);
  };

  const handleSSOLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/dashboard");
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#102A43] px-4 py-6 sm:px-6 lg:px-10 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Topographic Wave Patterns */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-[450px] w-[450px] opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle at 100% 0%, #cbd5e1 1.5px, transparent 1.5px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="mx-auto w-full max-w-[1460px] flex-1 flex flex-col justify-between">
        {/* ======================================================
            TOP BAR: LANGUAGE SELECTOR
        ======================================================= */}
        <div className="flex justify-end mb-4 sm:mb-6" ref={langRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
            >
              <Globe2 size={15} className="text-slate-500" />
              <span>{language.label}</span>
              <ChevronDown
                size={13}
                className={`text-slate-400 transition-transform duration-200 ${
                  langOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {langOpen && (
              <ul
                role="listbox"
                className="absolute right-0 z-50 mt-1.5 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg py-1"
              >
                {LANGUAGES.map((lang) => (
                  <li
                    key={lang.code}
                    role="option"
                    aria-selected={language.code === lang.code}
                    onClick={() => {
                      setLanguage(lang);
                      setLangOpen(false);
                    }}
                    className={`flex cursor-pointer items-center justify-between px-3.5 py-2 text-xs transition hover:bg-sky-50 ${
                      language.code === lang.code
                        ? "font-bold text-[#0878d1] bg-sky-50/60"
                        : "font-medium text-slate-700"
                    }`}
                  >
                    <span>{lang.label}</span>
                    {language.code === lang.code && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0878d1]" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ======================================================
            MAIN TWO-COLUMN PRESENTATION
        ======================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.18fr_0.82fr] gap-6 items-stretch my-auto">
          {/* ====================================================
              LEFT CARD: HERO & WATERSHED INTELLIGENCE SHOWCASE
          ===================================================== */}
          <section className="relative rounded-[28px] overflow-hidden shadow-[0_20px_60px_rgba(15,61,91,0.09)] border border-slate-200/60 flex flex-col justify-between min-h-[720px] sm:min-h-[760px]">
            {/* Background scenic watershed landscape image */}
            <img
              src="https://images.unsplash.com/photo-1506260408121-e353d10b87c7?auto=format&fit=crop&w=1600&q=85"
              alt="Watershed reservoir surrounded by green hills"
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Gradient overlay: crisp light blue fade on top -> natural scenic view in middle/bottom */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#dcedfb] via-[#e5f1fc]/90 to-transparent h-[58%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent h-[60%] top-[40%]" />

            {/* Top Content: Logo, Headline, Paragraph, 4 Feature Badges */}
            <div className="relative z-10 px-7 pt-8 sm:px-10 sm:pt-10">
              {/* Brand Logo */}
              <Logo
                variant="light"
                size="lg"
                subtitle="Watershed Intelligence Platform"
              />

              {/* Main Headline */}
              <h2 className="mt-8 text-4xl sm:text-5xl font-black tracking-tight text-[#071d3a]">
                See. Verify. Impact.
              </h2>

              {/* Description Paragraph */}
              <p className="mt-4 max-w-lg text-[14.5px] sm:text-base leading-relaxed text-[#33506e] font-medium">
                AI-Powered monitoring and verification of watershed projects for a sustainable and water-secure future.
              </p>

              {/* 4 Circular Feature Badges */}
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 max-w-lg">
                {/* Geo-Tagged Evidence */}
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md text-[#16a34a] transition hover:scale-105">
                    <MapPin size={20} />
                  </div>
                  <p className="mt-2 text-xs font-bold text-[#102A43] leading-tight">
                    Geo-Tagged<br />Evidence
                  </p>
                </div>

                {/* AI Verification */}
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md text-[#0878d1] transition hover:scale-105">
                    <Cpu size={20} />
                  </div>
                  <p className="mt-2 text-xs font-bold text-[#102A43] leading-tight">
                    AI<br />Verification
                  </p>
                </div>

                {/* Satellite Analysis */}
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md text-[#6366f1] transition hover:scale-105">
                    <Satellite size={20} />
                  </div>
                  <p className="mt-2 text-xs font-bold text-[#102A43] leading-tight">
                    Satellite<br />Analysis
                  </p>
                </div>

                {/* Impact Assessment */}
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md text-[#15803d] transition hover:scale-105">
                    <Leaf size={20} />
                  </div>
                  <p className="mt-2 text-xs font-bold text-[#102A43] leading-tight">
                    Impact<br />Assessment
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Content: Translucent Stats Bar & Govt Authorization */}
            <div className="relative z-10 px-6 pb-6 sm:px-8 sm:pb-8 space-y-4">
              {/* Glassmorphism Statistics Bar */}
              <div className="overflow-hidden rounded-2xl border border-white/20 bg-[#072d47]/80 backdrop-blur-md shadow-2xl p-4">
                <div className="grid grid-cols-2 divide-x divide-white/15 sm:grid-cols-4">
                  {/* Watersheds */}
                  <div className="px-2 text-center">
                    <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#0878d1]/30 text-sky-300">
                      <Waves size={16} />
                    </div>
                    <p className="text-xl sm:text-2xl font-extrabold text-white">2,548</p>
                    <p className="text-[11px] font-semibold text-slate-200">Watersheds</p>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-sky-400">
                      Target
                    </span>
                  </div>

                  {/* Projects */}
                  <div className="px-2 text-center">
                    <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/30 text-emerald-300">
                      <Building2 size={16} />
                    </div>
                    <p className="text-xl sm:text-2xl font-extrabold text-white">12,486</p>
                    <p className="text-[11px] font-semibold text-slate-200">Projects</p>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                      Target
                    </span>
                  </div>

                  {/* Verified */}
                  <div className="px-2 text-center">
                    <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/30 text-indigo-300">
                      <ShieldCheck size={16} />
                    </div>
                    <p className="text-xl sm:text-2xl font-extrabold text-white">9,872</p>
                    <p className="text-[11px] font-semibold text-slate-200">Verified</p>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-300">
                      Target
                    </span>
                  </div>

                  {/* Health Score */}
                  <div className="px-2 text-center">
                    <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/30 text-amber-300">
                      <Leaf size={16} />
                    </div>
                    <p className="text-xl sm:text-2xl font-extrabold text-white">68%</p>
                    <p className="text-[11px] font-semibold text-slate-200">Avg. Watershed</p>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300">
                      Health Score (Target)
                    </span>
                  </div>
                </div>

                {/* Subfooter in stats */}
                <div className="mt-3 border-t border-white/10 pt-2 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                    Projected Targets · Platform Launch Pending
                  </p>
                </div>
              </div>

              {/* Government of India Official Emblem & Department Footer */}
              <div className="flex items-center gap-3 text-white pt-1">
                {/* Ashoka Lion Capital Vector Emblem */}
                <div className="flex h-10 w-9 shrink-0 items-center justify-center text-white">
                  <svg
                    viewBox="0 0 100 120"
                    fill="currentColor"
                    className="h-full w-full opacity-90"
                  >
                    {/* Ashoka Pillar Lion Emblem Representation */}
                    <path d="M50 5 C40 5 35 15 35 25 C35 32 38 38 43 42 C40 45 37 50 37 58 C37 68 44 75 50 78 C56 75 63 68 63 58 C63 50 60 45 57 42 C62 38 65 32 65 25 C65 15 60 5 50 5 Z M44 25 C44 20 47 16 50 16 C53 16 56 20 56 25 C56 30 53 34 50 34 C47 34 44 30 44 25 Z" />
                    <circle cx="50" cy="95" r="14" fill="none" stroke="currentColor" strokeWidth="3" />
                    <path d="M50 82 L50 108 M37 95 L63 95 M41 86 L59 104 M41 104 L59 86" stroke="currentColor" strokeWidth="2" />
                    <rect x="25" y="112" width="50" height="4" rx="2" fill="currentColor" />
                  </svg>
                </div>

                <div className="text-xs leading-tight">
                  <p className="font-bold text-white text-xs sm:text-[13px]">
                    Government of India
                  </p>
                  <p className="text-slate-200 text-[11px] leading-4 opacity-90 mt-0.5">
                    Department of Water Resources,<br />
                    River Development &amp; Ganga Rejuvenation
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ====================================================
              RIGHT CARD: CLEAN ENTERPRISE LOGIN PORTAL
          ===================================================== */}
          <section className="rounded-[28px] bg-white shadow-[0_20px_60px_rgba(15,61,91,0.08)] border border-slate-100 p-8 sm:p-12 flex flex-col justify-center">
            <div className="mx-auto w-full max-w-[420px]">
              {/* Concentric Shield Icon */}
              <div className="flex justify-center mb-4">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#f0f7ff]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e1effe] shadow-inner">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0878d1] to-[#0ca39b] text-white shadow-md">
                      <Lock size={19} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#071d3a]">
                  Welcome Back!
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-medium">
                  Login to continue to JalDrishti Platform
                </p>
              </div>

              {/* Credentials Form */}
              <form onSubmit={handleLogin} className="mt-7 space-y-4">
                {/* User ID / Email */}
                <div>
                  <label
                    htmlFor="userId"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                  >
                    User ID / Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="userId"
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="Enter your email or user ID"
                      required
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-medium text-[#102A43] outline-none transition focus:border-[#0878d1] focus:ring-4 focus:ring-[#0878d1]/10 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="password"
                      className="text-xs font-bold text-slate-700"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-xs font-semibold text-[#0878d1] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-xs font-medium text-[#102A43] outline-none transition focus:border-[#0878d1] focus:ring-4 focus:ring-[#0878d1]/10 placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Secure Login Row */}
                <div className="flex items-center justify-between pt-0.5 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 accent-[#0878d1]"
                    />
                    <span className="font-medium text-xs">Remember me</span>
                  </label>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <ShieldCheck size={16} />
                    <span>Secure Login</span>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0066cc] to-[#00a896] text-sm font-bold text-white shadow-lg shadow-[#0066cc]/20 hover:shadow-xl hover:shadow-[#0066cc]/25 active:scale-[0.99] transition cursor-pointer"
                >
                  <Lock size={16} />
                  <span>{isSubmitting ? "Logging in..." : "Login"}</span>
                </button>
              </form>

              {/* Divider */}
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] font-medium text-slate-400">
                  or continue with
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* SSO Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {/* Digital India Button */}
                <button
                  type="button"
                  onClick={handleSSOLogin}
                  className="flex min-h-[58px] items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left hover:border-slate-300 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
                >
                  {/* Digital India Tricolor Mark */}
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-700">
                    <Globe2 size={18} className="text-[#0878d1]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-tight">
                      Digital India
                    </p>
                    <p className="text-[10px] text-slate-500">Login</p>
                  </div>
                </button>

                {/* e-Pramaan Button */}
                <button
                  type="button"
                  onClick={handleSSOLogin}
                  className="flex min-h-[58px] items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left hover:border-slate-300 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
                >
                  {/* e-Pramaan Symbol */}
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0a2540] text-white font-black text-xs">
                    e
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-tight">
                      e-Pramaan
                    </p>
                    <p className="text-[10px] text-slate-500">SSO</p>
                  </div>
                </button>
              </div>

              {/* Government Notice Warning Box */}
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#cbead7] bg-[#edf8f2] p-3">
                <Lock size={15} className="text-[#199765] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#1b6343]">
                    This is a government monitoring system.
                  </p>
                  <p className="text-[11px] text-[#36795b] mt-0.5 leading-tight">
                    Unauthorized access is strictly prohibited.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ======================================================
            PAGE FOOTER
        ======================================================= */}
        <footer className="mt-6 pt-4 pb-2 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11.5px] text-slate-500">
            © 2026 JalDrishti. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[11.5px] text-slate-500">
            <button type="button" className="hover:text-[#0878d1] transition cursor-pointer">
              Privacy Policy
            </button>
            <span className="text-slate-300">|</span>
            <button type="button" className="hover:text-[#0878d1] transition cursor-pointer">
              Terms of Use
            </button>
            <span className="text-slate-300">|</span>
            <button type="button" className="hover:text-[#0878d1] transition cursor-pointer">
              Help
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
