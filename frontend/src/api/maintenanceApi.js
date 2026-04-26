import axios from "axios";
const API = "http://localhost:5000/api/maintenance";
const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getRequestsApi = (token) => axios.get(API, h(token)).then(r => r.data);
export const getMyRequestsApi = (token) => axios.get(`${API}/my`, h(token)).then(r => r.data);
export const createRequestApi = (data, token) => axios.post(API, data, h(token)).then(r => r.data);
export const updateStatusApi = (id, status, token) => axios.put(`${API}/${id}/status`, { status }, h(token)).then(r => r.data);