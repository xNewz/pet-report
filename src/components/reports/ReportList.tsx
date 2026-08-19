"use client";

import { useState } from "react";
import {
  Report,
  ReportFilter,
  SortOption,
  Location,
  SORT_LABELS,
  REPORT_TYPE_LABELS,
  CATEGORY_LABELS,
  STATUS_LABELS,
} from "@/lib/types";
import { useFilteredReports } from "@/hooks/useReports";
import ReportCard from "./ReportCard";
import ReportDetail from "./ReportDetail";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReportListProps {
  reports: Report[];
  userLocation?: Location | null;
}

export default function ReportList({ reports, userLocation }: ReportListProps) {
  const [filter, setFilter] = useState<ReportFilter>({});
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Apply tab filter
  const tabFilter: ReportFilter = {
    ...filter,
    type: activeTab === "all" ? undefined : (activeTab as "emergency" | "adoption"),
  };

  const filteredReports = useFilteredReports(
    reports,
    tabFilter,
    sortBy,
    userLocation || null
  );

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-slide-up">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full sm:w-auto"
        >
          <TabsList className="w-full sm:w-auto grid grid-cols-3">
            <TabsTrigger value="all" className="text-xs">
              ทั้งหมด ({reports.length})
            </TabsTrigger>
            <TabsTrigger value="emergency" className="text-xs">
              🚨 ฉุกเฉิน (
              {reports.filter((r) => r.type === "emergency").length})
            </TabsTrigger>
            <TabsTrigger value="adoption" className="text-xs">
              🏠 หาบ้าน (
              {reports.filter((r) => r.type === "adoption").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 ml-auto">
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as SortOption)}
          >
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="เรียงตาม" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SORT_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filter.status || "all"}
            onValueChange={(v) =>
              setFilter((prev) => ({
                ...prev,
                status: v === "all" ? undefined : (v as any),
              }))
            }
          >
            <SelectTrigger className="w-[150px] h-9 text-xs">
              <SelectValue placeholder="สถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                ทุกสถานะ
              </SelectItem>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filteredReports.map((report, index) => (
            <ReportCard
              key={report.id}
              report={report}
              userLocation={userLocation}
              onViewDetail={setSelectedReport}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 animate-fade-in">
          <span className="text-6xl mb-4 block animate-float">🔍</span>
          <h3 className="text-lg font-semibold mb-2">ไม่พบรายการ</h3>
          <p className="text-sm text-muted-foreground">
            ลองปรับตัวกรองหรือค้นหาในรัศมีที่กว้างขึ้น
          </p>
        </div>
      )}

      {/* Detail modal */}
      <ReportDetail
        report={selectedReport}
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        userLocation={userLocation}
      />
    </div>
  );
}
