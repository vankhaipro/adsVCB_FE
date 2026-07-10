"use client";

import { useEffect, useState } from "react";
import { Bell, List, CheckCircle, Sun, Moon } from "@phosphor-icons/react";
import { useTheme } from "./ThemeProvider";
import { getAuthUser } from "@/lib/api";

const ROLE_LABEL: Record<string, string> = { ADMIN: "Admin", STAFF: "Nhân viên" };

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
  useEffect(() => { setUser(getAuthUser()); }, []);
  const displayName = user?.name || "Người dùng";
  const roleLabel = user?.role ? (ROLE_LABEL[user.role] ?? user.role) : "";

  return (
    <header className="h-[52px] bg-card border-b border-border flex items-center justify-between px-4 sticky top-0 z-10 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button className="text-muted-foreground hover:text-foreground lg:hidden">
          <List size={24} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
          title={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
          aria-label="Đổi giao diện sáng/tối"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <button className="relative text-muted-foreground hover:text-foreground">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-border"></span>
        </button>

        {/* System Status */}
        <div className="hidden md:flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-xs text-green-500 border border-green-500/20">
          <CheckCircle size={14} weight="fill" />
          Hệ thống đang chạy
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`} alt="User Avatar" />
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-medium text-foreground leading-tight">{displayName}</span>
            {roleLabel && <span className="text-[13px] text-muted-foreground">{roleLabel}</span>}
          </div>
        </div>
      </div>
    </header>
  );
}
