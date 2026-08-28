"use client";


import { Bell, List, CheckCircle, Sun, Moon } from "@phosphor-icons/react";
import { useTheme } from "./ThemeProvider";
import { useAuthUser } from "@/lib/useAuthUser";

const ROLE_LABEL: Record<string, string> = { ADMIN: "Admin", STAFF: "Nhân viên" };

// Chữ cái đầu của tên, vd "Bùi Duy Cường" -> "BC".
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

// Màu nền ổn định theo tên (cùng một người luôn ra cùng màu).
const AVATAR_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];
function colorOf(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export default function Header() {
  const { toggleTheme } = useTheme();
  const user = useAuthUser();
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
          title="Đổi giao diện sáng/tối"
          aria-label="Đổi giao diện sáng/tối"
        >
          {/* Cả hai icon đều nằm trong DOM, ẩn/hiện bằng class .dark trên <html> mà
              script no-flash đã đặt trước khi React chạy. Markup giống hệt nhau ở
              server và client → không lệch hydrate, cũng không nháy icon sau hydrate. */}
          <Sun size={20} className="hidden dark:block" />
          <Moon size={20} className="block dark:hidden" />
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
          {/* Avatar vẽ tại chỗ thay vì gọi ui-avatars.com — bỏ một request ra
              dịch vụ ngoài mỗi lần tải trang, và không gửi tên người dùng ra bên thứ ba. */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold select-none"
            style={{ backgroundColor: colorOf(displayName) }}
            aria-label={`Ảnh đại diện của ${displayName}`}
          >
            {initialsOf(displayName)}
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
