import axios from "axios";
const API = "http://localhost:5000/api/ta";
const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getAllTAsApi = (token) => axios.get(API, h(token)).then(r => r.data);
export const getTAProfileApi = (id, token) => axios.get(`${API}/${id}`, h(token)).then(r => r.data);
export const getTACoursesApi = (token) => axios.get(`${API}/my-courses`, h(token)).then(r => r.data);
export const getTASubmissionsApi = (courseId, token) => axios.get(`${API}/submissions?courseId=${courseId}`, h(token)).then(r => r.data);
export const assignTAApi = (courseId, taId, token) => axios.post(`${API}/assign`, { courseId, taId }, h(token)).then(r => r.data);
export const removeTAApi = (courseId, taId, token) => axios.post(`${API}/remove`, { courseId, taId }, h(token)).then(r => r.data);