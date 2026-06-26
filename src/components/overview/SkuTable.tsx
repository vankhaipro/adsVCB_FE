"use client";

import { useState } from "react";
import { MagnifyingGlass, Download } from "@phosphor-icons/react";
import { Panel, Th, ChannelChip } from "./parts";
import { SKUS, SKU_TOTALS, fmtNum, fmtCompact, fmtRoas } from "./dashboardData";

function roasColor(v: number) {
  return v >= 3 ? "text-green-400" : "text-amber-400";
}
function returnColor(v: number) {
  return v > 5 ? "text-red-400" : "text-gray-400";
}
function stockColor(v: number) {
  return v < 60 ? "text-red-400" : v < 100 ? "text-amber-400" : "text-gray-300";
}

export default function SkuTable() {
  const [q, setQ] = useState("");
  const rows = SKUS.filter(
    (s) => !q || s.sku.toLowerCase().includes(q.toLowerCase()) || s.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <Panel
      title="Hiệu quả theo SKU / Sản phẩm"
      right={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-lg px-2.5 py-1.5">
            <MagnifyingGlass size={14} className="text-gray-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm SKU..."
              className="bg-transparent text-xs text-gray-200 outline-none w-28 placeholder:text-gray-500"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e293b] border border-[#334155] hover:bg-[#334155] text-gray-200 text-xs font-medium rounded-lg transition-colors">
            <Download size={14} /> Xuất
          </button>
        </div>
      }
      bodyClassName="px-0 pb-0"
    >
      <div className="px-5 -mt-1 mb-1">
        <span className="text-[11px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{SKUS.length} SKU</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left whitespace-nowrap">
          <thead className="border-y border-[#1e293b] bg-[#0d1424]">
            <tr>
              <Th>SKU</Th>
              <Th>Tên sản phẩm</Th>
              <Th>Danh mục</Th>
              <Th>Kênh</Th>
              <Th align="right">Chi tiêu (K)</Th>
              <Th align="right">Doanh thu</Th>
              <Th align="right">Đơn hàng</Th>
              <Th align="right">SL bán</Th>
              <Th align="right">CPA (đ)</Th>
              <Th align="right">ROAS</Th>
              <Th align="right">CTR</Th>
              <Th align="right">CPC (đ)</Th>
              <Th align="right">Thêm giỏ</Th>
              <Th align="right">Checkout %</Th>
              <Th align="right">Tỷ lệ hoàn</Th>
              <Th align="right">AOV (đ)</Th>
              <Th align="right">Tồn kho</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b] text-gray-300">
            {rows.map((s) => (
              <tr key={s.sku} className="hover:bg-[#1e293b]/40">
                <td className="px-3 py-2.5 font-semibold text-blue-400">{s.sku}</td>
                <td className="px-3 py-2.5 text-gray-200">{s.name}</td>
                <td className="px-3 py-2.5 text-gray-400">{s.category}</td>
                <td className="px-3 py-2.5"><ChannelChip channel={s.channel} /></td>
                <td className="px-3 py-2.5 text-right">{fmtNum(s.spendK)}</td>
                <td className="px-3 py-2.5 text-right font-medium text-green-400">{fmtCompact(s.revenue)}</td>
                <td className="px-3 py-2.5 text-right text-blue-400">{fmtNum(s.orders)}</td>
                <td className="px-3 py-2.5 text-right">{fmtNum(s.sold)}</td>
                <td className="px-3 py-2.5 text-right">{fmtNum(s.cpa)}</td>
                <td className={`px-3 py-2.5 text-right font-semibold ${roasColor(s.roas)}`}>{fmtRoas(s.roas)}</td>
                <td className="px-3 py-2.5 text-right">{s.ctr.toFixed(2)}%</td>
                <td className="px-3 py-2.5 text-right">{fmtNum(s.cpc)}</td>
                <td className="px-3 py-2.5 text-right">{fmtNum(s.addToCart)}</td>
                <td className="px-3 py-2.5 text-right text-green-400">{s.checkout.toFixed(1)}%</td>
                <td className={`px-3 py-2.5 text-right ${returnColor(s.returnRate)}`}>{s.returnRate.toFixed(1)}%</td>
                <td className="px-3 py-2.5 text-right">{fmtNum(s.aov)}</td>
                <td className={`px-3 py-2.5 text-right font-medium ${stockColor(s.stock)}`}>{fmtNum(s.stock)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-[#1e293b] bg-[#0d1424] font-semibold text-gray-200">
            <tr>
              <td className="px-3 py-3" colSpan={4}>TỔNG ({SKUS.length} SKU)</td>
              <td className="px-3 py-3 text-right text-white">{fmtNum(SKU_TOTALS.spendK)}</td>
              <td className="px-3 py-3 text-right text-green-400">{SKU_TOTALS.revenueLabel}</td>
              <td className="px-3 py-3 text-right text-blue-400">{fmtNum(SKU_TOTALS.orders)}</td>
              <td className="px-3 py-3" colSpan={10} />
            </tr>
          </tfoot>
        </table>
      </div>
    </Panel>
  );
}
