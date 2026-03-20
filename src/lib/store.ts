import { create } from "zustand";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_verified: boolean;
}

interface Org {
  id: string;
  name: string;
  slug: string;
  plan_tier: string;
}

interface AuthStore {
  user: User | null;
  org: Org | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, org: Org, token: string) => void;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  org: null,
  token: null,
  isAuthenticated: false,
  init: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        set({ token, isAuthenticated: true });
      }
    }
  },
  setAuth: (user, org, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
    }
    set({ user, org, token, isAuthenticated: true });
  },
  setTokens: (access, refresh) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
    }
    set({ token: access, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
    set({ user: null, org: null, token: null, isAuthenticated: false });
  },
}));
