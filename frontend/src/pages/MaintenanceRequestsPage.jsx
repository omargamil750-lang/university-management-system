import { useEffect, useState } from "react";
import { getRequestsApi, getMyRequestsApi, createRequestApi, updateStatusApi } from "../api/maintenanceApi";
import { getRoomsApi } from "../api/roomApi";
import { useAuth } from "../context/AuthContext";

const PRI_COLOR = { low: "#dcfce7", medium: "#fef9c3", high: "#fee2e2" };
const PRI_TEXT = { low: "#166534", medium: "#a16207", high: "#dc2626" };
const STA_COLOR = { open: "#fee2e2", in_progress: "#fef9c3", resolved: "#dcfce7" };

export default function MaintenanceRequestsPage() {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [form, setForm] = useState({ title: "", description: "", room: "", priority: "medium" });

  const notify = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text: "", ok: true }), 4000); };

  const load = async () => {
    try {
      const [req, rm] = await Promise.all([
        user?.role === "admin" ? getRequestsApi(token) : getMyRequestsApi(token),
        getRoomsApi(token),
      ]);
      setRequests(req); setRooms(rm);
    } catch { notify("Failed to load", false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await createRequestApi(form, token); notify("Request submitted!"); setShowForm(false); setForm({ title: "", description: "", room: "", priority: "medium" }); load(); }
    catch (err) { notify(err.response?.data?.message || "Failed", false); }
  };

  const handleStatus = async (id, status) => {
    try { await updateStatusApi(id, status, token); notify("Status updated"); load(); }
    catch { notify("Failed", false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🔧 Maintenance Requests</h1>
          <p style={styles.sub}>{user?.role === "admin" ? "Manage all maintenance requests" : "Report and track maintenance issues"}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={styles.btn}>{showForm ? "✕ Cancel" : "+ New Request"}</button>
      </div>

      {msg.text && <div style={{ ...styles.toast, background: msg.ok ? "#dcfce7" : "#fee2e2", color: msg.ok ? "#166534" : "#dc2626" }}>{msg.text}</div>}

      {showForm && (
        <div style={styles.card}>
          <h2>New Maintenance Request</h2>
          <form onSubmit={handleCreate}>
            <label style={styles.label}>Title *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={styles.input} required />
            <label style={styles.label}>Description *</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...styles.input, minHeight: 80 }} required />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={styles.label}>Room (optional)</label>
                <select value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} style={styles.input}>
                  <option value="">No specific room</option>
                  {rooms.map(r => <option key={r._id} value={r._id}>{r.name} - {r.building}</option>)}
                </select>
              </div>
              <div><label style={styles.label}>Priority</label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={styles.input}>
                  {["low","medium","high"].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" style={styles.btn}>Submit Request</button>
          </form>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {requests.length === 0 && <p style={{ color: "#6b7280" }}>No requests found.</p>}
        {requests.map(r => (
          <div key={r._id} style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <h3 style={{ margin: 0 }}>{r.title}</h3>
                  <span style={{ background: PRI_COLOR[r.priority], color: PRI_TEXT[r.priority], padding: "2px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{r.priority}</span>
                </div>
                <p style={{ color: "#374151", fontSize: 14, margin: "4px 0" }}>{r.description}</p>
                {r.room && <p style={{ color: "#6b7280", fontSize: 13 }}>📍 {r.room.name} - {r.room.building}</p>}
                {user?.role === "admin" && <p style={{ color: "#6b7280", fontSize: 13 }}>👤 {r.reportedBy?.name} ({r.reportedBy?.email})</p>}
                <p style={{ color: "#9ca3af", fontSize: 12, marginTop: 4 }}>📅 {new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ background: STA_COLOR[r.status], padding: "4px 12px", borderRadius: 12, fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>{r.status.replace("_", " ")}</span>
                {user?.role === "admin" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {r.status !== "in_progress" && <button onClick={() => handleStatus(r._id, "in_progress")} style={{ ...styles.sBtn, background: "#fef9c3", color: "#a16207" }}>In Progress</button>}
                    {r.status !== "resolved" && <button onClick={() => handleStatus(r._id, "resolved")} style={{ ...styles.sBtn, background: "#dcfce7", color: "#166534" }}>Resolve</button>}
                  </div>
                )}
              </div>
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
  sub: { color: "#6b7280", marginTop: 4 },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 20 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontFamily: "inherit", fontSize: 14, boxSizing: "border-box", marginBottom: 10 },
  btn: { padding: "10px 20px", background: "#111827", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 },
  toast: { padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontWeight: 600 },
  sBtn: { padding: "5px 10px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 },
};