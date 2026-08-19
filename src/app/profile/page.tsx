"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useReports } from "@/hooks/useReports";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, LayoutList, MapPin } from "lucide-react";
import ReportCard from "@/components/reports/ReportCard";
import ReportDetail from "@/components/reports/ReportDetail";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { CuteDogIcon } from "@/components/ui/AnimalIcons";
import { Report } from "@/lib/types";
import { useState } from "react";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const { reports, loading: reportsLoading } = useReports();
  const router = useRouter();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  if (loading) {
    return <div className="p-12 text-center text-muted-foreground animate-pulse">กำลังตรวจสอบสิทธิ์...</div>;
  }

  if (!user) {
    // If somehow landed here without user
    router.replace("/");
    return null;
  }

  const userReports = reports.filter((report) => report.reporterId === user.uid);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Profile Header */}
      <Card className="border-border overflow-hidden">
        <div className="h-32 bg-primary/10 w-full" />
        <CardContent className="relative px-6 pb-6 pt-0 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 -mt-12 sm:-mt-16">
            <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-background shadow-lg">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
              <AvatarFallback className="text-3xl">{user.displayName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left pb-2">
              <h1 className="text-2xl sm:text-3xl font-bold">{user.displayName}</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              ออกจากระบบ
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User's Reports */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <LayoutList className="w-5 h-5 text-primary" />
          โพสต์ของคุณ ({userReports.length})
        </h2>

        {reportsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-muted/20 animate-pulse border border-border" />
            ))}
          </div>
        ) : userReports.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userReports.map((report) => (
              <ReportCard key={report.id} report={report} onViewDetail={setSelectedReport} />
            ))}
          </div>
        ) : (
          <Card className="border-dashed bg-muted/10">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <CuteDogIcon className="w-8 h-8 opacity-80" />
              </div>
              <div>
                <p className="font-medium text-foreground">คุณยังไม่ได้แจ้งเหตุหรือตั้งโพสต์เลย</p>
                <p className="text-sm mt-1">มาช่วยกันสร้างสังคมที่ปลอดภัยให้เพื่อนร่วมโลกกันเถอะ</p>
              </div>
              <Link href="/report">
                <Button className="mt-2">สร้างโพสต์แรกของคุณ</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      <ReportDetail
        report={selectedReport}
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}
