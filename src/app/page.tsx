"use client";

import { useState, useMemo } from "react";
import { useReports, useStats } from "@/hooks/useReports";
import { useGeolocation } from "@/hooks/useGeolocation";
import MapView from "@/components/map/MapView";
import RadiusSearch from "@/components/map/RadiusSearch";
import StatsBar from "@/components/ui/StatsBar";
import ReportDetail from "@/components/reports/ReportDetail";
import ReportList from "@/components/reports/ReportList";
import { Report } from "@/lib/types";
import { filterByRadius } from "@/utils/geo";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import {
  AlertTriangle,
  Home,
  List,
  Search,
  PawPrint,
  Map,
  Compass,
  ArrowDown,
  Navigation,
} from "lucide-react";
import { CuteDogIcon, CuteCatIcon, CutePawIcon } from "@/components/ui/AnimalIcons";

export default function HomePage() {
  const { reports, loading } = useReports();
  const { effectiveLocation, loading: geoLoading, requestLocation } = useGeolocation();
  const [radiusKm, setRadiusKm] = useState(3);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [mobileTab, setMobileTab] = useState<"map" | "list">("map");

  const filteredReports = useMemo(
    () => filterByRadius(reports, effectiveLocation, radiusKm),
    [reports, effectiveLocation, radiusKm]
  );

  const stats = useStats(reports);

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-background border-b border-border/40 py-12 sm:py-16 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background pointer-events-none" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center space-y-6 max-w-3xl mx-auto animate-slide-up">
            {/* Online status badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              ศูนย์แจ้งเหตุสัตว์จรจัด & หาบ้านเพื่อชุมชน 24 ชม.
            </div>

            {/* Main title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.15]">
              ช่วยชีวิตสัตว์จรจัด <span className="text-primary">ในชุมชนของคุณ</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              แพลตฟอร์มแจ้งจุดสุนัข/แมวจรจัดบาดเจ็บ ป่วย ดุร้าย และเปิดรับอุปการะหาบ้านใหม่
              เพื่อสร้างสังคมที่ปลอดภัยและน่าอยู่สำหรับทุกชีวิต
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/report" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="destructive"
                  className="w-full sm:w-auto gap-2 shadow-lg shadow-destructive/25 hover:scale-105 transition-all text-sm sm:text-base font-bold rounded-2xl px-8 h-12"
                >
                  <AlertTriangle className="h-5 w-5" /> แจ้งเหตุฉุกเฉินด่วน
                </Button>
              </Link>
              <Link href="/report" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:scale-105 transition-all text-sm sm:text-base font-bold rounded-2xl px-8 h-12"
                >
                  <Home className="h-5 w-5" /> ประกาศหาบ้านให้สัตว์
                </Button>
              </Link>
            </div>

            {/* Quick feature icons list */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground pt-4">
              <span className="flex items-center gap-1.5 bg-card border px-3 py-1.5 rounded-full shadow-xs">
                <CuteDogIcon className="w-4 h-4 text-primary" /> แจ้งเหตุบาดเจ็บ/ป่วย
              </span>
              <span className="flex items-center gap-1.5 bg-card border px-3 py-1.5 rounded-full shadow-xs">
                <CuteCatIcon className="w-4 h-4 text-primary" /> ประกาศรับอุปการะ
              </span>
              <span className="flex items-center gap-1.5 bg-card border px-3 py-1.5 rounded-full shadow-xs">
                <CutePawIcon className="w-4 h-4 text-primary" /> แจ้งเตือนตามพิกัด GPS
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Stats */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <StatsBar stats={stats} />
      </section>

      {/* Interactive Map & Proximity Search Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Compass className="w-6 h-6 text-primary" />
              แผนที่สัตว์จรจัดรอบตัวคุณ
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              ค้นหาและตรวจสอบจุดที่มีสัตว์จรจัดบาดเจ็บหรือรอรับการช่วยเหลือในรัศมีใกล้เคียง
            </p>
          </div>

          {/* Mobile View Switcher (Map vs Nearby List) */}
          <div className="flex lg:hidden items-center gap-1 bg-muted p-1 rounded-xl self-start sm:self-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileTab("map")}
              className={`h-8 px-3 text-xs gap-1.5 rounded-lg ${
                mobileTab === "map"
                  ? "bg-card text-primary shadow-xs font-bold"
                  : "text-muted-foreground"
              }`}
            >
              <Map className="w-3.5 h-3.5" /> แผนที่ ({filteredReports.length})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileTab("list")}
              className={`h-8 px-3 text-xs gap-1.5 rounded-lg ${
                mobileTab === "list"
                  ? "bg-card text-primary shadow-xs font-bold"
                  : "text-muted-foreground"
              }`}
            >
              <List className="w-3.5 h-3.5" /> รายการใกล้เคียง
            </Button>
          </div>
        </div>

        {/* Main Map + Sidebar Content Grid */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Desktop Left Sidebar / Mobile List View */}
          <div
            className={`lg:w-80 space-y-4 shrink-0 ${
              mobileTab === "map" ? "hidden lg:block" : "block"
            }`}
          >
            <RadiusSearch
              radiusKm={radiusKm}
              onRadiusChange={setRadiusKm}
              onUseCurrentLocation={requestLocation}
              resultCount={filteredReports.length}
              loading={geoLoading}
            />

            {/* Quick list of nearby reports */}
            <Card className="animate-slide-up border-border/80 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 bg-muted/30">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <List className="h-4 w-4 text-primary" />
                    รายการล่าสุดในรัศมี
                  </span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {radiusKm} กม.
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-3">
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-16 rounded-xl bg-muted/20 animate-pulse"
                      />
                    ))}
                  </div>
                ) : filteredReports.length > 0 ? (
                  <ScrollArea className="h-[340px] w-full pr-2">
                    <div className="space-y-2">
                      {filteredReports.slice(0, 10).map((report) => (
                        <button
                          key={report.id}
                          onClick={() => setSelectedReport(report)}
                          className="w-full text-left p-3 rounded-xl bg-card hover:bg-primary/5 transition-all duration-200 group border border-border/60 hover:border-primary/30 shadow-2xs"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="mt-0.5 shrink-0">
                              {report.type === "emergency" ? (
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              ) : (
                                <Home className="h-4 w-4 text-primary" />
                              )}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold line-clamp-1 group-hover:text-primary transition-colors">
                                {report.title}
                              </p>
                              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                {report.address ||
                                  `${report.location.lat.toFixed(3)}, ${report.location.lng.toFixed(
                                    3
                                  )}`}
                              </p>
                            </div>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                                report.type === "emergency"
                                  ? "bg-destructive/15 text-destructive"
                                  : "bg-primary/15 text-primary"
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
                  <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                    <Search className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-xs font-medium">ไม่พบรายการในรัศมี {radiusKm} กม.</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-1">
                      ลองขยายระยะทางในแถบปรับรัศมีด้านบน
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Map Display Column */}
          <div
            className={`flex-1 min-w-0 ${
              mobileTab === "list" ? "hidden lg:block" : "block"
            }`}
          >
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-md">
              {/* Map header info overlay */}
              <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none gap-2">
                <div className="bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-foreground border shadow-sm flex items-center gap-1.5 pointer-events-auto">
                  <Map className="w-3.5 h-3.5 text-primary" />
                  พบ {filteredReports.length} รายการในแผนที่
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={requestLocation}
                  disabled={geoLoading}
                  className="pointer-events-auto bg-background/90 backdrop-blur-md text-xs font-semibold h-8 rounded-full border shadow-sm gap-1 hover:bg-background"
                >
                  <Navigation className="w-3.5 h-3.5 text-primary" />
                  <span className="hidden sm:inline">รีเซ็ตไปยังพิกัดฉัน</span>
                </Button>
              </div>

              <MapView
                reports={filteredReports}
                center={effectiveLocation}
                radiusKm={radiusKm}
                selectedLocation={effectiveLocation}
                className="h-[480px] sm:h-[550px] lg:h-[620px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main All Reports Feed Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        <div className="border-t border-border/60 pt-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <PawPrint className="w-6 h-6 text-primary" />
                ฟีดรายการทั้งหมดจากชุมชน
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                ค้นหา กรองคำ ค้นหาตามชนิดสัตว์ หรือปรับสลับมุมมองการ์ดและรายการได้ตามต้องการ
              </p>
            </div>
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
