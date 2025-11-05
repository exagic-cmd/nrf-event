import { Check, X } from "lucide-react";

const RoomTypes = ({ results, currency, onRoomSelect }) => {
  if (!results || results.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-12 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Room Types</h2>
        <div className="text-gray-400 text-center py-8">
          No rooms available for selected dates
        </div>
      </div>
    );
  }

  // Group results by RoomType text so we show one card per room type with multiple meal/price options
  const groups = results.reduce((acc, res) => {
    const roomType = res?.Room?.RoomType?.["@attributes"]?.text || "Unknown";
    acc[roomType] = acc[roomType] || [];
    acc[roomType].push(res);
    return acc;
  }, {});

  return (
    <div className="px-4 sm:px-6 lg:px-12 py-8 bg-gray-900">
      <h2 className="text-2xl font-bold text-white mb-8">Available Room Types</h2>
      <div className="space-y-4">
        {Object.entries(groups).map(([roomType, offers]) => (
          <div key={roomType} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white">{roomType}</h3>
            </div>

            <div className="space-y-3">
              {offers.map((offer) => {
                const id = offer["@attributes"]?.id || offer.Room?.RoomType?.["@attributes"]?.code || Math.random();
                const meal = offer.Room?.MealType?.["@attributes"]?.text || "Meal";
                const price = offer.Room?.Price?.["@attributes"]?.amt || "0.00";
                const cancel = offer.Room?.CancellationPolicyStatus || "Unknown";

                return (
                  <div key={id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gray-900 p-4 rounded-md border border-gray-700">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Meal:</span>
                          <span className="text-[#CC9A55]">{meal}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-medium">Cancellation:</span>
                          <span className={`flex items-center gap-1 ${cancel === 'NonRefundable' ? 'text-red-400' : 'text-green-400'}`}>
                            {cancel === 'NonRefundable' ? <X size={16} /> : <Check size={16} />}
                            <span>{cancel}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 lg:ml-6">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#CC9A55]">
                          {currency} {price}
                        </div>
                        <div className="text-sm text-gray-400">Total stay</div>
                      </div>

                      <button
                        onClick={() => onRoomSelect(offer)}
                        className="bg-[#CC9A55] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#b88a45] transition-colors whitespace-nowrap"
                      >
                        Select Room
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomTypes;