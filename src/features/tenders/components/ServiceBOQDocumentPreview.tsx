import { useRef } from "react";
import { FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Tender } from "@/types";

interface ServiceBOQDocumentPreviewProps {
  tender: Tender;
  printRef?: React.Ref<HTMLDivElement>;
}

export default function ServiceBOQDocumentPreview({ tender }: ServiceBOQDocumentPreviewProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const documentRef = localRef;

  const sections = tender.document_sections || [];
  const items = tender.items || [];

  const parseDate = (d: string | undefined | null) => d ? formatDate(d) : "-";

  return (
    <div className="service-boq-preview-root">
      <style>{`

        .doc-preview-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          margin-top: 32px;
          margin-bottom: 40px;
        }
        @media (min-width: 1024px) {
          .doc-preview-container {
            grid-template-columns: 1fr 3fr;
          }
        }
        .doc-sidebar {
          background: var(--bg-card, #f8fafc);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 12px;
          padding: 16px;
          height: fit-content;
        }
        [data-theme="dark"] .doc-sidebar {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05);
        }
        [data-theme="dark"] .doc-sidebar-title {
          color: #e2e8f0;
        }
        .doc-sidebar-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .doc-sidebar-btn {
          width: 100%;
          text-align: left;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-muted);
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
        }
        .doc-sidebar-btn:hover {
          color: var(--text-primary);
          background: rgba(0,0,0,0.03);
          transform: translateX(2px);
        }
        [data-theme="dark"] .doc-sidebar-btn {
          color: #94a3b8;
        }
        [data-theme="dark"] .doc-sidebar-btn:hover {
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.04) 0%, transparent 100%);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-left: 3px solid var(--primary-color, rgba(255, 255, 255, 0.6));
          color: #fff;
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        .doc-preview-area {
          height: 700px;
          overflow-y: auto;
          background: rgba(0,0,0,0.02);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          border: 1px solid var(--border-color);
          scroll-behavior: smooth;
        }
        @media (min-width: 1024px) {
          .doc-preview-area { padding: 32px; }
        }
        [data-theme="dark"] .doc-preview-area {
          background: rgba(255,255,255,0.02);
        }
        .doc-page {
          background: #fff;
          border-radius: 12px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
          flex-shrink: 0;
          margin: 0 auto;
          width: 100%;
          max-width: 794px; /* A4 width roughly */
          min-height: 1123px; /* A4 height roughly */
          position: relative;
        }
        [data-theme="dark"] .doc-page {
          background: #fff; /* Paper is always white! */
          color: #0f172a;
        }
        .stemcon-logo {
          width: 100%;
          display: flex;
          justify-content: flex-end;
          margin-bottom: 12px;
        }
        .stemcon-text {
          font-size: 24px;
          font-weight: 900;
          color: #1B365D;
          letter-spacing: 0.05em;
          margin: 0;
        }
        .stemcon-dot { color: #facc15; }
        .stemcon-line {
          width: 100%;
          height: 2px;
          background: #facc15;
          margin-bottom: 48px;
          flex-shrink: 0;
        }
        .doc-page-footer {
          margin-top: auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .doc-page-footer-line {
          width: 100%;
          height: 1px;
          background: #e2e8f0;
          margin-bottom: 12px;
        }
        .doc-page-footer-text {
          text-align: center;
          font-size: 10px;
          color: #94a3b8;
          font-weight: 500;
          letter-spacing: 0.025em;
        }
        .cover-icon-wrap {
          height: 64px; width: 64px;
          background: #fef9c3;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 32px;
        }
        .cover-title {
          font-size: 36px;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 48px 0;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          text-align: center;
        }
        .cover-divider {
          width: 48px; height: 2px; background: #e2e8f0; margin-bottom: 64px;
        }
        .cover-subtitle {
          text-align: center; margin-bottom: 96px;
        }
        .cover-dates {
          width: 100%; max-width: 448px;
          display: flex; justify-content: space-between; align-items: center;
          padding: 0 40px; margin-top: auto; margin-bottom: 24px;
        }
        .index-title-wrap {
          text-align: center; margin-bottom: 48px;
        }
        .index-title {
          font-size: 20px; font-weight: 700; color: #0f172a; text-transform: uppercase;
          letter-spacing: 0.1em; display: inline-block; padding-bottom: 8px;
          border-bottom: 3px solid #facc15;
          margin: 0;
        }
        .index-item {
          display: flex; align-items: flex-start; gap: 16px; font-size: 14px;
          font-weight: 700; color: #0f172a; cursor: pointer; transition: color 0.2s;
        }
        .index-item:hover { color: #2563eb; }
        .prose-content {
          color: #334155; font-size: 14px; line-height: 1.75; width: 100%;
          word-break: break-word;
        }
        .prose-content p { margin-bottom: 1em; }
        .prose-content ul { list-style-type: disc; padding-left: 20px; margin-bottom: 1em; }
        .prose-content ol { list-style-type: decimal; padding-left: 20px; margin-bottom: 1em; }
        .prose-content table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
        .prose-content th, .prose-content td { border: 1px solid #cbd5e1; padding: 8px 16px; }
        .prose-content th { background: #f1f5f9; font-weight: 600; text-align: left; }
        
        .print-table {
          width: 100%; border-collapse: collapse; border-spacing: 0;
        }
        .print-global-header, .print-global-footer {
          display: none;
        }
        .doc-pages-container {
          display: flex; flex-direction: column; gap: 32px; width: 100%;
          zoom: 0.75;
        }

        @media print {
          @page {
            size: A4;
            margin: 0; /* Remove browser headers and footers */
          }
          
          .doc-preview-area {
            height: auto !important;
            overflow: visible !important;
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            display: block !important;
          }
          
          
          /* Fixed containers for repeating header/footer */
          .print-fixed-header {
             display: block !important;
             position: fixed;
             top: 0; left: 0; right: 0;
             padding: 5mm 10mm 0 10mm !important;
             background: white;
             z-index: 1000;
          }
          .print-fixed-footer {
             display: block !important;
             position: fixed;
             bottom: 0; left: 0; right: 0;
             padding: 0 10mm 5mm 10mm !important;
             background: white;
             z-index: 1000;
          }

          .print-table { display: table !important; width: 100%; }
          .print-spacer-header { display: table-header-group !important; height: 25mm; }
          .print-spacer-footer { display: table-footer-group !important; height: 15mm; }

          .doc-pages-container {
            display: block !important;
            gap: 0 !important;
            zoom: 1 !important;
          }

          /* Hide local headers/footers in print, since global ones take over */
          .doc-page > .stemcon-logo,
          .doc-page > .stemcon-line,
          .doc-page > .doc-page-footer {
            display: none !important;
          }
          
          .doc-page {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 10mm !important; /* Content padding */
            page-break-after: always;
            break-after: page;
            max-width: 100% !important;
            min-height: auto !important;
            display: flex !important;
            flex-direction: column;
          }
          
          .doc-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }

          .section-content-page {
             display: block !important;
          }
          
          .cover-content-wrap {
            min-height: 60vh; /* Vertically center on printed cover page */
            display: flex !important;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
          }
          
          .cover-dates {
            margin: 20px auto !important;
          }
          
          body, [data-theme="dark"] body, .doc-page, [data-theme="dark"] .doc-page {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
          }
          
          .index-item, .prose-content p, .prose-content tr {
             page-break-inside: avoid;
             break-inside: avoid;
          }
          
          .prose-content th {
             background-color: #f1f5f9 !important;
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="doc-preview-container">
        
        {/* Document Outline Sidebar */}
        <div className="doc-sidebar">
          <h3 className="doc-sidebar-title">
            <FileText size={16} style={{ color: "var(--primary-color)" }} />
            Document Outline
          </h3>
          <div>
            <button
              type="button"
              className="doc-sidebar-btn"
              onClick={() => {
                const el = document.getElementById("section-cover");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Cover Page
            </button>
            
            {sections.length > 0 && (
              <button
                type="button"
                className="doc-sidebar-btn"
                onClick={() => {
                  const el = document.getElementById("section-index");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Document Index
              </button>
            )}

            <div style={{ margin: "8px 0", borderTop: "1px solid var(--border-color)", opacity: 0.5 }}></div>

            {sections.map((sec: any, idx: number) => (
              <button
                type="button"
                key={idx}
                className="doc-sidebar-btn"
                onClick={() => {
                  const el = document.getElementById(`doc-section-${idx}`);
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {idx + 1}. {sec.title}
              </button>
            ))}
            {sections.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic", padding: "0 12px" }}>
                No sections available
              </p>
            )}
          </div>
        </div>
        
        {/* Document Preview Area */}
        <div className="doc-preview-area">
          <div ref={documentRef} className="print-container" style={{ width: "100%" }}>
            
            {/* Global Print Header (Fixed) */}
            <div className="print-fixed-header" style={{ display: "none" }}>
              <div className="stemcon-logo">
                 <h2 className="stemcon-text">STEMCON<span className="stemcon-dot">.</span></h2>
              </div>
              <div className="stemcon-line"></div>
            </div>

            {/* Global Print Footer (Fixed) */}
            <div className="print-fixed-footer" style={{ display: "none" }}>
              <div className="doc-page-footer" style={{ marginTop: 0 }}>
                <div className="doc-page-footer-line"></div>
                <div className="doc-page-footer-text">
                  Reg. Office : 312 - Pride Square, Opp. Alan avenue, University Road, Rajkot - 360005
                </div>
              </div>
            </div>

            <table className="print-table">
              {/* Spacer Header so content doesn't overlap fixed header */}
              <thead className="print-spacer-header" style={{ display: "none" }}>
                <tr><td><div style={{ height: "25mm" }}></div></td></tr>
              </thead>

            <tbody>
              <tr>
                <td>
                  <div className="doc-pages-container">
                    
                    {/* Cover Page */}
            <div id="section-cover" className="doc-page">
              <div className="stemcon-logo">
                 <h2 className="stemcon-text">STEMCON<span className="stemcon-dot">.</span></h2>
              </div>
              <div className="stemcon-line"></div>
              
              <div className="cover-content-wrap" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%" }}>
                <div className="cover-icon-wrap">
                   <FileText size={32} color="#eab308" />
                </div>

                <h1 className="cover-title">
                  {tender.title}
                </h1>

                <div className="cover-divider"></div>

                <div className="cover-subtitle">
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, margin: 0 }}>
                    Prepared for project
                  </p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                    {tender.project_name || "N/A"}
                  </p>
                </div>
              </div>

              <div className="cover-dates">
                <div style={{ textAlign: "center" }}>
                   <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, margin: 0 }}>Start Date</p>
                   <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                     {parseDate(tender.start_date)}
                   </p>
                </div>
                <div style={{ textAlign: "center" }}>
                   <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, margin: 0 }}>End Date</p>
                   <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                     {parseDate(tender.end_date)}
                   </p>
                </div>
              </div>

              {/* Page Footer */}
              <div className="doc-page-footer">
                <div className="doc-page-footer-line"></div>
                <div className="doc-page-footer-text">
                  Reg. Office : 312 - Pride Square, Opp. Alan avenue, University Road, Rajkot - 360005
                </div>
              </div>
            </div>

            {/* Index Page */}
            {sections.length > 0 && (
              <div id="section-index" className="doc-page">
                <div className="stemcon-logo">
                   <h2 className="stemcon-text">STEMCON<span className="stemcon-dot">.</span></h2>
                </div>
                <div className="stemcon-line"></div>

                <div style={{ display: "flex", flexDirection: "column", width: "100%", padding: "0 32px", flex: 1 }}>
                  <div className="index-title-wrap">
                    <h2 className="index-title">INDEX</h2>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
                    {sections.map((sec: any, idx: number) => (
                      <div key={idx} style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                        <div 
                          className="index-item"
                          onClick={() => document.getElementById(`doc-section-${idx}`)?.scrollIntoView({ behavior: 'smooth' })}
                        >
                          <span style={{ width: 24, textAlign: "right", flexShrink: 0 }}>{idx + 1}.</span>
                          <span style={{ textTransform: "uppercase", letterSpacing: "0.025em" }}>{sec.title}</span>
                        </div>
                        
                        {/* Sub points if they exist */}
                        {sec.sub_points && sec.sub_points.length > 0 && (
                          <div style={{ marginLeft: 40, marginTop: 12, display: "flex", flexDirection: "column", gap: 12, fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                            {sec.sub_points.map((sub: any, sIdx: number) => (
                              <div 
                                key={sIdx} 
                                style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", transition: "color 0.2s" }}
                                onClick={() => document.getElementById(`doc-section-${idx}-${sIdx}`)?.scrollIntoView({ behavior: 'smooth' })}
                                onMouseEnter={(e) => e.currentTarget.style.color = "#3b82f6"}
                                onMouseLeave={(e) => e.currentTarget.style.color = "#64748b"}
                              >
                                <span style={{ width: 24, textAlign: "right", flexShrink: 0 }}>{idx + 1}.{sIdx + 1}</span>
                                <span style={{ textTransform: "uppercase" }}>{sub.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Page Footer */}
                <div className="doc-page-footer">
                  <div className="doc-page-footer-line"></div>
                  <div className="doc-page-footer-text">
                    Reg. Office : 312 - Pride Square, Opp. Alan avenue, University Road, Rajkot - 360005
                  </div>
                </div>
              </div>
            )}

            {/* Sections / Pages */}
            {sections.map((sec: any, idx: number) => (
              <div 
                key={idx} 
                id={`doc-section-${idx}`}
                className="doc-page section-content-page"
              >
                {/* Page Header */}
                <div className="stemcon-logo">
                   <h2 className="stemcon-text">STEMCON<span className="stemcon-dot">.</span></h2>
                </div>
                <div className="stemcon-line"></div>

                <div style={{ display: "flex", flexDirection: "column", width: "100%", padding: "0 32px", flex: 1 }}>
                  <div className="index-title-wrap">
                    <h2 className="index-title" style={{ paddingBottom: 8 }}>
                      {sec.title}
                    </h2>
                  </div>

                  {sec.content && sec.content.replace(/<[^>]*>?/gm, '').trim() !== '-' && sec.content.replace(/<[^>]*>?/gm, '').trim() !== '' && (
                    <div 
                      className="prose-content"
                      dangerouslySetInnerHTML={{ __html: sec.content }}
                    />
                  )}
                  
                  {sec.sub_points && sec.sub_points.length > 0 && (
                    <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
                      {sec.sub_points.map((sub: any, sIdx: number) => (
                        <div key={sIdx} id={`doc-section-${idx}-${sIdx}`} style={{ width: "100%", scrollMarginTop: 24 }}>
                          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{idx + 1}.{sIdx + 1} {sub.title}</h3>
                          {sub.content && sub.content.replace(/<[^>]*>?/gm, '').trim() !== '-' && sub.content.replace(/<[^>]*>?/gm, '').trim() !== '' && (
                            <div 
                              className="prose-content"
                              dangerouslySetInnerHTML={{ __html: sub.content }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Page Footer */}
                <div className="doc-page-footer">
                  <div className="doc-page-footer-line"></div>
                  <div className="doc-page-footer-text">
                    Reg. Office : 312 - Pride Square, Opp. Alan avenue, University Road, Rajkot - 360005
                  </div>
                </div>
              </div>
            ))}
                  </div>
                </td>
              </tr>
            </tbody>

            {/* Spacer Footer so content doesn't overlap fixed footer */}
            <tfoot className="print-spacer-footer" style={{ display: "none" }}>
              <tr><td><div style={{ height: "15mm" }}></div></td></tr>
            </tfoot>
            
          </table>
        </div>
      </div>
    </div>
    </div>
  );
}
