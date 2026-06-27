"use client";

import { useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Panel, Th, StatusPill, ChannelChip } from "./parts";
import {
  CAMPAIGNS, CAMPAIGN_TOTALS,
  fmtNum, fmtCompact, fmtVndShort, fmtPct, fmtRoas, fmtK,
} from "./dashboardData";

const PER_PAGE = 6;

function ctrColor(v: number) {
  return v >= 1.5 ? "text-green-400" : v < 1 ? "text-red-400" : "text-foreground";
}
function roasColor(v: number) {
  return v >= 2 ? "text-green-400" : "text-amber-400";
}

export default function CampaignTable() {
  const [page, setPage] = useState(0);
  const pages = Math.ceil(CAMPAIGNS.length / PER_PAGE);
  const start = page * PER_PAGE;
  const rows = CAMPAIGNS.slice(start, start + PER_PAGE);

  return (
    <Panel
      title="Bảng chi tiết chiến dịch"
      right={<span className="text-xs text-muted-foreground">Sắp xếp theo: <span className="text-foreground font-medium">Chi tiêu ↓</span> · Trang {page + 1}/{pages}</span>}
      bodyClassName="px-0 pb-0"
    >
      <div className="px-5 -mt-1 mb-1">
        <span className="text-[11px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{CAMPAIGNS.length} chiến dịch</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left whitespace-nowrap">
          <thead className="border-y border-border bg-card">
            <tr>
              <Th>Mã CL</Th>
              <Th>Tên chiến dịch</Th>
              <Th>Kênh</Th>
              <Th>Mục tiêu</Th>
              <Th>Trạng thái</Th>
              <Th align="right">Ngân sách</Th>
              <Th align="right">Chi tiêu</Th>
              <Th align="right">Tiếp cận</Th>
              <Th align="right">Hiển thị</Th>
              <Th align="right">Lượt nhấp</Th>
              <Th align="right">CTR</Th>
              <Th align="right">CPC</Th>
              <Th align="right">CPM</Th>
              <Th align="right">Tương tác</Th>
              <Th align="right">Chuyển đổi</Th>
              <Th align="right">CPA</Th>
              <Th align="right">Doanh thu</Th>
              <Th align="right">ROAS</Th>
              <Th align="right">Frequency</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-foreground">
            {rows.map((c) => (
              <tr key={c.code} className="hover:bg-card/40">
                <td className="px-3 py-2.5 font-semibold text-blue-400">{c.code}</td>
                <td className="px-3 py-2.5 text-foreground max-w-[200px] truncate" title={c.name}>{c.name}</td>
                <td className="px-3 py-2.5"><ChannelChip channel={c.channel} /></td>
                <td className="px-3 py-2.5 text-muted-foreground">{c.objective}</td>
                <td className="px-3 py-2.5"><StatusPill status={c.status} /></td>
                <td className="px-3 py-2.5 text-right text-muted-foreground">{fmtNum(c.budget)}K</td>
                <td className="px-3 py-2.5 text-right font-semibold text-foreground">{fmtNum(c.spend)}K</td>
                <td className="px-3 py-2.5 text-right">{fmtCompact(c.reach)}</td>
                <td className="px-3 py-2.5 text-right">{fmtCompact(c.impressions)}</td>
                <td className="px-3 py-2.5 text-right">{fmtNum(c.clicks)}</td>
                <td className={`px-3 py-2.5 text-right font-medium ${ctrColor(c.ctr)}`}>{fmtPct(c.ctr)}</td>
                <td className="px-3 py-2.5 text-right">{fmtVndShort(c.cpc)}</td>
                <td className="px-3 py-2.5 text-right">{c.cpm.toFixed(1)}đ</td>
                <td className="px-3 py-2.5 text-right">{fmtCompact(c.engagement)}</td>
                <td className="px-3 py-2.5 text-right font-medium text-blue-400">{fmtNum(c.conversions)}</td>
                <td className="px-3 py-2.5 text-right">{fmtK(c.cpa)}</td>
                <td className="px-3 py-2.5 text-right font-medium text-green-400">{fmtCompact(c.revenue)}</td>
                <td className={`px-3 py-2.5 text-right font-semibold ${roasColor(c.roas)}`}>{fmtRoas(c.roas)}</td>
                <td className="px-3 py-2.5 text-right text-muted-foreground">{c.frequency.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-border bg-card font-semibold text-foreground">
            <tr>
              <td className="px-3 py-3" colSpan={5}>TỔNG CỘNG ({CAMPAIGNS.length})</td>
              <td className="px-3 py-3 text-right text-muted-foreground">—</td>
              <td className="px-3 py-3 text-right text-foreground">{CAMPAIGN_TOTALS.spendLabel}</td>
              <td className="px-3 py-3 text-right">{CAMPAIGN_TOTALS.reachLabel}</td>
              <td className="px-3 py-3 text-right">{CAMPAIGN_TOTALS.impressionsLabel}</td>
              <td className="px-3 py-3 text-right">{fmtNum(CAMPAIGN_TOTALS.clicks)}</td>
              <td className="px-3 py-3 text-right text-green-400">{fmtPct(CAMPAIGN_TOTALS.ctr)}</td>
              <td className="px-3 py-3 text-right">{fmtVndShort(CAMPAIGN_TOTALS.cpc)}</td>
              <td className="px-3 py-3 text-right text-muted-foreground">—</td>
              <td className="px-3 py-3 text-right">{fmtNum(CAMPAIGN_TOTALS.engagement)}</td>
              <td className="px-3 py-3 text-right text-blue-400">{CAMPAIGN_TOTALS.engagementLabel}</td>
              <td className="px-3 py-3 text-right">{fmtNum(CAMPAIGN_TOTALS.conversions)}</td>
              <td className="px-3 py-3 text-right text-muted-foreground">—</td>
              <td className="px-3 py-3 text-right text-green-400">{CAMPAIGN_TOTALS.revenueLabel}</td>
              <td className="px-3 py-3 text-right text-green-400">{fmtRoas(CAMPAIGN_TOTALS.roas)}</td>
              <td className="px-3 py-3 text-right text-muted-foreground">—</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Phân trang */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border">
        <span className="text-[11px] text-muted-foreground">
          Hiển thị {start + 1}–{Math.min(start + PER_PAGE, CAMPAIGNS.length)} trong {CAMPAIGNS.length} chiến dịch
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-card disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <CaretLeft size={14} />
          </button>
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium ${
                i === page ? "bg-blue-600 text-foreground" : "text-muted-foreground hover:bg-card"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
            disabled={page === pages - 1}
            className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-card disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <CaretRight size={14} />
          </button>
        </div>
      </div>
    </Panel>
  );
}
