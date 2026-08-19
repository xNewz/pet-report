"use client";

import { useState, useEffect, useCallback } from "react";
import { database } from "@/lib/firebase";
import {
  ref,
  onValue,
  push,
  set,
  update,
  serverTimestamp,
} from "firebase/database";
import {
  Report,
  ReportFormData,
  ReportStatus,
  ReportFilter,
  SortOption,
  Stats,
  Location,
} from "@/lib/types";
import { calculateDistance } from "@/utils/geo";

/**
 * Hook: Listen to all reports in real-time from Firebase.
 */
export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reportsRef = ref(database, "reports");

    const unsubscribe = onValue(
      reportsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const reportsList: Report[] = Object.keys(data).map((key) => ({
            ...data[key],
            id: key,
          }));
          // Sort by newest first
          reportsList.sort((a, b) => b.createdAt - a.createdAt);
          setReports(reportsList);
        } else {
          setReports([]);
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { reports, loading, error };
}

/**
 * Filter reports by type, category, status, etc.
 */
export function useFilteredReports(
  reports: Report[],
  filter: ReportFilter,
  sortBy: SortOption,
  userLocation: Location | null
) {
  const filtered = reports.filter((report) => {
    if (filter.type && report.type !== filter.type) return false;
    if (filter.category && report.category !== filter.category) return false;
    if (filter.status && report.status !== filter.status) return false;
    if (filter.animalType && report.animalType !== filter.animalType)
      return false;
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return b.createdAt - a.createdAt;
      case "nearest":
        if (!userLocation) return 0;
        const distA = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          a.location.lat,
          a.location.lng
        );
        const distB = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          b.location.lat,
          b.location.lng
        );
        return distA - distB;
      case "urgent":
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      default:
        return 0;
    }
  });

  return sorted;
}

/**
 * Compute stats from reports.
 */
export function useStats(reports: Report[]): Stats {
  return {
    total: reports.length,
    active: reports.filter((r) => r.status === "active").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    adopted: reports.filter((r) => r.status === "adopted").length,
  };
}

/**
 * Create a new report in Firebase.
 */
export async function createReport(data: ReportFormData): Promise<string> {
  const reportsRef = ref(database, "reports");
  const newRef = push(reportsRef);
  const now = Date.now();

  const report: Omit<Report, "id"> = {
    type: data.type,
    category: data.category,
    animalType: data.animalType,
    title: data.title,
    description: data.description,
    imageUrl: data.imageBase64 || "",
    location: data.location || { lat: 13.7563, lng: 100.5018 },
    address: data.address,
    status: data.type === "adoption" ? "active" : "active",
    severity: data.severity,
    reporterName: data.reporterName,
    contactInfo: data.contactInfo,
    createdAt: now,
    updatedAt: now,
  };

  await set(newRef, report);
  return newRef.key!;
}

/**
 * Update report status.
 */
export async function updateReportStatus(
  reportId: string,
  status: ReportStatus
): Promise<void> {
  const reportRef = ref(database, `reports/${reportId}`);
  await update(reportRef, {
    status,
    updatedAt: Date.now(),
  });
}
