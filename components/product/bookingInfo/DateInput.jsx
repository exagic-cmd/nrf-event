import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { parseDate, formatDate } from "@/utils/dateTimeUtils";

const CustomInput = React.forwardRef(({ value, onClick, className, placeholder }, ref) => (
  <input
    className={`${className} h-10  cursor-pointer text-sm border rounded py-2 px-4 focus:outline-none text-left`}
    onClick={onClick}
    ref={ref}
    value={value}
    placeholder={placeholder}
    readOnly
  />
));

const DateInputs = ({
  arrivalDate,
  onArrivalDateChange,
  desiredPickupDate,
  onPickupDateChange,
  showDesiredPickup,
}) => {
  const handleArrivalChange = (date) => {
    onArrivalDateChange(formatDate(date));
  };

  const handlePickupChange = (date) => {
    onPickupDateChange(formatDate(date));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-min">
      {/* Arrival Date */}
      <div className="">
        <label htmlFor="arrivalDate" className="block text-sm font-medium text-muted-foreground mb-1">
          Arrival Date
        </label>
        <DatePicker
          selected={parseDate(arrivalDate)}
          onChange={handleArrivalChange}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select arrival date"
          minDate={new Date()}
          customInput={React.createElement(CustomInput, {
            className: "w-full",
          })}
          wrapperClassName="w-full"
        />
      </div>
      {showDesiredPickup && (
        <div className="w-full">
          <label htmlFor="desiredPickupDate" className="block text-sm font-medium text-muted-foreground mb-1">
            Desired Pickup Date
          </label>
          <DatePicker
            selected={parseDate(desiredPickupDate)}
            onChange={handlePickupChange}
            dateFormat="yyyy-MM-dd"
             wrapperClassName="w-full"
            placeholderText= "Select desired pickup time"
             minDate={new Date()}
            customInput={React.createElement(CustomInput, {
    className: "w-full",
     id: "arrivadesiredPickupDate"
  })}
          />
        </div>
      )}
    </div>
  );
};

export default DateInputs;
