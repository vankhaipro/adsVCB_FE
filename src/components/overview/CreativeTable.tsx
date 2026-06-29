"use client";

import { Download } from "@phosphor-icons/react";
import { Panel, Th, StatusPill } from "./parts";
import { CREATIVES, fmtNum, fmtVndShort } from "./dashboardData";

export default function CreativeTable() {
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
      <div className="px-5 -mt-1 mb-1">
        <span className="text-[11px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{CREATIVES.length} mẫu</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left whitespace-nowrap">
          <thead className="border-y border-border bg-card">
            <tr>
              <Th>Tên mẫu</Th>
              <Th>Ngày bắt đầu</Th>
              <Th>Trạng thái phân phối</Th>
              <Th>SKU</Th>
              <Th align="right">Tổng chi tiêu</Th>
              <Th align="right">Lượt hiển thị</Th>
              <Th align="right">Tiếp cận</Th>
              <Th align="right">Click</Th>
              <Th align="right">Kết quả</Th>
              <Th align="right">Chi phí/kết quả</Th>
              <Th align="right">Tin nhắn</Th>
              <Th align="right">Tỉ lệ ra mess</Th>
              <Th align="right">CTR</Th>
              <Th align="right">CPC</Th>
              <Th align="right">CPM</Th>
              <Th align="right">Lượt thích Trang</Th>
              <Th align="right">Lượt thích bài viết</Th>
              <Th align="right">Tổng tương tác</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-muted-foreground">
            {CREATIVES.map((c) => {
              const rateMess = c.clicks > 0 ? (c.messages / c.clicks) * 100 : 0;
              return (
                <tr key={c.id} className="hover:bg-card/40 text-foreground">
                  <td className="px-3 py-2.5 text-foreground font-medium max-w-[200px] truncate" title={c.name}>{c.name}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{c.startDate}</td>
                  <td className="px-3 py-2.5"><StatusPill status={c.status} /></td>
                  <td className="px-3 py-2.5 font-mono text-amber-500 font-medium">{c.sku}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-foreground">{fmtVndShort(c.spendK * 1000)}</td>
                  <td className="px-3 py-2.5 text-right">{fmtNum(c.impressions)}</td>
                  <td className="px-3 py-2.5 text-right">{fmtNum(c.reach)}</td>
                  <td className="px-3 py-2.5 text-right">{fmtNum(c.clicks)}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-blue-500">{fmtNum(c.conversions)}</td>
                  <td className="px-3 py-2.5 text-right">{c.conversions > 0 ? fmtVndShort(c.cpa) : "—"}</td>
                  <td className="px-3 py-2.5 text-right text-green-500">{fmtNum(c.messages)}</td>
                  <td className="px-3 py-2.5 text-right text-muted-foreground">{rateMess > 0 ? `${rateMess.toFixed(1)}%` : "0%"}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-emerald-500">{c.ctr.toFixed(2)}%</td>
                  <td className="px-3 py-2.5 text-right">{fmtVndShort(c.cpc)}</td>
                  <td className="px-3 py-2.5 text-right">{fmtVndShort(c.cpm)}</td>
                  <td className="px-3 py-2.5 text-right text-muted-foreground">{fmtNum(c.pageLikes)}</td>
                  <td className="px-3 py-2.5 text-right text-muted-foreground">{fmtNum(c.postLikes)}</td>
                  <td className="px-3 py-2.5 text-right">{fmtNum(c.engagement)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
