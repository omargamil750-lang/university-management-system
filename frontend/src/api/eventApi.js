import axios from "axios";
const API = "http://localhost:5000/api/events";
const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getEventsApi = (token, type = "") => axios.get(API, { ...h(token), params: type ? { type } : {} }).then(r => r.data);
export const getEventByIdApi = (id, token) => axios.get(`${API}/${id}`, h(token)).then(r => r.data);
export const createEventApi = (data, token) => axios.post(API, data, h(token)).then(r => r.data);
export const updateEventApi = (id, data, token) => axios.put(`${API}/${id}`, data, h(token)).then(r => r.data);
export const deleteEventApi = (id, token) => axios.delete(`${API}/${id}`, h(token)).then(r => r.data);
export const rsvpEventApi = (id, token) => axios.post(`${API}/${id}/rsvp`, {}, h(token)).then(r => r.data);