"use client";

import { useState, useRef } from "react";
import {
  ReportFormData,
  ReportType,
  ReportCategory,
  AnimalType,
  Severity,
  Location,
  ANIMAL_TYPE_LABELS,
  CATEGORY_LABELS,
  SEVERITY_LABELS,
} from "@/lib/types";
import { createReport, updateFullReport } from "@/hooks/useReports";
import { Report } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import LocationPicker from "@/components/map/LocationPicker";
import { CheckCircle2, AlertTriangle, Home, MapPin, Camera, ClipboardList, PawPrint, Activity, Thermometer, ImageIcon, Loader2, Zap } from "lucide-react";
import { CuteDogIcon, CuteCatIcon, CutePawIcon } from "@/components/ui/AnimalIcons";
import { useAuth } from "@/contexts/AuthContext";
import { compressImage, formatBytes } from "@/utils/imageCompressor";

interface ReportFormProps {
  onSuccess?: () => void;
  initialData?: Report;
  isEdit?: boolean;
}

const STEPS = [
  { title: "ประเภทการแจ้ง", icon: <ClipboardList className="w-4 h-4" /> },
  { title: "รายละเอียดสัตว์", icon: <PawPrint className="w-4 h-4" /> },
  { title: "ปักหมุดตำแหน่ง", icon: <MapPin className="w-4 h-4" /> },
  { title: "รูปภาพ & ข้อมูลติดต่อ", icon: <Camera className="w-4 h-4" /> },
];

