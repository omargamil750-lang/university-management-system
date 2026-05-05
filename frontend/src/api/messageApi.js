import axios from "axios";

const API = "http://localhost:5000/api/messages";

const h = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getMyThreadsApi = async (token) => {
  const res = await axios.get(`${API}/threads`, h(token));
  return res.data;
};

export const getThreadMessagesApi = async (threadId, token) => {
  const res = await axios.get(`${API}/threads/${threadId}`, h(token));
  return res.data; // returns { thread, messages }
};

export const createThreadApi = async (data, token) => {
  const res = await axios.post(`${API}/threads`, data, h(token));
  return res.data; // returns { thread, firstMsg }
};

export const sendMessageApi = async (threadId, content, token) => {
  const res = await axios.post(
    `${API}/threads/${threadId}/send`,
    { content },
    h(token)
  );
  return res.data; // returns { msg }
};

export const deleteThreadApi = async (threadId, token) => {
  const res = await axios.delete(`${API}/threads/${threadId}`, h(token));
  return res.data;
};

export const getUnreadCountApi = async (token) => {
  const res = await axios.get(`${API}/unread`, h(token));
  return res.data;
};

export const getUsersForMessageApi = async (token, search = "") => {
  const res = await axios.get(`${API}/users`, {
    ...h(token),
    params: search ? { search } : {},
  });
  return res.data;
};