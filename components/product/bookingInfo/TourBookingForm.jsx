"use client"

import React, { useState, useEffect, useRef } from "react"
import useBookingStore from "@/store/userBookingStore"
import { useRouter } from "next/router"
import { useProductStore } from "@/store/useProductStore"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import AsyncSelect from "react-select/async"
import PassengerModal from "@/components/product/ProductInfo/PassengerModal"
import { Users, Hotel, CalendarDays, Clock, Tag, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "next-i18next";

const TourBookingForm = ({ value = {}, onChange, onHotelsAvailable, errors = {}, isBookingAdded = false }) => {
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
  time: value.time ?? "",
  date: value.date ?? "",
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

  const hasAdjustedDateRef = useRef(false);

useEffect(() => {
  let initialDate = "";
  let calculatedMinDate = minSelectableDate;

  if (value.date) {
    if (!hasAdjustedDateRef.current) {
      const d = new Date(value.date + "T00:00:00");
      d.setDate(d.getDate() + 1);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      initialDate = `${year}-${month}-${day}`;

      calculatedMinDate = d;
      hasAdjustedDateRef.current = true;
    } else {
      // If already adjusted, use the value as is (it's the selected tour date)
      initialDate = value.date;
    }
  } else {
    initialDate = "";
  }

  setForm(prev => {
    // Prevent unnecessary updates if values are the same
    const newDateStr = initialDate instanceof Date ? initialDate.toDateString() : initialDate;
    const prevDateStr = prev.date instanceof Date ? prev.date.toDateString() : prev.date;
    
    if (
      prev.adults === (typeof value.adults === "number" && value.adults >= minPax ? value.adults : minPax) &&
      prev.child === (value.child ?? 0) &&
      prev.hotel === (value.hotel ?? "") &&
      prev.time === (value.time ?? "") &&
      newDateStr === prevDateStr
    ) {
      return prev;
    }

    return {
      adults: typeof value.adults === "number" && value.adults >= minPax ? value.adults : minPax,
      child: value.child ?? 0,
      hotel: value.hotel ?? "",
      time: value.time ?? "",
      date: initialDate,
    };
  });
  if (calculatedMinDate?.getTime() !== minSelectableDate?.getTime()) {
    setMinSelectableDate(calculatedMinDate);
  }
}, [value.date, value.adults, value.child, value.hotel, value.time, minPax]);

useEffect(() => {
  if (!productId || !form.hotel) return;

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
          if (minSelectableDate) {
            const entryDate = new Date(entry.date + "T00:00:00");
            if (entryDate < minSelectableDate) continue;
          }

          validDates.push(entry.date);
          let finalTimes = [];
          if (entry.pickup_time && entry.pickup_time.length > 0) {
            const parsedTimes = entry.pickup_time.map(t => deepParseJson(t)).flat(Infinity);
            finalTimes = parsedTimes.filter(item => typeof item === 'string' && item.trim() !== '');
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
        }

        // Auto-select time if available for the selected date
        if (updated.date) {
           const dateStr = updated.date instanceof Date 
              ? updated.date.getFullYear() + "-" + String(updated.date.getMonth() + 1).padStart(2, "0") + "-" + String(updated.date.getDate()).padStart(2, "0")
              : updated.date;
           
           const times = dateMap[dateStr] || [];
           
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
}, [productId, form.adults, form.child, form.hotel, minSelectableDate]);

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
              {t("bookingForm.totalPax")} <span className="text-red-500">*</span>
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
                  {form.adults || 0} {form.adults === 1 ? t("bookingForm.adults") : t("bookingForm.adults_plural")}, {" "}
                  {form.child || 0} {form.child === 1 ? t("bookingForm.child") : t("bookingForm.child_plural")}
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
          />

          {/* Hotel */}
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
              includeDates={availableDates}
              minDate={minSelectableDate}
              dayClassName={(date) => {
                const localDateStr =
                  date.getFullYear() +
                  "-" +
                  String(date.getMonth() + 1).padStart(2, "0") +
                  "-" +
                  String(date.getDate()).padStart(2, "0")
                return availableDateStrings.has(localDateStr) ? "bg-gray-100 text-gray-700 hover:bg-[#D3202D]" : ""
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

         {/* Time */}
<div className="space-y-3">
  <label className="block font-medium text-sm text-gray-700 flex items-center gap-2">
    <Clock className="w-4 h-4 text-[#D3202D]" />
    {t("bookingForm.time")} <span className="text-red-500">*</span>
  </label>
  {form.date ? (
    (() => {
      const dateStr = form.date;
      const times = pickupTimesByDate[dateStr] || [];
      if (times.length === 0) {
        return (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-yellow-200">
            {/* {t("bookingForm.pickupTimesUnavailable")} */}
            Time is not Available, Proceed!
            
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
          customInput={React.createElement(CustomInput, { className: "w-full" })}
          wrapperClassName="w-full"
          includeTimes={times.map(timeToDate)}
           disabled={isBookingAdded}
           popperPlacement="bottom-start"
        />
      );
    })()
  ) : (
    <div className="text-sm text-gray-400">{t("bookingForm.selectDate")}</div>
  )}
</div>
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
          noOptionsMessage={() => t("bookingForm.noHotelsFound")}
          styles={customStyles}
          isDisabled={isDisabled}
        />
      )}
    </div>
  )
}

export default TourBookingForm