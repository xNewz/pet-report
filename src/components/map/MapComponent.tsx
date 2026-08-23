"use client";

import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Report, Location } from "@/lib/types";
import { DEFAULT_CENTER, DEFAULT_ZOOM, isWithinThailand } from "@/utils/geo";
import { AlertTriangle, Home, MapPin } from "lucide-react";
import { getAnimalSvgString } from "@/components/ui/AnimalIcons";

const THAILAND_MAP_BOUNDS: L.LatLngBoundsExpression = [
  [5.61, 97.34],
  [20.47, 105.64],
];

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

// Fix for default Leaflet icon missing issues in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const createMarkerIcon = (type: string, animalType: string) => {
  const isEmergency = type === "emergency";
  const bgClass = isEmergency ? "bg-destructive text-destructive-foreground shadow-destructive/50" : "bg-primary text-primary-foreground shadow-primary/50";
  return L.divIcon({
    className: "bg-transparent border-none",
    html: `<div class="flex items-center justify-center ${bgClass} rounded-full w-10 h-10 shadow-lg border-2 border-white transition-transform hover:scale-110"><div class="w-5 h-5 flex items-center justify-center">${getAnimalSvgString(animalType)}</div></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const selectedIcon = L.divIcon({
  className: "bg-transparent border-none",
  html: `<div class="relative"><div class="w-8 h-8 rounded-full bg-primary border-4 border-white shadow-lg animate-pulse-glow"></div><div class="absolute inset-0 w-8 h-8 rounded-full bg-primary/30 animate-ping"></div></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapEvents({
  onMapClick,
  interactive,
}: {
  onMapClick?: (location: Location) => void;
  interactive?: boolean;
}) {
  useMapEvents({
    click(e) {
      if (interactive && onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

function MapUpdater({ center, zoom }: { center: Location; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent(props: MapViewProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const center = props.center || DEFAULT_CENTER;
  const zoom = props.zoom || DEFAULT_ZOOM;
  const mapRef = useRef<L.Map | null>(null);

  // Close popup if interactive click happens
  const handleMapClick = (loc: Location) => {
    if (isWithinThailand(loc)) {
      if (props.onMapClick) props.onMapClick(loc);
    } else {
      alert("กรุณาปักหมุดตำแหน่งภายในประเทศไทยเท่านั้น");
    }
    setSelectedReport(null);
  };

  return (
    <div
      className={`rounded-2xl overflow-hidden border ${props.className || ""}`}
      style={{ minHeight: 400, zIndex: 0 }}
    >
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        maxBounds={THAILAND_MAP_BOUNDS}
        maxBoundsViscosity={1.0}
        minZoom={5}
        style={{ width: "100%", height: "100%", zIndex: 1 }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://map.longdo.com/" target="_blank" rel="noopener noreferrer">Longdo Map</a>'
          url="https://ms.longdo.com/mapproxy/1.0.0/tile/map_th/none/{z}/{x}/{y}.png"
          maxNativeZoom={19}
        />
        
        <MapUpdater center={center} zoom={zoom} />
        <MapEvents onMapClick={handleMapClick} interactive={props.interactive} />

        {props.radiusKm && props.center && (
          <Circle
            center={[props.center.lat, props.center.lng]}
            radius={props.radiusKm * 1000}
            pathOptions={{
              fillColor: "hsl(var(--primary))",
              fillOpacity: 0.1,
              color: "hsl(var(--primary))",
              opacity: 0.4,
              weight: 2,
            }}
          />
        )}

        {props.reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.location.lat, report.location.lng]}
            icon={createMarkerIcon(report.type, report.animalType)}
            eventHandlers={{
              click: () => setSelectedReport(report),
            }}
          >
            <Popup minWidth={220} className="custom-popup">
              <div className="p-1 min-w-[220px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className={report.type === "emergency" ? "text-destructive" : "text-primary"}>
                    {report.type === "emergency" ? <AlertTriangle className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                  </span>
                  <h3 className="font-bold text-sm m-0 leading-tight">{report.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2 m-0">
                  {report.description}
                </p>
                {report.imageUrl && (
                  <img
                    src={report.imageUrl}
                    alt={report.title}
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                )}
                <div className="flex items-center justify-between mt-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      report.type === "emergency"
                        ? "bg-destructive/20 text-destructive"
                        : "bg-primary/20 text-primary"
                    }`}
                  >
                    {report.type === "emergency" ? "ฉุกเฉิน" : "หาบ้าน"}
                  </span>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${report.location.lat},${report.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-600 underline font-medium"
                  >
                    นำทาง →
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {props.selectedLocation && (
          <Marker
            position={[props.selectedLocation.lat, props.selectedLocation.lng]}
            icon={selectedIcon}
          >
            <Popup className="custom-popup min-w-0" closeButton={false}>
              <div className="px-3 py-1.5 text-center text-xs font-semibold text-primary flex items-center justify-center gap-1.5 whitespace-nowrap">
                <MapPin className="w-3.5 h-3.5" /> ตำแหน่งของคุณ
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
