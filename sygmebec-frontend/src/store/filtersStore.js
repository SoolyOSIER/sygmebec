// ============================================
// src/store/filtersStore.js
// ============================================
import { create } from 'zustand'

export const useFiltersStore = create((set) => ({
  search: '',
  statutFiltre: '',
  fonctionFiltre: '',
  dateRange: { start: null, end: null },

  setSearch: (search) => set({ search }),
  setStatutFiltre: (statut) => set({ statutFiltre: statut }),
  setFonctionFiltre: (fonction) => set({ fonctionFiltre: fonction }),
  setDateRange: (start, end) => set({ dateRange: { start, end } }),
  resetFilters: () => set({
    search: '',
    statutFiltre: '',
    fonctionFiltre: '',
    dateRange: { start: null, end: null },
  }),
}))