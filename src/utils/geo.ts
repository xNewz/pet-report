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
