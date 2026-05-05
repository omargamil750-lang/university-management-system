import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createCourseApi, updateCourseApi, enrollInCourseApi, unenrollFromCourseApi, getCoursesApi, getProfessorsApi } from "../api/courseApi";
import { useAuth } from "../context/AuthContext";

function CoursesPage() {
  const { token, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [message, setMessage] = useState("");
  const [msgOk, setMsgOk] = useState(true);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ code: "", title: "", type: "core", creditHours: 3, description: "", professor: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ code: "", title: "", type: "core", creditHours: 3, description: "", professor: "" });

  const notify = (msg, ok = true) => { setMessage(msg); setMsgOk(ok); setTimeout(() => setMessage(""), 4000); };

  const fetchCourses = async () => {
    try {
      const data = await getCoursesApi(token);
      setCourses(data);
    } catch (err) {
      notify(err.response?.data?.message || "Failed to load courses", false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    if (user?.role === "admin") {
      getProfessorsApi(token).then(setProfessors).catch(console.error);
    }
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCourseApi(formData, token);
      notify("Course created successfully");
      setFormData({ code: "", title: "", type: "core", creditHours: 3, description: "", professor: "" });
      fetchCourses();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to create course", false);
    }
  };

  const handleUpdate = async (courseId) => {
    try {
      await updateCourseApi(courseId, editForm, token);
      notify("Course updated successfully");
      setEditingId(null);
      fetchCourses();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to update course", false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await enrollInCourseApi(courseId, token);
      notify("Enrolled successfully");
      fetchCourses();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to enroll", false);
    }
  };

  const handleUnenroll = async (courseId) => {
    if (!window.confirm("Unenroll from this course?")) return;
    try {
      await unenrollFromCourseApi(courseId, token);
      notify("Unenrolled successfully");
      fetchCourses();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to unenroll", false);
    }
  };

  const isEnrolled = (course) => course.students?.some((s) => String(s._id) === String(user?._id));
  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ padding: 40 }}>Loading courses...</div>;

  return (
    <div style={{ padding: 40, background: "#f9fafb", minHeight: "100vh" }}>
      <div style={card}>
        <h1>Courses</h1>
        {message && (
          <p style={{ padding: "10px 16px", borderRadius: 8, background: msgOk ? "#dcfce7" : "#fee2e2", color: msgOk ? "#15803d" : "#dc2626", fontWeight: 600 }}>
            {message}
          </p>
        )}

        <input type="text" placeholder="Search by title or code..." value={search} onChange={(e) => setSearch(e.target.value)} style={input} />

        {user?.role === "admin" && (
          <form onSubmit={handleCreate} style={section}>
            <h2>Create Course</h2>
            {[["Course Code", "code"], ["Course Title", "title"], ["Description", "description"]].map(([ph, key]) => (
              key === "description"
                ? <textarea key={key} placeholder={ph} value={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} style={input} />
                : <input key={key} placeholder={ph} value={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} style={input} required={key !== "description"} />
            ))}
            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} style={input}>
              <option value="core">Core</option>
              <option value="elective">Elective</option>
            </select>
            <input type="number" placeholder="Credit Hours" value={formData.creditHours} onChange={(e) => setFormData({ ...formData, creditHours: e.target.value })} style={input} required min="1" />
            <select value={formData.professor} onChange={(e) => setFormData({ ...formData, professor: e.target.value })} style={input} required>
              <option value="">Assign Professor *</option>
              {professors.map((p) => <option key={p._id} value={p._id}>{p.name} — {p.email}</option>)}
            </select>
            <button type="submit" style={btn}>Create Course</button>
          </form>
        )}

        <div style={{ marginTop: 24 }}>
          <p style={{ color: "#6b7280", fontSize: 14 }}>{filtered.length} course(s) found</p>
          {filtered.length === 0 && <p>No courses match your search.</p>}
          {filtered.map((course) => (
            <div key={course._id} style={itemBox}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ margin: "0 0 4px 0" }}>{course.code} — {course.title}</h3>
                  <p style={{ color: "#6b7280", fontSize: 14, margin: "2px 0" }}>
                    {course.type} · {course.creditHours} credits · Professor: {course.professor?.name || "Not assigned"}
                  </p>
                  {course.description && <p style={{ fontSize: 14, color: "#374151" }}>{course.description}</p>}
                  <p style={{ fontSize: 13, color: "#6b7280" }}>{course.students?.length || 0} students enrolled</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                  <Link to={`/courses/${course._id}`} style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>Open →</Link>
                  {user?.role === "student" && (
                    isEnrolled(course)
                      ? <button onClick={() => handleUnenroll(course._id)} style={{ ...btn, background: "#fee2e2", color: "#dc2626" }}>Unenroll</button>
                      : <button onClick={() => handleEnroll(course._id)} style={btn}>Enroll</button>
                  )}
                  {user?.role === "admin" && (
                    <button onClick={() => { setEditingId(course._id); setEditForm({ code: course.code, title: course.title, type: course.type, creditHours: course.creditHours, description: course.description || "", professor: course.professor?._id || "" }); }} style={{ ...btn, background: "#f3f4f6", color: "#111827" }}>
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {editingId === course._id && user?.role === "admin" && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f3f4f6" }}>
                  <h4>Edit Course</h4>
                  {[["Course Code", "code"], ["Course Title", "title"], ["Description", "description"]].map(([ph, key]) => (
                    key === "description"
                      ? <textarea key={key} placeholder={ph} value={editForm[key]} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} style={input} />
                      : <input key={key} placeholder={ph} value={editForm[key]} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} style={input} />
                  ))}
                  <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })} style={input}>
                    <option value="core">Core</option>
                    <option value="elective">Elective</option>
                  </select>
                  <input type="number" value={editForm.creditHours} onChange={(e) => setEditForm({ ...editForm, creditHours: e.target.value })} style={input} placeholder="Credit Hours" />
                  <select value={editForm.professor} onChange={(e) => setEditForm({ ...editForm, professor: e.target.value })} style={input}>
                    <option value="">Assign Professor</option>
                    {professors.map((p) => <option key={p._id} value={p._id}>{p.name} — {p.email}</option>)}
                  </select>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleUpdate(course._id)} style={btn}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ ...btn, background: "#f3f4f6", color: "#111827" }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const card = { padding: 30, border: "1px solid #ddd", borderRadius: 14, background: "white" };
const section = { marginTop: 24, paddingTop: 20, borderTop: "1px solid #f3f4f6" };
const itemBox = { padding: 16, border: "1px solid #e5e7eb", borderRadius: 10, marginBottom: 12 };
const input = { display: "block", width: "100%", padding: "10px 12px", marginBottom: 10, borderRadius: 8, border: "1px solid #ccc", fontFamily: "inherit", boxSizing: "border-box" };
const btn = { padding: "9px 16px", border: "none", borderRadius: 8, cursor: "pointer", background: "#111827", color: "white", fontWeight: 600 };

export default CoursesPage;