import { createContext, useContext, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { AuthUser } from "@/lib/types";

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem("taskflow_token");
    const userData = localStorage.getItem("taskflow_user");
    if (token && userData) {
      return { ...JSON.parse(userData), token };
    }
    return null;
  });

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthUser>("/api/auth/login", { email, password });
    const authUser = res.data;
    localStorage.setItem("taskflow_token", authUser.token);
    localStorage.setItem("taskflow_user", JSON.stringify({ fullName: authUser.fullName, email: authUser.email, userId: authUser.userId }));
    setUser(authUser);
  };

  const register = async (fullName: string, email: string, password: string) => {
    await api.post("/api/auth/register", { fullName, email, password });
  };

  const logout = () => {
    localStorage.removeItem("taskflow_token");
    localStorage.removeItem("taskflow_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
