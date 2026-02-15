import { useState, useCallback } from "react";
import { UserProfile } from "@/types/chat";
import { mockUser } from "@/lib/mock-data";

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);

  const login = useCallback((email: string, _password: string) => {
    // Mock login — replace with real API call
    setUser({ ...mockUser, email });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return { user, login, logout, isAuthenticated: !!user };
}
