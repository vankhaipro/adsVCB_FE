"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { apiGet, fmtVnd } from "@/lib/api";
import { useChartColors } from "@/lib/chartTheme";
import { Storefront, UsersThree, UserCircle, CurrencyDollar, ShoppingBag, FacebookLogo, ChartPie } from "@phosphor-icons/react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Label, LabelList } from "recharts";
import type { ExportSheet } from "@/lib/exportExcel";

const CHART_COLORS = ["#3b82f6", "#db2777", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#64748b"];

type Row = { name: string; orders: number; revenue: number };
type StaffRow = { name: string; team: string; topChannel: string; orders: number; revenue: number };
type Dash = {
  totalRevenue: number;
  orderCount: number;
  byChannel: Row[];
  byMessagedPage: Row[];
  byStaff: Row[];
  byTeam: Row[];
  byProvince: Row[];
  staffTable: StaffRow[];
};

const CHANNEL_LABEL: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktokshop: "TikTok Shop",
  "tiktok-for-business": "TikTok Ads",
  "tiktok-personal": "TikTok",
  shopee: "Shopee",
  zalo: "Zalo",
  "zalo-oa": "Zalo OA",
  pos: "POS / Cửa hàng",
  web: "Website",
  admin: "Admin",
};

const fmtNum = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n || 0));

