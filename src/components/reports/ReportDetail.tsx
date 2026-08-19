"use client";

import {
  Report,
  CATEGORY_LABELS,
  SEVERITY_LABELS,
  STATUS_LABELS,
  ANIMAL_TYPE_LABELS,
  REPORT_TYPE_LABELS,
  ReportStatus,
} from "@/lib/types";
import { formatDistance, getDistanceFromLocation } from "@/utils/geo";
import { Location } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { updateReportStatus, deleteReport } from "@/hooks/useReports";
import { useState } from "react";
import { AlertTriangle, Home, MapPin, Navigation, CheckCircle2, User, Phone, Trash2 } from "lucide-react";
import { CuteDogIcon, CuteCatIcon, CutePawIcon } from "@/components/ui/AnimalIcons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

interface ReportDetailProps {
  report: Report | null;
  open: boolean;
  onClose: () => void;
  userLocation?: Location | null;
}

export default function ReportDetail({
  report,
  userLocation,
  open,
  onClose,
}: ReportDetailProps) {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);

  if (!report) return null;

  const handleDelete = async () => {
    if (!report || !user || user.uid !== report.reporterId) return;
    
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้? (ลบแล้วไม่สามารถกู้คืนได้)")) {
      setUpdating(true);
      try {
        await deleteReport(report.id);
        onClose();
      } catch (err) {
        console.error("Failed to delete report:", err);
        alert("เกิดข้อผิดพลาดในการลบโพสต์");
      } finally {
        setUpdating(false);
      }
    }
  };

  const isEmergency = report.type === "emergency";
  const distance = userLocation
    ? getDistanceFromLocation(userLocation, report.location)
    : null;

  const handleStatusUpdate = async (status: ReportStatus) => {
    setUpdating(true);
    try {
      await updateReportStatus(report.id, status);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
    setUpdating(false);
  };

  const severityColors: Record<string, string> = {
    low: "border-primary/30 text-primary",
    medium: "border-primary/30 text-primary",
    high: "border-primary/30 text-primary",
    critical: "border-destructive/30 text-destructive animate-pulse",
  };

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${report.location.lat},${report.location.lng}`;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Image */}
        {report.imageUrl && (
          <div className="relative h-56 overflow-hidden">
            <img
              src={report.imageUrl}
              alt={report.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant={isEmergency ? "destructive" : "default"}
                  className="gap-1"
                >
                  {isEmergency ? <AlertTriangle className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                  {isEmergency ? "ฉุกเฉิน" : "หาบ้าน"}
                </Badge>
                {isEmergency && (
                  <Badge variant="outline" className={severityColors[report.severity]}>
                    {SEVERITY_LABELS[report.severity]}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="p-6 space-y-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <span className="text-primary flex items-center justify-center p-2 bg-primary/10 rounded-lg">
                {report.animalType === "dog"
                  ? <CuteDogIcon className="w-6 h-6" />
                  : report.animalType === "cat"
                    ? <CuteCatIcon className="w-6 h-6" />
                    : <CutePawIcon className="w-6 h-6" />}
              </span>
              {report.title}
            </DialogTitle>
          </DialogHeader>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-border">
              {ANIMAL_TYPE_LABELS[report.animalType]}
            </Badge>
            <Badge variant="outline" className="border-border">
              {CATEGORY_LABELS[report.category]}
            </Badge>
            <Badge
              className={
                report.status === "active"
                  ? "bg-secondary text-secondary-foreground"
                  : report.status === "resolved"
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary text-primary-foreground"
              }
            >
              {STATUS_LABELS[report.status]}
            </Badge>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              รายละเอียด
            </h4>
            <p className="text-sm leading-relaxed">{report.description}</p>
          </div>

          <Separator className="bg-border" />

          {/* Location info */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              สถานที่
            </h4>
            {report.address && (
              <p className="text-sm flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                {report.address}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              พิกัด: {report.location.lat.toFixed(4)},{" "}
              {report.location.lng.toFixed(4)}
            </p>
            {distance !== null && (
              <p className="text-xs text-muted-foreground">
                ระยะห่าง: {formatDistance(distance)}
              </p>
            )}
          </div>

          <Separator className="bg-border" />

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              ข้อมูลผู้แจ้ง
            </h4>
            <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-xl border border-border">
              {report.reporterAvatar ? (
                <Avatar className="w-10 h-10 border border-border shrink-0">
                  <AvatarImage src={report.reporterAvatar} />
                  <AvatarFallback><User className="w-5 h-5 text-muted-foreground" /></AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{report.reporterName || "ไม่ระบุชื่อ"}</p>
                {report.contactInfo && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                    <Phone className="w-3 h-3 shrink-0" /> {report.contactInfo}
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              แจ้งเมื่อ:{" "}
              {new Date(report.createdAt).toLocaleString("th-TH")}
            </p>
          </div>

          <Separator className="bg-border" />

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[130px]"
            >
              <Button variant="default" className="w-full gap-2">
                <Navigation className="w-4 h-4" /> นำทาง (Maps)
              </Button>
            </a>

            {user && user.uid === report.reporterId && (
              <>
                {report.status === "active" && (
                  <>
                    {isEmergency ? (
                      <Button
                        variant="outline"
                        className="flex-1 min-w-[130px] gap-2"
                        onClick={() => handleStatusUpdate("resolved")}
                        disabled={updating}
                      >
                        <CheckCircle2 className="w-4 h-4" /> ช่วยเหลือแล้ว
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="flex-1 min-w-[130px] gap-2"
                        onClick={() => handleStatusUpdate("adopted")}
                        disabled={updating}
                      >
                        <Home className="w-4 h-4" /> หาบ้านได้แล้ว
                      </Button>
                    )}
                  </>
                )}
                
                <Button
                  variant="destructive"
                  className="flex-none gap-2"
                  onClick={handleDelete}
                  disabled={updating}
                >
                  <Trash2 className="w-4 h-4" /> ลบ
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
