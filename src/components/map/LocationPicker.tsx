"use client";

import { useState, useEffect } from "react";
import { Location } from "@/lib/types";
import MapView from "@/components/map/MapView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Navigation,
  Search,
  Loader2,
  CheckCircle2,
  X,
  Compass,
  Building2,
  Info,
} from "lucide-react";
import {
  reverseGeocode,
  searchLocations,
  LocationSearchResult,
  DEFAULT_CENTER,
  isWithinThailand,
} from "@/utils/geo";

interface LocationPickerProps {
  value: Location | null;
  onChange: (location: Location, addressName?: string) => void;
  initialAddress?: string;
  className?: string;
}

const PRESET_LOCATIONS = [
  { name: "กรุงเทพฯ", lat: 13.7563, lng: 100.5018 },
  { name: "นนทบุรี", lat: 13.8591, lng: 100.5217 },
  { name: "ปทุมธานี", lat: 14.0208, lng: 100.525 },
  { name: "สมุทรปราการ", lat: 13.5991, lng: 100.5968 },
  { name: "ชลบุรี", lat: 13.3611, lng: 100.9847 },
  { name: "เชียงใหม่", lat: 18.7883, lng: 98.9853 },
  { name: "ภูเก็ต", lat: 7.8804, lng: 98.3923 },
];

export default function LocationPicker({
  value,
  onChange,
  initialAddress,
  className,
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [addressName, setAddressName] = useState(initialAddress || "");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (initialAddress) {
      setAddressName(initialAddress);
    }
  }, [initialAddress]);

  const handleSelectLocation = async (loc: Location, explicitName?: string) => {
    if (!isWithinThailand(loc)) {
      alert("กรุณาปักหมุดตำแหน่งภายในประเทศไทยเท่านั้น");
      return;
    }
    let name = explicitName || "";
    if (!name) {
      setIsReverseGeocoding(true);
      name = await reverseGeocode(loc.lat, loc.lng);
      setIsReverseGeocoding(false);
    }
    setAddressName(name);
    onChange(loc, name);
  };

  const handleGetGps = () => {
    if (!navigator.geolocation) {
      alert("เบราว์เซอร์ของคุณไม่รองรับการดึงตำแหน่ง GPS");
      return;
    }
    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (!isWithinThailand(loc)) {
          setIsGettingGps(false);
          alert("ตำแหน่ง GPS ของคุณอยู่นอกประเทศไทย ระบบจำกัดให้ใช้ตำแหน่งภายในประเทศไทยเท่านั้น");
          return;
        }
        await handleSelectLocation(loc);
        setIsGettingGps(false);
      },
      (err) => {
        setIsGettingGps(false);
        alert(
          "ไม่สามารถดึงตำแหน่ง GPS ได้ กรุณาอนุญาตสิทธิ์เข้าถึงตำแหน่งในเบราว์เซอร์ หรือใช้วิธีพิมพ์ค้นหาสถานที่ด้านบน"
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

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
    <div className={`space-y-4 ${className || ""}`}>
      {/* Search and GPS controls bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search input with autocomplete dropdown */}
        <div className="relative flex-1">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="พิมพ์ชื่อสถานที่, ซอย, ถนน, หมู่บ้าน, ห้าง..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              className="pl-9 pr-8 text-sm rounded-xl border-border/80 shadow-2xs"
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
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-border">
              {searchResults.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    handleSelectLocation({ lat: item.lat, lng: item.lng }, item.display_name);
                    setShowResults(false);
                    setSearchQuery(item.display_name.split(",")[0]);
                  }}
                  className="w-full text-left px-4 py-3 text-xs hover:bg-primary/10 transition-colors flex items-start gap-2.5"
                >
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-relaxed text-foreground font-medium">
                    {item.display_name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {isSearching && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-xl p-3 shadow-xl z-50 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" /> กำลังค้นหาตำแหน่งบน Longdo Map...
            </div>
          )}
        </div>

        {/* GPS Button */}
        <Button
          type="button"
          onClick={handleGetGps}
          disabled={isGettingGps}
          variant="outline"
          className="gap-2 shrink-0 bg-primary/5 hover:bg-primary/10 border-primary/30 text-primary hover:text-primary font-bold rounded-xl h-10 px-4"
        >
          {isGettingGps ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              กำลังหา GPS...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              ดึงตำแหน่ง GPS
            </>
          )}
        </Button>
      </div>

      {/* Desktop Wi-Fi GPS Explanation Note */}
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400 flex items-start gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>คำแนะนำในการปักหมุด:</strong> หากใช้งานบนคอมพิวเตอร์/โน้ตบุ๊ก สัญญาณอินเทอร์เน็ตอาจอ้างอิงพิกัดกลางเมืองหรือเสาโหนด ISP ของค่ายเน็ต
          <br />
          คุณสามารถ<strong>พิมพ์ชื่อสถานที่/ซอย</strong>ในช่องค้นหาด้านบน หรือ<strong>แตะลงบนแผนที่</strong>ตรงจุดจริงได้ทันทีครับ
        </p>
      </div>

      {/* Preset shortcut chips */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-muted-foreground flex items-center gap-1 mr-1 font-medium">
          <Building2 className="w-3.5 h-3.5" /> ย้ายไปยัง:
        </span>
        {PRESET_LOCATIONS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => handleSelectLocation({ lat: preset.lat, lng: preset.lng }, preset.name)}
            className="px-2.5 py-1 rounded-full bg-muted/60 hover:bg-primary/20 hover:text-primary transition-all text-muted-foreground border border-border text-[11px] font-medium"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Map display */}
      <div className="relative rounded-2xl overflow-hidden border shadow-inner">
        <div className="absolute top-3 left-3 z-10 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium text-foreground border shadow-md flex items-center gap-1.5 pointer-events-none">
          <Compass className="w-3.5 h-3.5 text-primary" />
          แตะบนแผนที่เพื่อเลือกจุดเกิดเหตุ
        </div>

        <MapView
          reports={[]}
          center={value || DEFAULT_CENTER}
          zoom={value ? 16 : 13}
          onMapClick={(loc) => handleSelectLocation(loc)}
          selectedLocation={value}
          interactive
          className="h-[380px]"
        />
      </div>

      {/* Selected location indicator card */}
      {value ? (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 space-y-2 animate-slide-up">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">
                  ตำแหน่งที่เลือก (ปักหมุดแล้ว)
                </h4>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {isReverseGeocoding ? (
                    <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> กำลังแปลงพิกัดเป็นชื่อสถานที่ภาษาไทย...
                    </span>
                  ) : (
                    addressName || "ระบุพิกัดแล้ว"
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  พิกัด: {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleGetGps}
              className="text-xs text-muted-foreground hover:text-foreground shrink-0"
            >
              ดึง GPS อีกครั้ง
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
          <MapPin className="w-4 h-4 shrink-0 animate-bounce text-amber-500" />
          <span>
            กรุณา<strong>พิมพ์ชื่อสถานที่ด้านบน</strong> หรือ<strong>แตะเลือกตำแหน่งบนแผนที่</strong>
          </span>
        </div>
      )}
    </div>
  );
}
