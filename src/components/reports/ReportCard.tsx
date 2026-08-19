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
}

import { Card, CardContent } from "@/components/ui/card";

export default function ReportCard({
  report,
  userLocation,
  onViewDetail,
  index = 0,
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
          shadow-sm group-hover:shadow-md transition-all duration-300
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
