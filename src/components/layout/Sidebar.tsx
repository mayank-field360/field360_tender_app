import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import {
  LayoutDashboard,
  FileText,
  Bell,
  User,
  LogOut,
  Hammer,
  Wrench,
  AlertCircle,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import LogoIcon from "@/components/ui/LogoIcon";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/tenders/material", icon: Hammer, label: "Material Tenders" },
    { to: "/tenders/service", icon: Wrench, label: "Service Tenders" },
    { to: "/notifications", icon: Bell, label: "Notifications", badge: unreadCount },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  function handleLogoutConfirm() {
    setShowLogoutModal(false);
    logout();
  }

  return (
    <>
      <div className={`sidebar-overlay ${open ? "open" : ""}`} onClick={onClose} />
      <aside className={`app-sidebar ${open ? "open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <LogoIcon size={40} />
          <div className="sidebar-logo-text">
            <span>Field360</span>
            <span>Tender Portal</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={`sidebar-link ${location.pathname === item.to ? "active" : ""}`}
              onClick={onClose}
            >
              <item.icon size={20} />
              {item.label}
              {item.badge ? <span className="badge">{item.badge > 9 ? "9+" : item.badge}</span> : null}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {user?.name || "Vendor User"}
              </div>
              <div className="sidebar-user-role">{user?.org_name ?? "Company"}</div>
            </div>
          </div>
          <button className="sidebar-link sidebar-link-danger" onClick={() => setShowLogoutModal(true)} style={{ marginTop: 4, color: "var(--danger)" }}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <Modal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Logout"
        maxWidth="400px"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleLogoutConfirm}>
              <LogOut size={16} /> Logout
            </button>
          </>
        }
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          <div className="alert-icon-container">
            <AlertCircle size={24} />
          </div>
          <div style={{ paddingTop: 4 }}>
            <p style={{ margin: 0, fontSize: 15, color: "var(--text-primary)", fontWeight: 500 }}>
              Are you sure you want to log out?
            </p>
            <p style={{ margin: "4px 0 0 0", fontSize: 13 }}>
              You will need to sign in again to access the tender portal.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
