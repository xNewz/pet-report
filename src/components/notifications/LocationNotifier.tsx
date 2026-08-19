"use client";

import { useEffect, useRef } from "react";
import { useReports } from "@/hooks/useReports";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getDistanceFromLocation } from "@/utils/geo";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function LocationNotifier() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { reports } = useReports();
  const knownReportIds = useRef<Set<string>>(new Set());
  const initialized = useRef(false);

  useEffect(() => {
    // We only care if the user has set a home location
    if (!profile?.homeLocation || !reports.length) return;

    if (!initialized.current) {
      // First load, just record all existing IDs so we don't spam notifications
      reports.forEach(r => knownReportIds.current.add(r.id));
      initialized.current = true;
      return;
    }

    // Check for new reports
    reports.forEach((report) => {
      if (!knownReportIds.current.has(report.id)) {
        knownReportIds.current.add(report.id);
        
        // Don't notify for own reports
        if (user && report.reporterId === user.uid) return;
        
        // Only notify for active reports
        if (report.status !== "active") return;

        // Calculate distance
        const distance = getDistanceFromLocation(profile.homeLocation!, report.location);
        
        if (distance <= profile.notificationRadius) {
          // It's within radius!
          toast("พบเหตุใหม่ใกล้บ้านคุณ!", {
            description: `${report.title} (ห่างไป ${distance.toFixed(1)} กม.)`,
            icon: <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />,
            duration: 10000,
            action: {
              label: "ตรวจสอบ",
              onClick: () => {
                window.location.href = "/";
              }
            }
          });
        }
      }
    });

  }, [reports, profile, user]);

  return null;
}
