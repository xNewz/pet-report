"use client";

import { Report, CATEGORY_LABELS, SEVERITY_LABELS, STATUS_LABELS, ANIMAL_TYPE_LABELS } from "@/lib/types";
import { formatDistance, getDistanceFromLocation } from "@/utils/geo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Location } from "@/lib/types";
import { AlertTriangle, Home, Clock, MapPin } from "lucide-react";
import { CuteDogIcon, CuteCatIcon, CutePawIcon } from "@/components/ui/AnimalIcons";

interface ReportCardProps {
  report: Report;
  userLocation?: Location | null;
  onViewDetail: (report: Report) => void;
  index?: number;
  viewMode?: "grid" | "list";
}

import { Card, CardContent } from "@/components/ui/card";

export default function ReportCard({
  report,
  userLocation,
  onViewDetail,
  index = 0,
  viewMode = "grid",
}: ReportCardProps) {
  const isEmergency = report.type === "emergency";
  const distance = userLocation
    ? getDistanceFromLocation(userLocation, report.location)
    : null;

  const timeAgo = getTimeAgo(report.createdAt);

  const severityColors: Record<string, string> = {
    low: "text-primary border-primary/30",
    medium: "text-primary border-primary/30",
    high: "text-primary border-primary/30",
    critical: "text-destructive border-destructive/30 animate-pulse",
  };

  const statusColors: Record<string, string> = {
    active: "bg-secondary text-secondary-foreground",
    resolved: "bg-primary text-primary-foreground",
    adopted: "bg-primary text-primary-foreground",
  };

  if (viewMode === "list") {
    return (
      <div
        className="group cursor-pointer transition-all duration-300 hover:translate-x-1 animate-slide-up"
        style={{ animationDelay: `${index * 0.03}s` }}
        onClick={() => onViewDetail(report)}
      >
        <Card className="overflow-hidden rounded-xl border border-border/60 hover:border-primary/50 shadow-sm hover:shadow-md transition-all p-3 bg-card">
          <div className="flex items-center gap-3">
            {/* Image / Icon thumbnail */}
            <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-muted/30">
              {report.imageUrl ? (
                <img
                  src={report.imageUrl}
                  alt={report.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {report.animalType === "dog" ? (
                    <CuteDogIcon className="w-8 h-8 opacity-60" />
                  ) : report.animalType === "cat" ? (
                    <CuteCatIcon className="w-8 h-8 opacity-60" />
                  ) : (
                    <CutePawIcon className="w-8 h-8 opacity-60" />
                  )}
                </div>
              )}
              <div className="absolute top-1 left-1">
                <Badge
                  variant={isEmergency ? "destructive" : "default"}
                  className="text-[9px] px-1.5 py-0"
                >
                  {isEmergency ? "ฉุกเฉิน" : "หาบ้าน"}
                </Badge>
              </div>
            </div>

            {/* Middle Info */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                  {report.title}
                </h3>
                <Badge className={`text-[10px] shrink-0 ${statusColors[report.status]}`}>
                  {STATUS_LABELS[report.status]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {report.description}
              </p>
              <div className="flex items-center gap-2 pt-0.5 text-[11px] text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1 font-medium text-foreground">
                  {ANIMAL_TYPE_LABELS[report.animalType]}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {timeAgo}
                </span>
                {distance !== null && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-primary">
                      <MapPin className="w-3 h-3" /> {formatDistance(distance)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Action button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs shrink-0 hidden sm:flex hover:bg-primary/10 hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail(report);
              }}
            >
              รายละเอียด →
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={`
        group relative cursor-pointer
        transition-all duration-500 hover:translate-y-[-4px]
        animate-slide-up
      `}
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => onViewDetail(report)}
    >
      <Card
        className={`
          overflow-hidden h-full rounded-2xl bg-card border-border/60
          shadow-sm group-hover:shadow-md transition-all duration-300 p-0
        `}
      >
        {/* Image */}
        {report.imageUrl ? (
          <div className="relative h-44 overflow-hidden">
            <img
              src={report.imageUrl}
              alt={report.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            
            {/* Severity badge overlay */}
            {isEmergency && (
              <div className="absolute top-3 right-3">
                <Badge
                  variant="outline"
                  className={`text-[10px] ${severityColors[report.severity]} ${
                    report.severity === "critical" ? "animate-pulse-glow" : ""
                  }`}
                >
                  {SEVERITY_LABELS[report.severity]}
                </Badge>
              </div>
            )}

            {/* Type badge */}
            <div className="absolute top-3 left-3">
              <Badge
                variant={isEmergency ? "destructive" : "default"}
                className="text-[10px] gap-1"
              >
                {isEmergency ? <AlertTriangle className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                {isEmergency ? "ฉุกเฉิน" : "หาบ้าน"}
              </Badge>
            </div>
          </div>
        ) : (
            <div
            className={`h-36 flex items-center justify-center bg-muted/30`}
          >
            {report.animalType === "dog" ? (
              <CuteDogIcon className="w-12 h-12 opacity-50" />
            ) : report.animalType === "cat" ? (
              <CuteCatIcon className="w-12 h-12 opacity-50" />
            ) : (
              <CutePawIcon className="w-12 h-12 opacity-50" />
            )}
          </div>
        )}

        {/* Content */}
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-all duration-300">
              {report.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {report.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[10px] border-border">
              {ANIMAL_TYPE_LABELS[report.animalType]}
            </Badge>
            <Badge variant="outline" className="text-[10px] border-border">
              {CATEGORY_LABELS[report.category]}
            </Badge>
            <Badge className={`text-[10px] ${statusColors[report.status]}`}>
              {STATUS_LABELS[report.status]}
            </Badge>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {timeAgo}
              </span>
              {distance !== null && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {formatDistance(distance)}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2 hover:bg-white/5 hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail(report);
              }}
            >
              ดูเพิ่ม →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "เมื่อสักครู่";
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  if (hours < 24) return `${hours} ชม.ที่แล้ว`;
  if (days < 7) return `${days} วันที่แล้ว`;
  return new Date(timestamp).toLocaleDateString("th-TH");
}
