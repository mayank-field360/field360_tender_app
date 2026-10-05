import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Edit3,
  XCircle,
  Hammer,
  Wrench,
  AlertTriangle,
} from "lucide-react";
import type { Tender } from "@/types";
import { formatDate, daysRemaining, isExpired, getStatusColor, formatCurrency } from "@/lib/utils";
import { withdrawBid } from "@/hooks/useTenders";
import toast from "react-hot-toast";
import api from "@/api/axios";

interface TenderCardProps {
  tender: Tender;
  index: number;
  onMutate: () => void;
}

export default function TenderCard({ tender, index, onMutate }: TenderCardProps) {
  const [withdrawing, setWithdrawing] = useState(false);
  const navigate = useNavigate();
  const expired = isExpired(tender.end_date);
  const days = daysRemaining(tender.end_date);
  const isService = tender.type === "SERVICE";

  async function handleWithdraw() {
    if (!confirm("Are you sure you want to withdraw this bid?")) return;
    setWithdrawing(true);
    try {
      await withdrawBid(tender.id);
      toast.success("Bid withdrawn successfully");
      onMutate();
    } catch {
      toast.error("Failed to withdraw bid");
    } finally {
      setWithdrawing(false);
    }
  }

  function getDeadlineClass(): string {
    if (expired) return "deadline-expired";
    if (days <= 3) return "deadline-urgent";
    return "deadline-normal";
  }

  return (
    <>
      <motion.div
        className="card card-hover tender-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        style={{ padding: 20, cursor: "pointer" }}
        onClick={() => navigate(`/tender/${tender.id}`, { state: { tender } })}
      >
        {/* Header */}
        <div className="tender-card-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span className={`type-badge ${isService ? "type-service" : "type-material"}`}>
                {isService ? <Wrench size={12} /> : <Hammer size={12} />}
                {tender.type}
              </span>
              <span className={`status-badge ${getStatusColor(tender.status)}`}>{tender.status}</span>
            </div>
            <h3 className="tender-title">{tender.title}</h3>
            {tender.project_name && <p className="tender-project">{tender.project_name}</p>}
          </div>
        </div>

        {/* Description */}
        {tender.description && (
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.6 }}>
            {tender.description.length > 150
              ? tender.description.slice(0, 150) + "..."
              : tender.description}
          </p>
        )}

        {/* Meta */}
        <div className="tender-meta">
          <div className="tender-meta-item">
            <Calendar size={15} />
            <span>{formatDate(tender.start_date)} – {formatDate(tender.end_date)}</span>
          </div>
          {tender.total_amount != null && (
            <div className="tender-meta-item">
              <MapPin size={15} />
              <span>{formatCurrency(tender.total_amount)}</span>
            </div>
          )}
          <div className="tender-meta-item">
            <span className="tender-meta-item" style={{ fontWeight: 600 }}>
              {tender.items?.length ?? 0} items
            </span>
          </div>
        </div>

        {/* Deadline pill */}
        <div style={{ marginBottom: 16 }}>
          <span className={`tender-deadline ${getDeadlineClass()}`}>
            {expired ? (
              <><AlertTriangle size={14} /> Deadline passed</>
            ) : days <= 3 ? (
              <><Clock size={14} /> {days} day{days !== 1 ? "s" : ""} left</>
            ) : (
              <><Clock size={14} /> {days} days remaining</>
            )}
          </span>
        </div>

        {/* Actions */}
        <div className="tender-actions">
          {!expired && (tender.status === "PENDING" || tender.status === "SUBMITTED") && (
            <button
              className="btn btn-primary btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/tender/${tender.id}`, { state: { tender } });
              }}
            >
              <Edit3 size={14} />
              {tender.status === "SUBMITTED" ? "Update Bid" : "Submit Bid"}
            </button>
          )}
          {tender.status === "SUBMITTED" && !expired && (
            <button
              className="btn btn-danger btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleWithdraw();
              }}
              disabled={withdrawing}
            >
              <XCircle size={14} />
              {withdrawing ? "Withdrawing..." : "Withdraw"}
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}
