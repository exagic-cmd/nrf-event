import { create } from "zustand";

export const useDrawerStore = create((set) => ({
  isOpen: false,
  drawerContent: null,
  justAdded: false, // ✅ add this
  openDrawer: () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false, drawerContent: null }),
  setDrawerContent: (content) => set({ drawerContent: content }),
  setJustAdded: (val) => set({ justAdded: val }), // ✅ add this
}));