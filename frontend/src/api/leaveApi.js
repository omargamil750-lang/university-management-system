import axios from "axios";
const API = "http://localhost:5000/api/leave";
const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getMyLeavesApi = (token) => axios.get(`${API}/my`, h(token)).then(r => r.data);
export const getAllLeavesApi = (token) => axios.get(API, h(token)).then(r => r.data);
export const createLeaveApi = (data, token) => axios.post(API, data, h(token)).then(r => r.data);
export const reviewLeaveApi = (id, data, token) => axios.put(`${API}/${id}/review`, data, h(token)).then(r => r.data);