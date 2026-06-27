"use client";

import Sidebar from "./Sidebar";
import Header from "./Header";
import { usePathname } from "next/navigation";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar for desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 w-full min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-5">
          {children}
        </main>
      </div>
    </div>
  );
}

