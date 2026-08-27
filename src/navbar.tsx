import { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type NavbarProps = {
  onMenuClick?: () => void;
};

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [showProfile, setShowProfile] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    // Add logout API here later
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur-md sm:px-6">
      
      {/* Left */}
      <div className="flex items-center gap-4">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="hidden md:block">
          <h2 className="text-sm font-bold text-[#102a43]">
            Watershed Intelligence Command Center
          </h2>

          <p className="text-xs text-slate-500">
            Monitor • Verify • Measure • Act
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        
        {/* Search */}
        <button
          className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 transition hover:border-slate-300 hover:bg-white sm:flex"
        >
          <Search size={17} />

          <span>Search...</span>

          <kbd className="ml-4 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400">
            /
          </kbd>
        </button>

        {/* Notification */}
        <button
          className="relative rounded-lg p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-[#0878d1]"
          aria-label="Notifications"
        >
          <Bell size={20} />

          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            3
          </span>
        </button>

        {/* Divider */}
        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
          >
            {/* Avatar */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0878d1] to-[#0ca39b] text-sm font-bold text-white">
              A
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-bold text-[#102a43]">
                Admin User
              </p>

              <p className="text-[10px] text-slate-500">
                Administrator
              </p>
            </div>

            <ChevronDown
              size={16}
              className={`hidden text-slate-500 transition-transform sm:block ${
                showProfile ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Profile dropdown */}
          {showProfile && (
            <div className="absolute right-0 top-[54px] w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              
              {/* User information */}
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#0878d1] to-[#0ca39b] font-bold text-white">
                    A
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#102a43]">
                      Admin User
                    </p>

                    <p className="text-xs text-slate-500">
                      Administrator
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu */}
              <div className="p-2">
                <button
                  onClick={() => {
                    setShowProfile(false);
                    navigate("/profile");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0878d1]"
                >
                  <User size={17} />
                  My Profile
                </button>

                <button
                  onClick={() => {
                    setShowProfile(false);
                    navigate("/settings");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0878d1]"
                >
                  <Settings size={17} />
                  Account Settings
                </button>

                <div className="my-1 border-t border-slate-100" />

                <div className="flex items-center gap-3 px-3 py-2.5 text-xs text-emerald-600">
                  <ShieldCheck size={16} />
                  Secure government session
                </div>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-500 hover:bg-red-50"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 
