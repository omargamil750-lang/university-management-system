import axios from "axios";
const API = "http://localhost:5000/api/staff";
const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getAllStaffApi = (token) => axios.get(API, h(token)).then(r => r.data);
export const getStaffByIdApi = (userId, token) => axios.get(`${API}/${userId}`, h(token)).then(r => r.data);
export const getMyStaffProfileApi = (token) => axios.get(`${API}/me`, h(token)).then(r => r.data);
export const saveStaffProfileApi = (data, token) => axios.post(API, data, h(token)).then(r => r.data);