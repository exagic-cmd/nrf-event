"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Coins } from "lucide-react";
import useCurrencyStore, { STATIC_CURRENCIES } from "@/store/useCurrencyStore";
import { useEventStore } from "@/store/useEventStore";
import { useCartStore, getCartCurrency } from "@/store/useCartStore";
import { toast } from "react-toastify";

export default function CurrencySelector() {
  const { currency, currencyId, currencies, setCurrency } = useCurrencyStore();
  const eventCurrencies = useEventStore((state) => state.event?.currencies);
  const cartItems = useCartStore((state) => state.items);
  const cartCurrency = getCartCurrency(cartItems);

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync with currencies from event store whenever available
  useEffect(() => {
    if (eventCurrencies && Array.isArray(eventCurrencies) && eventCurrencies.length > 0) {
      useCurrencyStore.getState().setCurrencies(eventCurrencies);
    }
  }, [eventCurrencies]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  const currencyList =
    currencies && currencies.length > 0 ? currencies : STATIC_CURRENCIES;

  const currentCurrency =
    currencyList.find(
      (c) =>
        c.id === currencyId ||
        c.name?.toUpperCase() === currency?.toUpperCase() ||
        c.code?.toUpperCase() === currency?.toUpperCase()
    ) || currencyList[0];

  const handleSelect = (item) => {
    const itemCode = (item.code || item.name || "").toUpperCase();
    if (cartCurrency && itemCode !== cartCurrency.toUpperCase()) {
      toast.error(`In your cart you have a product in ${cartCurrency}, so you cannot change currency.`, {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    setCurrency(item.id);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select currency"
        className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-border bg-background/80 hover:bg-secondary/70 text-foreground transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
      >
        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-primary/10 text-primary">
          <Coins className="w-3.5 h-3.5" />
        </span>
        <span className="font-semibold tracking-wide">
          {mounted ? currentCurrency?.name : (currency || "SGD")}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-1.5 w-36 sm:w-40 bg-card border border-border shadow-xl rounded-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Select Currency
          </div>

          <div className="space-y-0.5">
            {currencyList.map((item) => {
              const isSelected =
                mounted &&
                (item.id === currentCurrency?.id ||
                  item.name?.toUpperCase() === currentCurrency?.name?.toUpperCase());

              const itemCode = (item.code || item.name || "").toUpperCase();
              const isOptionDisabled = Boolean(cartCurrency && itemCode !== cartCurrency.toUpperCase());

              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(item)}
                  title={isOptionDisabled ? `In your cart you have a product in ${cartCurrency}` : ""}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs sm:text-sm transition-colors text-left ${
                    isOptionDisabled
                      ? "opacity-40 cursor-pointer text-muted-foreground"
                      : isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-secondary/80"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 flex items-center justify-center rounded-full ${
                        isOptionDisabled
                          ? "bg-muted text-muted-foreground"
                          : isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      <Coins className="w-3 h-3" />
                    </span>
                    <span className="font-medium">
                      {item.name}
                    </span>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-primary shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

}
