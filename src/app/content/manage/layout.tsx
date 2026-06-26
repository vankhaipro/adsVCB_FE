"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import {
  CaretDown,
  FacebookLogo,
  TiktokLogo,
  YoutubeLogo,
  CloudArrowDown,
  ChartPie
} from "@phosphor-icons/react";

const options = [
  { id: "overview", label: "Tổng quan", href: "/content/manage/overview", icon: ChartPie },
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
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((o) => pathname === o.href || pathname.startsWith(o.href + "/")) || options[0];

  function handleSelect(href: string) {
    router.push(href);
    setIsOpen(false);
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-full overflow-x-hidden pb-10 text-gray-200">
      {/* Header and Dropdown Selector */}
      <div className="border-b border-[#1e293b] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>Quản lý content</span>
            {selectedOption.id !== "overview" && (
              <span className="text-sm font-normal px-2.5 py-0.5 rounded-full bg-[#1f2937] text-blue-400 border border-blue-500/20">
                {selectedOption.label}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Quản lý nội dung organic: kênh, video, lịch đăng và phân công nhân sự.
          </p>
        </div>

        {/* Custom Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#111827] border border-[#1f2937] hover:border-blue-500 rounded-lg text-sm text-gray-200 min-w-[220px] transition-all duration-200 cursor-pointer shadow-lg hover:shadow-blue-500/5 focus:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <selectedOption.icon size={18} className="text-blue-500" />
              <span className="font-semibold text-white">{selectedOption.label}</span>
            </div>
            <CaretDown
              size={14}
              className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-[220px] bg-[#111827] border border-[#1f2937] rounded-lg shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {options.map((option) => {
                const isActive = selectedOption.id === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option.href)}
                    className={`w-[calc(100%-12px)] mx-1.5 flex items-center px-3 py-2.5 rounded-md text-sm text-left transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-[#1f2937] text-[#3b82f6] font-semibold"
                        : "text-gray-400 hover:text-white hover:bg-[#1f2937]/50"
                    }`}
                  >
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Page contents */}
      {children}
    </div>
  );
}
