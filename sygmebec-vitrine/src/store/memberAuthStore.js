import { create } from 'zustand'

export const useMemberAuthStore = create((set) => ({
  accessToken: null,
  user: null,
  ready: false,
  setSession: (user, accessToken) => set({ user, accessToken, ready: true }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setReady: () => set({ ready: true }),
  clearSession: () => set({ accessToken: null, user: null, ready: true }),
}))
