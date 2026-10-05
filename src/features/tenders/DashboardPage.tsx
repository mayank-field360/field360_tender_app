import { useTenders } from "@/hooks/useTenders";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Hammer,
  Wrench,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import SkeletonCard from "@/components/ui/SkeletonCard";
import TenderCard from "./TenderCard";

function StatCard({
  icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      className="card"
      style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "var(--radius-md)",
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{label}</div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tenders, isLoading, mutate } = useTenders();

  const pending = tenders.filter((t) => t.status === "PENDING");
  const submitted = tenders.filter((t) => t.status === "SUBMITTED");
  const accepted = tenders.filter((t) => t.status === "ACCEPTED");
  const materialCount = tenders.filter((t) => t.type === "MATERIAL").length;
  const serviceCount = tenders.filter((t) => t.type === "SERVICE").length;

  const recentPending = pending.slice(0, 4);

  return (
    <div>
      {/* Welcome */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="page-title">
          Welcome, {user?.name?.split(" ")[0] || "Vendor"} 👋
        </h1>
        <p className="page-subtitle">Here's an overview of your tender activity</p>
      </motion.div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <StatCard
          icon={<FileText size={22} color="white" />}
          label="Total Tenders"
          value={tenders.length}
          color="linear-gradient(135deg, var(--primary-500), var(--primary-700))"
          delay={0}
        />
        <StatCard
          icon={<Clock size={22} color="white" />}
          label="Pending Bids"
          value={pending.length}
          color="linear-gradient(135deg, #f59e0b, #d97706)"
          delay={0.05}
        />
        <StatCard
          icon={<TrendingUp size={22} color="white" />}
          label="Submitted"
          value={submitted.length}
          color="linear-gradient(135deg, #3b82f6, #2563eb)"
          delay={0.1}
        />
        <StatCard
          icon={<CheckCircle2 size={22} color="white" />}
          label="Accepted"
          value={accepted.length}
          color="linear-gradient(135deg, #10b981, #059669)"
          delay={0.15}
        />
      </div>

      {/* Quick Links */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <motion.button
          className="card card-hover"
          style={{
            padding: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "none",
            textAlign: "left",
            cursor: "pointer",
          }}
          onClick={() => navigate("/tenders/material")}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Hammer size={20} color="#7c3aed" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
                Material Tenders
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                {materialCount} assigned
              </div>
            </div>
          </div>
          <ArrowRight size={20} color="var(--text-muted)" />
        </motion.button>

        <motion.button
          className="card card-hover"
          style={{
            padding: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "none",
            textAlign: "left",
            cursor: "pointer",
          }}
          onClick={() => navigate("/tenders/service")}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, #fce7f3, #fbcfe8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Wrench size={20} color="#be185d" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
                Service Tenders
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                {serviceCount} assigned
              </div>
            </div>
          </div>
          <ArrowRight size={20} color="var(--text-muted)" />
        </motion.button>
      </div>

      {/* Recent Pending */}
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700 }}>Action Required</h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          These tenders are awaiting your bid
        </p>
      </div>

      {isLoading ? (
        <div className="tender-grid">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : recentPending.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <CheckCircle2 size={40} color="var(--success)" style={{ margin: "0 auto 12px" }} />
          <p style={{ fontWeight: 600, fontSize: 15 }}>All caught up!</p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            No pending tenders require your attention right now.
          </p>
        </div>
      ) : (
        <div className="tender-grid">
          {recentPending.map((t, idx) => (
            <TenderCard key={t.id} tender={t} index={idx} onMutate={() => mutate()} />
          ))}
        </div>
      )}
    </div>
  );
}
