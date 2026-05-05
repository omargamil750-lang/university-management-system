import { useEffect, useState } from "react";
import { getStudentGradesApi } from "../api/gradeApi";
import { useAuth } from "../context/AuthContext";

function GradesPage() {
  const { token, user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const data = await getStudentGradesApi(user._id, token);
        setGrades(data);
      } catch {
        setMessage("Failed to load grades");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchGrades();
  }, [user]);

  const average = grades.length > 0
    ? (grades.reduce((s, g) => s + g.grade, 0) / grades.length).toFixed(1)
    : null;

  const getColor = (g) => g >= 90 ? "#15803d" : g >= 75 ? "#1d4ed8" : g >= 60 ? "#a16207" : "#dc2626";
  const getLetter = (g) => g >= 90 ? "A" : g >= 80 ? "B" : g >= 70 ? "C" : g >= 60 ? "D" : "F";

  if (loading) return <div style={{ padding: 40 }}>Loading grades...</div>;

  return (
    <div style={{ padding: 40, background: "#f9fafb", minHeight: "100vh" }}>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <h1>My Grades</h1>
          {average && (
            <div style={{ background: "#dbeafe", borderRadius: 12, padding: "12px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: "bold", color: "#1d4ed8" }}>{average}</div>
              <div style={{ fontSize: 13, color: "#1d4ed8" }}>Overall Average</div>
            </div>
          )}
        </div>
        {message && <p style={{ color: "#dc2626" }}>{message}</p>}
        {grades.length === 0 && !message && <p style={{ color: "#6b7280" }}>No grades yet.</p>}
        {grades.map((g) => (
          <div key={g._id} style={item}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 4px 0" }}>{g.assignment?.title}</h3>
                <p style={{ color: "#6b7280", fontSize: 14, margin: "2px 0" }}>📚 {g.course?.code} — {g.course?.title}</p>
                <p style={{ color: "#6b7280", fontSize: 14, margin: "2px 0" }}>👤 {g.professor?.name}</p>
                {g.feedback && (
                  <p style={{ marginTop: 8, background: "#f9fafb", padding: "8px 12px", borderRadius: 8, fontSize: 14, borderLeft: "3px solid #e5e7eb" }}>
                    💬 {g.feedback}
                  </p>
                )}
              </div>
              <div style={{ textAlign: "center", marginLeft: 20 }}>
                <div style={{ fontSize: 32, fontWeight: "bold", color: getColor(g.grade) }}>{g.grade}</div>
                <div style={{ background: getColor(g.grade), color: "white", borderRadius: 6, padding: "2px 8px", fontSize: 13, fontWeight: "bold" }}>{getLetter(g.grade)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const card = { padding: 30, border: "1px solid #ddd", borderRadius: 14, background: "white" };
const item = { padding: "16px 20px", border: "1px solid #e5e7eb", borderRadius: 10, marginBottom: 14 };

export default GradesPage;