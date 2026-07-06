import React from "react";
import Sidebar from "@/components/Sidebar";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-[#0e1115] flex flex-col md:flex-row">
      {/* Responsive Sidebar Overlay / Drawer */}
      <Sidebar session={session} />

      {/* Main Content Scrollpane */}
      <div className="flex-1 min-h-screen flex flex-col md:pl-64 pt-16 md:pt-0 relative overflow-hidden">
        <main className="flex-grow w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
