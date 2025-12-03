import React, { useState, useEffect } from "react";
import { useTransferStore } from "@/store/useTransferStore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, Clock, Plane, Hash } from "lucide-react";
import useBookingStore from "@/store/userBookingStore";
import { useTranslation } from "next-i18next";
import FlightTracker from "@/components/transfers/detail/FlightTracker";

const FormField = ({ label, children, required = false, icon: Icon, orangeColor }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
      {Icon && <Icon size={18} color={orangeColor} />}
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const CustomInput = React.forwardRef(
  ({ value, onClick, placeholder, className, disabled }, ref) => (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`${className} ${
        disabled ? "bg-gray-100 cursor-not-allowed" : ""
      }`}
      style={{ cursor: disabled ? "not-allowed" : "pointer" }}
      ref={ref}
    >
      {value ? value : <span className="text-gray-500">{placeholder}</span>}
    </div>
  )
);

const DatePickerField = ({
  label,
  value,
  onChange,
  error,
  minDate,
  availableDates,
  disabled,
  orangeColor,
  t,
}) => (
  <FormField
    label={label}
    required
    icon={Calendar}
    orangeColor={orangeColor}
  >
    <DatePicker
      selected={value ? new Date(value) : null}
      onChange={(date) => !disabled && onChange(date)}
      placeholderText={t("form.selectDate")}
      includeDates={availableDates.map((d) => d.date)}
      minDate={minDate || new Date()}
         popperPlacement="bottom-start"
      dayClassName={(date) =>
        availableDates.some(
          (d) => d.date.toDateString() === date.toDateString()
        )
          ? "bg-orange-100 text-gray-700 hover:bg-orange-200"
          : ""
      }
      className={`text-base w-full px-4 md:py-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 ${
        disabled ? "bg-gray-100 cursor-not-allowed" : ""
      }`}
      wrapperClassName="w-full"
      customInput={<CustomInput disabled={disabled} />}
      disabled={disabled}
    />
    {error && <p className="text-red-500 text-xs mt-1">{t(error)}</p>}
  </FormField>
);

const TimePickerField = ({
  label,
  value,
  onChange,
  error,
  disabled,
  orangeColor,
  t,
  surchargeDetails,
}) => (
  <FormField
    label={label}
    required
    icon={Clock}
    orangeColor={orangeColor}
  >
    <DatePicker
      selected={value ? new Date(value) : null}
      onChange={(date) => !disabled && onChange(date)}
      showTimeSelect
      showTimeSelectOnly
      timeIntervals={15}
      timeCaption={t("form.time")}
      timeFormat="hh:mm aa"
      dateFormat="hh:mm aa"
      placeholderText={t("form.selectTime")}
            popperPlacement="bottom-start"
      wrapperClassName="w-full"
      className={`text-base w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 ${
        disabled ? "bg-gray-100 cursor-not-allowed" : ""
      }`}
      customInput={<CustomInput disabled={disabled} />}
      disabled={disabled}
    />
    {error && <p className="text-red-500 text-xs mt-1">{t(error)}</p>}
    {surchargeDetails?.amount && (
      <div className="text-sm text-orange-600 font-semibold col-span-2">
        {t("form.surchargeApplied")}: SGD {surchargeDetails.amount}
      </div>
    )}
  </FormField>
);


