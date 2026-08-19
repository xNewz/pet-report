"use client";

import { useReports } from "@/hooks/useReports";
import { useGeolocation } from "@/hooks/useGeolocation";
import ReportList from "@/components/reports/ReportList";

export default function FeedPage() {
  const { reports, loading } = useReports();
  const { effectiveLocation } = useGeolocation();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-8 animate-slide-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">
          📋 ฟีดรายการทั้งหมด
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          รายการแจ้งเหตุและประกาศหาบ้านทั้งหมดจากชุมชน
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-72 rounded-2xl bg-white/5 animate-shimmer"
            />
          ))}
        </div>
      ) : (
        <ReportList reports={reports} userLocation={effectiveLocation} />
      )}
    </div>
  );
}
