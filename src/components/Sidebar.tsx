"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  House,
  Megaphone,
  GitBranch,
  CurrencyCircleDollar,
  ChartBar,
  Warning,
  Scroll,
  UserRectangle,
  Gear,
  SignOut,
  Broadcast,
  CaretDown,
  type Icon,
} from "@phosphor-icons/react";

type NavLeaf = { href: string; label: string; icon: Icon };
type NavParent = { label: string; icon: Icon; children: { href: string; label: string }[] };
type NavItem = NavLeaf | NavParent;

const mainNav: NavItem[] = [
  {
    label: "Tổng quan",
    icon: House,
    children: [
      { href: "/", label: "Tổng quan ads" },
      { href: "/content/overview", label: "Tổng quan content" },
    ],
  },
  
  {
    label: "Quản lý",
    icon: Megaphone,
    children: [
      { href: "/campaigns", label: "Quản lý ads" },
      { href: "/content/manage", label: "Quản lý content" },
    ],
  },
  { href: "/auto-rules", label: "Quy tắc tự động", icon: GitBranch },
  { href: "/budget", label: "Ngân sách", icon: CurrencyCircleDollar },
  { href: "/reports", label: "Báo cáo", icon: ChartBar },
  { href: "/alerts", label: "Cảnh báo", icon: Warning },
  { href: "/logs", label: "Nhật ký hệ thống", icon: Scroll },
  { href: "/ad-accounts", label: "Tài khoản quảng cáo", icon: UserRectangle },
  { href: "/channels", label: "Kênh organic", icon: Broadcast },
  { href: "/settings", label: "Cài đặt", icon: Gear },
];

// "/" chỉ active khi đúng trang chủ; các route khác active cả khi ở route con.
function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Mở sẵn menu cha đang chứa route hiện tại.
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const item of mainNav) {
      if ("children" in item) {
        init[item.label] = item.children.some((c) => isActive(c.href, pathname));
      }
    }
    return init;
  });

  function toggle(label: string) {
    setOpen((prev) => ({ ...prev, [label]: !prev[label] }));
  }

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
            const Icon = item.icon;

            // Menu cha có dropdown
            if ("children" in item) {
              const isOpen = open[item.label];
              const parentActive = item.children.some((c) => isActive(c.href, pathname));
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggle(item.label)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      parentActive
                        ? "text-white font-medium"
                        : "text-gray-400 hover:text-white hover:bg-[#1f2937]"
                    }`}
                  >
                    <Icon size={16} weight={parentActive ? "fill" : "regular"} />
                    {item.label}
                    <CaretDown
                      size={14}
                      className={`ml-auto transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="mt-1 ml-4 flex flex-col gap-1 border-l border-[#1f2937] pl-3">
                      {item.children.map((child) => {
                        const childActive = isActive(child.href, pathname);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                              childActive
                                ? "bg-[#1f2937] text-white font-medium"
                                : "text-gray-400 hover:text-white hover:bg-[#1f2937]"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                childActive ? "bg-blue-500" : "bg-gray-600"
                              }`}
                            />
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Mục đơn (không có dropdown)
            const active = isActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-[#1f2937] text-white font-medium"
                    : "text-gray-400 hover:text-white hover:bg-[#1f2937]"
                }`}
              >
                <Icon size={16} weight={active ? "fill" : "regular"} />
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