function fmtVndShort(n: number): string {
  const abs = Math.abs(n || 0);
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}Bđ`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(0)}Mđ`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(0)}Kđ`;
  return `${Math.round(n)}đ`;
}

function BreakdownCard({
  title,
  icon,
  items,
  limit = 12,
  labelMap,
}: {
  title: string;
  icon: React.ReactNode;
  items: Row[];
  limit?: number;
  labelMap?: Record<string, string>;
}) {
  const top = items.slice(0, limit);
  const max = Math.max(1, ...top.map((r) => r.revenue));
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        {icon}
        {title}
        <span className="text-xs text-muted-foreground font-normal">({items.length})</span>
      </h3>
      {top.length === 0 ? (
        <p className="text-xs text-muted-foreground py-6 text-center">Không có dữ liệu</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {top.map((r, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-xs mb-1 gap-2">
                <span className="text-foreground font-medium truncate" title={r.name}>
                  {labelMap?.[r.name] ?? r.name}
                </span>
                <span className="text-foreground font-semibold shrink-0">
                  {fmtVnd(r.revenue)}{" "}
                  <span className="text-muted-foreground font-normal">· {fmtNum(r.orders)} đơn</span>
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(r.revenue / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export type OrdersBreakdownHandle = { exportSheets: () => ExportSheet[] };

function dashToSheets(data: Dash | null): ExportSheet[] {
  if (!data) return [];
  return [
    {
      name: "Theo kênh",
      rows: data.byChannel.map((r) => ({ "Kênh": CHANNEL_LABEL[r.name] ?? r.name, "Số đơn": r.orders, "Doanh thu": r.revenue })),
    },
    {
      name: "Theo team kinh doanh",
      rows: data.byTeam.map((r) => ({ "Team": r.name, "Số đơn": r.orders, "Doanh thu": r.revenue })),
    },
    {
      name: "Theo page khách nhắn",
      rows: data.byMessagedPage.map((r) => ({ "Page": r.name, "Số đơn": r.orders, "Doanh thu": r.revenue })),
    },
    {
      name: "Chi tiết theo nhân viên",
      rows: data.staffTable.map((s, i) => ({
        "#": i + 1,
        "Nhân viên": s.name,
        "Team": s.team,
        "Kênh chính": CHANNEL_LABEL[s.topChannel] ?? s.topChannel ?? "",
        "Số đơn": s.orders,
        "Doanh thu": s.revenue,
      })),
    },
  ];
}

// Dashboard đơn hàng bán (nguồn Sapo). `query` = chuỗi "from=...&to=..." từ bộ lọc thời gian.
export default forwardRef<OrdersBreakdownHandle, { query: string }>(function OrdersBreakdown({ query }, ref) {
  const [data, setData] = useState<Dash | null>(null);
  const chart = useChartColors();

  useEffect(() => {
    apiGet(`/sapo/orders/dashboard?${query}`)
      .then(setData)
      .catch(() => setData(null));
  }, [query]);

  useImperativeHandle(ref, () => ({
    exportSheets: () => dashToSheets(data),
  }), [data]);

  // Donut theo kênh: top 7 + gộp phần còn lại thành "Khác".
  const channelPie = (() => {
    const items = (data?.byChannel ?? []).map((r) => ({ name: CHANNEL_LABEL[r.name] ?? r.name, value: r.revenue }));
    const top = items.slice(0, 7);
    const rest = items.slice(7).reduce((s, x) => s + x.value, 0);
    if (rest > 0) top.push({ name: "Khác", value: rest });
    return top;
  })();
  // Cột theo team kinh doanh (top 8).
  const teamBar = (data?.byTeam ?? []).slice(0, 8).map((r) => ({ name: r.name, revenue: r.revenue }));

  return (
    <div className="flex flex-col gap-5">
      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <CurrencyDollar size={20} className="text-green-500" weight="duotone" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground leading-tight">{fmtVnd(data?.totalRevenue ?? 0)}</p>
            <p className="text-xs text-muted-foreground">Tổng doanh thu</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <ShoppingBag size={20} className="text-blue-500" weight="duotone" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground leading-tight">{fmtNum(data?.orderCount ?? 0)}</p>
            <p className="text-xs text-muted-foreground">Số đơn</p>
          </div>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Donut: tỉ trọng doanh thu theo kênh */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <ChartPie size={18} className="text-violet-500" /> Tỉ trọng doanh thu theo kênh
          </h3>
          <div className="h-[210px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={channelPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {channelPie.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                  <Label value={fmtVndShort(data?.totalRevenue ?? 0)} position="center" fill={chart.labelFill} fontSize={12} fontWeight="bold" />
                </Pie>
                <Tooltip contentStyle={chart.tooltip} formatter={(v) => fmtVnd(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-2 text-xs max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
            {channelPie.map((c, i) => {
              const totalRev = data?.totalRevenue || channelPie.reduce((s, x) => s + x.value, 0) || 1;
              const pct = ((c.value / totalRev) * 100).toFixed(1);
              return (
                <div key={i} className="flex items-center justify-between gap-1.5 min-w-0 bg-muted/30 px-2 py-1 rounded">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-foreground font-medium text-xs truncate" title={c.name}>{c.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-blue-600 dark:text-blue-400 font-medium text-[11px]">{fmtVndShort(c.value)}</span>
                    <span className="font-semibold text-foreground text-[10px] bg-background px-1 py-0.5 rounded border border-border">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cột: doanh thu theo team kinh doanh */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <UsersThree size={18} className="text-blue-500" /> Doanh thu theo team kinh doanh
          </h3>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamBar} margin={{ top: 25, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 1e6)}M`} />
                <Tooltip contentStyle={chart.tooltip} formatter={(v) => fmtVnd(Number(v))} cursor={{ fill: "rgba(59,130,246,0.08)" }} />
                <Bar dataKey="revenue" name="Doanh thu" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={34}>
                  <LabelList dataKey="revenue" position="top" formatter={(v) => fmtVndShort(Number(v ?? 0))} style={{ fill: chart.labelFill, fontSize: "10px", fontWeight: "600" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bảng chi tiết theo nhân viên */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <UserCircle size={18} className="text-amber-500" /> Chi tiết theo nhân viên
          <span className="text-xs text-muted-foreground font-normal">({data?.staffTable?.length ?? 0})</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="text-muted-foreground border-b border-border">
              <tr>
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Nhân viên</th>
                <th className="px-3 py-2 font-medium">Team</th>
                <th className="px-3 py-2 font-medium">Kênh chính</th>
                <th className="px-3 py-2 font-medium text-right">Số đơn</th>
                <th className="px-3 py-2 font-medium text-right">% đơn</th>
                <th className="px-3 py-2 font-medium text-right">Doanh thu</th>
                <th className="px-3 py-2 font-medium text-right">% DT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {(data?.staffTable ?? []).length === 0 ? (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">Không có dữ liệu</td></tr>
              ) : (data?.staffTable ?? []).map((s, i) => {
                const pctOrders = data && data.orderCount > 0 ? (s.orders / data.orderCount) * 100 : 0;
                const pctRev = data && data.totalRevenue > 0 ? (s.revenue / data.totalRevenue) * 100 : 0;
                return (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2 font-medium text-foreground">{s.name}</td>
                    <td className="px-3 py-2"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px]">{s.team}</span></td>
                    <td className="px-3 py-2 text-muted-foreground">{CHANNEL_LABEL[s.topChannel] ?? s.topChannel ?? "—"}</td>
                    <td className="px-3 py-2 text-right">{fmtNum(s.orders)}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{pctOrders.toFixed(1)}%</td>
                    <td className="px-3 py-2 text-right font-semibold">{fmtVnd(s.revenue)}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{pctRev.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Breakdown grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <BreakdownCard title="Theo kênh" icon={<Storefront size={18} className="text-violet-500" />} items={data?.byChannel ?? []} labelMap={CHANNEL_LABEL} />
        <BreakdownCard title="Theo page khách nhắn" icon={<FacebookLogo size={18} className="text-blue-500" />} items={data?.byMessagedPage ?? []} limit={15} />
        <BreakdownCard title="Theo team kinh doanh" icon={<UsersThree size={18} className="text-blue-500" />} items={data?.byTeam ?? []} />
        <BreakdownCard title="Theo nhân viên" icon={<UserCircle size={18} className="text-amber-500" />} items={data?.byStaff ?? []} limit={15} />
      </div>
    </div>
  );
});
