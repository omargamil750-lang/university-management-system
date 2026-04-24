import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRoomByIdApi } from "../api/roomApi";
import { getBookingsByRoomApi, createBookingApi } from "../api/bookingApi";
import { useAuth } from "../context/AuthContext";

export default function RoomDetailsPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [room, setRoom] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [form, setForm] = useState({ title: "", date: "", startTime: "", endTime: "", notes: "" });

  const notify = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text: "", ok: true }), 4000); };

  const load = async () => {
    try {
      const [r, b] = await Promise.all([getRoomByIdApi(id, token), getBookingsByRoomApi(id, token)]);
      setRoom(r); setBookings(b);
    } catch { notify("Failed to load", false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      await createBookingApi({ room: id, ...form }, token);
      notify("Booking request submitted! Awaiting admin approval.");
      setForm({ title: "", date: "", startTime: "", endTime: "", notes: "" });
      load();
    } catch (err) { notify(err.response?.data?.message || "Failed", false); }
  };

  if (!room) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={{ marginBottom: 4 }}>{room.name}</h1>
        <p style={{ color: "#6b7280" }}>{room.building} · Floor {room.floor} · Capacity: {room.capacity}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
          {room.facilities?.map(f => <span key={f} style={styles.tag}>{f}</span>)}
        </div>
        {msg.text && <div style={{ ...styles.toast, background: msg.ok ? "#dcfce7" : "#fee2e2", color: msg.ok ? "#166534" : "#dc2626" }}>{msg.text}</div>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <h2>Book This Room</h2>
          <form onSubmit={handleBook}>
            <label style={styles.label}>Purpose / Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={styles.input} required />
            <label style={styles.label}>Date *</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={styles.input} required />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><label style={styles.label}>Start Time *</label><input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} style={styles.input} required /></div>
              <div><label style={styles.label}>End Time *</label><input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} style={styles.input} required /></div>
            </div>
            <label style={styles.label}>Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ ...styles.input, minHeight: 70 }} />
            <button type="submit" style={styles.btn}>Submit Booking Request</button>
          </form>
        </div>

        <div style={styles.card}>
          <h2>Approved Bookings</h2>
          {bookings.length === 0 && <p style={{ color: "#6b7280" }}>No bookings yet — room is free!</p>}
          {bookings.map(b => (
            <div key={b._id} style={styles.bookingItem}>
              <strong>{b.title}</strong>
              <p style={{ color: "#6b7280", fontSize: 13, margin: "2px 0" }}>📅 {b.date} · {b.startTime} – {b.endTime}</p>
              <p style={{ color: "#6b7280", fontSize: 13 }}>👤 {b.bookedBy?.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 40, background: "#f9fafb", minHeight: "100vh" },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24, marginBottom: 20 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontFamily: "inherit", fontSize: 14, boxSizing: "border-box", marginBottom: 12 },
  btn: { padding: "10px 20px", background: "#111827", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, width: "100%" },
  tag: { background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 6, padding: "3px 10px", fontSize: 13 },
  toast: { padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontWeight: 600 },
  bookingItem: { padding: "12px 0", borderBottom: "1px solid #f3f4f6" },
};