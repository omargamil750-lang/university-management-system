import axios from "axios";
const API = "http://localhost:5000/api/grades";

export const gradeSubmissionApi = async (payload, token) => {
  const res = await axios.post(API, payload, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const getStudentGradesApi = async (studentId, token) => {
  const res = await axios.get(`${API}/student/${studentId}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const getGradesByCourseApi = async (courseId, token) => {
  const res = await axios.get(`${API}/course/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};