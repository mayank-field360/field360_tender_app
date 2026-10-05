import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/tenders/material": "Material Tenders",
  "/tenders/service": "Service Tenders",
  "/notifications": "Notifications",
  "/profile": "Profile",
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitle = PAGE_TITLES[location.pathname] ?? "Field360 Tender";

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="app-main">
        <Topbar pageTitle={pageTitle} onMenuToggle={() => setSidebarOpen((v) => !v)} />
        <div className="app-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
