import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(formData);
      setMessage("Login successful");

      if (data.user.role === "student") navigate("/student");
      else if (data.user.role === "professor") navigate("/professor");
      else if (data.user.role === "admin") navigate("/admin");
      else navigate("/dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>Login</button>
        </form>
        {message && <p style={{ marginTop: "12px" }}>{message}</p>}
      </div>
    </div>
  );
}

const pageStyle = {
  padding: "40px",
  display: "flex",
  justifyContent: "center",
};

const cardStyle = {
  width: "100%",
  maxWidth: "500px",
  padding: "30px",
  border: "1px solid #ddd",
  borderRadius: "14px",
  background: "white",
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  padding: "10px 18px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

export default LoginPage;