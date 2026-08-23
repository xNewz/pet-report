"use client";

import Link from "next/link";
import { PawPrint, AlertTriangle, User, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "หน้าหลัก", icon: "🗺️" },
  { href: "/feed", label: "ฟีดทั้งหมด", icon: "📋" },
  { href: "/report", label: "แจ้งเหตุ", icon: "🚨" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loginWithGoogle, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-background/85 backdrop-blur-xl border-b border-border/50 shadow-sm supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary via-orange-500 to-amber-400 flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
            <PawPrint className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-foreground leading-none group-hover:text-primary transition-colors">
              Community <span className="text-primary">Pet Watch</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wide mt-0.5">
              ช่วยเหลือสัตว์จรจัดในชุมชน
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 bg-muted/50 p-1 rounded-2xl border border-border/50">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={`gap-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-background text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="text-sm">{link.icon}</span>
                  <span>{link.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA & User Profile Dropdown */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/report">
            <Button
              size="sm"
              variant="destructive"
              className="gap-2 shadow-md shadow-destructive/20 rounded-xl text-xs font-bold px-4"
            >
              <AlertTriangle className="h-4 w-4" />
              แจ้งเหตุฉุกเฉิน
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-9 w-9 rounded-full border-2 border-primary/30 outline-none ring-primary focus-visible:ring-2 hover:border-primary transition-all shadow-sm">
                <Avatar className="h-full w-full">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                  <AvatarFallback className="font-bold text-xs">
                    {user.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 rounded-2xl p-2 shadow-xl border-border">
                <div className="flex items-center gap-2.5 p-2 bg-muted/40 rounded-xl mb-1">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 leading-tight">
                    <p className="font-bold text-xs truncate text-foreground">{user.displayName}</p>
                    <p className="truncate text-[10px] text-muted-foreground mt-0.5">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer rounded-xl text-xs font-medium gap-2 py-2"
                  onClick={() => router.push("/profile")}
                >
                  <User className="w-4 h-4 text-primary" /> โปรไฟล์ & ตั้งค่าการแจ้งเตือน
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer rounded-xl text-xs font-medium gap-2 py-2"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4" /> ออกจากระบบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={loginWithGoogle}
              className="rounded-xl text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10"
            >
              เข้าสู่ระบบ
            </Button>
          )}
        </div>

        {/* Mobile Header Quick Actions */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/report">
            <Button
              size="sm"
              variant="destructive"
              className="h-8 px-2.5 text-[11px] font-bold rounded-xl gap-1 shadow-sm"
            >
              <AlertTriangle className="h-3.5 w-3.5" /> แจ้งด่วน
            </Button>
          </Link>

          {user ? (
            <Link href="/profile">
              <Avatar className="h-8 w-8 border-2 border-primary/40 shadow-sm">
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback className="text-xs font-bold">
                  {user.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={loginWithGoogle}
              className="h-8 px-2.5 text-[11px] font-semibold rounded-xl"
            >
              เข้าสู่ระบบ
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
