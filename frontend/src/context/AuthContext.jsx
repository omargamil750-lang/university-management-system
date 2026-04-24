import { createContext, useContext, useEffect, useState } from "react";
import { getMeApi, loginApi, registerApi } from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);

  const normalizeUser = (u) => {
    if (!u) return null;
    return { ...u, _id: u._id || u.id, id: u._id || u.id };
  };

  const saveAuth = (tokenValue, userValue) => {
    localStorage.setItem("token", tokenValue);
    setToken(tokenValue);
    setUser(normalizeUser(userValue));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  };

  const login = async (payload) => {
    const data = await loginApi(payload);
    saveAuth(data.token, data.user);
    return data;
  };

  const register = async (payload) => {
    const data = await registerApi(payload);
    saveAuth(data.token, data.user);
    return data;
  };

  useEffect(() => {
    const fetchMe = async () => {
      try {
        if (!token) { setLoading(false); return; }
        const me = await getMeApi(token);
        setUser(normalizeUser(me));
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);