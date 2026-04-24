import axios from "axios";
const API = "http://localhost:5000/api/admissions";
const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getMyApplicationApi = (token) => axios.get(`${API}/my`, h(token)).then(r => r.data);
export const getAllApplicationsApi = (token) => axios.get(API, h(token)).then(r => r.data);
export const submitApplicationApi = (data, token) => axios.post(API, data, h(token)).then(r => r.data);
export const reviewApplicationApi = (id, data, token) => axios.put(`${API}/${id}/review`, data, h(token)).then(r => r.data);