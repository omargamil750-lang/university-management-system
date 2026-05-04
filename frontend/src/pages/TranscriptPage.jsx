import { useEffect, useState } from "react";
import { getMyRequestsApi, getAllRequestsApi, createRequestApi, updateStatusApi, generateTranscriptApi } from "../api/transcriptApi";
import { useAuth } from "../context/AuthContext";

const STATUS_STYLE = {
  pending: { bg: "#fef9c3", color: "#a16207" },
  processing: { bg: "#dbeafe", color: "#1d4ed8" },
  ready: { bg: "#dcfce7", color: "#166534" },
  rejected: { bg: "#fee2e2", color: "#dc2626" },
};

export default function TranscriptPage() {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [transcript, setTranscript] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [form, setForm] = useState({ purpose: "", deliveryMethod: "email" });
  const [reviewNote, setReviewNote] = useState({});

  const notify = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text: "", ok: true }), 4000); };

  const load = async () => {
    try {
      const data = user?.role === "admin" ? await getAllRequestsApi(token) : await getMyRequestsApi(token);
      setRequests(data);
    } catch { notify("Failed to load", false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await createRequestApi(form, token); notify("Request submitted!"); setShowForm(false); load(); }
    catch (err) { notify(err.response?.data?.message || "Failed", false); }
  };

  const handleStatus = async (id, status) => {
    try { await updateStatusApi(id, { status, notes: reviewNote[id] || "" }, token); notify("Status updated"); load(); }
    catch { notify("Failed", false); }
  };

  const handleGenerate = async (studentId) => {
    try {
      const data = await generateTranscriptApi(studentId, token);
      setTranscript(data);
    } catch { notify("Failed to generate transcript", false); }
  };

  const getLetter = (g) => g >= 90 ? "A" : g >= 80 ? "B" : g >= 70 ? "C" : g >= 60 ? "D" : "F";

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>📋 Transcripts</h1>
          <p style={S.sub}>{user?.role === "admin" ? "Manage transcript requests" : "Request your academic transcript"}</p>
        </div>
        {user?.role === "student" && (
          <button onClick={() => setShowForm(!showForm)} style={S.btn}>{showForm ? "✕ Cancel" : "Request Transcript"}</button>
        )}
      </div>

      {msg.text && <div style={{ ...S.toast, background: msg.ok ? "#dcfce7" : "#fee2e2", color: msg.ok ? "#166534" : "#dc2626" }}>{msg.text}</div>}

      {showForm && (
        <div style={S.card}>
          <h2>New Transcript Request</h2>
          <form onSubmit={handleCreate}>
            <label style={S.label}>Purpose *</label>
            <input value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} style={S.input} placeholder="e.g. Graduate school application" required />
            <label style={S.label}>Delivery Method</label>
            <select value={form.deliveryMethod} onChange={e => setForm({ ...form, deliveryMethod: e.target.value })} style={S.input}>
              <option value="email">Email</option>
              <option value="pickup">Pickup</option>
              <option value="mail">Mail</option>
            </select>
            <button type="submit" style={S.btn}>Submit Request</button>
          </form>
        </div>
      )}

      {/* Student: view own transcript */}
      {user?.role === "student" && (
        <div style={{ ...S.card, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0 }}>View My Transcript</h2>
            <button onClick={() => handleGenerate(user._id)} style={S.btn}>Generate Transcript</button>
          </div>
          {transcript && (
            <div style={{ marginTop: 20 }}>
              <div style={{ background: "#f9fafb", borderRadius: 10, padding: 20, border: "1px solid #e5e7eb" }}>
                <h3 style={{ textAlign: "center", margin: "0 0 4px" }}>🎓 Academic Transcript</h3>
                <p style={{ textAlign: "center", color: "#6b7280", fontSize: 13, margin: "0 0 20px" }}>Generated: {new Date(transcript.generatedAt).toLocaleDateString()}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
                  <div style={{ textAlign: "center", background: "white", borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#1d4ed8" }}>{transcript.gpa}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>GPA</div>
                  </div>
                  <div style={{ textAlign: "center", background: "white", borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#166534" }}>{transcript.totalCredits}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>Credit Hours</div>
                  </div>
                  <div style={{ textAlign: "center", background: "white", borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#a16207" }}>{transcript.enrolledCourses?.length}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>Courses</div>
                  </div>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 8, overflow: "hidden" }}>
                  <thead>
                    <tr style={{ background: "#111827", color: "white" }}>
                      <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 13 }}>Assignment</th>
                      <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 13 }}>Course</th>
                      <th style={{ padding: "10px 12px", textAlign: "center", fontSize: 13 }}>Grade</th>
                      <th style={{ padding: "10px 12px", textAlign: "center", fontSize: 13 }}>Letter</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transcript.grades?.map((g, i) => (
                      <tr key={g._id} style={{ background: i % 2 === 0 ? "#f9fafb" : "white" }}>
                        <td style={{ padding: "10px 12px", fontSize: 13 }}>{g.assignment?.title}</td>
                        <td style={{ padding: "10px 12px", fontSize: 13, color: "#6b7280" }}>{g.course?.code}</td>
                        <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700 }}>{g.grade}</td>
                        <td style={{ padding: "10px 12px", textAlign: "center" }}>
                          <span style={{ background: g.grade >= 60 ? "#dcfce7" : "#fee2e2", color: g.grade >= 60 ? "#166534" : "#dc2626", padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                            {getLetter(g.grade)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Requests list */}
      <h2>Transcript Requests</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {requests.length === 0 && <p style={{ color: "#6b7280" }}>No requests found.</p>}
        {requests.map(r => {
          const st = STATUS_STYLE[r.status];
          return (
            <div key={r._id} style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  {user?.role === "admin" && <p style={{ fontWeight: 700, margin: "0 0 4px" }}>{r.student?.name} ({r.student?.email})</p>}
                  <p style={{ color: "#374151", fontSize: 14, margin: "2px 0" }}>Purpose: {r.purpose}</p>
                  <p style={{ color: "#6b7280", fontSize: 13, margin: "2px 0" }}>Delivery: {r.deliveryMethod} · {new Date(r.createdAt).toLocaleDateString()}</p>
                  {r.notes && <p style={{ color: "#374151", fontSize: 13 }}>📝 {r.notes}</p>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ background: st.bg, color: st.color, padding: "4px 12px", borderRadius: 12, fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>{r.status}</span>
                  {user?.role === "admin" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <input placeholder="Note..." value={reviewNote[r._id] || ""} onChange={e => setReviewNote({ ...reviewNote, [r._id]: e.target.value })} style={{ ...S.input, marginBottom: 4, width: 180 }} />
                      {["processing","ready","rejected"].map(s => (
                        r.status !== s && (
                          <button key={s} onClick={() => handleStatus(r._id, s)}
                            style={{ ...S.sBtn, background: s === "ready" ? "#dcfce7" : s === "rejected" ? "#fee2e2" : "#dbeafe", color: s === "ready" ? "#166534" : s === "rejected" ? "#dc2626" : "#1d4ed8" }}>
                            → {s}
                          </button>
                        )
                      ))}
                      <button onClick={() => handleGenerate(r.student?._id)} style={{ ...S.sBtn, background: "#f3f4f6", color: "#374151", marginTop: 4 }}>View Transcript</button>
                    </div>
                  )}
                </div>
              </div>
              {transcript && user?.role === "admin" && (
                <div style={{ marginTop: 12, padding: 12, background: "#f9fafb", borderRadius: 8, fontSize: 13 }}>
                  <strong>GPA: {transcript.gpa}</strong> · Credits: {transcript.totalCredits} · Grades: {transcript.grades?.length}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const S = {
  page: { padding: 40, background: "#f9fafb", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 800, margin: 0 },
  sub: { color: "#6b7280", marginTop: 4 },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 20 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontFamily: "inherit", fontSize: 14, boxSizing: "border-box", marginBottom: 10 },
  btn: { padding: "10px 20px", background: "#111827", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" },
  sBtn: { padding: "5px 12px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 },
  toast: { padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontWeight: 600 },
};