"use client";

import { useRouter } from "next/navigation";
import ReportForm from "@/components/reports/ReportForm";

export default function ReportPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-8 animate-slide-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">
          📝 แจ้งเหตุ / หาบ้าน
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          กรอกข้อมูลเพื่อแจ้งเหตุสัตว์จรจัด หรือลงประกาศหาบ้านให้สัตว์
        </p>
      </div>

      <ReportForm onSuccess={() => router.push("/")} />
    </div>
  );
}
