"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Report, Location } from "@/lib/types";
import { DEFAULT_CENTER, DEFAULT_ZOOM, isWithinThailand } from "@/utils/geo";
import { Loader2 } from "lucide-react";

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

const loadLongdoSDK = (apiKey: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.longdo) {
      resolve(window.longdo);
      return;
    }
    const existingScript = document.getElementById("longdo-map-sdk");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.longdo));
      existingScript.addEventListener("error", (e) => reject(e));
      return;
    }
    const script = document.createElement("script");
    script.id = "longdo-map-sdk";
    script.src = `https://api.longdo.com/map3/?key=${apiKey}`;
    script.async = true;
    script.onload = () => {
      if (window.longdo) {
        resolve(window.longdo);
      } else {
        reject(new Error("Longdo Map SDK object missing"));
      }
    };
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
};

export default function MapComponent(props: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const center = props.center || DEFAULT_CENTER;
  const zoom = props.zoom || DEFAULT_ZOOM;
  const apiKey = process.env.NEXT_PUBLIC_LONGDO_MAP_KEY || "ms.longdo.com";

  // Use props refs to keep click callback fresh inside event listener
  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    loadLongdoSDK(apiKey)
      .then((longdo) => {
        if (!isMounted || !containerRef.current || mapRef.current) return;

        try {
          const map = new longdo.Map({
            placeholder: containerRef.current,
            location: { lon: center.lng, lat: center.lat },
            zoom: zoom,
            lastView: false,
          });

          mapRef.current = map;

          map.Event.bind("ready", () => {
            if (!isMounted) return;
            setIsMapReady(true);
            setLoading(false);

            // Bind click handler inside ready callback
            map.Event.bind("click", () => {
              const currentProps = propsRef.current;
              if (currentProps.interactive && currentProps.onMapClick) {
                const loc = map.location(longdo.LocationMode.Pointer);
                if (loc) {
                  const targetLoc = { lat: loc.lat, lng: loc.lon };
                  if (isWithinThailand(targetLoc)) {
                    currentProps.onMapClick(targetLoc);
                  } else {
                    alert("กรุณาปักหมุดตำแหน่งภายในประเทศไทยเท่านั้น");
                  }
                }
              }
            });
          });
        } catch (err) {
          console.error("Longdo Map init error:", err);
          if (isMounted) {
            setError(true);
            setLoading(false);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load Longdo SDK:", err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [apiKey]);

  // Pan map when center changes
  useEffect(() => {
    if (isMapReady && mapRef.current) {
      try {
        mapRef.current.location({ lon: center.lng, lat: center.lat }, true);
      } catch (e) {
        console.warn("Error setting map location:", e);
      }
    }
  }, [center.lat, center.lng, isMapReady]);

  // Render Overlays (Circle, Report Markers, Selected User Pin) after map is READY
  const updateOverlays = useCallback(() => {
    const map = mapRef.current;
    if (!isMapReady || !map || typeof window === "undefined" || !window.longdo) return;

    try {
      map.Overlays.clear();

      // 1. Draw Radius Search Circle Overlay
      if (props.radiusKm && props.center) {
        try {
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
        } catch (err) {
          console.warn("Failed to add circle overlay:", err);
        }
      }

      // 2. Add Report Markers
      props.reports.forEach((report) => {
        const isEmergency = report.type === "emergency";
        const iconEmoji = report.animalType === "cat" ? "🐱" : "🐶";
        const bgColor = isEmergency ? "#ef4444" : "#f97316";

        const markerHtml = `
          <div style="
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: ${bgColor};
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            border: 2px solid white;
            cursor: pointer;
          ">
            ${iconEmoji}
          </div>
        `;

        const imgUrl = report.imageUrl;
        const richDetailHtml = `
          <div style="font-family: var(--font-sans), system-ui, sans-serif; padding: 4px; max-width: 240px; box-sizing: border-box;">
            ${
              imgUrl
                ? `<div style="position: relative; margin-bottom: 10px; border-radius: 12px; overflow: hidden; height: 135px; background: #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                    <img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="${report.title}" />
                    <span style="position: absolute; top: 6px; right: 6px; background: ${
                      isEmergency ? '#ef4444' : '#10b981'
                    }; color: white; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                      ${isEmergency ? '🚨 ฉุกเฉิน' : '🏠 หาบ้าน'}
                    </span>
                  </div>`
                : `<div style="margin-bottom: 8px;">
                    <span style="background: ${
                      isEmergency ? '#fee2e2' : '#d1fae5'
                    }; color: ${
                      isEmergency ? '#dc2626' : '#059669'
                    }; font-size: 11px; font-weight: bold; padding: 3px 10px; border-radius: 12px; display: inline-block;">
                      ${isEmergency ? '🚨 เหตุฉุกเฉิน' : '🏠 ประกาศหาบ้าน'}
                    </span>
                  </div>`
            }
            <p style="margin: 0 0 6px 0; font-size: 12px; color: #475569; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${report.description || "ไม่มีรายละเอียดเพิ่มเติม"}
            </p>
            ${
              report.address
                ? `<p style="margin: 0 0 10px 0; font-size: 11px; color: #64748b; font-weight: 500; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">
                    📍 ${report.address}
                  </p>`
                : ""
            }
            <a href="https://www.google.com/maps/dir/?api=1&destination=${report.location.lat},${report.location.lng}"
               target="_blank"
               rel="noopener noreferrer"
               style="
                 display: block;
                 text-align: center;
                 padding: 8px 12px;
                 background: linear-gradient(135deg, #f97316, #ea580c);
                 color: white;
                 font-size: 12px;
                 font-weight: bold;
                 border-radius: 10px;
                 text-decoration: none;
                 box-shadow: 0 3px 8px rgba(249, 115, 22, 0.3);
                 margin-top: 4px;
               "
            >
              🧭 นำทางไปยังพิกัดนี้ →
            </a>
          </div>
        `;

        const marker = new window.longdo.Marker(
          { lon: report.location.lng, lat: report.location.lat },
          {
            title: report.title,
            detail: richDetailHtml,
            icon: {
              html: markerHtml,
              offset: { x: 19, y: 19 },
            },
          }
        );

        map.Overlays.add(marker);
      });

      // 3. Add Selected Location Marker
      if (props.selectedLocation) {
        const pinHtml = `
          <div style="position: relative; width: 34px; height: 34px;">
            <div style="
              width: 30px;
              height: 30px;
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
              offset: { x: 17, y: 17 },
            },
          }
        );

        map.Overlays.add(userMarker);
      }
    } catch (err) {
      console.warn("Failed to render Longdo map overlays:", err);
    }
  }, [isMapReady, props.reports, props.selectedLocation, props.radiusKm, props.center]);

  useEffect(() => {
    updateOverlays();
  }, [updateOverlays]);

  if (error) {
    return (
      <div className="w-full h-full min-h-[420px] flex flex-col items-center justify-center bg-muted/20 rounded-2xl border p-6 text-center text-muted-foreground">
        <p className="font-semibold text-sm">ไม่สามารถโหลดแผนที่ Longdo Map ได้</p>
        <p className="text-xs mt-1 text-muted-foreground/70">กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง</p>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border shadow-md ${props.className || ""}`}>
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xs">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
          <p className="text-xs font-bold text-foreground">กำลังโหลด Longdo Map...</p>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[450px]"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
