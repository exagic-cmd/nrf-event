import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Loader2, Minus, Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import { fetchEventProducts } from "@/lib/eventRegistrationApi";
import useLanguageStore from "@/store/useLanguageStore";
import useCurrencyStore from "@/store/useCurrencyStore";
import { useCartStore } from "@/store/useCartStore";
import { useDrawerStore } from "@/store/useDrawerStore";
import { getFullImageUrl } from "@/utils/imageService";
import { calculateTierPricing } from "@/utils/tierPricing";
import RecommendedProductsModal from "@/components/accommodations/booking/RecommendedProductsModal";

export default function EventRegistrationForm({ eventSlug, onLoadingChange }) {
  const languageId = useLanguageStore((state) => state.languageId) || 1;
  const currencyId = useCurrencyStore((state) => state.currencyId);
  const addItem = useCartStore((state) => state.addItem);
  const setJustAdded = useDrawerStore((state) => state.setJustAdded);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [lastAddedTitle, setLastAddedTitle] = useState("");
  const [lastRecommendedProducts, setLastRecommendedProducts] = useState([]);

  useEffect(() => {
    if (!eventSlug) {
      setLoading(false);
      onLoadingChange?.(false);
      setLoadError("This registration link is missing its event.");
      return undefined;
    }

    const controller = new AbortController();
    let active = true;
    setLoading(true);
    onLoadingChange?.(true);
    setLoadError("");
    setProducts([]);

    fetchEventProducts(languageId, eventSlug, { signal: controller.signal, currencyId })
      .then(({ event, products: items }) => {
        if (!active) return;
        const eventStartDate = event?.start_date ?? null;
        setProducts(items.map((item) => normalizeProduct(item, eventStartDate)));
      })
      .catch((error) => {
        if (active && !controller.signal.aborted && error.name !== "AbortError") {
          console.error("Unable to load event products:", error);
          setLoadError(error.message || "Unable to load event options.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          onLoadingChange?.(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [eventSlug, languageId, currencyId, requestVersion]);

  function handleAddToCart(product, { adults, child, pricing }) {
    const result = addItem({
      tourId: product.id,
      title: product.title,
      image: product.imageUrl ?? product.image,
      category_id: product.categoryId,
      category_name: product.categoryName,
      type: "daytour",
      currency: product.currency,
      adults,
      child,
      totalPax: adults + child,
      pricing: {
        total: pricing.total,
        adultPrice: pricing.adultPrice,
        childPrice: pricing.childPrice,
      },
      inclusions: product.inclusions,
      exclusions: product.exclusions,
      questions: product.questions,
      selectedDate: product.startDate,
      tour_date: product.startDate,
    });

    if (result.status === "added") {
      setJustAdded(true);
      toast.success(`${product.title} added to cart`);
      setSelectedProduct(null);
      setLastAddedTitle(product.title);
      setLastRecommendedProducts(product.recommendedProducts || []);
      if ((product.recommendedProducts || []).length > 0) {
        setShowRecommendations(true);
      }
    } else if (result.status === "exists") {
      toast.info(`${product.title} is already in your cart`);
      setSelectedProduct(null);
    }
  }

  if (loading) {
    return (
      <RegistrationFrame>
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center" role="status" aria-live="polite">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Loading event options…</p>
        </div>
      </RegistrationFrame>
    );
  }

  if (loadError) {
    return (
      <RegistrationFrame>
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">{loadError}</p>
        <button
          className="mt-4 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
          type="button"
          onClick={() => setRequestVersion((version) => version + 1)}
        >
          Try again
        </button>
      </RegistrationFrame>
    );
  }

  if (products.length === 0) {
    return (
      <RegistrationFrame>
        <p className="text-sm text-muted-foreground">No options available for this event yet.</p>
      </RegistrationFrame>
    );
  }

  return (
    <RegistrationFrame>
      <p className="mb-6 text-sm leading-6 text-muted-foreground">
        Choose a plan to add it to your cart.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onChoose={() => setSelectedProduct(product)}
          />
        ))}
      </div>
      {selectedProduct && (
        <ParticipantsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onConfirm={(selection) => handleAddToCart(selectedProduct, selection)}
        />
      )}
      {showRecommendations && typeof document !== "undefined" &&
        createPortal(
          <RecommendedProductsModal
            isOpen={showRecommendations}
            onClose={() => setShowRecommendations(false)}
            hotelName={lastAddedTitle}
            inlineProducts={lastRecommendedProducts}
          />,
          document.body
        )}
    </RegistrationFrame>
  );
}

function ProductCard({ product, onChoose }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm transition hover:border-primary/60 hover:shadow-md">
      {product.imageUrl && (
        <div className="aspect-[16/9] w-full overflow-hidden bg-muted/30">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-card-foreground">{product.title}</h3>
        {product.categoryName && (
          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            {product.categoryName}
          </span>
        )}
      </div>

      {product.priceLabel && (
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-xl font-semibold text-primary">{product.priceLabel}</span>
          {product.hasPromo && product.strikePriceLabel && (
            <span className="text-sm text-muted-foreground line-through">{product.strikePriceLabel}</span>
          )}
        </div>
      )}

      {product.inclusions.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-sm text-card-foreground">
          {product.inclusions.map((item) => (
            <li key={`inc-${item}`} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="min-w-0 break-words">{item}</span>
            </li>
          ))}
        </ul>
      )}

      {product.exclusions.length > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Not included</p>
          <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground">
            {product.exclusions.map((item) => (
              <li key={`exc-${item}`} className="min-w-0 break-words">— {item}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={onChoose}
        className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover"
      >
        Inquiry Now
      </button>
      </div>
    </div>
  );
}

function ParticipantsModal({ product, onClose, onConfirm }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const hasChildTier = product.tiers.some(
    (tier) => tier.childPrice > 0 || (tier.childPromoPrice ?? 0) > 0
  );
  const minPaxOverall = product.tiers.length
    ? Math.min(...product.tiers.map((tier) => tier.minPax || 1))
    : 1;
  const maxPaxOverall = product.tiers.length
    ? Math.max(...product.tiers.map((tier) => tier.maxPax || tier.minPax || 1))
    : 10;

  const [adults, setAdults] = useState(Math.max(minPaxOverall, 1));
  const [child, setChild] = useState(0);

  const pricing = useMemo(() => {
    if (!product.tiers.length) {
      return {
        adultPrice: product.startingPrice,
        childPrice: 0,
        totalAdult: adults * product.startingPrice,
        totalChild: 0,
        total: adults * product.startingPrice,
        selectedTier: null,
      };
    }
    const tieredInput = {
      data: {
        product_pricing: product.tiers.map((tier) => ({
          min_pax: tier.minPax,
          max_pax: tier.maxPax,
          adult_price: tier.adultPrice,
          adult_promo_price: tier.adultPromoPrice ?? 0,
          child_price: tier.childPrice,
          child_promo_price: tier.childPromoPrice ?? 0,
        })),
      },
    };
    return calculateTierPricing(adults, child, tieredInput);
  }, [adults, child, product.tiers, product.startingPrice]);

  const totalPax = adults + child;
  const outOfRange = product.tiers.length > 0 && totalPax > maxPaxOverall;
  const disabled = adults <= 0 || outOfRange;

  function formatMoney(amount) {
    return formatPriceLabel(Number(amount) || 0, product.currency);
  }

  function clamp(value) {
    const n = Number(value) || 0;
    if (n < 0) return 0;
    return n;
  }

  if (!mounted || typeof document === "undefined") return null;

  const activeTier = product.tiers.find(
    (tier) => totalPax >= tier.minPax && totalPax <= tier.maxPax
  );
  const perPassPrice = pricing.adultPrice ?? product.startingPrice;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 rounded-full bg-background/90 p-1.5 text-muted-foreground shadow-sm ring-1 ring-border transition hover:bg-background hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-1 flex-col overflow-y-auto md:flex-row">
          {/* LEFT — Product info */}
          <div className="relative flex flex-col bg-muted/20 md:w-[45%] md:max-w-[360px] md:shrink-0 md:border-r md:border-border">
            {product.imageUrl ? (
              <div className="aspect-[16/10] w-full overflow-hidden bg-muted/40 md:aspect-auto md:h-56">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[16/10] w-full items-center justify-center bg-muted/40 text-sm text-muted-foreground md:aspect-auto md:h-56">
                No image
              </div>
            )}
            <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
              {product.categoryName && (
                <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-primary">
                  {product.categoryName}
                </span>
              )}
              <h3 className="text-lg font-semibold leading-tight text-foreground sm:text-xl">
                {product.title}
              </h3>
              {product.inclusions?.length > 0 && (
                <ul className="mt-1 space-y-1.5 text-sm text-foreground">
                  {product.inclusions.slice(0, 4).map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span className="min-w-0 break-words">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* RIGHT — Selection */}
          <div className="flex flex-1 flex-col gap-6 p-5 sm:p-6">
            {product.tiers.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Volume pricing
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {product.tiers.map((tier, idx) => {
                    const isActive = activeTier === tier;
                    const tierPrice = tier.adultPromoPrice ?? tier.adultPrice;
                    return (
                      <div
                        key={idx}
                        className={`rounded-lg border px-3 py-2.5 transition ${
                          isActive
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border bg-background"
                        }`}
                      >
                        <p className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                          {tier.minPax}–{tier.maxPax} passes
                        </p>
                        <p className="mt-0.5 text-base font-semibold text-foreground">
                          {formatMoney(tierPrice)}
                          <span className="ml-1 text-xs font-normal text-muted-foreground">/pass</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Passes</p>
                  <p className="text-xs text-muted-foreground">
                    How many passes do you need?
                  </p>
                </div>
                <BigStepper
                  value={adults}
                  min={Math.max(minPaxOverall, 1)}
                  max={maxPaxOverall}
                  onChange={(next) => setAdults(clamp(next))}
                />
              </div>

              {hasChildTier && (
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Children</p>
                    <p className="text-xs text-muted-foreground">Add children to your booking.</p>
                  </div>
                  <BigStepper
                    value={child}
                    min={0}
                    max={Math.max(0, maxPaxOverall - adults)}
                    onChange={(next) => setChild(clamp(next))}
                  />
                </div>
              )}
            </div>

            {outOfRange && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                Maximum {maxPaxOverall} passes per booking.
              </p>
            )}

            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {adults} × {formatMoney(perPassPrice)}
                </span>
                <span className="font-medium text-foreground">
                  {formatMoney(adults * perPassPrice)}
                </span>
              </div>
              {hasChildTier && child > 0 && pricing.childPrice > 0 && (
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {child} × {formatMoney(pricing.childPrice)}
                  </span>
                  <span className="font-medium text-foreground">
                    {formatMoney(child * pricing.childPrice)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="flex items-center justify-between gap-4 border-t border-border bg-background px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Total</p>
            <p className="text-xl font-semibold text-primary sm:text-2xl">{formatMoney(pricing.total)}</p>
          </div>
          <button
            type="button"
            onClick={() =>
              onConfirm({
                adults,
                child,
                pricing: {
                  total: pricing.total,
                  adultPrice: pricing.adultPrice,
                  childPrice: pricing.childPrice,
                },
              })
            }
            disabled={disabled}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-55 sm:min-w-[160px]"
          >
            Get Pass
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function BigStepper({ value, min, max, onChange }) {
  const canDecrease = value > min;
  const canIncrease = value < max;
  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-background px-1.5 py-1">
      <button
        type="button"
        onClick={() => canDecrease && onChange(value - 1)}
        disabled={!canDecrease}
        className="flex h-8 w-8 items-center justify-center rounded-full text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Decrease"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-8 text-center text-base font-semibold tabular-nums text-foreground">{value}</span>
      <button
        type="button"
        onClick={() => canIncrease && onChange(value + 1)}
        disabled={!canIncrease}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Increase"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function RegistrationFrame({ children }) {
  return (
    <div className="space-y-6 rounded-xl border border-border bg-card/95 p-6 text-card-foreground shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:p-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Event registration
        </p>
        <h2 className="mt-2 text-xl font-semibold text-card-foreground">
          Pick your plan
        </h2>
      </div>
      {children}
    </div>
  );
}

function normalizeProduct(product, eventStartDate) {
  const currency = String(product?.currency || "").trim();
  const firstTier = Array.isArray(product?.pricing) && product.pricing.length > 0
    ? product.pricing[0]
    : null;

  const adultPrice = parseAmount(firstTier?.adult_price);
  const adultPromoPrice = parseAmount(firstTier?.adult_promo_price);
  const fallbackPrice = parseAmount(product?.starting_price) ?? 0;

  const bothPresent = adultPrice !== null && adultPromoPrice !== null;
  const hasPromo = bothPresent && adultPrice !== adultPromoPrice;
  const displayPrice = hasPromo
    ? Math.min(adultPrice, adultPromoPrice)
    : (adultPromoPrice ?? adultPrice ?? fallbackPrice);
  const originalPrice = hasPromo ? Math.max(adultPrice, adultPromoPrice) : null;

  return {
    id: product?.id,
    title: product?.product_content_title || product?.title || "Event Pass",
    image: product?.image ?? null,
    imageUrl: product?.image ? getFullImageUrl(product.image) : null,
    startingPrice: displayPrice,
    priceLabel: formatPriceLabel(displayPrice, currency),
    strikePriceLabel: hasPromo ? formatPriceLabel(originalPrice, currency) : "",
    hasPromo,
    currency,
    categoryId: product?.category_id,
    categoryName: product?.category_name || "",
    inclusions: splitLines(product?.inclusion),
    exclusions: splitLines(product?.exclusion),
    questions: Array.isArray(product?.questions) ? product.questions : [],
    startDate: eventStartDate ?? null,
    recommendedProducts: Array.isArray(product?.recommended_products)
      ? product.recommended_products
      : [],
    tiers: Array.isArray(product?.pricing)
      ? product.pricing.map((tier) => ({
          minPax: Number(tier?.min_pax) || 1,
          maxPax: Number(tier?.max_pax) || Number(tier?.min_pax) || 1,
          adultPrice: parseAmount(tier?.adult_price) ?? 0,
          adultPromoPrice: parseAmount(tier?.adult_promo_price),
          childPrice: parseAmount(tier?.child_price) ?? 0,
          childPromoPrice: parseAmount(tier?.child_promo_price),
        }))
      : [],
  };
}

function parseAmount(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function formatPriceLabel(amount, currency) {
  if (!Number.isFinite(amount)) return "";
  const formatted = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  return `${currency ? `${currency} ` : ""}${formatted}`;
}

function splitLines(value) {
  if (!value || typeof value !== "string") return [];
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
