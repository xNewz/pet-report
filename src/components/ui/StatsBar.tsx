"use client";

import { useEffect, useState } from "react";
import { Stats } from "@/lib/types";
import { BarChart3, Clock, CheckCircle2, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsBarProps {
  stats: Stats;
}

function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let mounted = true;
    const timeout = setTimeout(() => {
      const duration = 1000;
      const steps = 30;
      const increment = value / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (!mounted) {
          clearInterval(interval);
          return;
        }
        if (current >= value) {
          if (mounted) setDisplayed(value);
          clearInterval(interval);
        } else {
          if (mounted) setDisplayed(Math.floor(current));
        }
      }, duration / steps);
    }, delay);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [value, delay]);

  return <span className="animate-count-up">{displayed}</span>;
}

const statItems = [
  {
    key: "total" as keyof Stats,
    label: "แจ้งเหตุทั้งหมด",
    icon: <BarChart3 className="w-5 h-5 text-blue-500" />,
    borderColor: "border-blue-500/20",
    bgAccent: "bg-blue-500/10",
  },
  {
    key: "active" as keyof Stats,
    label: "กำลังดำเนินการ",
    icon: <Clock className="w-5 h-5 text-amber-500 animate-pulse" />,
    borderColor: "border-amber-500/20",
    bgAccent: "bg-amber-500/10",
  },
  {
    key: "resolved" as keyof Stats,
    label: "ช่วยเหลือแล้ว",
    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    borderColor: "border-green-500/20",
    bgAccent: "bg-green-500/10",
  },
  {
    key: "adopted" as keyof Stats,
    label: "หาบ้านได้แล้ว",
    icon: <Heart className="w-5 h-5 text-pink-500" />,
    borderColor: "border-pink-500/20",
    bgAccent: "bg-pink-500/10",
  },
];

export default function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {statItems.map((item, index) => (
        <Card
          key={item.key}
          className={`
            border ${item.borderColor} bg-card/80 backdrop-blur-sm
            transition-all duration-300 hover:scale-[1.02] hover:shadow-md
            animate-slide-up rounded-2xl overflow-hidden
          `}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className={`p-2.5 rounded-xl ${item.bgAccent} shrink-0`}>
              {item.icon}
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
              <p className="text-2xl font-black tracking-tight text-foreground mt-0.5">
                <AnimatedNumber value={stats[item.key]} delay={index * 100} />
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
