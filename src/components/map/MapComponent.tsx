"use client";

import { useEffect, useRef } from "react";
import { LongdoMap } from "longdomap-react";
import { Report, Location } from "@/lib/types";
import { DEFAULT_CENTER, DEFAULT_ZOOM, isWithinThailand } from "@/utils/geo";

declare global {
  interface Window {
    longdo: any;
  }
}

interface MapViewProps {
  reports: Report[];
  center?: Location;
  zoom?: number;
  radiusKm?: number;
  onMapClick?: (location: Location) => void;
  selectedLocation?: Location | null;
  interactive?: boolean;
  className?: string;
}

export default function MapComponent(props: MapViewProps) {
  const mapRef = useRef<any>(null);
  const center = props.center || DEFAULT_CENTER;
  const zoom = props.zoom || DEFAULT_ZOOM;
  const apiKey = process.env.NEXT_PUBLIC_LONGDO_MAP_KEY || "ms.longdo.com";

  // Bind click event once map object is ready
  const handleMapInit = (map: any) => {
    mapRef.current = map;
    if (typeof window !== "undefined" && window.longdo) {
      map.Event.bind("click", () => {
        if (props.interactive && props.onMapClick) {
          const loc = map.location(window.longdo.LocationMode.Pointer);
          if (loc) {
            const targetLoc = { lat: loc.lat, lng: loc.lon };
            if (isWithinThailand(targetLoc)) {
              props.onMapClick(targetLoc);
            } else {
              alert("กรุณาปักหมุดตำแหน่งภายในประเทศไทยเท่านั้น");
            }
          }
        }
      });
    }
  };

  // Move map location when center props change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.location({ lon: center.lng, lat: center.lat }, true);
    }
  }, [center.lat, center.lng]);

  // Sync Overlays (Markers & Radius circle)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || typeof window === "undefined" || !window.longdo) return;

    try {
      map.Overlays.clear();

      // 1. Draw radius circle
      if (props.radiusKm && props.center) {
        const circle = new window.longdo.Circle(
          { lon: props.center.lng, lat: props.center.lat },
          props.radiusKm * 1000,
          {
            fillColor: "rgba(249, 115, 22, 0.15)",
            lineColor: "rgba(249, 115, 22, 0.7)",
            lineWidth: 2,
          }
        );
        map.Overlays.add(circle);
      }

      // 2. Add report markers
      props.reports.forEach((report) => {
        const isEmergency = report.type === "emergency";
        const iconEmoji = report.animalType === "cat" ? "🐱" : "🐶";
        const bgColor = isEmergency ? "#ef4444" : "#f97316";

        const html = `
          <div style="
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: ${bgColor};
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 2px solid white;
            cursor: pointer;
          ">
            ${iconEmoji}
          </div>
        `;

        const marker = new window.longdo.Marker(
          { lon: report.location.lng, lat: report.location.lat },
          {
            title: report.title,
            detail: `${report.description || ""}<br/><br/><strong>สถานะ:</strong> ${
              report.type === "emergency" ? "ฉุกเฉิน 🚨" : "หาบ้าน 🏠"
            }`,
            icon: {
              html: html,
              offset: { x: 18, y: 18 },
            },
          }
        );

        map.Overlays.add(marker);
      });

      // 3. Add user selected location marker
      if (props.selectedLocation) {
        const pinHtml = `
          <div style="position: relative; width: 32px; height: 32px;">
            <div style="
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: #3b82f6;
              border: 3px solid white;
              box-shadow: 0 0 16px rgba(59, 130, 246, 0.9);
            "></div>
          </div>
        `;

        const userMarker = new window.longdo.Marker(
          { lon: props.selectedLocation.lng, lat: props.selectedLocation.lat },
          {
            title: "ตำแหน่งของคุณ",
            icon: {
              html: pinHtml,
              offset: { x: 16, y: 16 },
            },
          }
        );

        map.Overlays.add(userMarker);
      }
    } catch (e) {
      console.warn("Failed to sync Longdo overlays:", e);
    }
  }, [props.reports, props.selectedLocation, props.radiusKm, props.center?.lat, props.center?.lng]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border shadow-md ${props.className || ""}`}>
      <LongdoMap
        apiKey={apiKey}
        location={{ lon: center.lng, lat: center.lat }}
        zoom={zoom}
        height="100%"
        width="100%"
        mapObj={handleMapInit}
      />
    </div>
  );
}
