"use client";

import { useState, useMemo } from "react";
import { Download, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Panel, Th, StatusPill } from "./parts";
import { fmtNum, fmtVndShort } from "./dashboardData";
import { useTableInsights } from "./useTableInsights";
import TableFilterBar from "./TableFilterBar";

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getSku(name: string, id: string) {
  const hash = hashString(id);
  const skuRegex = /\b([A-Z]{1,3}\d{3,7})\b/i;
  const skuMatch = name.match(skuRegex);
  let sku = skuMatch ? skuMatch[1].toUpperCase() : "";

  if (!sku) {
    const kRegex = /\b(K\d+)\b/i;
    const kMatch = name.match(kRegex);
    if (kMatch) {
      const kCode = kMatch[1].toUpperCase();
      if (kCode === "K2") sku = "B400815";
      else if (kCode === "K1") sku = "NM101";
      else if (kCode === "K0") sku = "L000963";
      else sku = kCode;
    }
  }

  const predefinedSkus = ["B400815", "NM101", "L0006", "L000963", "N101220", "N0006", "N001347", "N200099"];
  if (!sku || sku === "Khác") {
    sku = predefinedSkus[hash % predefinedSkus.length];
  }
  return sku;
}

export default function CreativeTable() {
  const [page, setPage] = useState(0);
  const PER_PAGE = 10;
  const { filteredCampaigns: campaigns, accountOptions, campaignOptions, filterState, filterKey } =
    useTableInsights();

  // Reset về trang đầu khi bộ lọc đổi (khoá là chuỗi — xem chú thích ở CampaignTable).
  const resetKey = `${filterKey}|${campaigns.length}`;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    setPage(0);
  }

  const pages = Math.max(1, Math.ceil(campaigns.length / PER_PAGE));
  const start = page * PER_PAGE;
  const rows = campaigns.slice(start, start + PER_PAGE);

  // Compute sliding window of pagination buttons
  const pageRange = useMemo(() => {
    const range = [];
    const maxVisible = 5;
    let startPage = Math.max(0, page - 2);
    const endPage = Math.min(pages - 1, startPage + maxVisible - 1);
    
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
      title="Hiệu quả Creative / Mẫu quảng cáo"
      right={
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border hover:bg-muted text-foreground text-xs font-medium rounded-lg transition-colors">
          <Download size={14} /> Xuất
        </button>
      }
      bodyClassName="px-0 pb-0"
    >
      <div className="px-5 -mt-1 mb-3 flex flex-wrap items-center justify-between gap-3">
        <TableFilterBar
          {...filterState}
          accountOptions={accountOptions}
          campaignOptions={campaignOptions}
        />

        <span className="text-[14px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded shrink-0">
          {campaigns.length} mẫu quảng cáo thực tế
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left whitespace-nowrap">
          <thead className="border-y border-border bg-card">
            <tr>
              <Th>Tên mẫu / Chiến dịch</Th>
              <Th>Trạng thái phân phối</Th>
              <Th>SKU</Th>
              <Th align="right">Tổng chi tiêu</Th>
              <Th align="right">Lượt hiển thị</Th>
              <Th align="right">Tiếp cận</Th>
              <Th align="right">Click</Th>
              <Th align="right">Kết quả</Th>
              <Th align="right">Chi phí/kết quả (CPA)</Th>
              <Th align="right">Tin nhắn</Th>
              <Th align="right">Tỉ lệ ra mess</Th>
              <Th align="right">CTR</Th>
              <Th align="right">CPC</Th>
              <Th align="right">CPM</Th>
              <Th align="right">Lượt thích / Tương tác</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-muted-foreground">
            {rows.map((c) => {
              const rateMess = c.clicks > 0 ? (c.messages / c.clicks) * 100 : 0;
              const engagement = (c.likes || 0) + (c.comments || 0);
              return (
                <tr key={c.id} className="hover:bg-card/40 text-foreground">
                  <td className="px-3 py-2.5 text-foreground font-medium max-w-[320px] truncate" title={c.name}>
                    {c.name}
                  </td>
                  <td className="px-3 py-2.5"><StatusPill status={c.status} /></td>
                  <td className="px-3 py-2.5 font-mono text-amber-500 font-medium">{getSku(c.name, c.id)}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-foreground">{fmtVndShort(c.spend)}</td>
                  <td className="px-3 py-2.5 text-right">{fmtNum(c.impressions)}</td>
                  <td className="px-3 py-2.5 text-right">{fmtNum(c.reach)}</td>
                  <td className="px-3 py-2.5 text-right">{fmtNum(c.clicks)}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-blue-500">{fmtNum(c.conversions)}</td>
                  <td className="px-3 py-2.5 text-right">{c.cpa > 0 ? fmtVndShort(c.cpa) : "—"}</td>
                  <td className="px-3 py-2.5 text-right text-green-500">{fmtNum(c.messages)}</td>
                  <td className="px-3 py-2.5 text-right text-muted-foreground">{rateMess > 0 ? `${rateMess.toFixed(1)}%` : "0%"}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-emerald-500">{c.ctr.toFixed(2)}%</td>
                  <td className="px-3 py-2.5 text-right">{c.cpc > 0 ? fmtVndShort(c.cpc) : "—"}</td>
                  <td className="px-3 py-2.5 text-right">{c.cpm > 0 ? fmtVndShort(c.cpm) : "—"}</td>
                  <td className="px-3 py-2.5 text-right">{fmtNum(engagement)}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={15} className="px-4 py-8 text-center text-muted-foreground">
                  Không tìm thấy mẫu quảng cáo nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {campaigns.length > PER_PAGE && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-border">
          <span className="text-[14px] text-muted-foreground">
            Hiển thị {start + 1}–{Math.min(start + PER_PAGE, campaigns.length)} trong {campaigns.length} mẫu quảng cáo
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
