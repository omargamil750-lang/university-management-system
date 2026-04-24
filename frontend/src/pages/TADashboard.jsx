import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTACoursesApi } from "../api/taApi";
import { getMyOfficeHoursApi, createOfficeHourApi, deleteOfficeHourApi } from "../api/officeHourApi";

export default function TADashboard() {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [officeHours, setOfficeHours] = useState([]);
  const [showOHForm, setShowOHForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [ohForm, setOhForm] = useState({
    dayOfWeek: "Monday", startTime: "", endTime: "",
    location: "", isVirtual: false, meetingLink: "", notes: ""
  });

  const notify = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text: "", ok: true }), 4000); };

  const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  const load = async () => {
    try {
      const [c, oh] = await Promise.all([
        getTACoursesApi(token),
        getMyOfficeHoursApi(token),
      ]);
      setCourses(c);
      setOfficeHours(oh);
    } catch (err) {
      console.error(err);
      notify("Failed to load dashboard", false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAddOH = async (e) => {
    e.preventDefault();
    try {
      await createOfficeHourApi(ohForm, token);
      notify("Office hours added!");
      setShowOHForm(false);
      setOhForm({ dayOfWeek: "Monday", startTime: "", endTime: "", location: "", isVirtual: false, meetingLink: "", notes: "" });
      load();
    } catch (err) { notify(err.response?.data?.message || "Failed", false); }
  };

  const handleDeleteOH = async (id) => {
    try { await deleteOfficeHourApi(id, token); notify("Deleted"); load(); }
    catch { notify("Failed", false); }
  };

  if (loading) return <div style={S.page}><p>Loading TA Dashboard...</p></div>;

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 800 }}>🎓 TA Dashboard</h1>
            <p style={{ color: "#6b7280", margin: 0 }}>Welcome, <strong>{user?.name}</strong> — {user?.email}</p>
          </div>
          <span style={S.roleBadge}>Teaching Assistant</span>
        </div>

        {msg.text && (
          <div style={{ ...S.toast, background: msg.ok ? "#dcfce7" : "#fee2e2", color: msg.ok ? "#166534" : "#dc2626" }}>
            {msg.text}
          </div>
        )}

        {/* Stats */}
        <div style={S.statsRow}>
          {[
            { val: courses.length, label: "Assigned Courses", bg: "#dbeafe", color: "#1d4ed8" },
            { val: officeHours.length, label: "Office Hour Slots", bg: "#dcfce7", color: "#166534" },
            { val: courses.reduce((s, c) => s + (c.students?.length || 0), 0), label: "Total Students", bg: "#f3e8ff", color: "#7e22ce" },
          ].map(({ val, label, bg, color }) => (
            <div key={label} style={{ ...S.statBox, background: bg, color }}>
              <div style={S.statVal}>{val}</div>
              <div style={S.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div style={S.linksGrid}>
          {[
            { to: "/messages", icon: "💬", label: "Messages" },
            { to: "/office-hours", icon: "🕐", label: "Office Hours" },
            { to: "/staff", icon: "👥", label: "Staff Directory" },
            { to: "/events", icon: "📅", label: "Events" },
            { to: "/announcements", icon: "📢", label: "Announcements" },
            { to: "/leave", icon: "📋", label: "Leave Requests" },
          ].map(({ to, icon, label }) => (
            <Link key={to} to={to} style={S.linkCard}>{icon} {label}</Link>
          ))}
        </div>
      </div>

      {/* Assigned Courses */}
      <div style={S.card}>
        <h2 style={S.sectionTitle}>📚 Assigned Courses</h2>
        {courses.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No courses assigned yet. Contact your administrator.</p>
        ) : (
          <div style={S.coursesGrid}>
            {courses.map(c => (
              <div key={c._id} style={S.courseCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px", fontSize: 15 }}>{c.code} — {c.title}</h3>
                    <p style={{ color: "#6b7280", fontSize: 13, margin: "2px 0" }}>
                      {c.type} · {c.creditHours} credits
                    </p>
                    <p style={{ color: "#6b7280", fontSize: 13, margin: "2px 0" }}>
                      Prof: {c.professor?.name || "Not assigned"}
                    </p>
                    <p style={{ color: "#6b7280", fontSize: 13, margin: "2px 0" }}>
                      👥 {c.students?.length || 0} students
                    </p>
                  </div>
                  <Link to={`/courses/${c._id}`} style={S.openBtn}>View →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Office Hours */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ ...S.sectionTitle, marginBottom: 0 }}>🕐 My Office Hours</h2>
          <button onClick={() => setShowOHForm(!showOHForm)} style={S.btn}>
            {showOHForm ? "✕ Cancel" : "+ Add Slot"}
          </button>
        </div>

        {showOHForm && (
          <form onSubmit={handleAddOH} style={S.ohForm}>
            <div style={S.grid3}>
              <div>
                <label style={S.label}>Day *</label>
                <select value={ohForm.dayOfWeek} onChange={e => setOhForm({ ...ohForm, dayOfWeek: e.target.value })} style={S.input}>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Start Time *</label>
                <input type="time" value={ohForm.startTime} onChange={e => setOhForm({ ...ohForm, startTime: e.target.value })} style={S.input} required />
              </div>
              <div>
                <label style={S.label}>End Time *</label>
                <input type="time" value={ohForm.endTime} onChange={e => setOhForm({ ...ohForm, endTime: e.target.value })} style={S.input} required />
              </div>
              <div>
                <label style={S.label}>Location</label>
                <input value={ohForm.location} onChange={e => setOhForm({ ...ohForm, location: e.target.value })} style={S.input} placeholder="e.g. Room 204" />
              </div>
              <div>
                <label style={S.label}>Meeting Link (if virtual)</label>
                <input value={ohForm.meetingLink} onChange={e => setOhForm({ ...ohForm, meetingLink: e.target.value })} style={S.input} placeholder="https://..." />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 24 }}>
                <input type="checkbox" id="virt" checked={ohForm.isVirtual} onChange={e => setOhForm({ ...ohForm, isVirtual: e.target.checked })} />
                <label htmlFor="virt" style={{ fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Virtual</label>
              </div>
            </div>
            <label style={S.label}>Notes</label>
            <input value={ohForm.notes} onChange={e => setOhForm({ ...ohForm, notes: e.target.value })} style={S.input} placeholder="Any notes for students..." />
            <button type="submit" style={S.btn}>Save Office Hours</button>
          </form>
        )}

        {officeHours.length === 0 && !showOHForm && (
          <p style={{ color: "#6b7280" }}>No office hours set. Add your availability for students.</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {officeHours.map(oh => (
            <div key={oh._id} style={S.ohItem}>
              <div>
                <span style={{ fontWeight: 700 }}>{oh.dayOfWeek}</span>
                <span style={{ color: "#6b7280", fontSize: 14, marginLeft: 10 }}>{oh.startTime} – {oh.endTime}</span>
                {oh.isVirtual
                  ? <span style={S.virtualBadge}>🌐 Virtual {oh.meetingLink && <a href={oh.meetingLink} target="_blank" rel="noreferrer" style={{ color: "#2563eb", marginLeft: 6 }}>Join</a>}</span>
                  : oh.location && <span style={{ color: "#6b7280", fontSize: 13, marginLeft: 8 }}>📍 {oh.location}</span>
                }
                {oh.notes && <span style={{ color: "#9ca3af", fontSize: 12, marginLeft: 8 }}>· {oh.notes}</span>}
              </div>
              <button onClick={() => handleDeleteOH(oh._id)} style={S.delBtn}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { padding: 40, background: "#f9fafb", minHeight: "100vh", display: "flex", flexDirection: "column", gap: 20 },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24 },
  roleBadge: { background: "#f3e8ff", color: "#7e22ce", padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700 },
  toast: { padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontWeight: 600 },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 },
  statBox: { borderRadius: 12, padding: "18px 20px", textAlign: "center" },
  statVal: { fontSize: 28, fontWeight: 800 },
  statLabel: { fontSize: 13, marginTop: 4 },
  linksGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 },
  linkCard: { display: "block", padding: "14px 10px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, textDecoration: "none", color: "#111827", fontWeight: 700, fontSize: 14, textAlign: "center" },
  sectionTitle: { fontSize: 18, fontWeight: 800, marginBottom: 16 },
  coursesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 },
  courseCard: { border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 },
  openBtn: { color: "#2563eb", fontWeight: 700, textDecoration: "none", fontSize: 14, whiteSpace: "nowrap" },
  ohForm: { background: "#f9fafb", borderRadius: 10, padding: 16, marginBottom: 16, border: "1px solid #e5e7eb" },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 10 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontFamily: "inherit", fontSize: 14, boxSizing: "border-box", marginBottom: 8 },
  btn: { padding: "10px 18px", background: "#111827", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 },
  ohItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb" },
  virtualBadge: { background: "#dbeafe", color: "#1d4ed8", borderRadius: 10, padding: "2px 8px", fontSize: 12, fontWeight: 600, marginLeft: 8 },
  delBtn: { background: "#fee2e2", border: "none", color: "#dc2626", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 700 },
};