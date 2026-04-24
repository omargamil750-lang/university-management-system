import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user?.name}</p>
        <p>Email: {user?.email}</p>
        <p>Role: {user?.role}</p>

        <div style={gridStyle}>
          <Link to="/courses" style={boxStyle}>Manage Courses</Link>
        </div>
      </div>
    </div>
  );
}

const pageStyle = { padding: "40px" };
const cardStyle = { padding: "30px", border: "1px solid #ddd", borderRadius: "14px", background: "white" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginTop: "24px" };
const boxStyle = { padding: "20px", border: "1px solid #ccc", borderRadius: "12px", background: "#f9fafb", textDecoration: "none", color: "#111827", fontWeight: "bold", textAlign: "center" };

export default AdminDashboard;