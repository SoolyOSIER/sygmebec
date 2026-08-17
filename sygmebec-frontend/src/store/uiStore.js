import { create } from 'zustand'

let toastId = 0

export const useUIStore = create((set, get) => ({
  sidebarOpen:  true,
  activeModal:  null,
  toasts:       [],
  theme: localStorage.getItem('sygmebec-theme') || 'light',
  language: localStorage.getItem('sygmebec-language') || 'fr',

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebar:    (v)  => set({ sidebarOpen: v }),
  setTheme: (theme) => {
    localStorage.setItem('sygmebec-theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
    set({ theme })
  },
  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark'
    get().setTheme(nextTheme)
  },
  setLanguage: (language) => {
    localStorage.setItem('sygmebec-language', language)
    set({ language })
  },

  openModal:  (name) => set({ activeModal: name }),
  closeModal: ()     => set({ activeModal: null }),

  addToast: (message, type = 'info', duration = 4000) => {
    const id = ++toastId
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => get().removeToast(id), duration)
    return id
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  toast: {
    success: (msg) => useUIStore.getState().addToast(msg, 'success'),
    error:   (msg) => useUIStore.getState().addToast(msg, 'error'),
    info:    (msg) => useUIStore.getState().addToast(msg, 'info'),
    warning: (msg) => useUIStore.getState().addToast(msg, 'warning'),
  },
}))

export const toast = {
  success: (msg) => useUIStore.getState().addToast(msg, 'success'),
  error:   (msg) => useUIStore.getState().addToast(msg, 'error'),
  info:    (msg) => useUIStore.getState().addToast(msg, 'info'),
  warning: (msg) => useUIStore.getState().addToast(msg, 'warning'),
}
