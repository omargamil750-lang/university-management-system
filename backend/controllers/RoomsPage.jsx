import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRoomsApi, createRoomApi, deleteRoomApi } from "../api/roomApi";
import { useAuth } from "../context/AuthContext";

const ROOM_ICONS = { classroom: "🏫", lab: "🔬", seminar: "💬", auditorium: "🎭", office: "🏢" };

export default function RoomsPage() {
  const { token, user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [form, setForm] = useState({ name: "", building: "", floor: 1, capacity: 30, type: "classroom", facilities: "" });

  const notify = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text: "", ok: true }), 4000); };

  const load = async () => {
    try {
      setLoading(true);
      const data = await getRoomsApi(token);
      setRooms(data);
    } catch { notify("Failed to load rooms", false); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createRoomApi({ ...form, facilities: form.facilities.split(",").map(f => f.trim()).filter(Boolean) }, token);
      notify("Room created!");
      setShowForm(false);
      load();
    } catch (err) { notify(err.response?.data?.message || "Failed", false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this room?")) return;
    try { await deleteRoomApi(id, token); notify("Deleted"); load(); }
    catch { notify("Failed", false); }
  };

  const filtered = rooms.filter(r =>
    (filterType === "all" || r.type === filterType) &&
    (r.name.toLowerCase().includes(search.toLowerCase()) || r.building.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🏛️ Rooms & Facilities</h1>
          <p style={styles.sub}>Find and book spaces across campus</p>
        </div>
        {user?.role === "admin" && (
          <button onClick={() => setShowForm(!showForm)} style={styles.btn}>{showForm ? "✕ Cancel" : "+ Add Room"}</button>
        )}
      </div>

      {msg.text && <div style={{ ...styles.toast, background: msg.ok ? "#dcfce7" : "#fee2e2", color: msg.ok ? "#166534" : "#dc2626" }}>{msg.text}</div>}

      {showForm && (
        <div style={styles.card}>
          <h2>New Room</h2>
          <form onSubmit={handleCreate}>
            <div style={styles.grid3}>
              <div><label style={styles.label}>Room Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={styles.input} required /></div>
              <div><label style={styles.label}>Building *</label><input value={form.building} onChange={e => setForm({ ...form, building: e.target.value })} style={styles.input} required /></div>
              <div><label style={styles.label}>Floor</label><input type="number" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} style={styles.input} /></div>
              <div><label style={styles.label}>Capacity</label><input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} style={styles.input} /></div>
              <div><label style={styles.label}>Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={styles.input}>
                  {["classroom","lab","seminar","auditorium","office"].map(t => <option key={t} value={t}>{ROOM_ICONS[t]} {t}</option>)}
                </select>
              </div>
              <div><label style={styles.label}>Facilities (comma-separated)</label><input value={form.facilities} onChange={e => setForm({ ...form, facilities: e.target.value })} style={styles.input} placeholder="projector, AC, whiteboard" /></div>
            </div>
            <button type="submit" style={styles.btn}>Create Room</button>
          </form>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input placeholder="Search rooms..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...styles.input, maxWidth: 260 }} />
        {["all","classroom","lab","seminar","auditorium","office"].map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            style={{ ...styles.filterBtn, ...(filterType === t ? styles.filterActive : {}) }}>
            {t === "all" ? "All" : `${ROOM_ICONS[t]} ${t}`}
          </button>
        ))}
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={styles.grid}>
          {filtered.length === 0 && <p style={{ color: "#6b7280" }}>No rooms found.</p>}
          {filtered.map(room => (
            <div key={room._id} style={styles.roomCard}>
              <div style={styles.roomIcon}>{ROOM_ICONS[room.type]}</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 4px" }}>{room.name}</h3>
                <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>{room.building} · Floor {room.floor}</p>
                <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 8px" }}>👥 Capacity: {room.capacity}</p>
                {room.facilities?.length > 0 && (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                    {room.facilities.map(f => <span key={f} style={styles.tag}>{f}</span>)}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <Link to={`/rooms/${room._id}`} style={styles.openBtn}>View & Book</Link>
                  {user?.role === "admin" && (
                    <button onClick={() => handleDelete(room._id)} style={styles.delBtn}>Delete</button>
                  )}
                </div>
              </div>
            </div>
          ))}
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
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontFamily: "inherit", fontSize: 14, boxSizing: "border-box" },
  btn: { padding: "10px 20px", background: "#111827", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 },
  toast: { padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontWeight: 600 },
  filterBtn: { padding: "7px 14px", border: "1px solid #e5e7eb", borderRadius: 20, background: "white", cursor: "pointer", fontSize: 13 },
  filterActive: { background: "#111827", color: "white", border: "1px solid #111827" },
  roomCard: { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 16, display: "flex", gap: 14, alignItems: "flex-start" },
  roomIcon: { fontSize: 32, lineHeight: 1 },
  tag: { background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 6, padding: "2px 8px", fontSize: 12, color: "#374151" },
  openBtn: { padding: "7px 14px", background: "#111827", color: "white", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 },
  delBtn: { padding: "7px 14px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 },
};