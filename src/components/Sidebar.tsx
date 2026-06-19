"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  PlugsConnected,
  Gear,
  CheckCircle,
  PauseCircle,
} from "@phosphor-icons/react";

const mainNav = [
  { href: "/", label: "Tổng quan", icon: House },
  { href: "/campaigns", label: "Chiến dịch", icon: Megaphone },
  { href: "/auto-rules", label: "Quy tắc tự động", icon: GitBranch },
  { href: "/schedule", label: "Lịch trình", icon: Calendar },
  { href: "/budget", label: "Ngân sách", icon: CurrencyCircleDollar },
  { href: "/reports", label: "Báo cáo", icon: ChartBar },
  { href: "/alerts", label: "Cảnh báo", icon: Warning },
  { href: "/logs", label: "Nhật ký hệ thống", icon: Scroll },
  { href: "/ad-accounts", label: "Tài khoản quảng cáo", icon: UserRectangle },
  { href: "/connections", label: "Kết nối tài khoản", icon: PlugsConnected },
  { href: "/settings", label: "Cài đặt", icon: Gear },
];

const adAccounts = [
  { name: "BM 01 - Chính", status: "Hoạt động", active: true },
  { name: "BM 02 - Dự phòng", status: "Hoạt động", active: true },
  { name: "BM 03 - Test", status: "Tạm dừng", active: false },
];

export default function Sidebar() {
  const pathname = usePathname();

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

        {/* Ad Accounts */}
        <div className="px-5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            TÀI KHOẢN QUẢNG CÁO
          </h3>
          <div className="flex flex-col gap-3">
            {adAccounts.map((acc, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="mt-0.5">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px]">
                    {idx + 1}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-200">{acc.name}</span>
                  <span
                    className={`text-xs flex items-center gap-1 ${
                      acc.active ? "text-green-500" : "text-gray-500"
                    }`}
                  >
                    {acc.active ? (
                      <CheckCircle size={12} weight="fill" />
                    ) : (
                      <PauseCircle size={12} weight="fill" />
                    )}
                    {acc.status}
                  </span>
                </div>
              </div>
            ))}
            
            <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mt-2">
              <span className="text-lg leading-none">+</span> Thêm tài khoản
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer / Version */}
      <div className="p-4 text-xs text-gray-600 border-t border-[#1f2937]">
        Phiên bản 1.0.0
      </div>
    </div>
  );
}
