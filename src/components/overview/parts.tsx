"use client";

import { CaretUp, CaretDown, type Icon } from "@phosphor-icons/react";
import { CHANNEL_STYLE, type Channel, type CampaignStatus } from "./dashboardData";

// Panel nền tối dùng chung cho mọi khối của dashboard.
export function Panel({
  title,
  subtitle,
  right,
  children,
  className = "",
  bodyClassName = "p-5",
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={`bg-[#0f172a] border border-[#1e293b] rounded-xl ${className}`}>
      {(title || right) && (
        <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-2">
          <div>
            {title && <h3 className="text-sm font-semibold text-white leading-tight">{title}</h3>}
            {subtitle && <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}

// Tiêu đề cột có icon sắp xếp (chỉ trang trí, khớp thiết kế).
export function Th({
  children,
  align = "left",
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  const a = align === "right" ? "text-right justify-end" : align === "center" ? "text-center justify-center" : "text-left";
  return (
    <th className={`px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap ${className}`}>
      <span className={`inline-flex items-center gap-1 ${a}`}>
        {children}
        <span className="flex flex-col -space-y-1 text-gray-600">
          <CaretUp size={8} weight="fill" />
          <CaretDown size={8} weight="fill" />
        </span>
      </span>
    </th>
  );
}

export function StatusPill({ status }: { status: CampaignStatus }) {
  const map: Record<CampaignStatus, string> = {
    "Đang chạy": "text-green-400",
    "Tạm dừng": "text-amber-400",
    "Kết thúc": "text-gray-500",
  };
  const dot: Record<CampaignStatus, string> = {
    "Đang chạy": "bg-green-400",
    "Tạm dừng": "bg-amber-400",
    "Kết thúc": "bg-gray-500",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${map[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`} />
      {status}
    </span>
  );
}

export function ChannelChip({ channel }: { channel: Channel }) {
  return <span className={`text-xs font-medium ${CHANNEL_STYLE[channel]}`}>{channel}</span>;
}

// Chip % thay đổi (xanh tăng / đỏ giảm) cho thẻ KPI.
export function ChangeChip({ change }: { change: number }) {
  const up = change >= 0;
  return (
    <span className={`flex items-center gap-0.5 text-[11px] font-semibold shrink-0 ${up ? "text-green-500" : "text-red-500"}`}>
      {up ? <CaretUp size={10} weight="bold" /> : <CaretDown size={10} weight="bold" />}
      {Math.abs(change).toFixed(1)}%
    </span>
  );
}

// Thanh điểm Relevance Score (1-10) trong bảng creative.
export function ScoreBar({ score }: { score: number }) {
  const color = score >= 8.5 ? "bg-green-500" : score >= 7.5 ? "bg-amber-500" : "bg-orange-500";
  const text = score >= 8.5 ? "text-green-400" : score >= 7.5 ? "text-amber-400" : "text-orange-400";
  return (
    <span className="inline-flex items-center gap-2 justify-end">
      <span className="w-10 h-1.5 rounded-full bg-[#1e293b] overflow-hidden">
        <span className={`block h-full rounded-full ${color}`} style={{ width: `${(score / 10) * 100}%` }} />
      </span>
      <span className={`font-semibold ${text}`}>{score.toFixed(1)}</span>
    </span>
  );
}

export type { Icon };
