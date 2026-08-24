import { useState, useRef, useEffect } from "react";
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
  Landmark,
  Building2,
  Waves,
  LogIn,
  Target,
} from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
];

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [langOpen, setLangOpen] = useState(false);

  const langRef = useRef(null);

  /* ============================================================
     CLOSE LANGUAGE DROPDOWN WHEN CLICKING OUTSIDE
  ============================================================ */

  useEffect(() => {
    function handleOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, []);

  /* ============================================================
     LOGIN HANDLER
  ============================================================ */

  const handleLogin = (e) => {
    e.preventDefault();

    console.log("Login submitted");
  };

  return (
    <div className="min-h-screen bg-[#eef1f5] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1500px]">

        {/* ======================================================
            LANGUAGE DROPDOWN
        ======================================================= */}

        <div
          className="mb-5 flex justify-end"
          ref={langRef}
        >
          <div className="relative">

            <button
              type="button"
              onClick={() => setLangOpen((open) => !open)}
              className="flex items-center gap-2.5 rounded-full border border-[#dfe6ec] bg-white px-4 py-2 text-sm font-semibold text-[#243b53] shadow-sm transition hover:border-[#b9cee1] hover:shadow"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
            >
              <Globe2
                size={16}
                className="text-[#536b84]"
              />

              <span>{language.label}</span>

              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  langOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {langOpen && (
              <ul
                role="listbox"
                className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-[#d9e3ed] bg-white shadow-lg"
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
                    className={`flex cursor-pointer items-center gap-3 px-4 py-3 text-sm transition hover:bg-[#f0f7ff] ${
                      language.code === lang.code
                        ? "font-bold text-[#0878d1]"
                        : "font-medium text-[#243b53]"
                    }`}
                  >
                    <Globe2
                      size={15}
                      className="text-[#536b84]"
                    />

                    {lang.label}

                    {language.code === lang.code && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-[#0878d1]" />
                    )}
                  </li>
                ))}
              </ul>
            )}

          </div>
        </div>

        {/* ======================================================
            MAIN TWO-COLUMN LAYOUT

            items-stretch makes both cards equal height
        ======================================================= */}

        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1.18fr_0.82fr]">

          {/* ====================================================
              LEFT CARD
          ===================================================== */}

          <section className="relative h-full overflow-hidden rounded-[28px] shadow-[0_20px_60px_rgba(15,61,91,0.10)]">

            {/* Background image */}
            <img
              src="https://images.unsplash.com/photo-1506260408121-e353d10b87c7?auto=format&fit=crop&w=1600&q=85"
              alt="Green hills and forested watershed under a cloudy sky"
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Main gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#cfe6fb]/95 via-[#daedfc]/92 to-[#eef6fd]/85" />

            {/* Soft highlight */}
            <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/40 blur-3xl" />

            {/* ==================================================
                DOTTED PATTERN
            =================================================== */}

            <div
              className="pointer-events-none absolute right-6 top-8 h-32 w-44 opacity-70"
              style={{
                backgroundImage:
                  "radial-gradient(#6ba5d6 1.4px, transparent 1.4px)",
                backgroundSize: "15px 15px",
                WebkitMaskImage:
                  "radial-gradient(ellipse at top right, black 30%, transparent 75%)",
                maskImage:
                  "radial-gradient(ellipse at top right, black 30%, transparent 75%)",
              }}
            />

            {/* ==================================================
                HERO HEADER
            =================================================== */}

            <div className="relative z-10 px-8 pb-6 pt-9 sm:px-10 sm:pt-10">

              {/* Government badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#1c4d75] backdrop-blur-sm">
                <Landmark size={13} />
                Government of India Initiative
              </div>

              {/* Logo + name */}
              <div className="flex items-center gap-4">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-lg ring-4 ring-white/50">

                  <div className="relative h-11 w-8">

                    <div className="h-11 w-8 rounded-b-[22px] rounded-t-[8px] bg-gradient-to-b from-[#0877d1] to-[#0b5d9b]" />

                    <div className="absolute -bottom-1 left-[-5px] h-6 w-7 rotate-[-25deg] rounded-bl-[20px] rounded-tr-[20px] bg-[#19a66a]" />

                  </div>
                </div>

                <div>

                  <h1 className="text-3xl font-extrabold tracking-tight text-[#071d3a] sm:text-4xl">
                    JAL<span className="text-[#1677d2]">DRISHTI</span>
                  </h1>

                  <p className="mt-1 text-sm font-medium text-[#3a5773] sm:text-base">
                    Watershed Intelligence Platform
                  </p>

                </div>
              </div>

              {/* Main heading */}
              <h2 className="mt-8 text-4xl font-extrabold leading-[1.08] tracking-tight text-[#08264b] sm:text-5xl">
                See. Verify.{" "}
                <span className="text-[#0b78d0]">
                  Impact.
                </span>
              </h2>

              {/* Accent line */}
              <div className="mt-4 h-1 w-28 rounded-full bg-gradient-to-r from-[#0878d1] to-[#16a99a]" />

              {/* Description */}
              <p className="mt-5 max-w-lg text-[15px] leading-6 text-[#33506e] sm:text-base">
                AI-powered monitoring and verification of watershed projects
                for a sustainable and water-secure future.
              </p>

            </div>

            {/* ==================================================
                IMAGE / FEATURE AREA
            =================================================== */}

            <div className="relative mt-2 h-[430px] sm:h-[450px] lg:h-[470px]">

              {/* Background photo */}
              <img
                src="https://images.unsplash.com/photo-1503754163129-a02a0c097de0?auto=format&fit=crop&w=1600&q=85"
                alt="Bird's-eye view of a large water dam and reservoir"
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* Top photo fade */}
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#cfe6fb] to-transparent" />

              {/* Bottom dark overlay */}
              <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              {/* =================================================
                  FEATURE CARDS
              ================================================== */}

              <div className="absolute left-6 right-6 top-6 grid grid-cols-2 gap-3 sm:left-8 sm:right-8 sm:gap-4 md:grid-cols-4">

                <Feature
                  icon={<MapPin size={22} />}
                  title="Geo-Tagged"
                  subtitle="Evidence"
                  color="green"
                />

                <Feature
                  icon={<Cpu size={22} />}
                  title="AI"
                  subtitle="Verification"
                  color="blue"
                />

                <Feature
                  icon={<Satellite size={22} />}
                  title="Satellite"
                  subtitle="Analysis"
                  color="indigo"
                />

                <Feature
                  icon={<Leaf size={22} />}
                  title="Impact"
                  subtitle="Assessment"
                  color="green"
                />

              </div>

              {/* =================================================
                  STATISTICS BAR

                  IMPORTANT:
                  bottom-[58px] keeps statistics near bottom
                  while leaving space for Government footer.
              ================================================== */}

              <div className="absolute bottom-[58px] left-6 right-6 overflow-hidden rounded-2xl border border-white/30 bg-[#073b58]/85 shadow-2xl backdrop-blur-md sm:left-8 sm:right-8">

                {/* Statistics */}
                <div className="grid grid-cols-2 divide-x divide-y divide-white/20 sm:grid-cols-4 sm:divide-y-0">

                  <Stat
                    icon={<Waves size={20} />}
                    value="5,000+"
                    label="Watersheds"
                    sublabel="Target"
                  />

                  <Stat
                    icon={<Building2 size={20} />}
                    value="20,000+"
                    label="Projects"
                    sublabel="Target"
                  />

                  <Stat
                    icon={<ShieldCheck size={20} />}
                    value="15,000+"
                    label="Verified"
                    sublabel="Target"
                  />

                  <Stat
                    icon={<Target size={20} />}
                    value="75%"
                    label="Health Score"
                    sublabel="Target"
                  />

                </div>

                {/* Statistics footer */}
                <div className="border-t border-white/15 px-4 py-2 text-center">

                  <p className="text-[10px] font-semibold uppercase tracking-wide text-white/55 sm:text-[11px]">
                    Projected Targets · Platform Launch Pending
                  </p>

                </div>

              </div>

              {/* =================================================
                  GOVERNMENT FOOTER

                  Kept at the absolute bottom.
              ================================================== */}

              <div className="absolute bottom-3 left-6 right-6 flex items-center gap-3 text-white sm:left-8 sm:right-8">

                <div className="flex h-9 w-8 shrink-0 items-center justify-center rounded-md bg-white/10">
                  <Landmark size={20} />
                </div>

                <div className="text-[11px] leading-4 sm:text-xs sm:leading-5">

                  <p className="font-bold">
                    Government of India
                  </p>

                  <p className="opacity-90">
                    Department of Water Resources, River Development &amp;
                    Ganga Rejuvenation
                  </p>

                </div>

              </div>

            </div>
          </section>

          {/* ====================================================
              RIGHT LOGIN CARD
          ===================================================== */}

          <section className="flex h-full flex-col rounded-[28px] bg-white px-6 py-9 shadow-[0_20px_60px_rgba(15,61,91,0.10)] sm:px-10 sm:py-11">

            <div className="mx-auto flex h-full w-full max-w-[440px] flex-col justify-center">

              {/* =================================================
                  SECURITY ICON
              ================================================== */}

              <div className="mx-auto mb-6">

                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#e7f5ff] to-[#f3fbff]">

                  <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white shadow-md">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0a7ed4] to-[#0da493] text-white">
                      <Lock size={19} />
                    </div>

                  </div>

                </div>

              </div>

              {/* =================================================
                  LOGIN HEADING
              ================================================== */}

              <div className="text-center">

                <h2 className="text-[28px] font-extrabold tracking-tight text-[#09264a] sm:text-3xl">
                  Welcome Back!
                </h2>

                <p className="mt-2.5 text-sm text-[#61758a] sm:text-[15px]">
                  Login to continue to JalDrishti Platform
                </p>

              </div>

              {/* =================================================
                  LOGIN FORM
              ================================================== */}

              <form
                onSubmit={handleLogin}
                className="mt-8 space-y-5"
              >

                {/* USER ID */}

                <div>

                  <label
                    htmlFor="userId"
                    className="mb-2 block text-sm font-bold text-[#183552]"
                  >
                    User ID / Email
                  </label>

                  <div className="relative">

                    <Mail
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#61758a]"
                    />

                    <input
                      id="userId"
                      name="userId"
                      type="text"
                      placeholder="Enter your email or user ID"
                      className="h-[52px] w-full rounded-xl border border-[#d3dee8] bg-white pl-12 pr-4 text-sm text-[#102a43] outline-none transition placeholder:text-[#9aaabd] focus:border-[#1781d3] focus:ring-4 focus:ring-[#1781d3]/10"
                      required
                    />

                  </div>

                </div>

                {/* PASSWORD */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="block text-sm font-bold text-[#183552]"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-sm font-semibold text-[#0878d1] transition hover:text-[#075ea8]"
                    >
                      Forgot Password?
                    </button>

                  </div>

                  <div className="relative">

                    <Lock
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#61758a]"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="h-[52px] w-full rounded-xl border border-[#d3dee8] bg-white pl-12 pr-12 text-sm text-[#102a43] outline-none transition placeholder:text-[#9aaabd] focus:border-[#1781d3] focus:ring-4 focus:ring-[#1781d3]/10"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#65798d] transition hover:text-[#0878d1]"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>

                  </div>

                </div>

                {/* REMEMBER ME */}

                <div className="flex items-center justify-between">

                  <label className="flex cursor-pointer items-center gap-3 text-sm text-[#61758a]">

                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) =>
                        setRememberMe(e.target.checked)
                      }
                      className="h-4 w-4 rounded border-[#b9c7d4] accent-[#1678d2]"
                    />

                    <span>
                      Remember me
                    </span>

                  </label>

                  <div className="flex items-center gap-2 text-xs font-medium text-[#61758a]">

                    <ShieldCheck
                      size={16}
                      className="text-[#22a66d]"
                    />

                    Secure Login

                  </div>

                </div>

                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  className="group flex h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#0877d1] to-[#0ca29c] text-base font-bold text-white shadow-lg shadow-[#0877d1]/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#0877d1]/25 active:translate-y-0"
                >

                  <LogIn
                    size={20}
                    className="transition-transform group-hover:translate-x-0.5"
                  />

                  Login

                </button>

              </form>

              {/* =================================================
                  DIVIDER
              ================================================== */}

              <div className="my-6 flex items-center gap-4">

                <div className="h-px flex-1 bg-[#e1e8ef]" />

                <span className="text-xs font-medium text-[#8595a6]">
                  or continue with
                </span>

                <div className="h-px flex-1 bg-[#e1e8ef]" />

              </div>

              {/* =================================================
                  SSO BUTTONS
              ================================================== */}

              <div className="grid grid-cols-2 gap-3.5">

                {/* DIGITAL INDIA */}

                <button
                  type="button"
                  className="flex min-h-[62px] items-center justify-center gap-2.5 rounded-xl border border-[#d7e1ea] bg-white px-3 transition hover:border-[#9eb9d0] hover:bg-[#f8fbfd] hover:shadow-sm"
                >

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f8fb] text-[#1d7cbb]">
                    <Globe2 size={20} />
                  </div>

                  <div className="text-left">

                    <p className="text-sm font-bold text-[#243b53]">
                      Digital India
                    </p>

                    <p className="text-xs text-[#718398]">
                      Login
                    </p>

                  </div>

                </button>

                {/* e-PRAMAAN */}

                <button
                  type="button"
                  className="flex min-h-[62px] items-center justify-center gap-2.5 rounded-xl border border-[#d7e1ea] bg-white px-3 transition hover:border-[#9eb9d0] hover:bg-[#f8fbfd] hover:shadow-sm"
                >

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f8fb] text-[#172d52]">

                    <span className="text-lg font-black">
                      e
                    </span>

                  </div>

                  <div className="text-left">

                    <p className="text-sm font-bold text-[#243b53]">
                      e-Pramaan
                    </p>

                    <p className="text-xs text-[#718398]">
                      SSO
                    </p>

                  </div>

                </button>

              </div>

              {/* =================================================
                  GOVERNMENT NOTICE
              ================================================== */}

              <div className="mt-6 flex gap-3 rounded-xl border border-[#d7f0e3] bg-[#effaf4] px-4 py-4">

                <div className="mt-0.5 text-[#199765]">
                  <Lock size={16} />
                </div>

                <div>

                  <p className="text-sm font-bold text-[#247052]">
                    This is a government monitoring system.
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-[#4e806d]">
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

        <footer className="pb-2 pt-7 text-center text-xs text-[#7c8b9a]">

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">

            <span>
              © 2026 JalDrishti. All rights reserved.
            </span>

            <span className="hidden text-[#c3ccd6] sm:inline">
              |
            </span>

            <button className="hover:text-[#0878d1]">
              Privacy Policy
            </button>

            <span className="hidden text-[#c3ccd6] sm:inline">
              |
            </span>

            <button className="hover:text-[#0878d1]">
              Terms of Use
            </button>

            <span className="hidden text-[#c3ccd6] sm:inline">
              |
            </span>

            <button className="hover:text-[#0878d1]">
              Help
            </button>

          </div>

        </footer>

      </div>
    </div>
  );
}

