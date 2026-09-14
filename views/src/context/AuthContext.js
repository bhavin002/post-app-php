"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { auth } from "@/lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = auth.getUser();

    if (storedUser) {
      setUser(storedUser);
    }

    setLoading(false);
  }, []);

  const login = (data) => {
    auth.setAuth(data);
    setUser(data);
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
