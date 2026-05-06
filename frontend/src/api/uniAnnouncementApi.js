import axios from "axios";
const API = "http://localhost:5000/api/uni-announcements";
const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getAnnouncementsApi = (token, audience = "") =>
  axios.get(API, { ...h(token), params: audience ? { audience } : {} }).then(r => r.data);
export const createAnnouncementApi = (data, token) => axios.post(API, data, h(token)).then(r => r.data);
export const updateAnnouncementApi = (id, data, token) => axios.put(`${API}/${id}`, data, h(token)).then(r => r.data);
export const deleteAnnouncementApi = (id, token) => axios.delete(`${API}/${id}`, h(token)).then(r => r.data);