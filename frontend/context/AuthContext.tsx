"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Verify user authentication status on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        console.log("Client-Side Cookies:", document.cookie); // ✅ Debugging

        const res = await fetch("/api/auth/uinfo", {
          method: "GET",
          credentials: "include", // ✅ Ensures client sends cookies
        });

        console.log("Auth Verify Response Status:", res.status);
        console.log("Auth Verify Response Headers:", [...res.headers.entries()]);

        if (res.ok) {
          const data = await res.json();
          console.log("User Data from /api/auth/verify:", data);
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth Verify Error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  // Login function
  async function login(email: string, password: string): Promise<boolean> {
    try {
      console.log("🔹 [Browser] Current Cookies BEFORE login:", document.cookie); // ✅ Log before request

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",  // ✅ Ensures cookies are sent and received
        body: JSON.stringify({ email, password }),
      });

      console.log("🔹 [Browser] Login Response Status:", res.status);
      console.log("🔹 [Browser] Login Response Headers:", [...res.headers.entries()]);

      if (res.ok) {
        const userRes = await fetch("/api/auth/uinfo", {
          method: "GET",
          credentials: "include",
        }); if (userRes.ok) {
          const userData = await userRes.json();
          console.log("🔹 User Data from /api/auth/uinfo:", userData);
          setUser(userData); // ✅ Set the full user info
          return true;
        } else {
          console.error("🔴 Failed to fetch user info after login.");
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.error("🔴 [Browser] Login Error:", error);
      return false;
    }
  }


  // Register function
  async function register(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        return { success: true };
      } else {
        console.log(data);
        return { success: false, error: data.message || "Registration failed" };
      }
    } catch (error) {
      return { success: false, error: "Network error, please try again." };
    }
  }

  // Logout function
  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easy access to AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
