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
import {toast} from "react-toastify";

const BookNow = ({ onBookNow, id, productTitle, editMode, edit }) => {
  const { t } = useTranslation("daytour");
  const router = useRouter();
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    hotel: "",
    adults: 0,
    child: 0,
  });

  const { setJustAdded, justAdded } = useDrawerStore();
  const { tieredPricingData, bookedProductDetail, fetchCancellationPolicy } = useProductStore();
  const { languageId } = useLanguageStore();
  const { removeItem } = useCartStore();
  const { prefillData, updatePrefillDataFromCart } = useOrderStore();
  const { items: cartItems } = useCartStore();
  useEffect(() => {
    updatePrefillDataFromCart(cartItems);
  }, [cartItems, updatePrefillDataFromCart]);

  const [errors, setErrors] = useState({});
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [policyErrors, setPolicyErrors] = useState(null);
  const [availablePolicyIds, setAvailablePolicyIds] = useState([]);
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
      }));
    }
  }, [prefillData]);  const handleBookNow = async () => {
  setLoadingButton("addToCart");
    const validationErrors = {};
    if (!formData.adults) validationErrors.adults = "adultsError";
    if (!formData.date) validationErrors.date = "dateError";
    const isTermsAccepted = selectedPolicies.includes("terms_conditions");

    if (!isTermsAccepted) {
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
    
    const isShuttle = apiData?.category_id === 2;
    alert(apiData?.category_id === 2);
    const selectedTime = isShuttle ? formData.pickupTime : formData.time;

    let pickupPointId = null;
    let dropoffPointId = null;

    if (isShuttle) {
      const pickupObj = apiData?.pickup_group_list?.find((p) => p.pickup_point_name === formData.pickupPoint);
      if (pickupObj) pickupPointId = pickupObj.id || pickupObj.pickup_point_id;

      const dropoffObj = apiData?.dropoff_point_group_list?.find((d) => d.dropoff_point_name === formData.dropoffPoint);
      if (dropoffObj) dropoffPointId = dropoffObj.id || dropoffObj.dropoff_point_id;
    }

    let pricing = calculateTierPricing(
      formData.adults || 0,
      formData.child || 0,
      tieredPricingData
    );
    if (!pricing || pricing.total === 0) {
      const startingPrice = productData?.basicinfo?.starting_price || 0;
      pricing = {
        total:
          startingPrice * (formData.adults || 0) +
          (formData.child || 0) * startingPrice,
        adultPrice: startingPrice,
        childPrice: startingPrice,
      };
    }

    useCartStore.getState().addItem({
      tourId: id,
      title,
      image,
      category_name: apiData?.category_id,
      currency,
      selectedDate: formData.date||"20-11-2018",
      selectedTime: selectedTime || "09:00 AM",
      pickupPoint: isShuttle ? formData.pickupPoint : formData.hotel,
      dropoffPoint: isShuttle ? formData.dropoffPoint : "",
      pickupPointId,
      dropoffPointId,
      type:isShuttle ? "shuttle Service" : "daytour",
      adults: formData.adults,
      child: formData.child,
      totalPax: formData.adults + formData.child,
      pricing,
    });

    setJustAdded(true);
    setShowCartOptions(true);
    onBookNow(safeFormData);
    setLoadingButton(null);
    toast.success("Added to cart");
  };

  const handleContinueShopping = async () => {
    setLoadingButton("continue");
    await new Promise((res) => setTimeout(res, 1200)); // simulate loading
    router.push("/");
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
    <div className="flex flex-col lg:flex-row gap-8 max-w-full mx-0 md:mx-2 lg:mx-0">
      <div className="w-full lg:w-3/3">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-lg p-1 md:p-6 shadow-sm border border-gray-100">
            {apiData?.category_id !== 2 && <BookingPriceTable id={id} />}
            <BookingForm
              value={formData}
              errors={errors}
              onChange={handleFormChange}
              isBookingAdded={showCartOptions}
              categoryId={apiData?.category_id}
              pickupGroupList={apiData?.pickup_group_list}
              dropoffPointGroupList={apiData?.dropoff_point_group_list}
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
                  <h3 className="font-semibold text-gray-900 text-base leading-tight">
                    {productTitle}
                  </h3>
                  <Separator />
                  <div className="flex items-center gap-3 p-3 bg-\gray-50 rounded-lg">
                    <Tag className="w-4 h-4 text-gray-600" />
                    <p className="font-medium text-gray-900">
                      {t("startingFrom")} {apiData?.currency} {displayPrice}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 📜 Policy + Buttons */}
          <div className="bg-white rounded-lg p-2 px-6 md:px-5 md:p-5 shadow-sm border border-gray-100">
            {cancellationText && (
              <p className="md:text-sm text-xs py-1 text-gray-700 whitespace-pre-line">{cancellationText}</p>
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
                />
              </div>

              {!showCartOptions ? (
                <button
                  onClick={handleBookNow}
                  disabled={loadingButton === "addToCart"}
                  className="bg-[#D3202D]  text-white font-medium px-4 py-3 rounded-lg transition w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  {loadingButton === "addToCart" ? (
                    <>
                      <LoaderSvg color="#fff"/> {t("processing")}
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
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-3 rounded-lg w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    {loadingButton === "continue" ? (
                      <>
                        <LoaderSvg color="#000" /> {t("processing")}
                      </>
                    ) : (
                      t("continueShopping")
                    )}
                  </button>

                  <button
                    onClick={handleViewCart}
                    disabled={loadingButton === "checkout"}
                    className="bg-[#D3202D] text-white font-medium px-4 py-3 rounded-lg w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    {loadingButton === "checkout" ? (
                      <>
                        <LoaderSvg color="#fff"/> {t("processing")}
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
