import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMaterialsApi, uploadMaterialApi, deleteMaterialApi } from "../api/materialApi";
import { useAuth } from "../context/AuthContext";

const FILE_ICONS = { pdf: "📄", video: "🎬", link: "🔗", document: "📝", other: "📁" };

export default function CourseMaterialsPage() {
  const { courseId } = useParams();
  const { token, user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [form, setForm] = useState({ title: "", description: "", fileUrl: "", fileType: "document", week: 1 });

  const notify = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text: "", ok: true }), 4000); };

  const load = async () => {
    try { setMaterials(await getMaterialsApi(courseId, token)); }
    catch { notify("Failed to load", false); }
  };

  useEffect(() => { load(); }, [courseId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    try { await uploadMaterialApi({ ...form, course: courseId }, token); notify("Material added!"); setShowForm(false); setForm({ title: "", description: "", fileUrl: "", fileType: "document", week: 1 }); load(); }
    catch (err) { notify(err.response?.data?.message || "Failed", false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this material?")) return;
    try { await deleteMaterialApi(id, token); notify("Deleted"); load(); }
    catch { notify("Failed", false); }
  };

  // Group by week
  const byWeek = materials.reduce((acc, m) => {
    const w = m.week || 1;
    if (!acc[w]) acc[w] = [];
    acc[w].push(m);
    return acc;
  }, {});

  const canManage = user?.role === "professor" || user?.role === "admin";

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📚 Course Materials</h1>
          <p style={styles.sub}>Lecture notes, videos, and resources</p>
        </div>
        {canManage && <button onClick={() => setShowForm(!showForm)} style={styles.btn}>{showForm ? "✕ Cancel" : "+ Upload"}</button>}
      </div>

      {msg.text && <div style={{ ...styles.toast, background: msg.ok ? "#dcfce7" : "#fee2e2", color: msg.ok ? "#166534" : "#dc2626" }}>{msg.text}</div>}

      {showForm && (
        <div style={styles.card}>
          <h2>Upload Material</h2>
          <form onSubmit={handleUpload}>
            <div style={styles.grid3}>
              <div><label style={styles.label}>Title *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={styles.input} required /></div>
              <div><label style={styles.label}>Type</label>
                <select value={form.fileType} onChange={e => setForm({ ...form, fileType: e.target.value })} style={styles.input}>
                  {["document","pdf","video","link","other"].map(t => <option key={t} value={t}>{FILE_ICONS[t]} {t}</option>)}
                </select>
              </div>
              <div><label style={styles.label}>Week</label><input type="number" min="1" value={form.week} onChange={e => setForm({ ...form, week: e.target.value })} style={styles.input} /></div>
            </div>
            <label style={styles.label}>File URL / Link *</label><input value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })} style={styles.input} required />
            <label style={styles.label}>Description</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={styles.input} />
            <button type="submit" style={styles.btn}>Upload</button>
          </form>
        </div>
      )}

      {Object.keys(byWeek).length === 0 && <p style={{ color: "#6b7280" }}>No materials uploaded yet.</p>}

      {Object.keys(byWeek).sort((a, b) => a - b).map(week => (
        <div key={week} style={{ marginBottom: 24 }}>
          <h2 style={styles.weekHeader}>Week {week}</h2>
          <div style={styles.grid}>
            {byWeek[week].map(m => (
              <div key={m._id} style={styles.matCard}>
                <div style={styles.fileIcon}>{FILE_ICONS[m.fileType] || "📁"}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: 15 }}>{m.title}</h3>
                  {m.description && <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 8px" }}>{m.description}</p>}
                  <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 10px" }}>By {m.uploadedBy?.name} · {new Date(m.createdAt).toLocaleDateString()}</p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <a href={m.fileUrl} target="_blank" rel="noreferrer" style={styles.openBtn}>
                      {m.fileType === "link" ? "Visit Link" : m.fileType === "video" ? "Watch" : "Download"} →
                    </a>
                    {canManage && <button onClick={() => handleDelete(m._id)} style={styles.delBtn}>Delete</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
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
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontFamily: "inherit", fontSize: 14, boxSizing: "border-box", marginBottom: 12 },
  btn: { padding: "10px 20px", background: "#111827", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 },
  toast: { padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontWeight: 600 },
  weekHeader: { fontSize: 18, fontWeight: 800, color: "#374151", margin: "0 0 12px", paddingBottom: 8, borderBottom: "2px solid #e5e7eb" },
  matCard: { background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, display: "flex", gap: 12 },
  fileIcon: { fontSize: 28, lineHeight: 1 },
  openBtn: { padding: "6px 14px", background: "#111827", color: "white", borderRadius: 6, textDecoration: "none", fontSize: 13, fontWeight: 600 },
  delBtn: { padding: "6px 12px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 },
};