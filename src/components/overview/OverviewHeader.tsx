"use client";

import {
  MagnifyingGlass,
  ArrowsClockwise,
  Download,
  CaretUp,
  CaretDown,
  SpinnerGap,
  CalendarBlank,
  type Icon,
} from "@phosphor-icons/react";

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

type PillGroupProps = {
  label: string;
  items: FilterPill[];
  value: string;
  onChange: (v: string) => void;
};

function PillGroup({ label, items, value, onChange }: PillGroupProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-500 font-medium shrink-0">{label}</span>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(value === item.id ? "ALL" : item.id)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            value === item.id
              ? "bg-blue-600 text-white"
              : "bg-[#1e293b] text-gray-400 hover:bg-[#334155]"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function KpiCard({ label, value, sub, change, icon: Icon, iconColor, iconBg }: KpiItem) {
  const hasChange = change !== undefined;
  const up = (change ?? 0) >= 0;

  return (
    <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-4 flex flex-col gap-2 min-w-0">
      <div className="flex items-start justify-between gap-1">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon size={16} className={iconColor} weight="duotone" />
        </div>
        {hasChange && (
          <span
            className={`flex items-center gap-0.5 text-[11px] font-semibold shrink-0 ${
              up ? "text-green-600" : "text-red-500"
            }`}
          >
            {up ? <CaretUp size={10} weight="bold" /> : <CaretDown size={10} weight="bold" />}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-white leading-tight truncate">{value}</p>
        {sub && <p className="text-[10px] text-gray-400 truncate">{sub}</p>}
        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{label}</p>
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

const DATE_OPTIONS = [
  { id: "today", label: "Hôm nay" },
  { id: "yesterday", label: "Hôm qua" },
  { id: "last7days", label: "7 ngày" },
  { id: "last30days", label: "30 ngày" },
  { id: "thisMonth", label: "Tháng này" },
  { id: "lastMonth", label: "Tháng trước" },
];

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  platform: string;
  status: string;
  objective: string;
  dateRange: string;
  onPlatformChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onObjectiveChange: (v: string) => void;
  onDateRangeChange: (v: string) => void;
  kpis?: KpiItem[];
  onRefresh?: () => void;
  onExport?: () => void;
  refreshing?: boolean;
  showKpis?: boolean;
};

export default function OverviewHeader({
  search,
  onSearchChange,
  platform,
  status,
  objective,
  dateRange,
  onPlatformChange,
  onStatusChange,
  onObjectiveChange,
  onDateRangeChange,
  kpis = [],
  onRefresh,
  onExport,
  refreshing,
  showKpis = true,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar — một hàng gọn, nằm trực tiếp trên nền trang */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {/* Tìm kiếm */}
        <div className="flex items-center gap-2 bg-[#0f172a] border border-[#1e293b] rounded-lg px-3 py-2 min-w-[200px] flex-1 max-w-[260px]">
          <MagnifyingGlass size={16} className="text-gray-500 shrink-0" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm chiến dịch, mã..."
            className="bg-transparent text-sm text-gray-200 outline-none w-full placeholder:text-gray-500"
          />
        </div>

        {/* Nhóm bộ lọc inline */}
        <PillGroup label="Kênh:" items={CHANNELS} value={platform} onChange={onPlatformChange} />
        <PillGroup label="Trạng thái:" items={STATUSES} value={status} onChange={onStatusChange} />
        <PillGroup label="Mục tiêu:" items={OBJECTIVES} value={objective} onChange={onObjectiveChange} />

        {/* Bên phải: khoảng thời gian + hành động */}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#0f172a] border border-[#1e293b] rounded-lg px-3 py-2 text-xs">
            <CalendarBlank size={14} className="text-blue-400 shrink-0" />
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value)}
              className="bg-[#0f172a] text-gray-200 outline-none cursor-pointer font-medium"
            >
              {DATE_OPTIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Download size={16} />
            Xuất Excel
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] border border-[#1e293b] hover:bg-[#1e293b] text-gray-200 text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
          >
            {refreshing ? (
              <SpinnerGap size={16} className="animate-spin" />
            ) : (
              <ArrowsClockwise size={16} />
            )}
            Làm mới
          </button>
        </div>
      </div>

      {showKpis && kpis.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
          {kpis.map((kpi, i) => (
            <KpiCard key={i} {...kpi} />
          ))}
        </div>
      )}
    </div>
  );
}
