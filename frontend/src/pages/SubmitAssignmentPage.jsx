import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { submitAssignmentApi } from "../api/submissionApi";
import { useAuth } from "../context/AuthContext";

function SubmitAssignmentPage() {
  const { token } = useAuth();
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [msgOk, setMsgOk] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) { setMessage("Content cannot be empty"); setMsgOk(false); return; }
    setSubmitting(true);
    try {
      await submitAssignmentApi({ assignment: assignmentId, content }, token);
      setMessage("Assignment submitted successfully! Redirecting...");
      setMsgOk(true);
      // FIX: go back instead of generic /courses
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Submission failed");
      setMsgOk(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 40, background: "#f9fafb", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <div style={card}>
        <h1>Submit Assignment</h1>
        {message && (
          <p style={{ padding: "10px 16px", borderRadius: 8, background: msgOk ? "#dcfce7" : "#fee2e2", color: msgOk ? "#15803d" : "#dc2626", fontWeight: 600 }}>
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Write your submission here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={textarea}
            required
          />
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" style={btn} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </button>
            <button type="button" onClick={() => navigate(-1)} style={{ ...btn, background: "#f3f4f6", color: "#111827" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const card = { width: "100%", maxWidth: 600, padding: 30, border: "1px solid #ddd", borderRadius: 14, background: "white" };
const textarea = { display: "block", width: "100%", minHeight: 200, padding: 12, marginBottom: 14, borderRadius: 8, border: "1px solid #ccc", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" };
const btn = { padding: "10px 20px", border: "none", borderRadius: 8, cursor: "pointer", background: "#111827", color: "white", fontWeight: 600 };

export default SubmitAssignmentPage;