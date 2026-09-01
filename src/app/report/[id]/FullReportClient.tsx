"use client";

import { useEffect, useState } from "react";
import { Report, CATEGORY_LABELS, SEVERITY_LABELS, STATUS_LABELS, ANIMAL_TYPE_LABELS, REPORT_TYPE_LABELS, ReportStatus } from "@/lib/types";
import { formatDistance } from "@/utils/geo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Home, MapPin, Navigation, CheckCircle2, User, Phone, Trash2, Share2, ArrowLeft, Edit } from "lucide-react";
import { CuteDogIcon, CuteCatIcon, CutePawIcon } from "@/components/ui/AnimalIcons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { updateReportStatus, deleteReport, acknowledgeReport } from "@/hooks/useReports";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FullReportClient({
  reportId,
  initialReport,
}: {
  reportId: string;
  initialReport: Report | null;
}) {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(initialReport);
  const [updating, setUpdating] = useState(false);

  const canEdit = user && (user.uid === report?.reporterId || userProfile?.role === "admin" || userProfile?.role === "official");
  const canDelete = user && (user.uid === report?.reporterId || userProfile?.role === "admin");
  const canAcknowledge = userProfile?.role === "admin" || userProfile?.role === "official";

  useEffect(() => {
    const reportRef = doc(db, "reports", reportId);
    const unsubscribe = onSnapshot(reportRef, (docSnap) => {
      if (docSnap.exists()) {
        setReport({ id: docSnap.id, ...docSnap.data() } as Report);
      } else {
        setReport(null);
      }
    });
    return () => unsubscribe();
  }, [reportId]);

  if (!report) {
    return (
      <Card className="p-12 text-center flex flex-col items-center">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-xl font-bold">ไม่พบโพสต์นี้</h2>
        <p className="text-muted-foreground mt-2 mb-6">โพสต์นี้อาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง</p>
        <Link href="/">
          <Button>กลับหน้าแรก</Button>
        </Link>
      </Card>
    );
  }

  const handleDelete = async () => {
    if (!canDelete) return;
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้? (ลบแล้วไม่สามารถกู้คืนได้)")) {
      setUpdating(true);
      try {
        await deleteReport(report.id);
        toast.success("ลบโพสต์สำเร็จ");
        router.push("/");
      } catch (err) {
        toast.error("เกิดข้อผิดพลาดในการลบโพสต์");
        setUpdating(false);
      }
    }
  };

  const handleStatusUpdate = async (status: ReportStatus) => {
    setUpdating(true);
    try {
      await updateReportStatus(report.id, status);
      toast.success("อัปเดตสถานะสำเร็จ");
    } catch (err) {
      toast.error("Failed to update status");
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
      } catch (err) {}
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
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${report.location.lat},${report.location.lng}`;
  const severityColors: Record<string, string> = {
    low: "border-primary/30 text-primary",
    medium: "border-primary/30 text-primary",
    high: "border-primary/30 text-primary",
    critical: "border-destructive/30 text-destructive animate-pulse",
  };

  return (
    <div className="space-y-4">
      <Link href="/">
        <Button variant="ghost" className="mb-2 gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> กลับหน้าหลัก
        </Button>
      </Link>
      
      <Card className="overflow-hidden p-0 border-border/60 shadow-lg">
        {/* Image */}
        {report.imageUrl && (
          <div className="relative h-64 sm:h-80 overflow-hidden">
            <img src={report.imageUrl} alt={report.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            <div className="absolute top-4 right-4">
              <Badge variant={isEmergency ? "destructive" : "secondary"} className="shadow-lg backdrop-blur-md bg-opacity-90">
                {isEmergency ? <AlertTriangle className="w-3 h-3 mr-1" /> : <Home className="w-3 h-3 mr-1" />}
                {REPORT_TYPE_LABELS[report.type]}
              </Badge>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight drop-shadow-md">{report.title}</h1>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-5 sm:p-8 space-y-6">
          {!report.imageUrl && (
            <div className="space-y-3 pb-2">
              <Badge variant={isEmergency ? "destructive" : "secondary"} className="shadow-sm">
                {isEmergency ? <AlertTriangle className="w-3 h-3 mr-1" /> : <Home className="w-3 h-3 mr-1" />}
                {REPORT_TYPE_LABELS[report.type]}
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{report.title}</h1>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-border">
              {ANIMAL_TYPE_LABELS[report.animalType]}
            </Badge>
            <Badge variant="outline" className="border-border">
              {CATEGORY_LABELS[report.category]}
            </Badge>
            {isEmergency && (
              <Badge variant="outline" className={severityColors[report.severity]}>
                ความรุนแรง: {SEVERITY_LABELS[report.severity]}
              </Badge>
            )}
            <Badge className={report.status === "active" ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"}>
              {STATUS_LABELS[report.status]}
            </Badge>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg border border-border/50">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{report.address}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">รายละเอียด:</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
              {report.description}
            </p>
          </div>

          <Separator className="bg-border" />

          {/* Reporter Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ผู้แจ้ง</h4>
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
            <p className="text-xs text-muted-foreground">แจ้งเมื่อ: {new Date(report.createdAt).toLocaleString("th-TH")}</p>
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
          <div className="flex flex-wrap gap-3">
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[130px]">
              <Button variant="default" className="w-full gap-2">
                <Navigation className="w-4 h-4" /> นำทาง (Maps)
              </Button>
            </a>

            <Button variant="secondary" className="flex-1 min-w-[130px] gap-2" onClick={handleShare}>
              <Share2 className="w-4 h-4" /> แชร์เคสนี้
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
              <Button
                variant="outline"
                className="flex-1 min-w-[130px] gap-2 border-primary/50 text-primary hover:bg-primary/10"
                onClick={() => handleStatusUpdate(isEmergency ? "resolved" : "adopted")}
                disabled={updating}
              >
                <CheckCircle2 className="w-4 h-4" /> {isEmergency ? "ช่วยเหลือเสร็จสิ้น" : "หาบ้านได้แล้ว"}
              </Button>
            )}
            
            {canEdit && (
              <Link href={`/report/${report.id}/edit`} className="flex-none">
                <Button variant="outline" className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/10" disabled={updating}>
                  <Edit className="w-4 h-4" /> แก้ไข
                </Button>
              </Link>
            )}
            
            {canDelete && (
              <Button variant="destructive" className="flex-none gap-2" onClick={handleDelete} disabled={updating}>
                <Trash2 className="w-4 h-4" /> ลบ
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
