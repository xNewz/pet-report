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
import { updateReportStatus, deleteReport, acknowledgeReport } from "@/hooks/useReports";
import { useState } from "react";
import { AlertTriangle, Home, MapPin, Navigation, CheckCircle2, User, Phone, Trash2, Share2 } from "lucide-react";
import { CuteDogIcon, CuteCatIcon, CutePawIcon } from "@/components/ui/AnimalIcons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  const { user, userProfile } = useAuth();
  const [updating, setUpdating] = useState(false);

  if (!report) return null;

  const handleDelete = () => {
    const isAllowed = user && (user.uid === report.reporterId || userProfile?.role === "admin");
    if (!report || !isAllowed) return;
    
    toast("คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้?", {
      description: "ลบแล้วไม่สามารถกู้คืนได้",
      action: {
        label: "ยืนยันลบ",
        onClick: async () => {
          setUpdating(true);
          try {
            await deleteReport(report.id);
            toast.success("ลบโพสต์สำเร็จ");
            onClose();
          } catch (err) {
            console.error("Failed to delete report:", err);
            toast.error("เกิดข้อผิดพลาดในการลบโพสต์");
          } finally {
            setUpdating(false);
          }
        },
      },
      cancel: {
        label: "ยกเลิก",
        onClick: () => {},
      },
    });
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/report/${report.id}`;
    const shareText = `[Community Stray Pet Watch] ${report.title}\n\nตรวจสอบรายละเอียดและช่วยเหลือได้ที่นี่:\n`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: report.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}${shareUrl}`);
        toast.success("คัดลอกลิงก์เรียบร้อยแล้ว!", {
          description: "คุณสามารถนำไปวางใน LINE หรือ Facebook ได้เลย"
        });
      } catch (err) {
        toast.error("ไม่สามารถคัดลอกลิงก์ได้");
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

  const handleAcknowledge = async () => {
    if (!userProfile) return;
    setUpdating(true);
    try {
      await acknowledgeReport(report.id, userProfile);
      toast.success("รับเรื่องสำเร็จ");
    } catch (err) {
      toast.error("Failed to acknowledge");
    }
    setUpdating(false);
  };

  const canEdit = user && (user.uid === report.reporterId || userProfile?.role === "admin" || userProfile?.role === "official");
  const canDelete = user && (user.uid === report.reporterId || userProfile?.role === "admin");
  const canAcknowledge = userProfile?.role === "admin" || userProfile?.role === "official";

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
                  : report.status === "in_progress"
                    ? "bg-amber-500 text-white"
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

          {/* Acknowledged By Info */}
          {report.acknowledgedBy && (
            <>
              <Separator className="bg-border" />
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-primary uppercase tracking-wider">เจ้าหน้าที่ผู้รับเรื่อง</h4>
                <div className="flex items-center gap-3 bg-primary/5 p-3 rounded-xl border border-primary/20">
                  {report.acknowledgedBy.photoURL ? (
                    <Avatar className="w-10 h-10 border border-primary/20 shrink-0">
                      <AvatarImage src={report.acknowledgedBy.photoURL} />
                      <AvatarFallback><User className="w-5 h-5 text-primary" /></AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-primary">{report.acknowledgedBy.displayName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">รับเรื่องเมื่อ: {new Date(report.acknowledgedBy.timestamp).toLocaleString("th-TH")}</p>
                  </div>
                </div>
              </div>
            </>
          )}

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

            <Button
              variant="secondary"
              className="flex-1 min-w-[100px] gap-2"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" /> แชร์
            </Button>

            {canAcknowledge && report.status === "active" && (
              <Button
                className="flex-1 min-w-[130px] gap-2 bg-yellow-500 hover:bg-yellow-600 text-white shadow-md shadow-yellow-500/20"
                onClick={handleAcknowledge}
                disabled={updating}
              >
                <User className="w-4 h-4" /> รับเรื่องเคสนี้
              </Button>
            )}

            {canEdit && (report.status === "active" || report.status === "in_progress") && (
              <>
                {isEmergency ? (
                  <Button
                    variant="outline"
                    className="flex-1 min-w-[130px] gap-2"
                    onClick={() => handleStatusUpdate("resolved")}
                    disabled={updating}
                  >
                    <CheckCircle2 className="w-4 h-4" /> ช่วยเหลือเสร็จสิ้น
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
            
            {canDelete && (
              <Button
                variant="destructive"
                className="flex-none gap-2"
                onClick={handleDelete}
                disabled={updating}
              >
                <Trash2 className="w-4 h-4" /> ลบ
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
