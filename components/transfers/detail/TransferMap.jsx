"use client"

import { MapContainer, TileLayer, Marker, useMap, Popup, ZoomControl } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useEffect, useState } from "react"
import RoutingMachine from "./RoutingMachine"
import { Maximize2, X } from "lucide-react"

const createCustomIcon = (label) => {
  return new L.DivIcon({
    html: `<div style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">${label}</div>`,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const pickupIcon = createCustomIcon('A');
const dropoffIcon = createCustomIcon('B');

function MapBounds({ bounds }) {
  const map = useMap()
  useEffect(() => {
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [map, bounds])
  return null
}

function MapInteractionHandler({ isInteractive }) {
  const map = useMap()
  useEffect(() => {
    if (isInteractive) {
      map.dragging.enable()
      map.scrollWheelZoom.enable()
      map.touchZoom.enable()
      map.doubleClickZoom.enable()
      map.keyboard.enable()
      if (map.tap) map.tap.enable()
    } else {
      map.dragging.disable()
      map.scrollWheelZoom.disable()
      map.touchZoom.disable()
      map.doubleClickZoom.disable()
      map.keyboard.disable()
      if (map.tap) map.tap.disable()
    }
    map.invalidateSize()
  }, [map, isInteractive])
  return null
}

const TransferMap = ({ mapDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const pLat = Number(mapDetails?.pickup?.lat)
  const pLng = Number(mapDetails?.pickup?.lng)
  const dLat = Number(mapDetails?.dropoff?.lat)
  const dLng = Number(mapDetails?.dropoff?.lng)

  // Rely on API coordinates: Ensure we have valid numbers before rendering
  if (isNaN(pLat) || isNaN(pLng) || isNaN(dLat) || isNaN(dLng) || !pLat || !dLat) {
    return (
      <div className="h-full w-full bg-secondary flex items-center justify-center text-muted-foreground">
        <p>Loading map...</p>
      </div>
    )
  }

  const pickupPosition = [pLat, pLng];
  const dropoffPosition = [dLat, dLng];
  const bounds = [pickupPosition, dropoffPosition]

  const mapThemeUrl = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"

  return (
    <div className="relative h-full w-full">
      <MapContainer 
        center={pickupPosition} 
        zoom={13} 
        style={{ height: "100%", width: "100%" }} 
        scrollWheelZoom={false} 
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
        zoomControl={false}
        attributionControl={false}
      >
        <MapInteractionHandler isInteractive={isExpanded} />
        <MapBounds bounds={bounds} />
        {isExpanded && <ZoomControl position="topleft" />}
        <TileLayer url={mapThemeUrl} />
        <Marker position={pickupPosition} icon={pickupIcon}>
          <Popup>
            <span className="font-bold">Pickup:</span><br />{mapDetails.pickup.name}
          </Popup>
        </Marker>
        <Marker position={dropoffPosition} icon={dropoffIcon}>
          <Popup>
            <span className="font-bold">Dropoff:</span><br />{mapDetails.dropoff.name}
          </Popup>
        </Marker>
        <RoutingMachine start={pickupPosition} end={dropoffPosition} />
      </MapContainer>
      
      {!isExpanded ? (
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
          className="absolute top-3 left-3 z-[1000] bg-surface/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md border border-border hover:bg-primary/10 transition-all flex items-center gap-2 group cursor-pointer"
        >
          <Maximize2 size={16} className="text-primary" />
          <span className="text-xs font-semibold text-primary">Interact</span>
        </button>
      ) : (
        <button 
          type="button"
          onClick={() => setIsExpanded(false)}
          className="absolute top-4 right-4 z-[10000] bg-surface text-surface-foreground p-2 rounded-full shadow-lg hover:bg-muted transition-colors border border-border cursor-pointer"
        >
          <X size={24} />
        </button>
      )}
    </div>
  )
}

export default TransferMap