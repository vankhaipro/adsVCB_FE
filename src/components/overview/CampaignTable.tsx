"use client";

import { useState, useMemo } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Panel, Th, StatusPill, ChannelChip } from "./parts";
import {
  fmtNum, fmtCompact, fmtVndShort, fmtPct, fmtRoas,
} from "./dashboardData";

const PER_PAGE = 8;

interface CampaignTableProps {
  campaigns: any[];
}

function ctrColor(v: number) {
  return v >= 1.5 ? "text-green-400" : v < 1 ? "text-red-400" : "text-foreground";
}
function roasColor(v: number) {
  return v >= 2 ? "text-green-400" : "text-amber-400";
}

export default function CampaignTable({ campaigns }: CampaignTableProps) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(campaigns.length / PER_PAGE));
  const start = page * PER_PAGE;
  const rows = campaigns.slice(start, start + PER_PAGE);

  // Compute live footer totals based on current filtered campaigns list
  const totals = useMemo(() => {
    const t = { spend: 0, reach: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0, engagement: 0 };
    for (const c of campaigns) {
      t.spend += c.spend;
      t.reach += c.reach;
      t.impressions += c.impressions;
      t.clicks += c.clicks;
      t.conversions += c.conversions;
      t.revenue += c.revenue;
      t.engagement += (c.likes || 0) + (c.comments || 0) + (c.shares || 0);
    }
    const ctr = t.impressions > 0 ? (t.clicks / t.impressions) * 100 : 0;
    const cpc = t.clicks > 0 ? t.spend / t.clicks : 0;
    const roas = t.spend > 0 ? t.revenue / t.spend : 0;
    return { ...t, ctr, cpc, roas };
  }, [campaigns]);

  // Compute sliding window of pagination buttons
  const pageRange = useMemo(() => {
    const range = [];
    const maxVisible = 5;
    let startPage = Math.max(0, page - 2);
    let endPage = Math.min(pages - 1, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(0, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }
    return range;
  }, [page, pages]);

  return (
    <Panel
      title="Bảng chi tiết chiến dịch"
      right={
        <span className="text-xs text-muted-foreground">
          Sắp xếp theo: <span className="text-foreground font-medium">Chi tiêu ↓</span> · Trang {page + 1}/{pages}
        </span>
      }
      bodyClassName="px-0 pb-0"
    >
      <div className="px-5 -mt-1 mb-1">
        <span className="text-[16px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
          {campaigns.length} chiến dịch thực tế
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left whitespace-nowrap">
          <thead className="border-y border-border bg-card">
            <tr>
              <Th>Tên chiến dịch</Th>
              <Th>Tuyến ND</Th>
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
              <Th align="right">Chuyển đổi</Th>
              <Th align="right">ROAS</Th>
              <Th align="right">Frequency</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-foreground">
            {rows.map((c) => (
              <tr key={c.id} className="hover:bg-card/40">
                <td className="px-3 py-2.5 text-foreground max-w-[280px] truncate" title={c.name}>
                  {c.name}
                </td>
                <td className="px-3 py-2.5 font-semibold text-blue-400 text-center">{c.contentLine}</td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-foreground max-w-[160px] truncate" title={c.pageName || c.channel}>
                      {c.pageName || c.channel}
                    </span>
                    <span className="scale-90 origin-left"><ChannelChip channel={c.channel} /></span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">{c.objective}</td>
                <td className="px-3 py-2.5"><StatusPill status={c.status} /></td>
                <td className="px-3 py-2.5 text-right text-muted-foreground">
                  {c.budget > 0 ? fmtVndShort(c.budget) : "Tự động"}
                </td>
                <td className="px-3 py-2.5 text-right font-semibold text-foreground">{fmtVndShort(c.spend)}</td>
                <td className="px-3 py-2.5 text-right">{fmtCompact(c.reach)}</td>
                <td className="px-3 py-2.5 text-right">{fmtCompact(c.impressions)}</td>
                <td className="px-3 py-2.5 text-right">{fmtNum(c.clicks)}</td>
                <td className={`px-3 py-2.5 text-right font-medium ${ctrColor(c.ctr)}`}>{fmtPct(c.ctr)}</td>
                <td className="px-3 py-2.5 text-right">{c.cpc > 0 ? fmtVndShort(c.cpc) : "—"}</td>
                <td className="px-3 py-2.5 text-right">{c.cpm > 0 ? fmtVndShort(c.cpm) : "—"}</td>
                <td className="px-3 py-2.5 text-right font-medium text-blue-400">{fmtNum(c.conversions)}</td>
                <td className={`px-3 py-2.5 text-right font-semibold ${roasColor(c.roas)}`}>{fmtRoas(c.roas)}</td>
                <td className="px-3 py-2.5 text-right text-muted-foreground">{c.frequency.toFixed(2)}</td>
              </tr>
            ))}
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={16} className="px-4 py-8 text-center text-muted-foreground">
                  Không tìm thấy chiến dịch nào trong khoảng thời gian này.
                </td>
              </tr>
            )}
          </tbody>
          {campaigns.length > 0 && (
            <tfoot className="border-t border-border bg-card font-semibold text-foreground">
              <tr>
                <td className="px-3 py-3" colSpan={5}>TỔNG CỘNG ({campaigns.length})</td>
                <td className="px-3 py-3 text-right text-muted-foreground">—</td>
                <td className="px-3 py-3 text-right text-foreground">{fmtVndShort(totals.spend)}</td>
                <td className="px-3 py-3 text-right">{fmtCompact(totals.reach)}</td>
                <td className="px-3 py-3 text-right">{fmtCompact(totals.impressions)}</td>
                <td className="px-3 py-3 text-right">{fmtNum(totals.clicks)}</td>
                <td className="px-3 py-3 text-right text-green-400">{fmtPct(totals.ctr)}</td>
                <td className="px-3 py-3 text-right">{totals.cpc > 0 ? fmtVndShort(totals.cpc) : "—"}</td>
                <td className="px-3 py-3 text-right text-muted-foreground">—</td>
                <td className="px-3 py-3 text-right text-blue-400">{fmtNum(totals.conversions)}</td>
                <td className="px-3 py-3 text-right text-green-400">{fmtRoas(totals.roas)}</td>
                <td className="px-3 py-3 text-right text-muted-foreground">—</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Phân trang */}
      {campaigns.length > PER_PAGE && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-border">
          <span className="text-[16px] text-muted-foreground">
            Hiển thị {start + 1}–{Math.min(start + PER_PAGE, campaigns.length)} trong {campaigns.length} chiến dịch
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-card disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <CaretLeft size={14} />
            </button>
            {pageRange.map((i) => (
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
      )}
    </Panel>
  );
}
