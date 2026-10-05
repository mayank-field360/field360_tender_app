import { useNotifications } from "@/hooks/useNotifications";
import EmptyState from "@/components/ui/EmptyState";
import { motion } from "framer-motion";
import { Bell, BellRing, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import type { Notification } from "@/types";

function getNotifIcon(type: string) {
  switch (type) {
    case "bid": return <FileText size={18} />;
    case "alert": return <AlertCircle size={18} />;
    case "success": return <CheckCircle2 size={18} />;
    default: return <BellRing size={18} />;
  }
}

export default function NotificationsPage() {
  const { notifications, isLoading, mutate } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      // Optimistic UI update: instantly mark as read locally
      mutate((currentData) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          results: currentData.results.map((n) =>
            n.id === notif.id ? { ...n, read: true } : n
          ),
        };
      }, false);

      try {
        await api.put(`/user/notification/${notif.id}/read/`);
        mutate(); // Re-fetch to ensure sync with server
      } catch (error: any) {
        console.error("Failed to mark notification as read", error);
        mutate(); // Revert back if it fails
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Bell size={24} color="var(--primary-500)" />
          <div>
            <h1 className="page-title">Notifications</h1>
            <p className="page-subtitle">Stay updated with your tender activity</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: 20 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: "16px 0" }}>
                <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "50%" }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-line-md" style={{ marginBottom: 8 }} />
                  <div className="skeleton skeleton-line-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Bell size={36} />}
            title="No notifications"
            description="You're all caught up. Notifications about your tenders will appear here."
          />
        ) : (
          notifications.map((notif, idx) => (
            <motion.div
              key={notif.id}
              className={`notif-item ${!notif.read ? "unread" : ""}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
              onClick={() => handleNotificationClick(notif)}
              style={{ cursor: "pointer" }}
            >
              <div className="notif-icon">
                {notif.image_url || notif.profile_image_url ? (
                  <img 
                    src={notif.image_url || notif.profile_image_url} 
                    alt="Icon" 
                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} 
                  />
                ) : (
                  getNotifIcon(notif.type || "")
                )}
              </div>
              <div className="notif-content">
                <div className="notif-title">{notif.title}</div>
                <div className="notif-message">{notif.body}</div>
                <div className="notif-time">{timeAgo(notif.created_at)}</div>
              </div>
              {!notif.read && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--primary-500)",
                    flexShrink: 0,
                    alignSelf: "center",
                  }}
                />
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
