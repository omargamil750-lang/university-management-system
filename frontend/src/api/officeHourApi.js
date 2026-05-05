import axios from "axios";
const API = "http://localhost:5000/api/office-hours";
const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getAllOfficeHoursApi = (token) => axios.get(API, h(token)).then(r => r.data);
export const getMyOfficeHoursApi = (token) => axios.get(`${API}/my`, h(token)).then(r => r.data);
export const getStaffOfficeHoursApi = (staffId, token) => axios.get(`${API}/staff/${staffId}`, h(token)).then(r => r.data);
export const createOfficeHourApi = (data, token) => axios.post(API, data, h(token)).then(r => r.data);
export const deleteOfficeHourApi = (id, token) => axios.delete(`${API}/${id}`, h(token)).then(r => r.data);