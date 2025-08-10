import { create } from "zustand";
import { persist } from "zustand/middleware";

type Role = "customer" | "vendor" | "shipper";

export interface User {
  id: string;
  username: string;
  role: Role;
  name?: string;
  businessName?: string;
  distributionHub?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
      isAuthenticated: () => get().user !== null,
    }),
    {
      name: "lazada-auth",
    }
  )
);
