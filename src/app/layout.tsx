import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundaryProvider } from "@/components/error-boundary";
import { PerformanceMonitorComponent } from "@/lib/performance";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AiCoin OS",
  description: "企业级项目管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PerformanceMonitorComponent>
          <ErrorBoundaryProvider>
            {children}
          </ErrorBoundaryProvider>
        </PerformanceMonitorComponent>
        <Toaster />
      </body>
    </html>
  );
}
