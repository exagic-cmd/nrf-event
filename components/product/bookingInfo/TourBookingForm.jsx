"use client"

import React, { useState, useEffect, useRef,useMemo } from "react"
import useBookingStore from "@/store/userBookingStore"
import { useRouter } from "next/router"
import { useProductStore } from "@/store/useProductStore"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import AsyncSelect from "react-select/async"
import PassengerModal from "@/components/product/ProductInfo/PassengerModal"
import { Users, Hotel, CalendarDays, Clock, Tag, MapPin, Package, Ticket, AlertTriangle, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "next-i18next";
import BookingPriceTable from "@/components/product/bookingInfo/BookingPriceTable";

const TourBookingForm = ({ value = {}, onChange, onHotelsAvailable, errors = {}, isPackageTour = false }) => {
  const router = useRouter()
  const { t } = useTranslation("daytour");
  const { id: productId } = router.query
  const { tieredPricingData, bookedProductDetail } = useProductStore()
  const [pickupTimesByDate, setPickupTimesByDate] = useState({});
  const pricingList = tieredPricingData?.tieredPricing?.data?.product_pricing || []
  const minPax = pricingList.length > 0 ? Math.min(...pricingList.map((p) => Number(p.min_pax))) : 1
  const maxPax = pricingList.length > 0 ? Math.max(...pricingList.map((p) => Number(p.max_pax))) : 1
  
  const productCategoryId = Number(bookedProductDetail?.data?.basicinfo?.category_id);
  const isAttraction = productCategoryId === 1;
  const isBookingAllowed = isAttraction ? (bookedProductDetail?.data?.basicinfo?.linked_type?.toLowerCase() === 'cebu' && bookedProductDetail?.data?.basicinfo?.cebu_sku_mappings?.length > 0) : true;


 const [form, setForm] = useState({
  adults: typeof value.adults === "number" && value.adults >= minPax ? value.adults : minPax,
  child: value.child ?? 0,
  hotel: value.hotel ?? "",
  time: value.time ?? "",
  date: value.date ?? "",
  twin_sharing: value.twin_sharing ?? 0,
  single_sharing: value.single_sharing ?? 0,
  child_with_bed: value.child_with_bed ?? 0,
  child_without_bed: value.child_without_bed ?? 0,
  accommodation_group_id: value.accommodation_group_id ?? "",
  group_hotel_id: value.group_hotel_id ?? "",
  selectedSkus: value.selectedSkus ?? {},
})

const [attractionData, setAttractionData] = useState(null);
const [attractionLoading, setAttractionLoading] = useState(false);
const [selectedSkus, setSelectedSkus] = useState(value.selectedSkus || {});



  const [availableDates, setAvailableDates] = useState([])
  const [availableDateStrings, setAvailableDateStrings] = useState(new Set())
  const [availableTimes, setAvailableTimes] = useState([])
  const [loadingDates, setLoadingDates] = useState(false)
  const [loadingTimes, setLoadingTimes] = useState(false)
  const [errorDates, setErrorDates] = useState("")
  const [errorTimes, setErrorTimes] = useState("")
  const [showPassengerModal, setShowPassengerModal] = useState(false)
  const [formBeforeModal, setFormBeforeModal] = useState(null)

  const {
    fetchPickupPointCity,
    fetchAvailableDates,
    pickupPoints,
    loadingPickup,
    errorPickup,
    searchPickupPoints,
  } = useBookingStore()

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
  // Initialize form state from props
  setForm(prev => {
    // Prevent unnecessary updates if values are the same
    if (
      prev.adults === (typeof value.adults === "number" && value.adults >= minPax ? value.adults : minPax) &&
      prev.child === (value.child ?? 0) &&
      prev.hotel === (value.hotel ?? "") &&
      prev.time === (value.time ?? "") &&
      prev.date === (value.date ?? "") &&
      prev.twin_sharing === (value.twin_sharing ?? 0) &&
      prev.single_sharing === (value.single_sharing ?? 0) &&
      prev.child_with_bed === (value.child_with_bed ?? 0) &&
      prev.child_without_bed === (value.child_without_bed ?? 0) &&
      prev.accommodation_group_id === (value.accommodation_group_id ?? "") &&
      prev.group_hotel_id === (value.group_hotel_id ?? "")
    ) {
      return prev;
    }

    const initialTwin = value.twin_sharing ?? 0;
    const initialSingle = value.single_sharing ?? 0;
    const initialCWB = value.child_with_bed ?? 0;
    const initialCWOB = value.child_without_bed ?? 0;
    const currentTotal = initialTwin + initialSingle + initialCWB + initialCWOB;

    return {
      adults: typeof value.adults === "number" && value.adults >= minPax ? value.adults : minPax,
      child: value.child ?? 0,
      hotel: value.hotel ?? "",
      time: value.time ?? "",
      date: value.date ?? "",
      twin_sharing: isPackageTour && currentTotal === 0 ? minPax : initialTwin,
      single_sharing: value.single_sharing ?? 0,
      child_with_bed: value.child_with_bed ?? 0,
      child_without_bed: value.child_without_bed ?? 0,
      accommodation_group_id: value.accommodation_group_id ?? "",
      group_hotel_id: value.group_hotel_id ?? "",
      selectedSkus: value.selectedSkus ?? {},
    };
  });
  if (value.selectedSkus && JSON.stringify(value.selectedSkus) !== JSON.stringify(selectedSkus)) {
    setSelectedSkus(value.selectedSkus);
  }
}, [value, minPax, isPackageTour]); // Depend on the entire 'value' prop, minPax and tour type

