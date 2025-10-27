"use client"

import { useEffect, useRef } from "react"

export default function TourMap({ locations }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const routesRef = useRef([])

  useEffect(() => {
    const initMap = () => {
      if (!window.google || !mapRef.current) return

      const validLocations = locations.filter((l) => l.details?.lat && l.details?.lng)
      if (validLocations.length === 0) return

      const firstLocation = validLocations[0]
      const center = {
        lat: Number(firstLocation.details.lat),
        lng: Number(firstLocation.details.lng),
      }

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 12,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }],
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9080" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }],
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3751ff" }],
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#2f3948" }],
          },
          {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }],
          },
        ],
      })

      const bounds = new window.google.maps.LatLngBounds()

      // Add markers
      validLocations.forEach((location, idx) => {
        const pos = {
          lat: Number(location.details.lat),
          lng: Number(location.details.lng),
        }
        bounds.extend(pos)

        const marker = new window.google.maps.Marker({
          position: pos,
          map: mapInstanceRef.current,
          label: String(idx + 1),
          title: location.translations?.EN?.title || "Location",
        })
        markersRef.current.push(marker)
      })

      if (!bounds.isEmpty()) {
        mapInstanceRef.current.fitBounds(bounds)
      }

      // Draw routes
      drawRoutes(validLocations)
    }

    const drawRoutes = (validLocations) => {
      const directionsService = new window.google.maps.DirectionsService()

      // Clear old routes
      routesRef.current.forEach((route) => {
        if (route.setMap) route.setMap(null)
      })
      routesRef.current = []

      validLocations.forEach((location, idx) => {
        if (idx === 0) return

        const prev = validLocations[idx - 1]
        if (!prev.details?.lat || !prev.details?.lng || !location.details?.lat || !location.details?.lng) return

        const travelMode = (location.details.travel_mode || "DRIVING").toUpperCase()

        directionsService.route(
          {
            origin: { lat: Number(prev.details.lat), lng: Number(prev.details.lng) },
            destination: { lat: Number(location.details.lat), lng: Number(location.details.lng) },
            travelMode,
          },
          (result, status) => {
            if (status !== "OK" || !result.routes?.length) return

            const renderer = new window.google.maps.DirectionsRenderer({
              map: mapInstanceRef.current,
              directions: result,
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: "#f59e0b",
                strokeOpacity: 0.9,
                strokeWeight: 5,
              },
            })

            routesRef.current.push(renderer)
          },
        )
      })
    }

    const loadGoogleMaps = () => {
      if (window.google) {
        initMap()
        return
      }

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCY159aZnkp48EtppY_uQrohXre3vGr5h8&libraries=places`
      script.async = true
      script.defer = true
      script.onload = initMap
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [locations])

  return <div ref={mapRef} className="w-full h-96" />
}
