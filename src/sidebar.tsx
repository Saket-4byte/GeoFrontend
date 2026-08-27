import {
  Home,
  Map,
  FolderKanban,
  Camera,
  Satellite,
  Bot,
  BarChart3,
  Bell,
  FileText,
  Upload,
  Users,
  Settings,
  ChevronRight,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

const mainMenu = [
  {
    label: "Dashboard",
    icon: Home,
    path: "/dashboard",
  },
  {
    label: "Watersheds",
    icon: Map,
    path: "/watersheds",
  },
  {
    label: "Projects",
    icon: FolderKanban,
    path: "/projects",
  },
  {
    label: "Field Evidence",
    icon: Camera,
    path: "/field-evidence",
  },
  {
    label: "Satellite Analysis",
    icon: Satellite,
    path: "/satellite-analysis",
  },
];

const aiMenu = [
  {
    label: "AI Verification",
    icon: Bot,
    path: "/ai-verification",
  },
  {
    label: "Impact Analysis",
    icon: BarChart3,
    path: "/impact-analysis",
  },
  {
    label: "Alerts & Reports",
    icon: Bell,
    path: "/reports",
  },
];

const reportMenu = [
  {
    label: "Impact Reports",
    icon: FileText,
    path: "/impact-reports",
  },
  {
    label: "Export Data",
    icon: Upload,
    path: "/export-data",
  },
];

const systemMenu = [
  {
    label: "Users & Roles",
    icon: Users,
    path: "/users",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

function MenuItem({
  item,
  onClick,
}: {
  item: {
    label: string;
    icon: React.ElementType;
    path: string;
  };
  onClick?: () => void;
}) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
          isActive
            ? "bg-gradient-to-r from-[#0878d1] to-[#0ca39b] text-white shadow-md shadow-[#0878d1]/20"
            : "text-slate-300 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3">
            <Icon
              size={18}
              strokeWidth={isActive ? 2.2 : 1.8}
              className="shrink-0"
            />

            <span>{item.label}</span>
          </div>

          <ChevronRight
            size={15}
            className={`transition-transform ${
              isActive
                ? "opacity-100"
                : "opacity-0 group-hover:translate-x-0.5 group-hover:opacity-60"
            }`}
          />
        </>
      )}
    </NavLink>
  );
}

function MenuSection({
  title,
  items,
  onClick,
}: {
  title: string;
  items: typeof mainMenu;
  onClick?: () => void;
}) {
  return (
    <div className="mt-6">
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300/70">
        {title}
      </p>

      <div className="space-y-1">
        {items.map((item) => (
          <MenuItem key={item.path} item={item} onClick={onClick} />
        ))}
      </div>
    </div>
  );
}

import Logo from "./components/Logo";

export default function Sidebar({
  isOpen = false,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[270px] flex-col overflow-y-auto bg-[#062c46] text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <Logo variant="dark" size="md" />

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pb-6">
          <MenuSection
            title="Main"
            items={mainMenu}
            onClick={onClose}
          />

          <MenuSection
            title="AI & Analytics"
            items={aiMenu}
            onClick={onClose}
          />

          <MenuSection
            title="Reports"
            items={reportMenu}
            onClick={onClose}
          />

          <MenuSection
            title="System"
            items={systemMenu}
            onClick={onClose}
          />
        </nav>

        {/* Bottom information card */}
        <div className="mx-4 mb-5 overflow-hidden rounded-xl border border-white/10 bg-white/5">
          <div className="p-4">
            <div className="mb-2 flex items-center gap-2.5">
              <Logo variant="icon-only" size="sm" />
              <span className="text-xs font-bold text-white">
                Sustainable Water Future
              </span>
            </div>

            <p className="text-[10px] leading-4 text-slate-400">
              AI-powered watershed monitoring for evidence-based
              decision making.
            </p>
          </div>

          <div className="h-1 bg-gradient-to-r from-[#0878d1] to-[#0ca39b]" />
        </div>
      </aside>
    </>
  );
} 