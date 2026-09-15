// store/useCartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useOrderStore } from "./useOrderStore";
import { toast } from 'react-toastify';
import useCurrencyStore from "./useCurrencyStore";
import Cookies from "js-cookie";

// Utility: slugify strings
const slug = (s: string | undefined | null): string =>
  String(s || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 64);

// Currency resolution helpers
export const getItemCurrency = (item: any): string => {
  if (!item) return "";
  const direct =
    item.currency ||
    item.currency_code ||
    item.currencyCode ||
    item.currencyName ||
    item.pricing?.currency ||
    item.hotel_info?.roomsDetails?.[0]?.pricing?.currency ||
    item.hotel_info?.roomsDetails?.[0]?.currency ||
    item.hotel_info?.rate?.currency ||
    item.vehicle?.currency ||
    item.selectedTransfer?.currency;

  if (direct && typeof direct === "string" && direct.trim()) {
    return direct.trim().toUpperCase();
  }

  try {
    const storeCurrency = useCurrencyStore.getState()?.currency;
    if (storeCurrency && typeof storeCurrency === "string" && storeCurrency.trim()) {
      return storeCurrency.trim().toUpperCase();
    }
  } catch (e) {}

  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("currency") || Cookies.get("currency");
    if (saved && typeof saved === "string" && saved.trim()) {
      return saved.trim().toUpperCase();
    }
  }

  return "SGD";
};

export const getCartCurrency = (items: CartItem[]): string | null => {
  if (!items || items.length === 0) return null;
  for (const item of items) {
    const curr = getItemCurrency(item);
    if (curr) return curr;
  }
  return null;
};

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
  currency?: string;
  [key: string]: any;
}

// Store State
interface CartState {
  items: CartItem[];
  itemToEdit: CartItem | null;

  // Actions
  addItem: (item: any) => {
    status: "added" | "exists" | "currency_mismatch";
    item?: CartItem;
    message?: string;
    cartCurrency?: string;
    itemCurrency?: string;
  };
  addAccommodationItem: (item: any) => {
    status: "added" | "exists" | "currency_mismatch";
    item?: CartItem;
    message?: string;
    cartCurrency?: string;
    itemCurrency?: string;
  };
  setItems: (items: CartItem[]) => void;
  updateItem: (key: string, updates: Partial<CartItem>) => void;
  removeItem: (key: string) => void;
  removeProductById: (targetId: string | number) => void;
  clearCart: () => void;
  setItemToEdit: (item: CartItem | null) => void;
  clearItemToEdit: () => void;

  // Helpers
  getCartCurrency: () => string | null;
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
        const itemCurrency = getItemCurrency(item);
        const existingItems = get().items;
        const cartCurrency = getCartCurrency(existingItems);

        // Disallow adding products with different currencies to the cart
        if (cartCurrency && itemCurrency && cartCurrency !== itemCurrency) {
          const alertMessage = `In your cart you have a product in ${cartCurrency}, so you cannot add this product in a different currency.`;
          toast.error(alertMessage, {
            position: "top-right",
            autoClose: 5000,
          });
          return {
            status: "currency_mismatch",
            message: alertMessage,
            cartCurrency,
            itemCurrency,
          };
        }

        const baseKey = buildBaseKey(item);
        const exists = existingItems.find((i) => i.baseKey === baseKey);

        if (exists) {
          return { status: "exists", item: exists };
        }

        const key = buildUniqueKey(baseKey);
        const newItem = {
          ...item,
          key,
          baseKey,
          currency: itemCurrency,
          type: item.type || "daytour",
        };

