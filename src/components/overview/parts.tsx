"use client";

import { CaretUp, CaretDown, type Icon } from "@phosphor-icons/react";
import { CHANNEL_STYLE, type CampaignStatus } from "./dashboardData";

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
    <div className={`bg-background border border-border rounded-xl ${className}`}>
      {(title || right) && (
        <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-2">
          <div>
            {title && <h3 className="text-sm font-semibold text-foreground leading-tight">{title}</h3>}
            {subtitle && <p className="text-[14px] text-muted-foreground mt-0.5">{subtitle}</p>}
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
  const a = align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";
  const thAlign = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <th className={`px-3 py-2.5 font-medium text-muted-foreground whitespace-nowrap ${thAlign} ${className}`}>
      <div className={`flex items-center gap-1 ${a} w-full`}>
        {children}
        <span className="flex flex-col -space-y-1 text-muted-foreground">
          <CaretUp size={8} weight="fill" />
          <CaretDown size={8} weight="fill" />
        </span>
      </div>
    </th>
  );
}

// BE trả status theo nền tảng (ACTIVE/ENABLE/PAUSED/...), không phải nhãn tiếng Việt.
// Trước đây prop khai kiểu CampaignStatus nhưng thực tế nhận chuỗi thô, nên tra bảng màu
// luôn trượt và pill hiện chữ "ACTIVE" không màu. Chuẩn hoá tại đây.
const STATUS_LABEL: Record<string, CampaignStatus> = {
  ACTIVE: "Đang chạy",
  ENABLE: "Đang chạy",
  RUNNING: "Đang chạy",
  PAUSED: "Tạm dừng",
  DISABLE: "Tạm dừng",
  ARCHIVED: "Kết thúc",
  COMPLETED: "Kết thúc",
  DELETED: "Kết thúc",
};

export function normalizeStatus(status: string): CampaignStatus | null {
  if (!status) return null;
  const s = status.toUpperCase();
  if (STATUS_LABEL[s]) return STATUS_LABEL[s];
  // Đã là nhãn tiếng Việt sẵn (dữ liệu mẫu / chỗ gọi khác).
  if (status === "Đang chạy" || status === "Tạm dừng" || status === "Kết thúc") return status;
  return null;
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<CampaignStatus, string> = {
    "Đang chạy": "text-green-400",
    "Tạm dừng": "text-amber-400",
    "Kết thúc": "text-muted-foreground",
  };
  const dot: Record<CampaignStatus, string> = {
    "Đang chạy": "bg-green-400",
    "Tạm dừng": "bg-amber-400",
    "Kết thúc": "bg-muted",
  };
  const label = normalizeStatus(status);
  // Không nhận diện được thì hiện nguyên trạng thái thô, màu trung tính — vẫn đọc được
  // thay vì mất màu im lặng.
  if (!label) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span className="w-1.5 h-1.5 rounded-full bg-muted" />
        {status || "—"}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${map[label]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[label]}`} />
      {label}
    </span>
  );
}

// deriveChannel ở BE trả "Messenger" / "Facebook Feed" / "Facebook Page Likes" /
// "Instagram" / "TikTok Ads" — không phải union Channel, nên CHANNEL_STYLE luôn trượt
// và chip mất màu. Quy về nền tảng gốc để lấy màu, vẫn hiện nguyên nhãn chi tiết.
function channelStyleOf(channel: string): string {
  const c = (channel || "").toLowerCase();
  if (c.includes("tiktok")) return CHANNEL_STYLE.TikTok;
  if (c.includes("google") || c.includes("youtube")) return CHANNEL_STYLE.Google;
  if (c.includes("zalo")) return CHANNEL_STYLE.Zalo;
  if (c.includes("facebook") || c.includes("messenger") || c.includes("instagram")) {
    return CHANNEL_STYLE.Facebook;
  }
  return "text-muted-foreground";
}

export function ChannelChip({ channel }: { channel: string }) {
  return <span className={`text-xs font-medium ${channelStyleOf(channel)}`}>{channel}</span>;
}

// Chip % thay đổi (xanh tăng / đỏ giảm) cho thẻ KPI.
export function ChangeChip({ change }: { change: number }) {
  const up = change >= 0;
  return (
    <span className={`flex items-center gap-0.5 text-[14px] font-semibold shrink-0 ${up ? "text-green-500" : "text-red-500"}`}>
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
      <span className="w-10 h-1.5 rounded-full bg-card overflow-hidden">
        <span className={`block h-full rounded-full ${color}`} style={{ width: `${(score / 10) * 100}%` }} />
      </span>
      <span className={`font-semibold ${text}`}>{score.toFixed(1)}</span>
    </span>
  );
}

export type { Icon };
