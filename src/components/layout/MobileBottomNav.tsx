"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, LayoutList, PlusCircle, User, AlertTriangle, ClipboardList, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user, userProfile, loginWithGoogle } = useAuth();

  const navItems = [
    {
      href: "/",
      label: "หน้าหลัก",
      icon: Map,
      exact: true,
    },
    {
      href: "/feed",
      label: "ฟีด",
      icon: LayoutList,
      exact: false,
    },
    ...(userProfile?.role === "admin"
      ? [
          {
            href: "/admin",
            label: "แอดมิน",
            icon: ShieldAlert,
            exact: false,
          },
        ]
      : []),
    ...(userProfile?.role === "admin" || userProfile?.role === "official"
      ? [
          {
            href: "/official",
            label: "จนท.",
            icon: ClipboardList,
            exact: false,
          },
        ]
      : []),
    {
      href: "/report",
      label: "แจ้งเหตุ",
      icon: PlusCircle,
      isPrimary: true,
    },
    {
      href: user ? "/profile" : "#login",
      label: user ? "โปรไฟล์" : "เข้าสู่ระบบ",
      icon: User,
      isProfile: true,
      onClick: !user ? loginWithGoogle : undefined,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-1.5 sm:px-4 pb-2 pt-1 pointer-events-none">
      <nav className="pointer-events-auto mx-auto max-w-md bg-background/85 backdrop-blur-xl border border-border/60 shadow-2xl rounded-2xl p-1 flex items-center justify-between gap-0">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href) && item.href !== "/";

          if (item.isPrimary) {
            return (
              <Link key={item.href} href={item.href} className="relative -top-4 shrink-0 mx-1">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-destructive via-red-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-destructive/40 border-2 border-background transition-transform active:scale-95 animate-pulse-glow">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </Link>
            );
          }

          if (item.onClick) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all text-muted-foreground hover:text-foreground"
              >
                <item.icon className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-medium leading-none whitespace-nowrap">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                isActive
                  ? "text-primary font-semibold bg-primary/10 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.isProfile && user ? (
                <Avatar
                  className={`w-5 h-5 mb-0.5 border ${
                    isActive ? "border-primary" : "border-transparent"
                  }`}
                >
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback className="text-[9px]">
                    {user.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <item.icon className="w-5 h-5 mb-0.5" />
              )}
              <span className="text-[9px] leading-none whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
