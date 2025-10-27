import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { parseTime, formatTime } from "@/utils/dateTimeUtils";

const CustomInput = React.forwardRef(({ value, onClick, className, placeholder }, ref) => (
  <input
    className={`${className} h-10  cursor-pointer border rounded text-sm py-2 px-4 focus:outline-none text-left`}
    onClick={onClick}
    ref={ref}
    value={value}
    placeholder={placeholder}
    readOnly
  />
));

const FlightDetails = ({
  flightArrivalNumber,
  flightArrivalTime,
  flightDepartureNumber,
  flightDepartureTime,
  showDeparture,
  onArrivalNumChange,
  onArrivalTimeChange,
  onDepartureNumChange,
  onDepartureTimeChange,
}) => {

  const handleArrivalTimeChange = (time) => {
    onArrivalTimeChange(formatTime(time));
  };

  const handleDepartureTimeChange = (time) => {
    onDepartureTimeChange(formatTime(time));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="flightArrivalNumber" className="block text-sm font-medium text-gray-700">
          Flight Arrival Number
        </label>
        <input
          type="text"
          id="flightArrivalNumber"
          className="shadow appearance-none text-sm border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={flightArrivalNumber}
          onChange={onArrivalNumChange}
          placeholder="e.g., XY123"
        />
      </div>

      <div>
        <label htmlFor="flightArrivalTime" className="block text-sm font-medium text-gray-700">
          Flight Arrival Time
        </label>
        <DatePicker
        id="flightArrivalTime"
          selected={parseTime(flightArrivalTime)}
          onChange={handleArrivalTimeChange}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={15}
          timeCaption="Time"
          dateFormat="HH:mm"
          placeholderText= "Select flight arrival time"
         customInput={React.createElement(CustomInput, {
    className: "w-full",
    id: "flightArrivalTime"
  })}
  wrapperClassName="w-full"
        />
      </div>

      {showDeparture && (
        <>
          <div>
            <label htmlFor="flightDepartureNumber" className="block text-sm font-medium text-gray-700">
              Flight Departure Number
            </label>
            <input
              type="text"
              id="flightDepartureNumber"
              className="shadow appearance-none text-sm border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={flightDepartureNumber}
              onChange={onDepartureNumChange}
              placeholder="e.g., AB456"
            />
          </div>

          <div>
            <label htmlFor="flightDepartureTime" className="block text-sm font-medium text-gray-700">
              Flight Departure Time
            </label>
            <DatePicker
            id="flightArrivalTime"
              selected={parseTime(flightDepartureTime)}
              onChange={handleDepartureTimeChange}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="HH:mm"
              placeholderText= "Select departure time"
             customInput={React.createElement(CustomInput, {
    
    className: "w-full",
    id:'flightDepartureTime'
  })}
  wrapperClassName="w-full"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default FlightDetails;