const FlightNumberField = ({
  label,
  value,
  onChange,
  onTrack,
  tracking = false,
  error,
  disabled,
  orangeColor,
  t,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isAutoTracking, setIsAutoTracking] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onTrack) {
      e.preventDefault();
      handleTrack();
    }
  };

  const handleTrack = async (flightNumber = null) => {
    const numberToTrack = flightNumber || value;
    if (!onTrack || !numberToTrack) return;

    setShowSuggestions(false);
    setSuggestions([]);
    setApiError(null);

    try {
      const result = await onTrack(); 

      // if API returns similar flights, show them in dropdown

      //  const result = await onTrack(numberToTrack);

       if (result?.error && !result?.similar_flights) {
         setApiError(result.error);
         return;
      }

      if (result?.similar_flights?.length > 0) {
        setSuggestions(result.similar_flights);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error("Error tracking flight:", err);
      setApiError("Failed to track flight. Please try again.");
    }
  };

  // const handleSelectSuggestion = (suggestion) => {
  //   onChange(suggestion); // update field
  //   setShowSuggestions(false); // close dropdown
  //   // do NOT re-track automatically — wait for user to click “Check”
  // };
  const handleSelectSuggestion = async (suggestion) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setApiError(null);
    
    if (onTrack) {
        setIsAutoTracking(true);
        try {
            await onTrack(suggestion);
        } catch (e) {
            setApiError("Failed to track selected flight.");
        } finally {
            setIsAutoTracking(false);
        }
    }
  };
  return (
    <FormField label={label} required icon={Hash} orangeColor={orangeColor}>
      <div className="relative">
        {/* Input Field */}
        <input
          type="text"
          value={value || ""}
          onChange={(e) => {
            const sanitized = e.target.value
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, "");
            onChange(sanitized);
            setShowSuggestions(false);
            setApiError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder={t("booking.flightPlaceholder")}
          className={`w-full text-base px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 pr-24 ${
            disabled ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
          maxLength={8}
          minLength={3}
          disabled={disabled}
        />

        {/* Check Button */}
        <button
          type="button"
          onClick={() => handleTrack()}
          disabled={disabled || !value || tracking || isAutoTracking}
          className={`absolute right-2 top-1/2 -translate-y-1/2 text-white text-sm font-medium px-3 py-1.5 rounded-md transition-colors flex items-center justify-center gap-1 ${
            disabled || !value
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#D3202D] hover:bg-red-700"
          }`}
        >
          {tracking || isAutoTracking ? "Checking..." : t("booking.check") || "Check"}
        </button>

        {/* Dropdown for similar flights */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-30 mt-2 w-full bg-white border border-[#D3202D] rounded-md shadow-lg max-h-48 overflow-auto">
            {suggestions.map((flight, idx) => (
              <li
                key={idx}
                onClick={() => handleSelectSuggestion(flight)}
                className="px-4 py-2 cursor-pointer hover:bg-orange-50 text-sm text-gray-800 border-b last:border-none flex items-center gap-2"
              >
                <span>✈️ {flight}</span>
                {isAutoTracking && <span className="text-xs text-gray-400">Auto-tracking...</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

  
      {apiError && (
        <p className="text-[#D3202D] text-xs mt-2 bg-red-50 px-3 py-2 rounded border border-red-200">
          {apiError}
        </p>
      )}

      {error && !apiError && <p className="text-red-500 text-xs mt-1">{t(error)}</p>}
    </FormField>
  );
};




const CustomOptionSelector = ({
  fieldName,
  userBookingDetails,
  handleChange,
  t,
  orangeColor,
  disabled,
}) => {
  const options = [
    { value: "time", label: t("booking.specificTime") },
    { value: "flight", label: t("booking.trackMyFlight") },
  ];

  const selected = userBookingDetails[fieldName];

  return (
    <div className="flex items-center gap-6 mt-4">
      {options.map((option) => {
        const isActive = selected === option.value;
        return (
          <div
            key={option.value}
            onClick={() => !disabled && handleChange(fieldName, option.value)}
            className="flex items-center gap-2 cursor-pointer select-none transition-all duration-200"
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                isActive
                  ? "border-orange-500 bg-orange-500"
                  : "border-gray-400 bg-white hover:border-orange-400"
              }`}
              style={{
                borderColor: isActive ? orangeColor : "#ccc",
                backgroundColor: isActive ? orangeColor : "#fff",
              }}
            >
              {isActive && <div className="w-2 h-2 rounded-full bg-white"></div>}
            </div>
            <span
              className={`text-sm font-medium ${
                isActive ? "text-gray-900" : "text-gray-600"
              }`}
            >
              {option.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
export default function BookingTransferInfo({
  TransferInfo,
  errors,
  onFieldChange,
  disabled = false,
  onPickupTracked,
  onReturnTracked,
}) {
  const { t } = useTranslation("transfer", "common");
  const productId = TransferInfo?.product_id;
  const {
    selectedTransfer,
    tripType,
    userBookingDetails,
    setUserBookingDetails,
    fetchProductSurcharge,
    surchargeDetails,
    setSelectedDates,
  } = useTransferStore();

  const orangeColor = "#D3202D";
  const { fetchAvailableDatesTR } = useBookingStore();
  const [availableDates, setAvailableDates] = useState([]);
const [pickupTrigger, setPickupTrigger] = useState(0);
const [returnTrigger, setReturnTrigger] = useState(0);
// add local loading states for each tracker
const [pickupTracking, setPickupTracking] = useState(false);
const [returnTracking, setReturnTracking] = useState(false);

  // Set default radio button selection on mount
  useEffect(() => {
    const defaults = {};
    if (!userBookingDetails.pickupOption) {
      defaults.pickupOption = 'time';
    }
    if (tripType === 'round-trip' && !userBookingDetails.returnOption) {
      defaults.returnOption = 'time';
    }
    if (Object.keys(defaults).length > 0) {
      setUserBookingDetails(defaults);
    }
  }, [tripType, userBookingDetails.pickupOption, userBookingDetails.returnOption, setUserBookingDetails]);


  useEffect(() => {
    if (!productId) return;
    fetchAvailableDatesTR(productId)
      .then((availability) => {
        const validDates = availability
          .filter((d) => d.available && parseInt(d.available_qty, 10) > 0)
          .map((d) => ({
            date: new Date(d.date),
            pickup_time: d.pickup_time || [],
          }));
        setAvailableDates(validDates);
      })
      .catch((err) => console.error("Failed to fetch available dates", err));
  }, [productId, fetchAvailableDatesTR]);

  useEffect(() => {
    if (userBookingDetails.pickupDate && userBookingDetails.returnDate && new Date(userBookingDetails.pickupDate) > new Date(userBookingDetails.returnDate)) {
      handleChange("returnDate", null);
    }
  }, [userBookingDetails.pickupDate, userBookingDetails.returnDate]);

  const handleChange = (field, value) => {
    if (disabled) return;
    
    const updates = (typeof field === 'object' && field !== null && !Array.isArray(field)) 
                    ? field 
                    : { [field]: value };
if (updates.pickupOption || updates.returnOption) {
  fetchProductSurcharge({
    productId,
    pickupTime: null,
    leg: updates.pickupOption ? "pickup" : "return",
    reset: true,
  });
}


    setUserBookingDetails(updates);

    if (updates.pickupDate) setSelectedDates({ pickupDate: updates.pickupDate });
    if (updates.returnDate) setSelectedDates({ returnDate: updates.returnDate });

    if (onFieldChange) {
      for (const [key, val] of Object.entries(updates)) {
        onFieldChange(key, val);
      }
    }

    if ((updates.pickupTime || updates.returnTime || updates.returnPickupTime) && productId) {
      const timeValue = updates.pickupTime || updates.returnTime || updates.returnPickupTime;
      if (timeValue) {
        const time = new Date(timeValue).toTimeString().substring(0, 5);
        fetchProductSurcharge({
          productId,
          pickupTime: time,
          leg: (updates.returnTime || updates.returnPickupTime) ? "return" : "pickup",
        });
      }
    }
  };

const handlePickupTrack = async (flightNumber = null) => {
  const numberToUse = flightNumber || userBookingDetails.pickupFlightNumber;
  if (!numberToUse) return;

  setPickupTracking(true);
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/get-flight-data?flight_number=${encodeURIComponent(
        numberToUse
      )}&pickup_id=${encodeURIComponent(selectedTransfer?.pickup_point_id)}`
    );

    const data = await res.json();

    if (res.ok && !data.error) {
      if (!data.similar_flights || data.similar_flights.length === 0) {
        setPickupTrigger((prev) => prev + 1);
      }
      return data;
    } else {
      return data;
    }
  } catch (e) {
    console.error("Pickup track error", e);
    return { error: "An error occurred while fetching flight data." };
  } finally {
    setPickupTracking(false);
  }
};


const handleReturnTrack = async (flightNumber = null) => {
  const numberToUse = flightNumber || userBookingDetails.returnFlightNumber;
  if (!numberToUse) return;

  setReturnTracking(true);
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/get-flight-data?flight_number=${encodeURIComponent(
        numberToUse
      )}&pickup_id=${encodeURIComponent(selectedTransfer?.dropoff_point_id)}`
    );

    const data = await res.json();

    if (res.ok && !data.error) {
      if (!data.similar_flights || data.similar_flights.length === 0) {
        setReturnTrigger((prev) => prev + 1);
      }
      return data; 
    } else {
      return data; 
    }
  } catch (e) {
    console.error("Return track error", e);
    return { error: "An error occurred while fetching flight data." };
  } finally {
    setReturnTracking(false);
  }
};


  if (!selectedTransfer) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t("booking.noTransferSelected")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg p-6 shadow-sm space-y-6">
        {/* --- Pickup Section --- */}
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Plane size={20} color={orangeColor} />
          {t("booking.pickupDetails")}
        </h3>

        <div id="pickupDate" className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <DatePickerField
            label={t("booking.pickupDate")}
            value={userBookingDetails.pickupDate}
            onChange={(date) => handleChange("pickupDate", date?.toISOString())}
            error={errors?.pickupDate}
            availableDates={availableDates}
            disabled={disabled}
            orangeColor={orangeColor}
            t={t}
          />
        </div>

        <CustomOptionSelector
          fieldName="pickupOption"
          userBookingDetails={userBookingDetails}
          handleChange={handleChange}
          t={t}
          orangeColor={orangeColor}
          disabled={disabled}
        />

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {userBookingDetails.pickupOption === "flight" ? (
            <div id="pickupFlightNumber">
              <FlightNumberField
                label={t("booking.pickupFlightNumber")}
                value={userBookingDetails.pickupFlightNumber}
                onChange={(val) => handleChange("pickupFlightNumber", val)}
                onTrack={handlePickupTrack}
                error={errors?.pickupFlightNumber}
                disabled={disabled}
                orangeColor={orangeColor}
                tracking={pickupTracking}
                t={t}
              />

<div className="mt-3">
  <TimePickerField
  label={t("booking.pickupTime")}
  value={
    userBookingDetails.pickupFlightScheduleTime
      ? new Date(`1970-01-01T${userBookingDetails.pickupFlightScheduleTime}`)
      : null
  }
  onChange={(date) =>
    handleChange({
      pickupFlightScheduleTime: date
        ? date.toTimeString().substring(0, 5)
        : null,
    })
  }
  error={errors?.pickupFlightScheduleTime}
  disabled={disabled}
  orangeColor={orangeColor}
  t={t}
/>

</div>


   <FlightTracker
  pickupId={selectedTransfer?.pickup_point_id}
  flightNumber={userBookingDetails.pickupFlightNumber}
  trigger={pickupTrigger}
  onTrackSuccess={(result) => {
    setPickupTracking(false);

    const flightTime = result?.schedule_time || result?.scheduled_time;
    if (flightTime) {
      handleChange({
        pickupFlightScheduleTime: flightTime, 
        pickupTime: new Date(`1970-01-01T${flightTime}`),
      });
    }

    onPickupTracked?.(true);
  }}
  onTrackFail={() => {
    setPickupTracking(false);
    onPickupTracked?.(false);
  }}
/>


            </div>
          ) : (
            <div id="pickupTime">
            <TimePickerField
              label={t("booking.pickupTime")}
              value={userBookingDetails.pickupTime}
              onChange={(date) => handleChange("pickupTime", date?.toISOString())}
              error={errors?.pickupTime}
              disabled={disabled}
              orangeColor={orangeColor}
              t={t}
              surchargeDetails={surchargeDetails}
            />
            </div>
          )}
        </div>

        {/* --- Return Section --- */}
        {tripType === "round-trip" && (
          <>
          <div id="return-section"></div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pt-6 border-t border-gray-200">
              <Plane size={20} className="rotate-180" color={orangeColor} />
              {t("booking.returnDetails")}
            </h3>

            <div id="returnDate" className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <DatePickerField
                label={t("booking.returnDate")}
                value={userBookingDetails.returnDate}
                onChange={(date) => handleChange("returnDate", date?.toISOString())}
                error={errors?.returnDate}
                minDate={userBookingDetails.pickupDate ? new Date(userBookingDetails.pickupDate) : null}
                availableDates={availableDates}
                disabled={disabled}
                orangeColor={orangeColor}
                t={t}
              />
            </div>

            <CustomOptionSelector
              fieldName="returnOption"
              userBookingDetails={userBookingDetails}
              handleChange={handleChange}
              t={t}
              orangeColor={orangeColor}
              disabled={disabled}
            />

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
             {userBookingDetails.returnOption === "flight" ? (
  <div id="returnFlightNumber">
    {/* Flight Number Input with tracking */}
    <FlightNumberField
      label={t("booking.returnFlightNumber")}
      value={userBookingDetails.returnFlightNumber}
      onChange={(val) => handleChange("returnFlightNumber", val)}
      onTrack={handleReturnTrack}
      error={errors?.returnFlightNumber}
      disabled={disabled}
      orangeColor={orangeColor}
      tracking={returnTracking}
      t={t}
    />

    {/* Time Picker Field (same style as pickup) */}
    <div className="mt-3">
      <TimePickerField
  label={t("booking.returnPickupTime")}
  value={
    userBookingDetails.returnFlightScheduleTime
      ? new Date(`1970-01-01T${userBookingDetails.returnFlightScheduleTime}`)
      : null
  }
  onChange={(date) =>
    handleChange({
      returnFlightScheduleTime: date
        ? date.toTimeString().substring(0, 5)
        : null,
    })
  }
  error={errors?.returnFlightScheduleTime}
  disabled={disabled}
  orangeColor={orangeColor}
  t={t}
/>

    </div>

    {/* Flight Tracker (auto triggers when valid flight found) */}
    <FlightTracker
  pickupId={selectedTransfer?.dropoff_point_id}
  flightNumber={userBookingDetails.returnFlightNumber}
  trigger={returnTrigger}
  onTrackSuccess={(result) => {
    setReturnTracking(false);

    const flightTime = result?.schedule_time || result?.scheduled_time;
    if (flightTime) {
      handleChange({
        returnFlightScheduleTime: flightTime,
        returnPickupTime: new Date(`1970-01-01T${flightTime}`),
      });
    }

    onReturnTracked?.(true);
  }}
  onTrackFail={() => {
    setReturnTracking(false);
    onReturnTracked?.(false);
  }}
/>

  </div>

) : (
                <div id="returnTime">
                <TimePickerField
                  label={t("booking.returnTime")}
                  value={userBookingDetails.returnTime}
                  onChange={(date) => handleChange("returnTime", date?.toISOString())}
                  error={errors?.returnTime}
                  disabled={disabled}
                  orangeColor={orangeColor}
                  t={t}
                  surchargeDetails={surchargeDetails}
                />
                </div>
              )}
            </div>

          </>
        )}
      </div>
    </div>
  );
}
