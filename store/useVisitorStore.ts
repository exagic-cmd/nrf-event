import { create } from "zustand";
interface VisitorState {
  userId: string | null;
  initializeVisitor: () => void;
  resetUserId: () => void;
}

const generateUserId = (): string => {
  return 'user_' + Math.random().toString(36).substring(2, 11);
};

export const useVisitorStore = create<VisitorState>()(
    (set, get) => ({
      userId: null,
      initializeVisitor: () => {
        let currentUserId = localStorage.getItem('userId');
        if (!currentUserId) {
          currentUserId = generateUserId();
          localStorage.setItem('userId', currentUserId);
        }
        set({ userId: currentUserId });
      },
      resetUserId: () => {
        localStorage.removeItem('userId');
        set({ userId: null });
      },
    })
);