const AccommodationDescription = ({ descriptions, generalDescription }) => {
  const getDescriptionByType = (type) => {
    return descriptions.find(desc => desc.type === type)?.text;
  };

  return (
    <div className="space-y-8">
      {/* General Description */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
        <p className="text-muted-foreground leading-relaxed">
          {generalDescription}
        </p>
      </div>

      {/* Room Types Description */}
      {getDescriptionByType('RoomTypes') && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-3">Rooms</h3>
          <p className="text-muted-foreground leading-relaxed">
            {getDescriptionByType('RoomTypes')}
          </p>
        </div>
      )}

      {/* Dining Facilities */}
      {getDescriptionByType('DiningFacilities') && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-3">Dining</h3>
          <p className="text-muted-foreground leading-relaxed">
            {getDescriptionByType('DiningFacilities')}
          </p>
        </div>
      )}

      {/* Surrounding Area */}
      {getDescriptionByType('SurroundingArea') && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-3">Location</h3>
          <p className="text-muted-foreground leading-relaxed">
            {getDescriptionByType('SurroundingArea')}
          </p>
        </div>
      )}
    </div>
  );
};

export default AccommodationDescription;