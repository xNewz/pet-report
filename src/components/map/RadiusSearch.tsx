"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Loader2, Compass } from "lucide-react";

interface RadiusSearchProps {
  radiusKm: number;
  onRadiusChange: (km: number) => void;
  onUseCurrentLocation: () => void;
  resultCount: number;
  loading?: boolean;
}

const RADIUS_PRESETS = [1, 3, 5, 10];

export default function RadiusSearch({
  radiusKm,
  onRadiusChange,
  onUseCurrentLocation,
  resultCount,
  loading,
}: RadiusSearchProps) {
  return (
    <Card className="animate-slide-up border-border/80 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 bg-muted/30">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          ค้นหาตามรัศมีรอบตัว
        </CardTitle>
        <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
          พบ {resultCount} รายการ
        </span>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Slider control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>ระยะทาง:</span>
            <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
              {radiusKm} กม.
            </span>
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

        {/* Quick Radius Preset Chips */}
        <div className="flex items-center justify-between gap-1">
          {RADIUS_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onRadiusChange(preset)}
              className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-all border ${
                radiusKm === preset
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground border-border"
              }`}
            >
              {preset} กม.
            </button>
          ))}
        </div>

        {/* GPS Current Location button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onUseCurrentLocation}
          disabled={loading}
          className="w-full gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary font-semibold rounded-xl"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              กำลังค้นหาพิกัด...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              ใช้ตำแหน่งปัจจุบัน (GPS)
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
