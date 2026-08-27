import { useState, type ReactNode } from "react";
import Navbar from "../navbar";
import Sidebar from "../sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F8FB] text-[#102a43]">
      {/* Reusable Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-col lg:ml-[270px]">
        {/* Reusable Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
