// store/useCartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useOrderStore } from "./useOrderStore";

// Utility: slugify strings
const slug = (s: string | undefined | null): string =>
  String(s || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 64);

// Type guards
const isTransferItem = (item: any): boolean =>
  !!(item?.vehicle || item?.vehicle_id || item?.vehicle_name);

const isUpsellItem = (item: any): boolean => item?.type === "upsell";

const isAccommodationItem = (item: any): boolean => item?.type === "accommodation";

// Build base key for duplicate detection
const buildBaseKey = (item: any): string => {
  if (isUpsellItem(item)) {
    return `upsell:${item.id}`;
  }

  if (isAccommodationItem(item)) {
    const hotelId = item.tourId || item.hotelId || "";
    const roomType = item.roomType || "";
    const mealType = item.mealType || "";
    const checkIn = item.checkIn || "";
    const checkOut = item.checkOut || "";
    const guests = item.guests || "";
    return `accommodation:${hotelId}:${slug(roomType)}:${slug(mealType)}:${checkIn}:${checkOut}:${guests}`;
  }

  if (isTransferItem(item)) {
    const v = item.vehicle || {};
    const vehicleId = v.vehicle_id ?? item.vehicle_id ?? "";
    const vehicleName = v.name ?? v.vehicle_name ?? item.vehicle_name ?? "";
    return `transfer:${vehicleId}:${slug(vehicleName)}`;
  }

  // Default: Day Tour
  const tourId = item.tourId ?? "";
  const date = item.selectedDate ?? "";
  const time = item.selectedTime ?? "";
  const pax = item.totalPax ?? "";
  return `daytour:${tourId}:${date}:${time}:${pax}`;
};

// Generate unique key
const buildUniqueKey = (baseKey: string): string => {
  return `${baseKey}#${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

// Cart Item Type
interface CartItem {
  key: string;
  baseKey: string;
  type?: "daytour" | "accommodation" | "transfer" | "upsell";
  [key: string]: any;
}

// Store State
interface CartState {
  items: CartItem[];
  itemToEdit: CartItem | null;

  // Actions
  addItem: (item: any) => { status: "added" | "exists"; item?: CartItem };
  addAccommodationItem: (item: any) => { status: "added" | "exists"; item?: CartItem };
  updateItem: (key: string, updates: Partial<CartItem>) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  setItemToEdit: (item: CartItem | null) => void;
  clearItemToEdit: () => void;

  // Helpers
  getAccommodationItems: () => CartItem[];
  getDayTourItems: () => CartItem[];
  getTransferItems: () => CartItem[];
  getUpsellItems: () => CartItem[];
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      itemToEdit: null,

      // Generic add (used by day tours, transfers, etc.)
      addItem: (item) => {
        const baseKey = buildBaseKey(item);
        const exists = get().items.find((i) => i.baseKey === baseKey);

        if (exists) {
          return { status: "exists", item: exists };
        }

        const key = buildUniqueKey(baseKey);
        const newItem = { ...item, key, baseKey, type: item.type || "daytour" };

        set({ items: [...get().items, newItem] });
        return { status: "added", item: newItem };
      },

      // Specific for accommodation
      addAccommodationItem: (item) => {
        const accommodationItem = {
          ...item,
          type: "accommodation" as const,
        };

        const baseKey = buildBaseKey(accommodationItem);
        const exists = get().items.find((i) => i.baseKey === baseKey);

        if (exists) {
          return { status: "exists", item: exists };
        }

        const key = buildUniqueKey(baseKey);
        const newItem = { ...accommodationItem, key, baseKey };

        set({ items: [...get().items, newItem] });
        return { status: "added", item: newItem };
      },

      updateItem: (key, updates) => {
        set({
          items: get().items.map((i) =>
            i.key === key
              ? {
                  ...i,
                  ...updates,
                  baseKey: buildBaseKey({ ...i, ...updates }),
                }
              : i
          ),
        });
      },

      removeItem: (key) => {
        set({ items: get().items.filter((i) => i.key !== key) });
      },

      clearCart: () => {
        set({ items: [] });
        useOrderStore.getState().updatePrefillDataFromCart([]);
      },

      setItemToEdit: (item) => set({ itemToEdit: item }),
      clearItemToEdit: () => set({ itemToEdit: null }),

      // Helper filters
      getAccommodationItems: () => get().items.filter((i) => i.type === "accommodation"),
      getDayTourItems: () => get().items.filter((i) => !i.type || i.type === "daytour"),
      getTransferItems: () => get().items.filter(isTransferItem),
      getUpsellItems: () => get().items.filter((i) => i.type === "upsell"),
    }),
    {
      name: "tour_cart",
      partialize: (state) => ({
        items: state.items,
        itemToEdit: state.itemToEdit,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        const fixed = (state.items || []).map((i: any) => {
          const baseKey = i.baseKey || buildBaseKey(i);
          const key = i.key || buildUniqueKey(baseKey);
          return { ...i, baseKey, key };
        });

        if (JSON.stringify(fixed) !== JSON.stringify(state.items)) {
          useCartStore.setState({ items: fixed });
        }
      },
    }
  )
);