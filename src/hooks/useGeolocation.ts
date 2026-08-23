"use client";

import { useState, useEffect, useCallback } from "react";
import { Location } from "@/lib/types";
import { DEFAULT_CENTER } from "@/utils/geo";

interface GeolocationState {
  location: Location | null;
  loading: boolean;
  error: string | null;
  permissionState: PermissionState | null;
}

/**
 * Hook: Get user's current geolocation.
 * Falls back to Bangkok center if geolocation is unavailable.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: true,
    error: null,
    permissionState: null,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        location: DEFAULT_CENTER,
        loading: false,
        error: "เบราว์เซอร์ไม่รองรับ Geolocation",
        permissionState: "denied",
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          loading: false,
          error: null,
          permissionState: "granted",
        });
      },
      (err) => {
        setState({
          location: DEFAULT_CENTER,
          loading: false,
          error: err.message,
          permissionState: "denied",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0, // Force uncached real-time hardware location fix
      }
    );
  }, []);

  useEffect(() => {
    // Check permission state
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          setState((prev) => ({ ...prev, permissionState: result.state }));
          if (result.state === "granted" || result.state === "prompt") {
            requestLocation();
          } else {
            setState((prev) => ({
              ...prev,
              location: DEFAULT_CENTER,
              loading: false,
            }));
          }
        })
        .catch(() => {
          requestLocation();
        });
    } else {
      requestLocation();
    }
  }, [requestLocation]);

  return {
    ...state,
    requestLocation,
    // Provide a fallback location that's always available
    effectiveLocation: state.location || DEFAULT_CENTER,
  };
}
