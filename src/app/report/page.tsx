"use client";

import { useRouter } from "next/navigation";
import ReportForm from "@/components/reports/ReportForm";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, LogIn } from "lucide-react";

export default function ReportPage() {
  const { user, loginWithGoogle, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="p-12 text-center text-muted-foreground animate-pulse">กำลังตรวจสอบสิทธิ์...</div>;
  }

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

      {user ? (
        <ReportForm onSuccess={() => router.push("/")} />
      ) : (
        <div className="max-w-md mx-auto animate-slide-up">
          <Card className="border-border">
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold">กรุณาเข้าสู่ระบบ</h2>
                <p className="text-sm text-muted-foreground">
                  เพื่อป้องกันการก่อกวน ระบบจำเป็นต้องให้คุณเข้าสู่ระบบก่อนทำการแจ้งเหตุหรือโพสต์หาบ้านครับ
                </p>
              </div>
              <Button onClick={loginWithGoogle} className="w-full gap-2 mt-4" size="lg">
                <LogIn className="w-5 h-5" />
                เข้าสู่ระบบด้วย Google
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
