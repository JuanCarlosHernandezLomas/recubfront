"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthContextProps {
  token: string | null;
  roles: string[];
  user: string | null;
  login: (token: string, roles: string[], user: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [user, setUser] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRoles = localStorage.getItem("roles");
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(storedUser);

    if (storedToken) setToken(storedToken);

    if (storedRoles) {
      try {
        const parsed = JSON.parse(storedRoles);
        if (Array.isArray(parsed)) {
          setRoles(parsed);
        } else {
          console.warn("Roles no es un array válido en localStorage. Se resetea.");
          setRoles([]);
        }
      } catch (error) {
        console.error("Error al parsear roles desde localStorage:", error);
        setRoles([]);
      }
    }
  }, []);

  const login = (newToken: string, newRoles: string[], newUser: string) => {
    setToken(newToken);
    setRoles(newRoles);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("roles", JSON.stringify(newRoles));
    localStorage.setItem("user", newUser);
  };

  const logout = () => {

  
    setToken(null);
    setRoles([]);
    setUser(null);
  
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
  
    // Establecer el tema por defecto al cerrar sesión
    localStorage.setItem("theme", "light");
    document.body.setAttribute("data-bs-theme", "light");
    localStorage.removeItem("theme");
  
    router.push("/");
  };
  return (
    <AuthContext.Provider
      value={{
        token,
        roles,
        user,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
