"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import {
  FacebookLogo,
  TiktokLogo,
  YoutubeLogo,
  CloudArrowDown,
  MagnifyingGlass,
  Funnel
} from "@phosphor-icons/react";

const options = [
  { id: "meta", label: "Meta Content", href: "/content/manage/meta", icon: FacebookLogo },
  { id: "tiktok", label: "Tiktok Content", href: "/content/manage/tiktok", icon: TiktokLogo },
  { id: "youtube", label: "Youtube Content", href: "/content/manage/youtube", icon: YoutubeLogo },
  { id: "sourcing", label: "Sourcing Content", href: "/content/manage/sourcing", icon: CloudArrowDown },
];

export default function ContentManageLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-500 py-20">Đang tải bố cục trang...</div>}>
      <ContentManageLayoutContent>{children}</ContentManageLayoutContent>
    </Suspense>
  );
}

function ContentManageLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const selectedOption = options.find((o) => pathname === o.href || pathname.startsWith(o.href + "/")) || options[0];

  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-x-hidden pb-10 text-gray-200">
      {/* Header Title and Description */}
      <div>
        <h1 className="text-2xl font-bold text-white">Quản lý content</h1>
        <p className="text-sm text-gray-400 mt-1">
          Quản lý nội dung organic: kênh, video, lịch đăng và phân công nhân sự.
        </p>
      </div>

      {/* Horizontal Tabs with Underline Indicator & Search/Filter on the right */}
      <div className="border-b border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Tabs */}
        <div className="flex items-center gap-8">
          {options.map((option) => {
            const isActive = selectedOption.id === option.id;
            const Icon = option.icon;
            return (
              <Link
                key={option.id}
                href={option.href}
                className={`flex items-center gap-2 pb-3 text-xs font-semibold relative transition-all duration-200 cursor-pointer ${
                  isActive ? "text-[#3b82f6]" : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon size={14} className={isActive ? "text-[#3b82f6]" : "text-gray-500"} />
                <span>{option.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3b82f6]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Side: Search & Filter (Hide on sourcing content page) */}
        {selectedOption.id !== "sourcing" && (
          <div className="flex items-center gap-2 pb-2">
            <div className="relative">
              <input
                type="text"
                placeholder={
                  selectedOption.id === "meta"
                    ? "Tìm kiếm bài viết..."
                    : selectedOption.id === "tiktok"
                    ? "Tìm kiếm video TikTok..."
                    : "Tìm kiếm video YouTube..."
                }
                className="bg-[#111827] border border-[#1f2937] hover:border-gray-700 rounded-lg px-3 py-1.5 pl-9 text-xs focus:border-blue-500 focus:outline-none w-[200px] text-white"
              />
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] rounded-lg text-xs text-gray-300 cursor-pointer">
              <Funnel size={14} />
              Bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Page contents */}
      {children}
    </div>
  );
}
