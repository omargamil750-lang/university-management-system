import { useEffect, useState } from "react";
import { getAnnouncementsApi, createAnnouncementApi, deleteAnnouncementApi } from "../api/uniAnnouncementApi";
import { useAuth } from "../context/AuthContext";

const PRIORITY_STYLE = {
  urgent: { bg: "#fee2e2", color: "#dc2626", badge: "🚨 Urgent" },
  normal: { bg: "#dbeafe", color: "#1d4ed8", badge: "📢 Normal" },
  low: { bg: "#f3f4f6", color: "#6b7280", badge: "📌 Low" },
};

export default function UniversityAnnouncementsPage() {
  const { token, user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [form, setForm] = useState({ title: "", content: "", targetAudience: "all", priority: "normal", pinned: false, expiresAt: "" });

  const notify = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text: "", ok: true }), 4000); };

  const load = async () => {
    try {
      const audience = user?.role === "student" ? "students" : user?.role === "professor" ? "professors" : "";
      setAnnouncements(await getAnnouncementsApi(token, audience));
    } catch { notify("Failed to load", false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createAnnouncementApi(form, token);
      notify("Announcement posted!");
      setShowForm(false);
      setForm({ title: "", content: "", targetAudience: "all", priority: "normal", pinned: false, expiresAt: "" });
      load();
    } catch (err) { notify(err.response?.data?.message || "Failed", false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    try { await deleteAnnouncementApi(id, token); notify("Deleted"); load(); }
    catch { notify("Failed", false); }
  };

  const canPost = user?.role === "admin" || user?.role === "professor";
  const pinned = announcements.filter(a => a.pinned);
  const regular = announcements.filter(a => !a.pinned);

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>📢 Announcements</h1>
          <p style={S.sub}>University-wide news and updates</p>
        </div>
        {canPost && <button onClick={() => setShowForm(!showForm)} style={S.btn}>{showForm ? "✕ Cancel" : "+ Post"}</button>}
      </div>

      {msg.text && <div style={{ ...S.toast, background: msg.ok ? "#dcfce7" : "#fee2e2", color: msg.ok ? "#166534" : "#dc2626" }}>{msg.text}</div>}

      {showForm && (
        <div style={S.card}>
          <h2>New Announcement</h2>
          <form onSubmit={handleCreate}>
            <label style={S.label}>Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={S.input} required />
            <label style={S.label}>Content *</label>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} style={{ ...S.input, minHeight: 100 }} required />
            <div style={S.grid3}>
              <div>
                <label style={S.label}>Target Audience</label>
                <select value={form.targetAudience} onChange={e => setForm({ ...form, targetAudience: e.target.value })} style={S.input}>
                  {["all","students","staff","professors"].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Priority</label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={S.input}>
                  {["low","normal","urgent"].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Expires At (optional)</label>
                <input type="datetime-local" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} style={S.input} />
              </div>
            </div>
            <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14, cursor: "pointer" }}>
              <input type="checkbox" checked={form.pinned} onChange={e => setForm({ ...form, pinned: e.target.checked })} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>📌 Pin this announcement</span>
            </label>
            <button type="submit" style={S.btn}>Post Announcement</button>
          </form>
        </div>
      )}

      {pinned.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#f59e0b", marginBottom: 12 }}>📌 Pinned</h2>
          {pinned.map(a => <AnnouncementCard key={a._id} a={a} user={user} onDelete={handleDelete} />)}
        </div>
      )}

      {regular.length > 0 && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#374151", marginBottom: 12 }}>Latest</h2>
          {regular.map(a => <AnnouncementCard key={a._id} a={a} user={user} onDelete={handleDelete} />)}
        </div>
      )}

      {announcements.length === 0 && <p style={{ color: "#6b7280" }}>No announcements yet.</p>}
    </div>
  );
}

function AnnouncementCard({ a, user, onDelete }) {
  const pri = PRIORITY_STYLE[a.priority] || PRIORITY_STYLE.normal;
  return (
    <div style={{ ...S.card, borderLeft: `4px solid ${pri.color}`, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ background: pri.bg, color: pri.color, padding: "3px 10px", borderRadius: 10, fontSize: 12, fontWeight: 700 }}>{pri.badge}</span>
            {a.pinned && <span style={{ background: "#fef9c3", color: "#a16207", padding: "3px 8px", borderRadius: 10, fontSize: 12, fontWeight: 700 }}>📌 Pinned</span>}
            <span style={{ background: "#f3f4f6", color: "#6b7280", padding: "3px 8px", borderRadius: 10, fontSize: 12 }}>For: {a.targetAudience}</span>
          </div>
          <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>{a.title}</h3>
          <p style={{ color: "#374151", lineHeight: 1.6, margin: "0 0 10px", whiteSpace: "pre-wrap" }}>{a.content}</p>
          <p style={{ color: "#9ca3af", fontSize: 12, margin: 0 }}>
            Posted by <strong>{a.postedBy?.name}</strong> · {new Date(a.createdAt).toLocaleDateString()}
            {a.expiresAt && ` · Expires: ${new Date(a.expiresAt).toLocaleDateString()}`}
          </p>
        </div>
        {user?.role === "admin" && (
          <button onClick={() => onDelete(a._id)} style={{ background: "#fee2e2", border: "none", color: "#dc2626", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontWeight: 700, marginLeft: 12 }}>✕</button>
        )}
      </div>
    </div>
  );
}

const S = {
  page: { padding: 40, background: "#f9fafb", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 800, margin: 0 },
  sub: { color: "#6b7280", marginTop: 4 },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 20 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 12 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontFamily: "inherit", fontSize: 14, boxSizing: "border-box", marginBottom: 12 },
  btn: { padding: "10px 20px", background: "#111827", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 },
  toast: { padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontWeight: 600 },
};