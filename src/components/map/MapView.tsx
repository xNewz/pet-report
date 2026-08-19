"use client";

import dynamic from "next/dynamic";
import { Report, Location } from "@/lib/types";

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

// Dynamically import the MapComponent to prevent SSR issues with Leaflet
const DynamicMap = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-muted/20 rounded-2xl border">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">กำลังโหลดแผนที่...</p>
      </div>
    </div>
  ),
});

export default function MapView(props: MapViewProps) {
  return <DynamicMap {...props} />;
}
