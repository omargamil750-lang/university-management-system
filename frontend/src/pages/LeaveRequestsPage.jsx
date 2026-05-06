import { useEffect, useState } from "react";
import { getMyLeavesApi, getAllLeavesApi, createLeaveApi, reviewLeaveApi } from "../api/leaveApi";
import { useAuth } from "../context/AuthContext";

const STATUS_STYLE = {
  pending: { bg: "#fef9c3", color: "#a16207" },
  approved: { bg: "#dcfce7", color: "#166534" },
  rejected: { bg: "#fee2e2", color: "#dc2626" },
};

const LEAVE_TYPES = ["annual","sick","emergency","unpaid","maternity","paternity"];

export default function LeaveRequestsPage() {
  const { token, user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [form, setForm] = useState({ leaveType: "annual", startDate: "", endDate: "", reason: "" });
  const [reviewNote, setReviewNote] = useState({});

  const notify = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text: "", ok: true }), 4000); };

  const load = async () => {
    try {
      const data = user?.role === "admin" ? await getAllLeavesApi(token) : await getMyLeavesApi(token);
      setLeaves(data);
    } catch { notify("Failed to load", false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await createLeaveApi(form, token); notify("Leave request submitted!"); setShowForm(false); load(); }
    catch (err) { notify(err.response?.data?.message || "Failed", false); }
  };

  const handleReview = async (id, status) => {
    try { await reviewLeaveApi(id, { status, reviewNote: reviewNote[id] || "" }, token); notify(`Leave ${status}`); load(); }
    catch { notify("Failed", false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📅 Leave Requests</h1>
          <p style={styles.sub}>{user?.role === "admin" ? "Review and manage staff leave" : "Manage your leave requests"}</p>
        </div>
        {user?.role !== "admin" && (
          <button onClick={() => setShowForm(!showForm)} style={styles.btn}>{showForm ? "✕ Cancel" : "+ Request Leave"}</button>
        )}
      </div>

      {msg.text && <div style={{ ...styles.toast, background: msg.ok ? "#dcfce7" : "#fee2e2", color: msg.ok ? "#166534" : "#dc2626" }}>{msg.text}</div>}

      {showForm && (
        <div style={styles.card}>
          <h2>New Leave Request</h2>
          <form onSubmit={handleCreate}>
            <div style={styles.grid3}>
              <div><label style={styles.label}>Leave Type *</label>
                <select value={form.leaveType} onChange={e => setForm({ ...form, leaveType: e.target.value })} style={styles.input}>
                  {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><label style={styles.label}>Start Date *</label><input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} style={styles.input} required /></div>
              <div><label style={styles.label}>End Date *</label><input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} style={styles.input} required /></div>
            </div>
            <label style={styles.label}>Reason *</label>
            <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} style={{ ...styles.input, minHeight: 80 }} required />
            <button type="submit" style={styles.btn}>Submit Request</button>
          </form>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {leaves.length === 0 && <p style={{ color: "#6b7280" }}>No leave requests found.</p>}
        {leaves.map(l => {
          const days = Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / (1000 * 60 * 60 * 24)) + 1;
          const st = STATUS_STYLE[l.status];
          return (
            <div key={l._id} style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 16, textTransform: "capitalize" }}>{l.leaveType} Leave</span>
                    <span style={{ background: st.bg, color: st.color, padding: "3px 12px", borderRadius: 12, fontSize: 13, fontWeight: 600 }}>{l.status}</span>
                    <span style={{ background: "#f3f4f6", padding: "3px 10px", borderRadius: 12, fontSize: 12, color: "#374151" }}>{days} day{days !== 1 ? "s" : ""}</span>
                  </div>
                  <p style={{ color: "#374151", fontSize: 14, margin: "4px 0" }}>📅 {new Date(l.startDate).toLocaleDateString()} → {new Date(l.endDate).toLocaleDateString()}</p>
                  <p style={{ color: "#6b7280", fontSize: 14, margin: "4px 0" }}>Reason: {l.reason}</p>
                  {user?.role === "admin" && <p style={{ color: "#6b7280", fontSize: 13 }}>👤 {l.staff?.name} ({l.staff?.email})</p>}
                  {l.reviewNote && <p style={{ color: "#374151", fontSize: 13, marginTop: 4 }}>📝 Note: {l.reviewNote}</p>}
                </div>
                {user?.role === "admin" && l.status === "pending" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 200 }}>
                    <input placeholder="Review note (optional)" value={reviewNote[l._id] || ""} onChange={e => setReviewNote({ ...reviewNote, [l._id]: e.target.value })} style={{ ...styles.input, marginBottom: 6 }} />
                    <button onClick={() => handleReview(l._id, "approved")} style={{ ...styles.sBtn, background: "#dcfce7", color: "#166534" }}>✓ Approve</button>
                    <button onClick={() => handleReview(l._id, "rejected")} style={{ ...styles.sBtn, background: "#fee2e2", color: "#dc2626" }}>✕ Reject</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
  grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 12 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontFamily: "inherit", fontSize: 14, boxSizing: "border-box", marginBottom: 0 },
  btn: { padding: "10px 20px", background: "#111827", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 },
  sBtn: { padding: "8px 14px", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13 },
  toast: { padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontWeight: 600 },
};