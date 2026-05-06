import axios from "axios";
const API = "http://localhost:5000/api/performance";
const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getMyPerformanceApi = (token) => axios.get(`${API}/my`, h(token)).then(r => r.data);
export const getAllPerformanceApi = (token) => axios.get(API, h(token)).then(r => r.data);
export const createReviewApi = (data, token) => axios.post(API, data, h(token)).then(r => r.data);