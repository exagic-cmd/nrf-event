import React from 'react';
import "@/styles/globals.css";


const LocationInputs = ({
  pickupPoint,
  dropoffPoint,
  dropoffPoints,
  onPickupChange,
  onDropoffChange,
  pickupPoints = [],
  loadingPickup = false,
  loadingDropoff = false,
  errorPickup = '',
  errorDropoff = '',
}) => {
 // console.log("pickupPoints", pickupPoints);
console.log("dropoffPoints", dropoffPoints);
  return (
    <div className="flex w-full">
      <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-4'>
       <div>
         <label className="block text-sm font-medium text-muted-foreground mb-1">Pickup Point</label>
        {loadingPickup ? (
          <div className="text-muted-foreground">Loading pickup points...</div>
        ) : errorPickup ? (
          <div className="text-red-500">{errorPickup}</div>
        ) : (
          <select
  value={pickupPoint}
     onChange={onPickupChange}
  className="w-full border border-border rounded px-3 py-2"
>
  <option value="">Select Pickup Point</option>
  {pickupPoints.map((point) => (
    <option key={point.id} value={point.id}>{point.name}</option>
  ))}
</select>
        )}
       </div>

      <div>
          <label className="block text-sm font-medium text-muted-foreground  mb-1">Dropoff Point</label>
        {loadingDropoff ? (
          <div className="text-muted-foreground">Loading dropoff points...</div>
        ) : errorDropoff ? (
          <div className="text-red-500">{errorDropoff}</div>
        ) : (
       <select
  value={dropoffPoint}
  onChange={onDropoffChange}
  className="w-full border border-border rounded px-3 py-2"
>
  <option value="">Select Dropoff Point</option>
  {dropoffPoints.map((point) => (
    <option key={point.id} value={point.id}>{point.name}</option>
  ))}
</select>
        )}
      </div>
      </div>
    </div>
  );
};

export default LocationInputs;
