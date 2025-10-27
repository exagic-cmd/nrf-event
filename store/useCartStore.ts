// store/useCartStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";


const slug = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 64);

const isTransferItem = (item) =>
  !!(item?.vehicle || item?.vehicle_id || item?.vehicle_name);

const isUpsellItem = (item) => item.type === 'upsell';

const buildBaseKey = (item) => {
  if (isUpsellItem(item)) {
    return `upsell:${item.id}`;
  }

  if (isTransferItem(item)) {
    const v = item.vehicle || {};
    const vehicleId =  v.vehicle_id ?? item.vehicle_id ?? "";
    const vehicleName = v.name ?? v.vehicle_name ?? item.vehicle_name ?? "";
    return `transfer:${vehicleId}:${slug(vehicleName)}`;
  }

  // Default to daytour
  const tourId = item.tourId ?? "";
  const date = item.selectedDate ?? "";
  const time = item.selectedTime ?? "";
  const pax = item.totalPax ?? "";
  const baseKey = `daytour:${tourId}:${date}:${time}:${pax}`;
  //console.log("[buildBaseKey] Daytour baseKey:", baseKey, item);
  return baseKey;
};

const buildUniqueKey = (baseKey) => {
  const uniqueKey = `${baseKey}#${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
 // console.log("[buildUniqueKey] uniqueKey:", uniqueKey);
  return uniqueKey;
};


export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
     //   console.log("[addItem] trying to add item:", item);

        const baseKey = buildBaseKey(item);
        const exists = get().items.find((i) => i.baseKey === baseKey);

        if (exists) {
      //    console.log("[addItem] item already exists:", exists);
          return { status: "exists", item: exists };
        }

        const key = buildUniqueKey(baseKey);
        const newItem = { ...item, key, baseKey };

      //  console.log("[addItem] adding newItem:", newItem);
        set({ items: [...get().items, newItem] });
        return { status: "added", item: newItem };
      },

      updateItem: (key, updates) => {
     //   console.log("[updateItem] key:", key, "updates:", updates);
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
        console.log("[removeItem] removing key:", key);
        set({ items: get().items.filter((i) => i.key !== key) });
      },

      clearCart: () => {
        console.log("[clearCart] clearing all items");
        set({ items: [] });
      },

      itemToEdit: null,
      setItemToEdit: (item) => set({ itemToEdit: item }),
      clearItemToEdit: () => set({ itemToEdit: null }),
    }),
    {
      name: "tour_cart",
      partialize: (state) => ({
        items: state.items,
        itemToEdit: state.itemToEdit,
      }),

      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const fixed = (state.items || []).map((i) => {
          const baseKey = i.baseKey || buildBaseKey(i);
          const key = i.key || buildUniqueKey(baseKey);
          return { ...i, baseKey, key };
        });
        if (JSON.stringify(fixed) !== JSON.stringify(state.items)) {
     //     console.log("[onRehydrateStorage] fixing items:", fixed);
          useCartStore.setState({ items: fixed });
        }
      },
    }
  )
);
