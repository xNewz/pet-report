import { Metadata, ResolvingMetadata } from "next";
import { Report } from "@/lib/types";
import FullReportClient from "./FullReportClient";

type Props = {
  params: Promise<{ id: string }>;
};

// Server-side fetch for SEO/OG Tags using Firestore REST API
async function getReport(id: string): Promise<Report | null> {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/reports/${id}`,
      { next: { revalidate: 60 } }
    );
    
    if (!res.ok) return null;
    const data = await res.json();
    
    const fields = data.fields;
    if (!fields) return null;

    const parseNum = (val: any) => Number(val?.doubleValue ?? val?.integerValue ?? 0);

    return {
      id,
      type: fields.type?.stringValue as any,
      category: fields.category?.stringValue as any,
      animalType: fields.animalType?.stringValue as any,
      title: fields.title?.stringValue || "",
      description: fields.description?.stringValue || "",
      imageUrl: fields.imageUrl?.stringValue || "",
      location: {
        lat: parseNum(fields.location?.mapValue?.fields?.lat),
        lng: parseNum(fields.location?.mapValue?.fields?.lng),
      },
      address: fields.address?.stringValue || "",
      status: fields.status?.stringValue as any,
      severity: fields.severity?.stringValue as any,
      reporterName: fields.reporterName?.stringValue || "",
      reporterId: fields.reporterId?.stringValue || "",
      reporterAvatar: fields.reporterAvatar?.stringValue || "",
      contactInfo: fields.contactInfo?.stringValue || "",
      createdAt: parseNum(fields.createdAt),
      updatedAt: parseNum(fields.updatedAt),
    };
  } catch (error) {
    console.error("Error fetching report for metadata:", error);
    return null;
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const report = await getReport(resolvedParams.id);

  if (!report) {
    return {
      title: "ไม่พบโพสต์ - Community Stray Pet Watch",
    };
  }

  const prefix = report.type === "emergency" ? "🚨 เหตุฉุกเฉิน:" : "🏠 หาบ้าน:";
  const title = `${prefix} ${report.title} | Pet Watch`;

  return {
    title,
    description: report.description,
    openGraph: {
      title,
      description: report.description,
      images: report.imageUrl ? [report.imageUrl] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: report.description,
      images: report.imageUrl ? [report.imageUrl] : [],
    },
  };
}

export default async function ReportPage({ params }: Props) {
  const resolvedParams = await params;
  const initialReport = await getReport(resolvedParams.id);
  
  return (
    <div className="min-h-screen bg-muted/10 py-6 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <FullReportClient reportId={resolvedParams.id} initialReport={initialReport} />
      </div>
    </div>
  );
}