useEffect(() => {
  if (!productId) return;
  if (!isPackageTour && !isAttraction && !form.hotel) return;
  
  // Requirement 4: Conditional Logic for Package Tours
  if (isPackageTour) {
    if (!form.accommodation_group_id) return;
    const selectedGroup = bookedProductDetail?.data?.basicinfo?.accommodation_group_pricing?.find(g => String(g.group_id) === String(form.accommodation_group_id));
    if (selectedGroup?.allow_hotel_selection && !form.group_hotel_id) return;
  }

  setLoadingDates(true);
  fetchAvailableDates(productId, form.adults, form.child, form.accommodation_group_id, form.group_hotel_id)
    .then((availabilityData) => {
      const validDates = [];
      const dateMap = {};

      const deepParseJson = (value) => {
        if (typeof value !== 'string') {
          if (Array.isArray(value)) return value.map(deepParseJson).flat();
          return value;
        }
        try {
          return deepParseJson(JSON.parse(value));
        } catch (e) {
          return value;
        }
      };

      for (const entry of availabilityData) {
        if (entry.available) {
          const entryDate = new Date(entry.date + "T00:00:00");
          // Only include dates that are today or in the future
          if (entryDate >= today) {
            validDates.push(entry.date);
          let finalTimes = [];
          if (entry.pickup_time && entry.pickup_time.length > 0) {
            const parsedTimes = entry.pickup_time.map(t => deepParseJson(t)).flat(Infinity);
            finalTimes = parsedTimes.filter(item => typeof item === 'string' && item.trim() !== '');
          }
          dateMap[entry.date] = finalTimes;
          }
        }
      }

      setAvailableDates(validDates.map(d => new Date(d + "T00:00:00")));
      setAvailableDateStrings(new Set(validDates));
      setPickupTimesByDate(dateMap);
      setForm((prev) => {
        const updated = { ...prev };

        const dateStr = updated.date instanceof Date 
           ? updated.date.getFullYear() + "-" + String(updated.date.getMonth() + 1).padStart(2, "0") + "-" + String(updated.date.getDate()).padStart(2, "0")
           : updated.date;

        // Only prefill or keep the date if it lies within the available dates fetched from API and is not in the past
        if (!validDates.includes(dateStr) || !updated.date || isNaN(new Date(updated.date).getTime())) {
          updated.date = null;
          updated.time = "";
        }

        // Auto-select time if available for the selected date
        if (updated.date) {
           const finalDateStr = updated.date instanceof Date 
              ? updated.date.getFullYear() + "-" + String(updated.date.getMonth() + 1).padStart(2, "0") + "-" + String(updated.date.getDate()).padStart(2, "0")
              : updated.date;
           
           const times = dateMap[finalDateStr] || [];
           
           if (times.length > 0) {
              // If current time is invalid or empty, select the first available time
              if (!updated.time || !times.includes(updated.time)) {
                 updated.time = times[0];
              }
           } else {
              updated.time = "";
           }
        }

        onChange && onChange({ ...updated, availableTimes: [] });
        return updated;
      });

      setLoadingDates(false);
    })
    .catch(() => {
      setAvailableDates([]);
      setAvailableDateStrings(new Set());
      setPickupTimesByDate({});
      setErrorDates(t("bookingForm.failedToLoadDates"));
      setLoadingDates(false);
    });
}, [productId, form.adults, form.child, form.hotel, isPackageTour, today, form.accommodation_group_id, form.group_hotel_id, tieredPricingData, bookedProductDetail, isAttraction]);

