import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "BM Portfolio",
  description: "Advanced Stock Market Analysis",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Sidebar } from "@/components/Sidebar";
import { CommandSearch } from "@/components/CommandSearch";
import { Bell, User } from "lucide-react";
import { LanguageProvider } from "@/lib/LanguageContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}>
        <LanguageProvider>
          <div className="flex min-h-screen">
            <Sidebar />

            <div className="flex-1 transition-all duration-300">
              {/* Horizontal Header */}
              <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
                <div className="flex items-center gap-8 flex-1">
                  {/* Space for Sidebar offset managed by parent flex but let's be safe */}
                  <div className="w-64 rtl:hidden" aria-hidden="true" />
                  <div className="w-64 ltr:hidden" aria-hidden="true" />
                  <CommandSearch />
                </div>

                <div className="flex items-center gap-4">
                  <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative">
                    <Bell className="w-5 h-5 ltr:rotate-0 rtl:rotate-0" />
                    <span className="absolute top-1.5 right-1.5 ltr:right-1.5 rtl:left-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                  </button>
                  <div className="h-8 w-px bg-slate-200 mx-1" />
                  <button className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                      <User className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-600 hidden sm:block">Guest</span>
                  </button>
                </div>
              </header>

              <main className="px-8 py-8 md:ltr:ml-64 md:rtl:mr-64 transition-all duration-300">
                {children}
              </main>
            </div>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
