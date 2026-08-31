import { create } from 'zustand'

let toastId = 0
const savedTheme = localStorage.getItem('sygmebec-theme') || 'system'
const savedBrightness = Number(localStorage.getItem('sygmebec-brightness') || 100)
const resolveTheme = (theme) => theme === 'system'
  ? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  : theme

const applyTheme = (preference) => {
  const resolved = resolveTheme(preference)
  document.documentElement.classList.toggle('dark', resolved === 'dark')
  document.documentElement.dataset.theme = resolved
  return resolved
}

const applyBrightness = (value) => {
  const brightness = Math.min(120, Math.max(70, Number(value) || 100))
  document.documentElement.style.setProperty('--sygmebec-brightness', String(brightness / 100))
  return brightness
}

export const useUIStore = create((set, get) => ({
  sidebarOpen:  true,
  activeModal:  null,
  toasts:       [],
  theme: applyTheme(savedTheme),
  themePreference: savedTheme,
  brightness: applyBrightness(savedBrightness),
  language: ['fr', 'ht', 'en'].includes(localStorage.getItem('sygmebec-language'))
    ? localStorage.getItem('sygmebec-language')
    : 'fr',

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebar:    (v)  => set({ sidebarOpen: v }),
  setTheme: (theme) => {
    const preference = ['light', 'dark', 'system'].includes(theme) ? theme : 'system'
    localStorage.setItem('sygmebec-theme', preference)
    set({ theme: applyTheme(preference), themePreference: preference })
  },
  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark'
    get().setTheme(nextTheme)
  },
  setBrightness: (value) => {
    const brightness = applyBrightness(value)
    localStorage.setItem('sygmebec-brightness', String(brightness))
    set({ brightness })
  },
  setLanguage: (language) => {
    const nextLanguage = ['fr', 'ht', 'en'].includes(language) ? language : 'fr'
    localStorage.setItem('sygmebec-language', nextLanguage)
    set({ language: nextLanguage })
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