/* ==============================================================
   FEATURE COMPONENT
============================================================== */

function Feature({
  icon,
  title,
  subtitle,
  color,
}) {
  const styles = {
    green: "bg-[#eaf8f1] text-[#159b68]",
    blue: "bg-[#eaf4ff] text-[#0878d1]",
    indigo: "bg-[#eef0ff] text-[#4c5fd7]",
  };

  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/95 px-2 py-4 text-center shadow-[0_6px_18px_rgba(15,61,91,0.08)] backdrop-blur-sm">

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-full ${styles[color]}`}
      >
        {icon}
      </div>

      <p className="text-[13px] font-bold leading-tight text-[#16324f] sm:text-sm">
        {title}
        <br />
        {subtitle}
      </p>

    </div>
  );
}

/* ==============================================================
   STATISTICS COMPONENT
============================================================== */

function Stat({
  icon,
  value,
  label,
  sublabel,
}) {
  return (
    <div className="px-3 py-4 text-center text-white sm:px-4 sm:py-4">

      {/* Icon */}

      <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 sm:h-9 sm:w-9">
        {icon}
      </div>

      {/* Number */}

      <p className="text-xl font-extrabold tracking-tight sm:text-2xl">
        {value}
      </p>

      {/* Label */}

      <p className="mt-0.5 text-[11px] font-semibold sm:text-xs">
        {label}
      </p>

      {/* Target */}

      <p className="text-[9px] font-semibold uppercase tracking-wide text-[#7dd4b8] sm:text-[10px]">
        {sublabel}
      </p>

    </div>
  );
} 