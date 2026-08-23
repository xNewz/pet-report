"use client";

import { useState } from "react";
import {
  Report,
  ReportFilter,
  SortOption,
  Location,
  AnimalType,
  SORT_LABELS,
  STATUS_LABELS,
  ANIMAL_TYPE_LABELS,
} from "@/lib/types";
import { useFilteredReports } from "@/hooks/useReports";
import ReportCard from "./ReportCard";
import ReportDetail from "./ReportDetail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  X,
  RotateCcw,
  LayoutGrid,
  List,
  MapPin,
  SlidersHorizontal,
} from "lucide-react";
import { CuteDogIcon, CuteCatIcon, CutePawIcon } from "@/components/ui/AnimalIcons";

interface ReportListProps {
  reports: Report[];
  userLocation?: Location | null;
}

export default function ReportList({ reports, userLocation }: ReportListProps) {
  const [filter, setFilter] = useState<ReportFilter>({});
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const tabFilter: ReportFilter = {
    ...filter,
    type: activeTab === "all" ? undefined : (activeTab as "emergency" | "adoption"),
    searchQuery: searchQuery,
  };

  const filteredReports = useFilteredReports(
    reports,
    tabFilter,
    sortBy,
    userLocation || null
  );

  const hasActiveFilters =
    (!!activeTab && activeTab !== "all") ||
    !!filter.animalType ||
    !!filter.status ||
    !!filter.maxDistanceKm ||
    !!searchQuery.trim();

  const resetFilters = () => {
    setActiveTab("all");
    setFilter({});
    setSearchQuery("");
    setSortBy("newest");
  };

  return (
    <div className="space-y-6">
      {/* Search Bar & View Mode Control Header */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="พิมพ์เพื่อค้นหาชื่อเรื่อง, รายละเอียด, หรือสถานที่..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-9 h-11 text-sm bg-card border-border/80 rounded-xl shadow-sm focus:border-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View mode switcher (Grid vs List) */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-xl shrink-0 self-end sm:self-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`h-9 px-3 text-xs gap-1.5 rounded-lg ${
                viewMode === "grid"
                  ? "bg-card text-primary shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">การ์ด</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={`h-9 px-3 text-xs gap-1.5 rounded-lg ${
                viewMode === "list"
                  ? "bg-card text-primary shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">รายการ</span>
            </Button>
          </div>
        </div>

        {/* Animal Type Quick Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5" /> ชนิดสัตว์:
          </span>
          <button
            type="button"
            onClick={() => setFilter((prev) => ({ ...prev, animalType: undefined }))}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 border ${
              !filter.animalType
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card hover:bg-muted text-muted-foreground border-border"
            }`}
          >
            ทั้งหมด
          </button>
          {[
            { type: "dog", label: "สุนัข", icon: <CuteDogIcon className="w-4 h-4" /> },
            { type: "cat", label: "แมว", icon: <CuteCatIcon className="w-4 h-4" /> },
            { type: "other", label: "อื่นๆ", icon: <CutePawIcon className="w-4 h-4" /> },
          ].map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() =>
                setFilter((prev) => ({
                  ...prev,
                  animalType:
                    prev.animalType === item.type ? undefined : (item.type as AnimalType),
                }))
              }
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 border ${
                filter.animalType === item.type
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card hover:bg-muted text-muted-foreground border-border"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Category Tabs & Secondary Select Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/60 shadow-sm">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full lg:w-auto"
        >
          <TabsList className="w-full lg:w-auto grid grid-cols-3 h-10 p-1 bg-muted/60">
            <TabsTrigger value="all" className="text-xs font-medium">
              ทั้งหมด ({reports.length})
            </TabsTrigger>
            <TabsTrigger value="emergency" className="text-xs font-medium">
              🚨 ฉุกเฉิน ({reports.filter((r) => r.type === "emergency").length})
            </TabsTrigger>
            <TabsTrigger value="adoption" className="text-xs font-medium">
              🏠 หาบ้าน ({reports.filter((r) => r.type === "adoption").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-2">
          {/* Distance Filter (If location is enabled) */}
          <Select
            value={filter.maxDistanceKm ? String(filter.maxDistanceKm) : "all"}
            onValueChange={(v) =>
              setFilter((prev) => ({
                ...prev,
                maxDistanceKm: v === "all" ? undefined : Number(v),
              }))
            }
          >
            <SelectTrigger className="w-[130px] h-9 text-xs bg-background">
              <SelectValue placeholder="รัศมี" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                📍 ทุกระยะทาง
              </SelectItem>
              <SelectItem value="3" className="text-xs">
                📍 ไม่เกิน 3 กม.
              </SelectItem>
              <SelectItem value="5" className="text-xs">
                📍 ไม่เกิน 5 กม.
              </SelectItem>
              <SelectItem value="10" className="text-xs">
                📍 ไม่เกิน 10 กม.
              </SelectItem>
              <SelectItem value="20" className="text-xs">
                📍 ไม่เกิน 20 กม.
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={filter.status || "all"}
            onValueChange={(v) =>
              setFilter((prev) => ({
                ...prev,
                status: v === "all" ? undefined : (v as any),
              }))
            }
          >
            <SelectTrigger className="w-[140px] h-9 text-xs bg-background">
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

          {/* Sort By */}
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as SortOption)}
          >
            <SelectTrigger className="w-[130px] h-9 text-xs bg-background">
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
        </div>
      </div>

      {/* Active Filters Summary & Clear Button */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10 animate-slide-up text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground font-medium">กำลังกรอง:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1 text-[11px]">
                ค้นหา: "{searchQuery}"
                <X
                  className="w-3 h-3 cursor-pointer hover:text-destructive"
                  onClick={() => setSearchQuery("")}
                />
              </Badge>
            )}
            {activeTab !== "all" && (
              <Badge variant="secondary" className="gap-1 text-[11px]">
                ประเภท: {activeTab === "emergency" ? "ฉุกเฉิน" : "หาบ้าน"}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-destructive"
                  onClick={() => setActiveTab("all")}
                />
              </Badge>
            )}
            {filter.animalType && (
              <Badge variant="secondary" className="gap-1 text-[11px]">
                ชนิด: {ANIMAL_TYPE_LABELS[filter.animalType]}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-destructive"
                  onClick={() =>
                    setFilter((p) => ({ ...p, animalType: undefined }))
                  }
                />
              </Badge>
            )}
            {filter.status && (
              <Badge variant="secondary" className="gap-1 text-[11px]">
                สถานะ: {STATUS_LABELS[filter.status]}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-destructive"
                  onClick={() => setFilter((p) => ({ ...p, status: undefined }))}
                />
              </Badge>
            )}
            {filter.maxDistanceKm && (
              <Badge variant="secondary" className="gap-1 text-[11px]">
                รัศมี: &lt; {filter.maxDistanceKm} กม.
                <X
                  className="w-3 h-3 cursor-pointer hover:text-destructive"
                  onClick={() =>
                    setFilter((p) => ({ ...p, maxDistanceKm: undefined }))
                  }
                />
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-xs text-muted-foreground hover:text-destructive gap-1 h-7 px-2"
          >
            <RotateCcw className="w-3 h-3" /> ล้างตัวกรองทั้งหมด
          </Button>
        </div>
      )}

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          พบทั้งหมด{" "}
          <strong className="text-primary font-bold text-sm">
            {filteredReports.length}
          </strong>{" "}
          รายการ
        </span>
        {userLocation && (
          <span className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400">
            <MapPin className="w-3 h-3" /> แสดงระยะทางจากตำแหน่งของคุณ
          </span>
        )}
      </div>

      {/* Results Rendering (Grid or List View) */}
      {filteredReports.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children"
              : "space-y-3 stagger-children"
          }
        >
          {filteredReports.map((report, index) => (
            <ReportCard
              key={report.id}
              report={report}
              userLocation={userLocation}
              onViewDetail={setSelectedReport}
              index={index}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card border rounded-2xl p-8 space-y-4 animate-fade-in">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto text-3xl">
            🔍
          </div>
          <div>
            <h3 className="text-base font-bold mb-1">ไม่พบรายการที่ตรงกับตัวกรอง</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              ลองพิมพ์ค้นหาด้วยคำอื่น หรือปรับแต่งตัวกรองเพื่อดูรายการทั้งหมด
            </p>
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={resetFilters}
              className="gap-2 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" /> ล้างตัวกรองเพื่อดูรายการทั้งหมด
            </Button>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <ReportDetail
        report={selectedReport}
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        userLocation={userLocation}
      />
    </div>
  );
}
