import axios from "axios";
const API = "http://localhost:5000/api/submissions";

export const submitAssignmentApi = async (payload, token) => {
  const res = await axios.post(API, payload, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const getSubmissionsByStudentApi = async (studentId, token) => {
  const res = await axios.get(`${API}/student/${studentId}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const getProfessorSubmissionsApi = async (courseId, token) => {
  const res = await axios.get(`${API}/professor?courseId=${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};