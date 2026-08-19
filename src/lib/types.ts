// ===== Report Types =====

export type ReportType = "emergency" | "adoption";

export type AnimalType = "dog" | "cat" | "other";

export type ReportCategory =
  | "injured"
  | "aggressive"
  | "sick"
  | "adoption";

export type ReportStatus = "active" | "resolved" | "adopted";

export type Severity = "low" | "medium" | "high" | "critical";

// ===== Location =====

export interface Location {
  lat: number;
  lng: number;
}

// ===== Report =====

export interface Report {
  id: string;
  type: ReportType;
  category: ReportCategory;
  animalType: AnimalType;
  title: string;
  description: string;
  imageUrl: string;
  location: Location;
  address: string;
  status: ReportStatus;
  severity: Severity;
  reporterName: string;
  reporterId?: string;
  reporterAvatar?: string;
  contactInfo: string;
  createdAt: number;
  updatedAt: number;
}

export interface ReportFormData {
  type: ReportType;
  category: ReportCategory;
  animalType: AnimalType;
  title: string;
  description: string;
  imageBase64: string;
  location: Location | null;
  address: string;
  severity: Severity;
  reporterName: string;
  reporterId?: string;
  reporterAvatar?: string;
  contactInfo: string;
}

// ===== Filter & Search =====

export interface ReportFilter {
  type?: ReportType;
  category?: ReportCategory;
  status?: ReportStatus;
  animalType?: AnimalType;
}

export type SortOption = "newest" | "nearest" | "urgent";

// ===== Stats =====

export interface Stats {
  total: number;
  active: number;
  resolved: number;
  adopted: number;
}

// ===== Map =====

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// ===== UI Labels (Thai) =====

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  emergency: "แจ้งเหตุฉุกเฉิน",
  adoption: "หาบ้านให้สัตว์",
};

export const ANIMAL_TYPE_LABELS: Record<AnimalType, string> = {
  dog: "สุนัข",
  cat: "แมว",
  other: "อื่นๆ",
};

export const CATEGORY_LABELS: Record<ReportCategory, string> = {
  injured: "บาดเจ็บ",
  aggressive: "ดุร้าย/ไล่กัด",
  sick: "ป่วย",
  adoption: "รอรับอุปการะ",
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  active: "กำลังดำเนินการ",
  resolved: "ช่วยเหลือแล้ว",
  adopted: "หาบ้านได้แล้ว",
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  low: "น้อย",
  medium: "ปานกลาง",
  high: "มาก",
  critical: "วิกฤต",
};

export const SORT_LABELS: Record<SortOption, string> = {
  newest: "ล่าสุด",
  nearest: "ใกล้สุด",
  urgent: "ด่วนที่สุด",
};
