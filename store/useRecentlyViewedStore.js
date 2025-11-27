import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useRecentlyViewedStore = create(
  persist(
    (set) => ({
      recentlyViewed: [],
      addRecentlyViewed: (item) => {
        set((state) => {
          // Avoid duplicates by removing the existing item if it's already there
          const filteredItems = state.recentlyViewed.filter(
            (i) => i.id !== item.id
          );
          // Add the new item to the beginning of the array
          const newItems = [item, ...filteredItems];
          // Ensure the list doesn't exceed the max length
          if (newItems.length > 4) {
            newItems.length = 4;
          }
          return { recentlyViewed: newItems };
        });
      },
    }),
    {
      name: 'recently-viewed-accommodations', // unique name for localStorage
    }
  )
);

export default useRecentlyViewedStore;
