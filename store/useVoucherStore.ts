import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchCustomerVouchers } from "@/lib/clientApi";
import helpers from "@/lib/helpers";
import useLanguageStore from "@/store/useLanguageStore"

interface SkuDetails {
  code: string;
  description: string;
  deal_type: string;
  terms_conditions: string;
  is_time_specific: boolean;
  valid_days: string[] | null;
  valid_time_from?: string;
  valid_time_to?: string;
  validity_days?: number;
  image?: string | null;
}

interface RedemptionDetails {
  code: string;
  status: "assigned" | "redeemed" | "expired";
  valid_from: string;
  valid_to: string;
  adults: number;
  children: number;
  total_pax: number;
  is_active: boolean;
  redeemed_at: string | null;
  sku: SkuDetails;
}

interface ItineraryDetails {
  id: number;
  title: string;
  date: string;
  product_title: string;
  adults: number;
  children: number;
}

interface OrderDetails {
  id: number;
  order_no: string;
  travel_date: string;
}

export interface Voucher {
  voucher_id: number;
  title: string;
  type: "qr" | "voucher" | "deal" | "promotion";
  file_path: string | null;
  qr_link: string | null;
  notes: string | null;
  created_at: string;
  itinerary: ItineraryDetails;
  order: OrderDetails;
  redemption: RedemptionDetails | null;
  assigned_at?: string;
  assigned_location?: string;
  remarks?: string;
  assigned_by?: string;
}

interface VoucherStore {
  vouchers: Voucher[];
  selectedVoucher: Voucher | null;
  loading: boolean;
  error: string | null;
  fetchVouchers: (accessToken: string) => Promise<void>;
  fetchVoucherDetail: (accessToken: string, voucherId: string | number) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useVoucherStore = create<VoucherStore>()(
  persist(
    (set, get) => ({
      vouchers: [],
      selectedVoucher: null,
      loading: false,
      error: null,

      fetchVouchers: async (accessToken: string) => {
        const { languageId } = useLanguageStore.getState();
        set({ loading: true, error: null });
        try {
          const response = await fetchCustomerVouchers(accessToken, { language_id: languageId || 1 });

          if (response.success) {
            set({ vouchers: response.data || [], loading: false });
          } else {
            set({
              error: response.message || "Failed to fetch vouchers",
              loading: false,
              vouchers: [],
            });
          }
        } catch (err: any) {
          set({
            error: err.message || "Failed to load vouchers",
            loading: false,
            vouchers: [],
          });
        }
      },

      fetchVoucherDetail: async (accessToken: string, voucherId: string | number) => {
        const { languageId } = useLanguageStore.getState();
        set({ loading: true, error: null });
        try {
          const response = await fetchCustomerVouchers(accessToken, { voucher_id: voucherId, language_id: languageId || 1 });

          if (response.success && response.data) {
            // The API might return an array or a single object depending on backend logic
            const data = Array.isArray(response.data)
              ? response.data.find((v: Voucher) => String(v.voucher_id) === String(voucherId))
              : response.data;

            set({ selectedVoucher: data || null, loading: false });
          } else {
            throw new Error(response.message || "Voucher not found");
          }
        } catch (err: any) {
          set({
            error: err.message || "Failed to load voucher details",
            loading: false,
            selectedVoucher: null,
          });
        }
      },

      clearError: () => set({ error: null }),

      reset: () => set({ vouchers: [], selectedVoucher: null, loading: false, error: null }),
    }),
    {
      name: "voucher-storage",
      partialize: (state) => ({
        vouchers: state.vouchers,
        selectedVoucher: state.selectedVoucher,
      }),
    }
  )
);
