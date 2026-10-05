import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTenders } from "@/hooks/useTenders";
import TenderCard from "./TenderCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import { FileText, Hammer, Wrench } from "lucide-react";
import type { BidStatus, TenderType } from "@/types";

const STATUS_TABS: { label: string; value: BidStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Withdrawn", value: "WITHDRAWN" },
];

export default function TendersPage() {
  const { type } = useParams<{ type: string }>();
  const tenderType: TenderType = type?.toUpperCase() === "SERVICE" ? "SERVICE" : "MATERIAL";
  const [statusFilter, setStatusFilter] = useState<BidStatus | "">("");

  const { tenders, isLoading, mutate } = useTenders(statusFilter || undefined);

  const filteredTenders = tenders.filter((t) => t.type === tenderType);

  const isService = tenderType === "SERVICE";

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isService ? <Wrench size={24} color="var(--primary-500)" /> : <Hammer size={24} color="var(--primary-500)" />}
          <div>
            <h1 className="page-title">{isService ? "Service" : "Material"} Tenders</h1>
            <p className="page-subtitle">
              {isService
                ? "View and bid on assigned service tenders"
                : "View and bid on assigned material tenders"}
            </p>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="filter-tabs">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            className={`filter-tab ${statusFilter === tab.value ? "active" : ""}`}
            onClick={() => setStatusFilter(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="tender-grid">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredTenders.length === 0 ? (
        <EmptyState
          icon={<FileText size={36} />}
          title="No tenders found"
          description={`No ${tenderType.toLowerCase()} tenders match your filter. Check back later for new assignments.`}
        />
      ) : (
        <div className="tender-grid">
          {filteredTenders.map((tender, idx) => (
            <TenderCard key={tender.id} tender={tender} index={idx} onMutate={() => mutate()} />
          ))}
        </div>
      )}
    </div>
  );
}
