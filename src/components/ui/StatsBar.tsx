"use client";

import { useEffect, useState } from "react";
import { Stats } from "@/lib/types";

interface StatsBarProps {
  stats: Stats;
}

function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const duration = 1000;
      const steps = 30;
      const increment = value / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayed(value);
          clearInterval(interval);
        } else {
          setDisplayed(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return <span className="animate-count-up">{displayed}</span>;
}

import { BarChart3, Clock, CheckCircle2, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const statItems = [
  {
    key: "total" as keyof Stats,
    label: "แจ้งเหตุทั้งหมด",
    icon: <BarChart3 className="w-5 h-5" />,
    bgColor: "bg-card",
    textColor: "text-foreground",
  },
  {
    key: "active" as keyof Stats,
    label: "กำลังดำเนินการ",
    icon: <Clock className="w-5 h-5" />,
    bgColor: "bg-card",
    textColor: "text-foreground",
  },
  {
    key: "resolved" as keyof Stats,
    label: "ช่วยเหลือแล้ว",
    icon: <CheckCircle2 className="w-5 h-5" />,
    bgColor: "bg-card",
    textColor: "text-foreground",
  },
  {
    key: "adopted" as keyof Stats,
    label: "หาบ้านได้แล้ว",
    icon: <Home className="w-5 h-5" />,
    bgColor: "bg-card",
    textColor: "text-foreground",
  },
];


export default function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {statItems.map((item, index) => (
        <Card
          key={item.key}
          className={`
            ${item.bgColor}
            transition-all duration-300 hover:scale-[1.02]
            animate-slide-up
          `}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-muted-foreground ${item.textColor}`}>{item.icon}</span>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
            <p className={`text-2xl font-bold ${item.textColor}`}>
              <AnimatedNumber value={stats[item.key]} delay={index * 100} />
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