export default function ReportForm({ onSuccess, initialData, isEdit }: ReportFormProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ReportFormData>(
    initialData
      ? {
        type: initialData.type,
        category: initialData.category,
        animalType: initialData.animalType,
        title: initialData.title,
        description: initialData.description,
        imageBase64: initialData.imageUrl || "",
        location: initialData.location,
        address: initialData.address || "",
        severity: initialData.severity,
        reporterName: initialData.reporterName || "",
        contactInfo: initialData.contactInfo || "",
      }
      : {
        type: "emergency",
        category: "injured",
        animalType: "dog",
        title: "",
        description: "",
        imageBase64: "",
        location: null,
        address: "",
        severity: "medium",
        reporterName: "",
        contactInfo: "",
      }
  );

  const updateField = <K extends keyof ReportFormData>(
    key: K,
    value: ReportFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    compressedSize: number;
  } | null>(null);

  const processImageFile = async (file: File) => {
    setIsCompressing(true);
    try {
      const result = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.78,
        format: "image/webp",
      });
      updateField("imageBase64", result.base64);
      setCompressionStats({
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
      });
    } catch (err) {
      console.error("Failed to compress image:", err);
      const reader = new FileReader();
      reader.onload = () => {
        updateField("imageBase64", reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset input value so the same file/camera can be re-selected
    e.target.value = "";
    if (!file) return;
    await processImageFile(file);
  };

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    // Reset input value so re-taking a photo fires onChange again
    input.value = "";

    if (!file) {
      console.warn("Camera capture: no file received");
      return;
    }

    // Some mobile browsers return a file with size 0 briefly; wait and check
    if (file.size === 0) {
      console.warn("Camera capture: file has 0 bytes, possibly not ready");
      return;
    }

    // Validate it's actually an image
    if (!file.type && !file.name) {
      console.warn("Camera capture: file has no type or name");
      return;
    }

    await processImageFile(file);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (isEdit && initialData) {
        await updateFullReport(initialData.id, formData);
      } else {
        const payload = {
          ...formData,
          reporterId: user?.uid,
          reporterAvatar: user?.photoURL || undefined,
          reporterName: formData.reporterName || user?.displayName || "ผู้ไม่ประสงค์ออกนาม",
        };
        await createReport(payload);
      }
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      console.error("Failed to submit report:", err);
      alert("เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่");
    }
    setSubmitting(false);
  };

  const canNext = () => {
    switch (step) {
      case 0:
        return !!formData.type;
      case 1:
        return !!formData.title && !!formData.description;
      case 2:
        return !!formData.location;
      case 3:
        return true;
      default:
        return false;
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-scale-in">
        <CheckCircle2 className="w-16 h-16 text-primary mb-6 animate-float" />
        <h2 className="text-2xl font-bold mb-2 text-primary">
          {isEdit ? "บันทึกข้อมูลสำเร็จ!" : "ส่งรายงานสำเร็จ!"}
        </h2>
        <p className="text-muted-foreground text-center max-w-sm">
          {isEdit ? "ข้อมูลของคุณถูกอัปเดตเรียบร้อยแล้ว" : "ขอบคุณที่ช่วยแจ้งข้อมูล รายงานของคุณจะปรากฏบนแผนที่ทันที"}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex-1 flex items-center gap-2">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm
                transition-all duration-500
                ${i === step
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110"
                  : i < step
                    ? "bg-green-500/20 text-green-400"
                    : "bg-white/5 text-muted-foreground"
                }
              `}
            >
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : s.icon}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${i < step ? "bg-green-500/30" : "bg-white/5"
                  }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step title */}
      <div className="animate-fade-in">
        <h2 className="text-xl font-bold flex items-center gap-2">
          {STEPS[step].icon} {STEPS[step].title}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          ขั้นตอนที่ {step + 1} จาก {STEPS.length}
        </p>
      </div>

      {/* Step content */}
      <Card className="animate-scale-in" key={step}>
        <CardContent className="p-6">
          {step === 0 && (
            <div className="space-y-6">
              {/* Report Type */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">ประเภทการแจ้ง</Label>
                <ToggleGroup
                  value={[formData.type]}
                  onValueChange={(val: any) => {
                    const v = Array.isArray(val) ? val[0] : val;
                    if (!v) return;
                    if (v === "emergency") {
                      updateField("type", "emergency");
                      updateField("category", "injured");
                    } else {
                      updateField("type", "adoption");
                      updateField("category", "adoption");
                      updateField("severity", "low");
                    }
                  }}
                  className="grid grid-cols-2 gap-3"
                >
                  <ToggleGroupItem
                    value="emergency"
                    className={`
                    h-auto p-4 flex-col items-start rounded-xl border-2 transition-all duration-300 text-left
                    ${formData.type === "emergency"
                        ? "border-destructive bg-destructive/10 data-[state=on]:bg-destructive/10 data-[state=on]:text-destructive"
                        : "border-border hover:bg-muted"
                      }
                  `}
                  >
                    <AlertTriangle className="w-8 h-8 mb-2" />
                    <h3 className="font-bold text-sm w-full text-left">แจ้งเหตุฉุกเฉิน</h3>
                    <p className="text-xs text-muted-foreground mt-1 whitespace-normal text-left">
                      สัตว์บาดเจ็บ ป่วย หรือดุร้ายไล่กัด
                    </p>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="adoption"
                    className={`
                    h-auto p-4 flex-col items-start rounded-xl border-2 transition-all duration-300 text-left
                    ${formData.type === "adoption"
                        ? "border-primary bg-primary/10 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                        : "border-border hover:bg-muted"
                      }
                  `}
                  >
                    <Home className="w-8 h-8 mb-2" />
                    <h3 className="font-bold text-sm w-full text-left">หาบ้านให้สัตว์</h3>
                    <p className="text-xs text-muted-foreground mt-1 whitespace-normal text-left">
                      ลงข้อมูลสัตว์จรจัดเพื่อเปิดรับอุปการะ
                    </p>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Category (for emergency) */}
              {formData.type === "emergency" && (
                <div className="space-y-3 animate-slide-up">
                  <Label className="text-sm font-semibold">ประเภทเหตุ</Label>
                  <ToggleGroup
                    value={[formData.category]}
                    onValueChange={(val: any) => {
                      const v = Array.isArray(val) ? val[0] : val;
                      if (v) updateField("category", v as ReportCategory);
                    }}
                    className="grid grid-cols-3 gap-2"
                  >
                    {(["injured", "aggressive", "sick"] as ReportCategory[]).map(
                      (cat) => (
                        <ToggleGroupItem
                          key={cat}
                          value={cat}
                          className={`
                          h-auto p-3 flex-col rounded-xl border transition-all duration-300 text-center text-xs
                          ${formData.category === cat
                              ? "border-primary bg-primary/10 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                              : "border-border hover:bg-muted"
                            }
                        `}
                        >
                          <span className="block mb-1">
                            {cat === "injured"
                              ? <Activity className="w-5 h-5 mx-auto" />
                              : cat === "aggressive"
                                ? <AlertTriangle className="w-5 h-5 mx-auto" />
                                : <Thermometer className="w-5 h-5 mx-auto" />}
                          </span>
                          {CATEGORY_LABELS[cat]}
                        </ToggleGroupItem>
                      )
                    )}
                  </ToggleGroup>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              {/* Animal Type */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">ชนิดสัตว์</Label>
                <ToggleGroup
                  value={[formData.animalType]}
                  onValueChange={(val: any) => {
                    const v = Array.isArray(val) ? val[0] : val;
                    if (v) updateField("animalType", v as AnimalType);
                  }}
                  className="flex gap-2"
                >
                  {(["dog", "cat", "other"] as AnimalType[]).map((type) => (
                    <ToggleGroupItem
                      key={type}
                      value={type}
                      className={`
                      flex-1 h-auto p-3 flex-col rounded-xl border transition-all duration-300 text-center text-xs
                      ${formData.animalType === type
                          ? "border-primary bg-primary/10 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                          : "border-border hover:bg-muted"
                        }
                      `}
                    >
                      <span className="block mb-1">
                        {type === "dog" ? <CuteDogIcon className="w-6 h-6 mx-auto" /> : type === "cat" ? <CuteCatIcon className="w-6 h-6 mx-auto" /> : <CutePawIcon className="w-6 h-6 mx-auto" />}
                      </span>
                      {ANIMAL_TYPE_LABELS[type]}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold">
                  หัวข้อ *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="เช่น สุนัขบาดเจ็บที่ขา ซอยลาดพร้าว 71"
                  className=""
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">
                  รายละเอียด *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="อธิบายลักษณะสัตว์ สภาพ สี ขนาด และสถานการณ์..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Severity (emergency only) */}
              {formData.type === "emergency" && (
                <div className="space-y-3 animate-slide-up">
                  <Label className="text-sm font-semibold">
                    ระดับความรุนแรง
                  </Label>
                  <ToggleGroup
                    value={[formData.severity]}
                    onValueChange={(val: any) => {
                      const v = Array.isArray(val) ? val[0] : val;
                      if (v) updateField("severity", v as Severity);
                    }}
                    className="grid grid-cols-4 gap-2"
                  >
                    {(["low", "medium", "high", "critical"] as Severity[]).map(
                      (sev) => {
                        const colors: Record<string, string> = {
                          low: "border-primary bg-primary/10 data-[state=on]:bg-primary/10 data-[state=on]:text-primary",
                          medium: "border-primary bg-primary/10 data-[state=on]:bg-primary/10 data-[state=on]:text-primary",
                          high: "border-primary bg-primary/10 data-[state=on]:bg-primary/10 data-[state=on]:text-primary",
                          critical: "border-destructive bg-destructive/10 data-[state=on]:bg-destructive/10 data-[state=on]:text-destructive",
                        };
                        return (
                          <ToggleGroupItem
                            key={sev}
                            value={sev}
                            className={`
                            p-2 rounded-xl border transition-all duration-300 text-center text-xs
                            ${formData.severity === sev
                                ? colors[sev]
                                : "border-border hover:bg-muted"
                              }
                          `}
                          >
                            {SEVERITY_LABELS[sev]}
                          </ToggleGroupItem>
                        );
                      }
                    )}
                  </ToggleGroup>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <LocationPicker
                value={formData.location}
                initialAddress={formData.address}
                onChange={(loc, addressName) => {
                  updateField("location", loc);
                  if (addressName) {
                    updateField("address", addressName);
                  }
                }}
              />
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-semibold">
                  จุดสังเกตเพิ่มเติม (ถ้ามี)
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="เช่น หน้า 7-Eleven, ข้างเสาไฟฟ้า..."
                  className=""
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              {/* Image Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">
                  รูปภาพ (ไม่บังคับ)
                </Label>
                <div
                  className={`
                  border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
                  transition-all duration-300
                  ${formData.imageBase64
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-white/10 hover:border-white/20 hover:bg-white/5"
                    }
                `}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.imageBase64 ? (
                    <div className="space-y-3">
                      <div className="relative group">
                        <img
                          src={formData.imageBase64}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-xl border border-border shadow-xs"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateField("imageBase64", "");
                            setCompressionStats(null);
                          }}
                          className="absolute top-2 right-2 text-xs h-7 px-2.5 rounded-lg font-bold shadow-md"
                        >
                          ลบรูป
                        </Button>
                      </div>

                      {/* {compressionStats && (
                      <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/25 text-xs text-green-600 dark:text-green-400 space-y-0.5 text-left">
                        <p className="font-bold flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                          บีบอัดรูปภาพเรียบร้อย (ประหยัดพื้นที่{(100 - (compressionStats.compressedSize / compressionStats.originalSize) * 100).toFixed(1)}%)
                        </p>
                        <p className="text-[11px] opacity-90 pl-5">
                          จาก {formatBytes(compressionStats.originalSize)} เหลือเพียง <strong>{formatBytes(compressionStats.compressedSize)}</strong> (ความละเอียด HD 1200px คมชัดเท่าเดิม)
                        </p>
                      </div>
                    )} */}
                      <div className="flex justify-center gap-2 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => cameraInputRef.current?.click()}
                          className="text-xs gap-1.5 rounded-lg"
                        >
                          <Camera className="w-3.5 h-3.5 text-primary" /> ถ่ายใหม่
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs gap-1.5 rounded-lg"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-primary" /> เปลี่ยนรูปภาพ
                        </Button>
                      </div>
                    </div>
                  ) : isCompressing ? (
                    <div className="py-8 flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-sm font-bold text-foreground">
                        กำลังบีบอัดรูปภาพเพื่อประหยัดพื้นที่...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        แปลงไฟล์เป็น WebP ปรับขนาด HD 1200px ให้ภาพคมชัดและไฟล์เล็กลง 90%+
                      </p>
                    </div>
                  ) : (
                    <div className="py-4 space-y-4">
                      <p className="text-xs font-semibold text-muted-foreground">
                        เลือกวิธีแนบรูปภาพสัตว์จรจัด:
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className="w-full sm:w-auto gap-2 bg-gradient-to-r from-primary via-orange-500 to-amber-500 hover:from-primary/90 hover:to-orange-600 text-white font-bold rounded-xl h-11 px-6 shadow-md shadow-primary/20 transition-all hover:scale-105"
                        >
                          <Camera className="w-4 h-4" /> ถ่ายรูปจากกล้องสด
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full sm:w-auto gap-2 border-border font-semibold rounded-xl h-11 px-6 hover:bg-muted"
                        >
                          <ImageIcon className="w-4 h-4 text-primary" /> เลือกจากคลังภาพ
                        </Button>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-2">
                        ⚡ ระบบจะบีบอัดเป็น WebP (HD 1200px) ให้อัตโนมัติ ประหยัดพื้นที่ 90%+ ภาพคมชัด
                      </p>
                    </div>
                  )}

                  {/* Hidden File Inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleCameraCapture}
                  />
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-2">
                <Label htmlFor="reporterName" className="text-sm font-semibold">
                  ชื่อผู้แจ้ง
                </Label>
                <Input
                  id="reporterName"
                  value={formData.reporterName}
                  onChange={(e) => updateField("reporterName", e.target.value)}
                  placeholder="ชื่อ-นามสกุล หรือชื่อเล่น"
                  className=""
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactInfo" className="text-sm font-semibold">
                  ข้อมูลติดต่อ
                </Label>
                <Input
                  id="contactInfo"
                  value={formData.contactInfo}
                  onChange={(e) => updateField("contactInfo", e.target.value)}
                  placeholder="เบอร์โทร, LINE ID, หรือ Facebook"
                  className=""
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="gap-2 border-white/10 hover:bg-white/5"
        >
          ← ย้อนกลับ
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
          >
            ถัดไป →
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className={`gap-2 shadow-sm ${formData.type === "emergency"
                ? ""
                : ""
              }`}
            variant={formData.type === "emergency" ? "destructive" : "default"}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                กำลังส่ง...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> {isEdit ? "บันทึกการแก้ไข" : "ส่งรายงาน"}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
