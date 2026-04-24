import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyCoursesApi } from "../api/courseApi";
import { getProfessorSubmissionsApi } from "../api/submissionApi";

function ProfessorDashboard() {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesData = await getMyCoursesApi(token);
        setCourses(coursesData);
        let total = 0;
        for (const course of coursesData) {
          try {
            const subs = await getProfessorSubmissionsApi(course._id, token);
            total += subs.filter((s) => s.status === "submitted").length;
          } catch { }
        }
        setPendingCount(total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  if (loading) return <div style={page}><p>Loading...</p></div>;

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={{ marginBottom: 4 }}>Professor Dashboard</h1>
        <p style={{ color: "#6b7280", marginBottom: 24 }}>Welcome, <strong>{user?.name}</strong> — {user?.email}</p>

        <div style={statsGrid}>
          {[
            { val: courses.length, label: "Assigned Courses", bg: "#dbeafe", color: "#1d4ed8" },
            { val: pendingCount, label: "Pending to Grade", bg: "#fef9c3", color: "#a16207" },
            { val: courses.reduce((s, c) => s + (c.students?.length || 0), 0), label: "Total Students", bg: "#dcfce7", color: "#15803d" },
          ].map(({ val, label, bg, color }) => (
            <div key={label} style={{ background: bg, borderRadius: 12, padding: "18px", textAlign: "center", color }}>
              <div style={{ fontSize: 28, fontWeight: "bold" }}>{val}</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={linksGrid}>
          <Link to="/my-courses" style={linkBox}>📚 Assigned Courses</Link>
        </div>

        {courses.length > 0 && (
          <div style={{ marginTop: 30 }}>
            <h2>My Courses</h2>
            {courses.map((c) => (
              <div key={c._id} style={item}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{c.code} — {c.title}</strong>
                    <span style={{ marginLeft: 10, color: "#6b7280", fontSize: 14 }}>{c.type} · {c.creditHours} credits</span>
                  </div>
                  <Link to={`/courses/${c._id}`} style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>Open →</Link>
                </div>
                <p style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>{c.students?.length || 0} students enrolled</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const page = { padding: 40, background: "#f9fafb", minHeight: "100vh" };
const card = { padding: 30, border: "1px solid #ddd", borderRadius: 14, background: "white" };
const statsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16, marginBottom: 24 };
const linksGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginTop: 8 };
const linkBox = { padding: 18, border: "1px solid #ddd", borderRadius: 12, background: "#f9fafb", textDecoration: "none", color: "#111827", fontWeight: "bold", textAlign: "center", display: "block" };
const item = { padding: "14px 16px", border: "1px solid #e5e7eb", borderRadius: 10, marginBottom: 10 };

export default ProfessorDashboard;