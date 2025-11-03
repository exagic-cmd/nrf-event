import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

/**
 * GoogleMap component
 * - Loads Google Maps JS API dynamically (uses REACT_APP_GOOGLE_MAPS_API_KEY by default)
 * - Renders a map and exposes imperative methods via ref:
 *     ref.current.getMap()
 *     ref.current.addMarker({ position, title, ...google.maps.MarkerOptions })
 *
 * Usage:
 * <GoogleMap ref={mapRef} apiKey="YOUR_KEY" center={{lat:..., lng:...}} zoom={10} onLoad={(map, google) => {}} />
 */

const loadGoogleMapsScript = (apiKey) => {
    if (!apiKey) return Promise.reject(new Error("Google Maps API key is required"));

    const src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    // if already loaded
    if (window.google && window.google.maps) return Promise.resolve(window.google);
    // if script tag already exists but not loaded yet
    const existing = Array.from(document.getElementsByTagName("script")).find((s) =>
        s.src && s.src.startsWith("https://maps.googleapis.com/maps/api/js")
    );
    if (existing) {
        return new Promise((resolve, reject) => {
            existing.addEventListener("load", () => {
                if (window.google && window.google.maps) resolve(window.google);
                else reject(new Error("Google loaded but window.google.maps not available"));
            });
            existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps script")));
        });
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            if (window.google && window.google.maps) resolve(window.google);
            else reject(new Error("Google Maps loaded but window.google.maps not available"));
        };
        script.onerror = () => reject(new Error("Failed to load Google Maps script"));
        document.head.appendChild(script);
    });
};

const GoogleMap = forwardRef(
    (
        {
            apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
            center = { lat: -34.397, lng: 150.644 },
            zoom = 8,
            mapOptions = {},
            onLoad,
            style = { width: "100%", height: "400px" },
        },
        ref
    ) => {
        const containerRef = useRef(null);
        const mapRef = useRef(null);
        const markersRef = useRef([]);

        useImperativeHandle(ref, () => ({
            getMap: () => mapRef.current,
            addMarker: (options) => {
                if (!mapRef.current || !window.google) return null;
                const marker = new window.google.maps.Marker({
                    map: mapRef.current,
                    ...(options || {}),
                });
                markersRef.current.push(marker);
                return marker;
            },
            clearMarkers: () => {
                markersRef.current.forEach((m) => m.setMap(null));
                markersRef.current = [];
            },
        }));

        useEffect(() => {
            let mounted = true;
            loadGoogleMapsScript(apiKey)
                .then((google) => {
                    if (!mounted) return;
                    if (!containerRef.current) return;
                    mapRef.current = new google.maps.Map(containerRef.current, {
                        center,
                        zoom,
                        ...mapOptions,
                    });
                    if (typeof onLoad === "function") onLoad(mapRef.current, google);
                })
                .catch((err) => {
                    console.error("GoogleMap error:", err);
                });

            return () => {
                mounted = false;
                // cleanup markers
                if (markersRef.current.length) {
                    markersRef.current.forEach((m) => m.setMap(null));
                    markersRef.current = [];
                }
                // do not remove script or window.google to avoid breaking other map instances
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []); // load only once

        // update center/zoom if they change
        useEffect(() => {
            if (mapRef.current) {
                mapRef.current.setCenter(center);
            }
        }, [center]);

        useEffect(() => {
            if (mapRef.current && typeof zoom === "number") {
                mapRef.current.setZoom(zoom);
            }
        }, [zoom]);

        return <div ref={containerRef} style={style} />;
    }
);

export default GoogleMap;