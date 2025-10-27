import "@/styles/globals.css";

import React, { useState, useEffect } from "react";
import useBookingStore from "@/store/userBookingStore";
import { useProductStore } from "@/store/useProductStore";
import MenuPills from "@/components/common/MenuPills";

import DateInputs from "@/components/product/bookingInfo/DateInput";

import LocationInputs from "@/components/product/bookingInfo/LocationInput";

import FlightDetails from "@/components/product/bookingInfo/FlightDetails";

import BookingButton from "@/components/product/bookingInfo/BookingButton";

import BookingPolicy from "@/components/product/bookingInfo/BookingPolicy";
import  TransferCard from "@/components/common/TransferCard"
import PayNow from '@/components/product/PayNow';
import { ChevronLeft, } from 'lucide-react'; 
const TransferBooking = ({id,onBack}) => {
  const categories = [
    { id: 1, name: "hotelToHotel", display: "Hotel to Hotel" },

    { id: 2, name: "airportToHotel", display: "Airport to Hotel" },

    { id: 3, name: "hotelToAirport", display: "Hotel to Airport" },

    { id: 4, name: "airportRoundtrip", display: "Airport Roundtrip" },
  ];
const {
    pickupPoints,
    dropoffPoints,
    loadingPickup,
    loadingDropoff,
    errorPickup,
    errorDropoff,
    fetchPickupPoints,
     fetchAvailableTransport,
     availableTransfers,
  } = useBookingStore();

  const { clusterGroups, fetchClusterGroups, loadingClusterGroups, errorClusterGroups } = useBookingStore();
const [selectedTransferId, setSelectedTransferId] = useState(null);
 const [showPayNow, setShowPayNow] = useState(false);
const [bookingDetails, setBookingDetails] = useState(null);
  const [activeCategory, setActiveCategory] = useState("hotelToHotel");

  const [transferType, setTransferType] = useState("hotelToHotel");

  const [arrivalDate, setArrivalDate] = useState("");

  const [desiredPickupDate, setDesiredPickupDate] = useState("");

  const [pickupPoint, setPickupPoint] = useState("");

  const [dropoffPoint, setDropoffPoint] = useState("");

  const [flightArrivalNumber, setFlightArrivalNumber] = useState("");

  const [flightArrivalTime, setFlightArrivalTime] = useState("");

  const [flightDepartureNumber, setFlightDepartureNumber] = useState("");

  const [flightDepartureTime, setFlightDepartureTime] = useState("");

  const [termsAccepted, setTermsAccepted] = useState(false);
  const pickup = pickupPoints.find(p => String(p.id) === String(pickupPoint));
const dropoff = dropoffPoints.find(p => String(p.id) === String(dropoffPoint));

const filteredPickupPoints = React.useMemo(() => {
  if (transferType === "hotelToHotel" || transferType === "hotelToAirport") {
    return pickupPoints.filter(p => p.type === "hotel");
  }
  if (transferType === "airportToHotel" || transferType === "airportRoundtrip") {
    return pickupPoints.filter(p => p.type === "airport");
  }
  return pickupPoints;
}, [pickupPoints, transferType]);

const filteredDropoffPoints = React.useMemo(() => {
  if (!pickupPoint) return [];
  const selectedPickup = pickupPoints.find(p => String(p.id) === String(pickupPoint));
  if (!selectedPickup) return [];
  const allowedGroups = clusterGroups?.[String(selectedPickup.matching_group_id)];
  if (!allowedGroups) return [];
  // Show all dropoff points (hotel or airport) that match the allowed group
  return dropoffPoints.filter(
    p => allowedGroups.includes(Number(p.matching_group_id))
  );
}, [dropoffPoints, pickupPoint, pickupPoints, clusterGroups]);


useEffect(() => {
    if (id) {
      fetchPickupPoints(id).then(() => {
       fetchClusterGroups(id);
      });
    }
  }, [id, fetchPickupPoints,fetchClusterGroups]);

  //2nd
useEffect(() => {
  if (pickupPoint && dropoffPoint) {
    fetchAvailableTransport({
      product_id: id,
      from_hotel: pickupPoint,
      to_hotel: dropoffPoint,
    });
  }
}, [pickupPoint, dropoffPoint, id, fetchAvailableTransport]);
const handleTransferTypeChange = (type) => {
  setTransferType(type);
  setActiveCategory(type);
  setPickupPoint("");
  setDropoffPoint("");
  setFlightArrivalNumber("");
  setFlightArrivalTime("");
  setFlightDepartureNumber("");
  setFlightDepartureTime("");
  setArrivalDate("");
  setDesiredPickupDate("");
  setSelectedTransferId(null);
};

const handleArrivalDateChange = (value) => {
  setArrivalDate(value);
};

const handleDesiredPickupDateChange = (value) => {
  setDesiredPickupDate(value);
};

 const handlePickupPointChange = (e) => {
  const selectedId = e.target.value;
  setPickupPoint(selectedId); // store ID

  const pickup = pickupPoints.find(p => String(p.id) === String(selectedId));
  if (!pickup) return;

  const matches = clusterGroups[pickup?.matching_group_id] || [];
  console.log("Filtered dropoffs:", matches);
 console.log("Hotel selected:", pickup.name);
    console.log("Pickup matching_group_id:", pickup.matching_group_id);
 
  console.log("Matching Group ID:", pickup?.matching_group_id);
  console.log("Direct Matches Only:", matches);
  const filtered = dropoffPoints.filter(drop =>
    matches.includes(drop.matching_group_id)
  );
console.log("Dropoff:", filtered);
    setDropoffPoint('');
  
};


  const handleDropoffPointChange = (e) => {
    setDropoffPoint(e.target.value);

  };

  const handleFlightArrivalNumberChange = (e) => {
    setFlightArrivalNumber(e.target.value);
  };

  const handleFlightArrivalTimeChange = (value) => {
    setFlightArrivalTime(value);
  };

  const handleFlightDepartureNumberChange = (e) => {
    setFlightDepartureNumber(e.target.value);
  };

  const handleFlightDepartureTimeChange = (value) => {
    setFlightDepartureTime(value);
  };

  const handleTermsAcceptance = (e) => {
    setTermsAccepted(e.target.checked);
  };
const handleBackToDetails = () => {
  setShowPayNow(false);
};
  const handleSubmit = (e) => {
    e.preventDefault();

    let isValid = true;

    const emptyFields = []; 

    if (!arrivalDate) {
      isValid = false;

      emptyFields.push("Arrival Date");
    } 

    if (
      transferType === "hotelToHotel" ||
      transferType === "airportRoundtrip"
    ) {
      if (!desiredPickupDate) {
        isValid = false;

        emptyFields.push("Desired Pickup Date");
      }
    } 

    if (
      transferType === "airportToHotel" ||
      transferType === "hotelToAirport" ||
      transferType === "airportRoundtrip"
    ) {
      if (!pickupPoint) {
        isValid = false;

        emptyFields.push("Pickup Point");
      }

      if (!dropoffPoint) {
        isValid = false;

        emptyFields.push("Dropoff Point");
      }
    } 

    if (
      transferType === "airportToHotel" ||
      transferType === "airportRoundtrip"
    ) {
      if (!flightArrivalNumber) {
        isValid = false;

        emptyFields.push("Flight Arrival Number");
      }

      if (!flightArrivalTime) {
        isValid = false;

        emptyFields.push("Flight Arrival Time");
      }

      if (transferType === "airportRoundtrip") {
        if (!flightDepartureNumber) {
          isValid = false;

          emptyFields.push("Flight Departure Number");
        }

        if (!flightDepartureTime) {
          isValid = false;

          emptyFields.push("Flight Departure Time");
        }
        if (!selectedTransferId) {
  isValid = false;
  emptyFields.push("Transfer Option");
}

      }
    } 

    if (!termsAccepted) {
      isValid = false;

      emptyFields.push("Cancellation Policy");
    }

   if (!isValid) {
  alert(
        `Please fill in the following required fields: ${emptyFields.join(
          ", "
        )}`
  );

  return; 
}

const bookingDetailsObj = {
  transferType,
  arrivalDate,
  desiredPickupDate,
  pickupPoint: pickup ? pickup.name : "",    
  dropoffPoint: dropoff ? dropoff.name : "",  
  flightArrivalNumber,
  flightArrivalTime,
  flightDepartureNumber,
  flightDepartureTime,
  selectedTransferId
};

console.log("Booking Details:", bookingDetailsObj);
useProductStore.getState().setBookingDetails(bookingDetailsObj);
setBookingDetails(bookingDetailsObj); 
setShowPayNow(true);

  }
  const handleCategoryClick = (categoryName) => {
    setActiveCategory(categoryName);

    handleTransferTypeChange(categoryName);
  };

  return (
     <>
      {showPayNow ? (
        <PayNow id={id} bookingDetails={bookingDetails} onBack={handleBackToDetails} />
      ) : (
       
  <div className="flex flex-col lg:flex-row gap-8 max-w-full md:mx-24 mx-2 mt-24 p-2 md:p-12">
     
      <div className="w-full lg:w-3/3 bg-white rounded-xl p-2 shadow-md">
      <>
      <button
          onClick={onBack}
          className="flex items-center px-5 py-2 border border-gray-400 rounded-full text-gray-600 hover:bg-gray-100"
        >
         <ChevronLeft/>
          Back
        </button>
        <div className="p-6">
       <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Book Your Private Transfer        {" "}
        </h2>
               {" "}
        <div className="flex gap-2 flex-wrap mb-2">
                   {" "}
                {categories.map((category) => (
                  <MenuPills
                    key={category.id}
                    category={{ id: category.id, name: category.display }}
                    isActive={activeCategory === category.name}
              onClick={() => handleCategoryClick(category.name)}
            />
                ))}
                 {" "}
        </div>
               {" "}
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                   {" "}
                <DateInputs
                  arrivalDate={arrivalDate}
                  onArrivalDateChange={handleArrivalDateChange}
                  desiredPickupDate={desiredPickupDate}
                  onPickupDateChange={handleDesiredPickupDateChange}
            showDesiredPickup={
              transferType === "hotelToHotel" ||
              transferType === "airportRoundtrip"
            }
          />
                <hr />         {" "}
                {(transferType === "airportToHotel" ||
                  transferType === "hotelToAirport" ||
                  transferType === "hotelToHotel" ||
                  transferType === "airportRoundtrip") && (
                    <LocationInputs
                      pickupPoint={pickupPoint}
                      dropoffPoint={dropoffPoint}
                      onPickupChange={handlePickupPointChange}
                      onDropoffChange={handleDropoffPointChange}
                      pickupPoints={filteredPickupPoints}
                      dropoffPoints={filteredDropoffPoints}
                      loadingPickup={loadingPickup}
                      loadingDropoff={loadingDropoff}
                      errorPickup={errorPickup}
  errorDropoff={errorDropoff}
/>
                  )}
                {" "}
                {(transferType === "airportToHotel" ||
                  transferType === "hotelToAirport" ||
                  transferType === "airportRoundtrip") && (
                    <FlightDetails
                      flightArrivalNumber={flightArrivalNumber}
                      flightArrivalTime={flightArrivalTime}
                      onArrivalNumChange={handleFlightArrivalNumberChange}
                      onArrivalTimeChange={handleFlightArrivalTimeChange}
                      showDeparture={transferType === "airportRoundtrip"}
                      flightDepartureNumber={flightDepartureNumber}
                      flightDepartureTime={flightDepartureTime}
                      onDepartureNumChange={handleFlightDepartureNumberChange}
              onDepartureTimeChange={handleFlightDepartureTimeChange}
            />
                  )}

                {availableTransfers.length > 0 && (
                  <div className="overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-orange-400">
                    <div className="flex gap-2 w-full px-4 py-4">
                      {availableTransfers.map((transfer) => (
                        <div
                          key={transfer.id}
                          className="snap-center flex-shrink-0 w-[90%] max-w-[600px]"
                        >
                          <TransferCard
                            transfer={transfer}
                            isSelected={selectedTransferId === transfer.id}
            onSelect={setSelectedTransferId}
          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="">
                  <BookingPolicy
                    onTermsChange={handleTermsAcceptance}
            termsAccepted={termsAccepted}
            id={id}
          />
                  <BookingButton className ="py-24 bg-green-500 p-12" onClick={handleSubmit} />
                </div>
              </form>
               </div>
            </>
        </div>
         {" "}
    </div>
    
             )}
          </>
  );
};

export default TransferBooking;
