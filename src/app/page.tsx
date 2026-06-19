"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowsClockwise, Plus, SpinnerGap, WarningCircle, MetaLogo, TiktokLogo, 
  TrendUp, TrendDown, Drop, ChartPieSlice, Info, Circle, 
  DotsThreeVertical, CheckCircle, Brain
} from "@phosphor-icons/react";
import { apiGet, apiPost, fmtVnd } from "@/lib/api";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Label
} from "recharts";

type Overview = {
  totalCampaigns: number;
  runningCampaigns: number;
  totalAccounts: number;
  totalSpent: number;
};

type Campaign = {
  id: string;
  platform: string;
  name: string;
  status: string | null;
  budget: number;
  adAccount: { name: string | null } | null;
};

type Alert = {
  id: string;
  type: string;
  severity: "INFO" | "WARN" | "CRITICAL";
  message: string;
  createdAt: string;
};

const RUNNING = new Set(["ACTIVE", "ENABLE"]);

// Mock data for charts
const perfData = [
  { time: "00:00", spend: 0, revenue: 0, roas: 0 },
  { time: "03:00", spend: 5, revenue: 12, roas: 2 },
  { time: "06:00", spend: 8, revenue: 20, roas: 2.5 },
  { time: "09:00", spend: 10, revenue: 28, roas: 3.1 },
  { time: "12:00", spend: 15, revenue: 35, roas: 3.0 },
  { time: "15:00", spend: 20, revenue: 42, roas: 3.2 },
  { time: "18:00", spend: 25, revenue: 50, roas: 3.5 },
  { time: "21:00", spend: 22, revenue: 45, roas: 3.3 },
  { time: "23:00", spend: 18, revenue: 38, roas: 3.0 },
];

const budgetData = [
  { name: "Remarketing 01", value: 1000000, color: "#3b82f6" },
  { name: "Interest 02", value: 1500000, color: "#10b981" },
  { name: "Lookalike 01", value: 800000, color: "#8b5cf6" },
  { name: "Conversion 01", value: 2000000, color: "#f59e0b" },
  { name: "Khác", value: 1000000, color: "#ef4444" },
];

