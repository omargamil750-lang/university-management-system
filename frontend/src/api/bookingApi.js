import axios from "axios";
const API = "http://localhost:5000/api/bookings";
const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getMyBookingsApi = (token) => axios.get(`${API}/my`, h(token)).then(r => r.data);
export const getAllBookingsApi = (token) => axios.get(API, h(token)).then(r => r.data);
export const getBookingsByRoomApi = (roomId, token) => axios.get(`${API}/room/${roomId}`, h(token)).then(r => r.data);
export const createBookingApi = (data, token) => axios.post(API, data, h(token)).then(r => r.data);
export const updateBookingStatusApi = (id, status, token) => axios.put(`${API}/${id}/status`, { status }, h(token)).then(r => r.data);
export const cancelBookingApi = (id, token) => axios.put(`${API}/${id}/cancel`, {}, h(token)).then(r => r.data);