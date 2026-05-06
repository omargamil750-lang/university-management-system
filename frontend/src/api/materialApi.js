import axios from "axios";
const API = "http://localhost:5000/api/materials";
const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getMaterialsApi = (courseId, token) => axios.get(`${API}/course/${courseId}`, h(token)).then(r => r.data);
export const uploadMaterialApi = (data, token) => axios.post(API, data, h(token)).then(r => r.data);
export const deleteMaterialApi = (id, token) => axios.delete(`${API}/${id}`, h(token)).then(r => r.data);