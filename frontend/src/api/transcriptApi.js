import axios from "axios";
const API = "http://localhost:5000/api/transcripts";
const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getMyRequestsApi = (token) => axios.get(`${API}/my`, h(token)).then(r => r.data);
export const getAllRequestsApi = (token) => axios.get(API, h(token)).then(r => r.data);
export const createRequestApi = (data, token) => axios.post(API, data, h(token)).then(r => r.data);
export const updateStatusApi = (id, data, token) => axios.put(`${API}/${id}/status`, data, h(token)).then(r => r.data);
export const generateTranscriptApi = (studentId, token) => axios.get(`${API}/generate/${studentId}`, h(token)).then(r => r.data);