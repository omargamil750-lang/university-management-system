import { useEffect, useState } from "react";
import { getEventsApi, createEventApi, rsvpEventApi, deleteEventApi } from "../api/eventApi";
import { useAuth } from "../context/AuthContext";

const TYPES = ["all", "academic", "cultural", "sports", "seminar", "holiday", "other"];
const TYPE_COLORS = { academic: "#3b82f6", cultural: "#8b5cf6", sports: "#10b981", seminar: "#f59e0b", holiday: "#ef4444", other: "#6b7280" };
const TYPE_EMOJI = { academic: "🎓", cultural: "🎭", sports: "⚽", seminar: "🔬", holiday: "🎉", other: "📌" };

export default function EventsPage() {
  const { token, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [form, setForm] = useState({ title: "", description: "", type: "academic", startDate: "", endDate: "", location: "", imageUrl: "" });

  const notify = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text: "", ok: true }), 4000); };

  const load = async () => {
    try {
      setLoading(true);
      const data = await getEventsApi(token, filter === "all" ? "" : filter);
      setEvents(data);
    } catch { notify("Failed to load events", false); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createEventApi(form, token);
      notify("Event created!");
      setShowForm(false);
      setForm({ title: "", description: "", type: "academic", startDate: "", endDate: "", location: "", imageUrl: "" });
      load();
    } catch (err) { notify(err.response?.data?.message || "Failed", false); }
  };

  const handleRSVP = async (id) => {
    try {
      const res = await rsvpEventApi(id, token);
      notify(res.message);
      load();
    } catch { notify("Failed", false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try { await deleteEventApi(id, token); notify("Deleted"); load(); }
    catch { notify("Failed", false); }
  };

  const canCreate = user?.role === "admin" || user?.role === "professor";

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📅 University Events</h1>
          <p style={styles.subtitle}>Stay updated with everything happening on campus</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowForm(!showForm)} style={styles.btn}>
            {showForm ? "✕ Cancel" : "+ Create Event"}
          </button>
        )}
      </div>

      {msg.text && <div style={{ ...styles.toast, background: msg.ok ? "#dcfce7" : "#fee2e2", color: msg.ok ? "#166534" : "#dc2626" }}>{msg.text}</div>}
      {showForm && (
        <div style={styles.card}>
          <h2 style={{ marginBottom: 16 }}>New Event</h2>
          <form onSubmit={handleCreate}>
            <div style={styles.grid2}>
              <div><label style={styles.label}>Title *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={styles.input} required /></div>
              <div><label style={styles.label}>Type *</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={styles.input}>
                  {TYPES.filter(t => t !== "all").map(t => <option key={t} value={t}>{TYPE_EMOJI[t]} {t}</option>)}
                </select>
              </div>
              <div><label style={styles.label}>Start Date *</label><input type="datetime-local" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} style={styles.input} required /></div>
              <div><label style={styles.label}>End Date *</label><input type="datetime-local" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} style={styles.input} required /></div>
              <div><label style={styles.label}>Location</label><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={styles.input} /></div>
              <div><label style={styles.label}>Image URL</label><input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} style={styles.input} /></div>
            </div>
            <label style={styles.label}>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...styles.input, minHeight: 80 }} />
            <button type="submit" style={styles.btn}>Create Event</button>
          </form>
        </div>
      )}

      <div style={styles.filterRow}>
        {TYPES.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            style={{ ...styles.filterBtn, ...(filter === t ? styles.filterBtnActive : {}) }}>
            {t === "all" ? "All" : `${TYPE_EMOJI[t]} ${t}`}
          </button>
        ))}
      </div>

      {loading ? <p style={{ textAlign: "center", padding: 40 }}>Loading...</p> : (
        <div style={styles.eventsGrid}>
          {events.length === 0 && <p style={{ color: "#6b7280", gridColumn: "1/-1" }}>No events found.</p>}
          {events.map(ev => {
            const attending = ev.attendees?.some(a => String(a._id || a) === String(user?._id));
            const color = TYPE_COLORS[ev.type] || "#6b7280";
            return (
              <div key={ev._id} style={styles.eventCard}>
                {ev.imageUrl && <img src={ev.imageUrl} alt={ev.title} style={styles.eventImg} />}
                <div style={{ padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{ ...styles.typeBadge, background: color + "20", color }}>{TYPE_EMOJI[ev.type]} {ev.type}</span>
                    {user?.role === "admin" && (
                      <button onClick={() => handleDelete(ev._id)} style={styles.delBtn}>✕</button>
                    )}
                  </div>
                  <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>{ev.title}</h3>
                  {ev.description && <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 10px" }}>{ev.description}</p>}
                  <div style={styles.eventMeta}>
                    <span>📍 {ev.location || "TBD"}</span>
                    <span>👤 {ev.organizer?.name}</span>
                    <span>🗓 {new Date(ev.startDate).toLocaleDateString()}</span>
                    <span>👥 {ev.attendees?.length || 0} attending</span>
                  </div>
                  <button onClick={() => handleRSVP(ev._id)}
                    style={{ ...styles.rsvpBtn, background: attending ? "#dcfce7" : "#111827", color: attending ? "#166534" : "white" }}>
                    {attending ? "✓ Attending" : "RSVP"}
                  </button>
                </div>
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
  subtitle: { color: "#6b7280", marginTop: 4 },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24, marginBottom: 24 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontFamily: "inherit", fontSize: 14, boxSizing: "border-box" },
  btn: { padding: "10px 20px", background: "#111827", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 },
  toast: { padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontWeight: 600 },
  filterRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 },
  filterBtn: { padding: "7px 14px", border: "1px solid #e5e7eb", borderRadius: 20, background: "white", cursor: "pointer", fontSize: 13, fontWeight: 500 },
  filterBtnActive: { background: "#111827", color: "white", border: "1px solid #111827" },
  eventsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 },
  eventCard: { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  eventImg: { width: "100%", height: 140, objectFit: "cover" },
  typeBadge: { padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  eventMeta: { display: "flex", flexWrap: "wrap", gap: "6px 14px", fontSize: 12, color: "#6b7280", marginBottom: 12 },
  rsvpBtn: { width: "100%", padding: "9px", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 },
  delBtn: { background: "#fee2e2", border: "none", color: "#dc2626", borderRadius: 6, padding: "2px 8px", cursor: "pointer", fontWeight: 700 },
};