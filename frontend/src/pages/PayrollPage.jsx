import { useEffect, useState } from "react";
import { getMyPayrollApi, getAllPayrollApi, createPayrollApi, markPaidApi } from "../api/payrollApi";
import { useAuth } from "../context/AuthContext";

export default function PayrollPage() {
  const { token, user } = useAuth();
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [form, setForm] = useState({ staff: "", month: "", baseSalary: "", bonus: 0, deductions: 0, notes: "" });
  const [staffList, setStaffList] = useState([]);

  const notify = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text: "", ok: true }), 4000); };

  const load = async () => {
    try {
      const data = user?.role === "admin" ? await getAllPayrollApi(token) : await getMyPayrollApi(token);
      setRecords(data);
      if (user?.role === "admin") {
        const { getAllStaffApi } = await import("../api/staffApi");
        const s = await getAllStaffApi(token);
        setStaffList(s);
      }
    } catch { notify("Failed", false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await createPayrollApi(form, token); notify("Payroll record created!"); setShowForm(false); load(); }
    catch (err) { notify(err.response?.data?.message || "Failed", false); }
  };

  const handlePay = async (id) => {
    try { await markPaidApi(id, token); notify("Marked as paid!"); load(); }
    catch { notify("Failed", false); }
  };

  const totalNet = records.filter(r => r.status === "paid").reduce((s, r) => s + r.netSalary, 0);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>💰 Payroll</h1>
          <p style={styles.sub}>{user?.role === "admin" ? "Manage staff payroll" : "Your payroll records"}</p>
        </div>
        {user?.role === "admin" && (
          <button onClick={() => setShowForm(!showForm)} style={styles.btn}>{showForm ? "✕ Cancel" : "+ Add Record"}</button>
        )}
      </div>

      {msg.text && <div style={{ ...styles.toast, background: msg.ok ? "#dcfce7" : "#fee2e2", color: msg.ok ? "#166534" : "#dc2626" }}>{msg.text}</div>}

      {user?.role === "admin" && (
        <div style={{ ...styles.statCard, marginBottom: 24 }}>
          <div style={styles.stat}><div style={styles.statVal}>{records.length}</div><div style={styles.statLabel}>Total Records</div></div>
          <div style={styles.stat}><div style={styles.statVal}>{records.filter(r => r.status === "pending").length}</div><div style={styles.statLabel}>Pending</div></div>
          <div style={styles.stat}><div style={{ ...styles.statVal, color: "#166534" }}>EGP {totalNet.toLocaleString()}</div><div style={styles.statLabel}>Total Paid</div></div>
        </div>
      )}

      {showForm && (
        <div style={styles.card}>
          <h2>New Payroll Record</h2>
          <form onSubmit={handleCreate}>
            <div style={styles.grid3}>
              <div><label style={styles.label}>Staff Member *</label>
                <select value={form.staff} onChange={e => setForm({ ...form, staff: e.target.value })} style={styles.input} required>
                  <option value="">Select staff...</option>
                  {staffList.map(s => <option key={s.user?._id} value={s.user?._id}>{s.user?.name} – {s.title || s.user?.role}</option>)}
                </select>
              </div>
              <div><label style={styles.label}>Month (YYYY-MM) *</label><input value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} style={styles.input} placeholder="2025-01" required /></div>
              <div><label style={styles.label}>Base Salary (EGP) *</label><input type="number" value={form.baseSalary} onChange={e => setForm({ ...form, baseSalary: e.target.value })} style={styles.input} required /></div>
              <div><label style={styles.label}>Bonus</label><input type="number" value={form.bonus} onChange={e => setForm({ ...form, bonus: e.target.value })} style={styles.input} /></div>
              <div><label style={styles.label}>Deductions</label><input type="number" value={form.deductions} onChange={e => setForm({ ...form, deductions: e.target.value })} style={styles.input} /></div>
              <div><label style={styles.label}>Net = Base + Bonus − Deductions</label>
                <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "11px 12px", fontSize: 15, fontWeight: 700, color: "#166534" }}>
                  EGP {(Number(form.baseSalary || 0) + Number(form.bonus || 0) - Number(form.deductions || 0)).toLocaleString()}
                </div>
              </div>
            </div>
            <label style={styles.label}>Notes</label>
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={styles.input} />
            <button type="submit" style={styles.btn}>Create Record</button>
          </form>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {records.length === 0 && <p style={{ color: "#6b7280" }}>No payroll records found.</p>}
        {records.map(r => (
          <div key={r._id} style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                {user?.role === "admin" && <p style={{ fontWeight: 700, fontSize: 16, margin: "0 0 4px" }}>{r.staff?.name}</p>}
                <p style={{ color: "#6b7280", fontSize: 14, margin: "2px 0" }}>📅 Period: <strong>{r.month}</strong></p>
                <div style={{ display: "flex", gap: 16, fontSize: 14, color: "#374151", marginTop: 6 }}>
                  <span>Base: EGP {r.baseSalary?.toLocaleString()}</span>
                  {r.bonus > 0 && <span style={{ color: "#166534" }}>+Bonus: EGP {r.bonus?.toLocaleString()}</span>}
                  {r.deductions > 0 && <span style={{ color: "#dc2626" }}>-Deduct: EGP {r.deductions?.toLocaleString()}</span>}
                </div>
                {r.notes && <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>📝 {r.notes}</p>}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>EGP {r.netSalary?.toLocaleString()}</div>
                <span style={{ background: r.status === "paid" ? "#dcfce7" : "#fef9c3", color: r.status === "paid" ? "#166534" : "#a16207", padding: "4px 12px", borderRadius: 12, fontSize: 13, fontWeight: 600, display: "block", marginTop: 4 }}>
                  {r.status}
                </span>
                {user?.role === "admin" && r.status === "pending" && (
                  <button onClick={() => handlePay(r._id)} style={{ ...styles.sBtn, marginTop: 6 }}>Mark Paid</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 40, background: "#f9fafb", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 800, margin: 0 },
  sub: { color: "#6b7280", marginTop: 4 },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 20 },
  statCard: { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 20, display: "flex", gap: 40 },
  stat: { textAlign: "center" },
  statVal: { fontSize: 26, fontWeight: 800, color: "#111827" },
  statLabel: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 12 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontFamily: "inherit", fontSize: 14, boxSizing: "border-box", marginBottom: 10 },
  btn: { padding: "10px 20px", background: "#111827", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 },
  sBtn: { padding: "7px 14px", background: "#111827", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13 },
  toast: { padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontWeight: 600 },
};