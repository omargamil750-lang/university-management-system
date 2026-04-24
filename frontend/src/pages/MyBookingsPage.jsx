import { useEffect, useState } from "react";
import { getMyBookingsApi, cancelBookingApi, getAllBookingsApi, updateBookingStatusApi } from "../api/bookingApi";
import { useAuth } from "../context/AuthContext";

const STATUS_COLORS = { pending: "#fef9c3", approved: "#dcfce7", rejected: "#fee2e2", cancelled: "#f3f4f6" };
const STATUS_TEXT = { pending: "#a16207", approved: "#166534", rejected: "#dc2626", cancelled: "#6b7280" };

export default function MyBookingsPage() {
  const { token, user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: "", ok: true });

  const notify = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text: "", ok: true }), 4000); };

  const load = async () => {
    try {
      setLoading(true);
      const data = user?.role === "admin" ? await getAllBookingsApi(token) : await getMyBookingsApi(token);
      setBookings(data);
    } catch { notify("Failed to load", false); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try { await cancelBookingApi(id, token); notify("Cancelled"); load(); }
    catch (err) { notify(err.response?.data?.message || "Failed", false); }
  };

  const handleStatus = async (id, status) => {
    try { await updateBookingStatusApi(id, status, token); notify(`Booking ${status}`); load(); }
    catch { notify("Failed", false); }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>{user?.role === "admin" ? "📋 All Bookings" : "📋 My Bookings"}</h1>
      {msg.text && <div style={{ ...styles.toast, background: msg.ok ? "#dcfce7" : "#fee2e2", color: msg.ok ? "#166534" : "#dc2626" }}>{msg.text}</div>}
      {loading ? <p>Loading...</p> : bookings.length === 0 ? <p style={{ color: "#6b7280" }}>No bookings found.</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {bookings.map(b => (
            <div key={b._id} style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ margin: "0 0 4px" }}>{b.title}</h3>
                  <p style={{ color: "#6b7280", fontSize: 14, margin: "2px 0" }}>🏛️ {b.room?.name} · {b.room?.building}</p>
                  <p style={{ color: "#6b7280", fontSize: 14, margin: "2px 0" }}>📅 {b.date} · {b.startTime} – {b.endTime}</p>
                  {user?.role === "admin" && <p style={{ color: "#6b7280", fontSize: 13 }}>👤 {b.bookedBy?.name} ({b.bookedBy?.email})</p>}
                  {b.notes && <p style={{ fontSize: 13, color: "#374151", marginTop: 4 }}>📝 {b.notes}</p>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ background: STATUS_COLORS[b.status], color: STATUS_TEXT[b.status], padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
                    {b.status}
                  </span>
                  {user?.role === "admin" && b.status === "pending" && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => handleStatus(b._id, "approved")} style={{ ...styles.smallBtn, background: "#dcfce7", color: "#166534" }}>Approve</button>
                      <button onClick={() => handleStatus(b._id, "rejected")} style={{ ...styles.smallBtn, background: "#fee2e2", color: "#dc2626" }}>Reject</button>
                    </div>
                  )}
                  {b.status === "pending" && String(b.bookedBy?._id || b.bookedBy) === String(user?._id) && (
                    <button onClick={() => handleCancel(b._id)} style={{ ...styles.smallBtn, background: "#fee2e2", color: "#dc2626" }}>Cancel</button>
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
  title: { fontSize: 26, fontWeight: 800, marginBottom: 20 },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 },
  toast: { padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontWeight: 600 },
  smallBtn: { padding: "5px 12px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 },
};