import { useState, useEffect, type FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import fetcher from "@/api/fetcher";
import Spinner from "@/components/ui/Spinner";
import type { Tender } from "@/types";
import { submitBid } from "@/hooks/useTenders";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { Calendar, Clock, MapPin, Download, FileText, ChevronLeft } from "lucide-react";
import api from "@/api/axios";
import ServiceBOQDocumentPreview from "./components/ServiceBOQDocumentPreview";

interface ItemRate {
  boq_item_id: string;
  rate: string;
  remarks: string;
}

export default function TenderDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const tender = location.state?.tender as Tender | undefined;

  if (!tender) {
    // If accessed directly without state, redirect back to home
    navigate("/", { replace: true });
    return null;
  }

  const baseUrl = api.defaults.baseURL || "http://127.0.0.1:8000";
  const origin = new URL(baseUrl).origin;
  const { data: boqData, isLoading: boqLoading } = useSWR<any>(
    tender?.boq_id ? `${origin}/api/v2/inventory/boqs/${tender.boq_id}/` : null,
    fetcher
  );

  // Trigger the bid retrieve API to mark it as viewed and send notification
  useSWR<any>(
    id ? `/inventory/boq-bids/${id}/` : null,
    fetcher
  );

  const activeItems = boqData?.items || tender.items || [];
  const activeSections = boqData?.document_sections || tender.document_sections || [];

  const [submitting, setSubmitting] = useState(false);
  const [overallRemarks, setOverallRemarks] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [itemRates, setItemRates] = useState<ItemRate[]>([]);

  useEffect(() => {
    if (activeItems.length > 0 && itemRates.length === 0) {
      setItemRates(
        activeItems.map((item: any) => ({
          boq_item_id: item.boq_item || item.id,
          rate: item.rate?.toString() ?? "",
          remarks: item.remarks ?? "",
        }))
      );
    }
  }, [activeItems, itemRates.length]);

  function updateItem(idx: number, field: keyof ItemRate, value: string) {
    setItemRates((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  }

  function calcTotal(): number {
    return itemRates.reduce((sum, item, idx) => {
      const boqItem = activeItems[idx];
      const qty = boqItem?.qty || boqItem?.quantity || 0;
      const rate = parseFloat(item.rate) || 0;
      return sum + qty * rate;
    }, 0);
  }

  const [downloadingPdf, setDownloadingPdf] = useState(false);

  async function handleDownloadPdf() {
    if (!tender) return;
    setDownloadingPdf(true);
    try {
      // Determine the base URL origin to correctly point to v2 API
      const baseUrl = api.defaults.baseURL || "http://127.0.0.1:8000";
      const origin = new URL(baseUrl).origin;
      const downloadUrl = `${origin}/api/v2/inventory/boqs/${tender.boq_id}/download/`;

      const response = await api.get(downloadUrl, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers["content-disposition"];
      let filename = `${tender.title.replace(/\\s+/g, "_")}_BOQ_Document.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to download PDF");
    } finally {
      setDownloadingPdf(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!tender) return;

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
      navigate(-1); // Go back
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.detail || "Failed to submit bid");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Breadcrumb & Header */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-ghost" 
          style={{ padding: 8, height: "auto" }}
        >
          <ChevronLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>
            Dashboard / Tenders / {tender.type}
          </div>
          <h1 className="page-title" style={{ margin: 0 }}>
            {tender.title}
          </h1>
        </div>
        
        {/* Download PDF button next to title */}
        {tender.type === "SERVICE" && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            style={{ flexShrink: 0 }}
          >
            {downloadingPdf ? (
              <><Spinner size={16} /> Downloading...</>
            ) : (
              <><FileText size={16} style={{ marginRight: 6 }} /> Download PDF</>
            )}
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, paddingRight: 24 }}>
            <h4 style={{ margin: "0 0 8px 0", color: "var(--text-primary)", fontSize: 16 }}>
              Project: {tender.project_name || "N/A"}
            </h4>
            <p style={{ margin: "0 0 12px 0", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {tender.description || "No description provided for this tender."}
            </p>
          </div>
        </div>
        
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px 24px", fontSize: 13, color: "var(--text-muted)", marginTop: 12, padding: "16px 20px", background: "var(--gray-50)", borderRadius: "var(--radius-md)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Calendar size={15} />
            <span>Start: <strong style={{ color: "var(--text-primary)" }}>{formatDate(tender.start_date)}</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Clock size={15} />
            <span>End: <strong style={{ color: "var(--text-primary)" }}>{formatDate(tender.end_date)}</strong></span>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: 16 }}>Bid Details</h3>
        <form onSubmit={handleSubmit}>
          {/* BOQ Items table */}
          <div style={{ overflowX: "auto", marginBottom: 20 }}>
            <table className="boq-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th style={{ width: 60, textAlign: "center" }}>Image</th>
                  <th>Item</th>
                  <th>Unit</th>
                  <th>Qty</th>
                  <th>Rate (₹)</th>
                  <th>Amount</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {activeItems?.length > 0 ? (
                  activeItems.map((item: any, idx: number) => {
                    const rate = parseFloat(itemRates[idx]?.rate) || 0;
                    const qty = item.qty || item.quantity || 0;
                    const amount = qty * rate;
                    return (
                      <tr key={item.id}>
                        <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>{idx + 1}</td>
                        <td style={{ textAlign: "center" }}>
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.item_name || item.name || "Item Image"}
                              style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4, cursor: "pointer", border: "1px solid var(--border-color)" }}
                              onClick={() => setPreviewImage(item.image_url!)}
                            />
                          ) : (
                            <div style={{ width: 40, height: 40, borderRadius: 4, background: "var(--gray-50)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--text-muted)", margin: "0 auto" }}>
                              N/A
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{item.item_name || item.name || item.title}</div>
                          {item.description && (
                            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: 13 }}>{item.unit || item.uom}</td>
                        <td style={{ fontWeight: 600 }}>{item.qty || item.quantity}</td>
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
                    <td colSpan={8} style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-muted)" }}>
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

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32 }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <><Spinner size={16} /> Submitting...</> : "Submit Bid"}
            </button>
          </div>
        </form>
      </div>

      {tender.type === "SERVICE" && <ServiceBOQDocumentPreview tender={{...tender, document_sections: activeSections, items: activeItems}} />}

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setPreviewImage(null)}
        >
          <img 
            src={previewImage} 
            alt="Preview" 
            style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 8, boxShadow: "0 10px 25px rgba(0,0,0,0.5)", objectFit: "contain" }} 
            onClick={(e) => e.stopPropagation()} 
          />
          <button 
            type="button"
            style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.2)", color: "white", border: "none", borderRadius: "50%", width: 40, height: 40, cursor: "pointer", fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => setPreviewImage(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
