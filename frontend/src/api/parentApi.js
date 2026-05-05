import axios from "axios";
const API = "http://localhost:5000/api/parents";
const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getParentProfileApi = (token) => axios.get(`${API}/me`, h(token)).then(r => r.data);
export const saveParentProfileApi = (data, token) => axios.post(`${API}/me`, data, h(token)).then(r => r.data);
export const addChildApi = (studentEmail, token) => axios.post(`${API}/add-child`, { studentEmail }, h(token)).then(r => r.data);
export const getChildGradesApi = (studentId, token) => axios.get(`${API}/child/${studentId}/grades`, h(token)).then(r => r.data);
export const getChildCoursesApi = (studentId, token) => axios.get(`${API}/child/${studentId}/courses`, h(token)).then(r => r.data);