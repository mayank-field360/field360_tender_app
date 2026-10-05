import { useState, type FormEvent } from "react";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import type { Tender } from "@/types";
import { submitBid } from "@/hooks/useTenders";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { Calendar, Clock, MapPin, Download, FileText } from "lucide-react";
import api from "@/api/axios";

interface BidModalProps {
  open: boolean;
  onClose: () => void;
  tender: Tender;
  onSuccess: () => void;
}

interface ItemRate {
  boq_item_id: string;
  rate: string;
  remarks: string;
}

export default function BidModal({ open, onClose, tender, onSuccess }: BidModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [overallRemarks, setOverallRemarks] = useState("");
  const [itemRates, setItemRates] = useState<ItemRate[]>(
    () => tender.items?.map((item) => ({
      boq_item_id: (item as any).boq_item || item.id,
      rate: item.rate?.toString() ?? "",
      remarks: item.remarks ?? "",
    })) ?? []
  );

  function updateItem(idx: number, field: keyof ItemRate, value: string) {
    setItemRates((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  }

  function calcTotal(): number {
    return itemRates.reduce((sum, item, idx) => {
      const qty = tender.items?.[idx]?.quantity ?? 0;
      const rate = parseFloat(item.rate) || 0;
      return sum + qty * rate;
    }, 0);
  }

  async function handleDownloadPdf() {
    if (!tender.boq_pdf_url) {
      toast.error("No PDF available for this tender");
      return;
    }
    try {
      const response = await api.get(tender.boq_pdf_url, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${tender.title.replace(/\s+/g, "_")}_BOQ.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch {
      toast.error("Failed to download PDF");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const emptyRates = itemRates.filter((ir) => !ir.rate || parseFloat(ir.rate) <= 0);
    if (emptyRates.length > 0) {
      toast.error("Please enter a valid rate for all items");
      return;
    }

    setSubmitting(true);
    try {
      await submitBid(tender.id, {
        items: itemRates.map((ir) => ({
          boq_item_id: ir.boq_item_id,
          rate: parseFloat(ir.rate),
          ...(ir.remarks ? { remarks: ir.remarks } : {}),
        })),
        ...(overallRemarks ? { remarks: overallRemarks } : {}),
      });
      toast.success("Bid submitted successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.detail || "Failed to submit bid");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${tender.status === "SUBMITTED" ? "Update" : "Submit"} Bid — ${tender.title}`}
      maxWidth="800px"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit as any} disabled={submitting}>
            {submitting ? <><Spinner size={16} /> Submitting...</> : "Submit Bid"}
          </button>
        </>
      }
    >
      <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid var(--border-color)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, paddingRight: 24 }}>
            <h4 style={{ margin: "0 0 8px 0", color: "var(--text-primary)", fontSize: 16 }}>
              Project: {tender.project_name || "N/A"}
            </h4>
            <p style={{ margin: "0 0 12px 0", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {tender.description || "No description provided for this tender."}
            </p>
          </div>
          {tender.type === "SERVICE" && tender.boq_pdf_url && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleDownloadPdf}
              style={{ flexShrink: 0 }}
            >
              <FileText size={16} style={{ marginRight: 6 }} />
              Download BOQ
            </button>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px 24px", fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Calendar size={15} />
            <span>Start: <strong style={{ color: "var(--text-primary)" }}>{formatDate(tender.start_date)}</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Clock size={15} />
            <span>End: <strong style={{ color: "var(--text-primary)" }}>{formatDate(tender.end_date)}</strong></span>
          </div>
          {tender.total_amount != null && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin size={15} />
              <span>Budget: <strong style={{ color: "var(--text-primary)" }}>{formatCurrency(tender.total_amount)}</strong></span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* BOQ Items table */}
        <div style={{ overflowX: "auto", marginBottom: 20 }}>
          <table className="boq-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Unit</th>
                <th>Qty</th>
                <th>Rate (₹)</th>
                <th>Amount</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {tender.items?.length > 0 ? (
                tender.items.map((item, idx) => {
                  const rate = parseFloat(itemRates[idx]?.rate) || 0;
                  const amount = item.quantity * rate;
                  return (
                    <tr key={item.id}>
                      <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>{idx + 1}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{item.name}</div>
                        {item.description && (
                          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: 13 }}>{item.unit}</td>
                      <td style={{ fontWeight: 600 }}>{item.quantity}</td>
                      <td>
                        <input
                          className="rate-input"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={itemRates[idx]?.rate ?? ""}
                          onChange={(e) => updateItem(idx, "rate", e.target.value)}
                          required
                        />
                      </td>
                      <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                        {rate > 0 ? formatCurrency(amount) : "—"}
                      </td>
                      <td>
                        <input
                          className="rate-input"
                          type="text"
                          placeholder="Optional"
                          style={{ width: 120, textAlign: "left" }}
                          value={itemRates[idx]?.remarks ?? ""}
                          onChange={(e) => updateItem(idx, "remarks", e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-muted)" }}>
                    No line items available in this BOQ.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "12px 14px",
            background: "var(--gray-50)",
            borderRadius: "var(--radius-md)",
            marginBottom: 20,
            border: "1px solid var(--border-color)",
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
            Total Bid Amount: {formatCurrency(calcTotal())}
          </span>
        </div>

        {/* Overall Remarks */}
        <div className="form-group">
          <label className="form-label" htmlFor="bid-remarks">
            Overall Remarks
          </label>
          <textarea
            id="bid-remarks"
            className="form-input"
            placeholder="Add any overall remarks or terms for this bid..."
            value={overallRemarks}
            onChange={(e) => setOverallRemarks(e.target.value)}
            rows={3}
          />
        </div>
      </form>
    </Modal>
  );
}
