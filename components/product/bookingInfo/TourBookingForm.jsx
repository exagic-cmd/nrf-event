"use client"

import React, { useState, useEffect, useRef } from "react"
import useBookingStore from "@/store/userBookingStore"
import { useRouter } from "next/router"
import { useProductStore } from "@/store/useProductStore"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import AsyncSelect from "react-select/async"
import Select from "react-select"
import PassengerModal from "@/components/product/ProductInfo/PassengerModal"
import { Users, Hotel, CalendarDays, Clock, Tag, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "next-i18next";

const TourBookingForm = ({ value = {}, onChange, onHotelsAvailable, errors = {}, isBookingAdded = false, categoryId, pickupGroupList = [], dropoffPointGroupList = [] }) => {
  const router = useRouter()
  const { t } = useTranslation("daytour");
  const { id: productId } = router.query
  const { tieredPricingData } = useProductStore()
  const [pickupTimesByDate, setPickupTimesByDate] = useState({});
  const pricingList = tieredPricingData?.tieredPricing?.data?.product_pricing || []
  const minPax = pricingList.length > 0 ? Math.min(...pricingList.map((p) => Number(p.min_pax))) : 1
  const maxPax = pricingList.length > 0 ? Math.max(...pricingList.map((p) => Number(p.max_pax))) : 1

 const [form, setForm] = useState({
  adults: typeof value.adults === "number" && value.adults >= minPax ? value.adults : minPax,
  child: value.child ?? 0,
  hotel: value.hotel ?? "",
  pickupPoint: value.pickupPoint ?? "",
  dropoffPoint: value.dropoffPoint ?? "",
  time: value.time ?? "",
  date: value.date ?? "",
  pickupTime: value.pickupTime ?? "",
})


  const [availableDates, setAvailableDates] = useState([])
  const [availableDateStrings, setAvailableDateStrings] = useState(new Set())
  const [availableTimes, setAvailableTimes] = useState([])
  
  const [loadingDates, setLoadingDates] = useState(false)
  const [loadingTimes, setLoadingTimes] = useState(false)
  const [adultsError, setAdultsError] = useState("")
  const [childError, setChildError] = useState("")
  const [errorDates, setErrorDates] = useState("")
  const [errorTimes, setErrorTimes] = useState("")
  const [showPassengerModal, setShowPassengerModal] = useState(false)
  const [formBeforeModal, setFormBeforeModal] = useState(null)
  const [minSelectableDate, setMinSelectableDate] = useState(null)

  const {
    fetchPickupPointCity,
    fetchAvailableDates,
    pickupPoints,
    loadingPickup,
    errorPickup,
    searchPickupPoints,
  } = useBookingStore()

 // const hasAdjustedDateRef = useRef(false);

useEffect(() => {
  let initialDate = value.date ?? "";

  // Pre-fill dropoff point if only one exists
  let initialDropoffPoint = value.dropoffPoint ?? "";
  if (categoryId === 2 && dropoffPointGroupList?.length === 1 && !initialDropoffPoint) {
    initialDropoffPoint = dropoffPointGroupList[0].dropoff_point_name;
  }

  setForm(prev => {
    const prevDateStr = prev.date;
    if (
      prev.adults === (typeof value.adults === "number" && value.adults >= minPax ? value.adults : minPax) &&
      prev.child === (value.child ?? 0) &&
      prev.hotel === (value.hotel ?? "") &&
      prev.pickupPoint === (value.pickupPoint ?? "") &&
      prev.dropoffPoint === initialDropoffPoint &&
      prev.time === (value.time ?? "") &&
      prev.pickupTime === (value.pickupTime ?? "") &&
      prevDateStr === initialDate
    ) {
      return prev;
    }

    return {
      adults: typeof value.adults === "number" && value.adults >= minPax ? value.adults : minPax,
      child: value.child ?? 0,
      hotel: value.hotel ?? "",
      pickupPoint: value.pickupPoint ?? "",
      dropoffPoint: initialDropoffPoint,
      time: value.time ?? "",
      date: initialDate,
      pickupTime: value.pickupTime ?? "",
    };
  });
}, [
  value.date,
  value.adults,
  value.child,
  value.hotel,
  value.pickupPoint,
  value.dropoffPoint,
  value.time,
  value.pickupTime,
  minPax,
  categoryId,
  dropoffPointGroupList,
]);

useEffect(() => {
  const requiredField = categoryId === 2 ? form.pickupPoint : form.hotel;
  if (!productId || !requiredField) return;

  setLoadingDates(true);
  fetchAvailableDates(productId, form.adults, form.child)
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
  validDates.push(entry.date);

  let finalTimes = [];
  if (entry.pickup_time && entry.pickup_time.length > 0) {
    const parsedTimes = entry.pickup_time.map(t => deepParseJson(t)).flat(Infinity);
    finalTimes = parsedTimes
      .filter(item => typeof item === 'string' && item.trim() !== '')
      .map(timeStr => {
        if (!timeStr) return null;
        const isPM = /pm/i.test(timeStr);
        const isAM = /am/i.test(timeStr);
        let [hours, minutes] = timeStr.replace(/am|pm/i, '').trim().split(':');
        hours = parseInt(hours, 10);
        minutes = parseInt(minutes, 10) || 0;

        if (isNaN(hours) || isNaN(minutes)) return null;

        if (isPM && hours < 12) hours += 12;
        if (isAM && hours === 12) hours = 0; // Midnight case: 12 AM is 00:00

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      }).filter(Boolean);
  }
  dateMap[entry.date] = finalTimes;
}

      }

      setAvailableDates(validDates.map(d => new Date(d + "T00:00:00")));
      setAvailableDateStrings(new Set(validDates));
      setPickupTimesByDate(dateMap);
      setForm((prev) => {
        const updated = { ...prev };
        if (!prev.date || isNaN(new Date(prev.date).getTime())) {
          updated.date = null;
          updated.time = "";
          updated.pickupTime = "";
        }

        // Auto-select time if available for the selected date
        if (updated.date) {
           const dateStr = updated.date instanceof Date 
              ? updated.date.getFullYear() + "-" + String(updated.date.getMonth() + 1).padStart(2, "0") + "-" + String(updated.date.getDate()).padStart(2, "0")
              : updated.date;
           
           const times = dateMap[dateStr] || [];
           
           if (times.length > 0) {
              // If current time is invalid or empty, select the first available time
              if (categoryId !== 2) {
                // For regular tours, auto-select time
                if (!updated.time || !times.includes(updated.time)) {
                   updated.time = times[0];
                }
              } else {
                // For category 2 (shuttle), auto-select pickupTime
                if (!updated.pickupTime || !times.includes(updated.pickupTime)) {
                   updated.pickupTime = times[0];
                }
              }
           } else {
              updated.time = "";
              updated.pickupTime = "";
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
}, [productId, form.adults, form.child, form.hotel, form.pickupPoint, minSelectableDate, categoryId]);

  useEffect(() => {
    if (!productId) return
    fetchPickupPointCity(productId)
  }, [productId])

  useEffect(() => {
    if (onHotelsAvailable) {
      onHotelsAvailable(Array.isArray(pickupPoints) && pickupPoints.length > 0)
    }
  }, [pickupPoints, onHotelsAvailable])

  // Validate pre-filled hotel/pickup point against available pickup points
  useEffect(() => {
    if (!productId || !pickupPoints || pickupPoints.length === 0) return;

    if (categoryId === 2) {
      // For category 2 (shuttle), validate pickup point
      if (form.pickupPoint) {
        const pickupExists = pickupGroupList.some(point => point.pickup_point_name === form.pickupPoint);
        if (!pickupExists) {
          setForm(prev => ({ ...prev, pickupPoint: "" }));
          onChange && onChange({ ...form, pickupPoint: "", date: "", pickupTime: "" });
        }
      }
    } else {
      // For other categories, validate hotel
      if (form.hotel) {
        const hotelExists = pickupPoints.some(point => point.name === form.hotel);
        if (!hotelExists) {
          setForm(prev => ({ ...prev, hotel: "" }));
          onChange && onChange({ ...form, hotel: "", date: "", time: "" });
        }
      }
    }
  }, [pickupPoints, productId, categoryId, pickupGroupList]);
useEffect(() => {
  if (
    categoryId === 2 &&
    dropoffPointGroupList?.length === 1 &&
    !form.dropoffPoint
  ) {
    const autoDropoff = dropoffPointGroupList[0].dropoff_point_name;

    setForm(prev => {
      const updated = { ...prev, dropoffPoint: autoDropoff };
      onChange && onChange(updated);
      return updated;
    });
  }
}, [categoryId, dropoffPointGroupList]);

// Auto-select first available time when date is selected
useEffect(() => {
  if (!form.date) {
    setForm(prev => {
      const fieldToClear = categoryId === 2 ? 'pickupTime' : 'time';
      if (prev[fieldToClear] !== "") {
        const updated = { ...prev, [fieldToClear]: "" };
        onChange && onChange(updated);
        return updated;
      }
      return prev;
    });
    return;
  }

  const dateStr = form.date instanceof Date 
    ? form.date.getFullYear() + "-" + String(form.date.getMonth() + 1).padStart(2, "0") + "-" + String(form.date.getDate()).padStart(2, "0")
    : form.date;

  const baseAPITimes = pickupTimesByDate[dateStr] || [];

  if (baseAPITimes.length > 0) {
    if (categoryId === 2) {
      if (!form.pickupPoint) return; 

      const selectedPickupPoint = pickupGroupList?.find(p => p.pickup_point_name === form.pickupPoint);
      const pickupAdditionalTime = selectedPickupPoint?.additional_time || 0;
      
      const baseTime = baseAPITimes[0];
      const [hours, minutes] = baseTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + pickupAdditionalTime;
      const adjustedHours = Math.floor(totalMinutes / 60) % 24;
      const adjustedMinutes = totalMinutes % 60;
      const newTime = `${String(adjustedHours).padStart(2, '0')}:${String(adjustedMinutes).padStart(2, '0')}`;
      
      setForm(prev => {
        if (prev.pickupTime !== newTime) {
          const updated = { ...prev, pickupTime: newTime };
          onChange && onChange(updated);
          return updated;
        }
        return prev;
      });

    } else {
      const newTime = baseAPITimes[0];
      setForm(prev => {
        if (prev.time !== newTime) {
          const updated = { ...prev, time: newTime };
          onChange && onChange(updated);
          return updated;
        }
        return prev;
      });
    }
  } else {
    setForm(prev => {
      const fieldToClear = categoryId === 2 ? 'pickupTime' : 'time';
      if (prev[fieldToClear] !== "") {
        const updated = { ...prev, [fieldToClear]: "" };
        onChange && onChange(updated);
        return updated;
      }
      return prev;
    });
  }
}, [form.date, form.pickupPoint, pickupTimesByDate, categoryId, pickupGroupList]);

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

  const handlePassengerApply = (newAdults, newChild) => {
    setShowPassengerModal(false)
    const updatedForm = { ...form, adults: newAdults, child: newChild }
    setForm(updatedForm)
    const totalPax = newAdults + newChild
    if (totalPax < minPax) return

   setLoadingDates(true)
  }

  const handleChange = (field, value) => {
    let newValue = value
    if (field === "date" && value instanceof Date) {
      const year = value.getFullYear()
      const month = String(value.getMonth() + 1).padStart(2, "0")
      const day = String(value.getDate()).padStart(2, "0")
      newValue = `${year}-${month}-${day}`
    }
    const updated = { ...form, [field]: newValue }
    setForm(updated)
    if (updated.adults + updated.child >= minPax) {
      onChange && onChange({ ...updated, availableTimes })
    } else {
      console.warn(t("bookingForm.totalPax") + " " + minPax)
    }
  }

  const loadPickupPoints = (inputValue, callback) => {
    if (!inputValue) {
      callback([]); // Do not show options on focus, only on search
      return
    }
    searchPickupPoints(productId, inputValue).then(results => {
      const formattedResults = results.map(p => ({ label: p.name, value: p.name }));
      callback(formattedResults);
    });
  };

  const CustomInput = React.forwardRef(({ value, onClick, className, placeholder }, ref) => (
    <div
      className={`${className} w-full cursor-pointer border border-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring--[#D3202D] focus:border-red-300 text-left bg-white hover:border--[#D3202D] transition-colors h-12`}
      onClick={onClick}
      ref={ref}
    >
      {value ? value : <span className="text-gray-500">{placeholder}</span>}
    </div>
  ))

  const totalPax = form.adults + form.child

  return (
    <>
      {/* Main Form Card */}
      <Card className="">
        <CardContent className="p-6 space-y-6">
          {/* Passenger Count */}
          <div className="space-y-3">
            <label className="block font-medium text-sm text-gray-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#D3202D]" />
              {categoryId === 2 ? (t("totalPax","Total Pax") || "Total Pax") : t("bookingForm.totalPax")} <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-left flex justify-between items-center bg-white hover:border-[#D3202D] transition-colors h-12 focus:outline-none focus:ring-2 focus:ring-[#D3202D]"
              onClick={handleOpenPassengerModal}
              disabled={isBookingAdded}
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {categoryId === 2 ? (
                    `${form.adults || 0} ${t("Pax") || "Pax"}`
                  ) : (
                    <>
                      {form.adults || 0} {form.adults === 1 ? t("bookingForm.adults") : t("bookingForm.adults_plural")}, {" "}
                      {form.child || 0} {form.child === 1 ? t("bookingForm.child") : t("bookingForm.child_plural")}
                    </>
                  )}
                </span>
              </span>
              <Badge variant="secondary" className="bg-[#D3202D] text-white hover:bg-[#B91C1C] ">
                {totalPax} {t("bookingForm.total")}
              </Badge>
            </button>
          </div>

          {/* Modal */}
          <PassengerModal
            open={showPassengerModal}
            adults={form.adults}
            child={form.child}
            minPax={minPax}
            maxPax={maxPax}
            pricingList={tieredPricingData?.tieredPricing?.data?.product_pricing || []}
            adultsError={adultsError}
            childError={childError}
            onClose={handleCancelPassengerModal}
            onApply={handlePassengerApply}
            categoryId={categoryId}
          />

          {/* Hotel / Pickup Point */}
          {categoryId !== 2 && (
            <div className="space-y-3 ">
              <label className="block font-medium text-sm text-gray-700 flex items-center gap-2">
                <Hotel className="w-4 h-4 text-[#D3202D]" />
                {t("bookingForm.selectHotel")} <span className="text-red-500">*</span>
              </label>
              <SelectField
                required
                value={form.hotel ? { label: form.hotel, value: form.hotel } : null}
                onChange={(selected) => {
                  handleChange("hotel", selected ? selected.value : "")
                }}
                pickupPoints={pickupPoints}
                loadOptions={loadPickupPoints}
                loading={loadingPickup}
                error={errorPickup}
                t={t}
                isDisabled={isBookingAdded}
              />
              {errors.hotel && <div className="text-sm text-red-500 mt-1">{t(errors.hotel)}</div>}
            </div>
          )}

          {/* Pickup Point - Category 2 Only */}
          {categoryId === 2 && (
            <div className="space-y-3 ">
              <label className="block font-medium text-sm text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D3202D]" />
                {t("Select Pickup Point") || "Select Pickup Point"} <span className="text-red-500">*</span>
              </label>
              <StaticSelectField
                value={form.pickupPoint ? { label: form.pickupPoint, value: form.pickupPoint } : null}
                onChange={(selected) => {
                  handleChange("pickupPoint", selected ? selected.value : "")
                }}
                options={pickupGroupList?.map(p => ({ label: p.pickup_point_name, value: p.pickup_point_name })) || []}
                isDisabled={isBookingAdded}
                placeholder={t("Select Pickup Point") || "Select Pickup Point"}
              />
              {errors.pickupPoint && <div className="text-sm text-red-500 mt-1">{t(errors.pickupPoint)}</div>}
            </div>
          )}

          {/* Drop-off Point - Category 2 Only */}
          {categoryId === 2 && (
            <div className="space-y-3 ">
              <label className="block font-medium text-sm text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D3202D]" />
                {t("Select Drop-off Point") || "Select Drop-off Point"}
              </label>
              <StaticSelectField
                value={form.dropoffPoint ? { label: form.dropoffPoint, value: form.dropoffPoint } : null}
                onChange={(selected) => {
                  if (dropoffPointGroupList?.length > 1) {
                    handleChange("dropoffPoint", selected ? selected.value : "")
                  }
                }}
                options={dropoffPointGroupList?.map(p => ({ label: p.dropoff_point_name, value: p.dropoff_point_name })) || []}
                isDisabled={isBookingAdded || dropoffPointGroupList?.length === 1}
                placeholder={t("Select Drop-off Point") || "Select Drop-off Point"}
              />
              {dropoffPointGroupList?.length === 1 && (
                <p className="text-sm text-gray-500">{t("onlyOneOption") || "Only one option available"}</p>
              )}
            </div>
          )}

          {/* Date */}
          <div className="space-y-3">
            <label className="block font-medium text-sm text-gray-700 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#D3202D]" />
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

  /* 🔥 ADD THIS */
  filterDate={(date) => {
    const dateStr =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0");
    return availableDateStrings.has(dateStr);
  }}

  dayClassName={(date) => {
    const localDateStr =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0");
    return availableDateStrings.has(localDateStr)
      ? "bg-gray-100 text-gray-700 hover:bg-[#D3202D]"
      : "text-gray-300 cursor-not-allowed";
  }}
  customInput={React.createElement(CustomInput, { className: "w-full" })}
  wrapperClassName="w-full"
  disabled={isBookingAdded}
/>

            {loadingDates && (
              <div className="text-sm text-[#D3202D] mt-1 flex items-center gap-2">
                <div className="w-4 h-4 border-[#D3202D] border-t-[#D3202D] rounded-full animate-spin"></div>
                {t("bookingForm.loadingDates")}
              </div>
            )}
            {(errorDates || errors.date) && (
              <div className="text-sm text-red-500 mt-1">{t(errorDates || errors.date)}</div>
            )}
          </div>

         {/* Time - Regular (Category != 2) */}
         {categoryId !== 2 && (
<div className="space-y-3">
  <label className="block font-medium text-sm text-gray-700 flex items-center gap-2">
    <Clock className="w-4 h-4 text-[#D3202D]" />
    Tour start time <span className="text-red-500">*</span>
  </label>

  {form.date ? (
    (() => {
      const times = pickupTimesByDate[form.date] || [];

      if (!times.length) {
        return (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-yellow-200">
            Time is not available for selected date
          </div>
        );
      }

      return (
        <select
          className="w-full h-12 border border-gray-200 rounded-lg px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#D3202D]"
          value={form.time}
          onChange={(e) => handleChange("time", e.target.value)}
          disabled={isBookingAdded}
        >
          <option value="">{t("bookingForm.time")}</option>
          {times.map((time, idx) => (
            <option key={idx} value={time}>
              {time}
            </option>
          ))}
        </select>
      );
    })()
  ) : (
    <div className="text-sm text-gray-400">
      {t("bookingForm.selectDate")}
    </div>
  )}
</div>
         )}

         {/* Pickup Time - Category 2 Only */}
         {categoryId === 2 && (
<div className="space-y-3">
  <label className="block font-medium text-sm text-gray-700 flex items-center gap-2">
    <Clock className="w-4 h-4 text-[#D3202D]" />
    {t("Pickup Time") || "Pickup Time"} <span className="text-red-500">*</span>
  </label>
  {form.date && form.pickupPoint ? (
    (() => {
      const dateStr = form.date;
      const baseAPITimes = pickupTimesByDate[dateStr] || [];
      
      // Get pickup point additional time
      const selectedPickupPoint = pickupGroupList?.find(p => p.pickup_point_name === form.pickupPoint);
      const pickupAdditionalTime = selectedPickupPoint?.additional_time || 0;

      // Calculate adjusted times: API time + pickup_point additional_time only
      const adjustedTimes = baseAPITimes.map(timeStr => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + pickupAdditionalTime;
        const adjustedHours = Math.floor(totalMinutes / 60) % 24;
        const adjustedMinutes = totalMinutes % 60;
        return `${String(adjustedHours).padStart(2, '0')}:${String(adjustedMinutes).padStart(2, '0')}`;
      });

      if (adjustedTimes.length === 0) {
        return (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-yellow-200">
            Pickup time is not available, Proceed!
          </div>
        );
      }

      const timeToDate = (timeStr) => {
        if (!timeStr) return null;
        const date = new Date();
        const [hours, minutes] = timeStr.split(':').map(Number);
        date.setHours(hours, minutes, 0, 0);
        return date;
      };

      return (
        <DatePicker
          selected={timeToDate(form.pickupTime)}
          onChange={(date) => {
            if (date) {
              const timeString = date.toTimeString().slice(0, 5);
              handleChange("pickupTime", timeString);
            } else {
              handleChange("pickupTime", "");
            }
          }}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={15}
          timeCaption={t("Pickup Time") || "Pickup Time"}
          dateFormat="h:mm aa"
          placeholderText={t("Pickup Time") || "Pickup Time"}
          customInput={React.createElement(CustomInput, { className: "w-full" })}
          wrapperClassName="w-full"
          includeTimes={adjustedTimes.map(timeToDate)}
          disabled={isBookingAdded}
          popperPlacement="bottom-start"
        />
      );
    })()
  ) : (
    <div className="text-sm text-gray-400">
      {!form.date ? t("bookingForm.selectDate") : "Select a pickup point"}
    </div>
  )}
</div>
         )}
        </CardContent>
      </Card>
    </>
  )
}

const SelectField = ({ value, onChange, loading, error, t, loadOptions, pickupPoints, isDisabled }) => {
  const customStyles = {
    control: (base, state) => ({
      ...base,
      padding: "0.5rem 0.75rem",
      borderRadius: "0.5rem",
      borderColor: "#e5e7eb",
      minHeight: "48px",
      cursor: "pointer",
      "&:hover": {
        borderColor: "#D3202D",
      },
      transition: "all 0.2s ease",
    }),
    input: (base) => ({
      ...base,
      "input:focus": { boxShadow: "none" },
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9ca3af",
      display: "flex",
      alignItems: "center",
    }),
    singleValue: (base) => ({
      ...base,
      display: "flex",
      alignItems: "center",
    }),
  }

  return (
    <div>
      {loading ? (
        <div className="text-sm text-[#D3202D] flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#D3202D] border-t-[#D3202D] rounded-full animate-spin"></div>
          {t("bookingForm.loadingHotels")}
        </div>
      ) : error ? (
        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">{t("bookingForm.failedToLoadHotels")}</div>
      ) : (
        <AsyncSelect
          cacheOptions
          loadOptions={loadOptions}
          value={value}
          onChange={onChange}
          placeholder={
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              {t("bookingForm.searchHotel")}
            </div>
          }
          //noOptionsMessage={() => t("bookingForm.noHotelsFound")}
          styles={customStyles}
          isDisabled={isDisabled}
        />
      )}
    </div>
  )
}

const StaticSelectField = ({ value, onChange, options, isDisabled, placeholder }) => {
  const customStyles = {
    control: (base, state) => ({
      ...base,
      padding: "0.5rem 0.75rem",
      borderRadius: "0.5rem",
      borderColor: "#e5e7eb",
      minHeight: "48px",
      cursor: "pointer",
      "&:hover": {
        borderColor: "#D3202D",
      },
      transition: "all 0.2s ease",
    }),
    input: (base) => ({
      ...base,
      "input:focus": { boxShadow: "none" },
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9ca3af",
      display: "flex",
      alignItems: "center",
    }),
    singleValue: (base) => ({
      ...base,
      display: "flex",
      alignItems: "center",
    }),
  }

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      placeholder={
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          {placeholder}
        </div>
      }
      styles={customStyles}
      isDisabled={isDisabled}
      isClearable
    />
  )
}

export default TourBookingForm