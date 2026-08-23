"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Location } from "@/lib/types";
import { searchLocations, LocationSearchResult } from "@/utils/geo";
import { MapPin, Navigation, Loader2, Search, X, Building2, Info } from "lucide-react";

interface RadiusSearchProps {
  radiusKm: number;
  onRadiusChange: (km: number) => void;
  onUseCurrentLocation: () => void;
  onLocationSelect?: (location: Location, name?: string) => void;
  currentAddressName?: string;
  resultCount: number;
  loading?: boolean;
}

const RADIUS_PRESETS = [1, 3, 5, 10];

const PRESET_REGIONS = [
  { name: "กรุงเทพฯ", lat: 13.7563, lng: 100.5018 },
  { name: "นนทบุรี", lat: 13.8591, lng: 100.5217 },
  { name: "ปทุมธานี", lat: 14.0208, lng: 100.525 },
  { name: "ชลบุรี", lat: 13.3611, lng: 100.9847 },
  { name: "เชียงใหม่", lat: 18.7883, lng: 98.9853 },
  { name: "ภูเก็ต", lat: 7.8804, lng: 98.3923 },
];

export default function RadiusSearch({
  radiusKm,
  onRadiusChange,
  onUseCurrentLocation,
  onLocationSelect,
  currentAddressName,
  resultCount,
  loading,
}: RadiusSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    setIsSearching(true);
    setShowResults(true);
    const results = await searchLocations(query);
    setSearchResults(results);
    setIsSearching(false);
  };

  return (
    <Card className="animate-slide-up border-border/80 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 bg-muted/30">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          ตั้งค่าจุดศูนย์กลางและรัศมี
        </CardTitle>
        <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
          พบ {resultCount} รายการ
        </span>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Place Search Autocomplete */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-muted-foreground">
            ค้นหาพื้นที่/ซอย/สถานที่บนหน้าแรก:
          </label>
          <div className="relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="พิมพ์ชื่อสถานที่, ซอย, อำเภอ, จังหวัด..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                className="pl-9 pr-8 text-xs rounded-xl h-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setShowResults(false);
                  }}
                  className="absolute right-2 text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown results */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-border">
                {searchResults.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      if (onLocationSelect) {
                        onLocationSelect({ lat: item.lat, lng: item.lng }, item.display_name);
                      }
                      setShowResults(false);
                      setSearchQuery(item.display_name.split(",")[0]);
                    }}
                    className="w-full text-left px-3 py-2.5 text-xs hover:bg-primary/10 transition-colors flex items-start gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="line-clamp-2 text-foreground font-medium">
                      {item.display_name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {isSearching && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-xl p-2.5 shadow-xl z-50 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> กำลังค้นหาพิกัด...
              </div>
            )}
          </div>
        </div>

        {/* Preset Region Chips */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-primary" /> ย้ายแผนที่ไปแถบ:
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {PRESET_REGIONS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  if (onLocationSelect) {
                    onLocationSelect({ lat: preset.lat, lng: preset.lng }, preset.name);
                  }
                }}
                className="px-2 py-0.5 rounded-full bg-muted/60 hover:bg-primary/20 hover:text-primary transition-all text-muted-foreground border border-border text-[11px]"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* GPS Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onUseCurrentLocation}
          disabled={loading}
          className="w-full gap-2 border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary font-bold rounded-xl h-9 text-xs"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              กำลังค้นหาพิกัด...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              รีเซ็ตไปยังพิกัดเบราว์เซอร์ (GPS)
            </>
          )}
        </Button>

        {/* Slider control */}
        <div className="space-y-2 pt-1 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>ปรับรัศมีการค้นหา:</span>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
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
      </CardContent>
    </Card>
  );
}
