"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { usePathname } from "next/navigation";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Nhấn Esc để đóng drawer (bấm link trong menu đã tự đóng qua onNavigate).
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      {/* Sidebar cố định cho màn lớn */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Drawer cho tablet/mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[260px] max-w-[85vw] shadow-2xl">
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 w-full min-w-0">
        <Header onMenuClick={() => setMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
