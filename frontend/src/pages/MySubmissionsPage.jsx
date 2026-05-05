import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getSubmissionsByStudentApi } from "../api/submissionApi";

function MySubmissionsPage() {
  const { user, token } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getSubmissionsByStudentApi(user._id, token);
        setSubmissions(data);
      } catch {
        setMessage("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetch();
  }, [user]);

  if (loading) return <div style={{ padding: 40 }}>Loading submissions...</div>;

  return (
    <div style={{ padding: 40, background: "#f9fafb", minHeight: "100vh" }}>
      <div style={card}>
        <h1>My Submissions</h1>
        {message && <p style={{ color: "#dc2626" }}>{message}</p>}
        {submissions.length === 0 && !message && <p style={{ color: "#6b7280" }}>No submissions yet.</p>}
        {submissions.map((sub) => (
          <div key={sub._id} style={item}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: "0 0 4px 0" }}>{sub.assignment?.title}</h3>
                <p style={{ color: "#6b7280", fontSize: 14, margin: "2px 0" }}>
                  📚 {sub.assignment?.course?.code} — {sub.assignment?.course?.title}
                </p>
                <p style={{ fontSize: 14, marginTop: 6 }}>{sub.content}</p>
                <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
                  Submitted: {new Date(sub.createdAt).toLocaleString()}
                </p>
              </div>
              <span style={{
                padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
                background: sub.status === "graded" ? "#dcfce7" : "#fef9c3",
                color: sub.status === "graded" ? "#15803d" : "#a16207",
              }}>
                {sub.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const card = { padding: 30, border: "1px solid #ddd", borderRadius: 14, background: "white" };
const item = { padding: "16px 20px", border: "1px solid #e5e7eb", borderRadius: 10, marginBottom: 12 };

export default MySubmissionsPage;