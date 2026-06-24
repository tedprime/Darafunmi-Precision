import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

interface User {
  id: number | string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getStoredUser(): User | null {
  try {
    const raw = Cookies.get("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function isTokenValid(): boolean {
  const token = Cookies.get("token");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // exp is in seconds; Date.now() is in ms
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    // Malformed token — treat as invalid
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(getStoredUser);

  const logout = useCallback(() => {
    Cookies.remove("token");
    Cookies.remove("user");
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  // Listen for 401 events fired by apiFetch
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener("auth:session-expired", handler);
    return () => window.removeEventListener("auth:session-expired", handler);
  }, [logout]);

  const value: AuthContextType = {
    user,
    isAuthenticated: isTokenValid() && !!user,
    setUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
