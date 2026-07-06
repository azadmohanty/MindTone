"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Brain, 
  LayoutDashboard, 
  ClipboardList, 
  History, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  X 
} from "lucide-react";

interface SidebarProps {
  session: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export default function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, role: "USER" },
    { name: "Take Survey", href: "/survey", icon: ClipboardList, role: "USER" },
    { name: "History", href: "/history", icon: History, role: "USER" },
    { name: "Admin Portal", href: "/admin", icon: ShieldAlert, role: "ADMIN" },
  ];

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const filteredItems = navItems.filter(
    (item) => item.role === "USER" || (item.role === "ADMIN" && session?.role === "ADMIN")
  );

  return (
    <>
      {/* 1. Mobile Header Bar */}
      <header className="md:hidden fixed top-0 left-0 w-full h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2 text-indigo-400 font-bold">
          <Brain className="h-6 w-6" />
          <span className="tracking-tight text-white">MentalHealth_ML</span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="text-slate-400 hover:text-white p-1 rounded-lg focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* 2. Mobile Drawer Slide-in Drawer */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 md:hidden animate-fade-in">
          <div className="fixed top-0 left-0 w-64 h-full bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between">
            
            <div>
              {/* Header Drawer */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2 text-indigo-400 font-bold">
                  <Brain className="h-6 w-6" />
                  <span className="tracking-tight text-white">MentalHealth_ML</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Nav items mobile */}
              <nav className="space-y-1.5">
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* User footer mobile */}
            <div className="space-y-4 pt-6 border-t border-slate-800/60">
              <div className="px-2">
                <p className="text-xs font-bold text-slate-200 truncate">{session?.name || "User"}</p>
                <p className="text-[10px] text-slate-500 truncate">{session?.email}</p>
                <span className="inline-block text-[9px] font-extrabold text-indigo-400 bg-indigo-950/60 border border-indigo-500/20 px-2 py-0.5 rounded-full mt-1.5 uppercase">
                  {session?.role || "USER"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-2.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 rounded-xl text-xs font-bold transition"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 3. Desktop Persistent Sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 w-64 h-full bg-slate-900 border-r border-slate-800/80 p-6 flex-col justify-between z-30">
        <div>
          {/* Brand header */}
          <div className="flex items-center gap-2.5 text-indigo-400 font-extrabold mb-10 px-2">
            <Brain className="h-7 w-7" />
            <span className="tracking-tight text-white text-lg">MentalHealth_ML</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition duration-150 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User footer block */}
        <div className="space-y-4 pt-6 border-t border-slate-800/50">
          <div className="px-2">
            <p className="text-sm font-bold text-slate-200 truncate">{session?.name || "User"}</p>
            <p className="text-xs text-slate-500 truncate">{session?.email}</p>
            <span className="inline-block text-[9px] font-extrabold text-indigo-400 bg-indigo-950/60 border border-indigo-500/20 px-2 py-0.5 rounded-full mt-1.5 uppercase">
              {session?.role || "USER"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-950/20 hover:bg-rose-950/30 border border-rose-500/20 hover:border-rose-500/30 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-bold transition active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
