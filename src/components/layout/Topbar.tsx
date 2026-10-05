import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { useTheme } from "@/hooks/useTheme";
import { Bell, Menu, Moon, Sun } from "lucide-react";

interface TopbarProps {
  pageTitle: string;
  onMenuToggle: () => void;
}

export default function Topbar({ pageTitle, onMenuToggle }: TopbarProps) {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="menu-toggle" onClick={onMenuToggle} aria-label="Toggle menu">
          <Menu size={22} />
        </button>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>{pageTitle}</h1>
      </div>
      <div className="topbar-right" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          className="topbar-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button
          className="topbar-btn"
          onClick={() => navigate("/notifications")}
          aria-label="View notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && <span className="dot" />}
        </button>
      </div>
    </header>
  );
}
