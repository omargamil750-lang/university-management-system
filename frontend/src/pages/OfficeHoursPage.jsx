import { useEffect, useState } from "react";
import {
  getAllOfficeHoursApi,
  getMyOfficeHoursApi,
  createOfficeHourApi,
  deleteOfficeHourApi,
} from "../api/officeHourApi";
import { useAuth } from "../context/AuthContext";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const DAY_COLORS = {
  Monday: "#dbeafe", Tuesday: "#dcfce7", Wednesday: "#fef9c3",
  Thursday: "#f3e8ff", Friday: "#fee2e2", Saturday: "#e0f2fe", Sunday: "#fce7f3"
};
const ROLE_COLORS = { professor: "#2563eb", ta: "#9333ea", admin: "#dc2626" };
const ROLE_LABELS = { professor: "👨‍🏫 Professor", ta: "🎓 TA", admin: "⚙️ Admin" };

export default function OfficeHoursPage() {
  const { token, user } = useAuth();
  const [allHours, setAllHours] = useState([]);
  const [myHours, setMyHours] = useState([]);
  const [filterRole, setFilterRole] = useState("all");
  const [filterDay, setFilterDay] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState("grid"); // "grid" | "list"
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [form, setForm] = useState({
    dayOfWeek: "Monday", startTime: "", endTime: "",
    location: "", isVirtual: false, meetingLink: "", notes: ""
  });

  const notify = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text: "", ok: true }), 4000); };

  const load = async () => {
    try {
      const all = await getAllOfficeHoursApi(token);
      setAllHours(all);
      if (["professor","ta","admin"].includes(user?.role)) {
        const my = await getMyOfficeHoursApi(token);
        setMyHours(my);
      }
    } catch { notify("Failed to load office hours", false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createOfficeHourApi(form, token);
      notify("Office hours added!");
      setShowForm(false);
      setForm({ dayOfWeek: "Monday", startTime: "", endTime: "", location: "", isVirtual: false, meetingLink: "", notes: "" });
      load();
    } catch (err) { notify(err.response?.data?.message || "Failed", false); }
  };

  const handleDelete = async (id) => {
    try { await deleteOfficeHourApi(id, token); notify("Deleted"); load(); }
    catch { notify("Failed", false); }
  };

  // Filter
  const filtered = allHours.filter(h => {
    const matchRole = filterRole === "all" || h.staff?.role === filterRole;
    const matchDay = filterDay === "all" || h.dayOfWeek === filterDay;
    const matchSearch = !search || h.staff?.name?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchDay && matchSearch;
  });

  // Group by day for grid view
  const byDay = DAYS.reduce((acc, d) => ({
    ...acc,
    [d]: filtered.filter(h => h.dayOfWeek === d)
  }), {});

  // Group by staff for list view
  const byStaff = filtered.reduce((acc, h) => {
    const key = h.staff?._id || "unknown";
    if (!acc[key]) acc[key] = { staff: h.staff, hours: [] };
    acc[key].hours.push(h);
    return acc;
  }, {});

  const canManage = ["professor","ta","admin"].includes(user?.role);

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>🕐 Office Hours</h1>
          <p style={S.sub}>Find when professors and TAs are available</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setView(view === "grid" ? "list" : "grid")} style={S.outlineBtn}>
            {view === "grid" ? "📋 List View" : "📅 Week View"}
          </button>
          {canManage && (
            <button onClick={() => setShowForm(!showForm)} style={S.btn}>
              {showForm ? "✕ Cancel" : "+ Add Hours"}
            </button>
          )}
        </div>
      </div>

      {msg.text && (
        <div style={{ ...S.toast, background: msg.ok ? "#dcfce7" : "#fee2e2", color: msg.ok ? "#166534" : "#dc2626" }}>
          {msg.text}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div style={S.card}>
          <h2 style={{ marginBottom: 16 }}>Add Office Hours</h2>
          <form onSubmit={handleCreate}>
            <div style={S.grid3}>
              <div>
                <label style={S.label}>Day *</label>
                <select value={form.dayOfWeek} onChange={e => setForm({ ...form, dayOfWeek: e.target.value })} style={S.input}>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Start Time *</label>
                <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} style={S.input} required />
              </div>
              <div>
                <label style={S.label}>End Time *</label>
                <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} style={S.input} required />
              </div>
              <div>
                <label style={S.label}>Location</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={S.input} placeholder="e.g. Office A-201" />
              </div>
              <div>
                <label style={S.label}>Meeting Link</label>
                <input value={form.meetingLink} onChange={e => setForm({ ...form, meetingLink: e.target.value })} style={S.input} placeholder="https://meet.google.com/..." />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 24 }}>
                <input type="checkbox" id="virt" checked={form.isVirtual} onChange={e => setForm({ ...form, isVirtual: e.target.checked })} />
                <label htmlFor="virt" style={{ fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Virtual meeting</label>
              </div>
            </div>
            <label style={S.label}>Notes (optional)</label>
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={S.input} placeholder="Any additional info for students..." />
            <button type="submit" style={S.btn}>Add Office Hours</button>
          </form>
        </div>
      )}

      {/* My hours (for staff) */}
      {canManage && myHours.length > 0 && (
        <div style={S.card}>
          <h2 style={S.sectionTitle}>My Office Hours</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {myHours.map(h => (
              <div key={h._id} style={S.myOHItem}>
                <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ ...S.dayTag, background: DAY_COLORS[h.dayOfWeek] }}>{h.dayOfWeek}</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{h.startTime} – {h.endTime}</span>
                  {h.isVirtual
                    ? <span style={S.virtualTag}>🌐 Virtual {h.meetingLink && <a href={h.meetingLink} target="_blank" rel="noreferrer" style={{ color: "#2563eb", marginLeft: 4 }}>Join Link</a>}</span>
                    : h.location && <span style={{ fontSize: 13, color: "#6b7280" }}>📍 {h.location}</span>
                  }
                  {h.notes && <span style={{ fontSize: 12, color: "#9ca3af" }}>· {h.notes}</span>}
                </div>
                <button onClick={() => handleDelete(h._id)} style={S.delBtn}>✕ Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={S.filtersRow}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search by name..."
          style={{ ...S.input, maxWidth: 220, marginBottom: 0 }}
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["all","professor","ta"].map(r => (
            <button key={r} onClick={() => setFilterRole(r)}
              style={{ ...S.filterBtn, ...(filterRole === r ? S.filterBtnActive : {}) }}>
              {r === "all" ? "All Staff" : ROLE_LABELS[r] || r}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button onClick={() => setFilterDay("all")} style={{ ...S.filterBtn, ...(filterDay === "all" ? S.filterBtnActive : {}) }}>All Days</button>
          {DAYS.map(d => (
            <button key={d} onClick={() => setFilterDay(d)}
              style={{ ...S.filterBtn, ...(filterDay === d ? S.filterBtnActive : {}), background: filterDay === d ? "#111827" : DAY_COLORS[d] }}>
              {d.slice(0,3)}
            </button>
          ))}
        </div>
      </div>

      <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 16px" }}>
        Showing {filtered.length} office hour slot{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
          <p style={{ fontSize: 32 }}>🔍</p>
          <p>No office hours found matching your filters.</p>
        </div>
      )}

      {/* GRID VIEW — weekly calendar */}
      {view === "grid" && filtered.length > 0 && (
        <div style={S.weekGrid}>
          {DAYS.map(day => (
            <div key={day}>
              <div style={{ ...S.dayHeader, background: DAY_COLORS[day] }}>
                {day}
              </div>
              {byDay[day].length === 0
                ? <div style={S.emptyDay}>—</div>
                : byDay[day].map(h => (
                    <div key={h._id} style={S.slotCard}>
                      <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 4 }}>
                        <div style={{ ...S.roleCircle, background: (ROLE_COLORS[h.staff?.role] || "#6b7280") + "20", color: ROLE_COLORS[h.staff?.role] || "#6b7280" }}>
                          {h.staff?.name?.[0] || "?"}
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 12, color: ROLE_COLORS[h.staff?.role] || "#374151" }}>
                          {h.staff?.name}
                        </span>
                      </div>
                      <p style={{ margin: "0 0 2px", fontSize: 11, color: "#374151", fontWeight: 600 }}>
                        {h.startTime} – {h.endTime}
                      </p>
                      <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 8, background: (ROLE_COLORS[h.staff?.role] || "#6b7280") + "15", color: ROLE_COLORS[h.staff?.role] || "#6b7280", fontWeight: 600 }}>
                        {h.staff?.role}
                      </span>
                      {h.isVirtual
                        ? <p style={{ margin: "4px 0 0", fontSize: 10, color: "#2563eb" }}>🌐 Virtual</p>
                        : h.location && <p style={{ margin: "4px 0 0", fontSize: 10, color: "#6b7280" }}>📍 {h.location}</p>
                      }
                      {h.meetingLink && (
                        <a href={h.meetingLink} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: "#2563eb", display: "block", marginTop: 3 }}>Join →</a>
                      )}
                    </div>
                  ))
              }
            </div>
          ))}
        </div>
      )}

      {/* LIST VIEW — grouped by staff */}
      {view === "list" && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {Object.values(byStaff).map(({ staff, hours }) => (
            <div key={staff?._id} style={S.card}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
                <div style={{ ...S.bigAvatar, background: (ROLE_COLORS[staff?.role] || "#6b7280") + "20", color: ROLE_COLORS[staff?.role] || "#6b7280" }}>
                  {staff?.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <h3 style={{ margin: "0 0 2px", fontSize: 16 }}>{staff?.name}</h3>
                  <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 10, background: (ROLE_COLORS[staff?.role] || "#6b7280") + "15", color: ROLE_COLORS[staff?.role] || "#6b7280", fontWeight: 700, textTransform: "capitalize" }}>
                    {staff?.role}
                  </span>
                  <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 8 }}>{staff?.email}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {hours.sort((a, b) => DAYS.indexOf(a.dayOfWeek) - DAYS.indexOf(b.dayOfWeek)).map(h => (
                  <div key={h._id} style={S.listSlot}>
                    <span style={{ ...S.dayTag, background: DAY_COLORS[h.dayOfWeek], minWidth: 90, textAlign: "center" }}>
                      {h.dayOfWeek}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 14, minWidth: 120 }}>{h.startTime} – {h.endTime}</span>
                    {h.isVirtual ? (
                      <span style={S.virtualTag}>
                        🌐 Virtual
                        {h.meetingLink && <a href={h.meetingLink} target="_blank" rel="noreferrer" style={{ color: "#2563eb", marginLeft: 6, fontWeight: 700 }}>Join</a>}
                      </span>
                    ) : h.location ? (
                      <span style={{ fontSize: 13, color: "#6b7280" }}>📍 {h.location}</span>
                    ) : null}
                    {h.notes && <span style={{ fontSize: 12, color: "#9ca3af", flex: 1 }}>💬 {h.notes}</span>}
                    {canManage && String(h.staff?._id) === String(user?._id) && (
                      <button onClick={() => handleDelete(h._id)} style={{ ...S.delBtn, marginLeft: "auto" }}>✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const S = {
  page: { padding: 40, background: "#f9fafb", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 800, margin: 0 },
  sub: { color: "#6b7280", marginTop: 4 },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 800, marginBottom: 14 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 12 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontFamily: "inherit", fontSize: 14, boxSizing: "border-box", marginBottom: 10 },
  btn: { padding: "10px 20px", background: "#111827", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" },
  outlineBtn: { padding: "10px 16px", background: "white", color: "#111827", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" },
  toast: { padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontWeight: 600 },
  filtersRow: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16, padding: "16px 20px", background: "white", border: "1px solid #e5e7eb", borderRadius: 12 },
  filterBtn: { padding: "7px 14px", border: "1px solid #e5e7eb", borderRadius: 20, background: "white", cursor: "pointer", fontSize: 13, fontWeight: 500 },
  filterBtnActive: { background: "#111827", color: "white", border: "1px solid #111827" },
  weekGrid: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 },
  dayHeader: { textAlign: "center", fontWeight: 800, fontSize: 12, padding: "8px 4px", borderRadius: "8px 8px 0 0", marginBottom: 4 },
  emptyDay: { textAlign: "center", color: "#e5e7eb", padding: "16px 0", fontSize: 20 },
  slotCard: { background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: 8, marginBottom: 4, transition: "box-shadow 0.15s" },
  roleCircle: { width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 },
  myOHItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb" },
  dayTag: { padding: "3px 10px", borderRadius: 10, fontSize: 12, fontWeight: 700, display: "inline-block" },
  virtualTag: { background: "#dbeafe", color: "#1d4ed8", borderRadius: 10, padding: "3px 8px", fontSize: 12, fontWeight: 600 },
  delBtn: { background: "#fee2e2", border: "none", color: "#dc2626", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontWeight: 700, fontSize: 12 },
  listSlot: { display: "flex", gap: 12, alignItems: "center", padding: "10px 14px", background: "#f9fafb", borderRadius: 8, flexWrap: "wrap" },
  bigAvatar: { width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20 },
};