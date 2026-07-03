"use client";

import {
  MagnifyingGlass,
  ArrowsClockwise,
  CloudArrowDown,
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

type FilterSelectProps = {
  label: string;
  items: FilterPill[];
  value: string;
  onChange: (v: string) => void;
};

function FilterSelect({ label, items, value, onChange }: FilterSelectProps) {
  return (
    <div className="flex items-center gap-1.5 bg-background border border-border hover:bg-card transition-colors rounded-lg px-3 py-2 text-xs">
      <span className="text-muted-foreground font-medium shrink-0">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-foreground outline-none cursor-pointer font-medium pr-1 appearance-none"
      >
        <option value="ALL">Tất cả</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
      <CaretDown size={12} className="text-muted-foreground shrink-0 pointer-events-none" />
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

const DATE_OPTIONS = [
  { id: "today", label: "Hôm nay" },
  { id: "yesterday", label: "Hôm qua" },
  { id: "last7days", label: "7 ngày" },
  { id: "last30days", label: "30 ngày" },
  { id: "thisMonth", label: "Tháng này" },
  { id: "lastMonth", label: "Tháng trước" },
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
  status: string;
  objective: string;
  dateRange: string;
  staff: string;
  accountId: string;
  accounts?: { id: string; name: string | null; platform: string }[];
  onPlatformChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onObjectiveChange: (v: string) => void;
  onDateRangeChange: (v: string) => void;
  onStaffChange: (v: string) => void;
  onAccountIdChange: (v: string) => void;
  kpis?: KpiItem[];
  onRefresh?: () => void;
  onSync?: () => void;
  onExport?: () => void;
  refreshing?: boolean;
  syncing?: boolean;
  showKpis?: boolean;
};

export default function OverviewHeader({
  search,
  onSearchChange,
  platform,
  status,
  objective,
  dateRange,
  staff,
  accountId,
  accounts = [],
  onPlatformChange,
  onStatusChange,
  onObjectiveChange,
  onDateRangeChange,
  onStaffChange,
  onAccountIdChange,
  kpis = [],
  onRefresh,
  onSync,
  onExport,
  refreshing,
  syncing,
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
        <FilterSelect label="Kênh:" items={CHANNELS} value={platform} onChange={onPlatformChange} />
        <FilterSelect label="Tài khoản:" items={filteredAccountPills} value={accountId} onChange={onAccountIdChange} />
        <FilterSelect label="Trạng thái:" items={STATUSES} value={status} onChange={onStatusChange} />
        <FilterSelect label="Mục tiêu:" items={OBJECTIVES} value={objective} onChange={onObjectiveChange} />
        <FilterSelect label="Nhân viên:" items={STAFFS} value={staff} onChange={onStaffChange} />

        {/* Bên phải: khoảng thời gian + hành động */}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 text-xs">
            <CalendarBlank size={14} className="text-blue-400 shrink-0" />
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value)}
              className="bg-background text-foreground outline-none cursor-pointer font-medium"
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
            onClick={onSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
          >
            {syncing ? (
              <SpinnerGap size={16} className="animate-spin" />
            ) : (
              <CloudArrowDown size={16} />
            )}
            Đồng bộ dữ liệu
          </button>
          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-foreground text-sm font-medium rounded-lg transition-colors"
          >
            <Download size={16} />
            Xuất Excel
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-background border border-border hover:bg-card text-foreground text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
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
