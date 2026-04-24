import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = {
  admin: [
    { label: "Dashboard",    path: "/admin" },
    { label: "Courses",      path: "/courses" },
    { label: "Rooms",        path: "/rooms" },
    { label: "Bookings",     path: "/bookings" },
    { label: "Resources",    path: "/resources" },
    { label: "Maintenance",  path: "/maintenance" },
    { label: "Staff",        path: "/staff" },
    { label: "Office Hours", path: "/office-hours" },
    { label: "Leave",        path: "/leave" },
    { label: "Payroll",      path: "/payroll" },
    { label: "Messages",     path: "/messages" },
    { label: "Events",       path: "/events" },
    { label: "Announcements",path: "/announcements" },
  ],
  professor: [
    { label: "Dashboard",    path: "/professor" },
    { label: "My Courses",   path: "/my-courses" },
    { label: "Office Hours", path: "/office-hours" },
    { label: "Rooms",        path: "/rooms" },
    { label: "Staff",        path: "/staff" },
    { label: "Leave",        path: "/leave" },
    { label: "Payroll",      path: "/payroll" },
    { label: "Messages",     path: "/messages" },
    { label: "Events",       path: "/events" },
    { label: "Announcements",path: "/announcements" },
  ],
  ta: [
    { label: "Dashboard",    path: "/ta" },
    { label: "Office Hours", path: "/office-hours" },
    { label: "Staff",        path: "/staff" },
    { label: "Messages",     path: "/messages" },
    { label: "Events",       path: "/events" },
    { label: "Announcements",path: "/announcements" },
    { label: "Leave",        path: "/leave" },
  ],
  student: [
    { label: "Dashboard",    path: "/student" },
    { label: "Courses",      path: "/courses" },
    { label: "Grades",       path: "/grades" },
    { label: "Submissions",  path: "/my-submissions" },
    { label: "Transcript",   path: "/transcript" },
    { label: "Rooms",        path: "/rooms" },
    { label: "Staff",        path: "/staff" },
    { label: "Office Hours", path: "/office-hours" },
    { label: "Messages",     path: "/messages" },
    { label: "Events",       path: "/events" },
    { label: "Announcements",path: "/announcements" },
  ],
};

const ROLE_COLORS = {
  admin: "#dc2626",
  professor: "#2563eb",
  student: "#16a34a",
  ta: "#9333ea",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate("/login"); };
  const items = user ? (NAV[user.role] || []) : [];
  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <nav style={navStyle}>
      <div style={leftStyle}>
        <Link to="/" style={logoStyle}>🎓 UMS</Link>
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...linkStyle,
              color: isActive(item.path) ? "#60a5fa" : "white",
              borderBottom: isActive(item.path)
                ? "2px solid #60a5fa"
                : "2px solid transparent",
            }}
          >
            {item.label}
          </Link>
        ))}
        {!user && (
          <>
            <Link to="/register" style={linkStyle}>Register</Link>
            <Link to="/login"    style={linkStyle}>Login</Link>
          </>
        )}
      </div>

      {user && (
        <div style={rightStyle}>
          <div style={userChip}>
            <div style={{
              ...roleCircle,
              background: (ROLE_COLORS[user.role] || "#6b7280") + "30",
              color: ROLE_COLORS[user.role] || "#6b7280",
            }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "white", lineHeight: 1.2 }}>
                {user.name}
              </p>
              <p style={{ margin: 0, fontSize: 10, color: ROLE_COLORS[user.role] || "#9ca3af", fontWeight: 600, textTransform: "capitalize" }}>
                {user.role}
              </p>
            </div>
          </div>
          <button onClick={handleLogout} style={logoutBtn}>Logout</button>
        </div>
      )}
    </nav>
  );
}

const navStyle = {
  background: "#0f172a",
  padding: "0 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  position: "sticky",
  top: 0,
  zIndex: 200,
  boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
  height: 54,
  overflowX: "auto",
  gap: 12,
};
const leftStyle  = { display: "flex", gap: 2, alignItems: "center", flexShrink: 0 };
const rightStyle = { display: "flex", gap: 10, alignItems: "center", flexShrink: 0, marginLeft: 12 };
const logoStyle  = { color: "white", textDecoration: "none", fontWeight: 900, fontSize: 17, marginRight: 10, whiteSpace: "nowrap", letterSpacing: "-0.5px" };
const linkStyle  = {
  color: "white",
  textDecoration: "none",
  fontWeight: 500,
  fontSize: 12.5,
  padding: "16px 8px",
  whiteSpace: "nowrap",
  borderBottom: "2px solid transparent",
  transition: "color 0.15s",
};
const userChip  = { display: "flex", gap: 8, alignItems: "center", background: "#1e293b", borderRadius: 8, padding: "5px 10px" };
const roleCircle = { width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 };
const logoutBtn = { padding: "6px 14px", border: "none", borderRadius: 8, cursor: "pointer", background: "#374151", color: "white", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap" };