"use client";

import { useState, useMemo } from "react";
import { useReports, useStats } from "@/hooks/useReports";
import { useGeolocation } from "@/hooks/useGeolocation";
import MapView from "@/components/map/MapView";
import RadiusSearch from "@/components/map/RadiusSearch";
import StatsBar from "@/components/ui/StatsBar";
import ReportDetail from "@/components/reports/ReportDetail";
import { Report } from "@/lib/types";
import { filterByRadius } from "@/utils/geo";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import ReportList from "@/components/reports/ReportList";
import { AlertTriangle, Home, List, Search, PawPrint } from "lucide-react";

export default function HomePage() {
  const { reports, loading } = useReports();
  const { effectiveLocation, loading: geoLoading, requestLocation } = useGeolocation();
  const [radiusKm, setRadiusKm] = useState(3);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const filteredReports = useMemo(
    () => filterByRadius(reports, effectiveLocation, radiusKm),
    [reports, effectiveLocation, radiusKm]
  );

  const stats = useStats(reports);

  return (
    <div className="space-y-10 pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden bg-background border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-12 sm:pt-20 sm:pb-16">
          <div className="text-center space-y-6 animate-slide-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
              Community <span className="text-primary">Stray Pet Watch</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              แพลตฟอร์มแจ้งจุดสัตว์จรจัดป่วย/ดุร้าย และหาบ้าน
              <br className="hidden sm:block" />
              เพื่อชุมชนที่ปลอดภัยสำหรับทุกชีวิต
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/report">
                <Button
                  size="lg"
                  variant="destructive"
                  className="gap-2 shadow-sm transition-all duration-300 hover:scale-105 text-base px-8"
                >
                  <AlertTriangle className="h-5 w-5" /> แจ้งเหตุฉุกเฉิน
                </Button>
              </Link>
              <Link href="/report">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 transition-all duration-300 hover:scale-105 text-base px-8"
                >
                  <Home className="h-5 w-5 text-primary" /> แจ้งหาบ้าน
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <StatsBar stats={stats} />
      </section>

      {/* Map + Radius Search */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Sidebar */}
          <div className="lg:w-72 space-y-4 shrink-0">
            <RadiusSearch
              radiusKm={radiusKm}
              onRadiusChange={setRadiusKm}
              onUseCurrentLocation={requestLocation}
              resultCount={filteredReports.length}
              loading={geoLoading}
            />
            {/* Quick list of nearby */}
            <Card className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <List className="h-4 w-4" />
                  รายการล่าสุดใกล้เคียง
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-14 rounded-xl bg-white/5 animate-shimmer"
                    />
                  ))}
                </div>
              ) : filteredReports.length > 0 ? (
                <ScrollArea className="h-[320px] w-full pr-3">
                  <div className="space-y-2">
                    {filteredReports.slice(0, 8).map((report) => (
                      <button
                        key={report.id}
                        onClick={() => setSelectedReport(report)}
                        className="w-full text-left p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-all duration-200 group border border-transparent hover:border-border"
                      >
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5">
                            {report.type === "emergency" ? (
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            ) : (
                              <Home className="h-4 w-4 text-primary" />
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium line-clamp-1 group-hover:text-primary transition-colors">
                              {report.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground line-clamp-1">
                              {report.address || `${report.location.lat.toFixed(3)}, ${report.location.lng.toFixed(3)}`}
                            </p>
                          </div>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${
                              report.type === "emergency"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-green-500/20 text-green-400"
                            }`}
                          >
                            {report.type === "emergency" ? "ฉุกเฉิน" : "หาบ้าน"}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-6 text-muted-foreground flex flex-col items-center">
                  <Search className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-xs">ไม่พบรายการในรัศมีนี้</p>
                </div>
              )}

              {filteredReports.length > 0 && (
                <Link href="/feed">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs hover:bg-muted text-muted-foreground"
                  >
                    ดูฟีดทั้งหมด →
                  </Button>
                </Link>
              )}
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <div className="flex-1">
            <MapView
              reports={filteredReports}
              center={effectiveLocation}
              radiusKm={radiusKm}
              selectedLocation={effectiveLocation}
              className="h-[500px] lg:h-[600px]"
            />
          </div>
        </div>
      </section>

      {/* Main Reports Feed Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-t border-border/50 pt-8">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <PawPrint className="w-6 h-6 text-primary" />
              ฟีดรายการทั้งหมด
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              ค้นหา กรอง และตรวจสอบรายการแจ้งเหตุและประกาศหาบ้านจากชุมชน
            </p>
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
      </section>

      {/* Detail modal */}
      <ReportDetail
        report={selectedReport}
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        userLocation={effectiveLocation}
      />
    </div>
  );
}
