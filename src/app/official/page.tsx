"use client";

import { useEffect, useState } from "react";
import { StaffGuard } from "@/components/layout/StaffGuard";
import { Report } from "@/lib/types";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportCard from "@/components/reports/ReportCard";
import ReportDetail from "@/components/reports/ReportDetail";
import { ClipboardList, ClipboardCheck, History, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function OfficialDashboard() {
  return (
    <StaffGuard>
      <OfficialDashboardContent />
    </StaffGuard>
  );
}

function OfficialDashboardContent() {
  const { userProfile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    // We fetch all non-adopted active/in_progress/resolved basically. Or just all reports and filter client-side for simplicity, 
    // but better to fetch reasonably.
    // For now, let's fetch all and filter in memory, or fetch with limit. 
    // Given this is a dashboard, we can just query all open and recently resolved.
    const q = query(
      collection(db, "reports"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const parsed: Report[] = [];
      snapshot.forEach((doc) => {
        parsed.push({ id: doc.id, ...doc.data() } as Report);
      });
      setReports(parsed);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading || !userProfile) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filters
  const newCases = reports.filter(r => r.status === "active");
  const myTasks = reports.filter(r => r.status === "in_progress" && r.acknowledgedBy?.uid === userProfile.uid);
  const myResolved = reports.filter(r => r.status === "resolved" && r.acknowledgedBy?.uid === userProfile.uid);

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-fade-in pb-16 px-4 sm:px-6 pt-4 sm:pt-8">
      <div className="flex items-center gap-3 mb-4 sm:mb-8">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
          <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">พื้นที่ทำงานเจ้าหน้าที่</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">จัดการเคสและติดตามสถานะ</p>
        </div>
      </div>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new" className="flex gap-1 sm:gap-2 px-1 sm:px-3 text-[11px] sm:text-sm">
            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
            <span className="hidden sm:inline">รอรับเรื่อง</span>
            <span className="inline sm:hidden">รอรับ</span>
            <span className="bg-red-100 text-red-600 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-xs ml-0.5 sm:ml-1">{newCases.length}</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex gap-1 sm:gap-2 px-1 sm:px-3 text-[11px] sm:text-sm">
            <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
            <span className="hidden sm:inline">งานของฉัน</span>
            <span className="inline sm:hidden">งานฉัน</span>
            <span className="bg-amber-100 text-amber-600 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-xs ml-0.5 sm:ml-1">{myTasks.length}</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex gap-1 sm:gap-2 px-1 sm:px-3 text-[11px] sm:text-sm">
            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
            <span className="hidden sm:inline">ประวัติ</span>
            <span className="inline sm:hidden">ประวัติ</span>
            <span className="bg-green-100 text-green-600 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-xs ml-0.5 sm:ml-1">{myResolved.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-6 space-y-4">
          {newCases.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>ไม่มีเคสใหม่ที่รอรับเรื่องในขณะนี้</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {newCases.map((report, idx) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  viewMode="list"
                  index={idx}
                  onViewDetail={setSelectedReport}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="mt-6 space-y-4">
          {myTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>คุณไม่มีงานที่กำลังดำเนินการอยู่</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {myTasks.map((report, idx) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  viewMode="list"
                  index={idx}
                  onViewDetail={setSelectedReport}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6 space-y-4">
          {myResolved.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
              <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>คุณยังไม่มีประวัติการปิดเคส</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {myResolved.map((report, idx) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  viewMode="list"
                  index={idx}
                  onViewDetail={setSelectedReport}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ReportDetail
        report={selectedReport}
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}
