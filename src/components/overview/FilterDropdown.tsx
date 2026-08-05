"use client";

import { useRef, useState, useEffect } from "react";
import {
  CaretDown, FacebookLogo, TiktokLogo, YoutubeLogo, InstagramLogo, GoogleLogo, ChatCircleDots,
} from "@phosphor-icons/react";

export type FilterPill = { id: string; label: string; platform?: string | null };

// Icon theo nền tảng của kênh — giúp phân biệt các kênh trùng tên khác nền tảng
// (vd "Nhạn Nhạn - Xưởng Đồ Da" có cả bản FACEBOOK, TIKTOK, INSTAGRAM, YOUTUBE).
function PlatformIcon({ platform }: { platform?: string | null }) {
  const p = String(platform || "").toUpperCase();
  const cls = "shrink-0";
  if (p === "FACEBOOK" || p === "META") return <FacebookLogo size={13} weight="fill" className={`${cls} text-[#1877F2]`} />;
  if (p === "TIKTOK") return <TiktokLogo size={13} weight="fill" className={`${cls} text-foreground`} />;
  if (p === "YOUTUBE") return <YoutubeLogo size={13} weight="fill" className={`${cls} text-[#FF0000]`} />;
  if (p === "INSTAGRAM") return <InstagramLogo size={13} weight="fill" className={`${cls} text-[#E1306C]`} />;
  if (p === "GOOGLE") return <GoogleLogo size={13} weight="fill" className={`${cls} text-[#4285F4]`} />;
  if (p === "ZALO" || p === "THREADS") return <ChatCircleDots size={13} weight="fill" className={`${cls} text-muted-foreground`} />;
  return null;
}

type FilterDropdownProps = {
  label: string;
  items: FilterPill[];
  value: string;
  onChange: (v: string) => void;
  searchable?: boolean;
};

// Dropdown lọc gọn: nút hiển thị nhãn (truncate), panel cố định chiều rộng + cuộn dọc,
// có ô tìm kiếm tuỳ chọn — tránh tràn danh sách khi có nhiều mục.
export default function FilterDropdown({ label, items, value, onChange, searchable = false }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOpt = items.find((item) => item.id === value);
  const displayLabel = selectedOpt ? selectedOpt.label : "Tất cả";

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch("");
        }}
        className="flex items-center gap-1.5 bg-background border border-border hover:bg-card hover:border-border/80 transition-colors rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer text-left select-none max-w-[240px] shadow-sm"
      >
        <span className="text-muted-foreground font-medium shrink-0">{label}</span>
        {selectedOpt && <PlatformIcon platform={selectedOpt.platform} />}
        <span className="font-semibold truncate max-w-[130px]" title={displayLabel}>{displayLabel}</span>
        <CaretDown size={10} className="text-muted-foreground shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 z-50 min-w-[200px] max-w-[280px] bg-card border border-border rounded-lg shadow-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {searchable && (
            <div className="p-2 border-b border-border bg-background/50">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Tìm ${label.replace(":", "").toLowerCase()}...`}
                className="w-full bg-card border border-border rounded px-2 py-1.5 text-xs text-foreground outline-none focus:border-blue-500"
              />
            </div>
          )}
          <div className="max-h-48 overflow-y-auto p-1 divide-y divide-border/20 scrollbar-thin">
            <button
              type="button"
              onClick={() => {
                onChange("ALL");
                setIsOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 text-xs rounded transition-colors ${
                value === "ALL"
                  ? "bg-blue-600/20 text-blue-400 font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Tất cả
            </button>
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onChange(item.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 text-xs rounded transition-colors flex items-center gap-1.5 ${
                  value === item.id
                    ? "bg-blue-600/20 text-blue-400 font-semibold"
                    : "text-foreground hover:bg-muted"
                }`}
                title={item.label}
              >
                <PlatformIcon platform={item.platform} />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="p-3 text-center text-xs text-muted-foreground">Không tìm thấy</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
