// store/useCartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useOrderStore } from "./useOrderStore";
import { toast } from 'react-toastify';
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
  // Generate a unique numeric ID. Date.now() (13 digits) + a 4-digit random number.
  const uniqueId = `${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
  return `${baseKey}#${uniqueId}`;
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
  // Hold helpers
  setHoldForItem: (key: string, expiresAt: number) => void;
  clearHoldForItem: (key: string) => void;
  startHoldForItem: (key: string) => Promise<any>;
  extendHoldForItem: (key: string) => Promise<any>;
  extendHoldByCart: (cartId: string, ratePlanId: string) => Promise<any>;
  validateHoldsBeforeCheckout: () => Promise<{ success: boolean; removed?: string[]; message?: string }>;
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
   setTimeout(() => {
          try {
            get().startHoldForItem(key);
          } catch (err) {
          }
        }, 0);

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

      setHoldForItem: (key: string, expiresAt: number) => {
        set({
          items: get().items.map((i) => (i.key === key ? { ...i, holdExpiresAt: expiresAt, holdStartedAt: Date.now() } : i)),
        });
      },
 clearHoldForItem: (key: string) => {
        set({
          items: get().items.map((i) => (i.key === key ? { ...i, holdExpiresAt: undefined, holdStartedAt: undefined } : i)),
        });
      },
 startHoldForItem: async (key: string) => {
        const item = get().items.find((i) => i.key === key);
        if (!item) return { success: false, message: "Item not found" };

        try {
        const ratePlanId = item.quoteId || item.rate_plan_id || item.ratePlanId || item.selectedRoomId;
        const startDate = item.check_in || item.checkIn;
          const endDate = item.check_out || item.checkOut;

          if (!ratePlanId || !startDate || !endDate) {
            console.warn('Hold API missing required fields:', { ratePlanId, startDate, endDate });
            return { success: false, message: 'Missing required hold fields' };
          }
 const cartId = key.split('#').pop() || key;

          const payload = {
            cart_id: cartId,
            rate_plan_id: ratePlanId,
            start_date: startDate,
            end_date: endDate,
            qty: item.qty || 1,
          };

         // console.log('🔓 Calling POST /inventory/hold with payload:', payload);

          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/inventory/hold`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (!res.ok || data.success !== true) {
            console.warn('Hold API failed:', data);
            return { success: false, message: data?.message || 'Hold failed' };
          }
          const expiresAt = data.expiresAt || (Date.now() + 7 * 60 * 1000);
          get().setHoldForItem(key, expiresAt);
          toast.success('Accommodation on reserve for 7 minutes');
          return { success: true, expiresAt };
        } catch (err) {
          console.warn('Hold API error:', err);
          return { success: false, message: err.message };
        }
      },

      // Extend hold — calls POST /inventory/hold/extend with cart_id and rate_plan_id
      extendHoldForItem: async (key: string) => {
        const item = get().items.find((i) => i.key === key);
        if (!item) return { success: false, message: "Item not found" };

        try {
          const ratePlanId = item.quoteId || item.rate_plan_id || item.ratePlanId || item.selectedRoomId;
          
          if (!ratePlanId) {
            console.warn('Extend hold API missing rate_plan_id');
            return { success: false, message: 'Missing rate plan ID' };
          }

          const cartId = key.split('#').pop() || key;

          const payload = {
            cart_id: cartId,
            rate_plan_id: ratePlanId,
          };

          console.log('⏱️ Calling POST /inventory/hold/extend with payload:', payload);

          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/inventory/hold/extend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (!res.ok || data.success !== true) {
            console.warn('Extend hold API failed:', data);
            return { success: false, message: data?.message || 'Extend failed' };
          }
          const newExpires = data.expiresAt || (Date.now() + 7 * 60 * 1000);
          get().setHoldForItem(key, newExpires);
          console.log('✅ Hold extended, new expiry:', new Date(newExpires));
          return { success: true, expiresAt: newExpires };
        } catch (err) {
          console.warn('Extend hold API error:', err);
          return { success: false, message: err.message };
        }
      },

      // Extend hold by cart id and rate plan (used by resume-payment flow where local cart key may not exist)
      extendHoldByCart: async (cartId: string, ratePlanId: string) => {
        if (!cartId || !ratePlanId) return { success: false, message: 'Missing cart_id or rate_plan_id' };

        const payload = {
          cart_id: cartId,
          rate_plan_id: ratePlanId,
        };

        try {
          console.log('⏱️ Calling POST /inventory/hold/extend by cart:', payload);
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/inventory/hold/extend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (!res.ok || data.success !== true) {
            console.warn('Extend hold by cart API failed:', data);
            return { success: false, message: data?.message || 'Extend failed', data };
          }

          const newExpires = data.expiresAt || (Date.now() + 7 * 60 * 1000);
          // If we have a matching local item, update its hold expiry
          const localItem = get().items.find((i) => (i.key.split('#').pop?.() || i.key) === String(cartId));
          if (localItem) {
            get().setHoldForItem(localItem.key, newExpires);
          }

          console.log('✅ Hold extended by cart, new expiry:', new Date(newExpires));
          return { success: true, expiresAt: newExpires, data };
        } catch (err: any) {
          console.warn('Extend hold by cart API error:', err);
          return { success: false, message: err?.message || String(err) };
        }
      },

      validateHoldsBeforeCheckout: async () => {
        const items = get().items;
        const removedKeys: string[] = [];
        const accommodationItems = items.filter((i) => i.type === 'accommodation' && i.holdExpiresAt);

        if (accommodationItems.length === 0) {
          return { success: true, removed: [] };
        }

        try {
          for (const item of accommodationItems) {
            const ratePlanId = item.quoteId || item.rate_plan_id || item.ratePlanId || item.selectedRoomId;
            
           const cartId = item.key.split('#').pop() || item.key;

            const params = new URLSearchParams({
              cart_id: cartId,
              rate_plan_id: ratePlanId || '',
            });

            console.log('🔍 Calling GET /inventory/hold/status with params:', Object.fromEntries(params));

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/inventory/hold/status?${params.toString()}`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();

            if (!res.ok || data.success === false || data.available === false) {
              console.warn('Hold status invalid for item', item.key, data);
              get().removeItem(item.key);
              removedKeys.push(item.key);
            } else {
              console.log('✅ Hold status valid for item', item.key, data);
            }
          }
        } catch (err) {
          console.warn('Hold status API error:', err);
          // On network error, fall back to local expiry check
          const now = Date.now();
          const expired = accommodationItems.filter((i) => i.holdExpiresAt && i.holdExpiresAt <= now);
          expired.forEach((i) => {
            get().removeItem(i.key);
            if (!removedKeys.includes(i.key)) removedKeys.push(i.key);
          });
        }

        if (removedKeys.length > 0) return { success: false, removed: removedKeys, message: 'Some holds expired' };
        return { success: true, removed: [] };
      },
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