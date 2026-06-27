"use client";

import { Download } from "@phosphor-icons/react";
import { Panel, Th, StatusPill, ChannelChip, ScoreBar } from "./parts";
import {
  CREATIVES, CREATIVE_TYPE_STYLE,
  fmtNum, fmtCompact,
} from "./dashboardData";

const dash = (v: number | null, fmt: (n: number) => string) => (v == null ? "—" : fmt(v));

const LEGEND: { label: string; color: string }[] = [
  { label: "Video", color: "#8b5cf6" },
  { label: "Image", color: "#3b82f6" },
  { label: "Carousel", color: "#10b981" },
  { label: "Banner", color: "#f59e0b" },
];

export default function CreativeTable() {
  return (
    <Panel
      title="Hiệu quả Creative / Mẫu quảng cáo"
      right={
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 text-[11px] text-muted-foreground">
            {LEGEND.map((l) => (
              <span key={l.label} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border hover:bg-muted text-foreground text-xs font-medium rounded-lg transition-colors">
            <Download size={14} /> Xuất
          </button>
        </div>
      }
      bodyClassName="px-0 pb-0"
    >
      <div className="px-5 -mt-1 mb-1">
        <span className="text-[11px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{CREATIVES.length} mẫu</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left whitespace-nowrap">
          <thead className="border-y border-border bg-card">
            <tr>
              <Th>Creative ID</Th>
              <Th>Tên mẫu</Th>
              <Th>Loại</Th>
              <Th>Định dạng</Th>
              <Th>Kênh</Th>
              <Th>Chiến dịch</Th>
              <Th>Trạng thái</Th>
              <Th align="right">Chi tiêu (K)</Th>
              <Th align="right">Hiển thị</Th>
              <Th align="right">Tiếp cận</Th>
              <Th align="right">Lượt nhấp</Th>
              <Th align="right">CTR</Th>
              <Th align="right">CPC (đ)</Th>
              <Th align="right">CPM (đ)</Th>
              <Th align="right">Thumb stop %</Th>
              <Th align="right">View 3s</Th>
              <Th align="right">View 25%</Th>
              <Th align="right">View 100%</Th>
              <Th align="right">Tương tác</Th>
              <Th align="right">Chuyển đổi</Th>
              <Th align="right">CPA (đ)</Th>
              <Th align="right">Frequency</Th>
              <Th align="right">Score</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-foreground">
            {CREATIVES.map((c) => (
              <tr key={c.id} className="hover:bg-card/40">
                <td className="px-3 py-2.5 font-semibold text-blue-400">{c.id}</td>
                <td className="px-3 py-2.5 text-foreground max-w-[170px] truncate" title={c.name}>{c.name}</td>
                <td className="px-3 py-2.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${CREATIVE_TYPE_STYLE[c.type]}`}>{c.type}</span>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">{c.format}</td>
                <td className="px-3 py-2.5"><ChannelChip channel={c.channel} /></td>
                <td className="px-3 py-2.5">
                  <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-card text-foreground">{c.campaign}</span>
                </td>
                <td className="px-3 py-2.5"><StatusPill status={c.status} /></td>
                <td className="px-3 py-2.5 text-right font-semibold text-foreground">{fmtNum(c.spendK)}</td>
                <td className="px-3 py-2.5 text-right">{fmtCompact(c.impressions)}</td>
                <td className="px-3 py-2.5 text-right">{fmtCompact(c.reach)}</td>
                <td className="px-3 py-2.5 text-right">{fmtNum(c.clicks)}</td>
                <td className="px-3 py-2.5 text-right font-medium text-green-400">{c.ctr.toFixed(2)}%</td>
                <td className="px-3 py-2.5 text-right">{fmtNum(c.cpc)}</td>
                <td className="px-3 py-2.5 text-right">{c.cpm.toFixed(1)}</td>
                <td className="px-3 py-2.5 text-right text-amber-400">{dash(c.thumbStop, (v) => `${v.toFixed(1)}%`)}</td>
                <td className="px-3 py-2.5 text-right text-muted-foreground">{dash(c.view3s, fmtCompact)}</td>
                <td className="px-3 py-2.5 text-right text-muted-foreground">{dash(c.view25, fmtCompact)}</td>
                <td className="px-3 py-2.5 text-right text-muted-foreground">{dash(c.view100, fmtCompact)}</td>
                <td className="px-3 py-2.5 text-right">{fmtCompact(c.engagement)}</td>
                <td className="px-3 py-2.5 text-right font-medium text-blue-400">{fmtNum(c.conversions)}</td>
                <td className="px-3 py-2.5 text-right">{fmtNum(c.cpa)}</td>
                <td className="px-3 py-2.5 text-right text-muted-foreground">{c.frequency.toFixed(2)}</td>
                <td className="px-3 py-2.5 text-right"><ScoreBar score={c.score} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="px-5 py-3 text-[11px] text-muted-foreground border-t border-border">
        * Thumb Stop Rate: % người dừng lại xem sau 1s · View 3s/25%/100%: chỉ áp dụng cho Video · Relevance Score: điểm liên quan 1–10
      </p>
    </Panel>
  );
}
