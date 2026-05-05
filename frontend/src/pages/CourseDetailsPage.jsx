import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCourseByIdApi, unenrollFromCourseApi } from "../api/courseApi";
import { createAssignmentApi, getAssignmentsByCourseApi, deleteAssignmentApi } from "../api/assignmentApi";
import { getProfessorSubmissionsApi } from "../api/submissionApi";
import { gradeSubmissionApi } from "../api/gradeApi";
import { useAuth } from "../context/AuthContext";

function CourseDetailsPage() {
  const { courseId } = useParams();
  const { token, user } = useAuth();

  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [message, setMessage] = useState("");
  const [msgColor, setMsgColor] = useState("#15803d");
  const [loading, setLoading] = useState(true);
  const [assignmentForm, setAssignmentForm] = useState({ title: "", description: "", dueDate: "" });
  const [gradeData, setGradeData] = useState({});

  const notify = (msg, ok = true) => {
    setMessage(msg);
    setMsgColor(ok ? "#15803d" : "#dc2626");
    setTimeout(() => setMessage(""), 4000);
  };

  const fetchData = async () => {
    try {
      const courseData = await getCourseByIdApi(courseId, token);
      setCourse(courseData);
      const aData = await getAssignmentsByCourseApi(courseId, token);
      setAssignments(aData);
      if (user?.role === "professor") {
        const sData = await getProfessorSubmissionsApi(courseId, token);
        setSubmissions(sData);
      }
    } catch (err) {
      notify(err.response?.data?.message || "Failed to load course details", false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [courseId]);

  if (loading) return <div style={{ padding: 40 }}>Loading course...</div>;
  if (!course) return <div style={{ padding: 40 }}>Course not found.</div>;

  const isAssignedProfessor = user?.role === "professor" && String(course.professor?._id) === String(user._id);
  const isEnrolledStudent = user?.role === "student" && course.students?.some((s) => String(s._id) === String(user._id));

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await createAssignmentApi({ course: courseId, ...assignmentForm }, token);
      notify("Assignment created successfully");
      setAssignmentForm({ title: "", description: "", dueDate: "" });
      fetchData();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to create assignment", false);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm("Delete this assignment and all its submissions?")) return;
    try {
      await deleteAssignmentApi(id, token);
      notify("Assignment deleted");
      fetchData();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to delete", false);
    }
  };

  const handleGrade = async (submissionId) => {
    try {
      const payload = gradeData[submissionId] || {};
      if (!payload.grade) return notify("Please enter a grade", false);
      await gradeSubmissionApi({ submissionId, grade: Number(payload.grade), feedback: payload.feedback || "" }, token);
      notify("Graded successfully");
      fetchData();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to grade", false);
    }
  };

  const handleUnenroll = async () => {
    if (!window.confirm("Are you sure you want to unenroll from this course?")) return;
    try {
      await unenrollFromCourseApi(courseId, token);
      notify("Unenrolled successfully");
      fetchData();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to unenroll", false);
    }
  };

  return (
    <div style={{ padding: 40, background: "#f9fafb", minHeight: "100vh" }}>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1>{course.code} - {course.title}</h1>
            <p style={{ color: "#6b7280" }}>Type: {course.type} · {course.creditHours} credit hours</p>
            {course.description && <p>{course.description}</p>}
            <p>Professor: <strong>{course.professor?.name || "Not assigned"}</strong></p>
            <p>Students Enrolled: <strong>{course.students?.length || 0}</strong></p>
          </div>
          {isEnrolledStudent && (
            <button onClick={handleUnenroll} style={{ ...btn, background: "#fee2e2", color: "#dc2626" }}>
              Unenroll
            </button>
          )}
        </div>

        {message && (
          <p style={{ marginTop: 12, padding: "10px 16px", borderRadius: 8, background: msgColor === "#15803d" ? "#dcfce7" : "#fee2e2", color: msgColor, fontWeight: 600 }}>
            {message}
          </p>
        )}

        {/* Create Assignment (professor) */}
        {isAssignedProfessor && (
          <div style={section}>
            <h2>Create Assignment</h2>
            <form onSubmit={handleCreateAssignment}>
              <input placeholder="Title *" value={assignmentForm.title} onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })} style={input} required />
              <textarea placeholder="Description" value={assignmentForm.description} onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })} style={input} />
              <label style={{ fontSize: 13, color: "#6b7280" }}>Due Date *</label>
              <input type="datetime-local" value={assignmentForm.dueDate} onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })} style={input} required />
              <button type="submit" style={btn}>Create Assignment</button>
            </form>
          </div>
        )}

        {/* Assignments list */}
        <div style={section}>
          <h2>Assignments</h2>
          {assignments.length === 0 && <p style={{ color: "#6b7280" }}>No assignments yet.</p>}
          {!isEnrolledStudent && user?.role === "student" && (
            <p style={{ color: "#dc2626" }}>You must enroll in this course to submit assignments.</p>
          )}
          {assignments.map((a) => (
            <div key={a._id} style={itemBox}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ margin: "0 0 4px 0" }}>{a.title}</h3>
                  {a.description && <p style={{ color: "#6b7280", fontSize: 14 }}>{a.description}</p>}
                  <p style={{ fontSize: 13, color: new Date() > new Date(a.dueDate) ? "#dc2626" : "#15803d" }}>
                    Due: {new Date(a.dueDate).toLocaleString()} {new Date() > new Date(a.dueDate) ? "(Overdue)" : ""}
                  </p>
                </div>
                {isAssignedProfessor && (
                  <button onClick={() => handleDeleteAssignment(a._id)} style={{ ...btn, background: "#fee2e2", color: "#dc2626", padding: "6px 12px" }}>
                    Delete
                  </button>
                )}
              </div>
              {isEnrolledStudent && new Date() <= new Date(a.dueDate) && (
                <Link to={`/assignments/submit/${a._id}`} style={{ display: "inline-block", marginTop: 8, color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>
                  Submit Assignment →
                </Link>
              )}
              {isEnrolledStudent && new Date() > new Date(a.dueDate) && (
                <p style={{ color: "#dc2626", fontSize: 14, marginTop: 8 }}>Submission closed</p>
              )}
            </div>
          ))}
        </div>

        {/* Submissions (professor) */}
        {isAssignedProfessor && (
          <div style={section}>
            <h2>Student Submissions</h2>
            {submissions.length === 0 && <p style={{ color: "#6b7280" }}>No submissions yet.</p>}
            {submissions.map((sub) => (
              <div key={sub._id} style={itemBox}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px 0" }}>{sub.assignment?.title}</h3>
                    <p style={{ color: "#6b7280", fontSize: 14 }}>Student: <strong>{sub.student?.name}</strong> ({sub.student?.email})</p>
                    <p style={{ fontSize: 14 }}>Content: {sub.content}</p>
                  </div>
                  <span style={{
                    padding: "4px 10px", borderRadius: 20, fontSize: 13, fontWeight: 600,
                    background: sub.status === "graded" ? "#dcfce7" : "#fef9c3",
                    color: sub.status === "graded" ? "#15803d" : "#a16207",
                  }}>
                    {sub.status}
                  </span>
                </div>
                {/* FIX: always show grade form (allows updating grade too) */}
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f3f4f6" }}>
                  <input
                    type="number" placeholder="Grade (0-100)" min="0" max="100"
                    defaultValue={gradeData[sub._id]?.grade || ""}
                    onChange={(e) => setGradeData({ ...gradeData, [sub._id]: { ...gradeData[sub._id], grade: e.target.value } })}
                    style={{ ...input, display: "inline-block", width: "140px", marginRight: 8 }}
                  />
                  <input
                    placeholder="Feedback (optional)"
                    defaultValue={gradeData[sub._id]?.feedback || ""}
                    onChange={(e) => setGradeData({ ...gradeData, [sub._id]: { ...gradeData[sub._id], feedback: e.target.value } })}
                    style={{ ...input, display: "inline-block", width: "260px", marginRight: 8 }}
                  />
                  <button onClick={() => handleGrade(sub._id)} style={btn}>
                    {sub.status === "graded" ? "Update Grade" : "Grade"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enrolled students (professor) */}
        {isAssignedProfessor && (
          <div style={section}>
            <h2>Enrolled Students ({course.students?.length || 0})</h2>
            {course.students?.length === 0
              ? <p style={{ color: "#6b7280" }}>No students enrolled yet.</p>
              : course.students.map((s) => (
                  <div key={s._id} style={{ ...itemBox, padding: "10px 16px" }}>
                    <strong>{s.name}</strong> — <span style={{ color: "#6b7280" }}>{s.email}</span>
                  </div>
                ))}
          </div>
        )}
      </div>
    </div>
  );
}

const card = { padding: 30, border: "1px solid #ddd", borderRadius: 14, background: "white" };
const section = { marginTop: 30, paddingTop: 24, borderTop: "1px solid #f3f4f6" };
const itemBox = { padding: 16, border: "1px solid #e5e7eb", borderRadius: 10, marginBottom: 12 };
const input = { display: "block", width: "100%", padding: "10px 12px", marginBottom: 10, borderRadius: 8, border: "1px solid #ccc", fontFamily: "inherit", boxSizing: "border-box" };
const btn = { padding: "9px 16px", border: "none", borderRadius: 8, cursor: "pointer", background: "#111827", color: "white", fontWeight: 600 };

export default CourseDetailsPage;