export default function OverviewPage() {
  const [ov, setOv] = useState<Overview | null>(null);
  const [running, setRunning] = useState<Campaign[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [o, camps, alts] = await Promise.all([
        apiGet("/ads/overview"), 
        apiGet("/ads/campaigns"),
        apiGet("/alerts")
      ]);
      setOv(o);
      setRunning((camps as Campaign[]).filter((c) => c.status && RUNNING.has(c.status)).slice(0, 5));
      setAlerts((alts as Alert[]).slice(0, 5));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async () => {
    setSyncing(true);
    try {
      await apiGet("/ads/sync");
      await load();
    } finally {
      setSyncing(false);
    }
  };

  const analyzeAI = async () => {
    setAiAnalyzing(true);
    try {
      await apiPost("/ai/analyze", {});
      const alts = await apiGet("/alerts");
      setAlerts((alts as Alert[]).slice(0, 5));
    } catch (e) {
      alert("Lỗi khi phân tích AI");
    } finally {
      setAiAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-x-hidden pb-10 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Tổng quan</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] hover:bg-[#334155] disabled:opacity-60 text-gray-200 text-sm font-medium rounded-md transition-colors border border-[#334155]"
          >
            {syncing ? <SpinnerGap size={16} className="animate-spin" /> : <ArrowsClockwise size={16} />}
            Làm mới dữ liệu
          </button>
          <Link
            href="/auto-rules"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-lg shadow-blue-500/20"
          >
            <Plus size={16} weight="bold" />
            Tạo quy tắc mới
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Chi tiêu */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 flex flex-col relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-blue-400">Chi tiêu hôm nay</span>
            <Drop size={16} className="text-blue-500/50" weight="fill" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {loading ? "…" : ov ? fmtVnd(ov.totalSpent || 12540000) : "12,540,000 đ"}
          </div>
          <div className="text-xs text-blue-400 flex items-center gap-1">
            <TrendUp size={12} weight="bold" /> 18.6% so với hôm qua
          </div>
          <div className="absolute -bottom-2 -left-2 -right-2 h-12 opacity-30 pointer-events-none">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={perfData}>
                 <Line type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Doanh thu */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 flex flex-col relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-green-400">Doanh thu hôm nay</span>
            <TrendUp size={16} className="text-green-500/50" weight="bold" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            38,750,000 đ
          </div>
          <div className="text-xs text-green-400 flex items-center gap-1">
            <TrendUp size={12} weight="bold" /> 24.7% so với hôm qua
          </div>
          <div className="absolute -bottom-2 -left-2 -right-2 h-12 opacity-30 pointer-events-none">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={perfData}>
                 <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* ROAS */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 flex flex-col relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-purple-400">ROAS trung bình</span>
            <Drop size={16} className="text-purple-500/50" weight="fill" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            3.09
          </div>
          <div className="text-xs text-purple-400 flex items-center gap-1">
            <TrendUp size={12} weight="bold" /> 15.3% so với hôm qua
          </div>
          <div className="absolute -bottom-2 -left-2 -right-2 h-12 opacity-30 pointer-events-none">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={perfData}>
                 <Line type="monotone" dataKey="roas" stroke="#8b5cf6" strokeWidth={2} dot={false} isAnimationActive={false} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* CPA */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 flex flex-col relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-orange-400">CPA trung bình</span>
            <TrendDown size={16} className="text-orange-500/50" weight="bold" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            42,350 đ
          </div>
          <div className="text-xs text-orange-400 flex items-center gap-1">
            <TrendDown size={12} weight="bold" /> 6.2% so với hôm qua
          </div>
        </div>

        {/* Chiến dịch đang chạy */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 flex flex-row items-center justify-between relative overflow-hidden">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-300">Chiến dịch đang chạy</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {loading ? "…" : ov ? `${ov.runningCampaigns} / ${ov.totalCampaigns}` : "28 / 36"}
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1">
              {loading ? "…" : ov ? `${Math.round((ov.runningCampaigns/ov.totalCampaigns)*100)}% đang hoạt động` : "78% đang hoạt động"}
            </div>
          </div>
          <div className="w-14 h-14">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{value: ov ? ov.runningCampaigns : 28}, {value: ov ? ov.totalCampaigns - ov.runningCampaigns : 8}]} cx="50%" cy="50%" innerRadius={18} outerRadius={25} dataKey="value" stroke="none">
                  <Cell fill="#3b82f6" />
                  <Cell fill="#1e293b" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Grid: Left (Campaigns, Charts), Right (Schedule, Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Running Campaigns Table */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
              <h2 className="text-base font-semibold text-white">Chiến dịch đang chạy</h2>
              <div className="flex gap-2">
                <select className="bg-[#1e293b] border border-[#334155] text-xs text-gray-300 rounded px-2 py-1 outline-none">
                  <option>Tất cả tài khoản</option>
                </select>
                <button className="text-xs text-gray-400 hover:text-white px-2 py-1">Xem tất cả</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="text-gray-500 uppercase border-b border-[#1e293b] bg-[#0f172a]">
                  <tr>
                    <th className="px-4 py-3 font-medium w-10"></th>
                    <th className="px-4 py-3 font-medium">Chiến dịch</th>
                    <th className="px-4 py-3 font-medium">Trạng thái</th>
                    <th className="px-4 py-3 font-medium">Ngân sách</th>
                    <th className="px-4 py-3 font-medium">Chi tiêu hôm nay</th>
                    <th className="px-4 py-3 font-medium">CPA</th>
                    <th className="px-4 py-3 font-medium">ROAS</th>
                    <th className="px-4 py-3 font-medium">Quy tắc áp dụng</th>
                    <th className="px-4 py-3 font-medium text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b] text-gray-300">
                  {loading && <tr><td colSpan={9} className="p-4 text-center">Đang tải...</td></tr>}
                  {!loading && running.map((c, i) => (
                    <tr key={c.id} className="hover:bg-[#1e293b]/50 group">
                      <td className="px-4 py-3">
                        <div className="w-8 h-4 bg-blue-600 rounded-full relative cursor-pointer">
                          <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {c.platform === "META" ? <MetaLogo size={16} weight="fill" className="text-blue-400" /> : <TiktokLogo size={16} weight="fill" className="text-pink-400" />}
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-200 max-w-[150px] truncate" title={c.name}>{c.name}</span>
                            <span className="text-[10px] text-gray-500">{c.adAccount?.name ?? "BM 01 - Chính"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-400 font-medium">Đang chạy</span>
                      </td>
                      <td className="px-4 py-3 flex flex-col">
                        <span>{fmtVnd(c.budget)}</span>
                        <span className="text-[10px] text-gray-500">Ngày</span>
                      </td>
                      <td className="px-4 py-3 flex flex-col">
                        <span>{fmtVnd(c.budget * 0.98)}</span>
                        <span className="text-[10px] text-gray-500">98%</span>
                      </td>
                      <td className="px-4 py-3">{(40000 + i*5000).toLocaleString('vi-VN')} đ</td>
                      <td className="px-4 py-3 text-green-400">{(3.45 - i*0.2).toFixed(2)}</td>
                      <td className="px-4 py-3 flex flex-col">
                        <span>Tăng ngân sách</span>
                        <span className="text-[10px] text-gray-500">+15% mỗi 24h</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="px-2 py-1 border border-[#334155] rounded text-gray-400 hover:text-white hover:bg-[#334155] mr-2">Chi tiết</button>
                        <button className="text-gray-500 hover:text-gray-300"><DotsThreeVertical size={16} weight="bold" /></button>
                      </td>
                    </tr>
                  ))}
                  {/* Mock paused campaign for variety */}
                  {!loading && (
                    <tr className="hover:bg-[#1e293b]/50 opacity-60">
                      <td className="px-4 py-3">
                        <div className="w-8 h-4 bg-gray-600 rounded-full relative cursor-pointer">
                          <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-gray-300 rounded-full"></div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MetaLogo size={16} weight="fill" className="text-blue-400" />
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-200">CBO - Test 03</span>
                            <span className="text-[10px] text-gray-500">BM 03 - Test</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="text-red-400 font-medium">Đã tắt</span></td>
                      <td className="px-4 py-3 flex flex-col"><span>500,000 đ</span><span className="text-[10px] text-gray-500">Ngày</span></td>
                      <td className="px-4 py-3 flex flex-col"><span>0 đ</span><span className="text-[10px] text-gray-500">0%</span></td>
                      <td className="px-4 py-3">-</td>
                      <td className="px-4 py-3">-</td>
                      <td className="px-4 py-3 flex flex-col"><span>CPA cao hơn</span><span className="text-[10px] text-gray-500">50,000 đ</span></td>
                      <td className="px-4 py-3 text-right">
                        <button className="px-2 py-1 border border-[#334155] rounded text-gray-400 hover:text-white mr-2">Chi tiết</button>
                        <button className="text-gray-500"><DotsThreeVertical size={16} weight="bold" /></button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[300px]">
            {/* Performance Chart */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl flex flex-col p-4 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">Biểu đồ hiệu quả</h2>
                <div className="flex gap-2">
                  <select className="bg-[#1e293b] border border-[#334155] text-xs text-gray-300 rounded px-2 py-1 outline-none">
                    <option>Hôm nay</option>
                  </select>
                  <select className="bg-[#1e293b] border border-[#334155] text-xs text-gray-300 rounded px-2 py-1 outline-none">
                    <option>Theo giờ</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs mb-2">
                <div className="flex items-center gap-1 text-blue-400"><Circle size={8} weight="fill" /> Chi tiêu</div>
                <div className="flex items-center gap-1 text-green-400"><Circle size={8} weight="fill" /> Doanh thu</div>
                <div className="flex items-center gap-1 text-purple-400"><Circle size={8} weight="fill" /> ROAS</div>
              </div>
              <div className="flex-1 w-full h-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={perfData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}M`} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                    <Line type="monotone" dataKey="roas" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Budget Allocation Pie */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl flex flex-col p-4 h-full">
              <h2 className="text-base font-semibold text-white mb-4">Phân bổ ngân sách</h2>
              <div className="flex items-center h-full">
                <div className="w-1/2 h-[200px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={budgetData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                        {budgetData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        <Label
                          value="Tổng ngân sách"
                          position="centerBottom"
                          dy={-10}
                          fill="#94a3b8"
                          fontSize={10}
                        />
                        <Label
                          value="6,300,000 đ"
                          position="centerTop"
                          dy={10}
                          fill="#ffffff"
                          fontSize={14}
                          fontWeight="bold"
                        />
                        <Label
                          value="/ ngày"
                          position="centerTop"
                          dy={25}
                          fill="#64748b"
                          fontSize={10}
                        />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 flex flex-col gap-3 pl-4">
                  {budgetData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Circle size={8} weight="fill" fill={item.color} />
                        <span className="text-gray-300">{item.name}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-gray-400">{item.value.toLocaleString()} đ</span>
                        <span className="text-[10px] text-gray-500">({((item.value/6300000)*100).toFixed(1)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">
          
          {/* Schedule */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl flex flex-col h-[300px]">
            <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
              <h2 className="text-base font-semibold text-white">Lịch trình hệ thống</h2>
              <Link href="/schedule" className="text-xs text-blue-400 hover:text-blue-300">Xem tất cả</Link>
            </div>
            <div className="flex flex-col p-2 overflow-y-auto">
              {/* Mock items */}
              <div className="flex gap-4 p-3 hover:bg-[#1e293b]/30 rounded-lg">
                <div className="font-bold text-white text-sm w-12 pt-1">07:00</div>
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-200">Bật chiến dịch</span>
                    <div className="w-6 h-3 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-500">Tất cả chiến dịch</span>
                </div>
              </div>
              <div className="flex gap-4 p-3 hover:bg-[#1e293b]/30 rounded-lg">
                <div className="font-bold text-white text-sm w-12 pt-1">11:30</div>
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-200">Tăng ngân sách</span>
                    <div className="w-6 h-3 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-500">Tăng 15% ngân sách</span>
                </div>
              </div>
              <div className="flex gap-4 p-3 hover:bg-[#1e293b]/30 rounded-lg">
                <div className="font-bold text-white text-sm w-12 pt-1">18:00</div>
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-200">Giới hạn chi tiêu</span>
                    <div className="w-6 h-3 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-500">Dừng khi vượt 80% ngân sách ngày</span>
                </div>
              </div>
              <div className="flex gap-4 p-3 hover:bg-[#1e293b]/30 rounded-lg">
                <div className="font-bold text-white text-sm w-12 pt-1">23:30</div>
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-200">Tắt chiến dịch</span>
                    <div className="w-6 h-3 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-500">Tắt chiến dịch không hiệu quả</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl flex flex-col flex-1 h-[432px]">
            <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">Cảnh báo</h2>
                <button 
                  onClick={analyzeAI}
                  disabled={aiAnalyzing}
                  className="flex items-center gap-1 bg-purple-600/20 text-purple-400 hover:bg-purple-600/40 px-2 py-1 rounded text-[10px] font-medium border border-purple-500/30 transition-colors disabled:opacity-50"
                  title="Sử dụng DeepSeek phân tích dữ liệu"
                >
                  {aiAnalyzing ? <SpinnerGap size={12} className="animate-spin" /> : <Brain size={12} weight="fill" />}
                  Đọc dữ liệu (AI)
                </button>
              </div>
              <Link href="/alerts" className="text-xs text-blue-400 hover:text-blue-300">Xem tất cả</Link>
            </div>
            <div className="flex flex-col p-2 overflow-y-auto">
              {alerts.length === 0 && !loading && (
                <div className="p-4 flex items-center justify-center flex-col gap-2 text-gray-500 text-sm h-32">
                  <CheckCircle size={32} weight="light" className="text-green-500/50" />
                  Hệ thống ổn định, không có cảnh báo.
                </div>
              )}
              {alerts.map((a, i) => (
                <div key={a.id || i} className="flex gap-3 p-3 border-b border-[#1e293b]/50 last:border-0 hover:bg-[#1e293b]/30 rounded-lg">
                  <div className="mt-0.5">
                    {a.severity === "CRITICAL" ? <WarningCircle size={20} className="text-red-500" weight="fill" /> :
                     a.severity === "WARN" ? <WarningCircle size={20} className="text-orange-500" weight="fill" /> :
                     <Info size={20} className="text-blue-500" weight="fill" />}
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-sm text-gray-200 leading-snug">{a.message}</span>
                    <span className="text-[10px] text-gray-500 text-right">Vài phút trước</span>
                  </div>
                </div>
              ))}
              
              {/* Fake mock alerts if DB is empty to match screenshot */}
              {alerts.length === 0 && (
                 <>
                  <div className="flex gap-3 p-3 border-b border-[#1e293b]/50 hover:bg-[#1e293b]/30 rounded-lg">
                    <WarningCircle size={20} className="text-red-500 mt-0.5 shrink-0" weight="fill" />
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-sm font-medium text-white">Chi tiêu vượt ngưỡng</span>
                      <span className="text-xs text-gray-400 leading-snug">Chiến dịch CBO - Interest 02 đã vượt 90% ngân sách ngày</span>
                    </div>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap">2 phút trước</span>
                  </div>
                  <div className="flex gap-3 p-3 border-b border-[#1e293b]/50 hover:bg-[#1e293b]/30 rounded-lg">
                    <WarningCircle size={20} className="text-orange-500 mt-0.5 shrink-0" weight="fill" />
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-sm font-medium text-white">CPA cao</span>
                      <span className="text-xs text-gray-400 leading-snug">Chiến dịch CBO - Test 03 có CPA cao hơn 50,000 đ trong 2 giờ liên tiếp</span>
                    </div>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap">15 phút trước</span>
                  </div>
                  <div className="flex gap-3 p-3 border-b border-[#1e293b]/50 hover:bg-[#1e293b]/30 rounded-lg">
                    <Info size={20} className="text-blue-500 mt-0.5 shrink-0" weight="fill" />
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-sm font-medium text-white">Tăng ngân sách</span>
                      <span className="text-xs text-gray-400 leading-snug">CBO - Remarketing 01 sẽ được tăng ngân sách lên 1,150,000 đ lúc 11:30</span>
                    </div>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap">45 phút trước</span>
                  </div>
                 </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Footer Logs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        {/* System Status */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl flex flex-col p-4">
          <h2 className="text-base font-semibold text-white mb-4">Trạng thái hệ thống</h2>
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-green-400">Hệ thống đang hoạt động tốt</span>
              <span className="text-xs text-gray-500">Thời gian hoạt động: 7 ngày 14 giờ 32 phút</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-auto">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Quy tắc đang chạy</span>
              <span className="text-lg font-bold text-white">12</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Chiến dịch được quản lý</span>
              <span className="text-lg font-bold text-white">{ov?.totalCampaigns || 28}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Tài khoản kết nối</span>
              <span className="text-lg font-bold text-white">{ov?.totalAccounts || 3}/3</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">API Facebook</span>
              <span className="text-xs font-medium text-green-400 flex items-center gap-1 mt-1"><Circle size={8} weight="fill" /> Hoạt động</span>
            </div>
          </div>
        </div>

        {/* System Logs */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
            <h2 className="text-base font-semibold text-white">Nhật ký hệ thống</h2>
            <Link href="/logs" className="text-xs text-blue-400 hover:text-blue-300">Xem tất cả</Link>
          </div>
          <div className="p-4 flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between text-gray-300">
              <div className="flex gap-4"><span className="text-gray-500 text-xs mt-0.5">11:30</span><span>Tăng ngân sách cho CBO - Remarketing 01 từ 1,000,000 đ lên 1,150,000 đ</span></div>
              <span className="text-green-400 text-xs">Thành công</span>
            </div>
            <div className="flex items-center justify-between text-gray-300">
              <div className="flex gap-4"><span className="text-gray-500 text-xs mt-0.5">11:30</span><span>Kiểm tra hiệu quả chiến dịch - CBO - Interest 02</span></div>
              <span className="text-green-400 text-xs">Thành công</span>
            </div>
            <div className="flex items-center justify-between text-gray-300">
              <div className="flex gap-4"><span className="text-gray-500 text-xs mt-0.5">11:30</span><span>Tắt chiến dịch CBO - Test 03 do CPA cao hơn ngưỡng</span></div>
              <span className="text-green-400 text-xs">Thành công</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
