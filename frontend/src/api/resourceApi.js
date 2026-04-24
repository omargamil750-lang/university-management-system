import axios from "axios";
const API = "http://localhost:5000/api/resources";
const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getResourcesApi = (token) => axios.get(API, h(token)).then(r => r.data);
export const createResourceApi = (data, token) => axios.post(API, data, h(token)).then(r => r.data);
export const updateResourceApi = (id, data, token) => axios.put(`${API}/${id}`, data, h(token)).then(r => r.data);
export const assignResourceApi = (id, userId, token) => axios.post(`${API}/${id}/assign`, { userId }, h(token)).then(r => r.data);
export const deleteResourceApi = (id, token) => axios.delete(`${API}/${id}`, h(token)).then(r => r.data);