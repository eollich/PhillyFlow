"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateLocation: (location: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Verify user authentication status on mount
  useEffect(() => {
    async function checkAuth() {
      try {

        const res = await fetch("/api/auth/uinfo", {
          method: "GET",
          credentials: "include",
        });


        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
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

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });


      if (res.ok) {
        const userRes = await fetch("/api/auth/uinfo", {
          method: "GET",
          credentials: "include",
        }); if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }


  // Register function
  async function register(email: string, username: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        return { success: true };
      } else {
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
    }
  }

  async function updateLocation(location: string): Promise<boolean> {
    try {
      const res = await fetch("/api/auth/update-location", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ location }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to update location.");
        return false;
      }

      const data = await res.json();
      toast.success("Location updated successfully!");

      // Update user state with new location
      setUser((prevUser) => (prevUser ? { ...prevUser, location: data.location } : prevUser));

      return true;
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error("Network error. Please try again.");
      return false;
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateLocation }}>
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
