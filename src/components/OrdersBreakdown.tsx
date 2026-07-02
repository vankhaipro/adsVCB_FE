"use client";

import { useEffect, useState } from "react";
import { apiGet, fmtVnd } from "@/lib/api";
import { useChartColors } from "@/lib/chartTheme";
import { Storefront, UsersThree, UserCircle, MapPin, CurrencyDollar, ShoppingBag, FacebookLogo, ChartPie } from "@phosphor-icons/react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const CHART_COLORS = ["#3b82f6", "#db2777", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#64748b"];

type Row = { name: string; orders: number; revenue: number };
type Dash = {
  totalRevenue: number;
  orderCount: number;
  byChannel: Row[];
  byPage: Row[];
  byStaff: Row[];
  byTeam: Row[];
  byProvince: Row[];
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

// Dashboard đơn hàng bán (nguồn Sapo). `query` = chuỗi "from=...&to=..." từ bộ lọc thời gian.
export default function OrdersBreakdown({ query }: { query: string }) {
  const [data, setData] = useState<Dash | null>(null);
  const chart = useChartColors();

  useEffect(() => {
    apiGet(`/sapo/orders/dashboard?${query}`)
      .then(setData)
      .catch(() => setData(null));
  }, [query]);

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
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={channelPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {channelPie.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chart.tooltip} formatter={(v: number) => fmtVnd(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-2 text-[11px]">
            {channelPie.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="text-muted-foreground truncate">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cột: doanh thu theo team kinh doanh */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <UsersThree size={18} className="text-blue-500" /> Doanh thu theo team kinh doanh
          </h3>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamBar} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 1e6)}M`} />
                <Tooltip contentStyle={chart.tooltip} formatter={(v: number) => fmtVnd(v)} cursor={{ fill: "rgba(59,130,246,0.08)" }} />
                <Bar dataKey="revenue" name="Doanh thu" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Breakdown grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <BreakdownCard title="Theo kênh" icon={<Storefront size={18} className="text-violet-500" />} items={data?.byChannel ?? []} labelMap={CHANNEL_LABEL} />
        <BreakdownCard title="Theo fanpage (Facebook)" icon={<FacebookLogo size={18} className="text-blue-500" />} items={data?.byPage ?? []} limit={15} />
        <BreakdownCard title="Theo team kinh doanh" icon={<UsersThree size={18} className="text-blue-500" />} items={data?.byTeam ?? []} />
        <BreakdownCard title="Theo nhân viên" icon={<UserCircle size={18} className="text-amber-500" />} items={data?.byStaff ?? []} limit={15} />
        <BreakdownCard title="Theo tỉnh/thành" icon={<MapPin size={18} className="text-rose-500" />} items={data?.byProvince ?? []} limit={15} />
      </div>
    </div>
  );
}
