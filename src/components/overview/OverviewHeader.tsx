"use client";

import { useRef, useState, useEffect } from "react";
import {
  MagnifyingGlass,
  Download,
  CaretUp,
  CaretDown,
  type Icon,
} from "@phosphor-icons/react";
import DateRangePicker from "@/components/DateRangePicker";

export type FilterPill = { id: string; label: string };

export type KpiItem = {
  label: string;
  value: string;
  sub?: string;
  change?: number;
  icon: Icon;
  iconColor: string;
  iconBg: string;
};

type FilterDropdownProps = {
  label: string;
  items: FilterPill[];
  value: string;
  onChange: (v: string) => void;
  searchable?: boolean;
};

function FilterDropdown({ label, items, value, onChange, searchable = false }: FilterDropdownProps) {
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
                className={`w-full text-left px-2.5 py-1.5 text-xs rounded transition-colors truncate ${
                  value === item.id 
                    ? "bg-blue-600/20 text-blue-400 font-semibold" 
                    : "text-foreground hover:bg-muted"
                }`}
                title={item.label}
              >
                {item.label}
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

function KpiCard({ label, value, sub, change, icon: Icon, iconColor, iconBg }: KpiItem) {
  const hasChange = change !== undefined;
  const up = (change ?? 0) >= 0;

  return (
    <div className="bg-background rounded-xl border border-border p-4 flex flex-col gap-2 min-w-0">
      <div className="flex items-start justify-between gap-1">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon size={16} className={iconColor} weight="duotone" />
        </div>
        {hasChange && (
          <span
            className={`flex items-center gap-0.5 text-[16px] font-semibold shrink-0 ${
              up ? "text-green-600" : "text-red-500"
            }`}
          >
            {up ? <CaretUp size={10} weight="bold" /> : <CaretDown size={10} weight="bold" />}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-foreground leading-tight truncate">{value}</p>
        {sub && <p className="text-[15px] text-muted-foreground truncate">{sub}</p>}
        <p className="text-[16px] text-muted-foreground mt-0.5 leading-snug">{label}</p>
      </div>
    </div>
  );
}

const CHANNELS: FilterPill[] = [
  { id: "META", label: "Facebook" },
  { id: "TIKTOK", label: "TikTok" },
  { id: "GOOGLE", label: "Google" },
  { id: "ZALO", label: "Zalo" },
];

const STATUSES: FilterPill[] = [
  { id: "ACTIVE", label: "Đang chạy" },
  { id: "PAUSED", label: "Tạm dừng" },
  { id: "ENDED", label: "Kết thúc" },
];

const OBJECTIVES: FilterPill[] = [
  { id: "CONV", label: "Chuyển đổi" },
  { id: "LIKES", label: "Nhận thức" },
  { id: "MESS", label: "Traffic" },
];

const STAFFS: FilterPill[] = [
  { id: "Việt", label: "Việt" },
  { id: "Thành", label: "Thành" },
  { id: "Ngọc", label: "Ngọc" },
  { id: "Cương", label: "Cương" },
  { id: "Khác", label: "Khác" },
];

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  platform: string;
  pageName: string;
  status: string;
  objective: string;
  dateRange: string;
  dateFrom: string;
  dateTo: string;
  staff: string;
  accountId: string;
  accounts?: { id: string; name: string | null; platform: string }[];
  staffs?: FilterPill[];
  organicChannels?: FilterPill[];
  onPlatformChange: (v: string) => void;
  onPageNameChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onObjectiveChange: (v: string) => void;
  onDateApply: (v: { presetId: string; from: string; to: string }) => void;
  onStaffChange: (v: string) => void;
  onAccountIdChange: (v: string) => void;
  kpis?: KpiItem[];
  onExport?: () => void;
  showKpis?: boolean;
};

export default function OverviewHeader({
  search,
  onSearchChange,
  platform,
  pageName,
  status,
  objective,
  dateRange,
  dateFrom,
  dateTo,
  staff,
  accountId,
  accounts = [],
  staffs = [],
  organicChannels = [],
  onPlatformChange,
  onPageNameChange,
  onStatusChange,
  onObjectiveChange,
  onDateApply,
  onStaffChange,
  onAccountIdChange,
  kpis = [],
  onExport,
  showKpis = true,
}: Props) {
  const filteredAccountPills = accounts
    .filter((a) => platform === "ALL" || a.platform === platform)
    .map((a) => ({ id: a.id, label: a.name || a.id }));

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar — một hàng gọn, nằm trực tiếp trên nền trang */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {/* Tìm kiếm */}
        <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 min-w-[200px] flex-1 max-w-[260px]">
          <MagnifyingGlass size={16} className="text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm chiến dịch, mã..."
            className="bg-transparent text-sm text-foreground outline-none w-full placeholder:text-muted-foreground"
          />
        </div>

        {/* Nhóm bộ lọc dạng Select (Compact) */}
        <FilterDropdown label="Nền tảng:" items={CHANNELS} value={platform} onChange={onPlatformChange} searchable={false} />
        <FilterDropdown label="Kênh:" items={organicChannels} value={pageName} onChange={onPageNameChange} searchable={true} />
        
        <DateRangePicker
          presetId={dateRange}
          from={dateFrom}
          to={dateTo}
          onApply={onDateApply}
        />

        <FilterDropdown label="Tài khoản:" items={filteredAccountPills} value={accountId} onChange={onAccountIdChange} searchable={true} />
        <FilterDropdown label="Trạng thái:" items={STATUSES} value={status} onChange={onStatusChange} searchable={false} />
        <FilterDropdown label="Mục tiêu:" items={OBJECTIVES} value={objective} onChange={onObjectiveChange} searchable={false} />
        <FilterDropdown label="Nhân viên:" items={staffs.length > 0 ? staffs : STAFFS} value={staff} onChange={onStaffChange} searchable={true} />

        {/* Bên phải: hành động */}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-foreground text-sm font-medium rounded-lg transition-colors"
          >
            <Download size={16} />
            Xuất Excel
          </button>
        </div>
      </div>

      {showKpis && kpis.length > 0 && (
        <div className={kpis.length === 6 
          ? "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3" 
          : "grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3"
        }>
          {kpis.map((kpi, i) => (
            <KpiCard key={i} {...kpi} />
          ))}
        </div>
      )}
    </div>
  );
}
