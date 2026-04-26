import axios from "axios";

const API = "http://localhost:5000/api/auth";

export const registerApi = async (payload) => {
  const res = await axios.post(`${API}/register`, payload);
  return res.data;
};

export const loginApi = async (payload) => {
  const res = await axios.post(`${API}/login`, payload);
  return res.data;
};

export const getMeApi = async (token) => {
  const res = await axios.get(`${API}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};