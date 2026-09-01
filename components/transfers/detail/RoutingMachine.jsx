import { useEffect } from "react";
import L from "leaflet";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";

const RoutingMachine = ({ start, end }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !start || !end) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
 
      show: false,
     createMarker: () => null,
      addWaypoints: false,
      routeWhileDragging: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [
          { color: 'black', opacity: 0.25, weight: 9 },
          { color: 'white', opacity: 0.8, weight: 6 },
          { color: 'hsl(var(--primary))', opacity: 1, weight: 4 }
        ],
      },
    }).addTo(map);

   return () => map.removeControl(routingControl);
  }, [map, start, end]);

  return null;
};

export default RoutingMachine;