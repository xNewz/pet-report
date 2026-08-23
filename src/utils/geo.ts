import { Location } from "@/lib/types";

/**
 * Calculate the distance between two coordinates using the Haversine formula.
 * Returns distance in kilometers.
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Filter reports by radius from a center point.
 */
export function filterByRadius<T extends { location: Location }>(
  items: T[],
  center: Location,
  radiusKm: number
): T[] {
  return items.filter((item) => {
    const dist = calculateDistance(
      center.lat,
      center.lng,
      item.location.lat,
      item.location.lng
    );
    return dist <= radiusKm;
  });
}

/**
 * Format distance for display.
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} ม.`;
  }
  return `${km.toFixed(1)} กม.`;
}

/**
 * Get distance from a point to another.
 */
export function getDistanceFromLocation(
  from: Location,
  to: Location
): number {
  return calculateDistance(from.lat, from.lng, to.lat, to.lng);
}

/**
 * Default center location (Bangkok, Thailand).
 */
export const DEFAULT_CENTER: Location = {
  lat: 13.7563,
  lng: 100.5018,
};

export const DEFAULT_ZOOM = 13;

/**
 * Bounding box coordinates for Thailand.
 * Lat: 5.61 to 20.47
 * Lng: 97.34 to 105.64
 */
export const THAILAND_BOUNDS_COORDS = {
  minLat: 5.61,
  maxLat: 20.47,
  minLng: 97.34,
  maxLng: 105.64,
};

/**
 * Check if a given location is within Thailand boundaries.
 */
export function isWithinThailand(location: Location | null | undefined): boolean {
  if (!location) return false;
  const { lat, lng } = location;
  return (
    lat >= THAILAND_BOUNDS_COORDS.minLat &&
    lat <= THAILAND_BOUNDS_COORDS.maxLat &&
    lng >= THAILAND_BOUNDS_COORDS.minLng &&
    lng <= THAILAND_BOUNDS_COORDS.maxLng
  );
}

export interface LocationSearchResult {
  display_name: string;
  lat: number;
  lng: number;
}

/**
 * Reverse geocode coordinates to a Thai address using Longdo Map Address Service (with OSM fallback).
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_LONGDO_MAP_KEY || "ms.longdo.com";

  try {
    const res = await fetch(
      `https://api.longdo.com/map/services/address?lon=${lng}&lat=${lat}&key=${apiKey}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data && (data.subdistrict || data.district || data.province)) {
        const parts = [
          data.aoi || data.waterway,
          data.road ? (data.road.startsWith("ถนน") || data.road.startsWith("ซอย") ? data.road : `ถนน${data.road}`) : "",
          data.subdistrict ? (data.subdistrict.startsWith("แขวง") || data.subdistrict.startsWith("ตำบล") ? data.subdistrict : `แขวง${data.subdistrict}`) : "",
          data.district ? (data.district.startsWith("เขต") || data.district.startsWith("อำเภอ") ? data.district : `เขต${data.district}`) : "",
          data.province,
        ].filter(Boolean);
        if (parts.length > 0) {
          return parts.join(", ");
        }
      }
    }
  } catch (err) {
    console.warn("Longdo reverse geocode failed, falling back:", err);
  }

  // Fallback to OSM Nominatim
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=th`,
      {
        headers: {
          "User-Agent": "PetReportApp/1.0",
        },
      }
    );
    if (!res.ok) return "";
    const data = await res.json();
    if (data && data.display_name) {
      const addr = data.address;
      if (addr) {
        const houseOrBuilding = addr.house_number
          ? `${addr.house_number} `
          : "";
        const placeName =
          addr.building ||
          addr.amenity ||
          addr.shop ||
          addr.tourism ||
          addr.office ||
          "";
        const road = addr.road || addr.pedestrian || addr.footway || "";
        const subdistrict =
          addr.subdistrict || addr.suburb || addr.neighbourhood || "";
        const district =
          addr.city_district || addr.district || addr.county || "";
        const province = addr.city || addr.province || addr.state || "";

        const parts = [
          placeName ? `${houseOrBuilding}${placeName}`.trim() : houseOrBuilding.trim(),
          road,
          subdistrict,
          district,
          province,
        ].filter(Boolean);

        if (parts.length > 0) {
          return parts.join(", ");
        }
      }
      return data.display_name;
    }
  } catch (err) {
    console.warn("Reverse geocode failed:", err);
  }
  return "";
}

/**
 * Search locations by query string using Longdo Map Search Service (with OSM fallback).
 */
export async function searchLocations(query: string): Promise<LocationSearchResult[]> {
  if (!query || query.trim().length < 2) return [];
  const apiKey = process.env.NEXT_PUBLIC_LONGDO_MAP_KEY || "ms.longdo.com";

  try {
    const res = await fetch(
      `https://api.longdo.com/map/services/search?keyword=${encodeURIComponent(
        query
      )}&limit=5&key=${apiKey}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.data && Array.isArray(data.data)) {
        const results = data.data
          .filter((item: any) => item.lat && item.lon)
          .map((item: any) => ({
            display_name: [item.name, item.address].filter(Boolean).join(", "),
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          }));
        if (results.length > 0) return results;
      }
    }
  } catch (err) {
    console.warn("Longdo search failed, falling back:", err);
  }

  // Fallback to OSM Nominatim
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&countrycodes=th&limit=5&accept-language=th`,
      {
        headers: {
          "User-Agent": "PetReportApp/1.0",
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: any) => ({
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));
  } catch (err) {
    console.warn("Search failed:", err);
    return [];
  }
}

