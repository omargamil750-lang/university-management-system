import axios from "axios";
const API = "http://localhost:5000/api/rooms";
const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getRoomsApi = (token, params = {}) => axios.get(API, { ...h(token), params }).then(r => r.data);
export const getRoomByIdApi = (id, token) => axios.get(`${API}/${id}`, h(token)).then(r => r.data);
export const createRoomApi = (data, token) => axios.post(API, data, h(token)).then(r => r.data);
export const updateRoomApi = (id, data, token) => axios.put(`${API}/${id}`, data, h(token)).then(r => r.data);
export const deleteRoomApi = (id, token) => axios.delete(`${API}/${id}`, h(token)).then(r => r.data);