"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Location } from "@/lib/types";
import { MapPin, Navigation, Loader2 } from "lucide-react";

interface RadiusSearchProps {
  radiusKm: number;
  onRadiusChange: (km: number) => void;
  onUseCurrentLocation: () => void;
  resultCount: number;
  loading?: boolean;
}

export default function RadiusSearch({
  radiusKm,
  onRadiusChange,
  onUseCurrentLocation,
  resultCount,
  loading,
}: RadiusSearchProps) {
  return (
    <Card className="animate-slide-up">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          ค้นหาตามรัศมี
        </CardTitle>
        <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-full">
          {resultCount} รายการ
        </span>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>1 กม.</span>
            <span className="text-base font-bold text-primary">{radiusKm} กม.</span>
            <span>10 กม.</span>
          </div>
          <Slider
            value={[radiusKm]}
            onValueChange={(val: number | readonly number[]) => {
              const v = Array.isArray(val) ? val[0] : val;
              onRadiusChange(v);
            }}
            min={1}
            max={10}
            step={0.5}
            className="w-full"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onUseCurrentLocation}
          disabled={loading}
          suppressHydrationWarning
          className="w-full gap-2 border-white/10 hover:bg-white/5 transition-all duration-300"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              กำลังค้นหาตำแหน่ง...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              ใช้ตำแหน่งปัจจุบัน
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
