"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  House,
  Megaphone,
  GitBranch,
  Calendar,
  CurrencyCircleDollar,
  ChartBar,
  Warning,
  Scroll,
  UserRectangle,
  Gear,
  SignOut,
} from "@phosphor-icons/react";

const mainNav = [
  { href: "/", label: "Tổng quan", icon: House },
  { href: "/campaigns", label: "Quản lý Ads", icon: Megaphone },
  { href: "/auto-rules", label: "Quy tắc tự động", icon: GitBranch },
  { href: "/budget", label: "Ngân sách", icon: CurrencyCircleDollar },
  { href: "/reports", label: "Báo cáo", icon: ChartBar },
  { href: "/alerts", label: "Cảnh báo", icon: Warning },
  { href: "/logs", label: "Nhật ký hệ thống", icon: Scroll },
  { href: "/ad-accounts", label: "Tài khoản quảng cáo", icon: UserRectangle },
  { href: "/settings", label: "Cài đặt", icon: Gear },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0";
    router.push("/login");
  }

  return (
    <div className="w-[210px] h-full flex flex-col bg-[#111827] text-n-300 border-r border-[#1f2937] flex-shrink-0">
      {/* Logo */}
      <div className="h-[52px] flex items-center px-4 font-bold text-white text-base border-b border-[#1f2937]">
        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mr-2 text-xs">
          A
        </div>
        Auto Ads Facebook
      </div>

      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-6">
        {/* Main Nav */}
        <nav className="flex flex-col gap-1 px-2">
          {mainNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-[#1f2937] text-white font-medium"
                    : "text-gray-400 hover:text-white hover:bg-[#1f2937]"
                }`}
              >
                <Icon size={16} weight={isActive ? "fill" : "regular"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

      </div>
      
      {/* Footer: version + logout */}
      <div className="p-4 border-t border-[#1f2937] flex items-center justify-between">
        <span className="text-xs text-gray-600">Phiên bản 1.0.0</span>
        <button
          id="logout-btn"
          onClick={handleLogout}
          title="Đăng xuất"
          className="text-gray-500 hover:text-red-400 transition-colors"
        >
          <SignOut size={16} />
        </button>
      </div>
    </div>
  );
}
