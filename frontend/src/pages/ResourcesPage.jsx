import { useEffect, useState } from "react";
import { getResourcesApi, createResourceApi, deleteResourceApi } from "../api/resourceApi";
import { useAuth } from "../context/AuthContext";

const CAT_ICONS = { equipment: "🔧", software: "💻", book: "📚", other: "📦" };

export default function ResourcesPage() {
  const { token, user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [form, setForm] = useState({ name: "", category: "equipment", quantity: 1, available: 1, department: "", description: "" });

  const notify = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text: "", ok: true }), 4000); };

  const load = async () => {
    try { setLoading(true); setResources(await getResourcesApi(token)); }
    catch { notify("Failed", false); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await createResourceApi(form, token); notify("Resource created!"); setShowForm(false); load(); }
    catch (err) { notify(err.response?.data?.message || "Failed", false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📦 Resources</h1>
          <p style={styles.sub}>University equipment, software, and materials</p>
        </div>
        {user?.role === "admin" && (
          <button onClick={() => setShowForm(!showForm)} style={styles.btn}>{showForm ? "✕ Cancel" : "+ Add Resource"}</button>
        )}
      </div>
      {msg.text && <div style={{ ...styles.toast, background: msg.ok ? "#dcfce7" : "#fee2e2", color: msg.ok ? "#166534" : "#dc2626" }}>{msg.text}</div>}

      {showForm && (
        <div style={styles.card}>
          <h2>New Resource</h2>
          <form onSubmit={handleCreate}>
            <div style={styles.grid3}>
              <div><label style={styles.label}>Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={styles.input} required /></div>
              <div><label style={styles.label}>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={styles.input}>
                  {["equipment","software","book","other"].map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
                </select>
              </div>
              <div><label style={styles.label}>Department</label><input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} style={styles.input} /></div>
              <div><label style={styles.label}>Total Quantity</label><input type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value, available: e.target.value })} style={styles.input} /></div>
              <div><label style={styles.label}>Description</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={styles.input} /></div>
            </div>
            <button type="submit" style={styles.btn}>Create Resource</button>
          </form>
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <div style={styles.grid}>
          {resources.length === 0 && <p style={{ color: "#6b7280" }}>No resources found.</p>}
          {resources.map(r => {
            const pct = Math.round((r.available / r.quantity) * 100);
            return (
              <div key={r._id} style={styles.resCard}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{CAT_ICONS[r.category]}</div>
                <h3 style={{ margin: "0 0 4px" }}>{r.name}</h3>
                <p style={{ color: "#6b7280", fontSize: 13, margin: "2px 0" }}>{r.category} {r.department && `· ${r.department}`}</p>
                {r.description && <p style={{ fontSize: 13, color: "#374151", margin: "6px 0" }}>{r.description}</p>}
                <div style={{ margin: "10px 0 4px", display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span>Available: <strong>{r.available}/{r.quantity}</strong></span>
                  <span style={{ color: pct > 50 ? "#166534" : pct > 0 ? "#a16207" : "#dc2626" }}>{pct}%</span>
                </div>
                <div style={{ height: 6, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: pct > 50 ? "#22c55e" : pct > 0 ? "#f59e0b" : "#ef4444", borderRadius: 3 }} />
                </div>
                {user?.role === "admin" && (
                  <button onClick={() => { if (window.confirm("Delete?")) deleteResourceApi(r._id, token).then(() => { notify("Deleted"); load(); }).catch(() => notify("Failed", false)); }} style={{ ...styles.delBtn, marginTop: 10 }}>Delete</button>
                )}
              </div>
            );
          })}
        </div>
      )}
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
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontFamily: "inherit", fontSize: 14, boxSizing: "border-box" },
  btn: { padding: "10px 20px", background: "#111827", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 },
  toast: { padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontWeight: 600 },
  resCard: { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 20 },
  delBtn: { padding: "6px 12px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 },
};