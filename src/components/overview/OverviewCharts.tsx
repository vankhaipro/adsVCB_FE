"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell, Label, LabelList,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
} from "recharts";
import { Panel } from "./parts";
import { CHANNEL_SPLIT, fmtCompact, fmtNum, fmtVndShort } from "./dashboardData";
import type { BreakdownData, InsightAgg, TrendPoint } from "./dashboardData";
import { useChartColors } from "@/lib/chartTheme";

interface OverviewChartsProps {
  trend: TrendPoint[];
  breakdown: BreakdownData | null;
}

export default function OverviewCharts({ trend, breakdown }: OverviewChartsProps) {
  const { axis: AXIS, grid: GRID, cursor, tooltip: tooltipStyle, labelFill } = useChartColors();

  // Dynamic channel split from real ad spend breakdown (by real Fanpage / Channel)
  const channelSplit = useMemo(() => {
    // Dữ liệu mẫu không có `spend` -> gắn undefined để union giữ đúng hình dạng.
    if (!breakdown?.byChannel?.length) {
      return CHANNEL_SPLIT.map((c) => ({ ...c, name: c.name as string, spend: undefined as number | undefined }));
    }
    const total = breakdown.byChannel.reduce((s: number, c: InsightAgg) => s + c.spend, 0) || 1;
    const COLORS = [
      "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4",
      "#f97316", "#84cc16", "#14b8a6", "#a855f7", "#fb923c", "#0284c7", "#6b7280"
    ];

    return breakdown.byChannel.map((c, i) => ({
      name: c.name as string,
      value: Number(((c.spend / total) * 100).toFixed(1)),
      spend: c.spend as number | undefined,
      color: COLORS[i % COLORS.length]
    }));
  }, [breakdown]);

  // Aggregate total spend from channel split to show in the center of the Donut
  const totalSpend = useMemo(() => {
    if (!breakdown?.byChannel?.length) return 0;
    return breakdown.byChannel.reduce((s: number, c: InsightAgg) => s + c.spend, 0);
  }, [breakdown]);

  const marketSplit = useMemo(() => {
    if (!breakdown?.byMarket?.length) return [];
    const total = breakdown.byMarket.reduce((s: number, m: InsightAgg) => s + m.spend, 0) || 1;
    // Thị trường giờ lấy từ bảng Team (đồng bộ từ AutomationGenVideo) nên chi tiết hơn hai
    // lát Việt Nam/Global như trước — thiếu màu là các lát mới đều xám giống nhau.
    const colors: Record<string, string> = {
      "Việt Nam": "#10b981", // Green
      "Global": "#8b5cf6",   // Purple
      "Nhật Bản": "#ef4444", // Red
      "Thái Lan": "#f59e0b", // Amber
      "Indonesia": "#06b6d4", // Cyan
      "Khác": "#6b7280"      // Gray
    };
    return breakdown.byMarket.map((m) => ({
      name: m.name,
      value: Number(((m.spend / total) * 100).toFixed(1)),
      spend: m.spend,
      color: colors[m.name] || "#6b7280"
    }));
  }, [breakdown]);

  const industrySplit = useMemo(() => {
    if (!breakdown?.byIndustry?.length) return [];
    const total = breakdown.byIndustry.reduce((s: number, ind: InsightAgg) => s + ind.spend, 0) || 1;
    // Khoá phải khớp TEAM_INDUSTRY ở adsVCB_BE/src/ads/ads.service.ts — thiếu khoá nào thì
    // lát đó rơi về màu xám mặc định.
    const colors: Record<string, string> = {
      "Kim hoàn": "#f59e0b", // Amber/Gold
      "Đồ da": "#3b82f6",    // Blue
      "Đá quý": "#8b5cf6",   // Purple
      "Khác": "#6b7280"      // Gray
    };
    return breakdown.byIndustry.map((ind) => ({
      name: ind.name,
      value: Number(((ind.spend / total) * 100).toFixed(1)),
      spend: ind.spend,
      color: colors[ind.name] || "#6b7280"
    }));
  }, [breakdown]);

  const teamSpendData = useMemo(() => {
    if (!breakdown?.byTeam?.length) return [];
    return breakdown.byTeam
      .filter((t) => t?.name && t.name !== "Không xác định" && !t.name.includes("Chưa khai báo"))
      .map((t) => ({
        name: t.name,
        spend: t.spend
      }))
      .sort((a, b) => b.spend - a.spend);
  }, [breakdown]);

  const staffSpendData = useMemo(() => {
    if (!breakdown?.byStaff?.length) return [];
    return breakdown.byStaff
      .map((s) => ({ name: s.name, spend: s.spend }))
      .sort((a, b) => b.spend - a.spend);
  }, [breakdown]);

  // Chi phí ads đổ vào từng kênh, gộp theo người QUẢN LÝ kênh đó (Channel.staff) — khác
  // staffSpendData ở trên, vốn là người CHẠY ads suy từ tên chiến dịch.
  const channelManagerSpendData = useMemo(() => {
    if (!breakdown?.byChannelManager?.length) return [];
    return breakdown.byChannelManager
      .map((s) => ({ name: s.name, spend: s.spend }))
      .sort((a, b) => b.spend - a.spend);
  }, [breakdown]);
  const channelManagerUnmatchedPct = useMemo(() => {
    const total = channelManagerSpendData.reduce((s, c) => s + c.spend, 0);
    if (total <= 0) return 0;
    const unmatched = channelManagerSpendData.find((c) => c.name === "Chưa gắn quản lý kênh")?.spend ?? 0;
    return Math.round((unmatched / total) * 100);
  }, [channelManagerSpendData]);

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
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie data={channelSplit} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={2} dataKey="value" stroke="none">
                    {channelSplit.map((c) => <Cell key={c.name} fill={c.color} />)}
                    <Label value={totalSpend > 0 ? fmtCompact(totalSpend) : "100%"} position="center" fill={labelFill} fontSize={totalSpend > 0 ? 11 : 14} fontWeight="bold" />
                  </Pie>
                  <RTooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 flex flex-col gap-2.5 max-h-[170px] overflow-y-auto pr-1 custom-scrollbar">
              {channelSplit.map((c) => (
                <div key={c.name} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[14px]">
                    <span className="flex items-center gap-1.5 text-foreground font-medium">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                      {c.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {c.spend !== undefined && (
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{fmtVndShort(c.spend)}</span>
                      )}
                      <span className="font-semibold text-foreground text-xs bg-muted px-1.5 py-0.5 rounded">{c.value}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-card overflow-hidden">
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
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
      {(breakdown?.byMarket?.length ?? 0) > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Phân bổ theo Thị trường */}
          <Panel className="lg:col-span-3" title="Phân bổ thị trường" subtitle="Chi phí theo thị trường">
            <div className="flex flex-col gap-3">
              <div className="w-full h-[120px] flex justify-center">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie data={marketSplit} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value" stroke="none">
                      {marketSplit.map((c) => <Cell key={c.name} fill={c.color} />)}
                      <Label value="Thị trường" position="center" fill={labelFill} fontSize={10} fontWeight="bold" />
                    </Pie>
                    <RTooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1.5 px-2">
                {marketSplit.map((c) => (
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
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie data={industrySplit} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value" stroke="none">
                      {industrySplit.map((c) => <Cell key={c.name} fill={c.color} />)}
                      <Label value="Ngành hàng" position="center" fill={labelFill} fontSize={10} fontWeight="bold" />
                    </Pie>
                    <RTooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1.5 px-2">
                {industrySplit.map((c) => (
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
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={teamSpendData} margin={{ top: 22, right: 8, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                  <XAxis dataKey="name" stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={45} />
                  <YAxis stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => fmtCompact(v)} />
                  <RTooltip contentStyle={tooltipStyle} cursor={{ fill: cursor }} formatter={(v) => [fmtNum(Number(v)) + "đ", "Chi phí"]} />
                  <Bar dataKey="spend" fill="#10b981" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="spend" position="top" formatter={(v) => fmtVndShort(Number(v ?? 0))} style={{ fill: labelFill, fontSize: "10px", fontWeight: "600" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          {/* Chi phí quảng cáo theo Nhân viên */}
          <Panel className="lg:col-span-6" title="Chi phí quảng cáo theo Nhân viên" subtitle="Người chạy suy từ tên chiến dịch">
            {staffSpendData.length > 0 ? (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={staffSpendData} margin={{ top: 22, right: 8, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                    <XAxis dataKey="name" stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={45} />
                    <YAxis stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => fmtCompact(v)} />
                    <RTooltip contentStyle={tooltipStyle} cursor={{ fill: cursor }} formatter={(v) => [fmtNum(Number(v)) + "đ", "Chi phí"]} />
                    <Bar dataKey="spend" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={56}>
                      <LabelList dataKey="spend" position="top" formatter={(v) => fmtVndShort(Number(v ?? 0))} style={{ fill: labelFill, fontSize: "10px", fontWeight: "600" }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[120px] flex items-center justify-center text-sm text-muted-foreground">Chưa có dữ liệu</div>
            )}
          </Panel>

          {/* Chi phí ads theo Người quản lý kênh (khác người CHẠY ads ở panel trên) */}
          <Panel
            className="lg:col-span-6"
            title="Chi phí quảng cáo theo Người quản lý kênh"
            subtitle={
              channelManagerUnmatchedPct > 0
                ? `Người xây/quản lý kênh · còn ${channelManagerUnmatchedPct}% chi phí chưa nối được kênh (thiếu pageId)`
                : "Người xây/quản lý kênh có video được lên ads"
            }
          >
            {channelManagerSpendData.length > 0 ? (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={channelManagerSpendData} margin={{ top: 22, right: 8, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                    <XAxis dataKey="name" stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={45} />
                    <YAxis stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => fmtCompact(v)} />
                    <RTooltip contentStyle={tooltipStyle} cursor={{ fill: cursor }} formatter={(v) => [fmtNum(Number(v)) + "đ", "Chi phí"]} />
                    <Bar dataKey="spend" radius={[4, 4, 0, 0]} maxBarSize={56}>
                      {channelManagerSpendData.map((c) => (
                        <Cell key={c.name} fill={c.name === "Chưa gắn quản lý kênh" ? "#6b7280" : "#8b5cf6"} />
                      ))}
                      <LabelList dataKey="spend" position="top" formatter={(v) => fmtVndShort(Number(v ?? 0))} style={{ fill: labelFill, fontSize: "10px", fontWeight: "600" }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[120px] flex items-center justify-center text-sm text-muted-foreground">Chưa có dữ liệu</div>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
