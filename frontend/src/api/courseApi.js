import axios from "axios";
const API = "http://localhost:5000/api/courses";

export const getCoursesApi = async (token) => {
  const res = await axios.get(API, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const getMyCoursesApi = async (token) => {
  const res = await axios.get(`${API}/my-courses`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const getCourseByIdApi = async (courseId, token) => {
  const res = await axios.get(`${API}/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const createCourseApi = async (payload, token) => {
  const res = await axios.post(API, payload, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const updateCourseApi = async (courseId, payload, token) => {
  const res = await axios.put(`${API}/${courseId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const enrollInCourseApi = async (courseId, token) => {
  const res = await axios.post(`${API}/${courseId}/enroll`, {}, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const unenrollFromCourseApi = async (courseId, token) => {
  const res = await axios.post(`${API}/${courseId}/unenroll`, {}, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const getProfessorsApi = async (token) => {
  const res = await axios.get(`${API}/professors/list`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};