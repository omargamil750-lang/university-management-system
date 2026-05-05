import { useEffect, useState } from "react";
import { getParentProfileApi, saveParentProfileApi, addChildApi, getChildGradesApi, getChildCoursesApi } from "../api/parentApi";
import { useAuth } from "../context/AuthContext";

export default function ParentPortalPage() {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childGrades, setChildGrades] = useState([]);
  const [childCourses, setChildCourses] = useState([]);
  const [childEmail, setChildEmail] = useState("");
  const [activeTab, setActiveTab] = useState("grades");
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [profileForm, setProfileForm] = useState({ phone: "", address: "", relationship: "guardian" });
  const [editProfile, setEditProfile] = useState(false);

  const notify = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text: "", ok: true }), 4000); };

  const load = async () => {
    try {
      const p = await getParentProfileApi(token);
      setProfile(p);
      if (p?.phone) setProfileForm({ phone: p.phone, address: p.address, relationship: p.relationship });
    } catch { notify("Failed to load", false); }
  };

  useEffect(() => { load(); }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try { await saveParentProfileApi(profileForm, token); notify("Profile saved!"); setEditProfile(false); load(); }
    catch { notify("Failed", false); }
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    try { await addChildApi(childEmail, token); notify("Child linked!"); setChildEmail(""); load(); }
    catch (err) { notify(err.response?.data?.message || "Student not found", false); }
  };

  const handleSelectChild = async (child) => {
    setSelectedChild(child);
    try {
      const [grades, courses] = await Promise.all([
        getChildGradesApi(child._id, token),
        getChildCoursesApi(child._id, token),
      ]);
      setChildGrades(grades);
      setChildCourses(courses);
    } catch { notify("Failed to load child data", false); }
  };

  const average = childGrades.length > 0 ? (childGrades.reduce((s, g) => s + g.grade, 0) / childGrades.length).toFixed(1) : null;
  const getColor = (g) => g >= 90 ? "#166534" : g >= 75 ? "#1d4ed8" : g >= 60 ? "#a16207" : "#dc2626";
  const getLetter = (g) => g >= 90 ? "A" : g >= 80 ? "B" : g >= 70 ? "C" : g >= 60 ? "D" : "F";

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>👪 Parent Portal</h1>
          <p style={styles.sub}>Monitor your child's academic progress</p>
        </div>
        <button onClick={() => setEditProfile(!editProfile)} style={styles.btn}>{editProfile ? "✕ Cancel" : "✏️ Edit Profile"}</button>
      </div>

      {msg.text && <div style={{ ...styles.toast, background: msg.ok ? "#dcfce7" : "#fee2e2", color: msg.ok ? "#166534" : "#dc2626" }}>{msg.text}</div>}

      {editProfile && (
        <div style={styles.card}>
          <h2>My Profile</h2>
          <form onSubmit={handleSaveProfile}>
            <div style={styles.grid3}>
              <div><label style={styles.label}>Phone</label><input value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} style={styles.input} /></div>
              <div><label style={styles.label}>Address</label><input value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} style={styles.input} /></div>
              <div><label style={styles.label}>Relationship</label>
                <select value={profileForm.relationship} onChange={e => setProfileForm({ ...profileForm, relationship: e.target.value })} style={styles.input}>
                  {["father","mother","guardian"].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" style={styles.btn}>Save</button>
          </form>
        </div>
      )}

      <div style={styles.grid2}>
        <div style={styles.card}>
          <h2>My Children</h2>
          <form onSubmit={handleAddChild} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input value={childEmail} onChange={e => setChildEmail(e.target.value)} placeholder="Student email address..." style={{ ...styles.input, flex: 1, marginBottom: 0 }} />
            <button type="submit" style={styles.btn}>Link</button>
          </form>
          {!profile?.children?.length && <p style={{ color: "#6b7280", fontSize: 14 }}>No children linked yet. Enter a student's email to link them.</p>}
          {profile?.children?.map(child => (
            <div key={child._id} onClick={() => handleSelectChild(child)}
              style={{ ...styles.childCard, ...(selectedChild?._id === child._id ? styles.childCardActive : {}) }}>
              <div style={styles.childAvatar}>{child.name?.[0]}</div>
              <div>
                <p style={{ margin: 0, fontWeight: 700 }}>{child.name}</p>
                <p style={{ margin: 0, fontSize: 13, color: selectedChild?._id === child._id ? "#bfdbfe" : "#6b7280" }}>{child.email}</p>
              </div>
            </div>
          ))}
        </div>

        {selectedChild && (
          <div style={styles.card}>
            <h2>{selectedChild.name}'s Overview</h2>
            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
              <div style={{ background: "#dbeafe", borderRadius: 10, padding: "12px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#1d4ed8" }}>{average || "—"}</div>
                <div style={{ fontSize: 12, color: "#1d4ed8" }}>Average</div>
              </div>
              <div style={{ background: "#dcfce7", borderRadius: 10, padding: "12px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#166534" }}>{childCourses.length}</div>
                <div style={{ fontSize: 12, color: "#166534" }}>Courses</div>
              </div>
              <div style={{ background: "#fef9c3", borderRadius: 10, padding: "12px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#a16207" }}>{childGrades.length}</div>
                <div style={{ fontSize: 12, color: "#a16207" }}>Grades</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {["grades","courses"].map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  style={{ ...styles.tabBtn, ...(activeTab === t ? styles.tabActive : {}) }}>{t === "grades" ? "📊 Grades" : "📚 Courses"}</button>
              ))}
            </div>

            {activeTab === "grades" && (
              <div>
                {childGrades.length === 0 && <p style={{ color: "#6b7280" }}>No grades yet.</p>}
                {childGrades.map(g => (
                  <div key={g._id} style={styles.gradeRow}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{g.assignment?.title}</p>
                      <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>{g.course?.code} — {g.course?.title}</p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: getColor(g.grade) }}>{g.grade}</div>
                      <span style={{ background: getColor(g.grade), color: "white", borderRadius: 4, padding: "1px 7px", fontSize: 12, fontWeight: 700 }}>{getLetter(g.grade)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "courses" && (
              <div>
                {childCourses.length === 0 && <p style={{ color: "#6b7280" }}>Not enrolled in any courses yet.</p>}
                {childCourses.map(c => (
                  <div key={c._id} style={styles.courseRow}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600 }}>{c.code} — {c.title}</p>
                      <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>{c.type} · {c.creditHours} credits · Prof. {c.professor?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 40, background: "#f9fafb", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 800, margin: 0 },
  sub: { color: "#6b7280", marginTop: 4 },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24, marginBottom: 20 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 12 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontFamily: "inherit", fontSize: 14, boxSizing: "border-box", marginBottom: 10 },
  btn: { padding: "10px 20px", background: "#111827", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" },
  toast: { padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontWeight: 600 },
  childCard: { display: "flex", gap: 12, alignItems: "center", padding: "12px", border: "1px solid #e5e7eb", borderRadius: 10, cursor: "pointer", marginBottom: 8 },
  childCardActive: { background: "#1d4ed8", color: "white", border: "1px solid #1d4ed8" },
  childAvatar: { width: 40, height: 40, background: "#dbeafe", color: "#1d4ed8", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 },
  tabBtn: { padding: "7px 16px", border: "1px solid #e5e7eb", borderRadius: 20, background: "white", cursor: "pointer", fontSize: 13, fontWeight: 500 },
  tabActive: { background: "#111827", color: "white", border: "1px solid #111827" },
  gradeRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f3f4f6" },
  courseRow: { padding: "10px 0", borderBottom: "1px solid #f3f4f6" },
};