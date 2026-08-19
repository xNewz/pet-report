"use client";

import Link from "next/link";
import { PawPrint, Menu, AlertTriangle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "หน้าหลัก", icon: "🗺️" },
  { href: "/report", label: "แจ้งเหตุ", icon: "🚨" },
  { href: "/feed", label: "ฟีดทั้งหมด", icon: "📋" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user, loginWithGoogle, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/40 supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <PawPrint className="h-6 w-6 text-primary" />
          <span className="text-sm font-bold tracking-tight text-primary leading-tight">
            Community
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <span>{link.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA & Auth */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/report">
            <Button size="sm" variant="destructive" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              แจ้งเหตุฉุกเฉิน
            </Button>
          </Link>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-8 w-8 rounded-full border border-border outline-none ring-primary focus-visible:ring-2 hover:opacity-80 transition-opacity">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                  <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.displayName}</p>
                    <p className="w-[200px] truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/profile")}>
                  โปรไฟล์ของฉัน
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={logout}>
                  ออกจากระบบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" onClick={loginWithGoogle}>
              เข้าสู่ระบบ
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="md:hidden inline-flex items-center justify-center rounded-md px-2 h-9 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
              <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-background border-l border-border">
            <SheetTitle className="flex items-center gap-2 mb-6">
              <PawPrint className="h-5 w-5 text-primary" />
              <span className="text-primary font-bold text-sm">Community Stray Pet Watch</span>
            </SheetTitle>
            <Separator className="bg-white/5 mb-6" />
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start gap-3 ${
                        isActive ? "bg-primary/90" : "hover:bg-white/5"
                      }`}
                    >
                      <span className="text-lg">{link.icon}</span>
                      <span>{link.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>
            <Separator className="bg-white/5 my-6" />
            <div className="flex flex-col gap-3">
              <Link href="/report" onClick={() => setOpen(false)}>
                <Button variant="destructive" className="w-full shadow-sm gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  แจ้งเหตุฉุกเฉิน
                </Button>
              </Link>
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      โปรไฟล์ของฉัน
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full text-destructive hover:text-destructive" onClick={() => { logout(); setOpen(false); }}>
                    ออกจากระบบ
                  </Button>
                </>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => { loginWithGoogle(); setOpen(false); }}>
                  เข้าสู่ระบบ
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
