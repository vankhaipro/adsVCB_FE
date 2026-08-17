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

  const marketSplit = useMemo(() => {
    if (!breakdown?.byMarket?.length) return [];
    const total = breakdown.byMarket.reduce((s: number, m: any) => s + m.spend, 0) || 1;
    const colors: Record<string, string> = {
      "Việt Nam": "#10b981", // Green
      "Global": "#8b5cf6",   // Purple
      "Khác": "#6b7280"      // Gray
    };
    return breakdown.byMarket.map((m: any) => ({
      name: m.name,
      value: Number(((m.spend / total) * 100).toFixed(1)),
      color: colors[m.name] || "#6b7280"
    }));
  }, [breakdown]);

  const industrySplit = useMemo(() => {
    if (!breakdown?.byIndustry?.length) return [];
    const total = breakdown.byIndustry.reduce((s: number, ind: any) => s + ind.spend, 0) || 1;
    const colors: Record<string, string> = {
      "Kim hoàn": "#f59e0b", // Amber/Gold
      "Đồ da": "#3b82f6",    // Blue
      "Khác": "#6b7280"      // Gray
    };
    return breakdown.byIndustry.map((ind: any) => ({
      name: ind.name,
      value: Number(((ind.spend / total) * 100).toFixed(1)),
      color: colors[ind.name] || "#6b7280"
    }));
  }, [breakdown]);

  // Nhãn hiển thị trên trục X. Tên gốc từ backend dài nên Recharts bỏ bớt tick khi
  // không đủ chỗ (đó là lý do "Team Đồ Da" không hiện chữ nào).
  const TEAM_LABEL: Record<string, string> = {
    // Backend trả "Không xác định" cho campaign không suy được team từ tên lẫn Fanpage.
    // Trước đây nhãn này là "Tự động" — gây hiểu nhầm là nhóm chiến dịch chạy tự động.
    "Không xác định": "Chưa rõ team",
    "Team Đồ Da": "Đồ da",
  };

  const teamSpendData = useMemo(() => {
    if (!breakdown?.byTeam?.length) return [];
    return breakdown.byTeam
      .map((t: any) => ({
        name: TEAM_LABEL[t.name] ?? t.name,
        spend: t.spend
      }))
      .sort((a: any, b: any) => b.spend - a.spend);
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
    <div className="flex flex-col gap-5 w-full">
      {/* Hàng 1: Xu hướng, Phân bổ kênh, Chuyển đổi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Xu hướng chi tiêu & doanh thu */}
        <Panel
          className="lg:col-span-5"
          title="Xu hướng chi tiêu & Doanh thu"
          subtitle={hasData ? "Theo ngày (Dữ liệu thực tế)" : "Theo ngày, tháng 6/2024"}
          right={
            <div className="flex items-center gap-3 text-[14px]">
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
                  <div className="flex items-center justify-between text-[14px]">
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

      {/* Hàng 2: Phân bổ thị trường, ngành và chi tiêu team */}
      {breakdown?.byMarket?.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Phân bổ theo Thị trường */}
          <Panel className="lg:col-span-3" title="Phân bổ thị trường" subtitle="Chi phí theo thị trường">
            <div className="flex flex-col gap-3">
              <div className="w-full h-[120px] flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={marketSplit} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value" stroke="none">
                      {marketSplit.map((c: any) => <Cell key={c.name} fill={c.color} />)}
                      <Label value="Thị trường" position="center" fill={labelFill} fontSize={10} fontWeight="bold" />
                    </Pie>
                    <RTooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1.5 px-2">
                {marketSplit.map((c: any) => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-foreground">
                      <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                      {c.name}
                    </span>
                    <span className="font-semibold text-foreground">{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          {/* Phân bổ theo Ngành hàng */}
          <Panel className="lg:col-span-3" title="Phân bổ ngành hàng" subtitle="Chi phí theo ngành">
            <div className="flex flex-col gap-3">
              <div className="w-full h-[120px] flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={industrySplit} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value" stroke="none">
                      {industrySplit.map((c: any) => <Cell key={c.name} fill={c.color} />)}
                      <Label value="Ngành hàng" position="center" fill={labelFill} fontSize={10} fontWeight="bold" />
                    </Pie>
                    <RTooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1.5 px-2">
                {industrySplit.map((c: any) => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-foreground">
                      <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                      {c.name}
                    </span>
                    <span className="font-semibold text-foreground">{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          {/* Chi phí quảng cáo theo Team */}
          <Panel className="lg:col-span-6" title="Chi phí quảng cáo theo Team" subtitle="Ngân sách quảng cáo thực tế cho các nhóm">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamSpendData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                  <XAxis dataKey="name" stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => fmtCompact(v)} />
                  <RTooltip contentStyle={tooltipStyle} cursor={{ fill: cursor }} formatter={(v) => [fmtNum(Number(v)) + "đ", "Chi phí"]} />
                  <Bar dataKey="spend" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