const getTicketTimes = (data = attractionData) => {
  if (!data) return [];
  if (data.timeslots?.length > 0) return data.timeslots;
  const times = new Set();
  data.skus?.forEach(sku => {
    sku.slots?.forEach(slot => {
      if (slot.time) times.add(slot.time);
    });
  });
  return Array.from(times).sort();
};

useEffect(() => {
  if (!isAttraction || !form.date) return;
  const fetchAttractionData = async () => {
    setAttractionLoading(true);
    setAttractionData(null);
    setSelectedSkus({});
    
    let dateStr = form.date;
    if (form.date instanceof Date) {
      dateStr = form.date.getFullYear() + "-" + String(form.date.getMonth() + 1).padStart(2, "0") + "-" + String(form.date.getDate()).padStart(2, "0");
    }

    try {
      // In a real app we might get token from a store or cookies. For now, try fetching
      let token = "";
      try { token = JSON.parse(localStorage.getItem("auth-storage"))?.state?.token || ""; } catch(e){}
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/cebu/grouped-sku-availabilities?product_id=${productId}&date=${dateStr}`, {
        headers: {
           ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
           'Content-Type': 'application/json'
        }
      });
      const res = await response.json();
      if ((res.status === "success" || res.statuscode === "E_SUCC") && (res.data || res.output)) {
        const data = res.data || res.output;
        setAttractionData(data);
        const times = getTicketTimes(data);
        if (times.length === 1) {
          handleChange("time", times[0]);
        } else if (!times.includes(form.time)) {
          handleChange("time", "");
        }
      } else {
        setAttractionData({ skus: [], timeslots: [] });
      }
    } catch (error) {
      console.error("Error fetching attraction data:", error);
      setAttractionData(null);
    } finally {
      setAttractionLoading(false);
    }
  };
  fetchAttractionData();
}, [form.date, isAttraction, productId]);

    useEffect(() => {
    if (!productId) return
    fetchPickupPointCity(productId)
  }, [productId])

  useEffect(() => {
    if (onHotelsAvailable) {
      onHotelsAvailable(Array.isArray(pickupPoints) && pickupPoints.length > 0)
    }
  }, [pickupPoints, onHotelsAvailable])

  // for edit
 // Removed redundant useEffect that was causing conflicts with the main initialization effect


  const handleOpenPassengerModal = () => {
    setFormBeforeModal(form)
    setShowPassengerModal(true)
  }

  const handleCancelPassengerModal = () => {
    if (formBeforeModal) {
      setForm(formBeforeModal)
    }
    setShowPassengerModal(false)
  }

  const handlePassengerApply = (newPaxData) => {
    setShowPassengerModal(false)
    let updatedForm;
    if (isPackageTour) {
       updatedForm = { ...form, ...newPaxData };
    } else {
       updatedForm = { ...form, adults: newPaxData.adults, child: newPaxData.child }
    }
    
    setForm(updatedForm)
    
    const totalPaxCount = isPackageTour 
      ? (Number(updatedForm.twin_sharing) || 0) + (Number(updatedForm.single_sharing) || 0) + (Number(updatedForm.child_with_bed) || 0) + (Number(updatedForm.child_without_bed) || 0) 
      : (Number(updatedForm.adults) || 0) + (Number(updatedForm.child) || 0);

    if (totalPaxCount >= minPax) {
      onChange && onChange({ ...updatedForm, availableTimes: [] });
      setLoadingDates(true);
    }
  }

  const handleChange = (field, value) => {
    let newValue = value
    if (field === "date" && value instanceof Date) {
      const year = value.getFullYear()
      const month = String(value.getMonth() + 1).padStart(2, "0")
      const day = String(value.getDate()).padStart(2, "0")
      newValue = `${year}-${month}-${day}`
    }
    
    // Requirement 6: Disable hotel selection until group is selected
    if (field === "accommodation_group_id") {
      const updatedForm = { ...form, accommodation_group_id: newValue, group_hotel_id: "" };
      setForm(updatedForm);
      onChange && onChange(updatedForm);
      return;
    }

    let updated = { ...form, [field]: newValue }

    if (field === "date") {
      const times = pickupTimesByDate[newValue] || []
      if (times.length > 0) {
       if (!updated.time || !times.includes(updated.time)) {
          updated.time = times[0]
        }
      } else {
        updated.time = ""
      }
    }

    setForm(updated)
    const currentTotalPax = isPackageTour 
      ? (Number(updated.twin_sharing) || 0) + (Number(updated.single_sharing) || 0) + (Number(updated.child_with_bed) || 0) + (Number(updated.child_without_bed) || 0)
      : (Number(updated.adults) || 0) + (Number(updated.child) || 0);

    if (currentTotalPax >= minPax) {
      let totalPrice = 0;
      let skuDetails = [];
      if (isAttraction && attractionData?.skus) {
         Object.keys(updated.selectedSkus || {}).forEach(skuId => {
            const qty = updated.selectedSkus[skuId];
            const sku = attractionData.skus.find(s => s.sku_id === skuId);
            if (sku) {
               let price = 0;
               if (!sku.slots?.length) price = 0;
               else if (getTicketTimes().length === 0) price = sku.slots[0]?.price || 0;
               else if (updated.time) price = sku.slots.find(s => s.time === updated.time)?.price || 0;
               else price = sku.slots[0].price || 0;
               
               totalPrice += price * qty;
               skuDetails.push({ ...sku, price, quantity: qty });
            }
         });
      }
      onChange && onChange({ ...updated, availableTimes, sku_details: skuDetails, totalAttractionPrice: totalPrice })
    } else {
      console.warn(t("bookingForm.totalPax") + " " + minPax)
    }
  }

  const loadPickupPoints = (inputValue, callback) => {
    if (!inputValue) {
      callback(pickupPoints.map(p => ({ label: p.name, value: p.name })));
      return;
    }
    searchPickupPoints(productId, inputValue).then(results => {
      const formattedResults = results.map(p => ({ label: p.name, value: p.name }));
      callback(formattedResults);
    });
  };

  const CustomInput = React.forwardRef(({ value, onClick, className, placeholder }, ref) => (
    <div
      className={`${className} w-full cursor-pointer border border-border text-sm rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-left bg-background hover:border-primary transition-colors h-12`}
      onClick={onClick}
      ref={ref}
    >
      {value ? value : <span className="text-muted-foreground">{placeholder}</span>}
    </div>
  ))

  const displayTotalPax = isPackageTour
    ? (Number(form.twin_sharing) || 0) + (Number(form.single_sharing) || 0) + (Number(form.child_with_bed) || 0) + (Number(form.child_without_bed) || 0)
    : (Number(form.adults) || 0) + (Number(form.child) || 0);

  const selectedGroupData = isPackageTour 
    ? bookedProductDetail?.data?.basicinfo?.accommodation_group_pricing?.find(g => String(g.group_id) === String(form.accommodation_group_id)) 
    : null;

  const getSkuType = (skuName) => {
    const name = (skuName || '').toLowerCase();
    if (name.includes("child") && !name.includes("adult")) return "child";
    return "adult";
  };

  const updatePaxFromSkus = (currentSelectedSkus) => {
    let adults = 0;
    let children = 0;
    let totalPrice = 0;
    const skuDetails = [];
    Object.keys(currentSelectedSkus).forEach((skuId) => {
      const qty = currentSelectedSkus[skuId];
      const sku = attractionData?.skus?.find((s) => s.sku_id === skuId);
      if (sku) {
        if (getSkuType(sku.name) === "child") children += qty;
        else adults += qty;
        const price = getSkuPrice(sku);
        totalPrice += price * qty;
        skuDetails.push({ ...sku, price, quantity: qty });
      }
    });
    setForm(prev => {
      const updated = { ...prev, adults, child: children, selectedSkus: currentSelectedSkus };
      onChange && onChange({ ...updated, availableTimes, sku_details: skuDetails, totalAttractionPrice: totalPrice });
      return updated;
    });
  };

  const filteredCebuSkus = () => {
    if (!isAttraction || !attractionData?.skus) return [];
    const times = getTicketTimes();
    if (times.length === 0) return attractionData.skus;
    if (!form.time) return [];
    return attractionData.skus.filter(sku =>
      sku.slots?.some(slot => slot.time === form.time)
    );
  };

  const getSkuAvailability = (sku) => {
    if (!isAttraction || !sku) return 0;
    if (getTicketTimes().length === 0) {
      return sku.slots?.[0]?.available_quantity || 0;
    }
    if (!form.time) return 0;
    const currentSlot = sku.slots?.find(s => s.time === form.time);
    if (!currentSlot) return 0;
    const originalAvailability = currentSlot.available_quantity || 0;
    if (sku.type !== 'shared' || !sku.slot_id) return originalAvailability;

    let usedQuantity = 0;
    const sharedSkus = attractionData?.skus?.filter(s => s.slot_id === sku.slot_id) || [];
    sharedSkus.forEach(sharedSku => {
      if (sharedSku.slots?.some(s => s.time === form.time)) {
        usedQuantity += selectedSkus[sharedSku.sku_id] || 0;
      }
    });
    return Math.max(0, originalAvailability - usedQuantity);
  };

  const getSkuPrice = (sku) => {
    if (!sku?.slots?.length) return 0;
    if (getTicketTimes().length === 0) return sku.slots[0]?.price || 0;
    if (form.time) {
      return sku.slots.find(s => s.time === form.time)?.price || 0;
    }
    return sku.slots[0].price || 0;
  };

  const updateSkuQuantity = (skuId, delta) => {
    const sku = attractionData?.skus?.find(s => s.sku_id === skuId);
    if (!sku) return;
    const currentQty = selectedSkus[skuId] || 0;
    const newQty = Math.max(0, currentQty + delta);

    if (delta > 0) {
      if (getTicketTimes().length === 0) {
        const available = getSkuAvailability(sku);
        if (newQty > available) return; // Cannot exceed
      } else {
        const targetTime = form.time;
        const currentSlot = sku.slots?.find(s => s.time === targetTime);
        if (!currentSlot) return;
        const originalAvailability = currentSlot.available_quantity || 0;
        let totalSelectedInGroup = delta;
        const sharedSkus = (sku.type === 'shared' && sku.slot_id)
          ? (attractionData?.skus?.filter(s => s.slot_id === sku.slot_id) || [])
          : [sku];
        sharedSkus.forEach(s => {
          if (s.slots?.some(sl => sl.time === targetTime)) {
            totalSelectedInGroup += selectedSkus[s.sku_id] || 0;
          }
        });
        if (totalSelectedInGroup > originalAvailability) return; // Cannot exceed
      }
    }
    
    const newSelectedSkus = { ...selectedSkus };
    if (newQty === 0) {
      delete newSelectedSkus[skuId];
    } else {
      newSelectedSkus[skuId] = newQty;
    }
    setSelectedSkus(newSelectedSkus);
    updatePaxFromSkus(newSelectedSkus);
  };


  return (
    <>
      {/* Main Form Card */}
      <Card className="">
        <CardContent className="p-6 space-y-6">
          {/* Requirement 3: Package Group & Hotel Selection */}
          {isPackageTour && bookedProductDetail?.data?.basicinfo?.accommodation_group_pricing?.length > 0 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="flex font-medium text-sm text-foreground items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  {t("selectPackageGroup", "Select Package Group")} <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.accommodation_group_id}
                  onChange={(e) => handleChange("accommodation_group_id", e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary h-12 bg-background text-foreground"
                >
                  <option value="">{t("chooseGroup", "Choose a group")}</option>
                  {bookedProductDetail?.data?.basicinfo?.accommodation_group_pricing?.map(g => (
                    <option key={g.group_id} value={g.group_id}>{g.name}</option>
                  ))}
                </select>
                {errors.accommodation_group_id && <div className="text-sm text-red-500">{t("groupError", "Please select a group")}</div>}
              </div>

              {selectedGroupData?.allow_hotel_selection && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                  <label className="flex font-medium text-sm text-foreground items-center gap-2">
                    <Hotel className="w-4 h-4 text-primary" />
                    {t("selectPreferredHotel", "Select Preferred Hotel")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.group_hotel_id}
                    onChange={(e) => handleChange("group_hotel_id", e.target.value)}
                    className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary h-12 bg-background text-foreground"
                  >
                    <option value="">{t("chooseHotel", "Choose a hotel")}</option>
                    {selectedGroupData.hotels?.map((h, i) => (
                      <option key={i} value={h.id || h}>{h.title || h}</option>
                    ))}
                  </select>
                  {errors.group_hotel_id && <div className="text-sm text-red-500">{t("hotelError", "Please select a hotel")}</div>}
                </div>
              )}
            </div>
          )}

          {/* 2. Pricing Table (Tier Pricing) */}
          {(!isPackageTour || (isPackageTour && form.accommodation_group_id)) && !isAttraction && (
            <BookingPriceTable id={productId} accommodation_group_id={form.accommodation_group_id} />
          )}

          {/* Passenger Count (Pax) */}
          {!isAttraction && (
          <div className="space-y-3">
            <label className="flex font-medium text-sm text-foreground items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              {t("bookingForm.totalPax")} <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              className="w-full border border-border rounded-lg px-4 py-3 text-left flex justify-between items-center bg-background hover:bg-muted hover:border-primary transition-colors h-12 focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={handleOpenPassengerModal}
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {isPackageTour ? (
                    <span className="text-xs">
                      {form.twin_sharing > 0 && `${form.twin_sharing} ${t("twinSharingAbbr", "Ad Sh")}, `}
                      {form.single_sharing > 0 && `${form.single_sharing} ${t("singleSharingAbbr", "Ad Pr")}, `}
                      {form.child_with_bed > 0 && `${form.child_with_bed} ${t("childWithBedAbbr", "Ch w/B")}, `}
                      {form.child_without_bed > 0 && `${form.child_without_bed} ${t("childWithoutBedAbbr", "Ch w/o B")}`}
                      {form.twin_sharing === 0 && form.single_sharing === 0 && form.child_with_bed === 0 && form.child_without_bed === 0 && t('selectParticipants')}
                    </span>
                  ) : (
                    <>
                      {form.adults || 0} {form.adults === 1 ? t("bookingForm.adults") : t("bookingForm.adults_plural")}, {" "}
                      {form.child || 0} {form.child === 1 ? t("bookingForm.child") : t("bookingForm.child_plural")}
                    </>
                  )}
                </span>
              </span>
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                {displayTotalPax} {t("bookingForm.total")}
              </Badge>
            </button>
          </div>
 )}
          {/* Passenger Modal */}
          <PassengerModal
            open={showPassengerModal}
            adults={form.adults}
            child={form.child}
            minPax={minPax}
            maxPax={maxPax}
            pricingList={tieredPricingData?.tieredPricing?.data?.product_pricing || []}
            onClose={handleCancelPassengerModal}
            onApply={handlePassengerApply}
            isPackageTour={isPackageTour}
            packageData={{
              twin_sharing: form.twin_sharing,
              single_sharing: form.single_sharing,
              child_with_bed: form.child_with_bed,
              child_without_bed: form.child_without_bed
            }}
          />
         

          {/* Attraction Ticket Selection */}
          {isAttraction && !isBookingAllowed && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3">
               <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
               <div>
                 <h6 className="font-semibold text-yellow-800 text-sm mb-1">{t("bookingNotAvailable", "Booking Not Available")}</h6>
                 <p className="text-sm text-yellow-700">{t("noSkuMapping", "No SKU Mappings were found for this attraction. Booking cannot proceed.")}</p>
               </div>
            </div>
          )}
          
          {isAttraction && isBookingAllowed && form.date && (getTicketTimes().length === 0 || form.time) && (
            <div className="space-y-3">
               <label className="flex font-medium text-sm text-foreground items-center gap-2">
                 <Ticket className="w-4 h-4 text-primary" />
                 {t("selectTickets", "Select Tickets")}
               </label>
               {attractionLoading ? (
                 <div className="flex justify-center p-4">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                 </div>
               ) : filteredCebuSkus().length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredCebuSkus().map(sku => (
                       <div key={sku.sku_id} className="border border-border rounded-lg p-3 flex justify-between items-center bg-background">
                         <div className="flex flex-col gap-1 overflow-hidden pr-2">
                           <span className="text-sm font-semibold truncate text-foreground">{sku.name}</span>
                           <span className="text-sm font-bold text-primary">{bookedProductDetail?.data?.basicinfo?.currency || ''} {getSkuPrice(sku)}</span>
                           {getSkuAvailability(sku) > 0 ? (
                             <span className="text-xs text-muted-foreground">{t("available", "Available")}: {getSkuAvailability(sku)}</span>
                           ) : (
                             <span className="text-xs text-red-600 font-semibold">{t("soldOut", "Sold Out")}</span>
                           )}
                         </div>
                         <div className="flex items-center gap-3">
                           <button type="button" disabled={!(selectedSkus[sku.sku_id] > 0)} onClick={() => updateSkuQuantity(sku.sku_id, -1)} className="w-7 h-7 rounded-full border border-primary/30 bg-primary/10 text-primary flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary hover:text-white transition-colors">-</button>
                           <span className="text-sm font-bold w-4 text-center">{selectedSkus[sku.sku_id] || 0}</span>
                           <button type="button" disabled={getSkuAvailability(sku) <= (selectedSkus[sku.sku_id] || 0)} onClick={() => updateSkuQuantity(sku.sku_id, 1)} className="w-7 h-7 rounded-full border border-primary/30 bg-primary/10 text-primary flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary hover:text-white transition-colors">+</button>
                         </div>
                       </div>
                    ))}
                 </div>
               ) : (
                 <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-center gap-2 text-sm text-blue-800">
                    <Info className="w-4 h-4" />
                    <span>{t("noTicketsFound", "No tickets found for the selected date and time.")}</span>
                 </div>
               )}
            </div>
          )}

          {/* Hotel Selection (For non-package tours) */}
          {!isPackageTour && !isAttraction && (
            <div className="space-y-3 ">
              <label className="flex font-medium text-sm text-foreground items-center gap-2">
                <Hotel className="w-4 h-4 text-primary" />
                {t("bookingForm.selectHotel")} <span className="text-red-500">*</span>
              </label>
              <SelectField
                className=""
                value={form.hotel ? { label: form.hotel, value: form.hotel } : null}
                onChange={(selected) => {
                  handleChange("hotel", selected ? selected.value : "")
                }}
                pickupPoints={pickupPoints}
                loadOptions={loadPickupPoints}
                loading={loadingPickup}
                error={errorPickup}
                t={t}
              />
              {errors.hotel && <div className="text-sm text-red-500 mt-1">{t(errors.hotel)}</div>}
            </div>
          )}

          {/* Date */}
          <div className="space-y-3">
            <label className="flex font-medium text-sm text-foreground items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              {t("bookingForm.selectDate")} <span className="text-red-500">*</span>
            </label>
            <DatePicker
              selected={
                form.date && !isNaN(new Date(form.date + "T00:00:00").getTime())
                  ? new Date(form.date + "T00:00:00")
                  : null
              }
              onChange={(date) => handleChange("date", date)}
              dateFormat="yyyy-MM-dd"
               popperPlacement="bottom-start"
              placeholderText={t("bookingForm.selectDate")}
              includeDates={availableDates}
              minDate={today}
              dayClassName={(date) => {
                const localDateStr =
                  date.getFullYear() +
                  "-" +
                  String(date.getMonth() + 1).padStart(2, "0") +
                  "-" +
                  String(date.getDate()).padStart(2, "0")
                return availableDateStrings.has(localDateStr) ? "bg-primary/15 text-foreground hover:bg-primary hover:text-primary-foreground" : ""
              }}
              customInput={<CustomInput className="w-full" />}
              wrapperClassName="w-full"
            />
            {loadingDates && (
              <div className="text-sm text-primary mt-1 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                {t("bookingForm.loadingDates")}
              </div>
            )}
            {(errorDates || errors.date) && (
              <div className="text-sm text-red-500 mt-1">{t(errorDates || errors.date)}</div>
            )}
          </div>

         {/* Time */}
<div className="space-y-3">
  <label className="flex font-medium text-sm text-foreground items-center gap-2">
    <Clock className="w-4 h-4 text-primary" />
    {t("bookingForm.time")} <span className="text-red-500">*</span>
  </label>
  {form.date ? (
    (() => {
      const dateStr = form.date;
      const times = isAttraction ? getTicketTimes() : (pickupTimesByDate[dateStr] || []);
      if (times.length === 0) {
        return (
          <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            {t("bookingForm.pickupTimesUnavailable")}
          </div>
        );
      }

      const timeToDate = (timeStr) => {
        if (!timeStr) return null;
        const date = new Date();
        const isPM = /pm/i.test(timeStr);
        const isAM = /am/i.test(timeStr);
        let [hours, minutes] = timeStr.replace(/am|pm/i, '').trim().split(':');
        hours = parseInt(hours, 10);
        minutes = parseInt(minutes, 10);
        if (isPM && hours < 12) hours += 12;
        if (isAM && hours === 12) hours = 0;
        date.setHours(hours, minutes, 0, 0);
        return date;
      };

      return (
        <DatePicker
          selected={timeToDate(form.time)}
          onChange={(date) => {
            if (date) {
              const timeString = date.toTimeString().slice(0, 5);
              handleChange("time", timeString);
            } else {
              handleChange("time", "");
            }
          }}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={15}
          timeCaption={t("bookingForm.time")}
          dateFormat="h:mm aa"
          placeholderText={t("bookingForm.time")}
          customInput={<CustomInput className="w-full" />}
          wrapperClassName="w-full"
          includeTimes={times.map(timeToDate)}
           popperPlacement="bottom-start"
        />
      );
    })()
  ) : (
    <div className="text-sm text-muted-foreground">{t("bookingForm.selectDate")}</div>
  )}
</div>
        </CardContent>
      </Card>
      <style jsx global>{`
        .react-datepicker__day--today {
          background-color: transparent !important;
          border: none !important;
        }
        .react-datepicker__day--keyboard-selected:not(.react-datepicker__day--selected) {
          background-color: transparent !important;
          color: inherit !important;
        }
      `}</style>
    </>
  )
}

const SelectField = ({ value, onChange, loading, error, t, loadOptions, pickupPoints, className = "" }) => {
  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "hsl(var(--background))",
      color: "hsl(var(--foreground))",
      padding: "0.5rem 0.75rem",
      borderRadius: "0.5rem",
      borderColor: state.isFocused ? "hsl(var(--primary))" : "hsl(var(--border))",
      boxShadow: state.isFocused ? "0 0 0 2px hsl(var(--primary) / 0.25)" : "none",
      minHeight: "48px",
      cursor: "pointer",
      "&:hover": {
        borderColor: "hsl(var(--primary))",
      },
      transition: "all 0.2s ease",
    }),
    input: (base) => ({
      ...base,
      color: "hsl(var(--foreground))",
      "input:focus": { boxShadow: "none" },
    }),
    placeholder: (base) => ({
      ...base,
      color: "hsl(var(--muted-foreground))",
      display: "flex",
      alignItems: "center",
    }),
    singleValue: (base) => ({
      ...base,
      color: "hsl(var(--foreground))",
      display: "flex",
      alignItems: "center",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "hsl(var(--popover))",
      color: "hsl(var(--popover-foreground))",
      zIndex: 50,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? "hsl(var(--muted))"
        : "hsl(var(--popover))",
      color: "hsl(var(--popover-foreground))",
      cursor: "pointer",
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: "hsl(var(--muted-foreground))",
    }),
  }

  const defaultOptions = pickupPoints.map((opt) => ({
    label: opt.name,
    value: opt.name,
  }));

  return (
    <div className={className}>
      {loading ? (
        <div className="text-sm text-primary flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          {t("bookingForm.loadingHotels")}
        </div>
      ) : error ? (
        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">{t("bookingForm.failedToLoadHotels")}</div>
      ) : (
        <AsyncSelect
          cacheOptions
          defaultOptions={defaultOptions}
          loadOptions={loadOptions}
          value={value}
          onChange={onChange}
          placeholder={
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              {t("bookingForm.searchHotel")}
            </div>
          }
          noOptionsMessage={() => t("bookingForm.noHotelsFound")}
          styles={customStyles}
        />
      )}
    </div>
  )
}

export default TourBookingForm