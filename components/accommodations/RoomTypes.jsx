import { Check, X, Utensils, Calendar, Shield } from "lucide-react";
import { useState, useEffect } from "react"; // ✅ Add useEffect

const RoomTypes = ({ 
  allRooms = [], 
  currency = "USD", 
  onRoomSelect,
  nights = 1,
  selectedRoom = null // ✅ Add selectedRoom prop
}) => {
  const [internalSelectedRoom, setInternalSelectedRoom] = useState(selectedRoom?.id || null);

  // ✅ Sync with external selected room changes
  useEffect(() => {
    setInternalSelectedRoom(selectedRoom?.id || null);
  }, [selectedRoom]);

  if (!allRooms || allRooms.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-12 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Available Rooms</h2>
        <div className="text-gray-400 text-center py-8 bg-gray-800 rounded-xl">
          <div className="text-lg mb-2">No rooms available for selected dates</div>
          <div className="text-sm">Please try different dates or check back later</div>
        </div>
      </div>
    );
  }

  // Group rooms by room type to show variations (different meal types, prices)
  const groupedRooms = allRooms.reduce((acc, room) => {
    const roomType = room.roomType || "Standard Room";
    if (!acc[roomType]) {
      acc[roomType] = [];
    }
    acc[roomType].push(room);
    return acc;
  }, {});

  const handleRoomSelect = (room) => {
    setInternalSelectedRoom(room.id);
    if (onRoomSelect) {
      onRoomSelect(room);
    }
  };

  // Format price with currency and proper formatting
  const formatPrice = (price) => {
    if (!price || price === 0) return "0.00";
    return parseFloat(price).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Calculate price per night
  const getPricePerNight = (price) => {
    if (!price || nights === 0) return 0;
    return (price / nights).toFixed(2);
  };

  // Get cancellation policy display
  const getCancellationDisplay = (policy) => {
    const policyLower = policy?.toLowerCase() || '';
    
    if (policyLower.includes('nonrefundable') || policyLower.includes('non-refundable')) {
      return {
        text: "Non-Refundable",
        color: "text-red-400",
        icon: <X size={16} />,
        description: "No refund if cancelled"
      };
    }
    
    if (policyLower.includes('refundable') || policyLower.includes('free')) {
      return {
        text: "Free Cancellation",
        color: "text-green-400",
        icon: <Check size={16} />,
        description: "Free cancellation available"
      };
    }
    
    return {
      text: policy || "Flexible",
      color: "text-yellow-400",
      icon: <Shield size={16} />,
      description: "Check cancellation policy"
    };
  };

  // Get meal type display
  const getMealDisplay = (mealType) => {
    const mealLower = mealType?.toLowerCase() || '';
    
    if (mealLower.includes('breakfast')) {
      return { text: "Breakfast Included", icon: "🍳" };
    }
    if (mealLower.includes('all inclusive')) {
      return { text: "All Inclusive", icon: "🍽️" };
    }
    if (mealLower.includes('half board')) {
      return { text: "Half Board", icon: "🥘" };
    }
    if (mealLower.includes('full board')) {
      return { text: "Full Board", icon: "🍛" };
    }
    
    return { 
      text: mealType || "Room Only", 
      icon: mealType?.toLowerCase().includes('room only') ? "🏨" : "📋" 
    };
  };

  return (
    <div id="room-types-section" className="px-4 sm:px-6 lg:px-12 py-8 bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Available Rooms</h2>
            <p className="text-gray-400">
              {allRooms.length} room option{allRooms.length !== 1 ? 's' : ''} available for your stay
            </p>
          </div>
          {nights > 1 && (
            <div className="text-sm text-gray-400 bg-gray-800 px-3 py-2 rounded-lg">
              {nights} night{nights !== 1 ? 's' : ''} stay
            </div>
          )}
        </div>

        <div className="space-y-6">
          {Object.entries(groupedRooms).map(([roomType, rooms]) => (
            <div key={roomType} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              {/* Room Type Header */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">{roomType}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Flexible check-in</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Utensils size={16} />
                    <span>Multiple meal options</span>
                  </div>
                </div>
              </div>

              {/* Room Options */}
              <div className="space-y-4">
                {rooms.map((room, index) => {
                  const cancellation = getCancellationDisplay(room.cancellationPolicy);
                  const mealInfo = getMealDisplay(room.mealType);
                  const isSelected = internalSelectedRoom === room.id;

                  return (
                    <div 
                      key={room.id || index}
                      className={`bg-gray-900 p-6 rounded-lg border-2 transition-all ${
                        isSelected 
                          ? "border-[#CC9A55] bg-[#CC9A55]/10" 
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        {/* Room Details */}
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Meal Type */}
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{mealInfo.icon}</div>
                              <div>
                                <div className="text-white font-medium">{mealInfo.text}</div>
                                <div className="text-gray-400 text-sm">Meal Plan</div>
                              </div>
                            </div>

                            {/* Cancellation Policy */}
                            <div className="flex items-center gap-3">
                              <div className={cancellation.color}>
                                {cancellation.icon}
                              </div>
                              <div>
                                <div className={`font-medium ${cancellation.color}`}>
                                  {cancellation.text}
                                </div>
                                <div className="text-gray-400 text-sm">
                                  {cancellation.description}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Additional Info */}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            {room.roomCode && (
                              <div>Room Code: {room.roomCode}</div>
                            )}
                            {room.mealCode && (
                              <div>Meal Code: {room.mealCode}</div>
                            )}
                          </div>
                        </div>

                        {/* Price and Action */}
                        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-end lg:items-center gap-4 lg:gap-6">
                          {/* Price Display */}
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#CC9A55] mb-1">
                              {currency} {formatPrice(room.price)}
                            </div>
                            <div className="text-sm text-gray-400">
                              Total for {nights} night{nights !== 1 ? 's' : ''}
                            </div>
                            {nights > 1 && (
                              <div className="text-xs text-gray-500">
                                {currency} {getPricePerNight(room.price)} per night
                              </div>
                            )}
                          </div>

                          {/* Select Button */}
                          <button
                            onClick={() => handleRoomSelect(room)}
                            className={`px-8 py-3 rounded-xl font-semibold transition-colors whitespace-nowrap min-w-[140px] ${
                              isSelected
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : "bg-[#CC9A55] text-white hover:bg-[#b88a45]"
                            }`}
                          >
                            {isSelected ? "Selected ✓" : "Select Room"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomTypes;