"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { useChartColors } from "@/lib/chartTheme";
import {
  CaretDown,
  FacebookLogo,
  TiktokLogo,
  YoutubeLogo,
  InstagramLogo,
  Eye,
  TrendUp,
  Info,
  Calendar,
  Tag,
  Star,
  FileText,
  Funnel
} from "@phosphor-icons/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import {
  productionContentData,
  topProductionContent,
  topSkuDataRecord as mockTopSkuDataRecord,
  topSkuCreateRecord as mockTopSkuCreateRecord,
  linePerformanceDataRecord,
  linePerformanceCreateRecord,
  contentStylePerformance,
  detailChannelPerformance,
  detailStaffPerformance,
  staffKpiBarData,
  staffTaskCompletionData,
  metaRawContentList,
  tiktokRawContentList,
  youtubeRawContentList
} from "../manage/mockData";

// Báo cáo content thật từ BE (/content/report). Các khối chưa có nguồn thật vẫn dùng mock.
type Grp = { name: string; views: number; count: number };
type Report = {
  kpis: { views: number; interactions: number; likes: number; comments: number; shares: number; followers: number; videoCount: number };
  byPlatform: Grp[];
  byConcept: Grp[];
  byLine: Grp[];
  byTeam: Grp[];
  byProduct: Grp[];
  winRate: { win: number; notWin: number; total: number };
  channelsByPlatform: { name: string; count: number }[];
  trendByPlatform: { date: string; FACEBOOK: number; TIKTOK: number; INSTAGRAM: number; YOUTUBE: number }[];
  topVideos: { videoId: string; platform: string; caption: string | null; postUrl: string | null; views: number; likes: number; channelName: string | null; staffName: string | null }[];
  topChannels: { name: string; platform: string; views: number; followers: number; count: number }[];
  topStaff: { name: string; team: string | null; views: number; count: number }[];
};
const PLATFORM_COLORS: Record<string, string> = {
  FACEBOOK: "#3b82f6", TIKTOK: "#db2777", INSTAGRAM: "#e1306c", YOUTUBE: "#dc2626",
};
const CONCEPT_COLORS: Record<string, string> = { "Mới": "#10b981", "Cũ": "#3b82f6", "Khác": "#f59e0b" };
const LINE_COLORS: Record<string, string> = { A4: "#ef4444", A1: "#10b981", A2: "#3b82f6", A3: "#8b5cf6", A5: "#f59e0b", "Khác": "#6b7280" };
const PLATFORM_LABEL: Record<string, string> = { FACEBOOK: "Facebook", TIKTOK: "TikTok", INSTAGRAM: "Instagram", YOUTUBE: "YouTube" };
const fmtNum = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n || 0));
const fmtCompact = (n: number) => {
  const a = Math.abs(n || 0);
  if (a >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (a >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (a >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return fmtNum(n);
};

export default function ContentOverviewPage() {
  const chart = useChartColors();
  const [report, setReport] = useState<Report | null>(null);
  useEffect(() => {
    apiGet("/content/report").then(setReport).catch(() => {});
  }, []);

  const k = report?.kpis;
  // KPI thật (định dạng chuỗi như mock cũ); fallback "—" khi chưa tải xong.
  const kpi = k
    ? { views: fmtNum(k.views), interactions: fmtNum(k.interactions), likes: fmtNum(k.likes), comments: fmtNum(k.comments), followers: fmtNum(k.followers) }
    : { views: "—", interactions: "—", likes: "—", comments: "—", followers: "—" };
  const totalViewsLabel = k ? fmtCompact(k.views) : "—";
  // Donut nền tảng thật (% theo views).
  const platformData = report?.byPlatform?.length
    ? (() => {
        const tot = report.byPlatform.reduce((s, p) => s + p.views, 0) || 1;
        return report.byPlatform.map((p) => ({
          name: p.name,
          value: Number(((p.views / tot) * 100).toFixed(2)),
          color: PLATFORM_COLORS[p.name] || "#64748b",
        }));
      })()
    : [];

  // ===== Map data thật → đúng shape các khối mock (giữ nguyên JSX) =====
  const toDonut = (arr: Grp[] | undefined, colors: Record<string, string>) => {
    if (!arr?.length) return [];
    const tot = arr.reduce((s, x) => s + x.views, 0) || 1;
    return arr.map((x) => ({ name: x.name, value: Number(((x.views / tot) * 100).toFixed(2)), color: colors[x.name] || "#64748b" }));
  };
  const conceptDistributionData = toDonut(report?.byConcept, CONCEPT_COLORS);
  const contentLineDistributionData = toDonut(report?.byLine, LINE_COLORS);
  const postContentData = report?.winRate
    ? (() => { const t = report.winRate.total || 1; return [
        { name: "Win", value: Number(((report.winRate.win / t) * 100).toFixed(1)), color: "#10b981" },
        { name: "Not Win", value: Number(((report.winRate.notWin / t) * 100).toFixed(1)), color: "#ef4444" },
      ]; })()
    : [];
  const channelsDistributionData = report?.channelsByPlatform?.length
    ? (() => { const t = report.channelsByPlatform.reduce((s, x) => s + x.count, 0) || 1;
        return report.channelsByPlatform.map((x) => ({ name: PLATFORM_LABEL[x.name] || x.name, value: Number(((x.count / t) * 100).toFixed(1)), color: PLATFORM_COLORS[x.name] || "#64748b" })); })()
    : [];
  const viewsByTeamData = report?.byTeam ? report.byTeam.map((x) => ({ name: x.name, views: x.views })) : [];
  const contentByTeamData = report?.byTeam ? [...report.byTeam].sort((a, b) => b.count - a.count).map((x) => ({ name: x.name, count: x.count })) : [];
  const viewsTrendData = report?.trendByPlatform
    ? report.trendByPlatform.map((d) => ({ name: d.date.slice(5).replace("-", "/"), Facebook: d.FACEBOOK, Instagram: d.INSTAGRAM, TikTok: d.TIKTOK, YouTube: d.YOUTUBE }))
    : [];
  const topVideosByView = report?.topVideos ? report.topVideos.map((v, i) => ({ id: i + 1, caption: v.caption || "", link: v.postUrl || "#", views: fmtNum(v.views) })) : [];
  const topChannelsByView = report?.topChannels ? report.topChannels.map((c) => ({ platform: PLATFORM_LABEL[c.platform] || c.platform, name: c.name, views: fmtNum(c.views), follows: fmtNum(c.followers) })) : [];
  const topStaffByView = report?.topStaff ? report.topStaff.map((s, i) => ({ id: i + 1, name: s.name, team: s.team || "-", views: fmtNum(s.views) })) : [];
  const realTopSkuData = report?.byProduct ? report.byProduct.filter(x => x.name !== 'Khác').map(x => ({ sku: x.name, count: x.count, views: fmtNum(x.views) })).slice(0, 10) : [];
  const topSkuDataRecord = realTopSkuData.length ? realTopSkuData : mockTopSkuDataRecord;
  const topSkuCreateRecord = realTopSkuData.length ? realTopSkuData : mockTopSkuCreateRecord;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground">Tổng quan content</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tổng hợp hiệu quả nội dung organic trên các kênh (views, tương tác, follow…)
        </p>
      </div>

      {/* Quick Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg p-3 text-xs flex items-center gap-2">
        <Info size={16} />
        <span>Màn hình hiển thị Báo cáo hiệu quả nội dung (Content Performance). Lựa chọn các bộ lọc phía trên để lọc chi tiết.</span>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center gap-3">
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs font-semibold cursor-pointer">
          <Funnel size={14} />
          Lưu bộ lọc
        </button>
        
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border rounded-lg text-xs text-muted-foreground">
          <Calendar size={14} />
          <span>Thời gian: <strong className="text-foreground">Tháng trước hoặc tháng này</strong></span>
          <button className="text-muted-foreground hover:text-foreground ml-1">×</button>
        </div>

        {/* Dropdowns */}
        {["Nền tảng", "Kênh", "Team", "Nhân viên", "Thời gian ghi dữ liệu"].map((filter, i) => (
          <div key={i} className="relative">
            <select className="bg-muted border border-border text-foreground hover:border-border rounded-lg px-3 py-1.5 pr-8 text-xs appearance-none focus:outline-none focus:border-blue-500 cursor-pointer min-w-[120px]">
              <option>{filter}</option>
              <option>Tất cả {filter}</option>
            </select>
            <CaretDown size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Top Row: Donut + KPI Card Grid + Production/Post Donuts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Donut platform views */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Tổng lượt xem theo nền tảng</h3>
            <div className="relative w-full h-[160px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-foreground">{totalViewsLabel}</span>
                <span className="text-[10px] text-muted-foreground">Tổng</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            {platformData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground capitalize">{item.name}:</span>
                <span className="text-foreground font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* KPI Stats Cards Box */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Các chỉ số tương tác chính</h3>
            <div className="grid grid-cols-2 gap-4">
              
              <div className="bg-muted/30 border border-border rounded-lg p-3.5 col-span-2">
                <p className="text-[10px] text-muted-foreground font-medium">Tổng Lượt Xem</p>
                <p className="text-2xl font-black text-foreground mt-1">{kpi.views}</p>
              </div>
              
              <div className="bg-muted/30 border border-border rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground font-medium">Tổng Tương Tác</p>
                <p className="text-lg font-bold text-foreground mt-1">{kpi.interactions}</p>
              </div>
              
              <div className="bg-muted/30 border border-border rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground font-medium">Lượt Thích</p>
                <p className="text-lg font-bold text-foreground mt-1">{kpi.likes}</p>
              </div>
              
              <div className="bg-muted/30 border border-border rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground font-medium">Bình Luận</p>
                <p className="text-lg font-bold text-foreground mt-1">{kpi.comments}</p>
              </div>
              
              <div className="bg-muted/30 border border-border rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground font-medium">Tổng Followers</p>
                <p className="text-lg font-bold text-foreground mt-1">{kpi.followers}</p>
              </div>

            </div>
          </div>
        </div>

        {/* Post/Production Donuts */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Phân tích Win/Not Win</h3>
            <div className="grid grid-cols-2 gap-4">
              
              {/* Noi dung dang tai */}
              <div className="flex flex-col items-center">
                <p className="text-[10px] text-muted-foreground font-semibold mb-2">Nội dung đăng tải</p>
                <div className="relative w-full h-[100px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={postContentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={45}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {postContentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-foreground">17,213</span>
                    <span className="text-[8px] text-muted-foreground">Tổng</span>
                  </div>
                </div>
                <div className="flex justify-center gap-3 mt-2 text-[10px]">
                  <span className="text-green-500">Win: 8.9%</span>
                  <span className="text-red-500">Not: 91.1%</span>
                </div>
              </div>

              {/* Noi dung san xuat */}
              <div className="flex flex-col items-center">
                <p className="text-[10px] text-muted-foreground font-semibold mb-2">Nội dung sản xuất</p>
                <div className="relative w-full h-[100px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productionContentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={45}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {productionContentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-foreground">7,161</span>
                    <span className="text-[8px] text-muted-foreground">Tổng</span>
                  </div>
                </div>
                <div className="flex justify-center gap-3 mt-2 text-[10px]">
                  <span className="text-green-500">Win: 15%</span>
                  <span className="text-red-500">Not: 85%</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Section: Tổng quan hiệu quả (Trends Line Chart & Channels Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Xu huong luot xem */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-md flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendUp size={16} className="text-blue-500" />
              Xu hướng lượt xem (Views Trends)
            </h3>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewsTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFacebook" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTikTok" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#db2777" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#db2777" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000000}M`} />
                <Tooltip contentStyle={chart.tooltip} />
                <Area type="monotone" dataKey="Facebook" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorFacebook)" name="Facebook" />
                <Area type="monotone" dataKey="TikTok" stroke="#db2777" strokeWidth={2} fillOpacity={1} fill="url(#colorTikTok)" name="TikTok" />
                <Area type="monotone" dataKey="Instagram" stroke="#e1306c" strokeWidth={2} fill="none" name="Instagram" />
                <Area type="monotone" dataKey="YouTube" stroke="#dc2626" strokeWidth={2} fill="none" name="YouTube" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tong so kenh donut */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Tổng số kênh</h3>
            <div className="relative w-full h-[180px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelsDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {channelsDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-foreground">152</span>
                <span className="text-[10px] text-muted-foreground">Tổng số kênh</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {channelsDistributionData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground capitalize">{item.name}:</span>
                <span className="text-foreground font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Section: Team & Content Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tong luot view theo team */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-md">
          <h3 className="text-sm font-semibold text-foreground mb-4">Tổng lượt view theo team</h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewsByTeamData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={9} />
                <YAxis stroke="#6b7280" fontSize={9} />
                <Tooltip formatter={(val) => `${val}M`} />
                <Bar dataKey="views" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tong noi dung theo team (Horizontal) */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-md">
          <h3 className="text-sm font-semibold text-foreground mb-4">Tổng nội dung được tạo theo team</h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={contentByTeamData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid stroke={chart.grid} horizontal={false} />
                <XAxis type="number" stroke="#6b7280" fontSize={9} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={9} width={45} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Phan bo theo tuyen noi dung */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Phân bổ theo tuyến nội dung</h3>
            <div className="relative w-full h-[150px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contentLineDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {contentLineDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-base font-bold text-foreground">17,224</span>
                <span className="text-[9px] text-muted-foreground">Tổng</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[9px] mt-2">
            {contentLineDistributionData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">{item.name}:</span>
                <span className="text-foreground font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Section: Concept & SKU analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Concept Distribution */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Phân bổ theo concept</h3>
            <div className="relative w-full h-[150px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conceptDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {conceptDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-base font-bold text-foreground">96,356</span>
                <span className="text-[9px] text-muted-foreground">Tổng</span>
              </div>
            </div>
          </div>
          <div className="flex justify-around gap-1.5 text-[10px] mt-2">
            {conceptDistributionData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">{item.name}:</span>
                <span className="text-foreground font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Production Content Table */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-md">
          <h3 className="text-xs font-semibold text-foreground mb-3">Top nội dung sản xuất nhiều video nhất</h3>
          <div className="overflow-y-auto max-h-[190px] text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-[10px]">
                  <th className="pb-1.5">Nội dung</th>
                  <th className="pb-1.5 text-right">Số video</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {topProductionContent.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="py-1.5 max-w-[140px] truncate" title={row.name}>{row.name}</td>
                    <td className="py-1.5 text-right font-bold text-foreground">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Sku data record */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-md">
          <h3 className="text-xs font-semibold text-foreground mb-3">Top sản phẩm sản xuất video nhiều nhất (ghi nhận)</h3>
          <div className="overflow-y-auto max-h-[190px] text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-1.5">SKU</th>
                  <th className="pb-1.5 text-right">Videos</th>
                  <th className="pb-1.5 text-right">Xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {topSkuDataRecord.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="py-1.5 font-semibold text-foreground">{row.sku}</td>
                    <td className="py-1.5 text-right">{row.count}</td>
                    <td className="py-1.5 text-right text-blue-400">{row.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Sku create record */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-md">
          <h3 className="text-xs font-semibold text-foreground mb-3">Top sản phẩm sản xuất video nhiều nhất (thời gian tạo)</h3>
          <div className="overflow-y-auto max-h-[190px] text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-1.5">SKU</th>
                  <th className="pb-1.5 text-right">Videos</th>
                  <th className="pb-1.5 text-right">Xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {topSkuCreateRecord.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="py-1.5 font-semibold text-foreground">{row.sku}</td>
                    <td className="py-1.5 text-right">{row.count}</td>
                    <td className="py-1.5 text-right text-amber-500">{row.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Section: Tables grid (detailed line/format performance) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hieu suat tuyen ghi du lieu */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-md">
          <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
            <Tag size={14} className="text-blue-500" />
            Hiệu suất tuyến nội dung (Thời gian ghi dữ liệu)
          </h4>
          <div className="overflow-x-auto text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2 font-medium">Tuyến</th>
                  <th className="pb-2 text-right">Số lượng</th>
                  <th className="pb-2 text-right">Lượt xem</th>
                  <th className="pb-2 text-right">Tương tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {linePerformanceDataRecord.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="py-2 font-bold text-foreground">{row.line}</td>
                    <td className="py-2 text-right">{row.count}</td>
                    <td className="py-2 text-right text-blue-400">{row.views}</td>
                    <td className="py-2 text-right text-muted-foreground">{row.interactions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hieu suat tuyen thoi gian tao */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-md">
          <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
            <Tag size={14} className="text-amber-500" />
            Hiệu suất tuyến nội dung (Thời gian tạo nội dung)
          </h4>
          <div className="overflow-x-auto text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2 font-medium">Tuyến</th>
                  <th className="pb-2 text-right">Số lượng</th>
                  <th className="pb-2 text-right">Lượt xem</th>
                  <th className="pb-2 text-right">Tương tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {linePerformanceCreateRecord.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="py-2 font-bold text-foreground">{row.line}</td>
                    <td className="py-2 text-right">{row.count}</td>
                    <td className="py-2 text-right text-amber-500">{row.views}</td>
                    <td className="py-2 text-right text-muted-foreground">{row.interactions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hieu suat loai noi dung */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-md">
          <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
            <FileText size={14} className="text-pink-600" />
            Hiệu suất theo loại nội dung
          </h4>
          <div className="overflow-x-auto text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2 font-medium">Loại</th>
                  <th className="pb-2 text-right">Số lượng</th>
                  <th className="pb-2 text-right">Lượt xem</th>
                  <th className="pb-2 text-right">Tương tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {contentStylePerformance.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="py-2 font-bold text-foreground">{row.type}</td>
                    <td className="py-2 text-right">{row.count}</td>
                    <td className="py-2 text-right text-pink-400">{row.views}</td>
                    <td className="py-2 text-right text-muted-foreground">{row.interactions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Section: Top Performance list grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Kenh theo view */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-md">
          <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
            <Star size={14} className="text-blue-500" />
            Top Kênh theo view
          </h3>
          <div className="overflow-y-auto max-h-[220px] text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2 font-medium">Nền tảng</th>
                  <th className="pb-2 font-medium">Kênh</th>
                  <th className="pb-2 text-right">Lượt xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {topChannelsByView.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="py-2">
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold ${
                        row.platform === "Facebook" ? "bg-blue-500/10 text-blue-400" : "bg-pink-500/10 text-pink-400"
                      }`}>
                        {row.platform}
                      </span>
                    </td>
                    <td className="py-2 text-foreground truncate max-w-[100px]">{row.name}</td>
                    <td className="py-2 text-right font-semibold text-foreground">{row.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Video theo view */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-md">
          <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
            <Star size={14} className="text-pink-500" />
            Top Video theo view
          </h3>
          <div className="overflow-y-auto max-h-[220px] text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2 font-medium">Video</th>
                  <th className="pb-2 text-right">Lượt xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {topVideosByView.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/20">
                    <td className="py-2 text-foreground truncate max-w-[160px]" title={row.caption}>{row.caption}</td>
                    <td className="py-2 text-right font-semibold text-foreground">{row.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Nhan su theo view */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-md">
          <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
            <Star size={14} className="text-amber-500" />
            Top Nhân sự theo view
          </h3>
          <div className="overflow-y-auto max-h-[220px] text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2 font-medium">Nhân viên</th>
                  <th className="pb-2 font-medium">Team</th>
                  <th className="pb-2 text-right">Lượt xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {topStaffByView.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/20">
                    <td className="py-2 text-foreground font-medium">{row.name}</td>
                    <td className="py-2 font-semibold text-blue-400">{row.team}</td>
                    <td className="py-2 text-right font-semibold text-foreground">{row.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Section: Hiệu suất chi tiết */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Hieu suat chi tiet kenh */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-md">
          <h3 className="text-xs font-bold text-foreground mb-4">Hiệu suất chi tiết theo kênh</h3>
          <div className="overflow-x-auto text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2 font-medium">Kênh</th>
                  <th className="pb-2 text-right">Lượt xem</th>
                  <th className="pb-2 text-right">Follows</th>
                  <th className="pb-2 text-right">Likes</th>
                  <th className="pb-2 text-right">Bình luận</th>
                  <th className="pb-2 text-right">Chia sẻ</th>
                  <th className="pb-2 text-right">Thời gian xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {detailChannelPerformance.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="py-2.5 font-semibold text-foreground max-w-[100px] truncate">{row.channel}</td>
                    <td className="py-2.5 text-right text-blue-400">{row.views}</td>
                    <td className="py-2.5 text-right">{row.follows}</td>
                    <td className="py-2.5 text-right">{row.likes}</td>
                    <td className="py-2.5 text-right">{row.comments}</td>
                    <td className="py-2.5 text-right text-pink-400">{row.shares}</td>
                    <td className="py-2.5 text-right text-muted-foreground">{row.avgWatch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hieu suat chi tiet team */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-md">
          <h3 className="text-xs font-bold text-foreground mb-4">Hiệu suất chi tiết theo nhân sự</h3>
          <div className="overflow-x-auto text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2 font-medium">Nhân sự</th>
                  <th className="pb-2 text-right">Lượt xem</th>
                  <th className="pb-2 text-right">Tiếp cận</th>
                  <th className="pb-2 text-right">Likes</th>
                  <th className="pb-2 text-right">Bình luận</th>
                  <th className="pb-2 text-right">Chia sẻ</th>
                  <th className="pb-2 text-right">Lưu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {detailStaffPerformance.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="py-2.5 font-semibold text-foreground">{row.name}</td>
                    <td className="py-2.5 text-right text-blue-400">{row.views}</td>
                    <td className="py-2.5 text-right text-green-500">{row.reach}</td>
                    <td className="py-2.5 text-right">{row.likes}</td>
                    <td className="py-2.5 text-right">{row.comments}</td>
                    <td className="py-2.5 text-right text-pink-400">{row.shares}</td>
                    <td className="py-2.5 text-right text-muted-foreground">{row.saves}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Section: Hiệu quả KPI của nhân sự */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-md">
        <h3 className="text-sm font-semibold text-foreground mb-4">Hiệu quả KPI của nhân sự</h3>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Top nhân sự đạt % KPI cao nhất chart */}
          <div className="xl:col-span-1 border-r border-border pr-4">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Top nhân sự đạt % KPI cao nhất</h4>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={staffKpiBarData}
                  margin={{ top: 10, right: 10, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" stroke="#6b7280" fontSize={8} tickFormatter={(val) => `${val}%`} />
                  <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={8} width={70} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="percentage" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tỉ lệ hoàn thành task theo nhân sự table */}
          <div className="xl:col-span-2">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Tỉ lệ hoàn thành task theo nhân sự</h4>
            <div className="overflow-x-auto text-[10px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="pb-2 font-medium">Nhân sự</th>
                    <th className="pb-2 text-right">Task tự động</th>
                    <th className="pb-2 text-right">Task sáng tạo</th>
                    <th className="pb-2 text-right">Task hoàn thành</th>
                    <th className="pb-2 text-right">KPI ngày</th>
                    <th className="pb-2 text-right text-blue-400">% KPI ngày</th>
                    <th className="pb-2 text-right">KPI tháng</th>
                    <th className="pb-2 text-right text-amber-500">% KPI tháng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {staffTaskCompletionData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      <td className="py-2 font-semibold text-foreground">{row.name}</td>
                      <td className="py-2 text-right">{row.auto}</td>
                      <td className="py-2 text-right">{row.creative}</td>
                      <td className="py-2 text-right text-green-500 font-bold">{row.done}</td>
                      <td className="py-2 text-right">{row.dailyKpi}</td>
                      <td className="py-2 text-right text-blue-400 font-semibold">{row.dailyPct}</td>
                      <td className="py-2 text-right">{row.monthlyKpi}</td>
                      <td className="py-2 text-right text-amber-500 font-semibold">{row.monthlyPct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Section: Raw data lists (Meta Content, Tiktok Content, Youtube Content) */}
      <div className="flex flex-col gap-6">
        
        {/* Meta Content Table */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FacebookLogo size={18} className="text-blue-500" />
              Meta Content
            </h3>
          </div>
          <div className="overflow-x-auto text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2">Caption</th>
                  <th className="pb-2">Kênh</th>
                  <th className="pb-2">Ngày tạo</th>
                  <th className="pb-2">Tuyến</th>
                  <th className="pb-2 text-right">Lượt xem</th>
                  <th className="pb-2 text-right">Tiếp cận</th>
                  <th className="pb-2 text-right">Thích</th>
                  <th className="pb-2 text-right">Bình luận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {metaRawContentList.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 group">
                    <td className="py-2.5 max-w-[180px] truncate text-foreground group-hover:text-blue-400 transition-colors" title={row.caption}>{row.caption}</td>
                    <td className="py-2.5 truncate max-w-[140px]" title={row.channel}>{row.channel}</td>
                    <td className="py-2.5 text-muted-foreground">{row.date}</td>
                    <td className="py-2.5 font-bold text-foreground">{row.line}</td>
                    <td className="py-2.5 text-right text-blue-400 font-semibold">{row.views}</td>
                    <td className="py-2.5 text-right text-green-500">{row.reach}</td>
                    <td className="py-2.5 text-right">{row.likes}</td>
                    <td className="py-2.5 text-right">{row.comments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tiktok Content Table */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TiktokLogo size={18} className="text-pink-500" />
              TikTok Content
            </h3>
          </div>
          <div className="overflow-x-auto text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2">Caption</th>
                  <th className="pb-2">Kênh</th>
                  <th className="pb-2">Ngày tạo</th>
                  <th className="pb-2">Concept</th>
                  <th className="pb-2">Tuyến</th>
                  <th className="pb-2 text-right">Lượt xem</th>
                  <th className="pb-2 text-right">Thích</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {tiktokRawContentList.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 group">
                    <td className="py-2.5 max-w-[180px] truncate text-foreground group-hover:text-pink-400 transition-colors" title={row.caption}>{row.caption}</td>
                    <td className="py-2.5 truncate max-w-[140px]" title={row.channel}>{row.channel}</td>
                    <td className="py-2.5 text-muted-foreground">{row.date}</td>
                    <td className="py-2.5 font-semibold text-blue-400">{row.concept}</td>
                    <td className="py-2.5 font-bold text-foreground">{row.line}</td>
                    <td className="py-2.5 text-right text-pink-400 font-semibold">{row.views}</td>
                    <td className="py-2.5 text-right">{row.likes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Youtube Content Table */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <YoutubeLogo size={18} className="text-red-500" />
              YouTube Content
            </h3>
          </div>
          <div className="overflow-x-auto text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2">Caption</th>
                  <th className="pb-2">Kênh</th>
                  <th className="pb-2">Ngày tạo</th>
                  <th className="pb-2">Concept</th>
                  <th className="pb-2">Tuyến</th>
                  <th className="pb-2 text-right">Lượt xem</th>
                  <th className="pb-2 text-right">Thích</th>
                  <th className="pb-2 text-right">Bình luận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {youtubeRawContentList.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 group">
                    <td className="py-2.5 max-w-[180px] truncate text-foreground group-hover:text-red-400 transition-colors" title={row.caption}>{row.caption}</td>
                    <td className="py-2.5 truncate max-w-[140px]" title={row.channel}>{row.channel}</td>
                    <td className="py-2.5 text-muted-foreground">{row.date}</td>
                    <td className="py-2.5 text-muted-foreground">{row.concept}</td>
                    <td className="py-2.5 font-bold text-foreground">{row.line}</td>
                    <td className="py-2.5 text-right text-red-500 font-semibold">{row.views}</td>
                    <td className="py-2.5 text-right">{row.likes}</td>
                    <td className="py-2.5 text-right">{row.comments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Info Card */}
      <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3 mt-4 text-xs text-muted-foreground">
        <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-foreground">Giao diện phác thảo (Design Only)</span>.
          Các tính năng đăng tải tự động, cấu hình phân công lịch đăng và thu thập video từ link mạng xã hội hiện đang hoạt động ở chế độ Demo Giao Diện (Mockup).
        </div>
      </div>

    </div>
  );
}
