"use client";

import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell, Label,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
} from "recharts";
import { Panel } from "./parts";
import { TREND, CHANNEL_SPLIT, CONVERSIONS } from "./dashboardData";

const AXIS = "#64748b";
const GRID = "#1e293b";
const tooltipStyle = { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 11, color: "#e2e8f0" };
const dayTicks = ["01/06", "05/06", "10/06", "15/06", "20/06", "25/06", "30/06"];

export default function OverviewCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Xu hướng chi tiêu & doanh thu */}
      <Panel
        className="lg:col-span-5"
        title="Xu hướng chi tiêu & Doanh thu"
        subtitle="Theo ngày, tháng 6/2024"
        right={
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-gray-400"><span className="w-3 h-0.5 rounded bg-blue-500" />Chi phí</span>
            <span className="flex items-center gap-1.5 text-gray-400"><span className="w-3 h-0.5 rounded bg-green-500" />Doanh thu</span>
          </div>
        }
        bodyClassName="px-3 pb-4"
      >
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={TREND} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="day" stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} ticks={dayTicks} />
              <YAxis stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} domain={[0, 800]} />
              <RTooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="spend" name="Chi phí" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* Phân bổ kênh */}
      <Panel className="lg:col-span-4" title="Phân bổ kênh" subtitle="Theo chi tiêu quảng cáo">
        <div className="flex items-center gap-4">
          <div className="w-[150px] h-[150px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CHANNEL_SPLIT} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={2} dataKey="value" stroke="none">
                  {CHANNEL_SPLIT.map((c) => <Cell key={c.name} fill={c.color} />)}
                  <Label value="100%" position="center" fill="#fff" fontSize={14} fontWeight="bold" />
                </Pie>
                <RTooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 flex flex-col gap-2.5">
            {CHANNEL_SPLIT.map((c) => (
              <div key={c.name} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-gray-300">
                    <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                    {c.name}
                  </span>
                  <span className="font-semibold text-white">{c.value}%</span>
                </div>
                <div className="h-1 rounded-full bg-[#1e293b] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.value}%`, background: c.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* Chuyển đổi theo ngày */}
      <Panel className="lg:col-span-3" title="Chuyển đổi theo ngày" subtitle="Tổng đơn hàng ghi nhận" bodyClassName="px-3 pb-4">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CONVERSIONS} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="day" stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} ticks={dayTicks} />
              <YAxis stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} domain={[0, 32]} />
              <RTooltip contentStyle={tooltipStyle} cursor={{ fill: "#1e293b66" }} formatter={(v) => [`${v}`, "Đơn"]} />
              <Bar dataKey="orders" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
