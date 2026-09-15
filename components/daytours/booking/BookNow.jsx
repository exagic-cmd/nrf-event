import React, { useState, useEffect } from "react";
import BookingPriceTable from "@/components/product/bookingInfo/BookingPriceTable";
import BookingForm from "@/components/product/bookingInfo/TourBookingForm";
import BookingPolicySection from "@/components/daytours/booking/BookingPolicySection";
import { useProductStore } from "@/store/useProductStore";
import { useCartStore } from "@/store/useCartStore";
import { calculateTierPricing } from "@/utils/tierPricing";
import { useDrawerStore } from "@/store/useDrawerStore";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tag, Star, Clock } from "lucide-react";
import { getFullImageUrl } from "@/utils/imageService";
import LoaderSvg from "@/components/common/LoaderSvg";
import { useOrderStore } from "@/store/useOrderStore";
import useLanguageStore from "@/store/useLanguageStore";

const BookNow = ({ onBookNow, onPriceChange, id, productTitle, editMode, edit }) => {
  const { t } = useTranslation("daytour");
  const router = useRouter();
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    hotel: "",
    adults: 0,
    child: 0,
    twin_sharing: 0,
    single_sharing: 0,
    child_with_bed: 0,
    child_without_bed: 0,
    accommodation_group_id: "",
    group_hotel_id: "",
  });
  const [localPriceSummary, setLocalPriceSummary] = useState(null);

  const { setJustAdded, justAdded } = useDrawerStore();
  const { tieredPricingData, bookedProductDetail, fetchCancellationPolicy } = useProductStore();
  const { languageId } = useLanguageStore();
  const { removeItem } = useCartStore();
  const { prefillData, updatePrefillDataFromCart } = useOrderStore();
  const { items: cartItems } = useCartStore();

  const productCategoryId = Number(bookedProductDetail?.data?.basicinfo?.category_id);
  const isPackageTourProduct = productCategoryId === 8 || 
                               tieredPricingData?.data?.tieredPricing?.data?.product_pricing?.some(p => p.adult_sharing);
  const isAttraction = productCategoryId === 1;

  useEffect(() => {
    updatePrefillDataFromCart(cartItems);
  }, [cartItems, updatePrefillDataFromCart]);

  const [errors, setErrors] = useState({});
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [policyErrors, setPolicyErrors] = useState(null);
  const [availablePolicyIds, setAvailablePolicyIds] = useState([]);
  const [areTermsAvailable, setAreTermsAvailable] = useState(false);
  const [showCartOptions, setShowCartOptions] = useState(false);
  const [loadingButton, setLoadingButton] = useState(null);
  const [cancellationText, setCancellationText] = useState("");

  const apiData = bookedProductDetail?.data?.basicinfo;
  const imageUrl = getFullImageUrl(apiData?.images?.[0]?.image);
  const displayPrice = apiData?.starting_price || 0;

  useEffect(() => {
    setJustAdded(false);
  }, [setJustAdded]);

  useEffect(() => {
    if (!tieredPricingData && !isAttraction) return;

    const totalPaxCount = isPackageTourProduct
      ? (Number(formData.twin_sharing) || 0) + 
        (Number(formData.single_sharing) || 0) + 
        (Number(formData.child_with_bed) || 0) + 
        (Number(formData.child_without_bed) || 0)
      : (Number(formData.adults) || 0) + (Number(formData.child) || 0);

    if (isAttraction) {
      const total = formData.totalAttractionPrice || 0;
      const summary = { total, totalPax: totalPaxCount };
      setLocalPriceSummary(summary);
      if (onPriceChange) onPriceChange(summary);
      return;
    }

    let pricing = isPackageTourProduct
      ? calculateTierPricing(0, 0, tieredPricingData, true, {
          twin_sharing: formData.twin_sharing,
          single_sharing: formData.single_sharing,
          child_with_bed: formData.child_with_bed,
          child_without_bed: formData.child_without_bed,
          selectedPackageId: formData.accommodation_group_id,
          selectedHotelId: formData.group_hotel_id
        })
      : calculateTierPricing(formData.adults || 0, formData.child || 0, tieredPricingData, false);

    // Re-calculate total based on individual counts and prices from the tier,
    // as a safeguard if calculateTierPricing's total is incorrect or missing.
    if (pricing) {
        let reAggregatedTotal = 0;
        if (isPackageTourProduct) {
            reAggregatedTotal += (Number(formData.twin_sharing) || 0) * (Number(pricing.adultSharingPrice) || 0);
            reAggregatedTotal += (Number(formData.single_sharing) || 0) * (Number(pricing.adultPrivatePrice) || 0);
            reAggregatedTotal += (Number(formData.child_with_bed) || 0) * (Number(pricing.childWithBedPrice) || 0);
            reAggregatedTotal += (Number(formData.child_without_bed) || 0) * (Number(pricing.childWithoutBedPrice) || 0);
        } else {
            reAggregatedTotal += (Number(formData.adults) || 0) * (Number(pricing.adultPrice) || 0);
            reAggregatedTotal += (Number(formData.child) || 0) * (Number(pricing.childPrice) || 0);
        }

        // If re-aggregated total is valid and different from pricing.total, or pricing.total is 0, use re-aggregated.
        // This handles cases where calculateTierPricing might return correct individual prices but a wrong total.
        if (reAggregatedTotal > 0 && (pricing.total === 0 || pricing.total !== reAggregatedTotal)) {
            pricing.total = reAggregatedTotal;
        }
    }

    if (pricing) {
      // Final fallback if pricing.total is still 0 or invalid after re-aggregation
      if (pricing.total === 0) {
        const startingPrice = Number(apiData?.starting_price) || 0;
        pricing.total = startingPrice * totalPaxCount;
        // Ensure other price properties are set for consistency if using fallback
        if (isPackageTourProduct) {
          pricing.adultSharingPrice = startingPrice; // Example, might need more detailed fallback
        } else {
          pricing.adultPrice = startingPrice;
        }
      }
      const summary = { total: pricing.total, totalPax: totalPaxCount };
      setLocalPriceSummary(summary);
      if (onPriceChange) {
        onPriceChange(summary);
      }
    }
  }, [formData, tieredPricingData, isPackageTourProduct, onPriceChange, apiData?.starting_price, apiData?.currency]);

  useEffect(() => {
    if (id) {
      fetchCancellationPolicy(id, languageId).then((res) =>
        setCancellationText(res?.data?.cancellationpolicies?.description || "")
      );
    }
  }, [id, languageId, fetchCancellationPolicy]);

  const handleFormChange = (data) => {
    setFormData(data);
    setErrors((prev) => {
      const newErrors = { ...prev };
      if ("adults" in data) delete newErrors.adults;
      if ("hotel" in data) delete newErrors.hotel;
      if ("date" in data) delete newErrors.date;
      return newErrors;
    });
  };

  useEffect(() => {
    if (prefillData) {
      setFormData((prev) => ({
        ...prev,
        date: prefillData.date || prev.date,
        time: prefillData.pickup_time || prev.time,
        hotel: prefillData.pickup_point || prev.hotel,
        adults: prefillData.total_adult || prev.adults,
        child: prefillData.total_child || prev.child,
        twin_sharing: prefillData.twin_sharing || prev.twin_sharing,
        single_sharing: prefillData.single_sharing || prev.single_sharing,
        child_with_bed: prefillData.child_with_bed || prev.child_with_bed,
        child_without_bed: prefillData.child_without_bed || prev.child_without_bed,
        accommodation_group_id: prefillData.accommodation_group_id || prev.accommodation_group_id,
        group_hotel_id: prefillData.group_hotel_id || prev.group_hotel_id,
        selectedSkus: prefillData.selectedSkus || prev.selectedSkus,
        sku_details: prefillData.sku_details || prev.sku_details,
      }));
    }
  }, [prefillData]);
  
  const handleBookNow = async () => {
  setLoadingButton("addToCart");
    const validationErrors = {};
    
    let totalPaxCount = 0;
    if (isPackageTourProduct) {
      totalPaxCount = formData.twin_sharing + formData.single_sharing + formData.child_with_bed + formData.child_without_bed;
      if (totalPaxCount === 0) validationErrors.adults = "adultsError"; // Reusing adultsError for general pax count
      if (!formData.accommodation_group_id) validationErrors.accommodation_group_id = "groupError";
      const selectedGroup = bookedProductDetail?.data?.basicinfo?.accommodation_group_pricing?.find(g => String(g.group_id) === String(formData.accommodation_group_id));
      if (selectedGroup?.allow_hotel_selection && !formData.group_hotel_id) {
        validationErrors.group_hotel_id = "hotelError";
      }
    } else {
      totalPaxCount = formData.adults + formData.child;
      if (formData.adults === 0) validationErrors.adults = "adultsError";
    }

    if (!formData.date) validationErrors.date = "dateError";
    const isTermsAccepted = selectedPolicies.includes("terms_conditions");

    if (areTermsAvailable && !isTermsAccepted) {
      setPolicyErrors("You must accept the Terms & Conditions");
      setLoadingButton(null);
      return;
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoadingButton(null);
      return;
    }

    const formatDateForApi = (date) =>
      date instanceof Date
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(date.getDate()).padStart(2, "0")}`
        : date;

    const safeFormData = { ...formData, date: formatDateForApi(formData.date) };
    useProductStore.getState().setBookingDetails(safeFormData);
    const productData = useProductStore.getState().bookedProductDetail?.data;
    const title =
      productData?.basicinfo?.product_description?.title || "Untitled Tour";
    const image = productData?.basicinfo?.images?.[0]?.image || "img";
    const currency = apiData?.currency ;

    let pricing;
    if (isAttraction) {
      pricing = {
         total: formData.totalAttractionPrice || 0,
         adultPrice: 0,
         childPrice: 0,
      };
    } else {
      pricing = isPackageTourProduct
        ? calculateTierPricing(
            0, // adultCount not directly used for package tours
            0, // childCount not directly used for package tours
            tieredPricingData,
            true, // isPackageTour
            {
              twin_sharing: formData.twin_sharing,
              single_sharing: formData.single_sharing,
              child_with_bed: formData.child_with_bed,
              child_without_bed: formData.child_without_bed,
              selectedPackageId: formData.accommodation_group_id,
            }
          )
        : calculateTierPricing(
            formData.adults || 0,
            formData.child || 0,
            tieredPricingData,
            false // isPackageTour
          );
    }

    // Re-calculate total based on individual counts and prices from the tier,
    // as a safeguard if calculateTierPricing's total is incorrect or missing.
    if (!isAttraction && pricing) {
        let reAggregatedTotal = 0;
        if (isPackageTourProduct) {
            reAggregatedTotal += (Number(formData.twin_sharing) || 0) * (Number(pricing.adultSharingPrice) || 0);
            reAggregatedTotal += (Number(formData.single_sharing) || 0) * (Number(pricing.adultPrivatePrice) || 0);
            reAggregatedTotal += (Number(formData.child_with_bed) || 0) * (Number(pricing.childWithBedPrice) || 0);
            reAggregatedTotal += (Number(formData.child_without_bed) || 0) * (Number(pricing.childWithoutBedPrice) || 0);
        } else {
            reAggregatedTotal += (Number(formData.adults) || 0) * (Number(pricing.adultPrice) || 0);
            reAggregatedTotal += (Number(formData.child) || 0) * (Number(pricing.childPrice) || 0);
        }

        // If re-aggregated total is valid and different from pricing.total, or pricing.total is 0, use re-aggregated.
        if (reAggregatedTotal > 0 && (pricing.total === 0 || pricing.total !== reAggregatedTotal)) {
            pricing.total = reAggregatedTotal;
        }
    }

    // Final fallback if pricing.total is still 0 or invalid after re-aggregation
    if (!isAttraction && isPackageTourProduct) {
      // If pricing is not found or total is 0, use starting price logic (fallback)
      if (!pricing || pricing.total === 0) {
        const startingPrice = Number(productData?.basicinfo?.starting_price) || 0;
        pricing = {
          total: startingPrice * totalPaxCount,
          adultSharingPrice: startingPrice, // Fallback, might not be accurate
          adultPrivatePrice: startingPrice, // Fallback
          childWithBedPrice: startingPrice, // Fallback
          childWithoutBedPrice: startingPrice, // Fallback
        };
      }
    } else if (!isAttraction) {
      if (!pricing || pricing.total === 0) {
        const startingPrice = Number(productData?.basicinfo?.starting_price) || 0;
        pricing = {
          total:
            startingPrice * (formData.adults || 0) +
            (formData.child || 0) * startingPrice,
          adultPrice: startingPrice,
          childPrice: startingPrice,
        };
      }
    }

    useCartStore.getState().addItem({
      tourId: id,
      title,
      image,
      category_id: productCategoryId,
      category_name: productCategoryId,
      type: isAttraction ? "admission" : "daytour",
      currency,
      selectedDate: formData.date,
      selectedTime: formData.time || "09:00 AM",
      hotelName: formData.hotel,
      adults: formData.adults, // Keep for general display if needed
      child: formData.child,   // Keep for general display if needed
      totalPax: totalPaxCount,
      pricing,
      // Add package tour specific counts to cart item if it's a package tour
      ...(isPackageTourProduct && {
        twin_sharing: formData.twin_sharing,
        single_sharing: formData.single_sharing,
        child_with_bed: formData.child_with_bed,
        child_without_bed: formData.child_without_bed,
        accommodation_group_id: formData.accommodation_group_id,
        group_hotel_id: formData.group_hotel_id,
      }),
      ...(isAttraction && {
        sku_details: formData.sku_details,
        selectedSkus: formData.selectedSkus,
        totalAttractionPrice: formData.totalAttractionPrice || 0,
      }),
    });

    setJustAdded(true);
    setShowCartOptions(true);
    onBookNow(safeFormData);
    setLoadingButton(null);
  };

  const handleContinueShopping = async () => {
    setLoadingButton("continue");
    await new Promise((res) => setTimeout(res, 1200)); // simulate loading
    router.push("/transfers");
    setLoadingButton(null);
  };

  const handleViewCart = async () => {
    setLoadingButton("checkout");
    await new Promise((res) => setTimeout(res, 1200)); // simulate loading
    sessionStorage.setItem("fromBooking", "true");
    router.push("/checkout");
    setLoadingButton(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-full mx-0 md:mx-2 p-1 md:p-2">
      <div className="w-full lg:w-3/3">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-card text-card-foreground rounded-lg p-1 md:p-6 shadow-sm border border-border">
            {/* {!isPackageTourProduct && (
              <BookingPriceTable id={id} />
            )} */}
            <BookingForm
              value={formData}
              errors={errors}
              onChange={handleFormChange}
              isPackageTour={isPackageTourProduct} // Pass isPackageTour to TourBookingForm
            />
          </div>

          {/* 📱 Mobile Image Summary Card */}
          <div className="block lg:hidden">
            <Card className="border shadow-md overflow-hidden mt-2">
              <CardContent className="p-0">
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt={productTitle}
                  className="w-full h-44 object-cover"
                />
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-foreground text-base leading-tight">
                    {productTitle}
                  </h3>
                  <Separator />
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
                    <Tag className="w-4 h-4 text-primary" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {localPriceSummary?.totalPax > 0 ? t("total") : t("price")}
                      </p>
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-foreground">
                          {localPriceSummary?.totalPax > 0 ? "" : t("startingFrom") + " "} {apiData?.currency} {localPriceSummary?.totalPax > 0 ? localPriceSummary.total : displayPrice}
                        </p>
                        {localPriceSummary?.totalPax > 0 && (
                          <p className="text-xs font-bold text-primary">
                            x{localPriceSummary.totalPax} {t("pax")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 📜 Policy + Buttons */}
          <div className="bg-card text-card-foreground rounded-lg p-2 px-6 md:px-5 md:p-5 shadow-sm border border-border">
            {cancellationText && (
              <p className="md:text-sm text-xs py-1 text-muted-foreground whitespace-pre-line">{cancellationText}</p>
            )}

            <div className="mt-2 flex flex-col sm:flex-row justify-between gap-3">
              <div>
                <BookingPolicySection
                  selectedOptions={selectedPolicies}
                  setSelectedOptions={setSelectedPolicies}
                  productId={id}
                  errors={policyErrors}
                  setErrors={setPolicyErrors}
                  setAvailablePolicyIds={setAvailablePolicyIds}
                  onTermsAvailabilityChange={setAreTermsAvailable}
                />
              </div>

              {!showCartOptions ? (
                <button
                  onClick={handleBookNow}
                  disabled={loadingButton === "addToCart"}
                  className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium px-4 py-3 rounded-lg transition w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  {loadingButton === "addToCart" ? (
                    <>
                      <LoaderSvg /> {t("processing")}
                    </>
                  ) : (
                    t("addToCart")
                  )}
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleContinueShopping}
                    disabled={loadingButton === "continue"}
                    className="bg-muted hover:bg-secondary text-foreground font-medium px-4 py-3 rounded-lg w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    {loadingButton === "continue" ? (
                      <>
                        <LoaderSvg /> {t("processing")}
                      </>
                    ) : (
                      t("continueShopping")
                    )}
                  </button>

                  <button
                    onClick={handleViewCart}
                    disabled={loadingButton === "checkout"}
                    className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium px-4 py-3 rounded-lg w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    {loadingButton === "checkout" ? (
                      <>
                        <LoaderSvg /> {t("processing")}
                      </>
                    ) : (
                      t("checkout","Checkout")
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookNow;
