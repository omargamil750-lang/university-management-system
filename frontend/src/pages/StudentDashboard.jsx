import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCoursesApi } from "../api/courseApi";
import { getStudentGradesApi } from "../api/gradeApi";
import { getSubmissionsByStudentApi } from "../api/submissionApi";

function StudentDashboard() {
  const { user, token } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allCourses, gradesData, subsData] = await Promise.all([
          getCoursesApi(token),
          getStudentGradesApi(user._id, token),
          getSubmissionsByStudentApi(user._id, token),
        ]);
        setEnrolledCourses(allCourses.filter((c) =>
          c.students?.some((s) => String(s._id) === String(user._id))
        ));
        setGrades(gradesData);
        setSubmissions(subsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const average = grades.length > 0
    ? (grades.reduce((s, g) => s + g.grade, 0) / grades.length).toFixed(1)
    : null;

  const getColor = (g) => g >= 90 ? "#15803d" : g >= 75 ? "#1d4ed8" : g >= 60 ? "#a16207" : "#dc2626";
  const getLetter = (g) => g >= 90 ? "A" : g >= 80 ? "B" : g >= 70 ? "C" : g >= 60 ? "D" : "F";

  if (loading) return <div style={page}><p>Loading...</p></div>;

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={{ marginBottom: 4 }}>Student Dashboard</h1>
        <p style={{ color: "#6b7280", marginBottom: 24 }}>Welcome, <strong>{user?.name}</strong> — {user?.email}</p>

        <div style={statsGrid}>
          {[
            { val: enrolledCourses.length, label: "Enrolled Courses", bg: "#dbeafe", color: "#1d4ed8" },
            { val: grades.length, label: "Graded Assignments", bg: "#dcfce7", color: "#15803d" },
            { val: submissions.filter(s => s.status === "submitted").length, label: "Pending Review", bg: "#fef9c3", color: "#a16207" },
            { val: average ?? "—", label: "Average Grade", bg: "#f3e8ff", color: "#7e22ce" },
          ].map(({ val, label, bg, color }) => (
            <div key={label} style={{ background: bg, borderRadius: 12, padding: "18px", textAlign: "center", color }}>
              <div style={{ fontSize: 28, fontWeight: "bold" }}>{val}</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={linksGrid}>
          <Link to="/courses" style={linkBox}>📚 Browse Courses</Link>
          <Link to="/grades" style={linkBox}>📊 My Grades</Link>
          <Link to="/my-submissions" style={linkBox}>📝 My Submissions</Link>
        </div>

        {enrolledCourses.length > 0 && (
          <div style={{ marginTop: 30 }}>
            <h2>My Courses</h2>
            {enrolledCourses.map((c) => (
              <div key={c._id} style={item}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{c.code} — {c.title}</strong>
                    <span style={{ marginLeft: 10, color: "#6b7280", fontSize: 14 }}>{c.type} · {c.creditHours} credits</span>
                  </div>
                  <Link to={`/courses/${c._id}`} style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>Open →</Link>
                </div>
                <p style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>Professor: {c.professor?.name || "Not assigned"}</p>
              </div>
            ))}
          </div>
        )}

        {grades.length > 0 && (
          <div style={{ marginTop: 30 }}>
            <h2>Recent Grades</h2>
            {grades.slice(0, 3).map((g) => (
              <div key={g._id} style={{ ...item, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{g.assignment?.title}</strong>
                  <p style={{ color: "#6b7280", fontSize: 14, margin: "2px 0" }}>{g.course?.code} — {g.course?.title}</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 26, fontWeight: "bold", color: getColor(g.grade) }}>{g.grade}</div>
                  <div style={{ background: getColor(g.grade), color: "white", borderRadius: 6, padding: "1px 8px", fontSize: 13, fontWeight: "bold" }}>{getLetter(g.grade)}</div>
                </div>
              </div>
            ))}
            {grades.length > 3 && <Link to="/grades" style={{ color: "#2563eb", fontWeight: 600 }}>View all {grades.length} grades →</Link>}
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

export default StudentDashboard;