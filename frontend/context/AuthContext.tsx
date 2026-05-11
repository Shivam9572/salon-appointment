"use client";
import React, { createContext, useContext, useState } from "react";
import { apiFetch } from "../lib/api";

type Role = "admin" | "provider" | "customer";

type AuthState = {
  user: any | null;
  role: Role | null;
  login: (role: Role, payload: any) => Promise<any>;
  register: (role: Role, payload: any) => Promise<any>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  async function login(r: Role, payload: any) {
    const res = await apiFetch(`/auth/${r}/login`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setUser(res?.user || res);
    setRole(r);
    return res;
  }

  async function register(r: Role, payload: any) {
    const res = await apiFetch(`/auth/${r}/register`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setUser(res?.user || res);
    setRole(r);
    return res;
  }

  function logout() {
    setUser(null);
    setRole(null);
  }

  return (
    <AuthContext.Provider value={{ user, role, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthContext;
