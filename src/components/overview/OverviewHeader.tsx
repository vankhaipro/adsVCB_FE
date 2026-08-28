"use client";

import {
  Download,
  CaretUp,
  CaretDown,
  type Icon,
} from "@phosphor-icons/react";
import DateRangePicker from "@/components/DateRangePicker";
import FilterDropdown, { type FilterPill } from "./FilterDropdown";

export type { FilterPill };

export type KpiItem = {
  label: string;
  value: string;
  sub?: string;
  change?: number;
  icon: Icon;
  iconColor: string;
  iconBg: string;
};

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
            className={`flex items-center gap-0.5 text-[14px] font-semibold shrink-0 ${
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
        {sub && <p className="text-[13px] text-muted-foreground truncate">{sub}</p>}
        <p className="text-[14px] text-muted-foreground mt-0.5 leading-snug">{label}</p>
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

// Nhãn phải khớp đúng nghĩa của id — trước đây LIKES ghi là "Nhận thức" và MESS ghi là
// "Traffic", trong khi backend deriveObjective() sinh MESS từ tên có "Mess" và LIKES từ
// "Like page". Chỉ đổi chuỗi hiển thị, id giữ nguyên nên hành vi lọc không đổi.
const OBJECTIVES: FilterPill[] = [
  { id: "MESS", label: "Mess" },
  { id: "LIKES", label: "Like page" },
  { id: "CONV", label: "Còn lại" },
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
  teamOptions?: FilterPill[];
  team?: string;
  organicChannels?: FilterPill[];
  onPlatformChange: (v: string) => void;
  onPageNameChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onObjectiveChange: (v: string) => void;
  onDateApply: (v: { presetId: string; from: string; to: string }) => void;
  onStaffChange: (v: string) => void;
  onTeamChange?: (v: string) => void;
  onAccountIdChange: (v: string) => void;
  kpis?: KpiItem[];
  onExport?: () => void;
  showKpis?: boolean;
};

export default function OverviewHeader({
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
  teamOptions = [],
  team = "ALL",
  organicChannels = [],
  onPlatformChange,
  onPageNameChange,
  onStatusChange,
  onObjectiveChange,
  onDateApply,
  onStaffChange,
  onTeamChange,
  onAccountIdChange,
  kpis = [],
  onExport,
  showKpis = true,
}: Props) {
  const filteredAccountPills = accounts
    .filter((a) => platform === "ALL" || a.platform === platform)
    .map((a) => ({ id: a.id, label: a.name || a.id }));

  return (
    <div className="flex flex-col gap-4" suppressHydrationWarning>
      {/* Filter bar — một hàng gọn, nằm trực tiếp trên nền trang */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3" suppressHydrationWarning>

        {/* Nhóm bộ lọc dạng Select (Compact) */}
        <FilterDropdown label="Nền tảng:" items={CHANNELS} value={platform} onChange={onPlatformChange} searchable={false} />
        <FilterDropdown label="Kênh:" items={organicChannels} value={pageName} onChange={onPageNameChange} searchable={true} />
        {onTeamChange && (
          <FilterDropdown label="Team:" items={teamOptions} value={team} onChange={onTeamChange} searchable={false} />
        )}
        
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