        set({ items: [...existingItems, newItem] });
        return { status: "added", item: newItem };
      },

      // Specific for accommodation
      addAccommodationItem: (item) => {
        const itemCurrency = getItemCurrency(item);
        const existingItems = get().items;
        const cartCurrency = getCartCurrency(existingItems);

        // Disallow adding accommodation with different currencies to the cart
        if (cartCurrency && itemCurrency && cartCurrency !== itemCurrency) {
          const alertMessage = `In your cart you have a product in ${cartCurrency}, so you cannot add this product in a different currency.`;
          toast.error(alertMessage, {
            position: "top-right",
            autoClose: 5000,
          });
          return {
            status: "currency_mismatch",
            message: alertMessage,
            cartCurrency,
            itemCurrency,
          };
        }

        const accommodationItem = {
          ...item,
          currency: itemCurrency,
          type: "accommodation" as const,
        };

        const baseKey = buildBaseKey(accommodationItem);
        const exists = existingItems.find((i) => i.baseKey === baseKey);

        if (exists) {
          return { status: "exists", item: exists };
        }

        const key = buildUniqueKey(baseKey);
        const newItem = { ...accommodationItem, key, baseKey };

        set({ items: [...existingItems, newItem] });
        setTimeout(() => {
          try {
            get().startHoldForItem(key);
          } catch (err) {}
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
      setItems: (items) => {
        set({ items });
      },
      removeItem: (key) => {
        set({ items: get().items.filter((i) => i.key !== key) });
      },
      removeProductById: (targetId) => {
        if (!targetId) return;
        const numTargetId = Number(targetId);
        const strTargetId = String(targetId);

        // Filter from Zustand items
        const updatedItems = get().items.filter((item: any) => {
          const id = Number(item.productId ?? item.product_id ?? item.tourId ?? item.id);
          const strId = String(item.productId ?? item.product_id ?? item.tourId ?? item.id ?? "");
          return id !== numTargetId && strId !== strTargetId && item.key !== strTargetId;
        });
        set({ items: updatedItems });

        if (typeof window === "undefined") return;

        // Clean from sessionStorage
        try {
          const sessionRaw = sessionStorage.getItem("cartItems");
          if (sessionRaw) {
            const parsed = JSON.parse(sessionRaw);
            if (Array.isArray(parsed)) {
              const filtered = parsed.filter((item: any) => {
                const id = Number(item.productId ?? item.product_id ?? item.tourId ?? item.id);
                const strId = String(item.productId ?? item.product_id ?? item.tourId ?? item.id ?? "");
                return id !== numTargetId && strId !== strTargetId && item.key !== strTargetId;
              });
              sessionStorage.setItem("cartItems", JSON.stringify(filtered));
            }
          }
        } catch (e) {
          console.error("Error clearing cart item from sessionStorage:", e);
        }

        // Clean from localStorage keys: 'cartItems', 'cartItem', and user-scoped keys
        const storageKeys = ["cartItems", "cartItem"];
        try {
          const authUser = localStorage.getItem("user");
          if (authUser) {
            const parsedUser = JSON.parse(authUser);
            if (parsedUser?.id) {
              storageKeys.push(`cartItems_${parsedUser.id}`);
            }
          }
        } catch (e) {}

        storageKeys.forEach((key) => {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                const filtered = parsed.filter((item: any) => {
                  const id = Number(item.productId ?? item.product_id ?? item.tourId ?? item.id);
                  const strId = String(item.productId ?? item.product_id ?? item.tourId ?? item.id ?? "");
                  return id !== numTargetId && strId !== strTargetId && item.key !== strTargetId;
                });
                localStorage.setItem(key, JSON.stringify(filtered));
              } else if (parsed && typeof parsed === "object") {
                const id = Number(parsed.productId ?? parsed.product_id ?? parsed.tourId ?? parsed.id);
                const strId = String(parsed.productId ?? parsed.product_id ?? parsed.tourId ?? parsed.id ?? "");
                if (id === numTargetId || strId === strTargetId) {
                  localStorage.removeItem(key);
                }
              }
            }
          } catch (e) {
            console.error("Error clearing cart item from localStorage:", e);
          }
        });
      },
      clearCart: () => {
        set({ items: [] });
        useOrderStore.getState().updatePrefillDataFromCart([]);
      },

      setItemToEdit: (item) => set({ itemToEdit: item }),
      clearItemToEdit: () => set({ itemToEdit: null }),

      // Helper filters
      getCartCurrency: () => getCartCurrency(get().items),
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

        // Stuba/RateHawk/hotel items (link_type_id 9 or 10) are held on the client-side only, without calling the hold API.
        if (item.hotel_info?.stuba_response || item.link_type_id === 9 || item.link_type_id === 10) {
          console.log('[startHoldForItem] Client-side hold only (stuba/link_type_id 9 or 10).');
          const expiresAt = Date.now() + 7 * 60 * 1000;
          get().setHoldForItem(key, expiresAt);
          const roomCount = get().getAccommodationItems().length;
          toast.success(`${roomCount} ${roomCount === 1 ? 'room' : 'rooms'} reserved for 7 mins`);
          return { success: true, expiresAt };
        }


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

          const res = await fetch($helpers.getApiAbsoluteURL('/inventory/hold'), {
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
          const roomCount = get().getAccommodationItems().length;
          toast.success(`${roomCount} ${roomCount === 1 ? 'room' : 'rooms'} reserved for 7 mins`);
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

        // Stuba/RateHawk/hotel items (link_type_id 9 or 10) are held on the client-side only.
        if (item.hotel_info?.stuba_response || item.link_type_id === 9 || item.link_type_id === 10) {
          console.log('[extendHoldForItem] Client-side hold extension only (stuba/link_type_id 9 or 10).');
          const newExpires = Date.now() + 7 * 60 * 1000;
          get().setHoldForItem(key, newExpires);
          return { success: true, expiresAt: newExpires };
        }


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

          const res = await fetch($helpers.getApiAbsoluteURL('/inventory/hold/extend'), {
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
          const res = await fetch($helpers.getApiAbsoluteURL('/inventory/hold/extend'), {
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
            // Skip inventory/hold status check for link_type_id 9 (hotel) or 10 (ratehawk) — client-side hold only.
            if (item.link_type_id === 9 || item.link_type_id === 10) {
              const now = Date.now();
              if (item.holdExpiresAt && item.holdExpiresAt <= now) {
                get().removeItem(item.key);
                removedKeys.push(item.key);
              }
              continue;
            }

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