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
 * Reverse geocode coordinates to a readable address string using Nominatim.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
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
 * Search locations by query string using Nominatim.
 */
export async function searchLocations(query: string): Promise<LocationSearchResult[]> {
  if (!query || query.trim().length < 2) return [];
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
    console.warn("Location search failed:", err);
    return [];
  }
}

