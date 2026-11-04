import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { fetchEventProducts } from "@/lib/eventRegistrationApi";
import useLanguageStore from "@/store/useLanguageStore";
import useCurrencyStore from "@/store/useCurrencyStore";
import { useCartStore } from "@/store/useCartStore";
import { useDrawerStore } from "@/store/useDrawerStore";
import { getFullImageUrl } from "@/utils/imageService";

export default function EventRegistrationForm({ eventSlug, onLoadingChange }) {
  const languageId = useLanguageStore((state) => state.languageId) || 1;
  const currencyId = useCurrencyStore((state) => state.currencyId);
  const addItem = useCartStore((state) => state.addItem);
  const setJustAdded = useDrawerStore((state) => state.setJustAdded);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

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

  function handleChoose(product) {
    const result = addItem({
      tourId: product.id,
      title: product.title,
      image: product.imageUrl ?? product.image,
      category_id: product.categoryId,
      category_name: product.categoryName,
      type: "daytour",
      currency: product.currency,
      pricing: {
        total: product.startingPrice,
        adultPrice: product.startingPrice,
        childPrice: 0,
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
    } else if (result.status === "exists") {
      toast.info(`${product.title} is already in your cart`);
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
          <ProductCard key={product.id} product={product} onChoose={() => handleChoose(product)} />
        ))}
      </div>
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
        Choose Plan
      </button>
      </div>
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
