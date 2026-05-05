import axios from "axios";
const API = "http://localhost:5000/api/payroll";
const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getMyPayrollApi = (token) => axios.get(`${API}/my`, h(token)).then(r => r.data);
export const getAllPayrollApi = (token) => axios.get(API, h(token)).then(r => r.data);
export const createPayrollApi = (data, token) => axios.post(API, data, h(token)).then(r => r.data);
export const markPaidApi = (id, token) => axios.put(`${API}/${id}/pay`, {}, h(token)).then(r => r.data);