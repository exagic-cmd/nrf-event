import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

export interface CurrencyItem {
  id: number;
  name: string;
  code?: string;
}

export const STATIC_CURRENCIES: CurrencyItem[] = [
  {
    id: 2,
    name: "SGD",
    code: "SGD",
  },
  {
    id: 3,
    name: "USD",
    code: "USD",
  },
  {
    id: 5,
    name: "PKR",
    code: "PKR",
  },
];

export function formatCurrencyItem(item: any): CurrencyItem {
  const id = Number(item?.id);
  const name = String(item?.name || item?.code || "");
  return {
    id,
    name,
    code: name,
  };
}

export interface CurrencyState {
  currencies: CurrencyItem[];
  currency: string;
  currencyId: number;
  setCurrencies: (currencies: any[]) => void;
  setCurrency: (nameOrId: string | number) => void;
}

const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currencies: STATIC_CURRENCIES,
      currency: "SGD",
      currencyId: 2,
      setCurrencies: (rawCurrencies) =>
        set((state) => {
          if (!Array.isArray(rawCurrencies) || rawCurrencies.length === 0) {
            return state;
          }

          const formatted = rawCurrencies.map(formatCurrencyItem);

          // Find current selection by id or name
          let active = formatted.find(
            (c) =>
              c.id === state.currencyId ||
              c.name.toUpperCase() === state.currency?.toUpperCase() ||
              (c.code && c.code.toUpperCase() === state.currency?.toUpperCase())
          );

          if (!active && typeof window !== "undefined") {
            const savedId =
              Cookies.get("currency_id") || localStorage.getItem("currency_id");
            const savedName =
              Cookies.get("currency") || localStorage.getItem("currency");
            if (savedId) {
              active = formatted.find((c) => c.id === Number(savedId));
            }
            if (!active && savedName) {
              active = formatted.find(
                (c) =>
                  c.name.toUpperCase() === savedName.toUpperCase() ||
                  (c.code && c.code.toUpperCase() === savedName.toUpperCase())
              );
            }
          }

          if (!active) {
            active = formatted[0];
          }

          if (typeof window !== "undefined" && active) {
            try {
              localStorage.setItem("currency", active.name);
              localStorage.setItem("currency_id", String(active.id));
              Cookies.set("currency", active.name, { expires: 365, path: "/" });
              Cookies.set("currency_id", String(active.id), {
                expires: 365,
                path: "/",
              });
              if (
                active.id !== state.currencyId ||
                active.name !== state.currency
              ) {
                window.dispatchEvent(
                  new CustomEvent("currencyChange", {
                    detail: {
                      currency: active.name,
                      currency_id: active.id,
                      currencyId: active.id,
                    },
                  })
                );
              }
            } catch (e) {
              console.error("Error saving currency to localStorage/cookies", e);
            }
          }

          return {
            currencies: formatted,
            currency: active.name,
            currencyId: active.id,
          };
        }),
      setCurrency: (val) =>
        set((state) => {
          const list =
            state.currencies && state.currencies.length > 0
              ? state.currencies
              : STATIC_CURRENCIES;

          let selected = list[0];
          if (typeof val === "number") {
            selected = list.find((c) => c.id === val) || list[0];
          } else if (typeof val === "string") {
            const trimmed = val.trim().toUpperCase();
            selected =
              list.find(
                (c) =>
                  c.name.toUpperCase() === trimmed ||
                  String(c.id) === trimmed ||
                  (c.code && c.code.toUpperCase() === trimmed)
              ) || list[0];
          }

          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("currency", selected.name);
              localStorage.setItem("currency_id", String(selected.id));
              Cookies.set("currency", selected.name, { expires: 365, path: "/" });
              Cookies.set("currency_id", String(selected.id), {
                expires: 365,
                path: "/",
              });
              window.dispatchEvent(
                new CustomEvent("currencyChange", {
                  detail: {
                    currency: selected.name,
                    currency_id: selected.id,
                    currencyId: selected.id,
                  },
                })
              );
            } catch (e) {
              console.error("Error saving currency to localStorage/cookies", e);
            }
          }

          return {
            currency: selected.name,
            currencyId: selected.id,
          };
        }),
    }),
    {
      name: "currency-store",
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== "undefined") {
          try {
            localStorage.setItem("currency", state.currency);
            localStorage.setItem("currency_id", String(state.currencyId));
            Cookies.set("currency", state.currency, { expires: 365, path: "/" });
            Cookies.set("currency_id", String(state.currencyId), {
              expires: 365,
              path: "/",
            });
          } catch (e) {}
        }
      },
    }
  )
);

export default useCurrencyStore;
