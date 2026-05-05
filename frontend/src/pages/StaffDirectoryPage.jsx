import { useEffect, useState } from "react";
import { getAllStaffApi, saveStaffProfileApi, getMyStaffProfileApi } from "../api/staffApi";
import { getAllOfficeHoursApi } from "../api/officeHourApi";
import { useAuth } from "../context/AuthContext";

export default function StaffDirectoryPage() {
  const { token, user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [officeHours, setOfficeHours] = useState([]);
  const [selected, setSelected] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [form, setForm] = useState({ department: "", title: "", bio: "", phone: "", officeLocation: "", researchInterests: "", profileImage: "" });

  const notify = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text: "", ok: true }), 4000); };

  const load = async () => {
    try {
      const [s, oh] = await Promise.all([getAllStaffApi(token), getAllOfficeHoursApi(token)]);
      setStaff(s); setOfficeHours(oh);
      if (["professor","ta","admin"].includes(user?.role)) {
        const mp = await getMyStaffProfileApi(token);
        setMyProfile(mp);
        if (mp?._id) setForm({ department: mp.department || "", title: mp.title || "", bio: mp.bio || "", phone: mp.phone || "", officeLocation: mp.officeLocation || "", researchInterests: (mp.researchInterests || []).join(", "), profileImage: mp.profileImage || "" });
      }
    } catch { notify("Failed to load", false); }
  };

  useEffect(() => { load(); }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await saveStaffProfileApi({ ...form, researchInterests: form.researchInterests.split(",").map(s => s.trim()).filter(Boolean) }, token);
      notify("Profile saved!");
      setEditMode(false);
      load();
    } catch { notify("Failed", false); }
  };

  const filtered = staff.filter(s =>
    s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase()) ||
    s.title?.toLowerCase().includes(search.toLowerCase())
  );

  const staffOfficeHours = (userId) => officeHours.filter(oh => String(oh.staff?._id || oh.staff) === String(userId));

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>👥 Staff Directory</h1>
          <p style={styles.sub}>Find professors, TAs, and staff members</p>
        </div>
        {["professor","ta","admin"].includes(user?.role) && (
          <button onClick={() => setEditMode(!editMode)} style={styles.btn}>{editMode ? "✕ Cancel" : "✏️ Edit My Profile"}</button>
        )}
      </div>

      {msg.text && <div style={{ ...styles.toast, background: msg.ok ? "#dcfce7" : "#fee2e2", color: msg.ok ? "#166534" : "#dc2626" }}>{msg.text}</div>}

      {editMode && (
        <div style={styles.card}>
          <h2>My Staff Profile</h2>
          <form onSubmit={handleSaveProfile}>
            <div style={styles.grid3}>
              {[["Job Title", "title"], ["Department", "department"], ["Phone", "phone"], ["Office Location", "officeLocation"], ["Profile Image URL", "profileImage"]].map(([lbl, key]) => (
                <div key={key}><label style={styles.label}>{lbl}</label><input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={styles.input} /></div>
              ))}
            </div>
            <label style={styles.label}>Bio</label>
            <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} style={{ ...styles.input, minHeight: 80 }} />
            <label style={styles.label}>Research Interests (comma-separated)</label>
            <input value={form.researchInterests} onChange={e => setForm({ ...form, researchInterests: e.target.value })} style={styles.input} />
            <button type="submit" style={styles.btn}>Save Profile</button>
          </form>
        </div>
      )}

      <input placeholder="Search by name, department, title..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...styles.input, maxWidth: 400, marginBottom: 20 }} />

      <div style={styles.grid}>
        {filtered.map(s => {
          const oh = staffOfficeHours(s.user?._id);
          return (
            <div key={s._id} style={{ ...styles.profileCard, ...(selected === s._id ? styles.profileCardActive : {}) }} onClick={() => setSelected(selected === s._id ? null : s._id)}>
              <div style={styles.avatar}>
                {s.profileImage ? <img src={s.profileImage} alt={s.user?.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                  : <span style={{ fontSize: 28 }}>{s.user?.name?.[0] || "?"}</span>}
              </div>
              <h3 style={{ margin: "8px 0 2px", fontSize: 16 }}>{s.user?.name}</h3>
              <p style={{ color: "#2563eb", fontSize: 13, fontWeight: 600, margin: "0 0 4px" }}>{s.title || s.user?.role}</p>
              <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>{s.department || "—"}</p>
              {selected === s._id && (
                <div style={styles.expanded}>
                  {s.bio && <p style={{ fontSize: 14, color: "#374151", marginBottom: 10 }}>{s.bio}</p>}
                  <div style={{ fontSize: 13, color: "#6b7280", display: "flex", flexDirection: "column", gap: 4 }}>
                    {s.phone && <span>📞 {s.phone}</span>}
                    {s.officeLocation && <span>📍 {s.officeLocation}</span>}
                    <span>✉️ {s.user?.email}</span>
                  </div>
                  {s.researchInterests?.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4 }}>Research Interests</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {s.researchInterests.map(ri => <span key={ri} style={styles.tag}>{ri}</span>)}
                      </div>
                    </div>
                  )}
                  {oh.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4 }}>Office Hours</p>
                      {oh.map(h => (
                        <div key={h._id} style={{ fontSize: 13, color: "#374151" }}>
                          📅 {h.dayOfWeek} · {h.startTime}–{h.endTime} {h.isVirtual ? "(Virtual)" : h.location}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <p style={{ color: "#6b7280" }}>No staff profiles found.</p>}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 40, background: "#f9fafb", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 800, margin: 0 },
  sub: { color: "#6b7280", marginTop: 4 },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24, marginBottom: 24 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 12 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontFamily: "inherit", fontSize: 14, boxSizing: "border-box", marginBottom: 10 },
  btn: { padding: "10px 20px", background: "#111827", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 },
  toast: { padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontWeight: 600 },
  profileCard: { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 20, textAlign: "center", cursor: "pointer", transition: "box-shadow 0.2s" },
  profileCardActive: { border: "2px solid #2563eb", boxShadow: "0 4px 16px rgba(37,99,235,0.12)" },
  avatar: { width: 72, height: 72, background: "#dbeafe", borderRadius: "50%", margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#1d4ed8", overflow: "hidden" },
  expanded: { marginTop: 14, textAlign: "left", borderTop: "1px solid #f3f4f6", paddingTop: 12 },
  tag: { background: "#eff6ff", color: "#2563eb", borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 500 },
};