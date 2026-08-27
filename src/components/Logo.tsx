interface LogoProps {
  variant?: "dark" | "light" | "icon-only";
  size?: "sm" | "md" | "lg" | "xl";
  subtitle?: string;
  showSubtitle?: boolean;
  className?: string;
}

export default function Logo({
  variant = "light",
  size = "md",
  subtitle = "Watershed Intelligence Platform",
  showSubtitle = true,
  className = "",
}: LogoProps) {
  // Sizing configurations
  const sizeConfig = {
    sm: {
      container: "h-9 w-9",
      dropWidth: "w-4",
      dropHeight: "h-6",
      leafWidth: "w-3.5",
      leafHeight: "h-3.5",
      titleText: "text-base",
      subtitleText: "text-[9px]",
      gap: "gap-2.5",
    },
    md: {
      container: "h-11 w-11",
      dropWidth: "w-5",
      dropHeight: "h-7",
      leafWidth: "w-4.5",
      leafHeight: "h-4",
      titleText: "text-xl",
      subtitleText: "text-[10.5px]",
      gap: "gap-3",
    },
    lg: {
      container: "h-14 w-14",
      dropWidth: "w-6.5",
      dropHeight: "h-9",
      leafWidth: "w-5.5",
      leafHeight: "h-5",
      titleText: "text-2xl sm:text-3xl",
      subtitleText: "text-xs",
      gap: "gap-3.5",
    },
    xl: {
      container: "h-16 w-16",
      dropWidth: "w-7.5",
      dropHeight: "h-10",
      leafWidth: "w-6.5",
      leafHeight: "h-5.5",
      titleText: "text-3xl sm:text-4xl",
      subtitleText: "text-sm",
      gap: "gap-4",
    },
  };

  const cfg = sizeConfig[size];
  const isDark = variant === "dark";

  return (
    <div className={`flex items-center ${cfg.gap} ${className}`}>
      {/* Icon Badge */}
      <div
        className={`flex ${cfg.container} shrink-0 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 ${
          isDark
            ? "ring-2 ring-white/20 shadow-cyan-950/30"
            : "ring-2 ring-sky-100 shadow-slate-300/40"
        }`}
      >
        <div className="relative flex items-center justify-center">
          {/* Water Droplet */}
          <div
            className={`${cfg.dropWidth} ${cfg.dropHeight} rounded-b-[24px] rounded-t-[10px] bg-gradient-to-b from-[#0878d1] via-[#096ab8] to-[#074b88] shadow-inner`}
          />
          {/* Green Leaf Accent */}
          <div
            className={`absolute -bottom-1 -left-1.5 ${cfg.leafWidth} ${cfg.leafHeight} rotate-[-28deg] rounded-bl-[18px] rounded-tr-[18px] rounded-tl-[4px] rounded-br-[8px] bg-gradient-to-tr from-[#15803d] to-[#22c55e] shadow-sm`}
          />
          {/* Water Highlight Sheen */}
          <div className="absolute top-1 right-1 h-2 w-1.5 rounded-full bg-white/40 blur-[0.5px]" />
        </div>
      </div>

      {/* Typography */}
      {variant !== "icon-only" && (
        <div className="flex flex-col justify-center">
          <h1
            className={`font-black tracking-tight leading-none ${cfg.titleText} ${
              isDark ? "text-white" : "text-[#071d3a]"
            }`}
          >
            JAL
            <span className={isDark ? "text-[#38bdf8]" : "text-[#0878d1]"}>
              DRISHTI
            </span>
          </h1>
          {showSubtitle && (
            <p
              className={`mt-1 font-medium tracking-wide ${cfg.subtitleText} ${
                isDark ? "text-slate-300" : "text-[#486581]"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
