"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
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

type NavSubChild = { href: string; label: string };
type NavChild = { href: string; label: string } | { label: string; children: NavSubChild[] };
type NavParent = { label: string; icon: Icon; children: NavChild[] };
type NavLeaf = { href: string; label: string; icon: Icon };
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
      { href: "/content/manage/meta", label: "Quản lý content" },
    ],
  },
  { href: "/auto-rules", label: "Quy tắc tự động", icon: GitBranch },
  { href: "/reports", label: "Báo cáo", icon: ChartBar },
  { href: "/alerts", label: "Cảnh báo", icon: Warning },
  { href: "/logs", label: "Nhật ký hệ thống", icon: Scroll },
  { href: "/ad-accounts", label: "Tài khoản quảng cáo", icon: UserRectangle },
  { href: "/channels", label: "Kênh organic", icon: Broadcast },
  { href: "/settings", label: "Cài đặt", icon: Gear },
];

export default function Sidebar() {
  return (
    <Suspense fallback={<div className="w-[210px] h-full flex flex-col bg-card text-muted-foreground border-r border-border flex-shrink-0" />}>
      <SidebarContent />
    </Suspense>
  );
}

function SidebarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Helper to check if a specific link is active (matching pathname and search params)
  function isLinkActive(href: string) {
    try {
      const url = new URL(href, "http://localhost");
      const pathMatch = url.pathname === "/" 
        ? pathname === "/" 
        : pathname === url.pathname || pathname.startsWith(url.pathname + "/");
        
      if (!pathMatch) return false;
      
      let queryMatch = true;
      url.searchParams.forEach((value, key) => {
        const currentVal = searchParams.get(key);
        const compareVal = key === "tab" && !currentVal ? "overview" : currentVal;
        if (compareVal !== value) {
          queryMatch = false;
        }
      });
      
      return queryMatch;
    } catch {
      return false;
    }
  }

  // Recursive helper to check if item or any of its children are active
  function isItemActive(item: any): boolean {
    if (item.href) {
      return isLinkActive(item.href);
    }
    if (item.children) {
      return item.children.some((child: any) => isItemActive(child));
    }
    return false;
  }

  // Mở sẵn menu cha đang chứa route hiện tại.
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const item of mainNav) {
      if ("children" in item) {
        init[item.label] = item.children.some((c) => isItemActive(c));
        
        for (const child of item.children) {
          if ("children" in child) {
            init[child.label] = child.children.some((sc) => isLinkActive(sc.href));
          }
        }
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
    <div className="w-[210px] h-full flex flex-col bg-card text-foreground border-r border-border flex-shrink-0">
      {/* Logo */}
      <div className="h-[52px] flex items-center px-4 font-bold text-foreground text-[14px] whitespace-nowrap border-b border-border">
        <span className="relative w-6 h-6 mr-2 rounded-full overflow-hidden inline-flex flex-shrink-0">
          <img
            src="/logoN-VienChiBao.png"
            alt="VCB Ads Manager Logo"
            className="absolute max-w-none"
            style={{ width: "110px", height: "110px", left: "-12px", top: "-44px" }}
          />
        </span>
        VCB Ads Manager
      </div>

      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-6">
        {/* Main Nav */}
        <nav className="flex flex-col gap-1 px-2">
          {mainNav.map((item) => {
            const Icon = item.icon;

            // Menu cha có dropdown (Level 1)
            if ("children" in item) {
              const isOpen = open[item.label];
              const parentActive = item.children.some((c) => isItemActive(c));
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggle(item.label)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left cursor-pointer ${
                      parentActive
                        ? "text-foreground font-medium bg-muted/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
                    <div className="mt-1 ml-4 flex flex-col gap-1 border-l border-border pl-3">
                      {item.children.map((child) => {
                        // Nested Sub-dropdown (Level 2)
                        if ("children" in child) {
                          const isSubOpen = open[child.label];
                          const subActive = isItemActive(child);
                          return (
                            <div key={child.label} className="flex flex-col gap-1">
                              <button
                                onClick={() => toggle(child.label)}
                                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors text-left cursor-pointer ${
                                  subActive
                                    ? "text-foreground font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                    subActive ? "bg-blue-500" : "bg-muted"
                                  }`}
                                />
                                {child.label}
                                <CaretDown
                                  size={12}
                                  className={`ml-auto text-muted-foreground transition-transform ${
                                    isSubOpen ? "rotate-180" : ""
                                  }`}
                                />
                              </button>

                              {isSubOpen && (
                                <div className="mt-1 ml-3 flex flex-col gap-1 border-l border-border pl-3">
                                  {child.children.map((subChild) => {
                                    const subChildActive = isLinkActive(subChild.href);
                                    return (
                                      <Link
                                        key={subChild.href}
                                        href={subChild.href}
                                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                                          subChildActive
                                            ? "bg-muted/80 text-primary font-semibold"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                                        }`}
                                      >
                                        <span
                                          className={`w-1 h-1 rounded-full shrink-0 ${
                                            subChildActive ? "bg-blue-500" : "bg-muted"
                                          }`}
                                        />
                                        {subChild.label}
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }

                        // Normal Level 2 Item
                        const childActive = isLinkActive(child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                              childActive
                                ? "bg-muted text-foreground font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                childActive ? "bg-blue-500" : "bg-muted"
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

            // Mục đơn (Level 1 không có dropdown)
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
      <div className="p-4 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Phiên bản 1.0.0</span>
        <button
          id="logout-btn"
          onClick={handleLogout}
          title="Đăng xuất"
          className="text-muted-foreground hover:text-red-400 transition-colors"
        >
          <SignOut size={16} />
        </button>
      </div>
    </div>
  );
}
