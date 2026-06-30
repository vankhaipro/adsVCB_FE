"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell, Label,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
} from "recharts";
import { Panel } from "./parts";
import { CHANNEL_SPLIT, fmtCompact, fmtNum, fmtVndShort } from "./dashboardData";
import { useChartColors } from "@/lib/chartTheme";

interface OverviewChartsProps {
  trend: any[];
  breakdown: any;
}

const PLATFORM_COLORS: Record<string, string> = {
  META: "#3b82f6",
  TIKTOK: "#db2777",
  GOOGLE: "#f59e0b",
  ZALO: "#10b981",
  UNKNOWN: "#6b7280"
};

export default function OverviewCharts({ trend, breakdown }: OverviewChartsProps) {
  const { axis: AXIS, grid: GRID, cursor, tooltip: tooltipStyle, labelFill } = useChartColors();

  // Dynamic channel split from real ad spend breakdown
  const channelSplit = useMemo(() => {
    if (!breakdown?.byPlatform?.length) return CHANNEL_SPLIT;
    const total = breakdown.byPlatform.reduce((s: number, p: any) => s + p.spend, 0) || 1;
    return breakdown.byPlatform.map((p: any) => ({
      name: p.platform === "META" ? "Facebook" : p.platform === "TIKTOK" ? "TikTok" : p.platform,
      value: Number(((p.spend / total) * 100).toFixed(1)),
      color: PLATFORM_COLORS[p.platform] || "#6b7280"
    }));
  }, [breakdown]);

  // Aggregate total spend from channel split to show in the center of the Donut
  const totalSpend = useMemo(() => {
    if (!breakdown?.byPlatform?.length) return 0;
    return breakdown.byPlatform.reduce((s: number, p: any) => s + p.spend, 0);
  }, [breakdown]);

  const hasData = trend.length > 0;

  // Render ticks dynamically or fallback
  const ticks = useMemo(() => {
    if (trend.length <= 7) return trend.map(t => t.day);
    const result = [];
    const step = Math.floor(trend.length / 6) || 1;
    for (let i = 0; i < trend.length; i += step) {
      result.push(trend[i].day);
    }
    if (trend.length > 0 && !result.includes(trend[trend.length - 1].day)) {
      result.push(trend[trend.length - 1].day);
    }
    return result;
  }, [trend]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Xu hướng chi tiêu & doanh thu */}
      <Panel
        className="lg:col-span-5"
        title="Xu hướng chi tiêu & Doanh thu"
        subtitle={hasData ? "Theo ngày (Dữ liệu thực tế)" : "Theo ngày, tháng 6/2024"}
        right={
          <div className="flex items-center gap-3 text-[16px]">
            <span className="flex items-center gap-1.5 text-muted-foreground"><span className="w-3 h-0.5 rounded bg-blue-500" />Chi phí</span>
            <span className="flex items-center gap-1.5 text-muted-foreground"><span className="w-3 h-0.5 rounded bg-green-500" />Doanh thu</span>
          </div>
        }
        bodyClassName="px-3 pb-4"
      >
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="day" stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} ticks={ticks} />
              <YAxis stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => fmtCompact(v)} />
              <RTooltip contentStyle={tooltipStyle} formatter={(v) => [fmtVndShort(Number(v)), ""]} />
              <Line type="monotone" dataKey="spend" name="Chi phí" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* Phân bổ kênh */}
      <Panel className="lg:col-span-4" title="Phân bổ kênh" subtitle="Theo chi tiêu quảng cáo thực tế">
        <div className="flex items-center gap-4">
          <div className="w-[150px] h-[150px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={channelSplit} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={2} dataKey="value" stroke="none">
                  {channelSplit.map((c: any) => <Cell key={c.name} fill={c.color} />)}
                  <Label value={totalSpend > 0 ? fmtCompact(totalSpend) : "100%"} position="center" fill={labelFill} fontSize={totalSpend > 0 ? 11 : 14} fontWeight="bold" />
                </Pie>
                <RTooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 flex flex-col gap-2.5">
            {channelSplit.map((c: any) => (
              <div key={c.name} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[16px]">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                    {c.name}
                  </span>
                  <span className="font-semibold text-foreground">{c.value}%</span>
                </div>
                <div className="h-1 rounded-full bg-card overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.value}%`, background: c.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* Chuyển đổi theo ngày */}
      <Panel className="lg:col-span-3" title="Chuyển đổi theo ngày" subtitle="Tổng đơn hàng ghi nhận (thật)" bodyClassName="px-3 pb-4">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="day" stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} ticks={ticks} />
              <YAxis stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => fmtNum(v)} />
              <RTooltip contentStyle={tooltipStyle} cursor={{ fill: cursor }} formatter={(v) => [`${v}`, "Đơn"]} />
              <Bar dataKey="orders" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
