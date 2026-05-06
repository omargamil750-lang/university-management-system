import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAnnouncementsApi, createAnnouncementApi, deleteAnnouncementApi } from "../api/announcementApi";
import { useAuth } from "../context/AuthContext";

export default function CourseAnnouncementsPage() {
  const { courseId } = useParams();
  const { token, user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [form, setForm] = useState({ title: "", content: "", pinned: false });

  const notify = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text: "", ok: true }), 4000); };

  const load = async () => {
    try { setAnnouncements(await getAnnouncementsApi(courseId, token)); }
    catch { notify("Failed to load", false); }
  };

  useEffect(() => { load(); }, [courseId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await createAnnouncementApi({ ...form, course: courseId }, token); notify("Posted!"); setShowForm(false); setForm({ title: "", content: "", pinned: false }); load(); }
    catch (err) { notify(err.response?.data?.message || "Failed", false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try { await deleteAnnouncementApi(id, token); notify("Deleted"); load(); }
    catch { notify("Failed", false); }
  };

  const canPost = user?.role === "professor" || user?.role === "admin";

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📢 Course Announcements</h1>
        </div>
        {canPost && <button onClick={() => setShowForm(!showForm)} style={styles.btn}>{showForm ? "✕ Cancel" : "+ Post"}</button>}
      </div>

      {msg.text && <div style={{ ...styles.toast, background: msg.ok ? "#dcfce7" : "#fee2e2", color: msg.ok ? "#166534" : "#dc2626" }}>{msg.text}</div>}

      {showForm && (
        <div style={styles.card}>
          <h2>New Announcement</h2>
          <form onSubmit={handleCreate}>
            <label style={styles.label}>Title *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={styles.input} required />
            <label style={styles.label}>Content *</label><textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} style={{ ...styles.input, minHeight: 100 }} required />
            <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14, cursor: "pointer" }}>
              <input type="checkbox" checked={form.pinned} onChange={e => setForm({ ...form, pinned: e.target.checked })} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>📌 Pin this announcement</span>
            </label>
            <button type="submit" style={styles.btn}>Post Announcement</button>
          </form>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {announcements.length === 0 && <p style={{ color: "#6b7280" }}>No announcements yet.</p>}
        {announcements.map(a => (
          <div key={a._id} style={{ ...styles.card, borderLeft: a.pinned ? "4px solid #f59e0b" : "4px solid #e5e7eb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  {a.pinned && <span style={{ background: "#fef9c3", color: "#a16207", padding: "2px 8px", borderRadius: 10, fontSize: 12, fontWeight: 700 }}>📌 Pinned</span>}
                  <h3 style={{ margin: 0, fontSize: 16 }}>{a.title}</h3>
                </div>
                <p style={{ color: "#374151", lineHeight: 1.6, margin: "0 0 10px" }}>{a.content}</p>
                <p style={{ color: "#9ca3af", fontSize: 12 }}>Posted by {a.postedBy?.name} · {new Date(a.createdAt).toLocaleDateString()}</p>
              </div>
              {canPost && String(a.postedBy?._id) === String(user?._id) && (
                <button onClick={() => handleDelete(a._id)} style={styles.delBtn}>✕</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 40, background: "#f9fafb", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 800, margin: 0 },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 20 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontFamily: "inherit", fontSize: 14, boxSizing: "border-box", marginBottom: 12 },
  btn: { padding: "10px 20px", background: "#111827", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 },
  toast: { padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontWeight: 600 },
  delBtn: { background: "#fee2e2", border: "none", color: "#dc2626", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 700 },
};