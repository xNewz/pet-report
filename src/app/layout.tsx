import type { Metadata, Viewport } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import { LocationNotifier } from "@/components/notifications/LocationNotifier";

const fontSans = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Community Stray Pet Watch | แจ้งจุดสัตว์จรจัด",
  description:
    "แพลตฟอร์มแจ้งจุดสัตว์จรจัดป่วย/ดุร้าย และหาบ้าน — ช่วยเหลือสัตว์จรจัดที่บาดเจ็บ แจ้งเตือนจุดสุนัขดุร้าย และเปิดรับอุปการะ",
  keywords: [
    "สัตว์จรจัด",
    "แจ้งเหตุ",
    "หาบ้าน",
    "อุปการะ",
    "สุนัข",
    "แมว",
    "ช่วยเหลือสัตว์",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pet Watch",
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${fontSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <LocationNotifier />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
