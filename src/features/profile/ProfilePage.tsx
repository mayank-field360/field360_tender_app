import { useState, type FormEvent } from "react";
import { useProfile } from "@/hooks/useProfile";
import api from "@/api/axios";
import Spinner from "@/components/ui/Spinner";
import { motion } from "framer-motion";
import { User, Mail, Phone, Building2, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { profile, isLoading, mutate } = useProfile();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  function startEdit() {
    if (profile) {
      setForm({
        name: profile.name ?? "",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
      });
    }
    setEditing(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/user/profile/", { ...profile, ...form });
      toast.success("Profile updated successfully");
      mutate();
      setEditing(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  const initials = profile?.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Spinner size={32} dark />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <User size={24} color="var(--primary-500)" />
          <div>
            <h1 className="page-title">My Profile</h1>
            <p className="page-subtitle">Manage your account information</p>
          </div>
        </div>
      </div>

      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Profile Header */}
        <div className="profile-header" style={{ borderBottom: "1px solid var(--border-color)" }}>
          <div className="profile-avatar">{initials}</div>
          <div className="profile-info">
            <h2>{profile?.name}</h2>
            <p>{profile?.org_name}</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              {profile?.designation ?? "Vendor"}
            </p>
          </div>
          {!editing && (
            <button className="btn btn-outline" onClick={startEdit} style={{ marginLeft: "auto" }}>
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Form */}
        <div className="card-body">
          {editing ? (
            <form onSubmit={handleSave}>
              <div className="profile-form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="prof-name">
                    <User size={13} style={{ display: "inline", marginRight: 6 }} />
                    Full Name
                  </label>
                  <input
                    id="prof-name"
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prof-email">
                    <Mail size={13} style={{ display: "inline", marginRight: 6 }} />
                    Email
                  </label>
                  <input
                    id="prof-email"
                    className="form-input"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prof-phone">
                    <Phone size={13} style={{ display: "inline", marginRight: 6 }} />
                    Phone
                  </label>
                  <input
                    id="prof-phone"
                    className="form-input"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
              </div>

              {/* Read-only fields */}
              <div className="profile-form-grid" style={{ marginTop: 20 }}>
                <div className="form-group">
                  <label className="form-label">
                    <Building2 size={13} style={{ display: "inline", marginRight: 6 }} />
                    Company
                  </label>
                  <input
                    className="form-input"
                    value={profile?.org_name ?? ""}
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <input
                    className="form-input"
                    value={profile?.designation ?? ""}
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><Spinner size={16} /> Saving...</> : <><Save size={16} /> Save Changes</>}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-form-grid">
              {[
                { icon: <User size={14} />, label: "Full Name", value: profile?.name },
                { icon: <Mail size={14} />, label: "Email", value: profile?.email },
                { icon: <Phone size={14} />, label: "Phone", value: profile?.phone },
                { icon: <Building2 size={14} />, label: "Company", value: profile?.org_name },
                { icon: null, label: "Designation", value: profile?.designation ?? "Vendor" },
              ].map((item) => (
                <div key={item.label} className="form-group">
                  <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {item.icon}
                    {item.label}
                  </label>
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "var(--gray-50)",
                      borderRadius: "var(--radius-md)",
                      fontSize: 14,
                      color: "var(--text-primary)",
                      fontWeight: 500,
                    }}
                  >
                    {item.value || "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
