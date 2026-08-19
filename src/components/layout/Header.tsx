"use client";

import Link from "next/link";
import { PawPrint, Menu, AlertTriangle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const navLinks = [
  { href: "/", label: "หน้าหลัก", icon: "🗺️" },
  { href: "/report", label: "แจ้งเหตุ", icon: "🚨" },
  { href: "/feed", label: "ฟีดทั้งหมด", icon: "📋" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b">
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

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/report">
            <Button size="sm" variant="destructive" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              แจ้งเหตุฉุกเฉิน
            </Button>
          </Link>
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
            <Link href="/report" onClick={() => setOpen(false)}>
              <Button variant="destructive" className="w-full shadow-sm gap-2">
                <AlertTriangle className="h-4 w-4" />
                แจ้งเหตุฉุกเฉิน
              </Button>
            </Link>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
