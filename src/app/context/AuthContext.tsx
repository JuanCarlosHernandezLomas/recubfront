"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthContextProps {
  token: string | null;
  roles: string[];
  login: (token: string, roles: string[]) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRoles = localStorage.getItem("roles");
    if (storedToken) setToken(storedToken);
    if (storedRoles) setRoles(JSON.parse(storedRoles));
  }, []);

  const login = (newToken: string, newRoles: string[]) => {
    setToken(newToken);
    setRoles(newRoles);
    localStorage.setItem("token", newToken);
    localStorage.setItem("roles", JSON.stringify(newRoles));
  };

  const logout = () => {
    setToken(null);
    setRoles([]);
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        roles,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
