export default function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="skeleton skeleton-line-md" style={{ height: 20 }} />
        <div className="skeleton" style={{ width: 80, height: 24, borderRadius: 9999 }} />
      </div>
      <div className="skeleton skeleton-line-lg" style={{ marginBottom: 10 }} />
      <div className="skeleton skeleton-line-md" style={{ marginBottom: 16 }} />
      <div style={{ display: "flex", gap: 12 }}>
        <div className="skeleton" style={{ width: 140, height: 14 }} />
        <div className="skeleton" style={{ width: 100, height: 14 }} />
      </div>
    </div>
  );
}
