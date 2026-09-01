"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Report } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import ReportForm from "@/components/reports/ReportForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";

export default function EditReportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const docRef = doc(db, "reports", params.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setReport({ id: docSnap.id, ...docSnap.data() } as Report);
        }
      } catch (err) {
        console.error("Error fetching report:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (!authLoading) {
      fetchReport();
    }
  }, [params.id, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container max-w-4xl py-8 px-4 mx-auto text-center">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-bold">ไม่พบโพสต์นี้</h2>
        <p className="text-muted-foreground mt-2 mb-6">โพสต์นี้อาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง</p>
        <Button onClick={() => router.push("/")}>กลับหน้าแรก</Button>
      </div>
    );
  }

  const canEdit = user && (user.uid === report.reporterId || userProfile?.role === "admin" || userProfile?.role === "official");

  if (!canEdit) {
    return (
      <div className="container max-w-4xl py-8 px-4 mx-auto text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-bold">ไม่มีสิทธิ์เข้าถึง</h2>
        <p className="text-muted-foreground mt-2 mb-6">คุณไม่มีสิทธิ์ในการแก้ไขโพสต์นี้</p>
        <Button onClick={() => router.back()}>ย้อนกลับ</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      <Button 
        variant="ghost" 
        className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        onClick={() => router.push(`/report/${report.id}`)}
      >
        <ArrowLeft className="w-4 h-4" /> กลับหน้าโพสต์
      </Button>
      
      <div className="text-center mb-8 animate-slide-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">
          ✏️ แก้ไขโพสต์
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          ปรับปรุงข้อมูลการแจ้งเหตุ หรือข้อมูลหาบ้านให้ถูกต้อง
        </p>
      </div>

      <ReportForm 
        initialData={report} 
        isEdit={true} 
        onSuccess={() => router.push(`/report/${report.id}`)} 
      />
    </div>
  );
}
