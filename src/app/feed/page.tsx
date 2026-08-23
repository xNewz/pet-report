"use client";

import { useReports } from "@/hooks/useReports";
import { useGeolocation } from "@/hooks/useGeolocation";
import ReportList from "@/components/reports/ReportList";
import { Button } from "@/components/ui/button";
import { PlusCircle, PawPrint } from "lucide-react";
import Link from "next/link";

export default function FeedPage() {
  const { reports, loading } = useReports();
  const { effectiveLocation } = useGeolocation();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Header section with title and quick create button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6 animate-slide-up">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <PawPrint className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              ฟีดรายการทั้งหมด
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            ค้นหา ตรวจสอบเหตุฉุกเฉิน และช่วยเหลือสัตว์จรจัดจากชุมชนรอบตัวคุณ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/report">
            <Button className="gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 font-semibold rounded-xl">
              <PlusCircle className="w-4 h-4" /> แจ้งเหตุ / หาบ้านใหม่
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-72 rounded-2xl bg-muted/20 animate-pulse border border-border"
            />
          ))}
        </div>
      ) : (
        <ReportList reports={reports} userLocation={effectiveLocation} />
      )}
    </div>
  );
}
