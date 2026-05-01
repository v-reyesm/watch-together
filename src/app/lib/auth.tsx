"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  name: string;
  avatarUrl: string | null;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "wt_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async (accessToken: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        return (await res.json()) as User;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem(TOKEN_KEY);
    if (stored) {
      setToken(stored);
      fetchUser(stored).then((u) => {
        if (u) {
          setUser(u);
        } else {
          sessionStorage.removeItem(TOKEN_KEY);
          setToken(null);
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [fetchUser]);

  const signIn = useCallback(
    async (accessToken: string) => {
      sessionStorage.setItem(TOKEN_KEY, accessToken);
      setToken(accessToken);
      const u = await fetchUser(accessToken);
      setUser(u);
    },
    [fetchUser],
  );

  const signOut = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    router.replace("/sign-in");
  }, [router]);

  const value = useMemo(
    () => ({ user, token, isLoading, signIn, signOut }),
    [user, token, isLoading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
