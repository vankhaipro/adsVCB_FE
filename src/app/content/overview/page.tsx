"use client";

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
  viewsPlatformData,
  kpiStats,
  postContentData,
  productionContentData,
  viewsTrendData,
  channelsDistributionData,
  viewsByTeamData,
  contentByTeamData,
  contentLineDistributionData,
  conceptDistributionData,
  topProductionContent,
  topSkuDataRecord,
  topSkuCreateRecord,
  linePerformanceDataRecord,
  linePerformanceCreateRecord,
  contentStylePerformance,
  topChannelsByView,
  topVideosByView,
  topStaffByView,
  detailChannelPerformance,
  detailStaffPerformance,
  staffKpiBarData,
  staffTaskCompletionData,
  metaRawContentList,
  tiktokRawContentList,
  youtubeRawContentList
} from "../manage/mockData";

export default function ContentOverviewPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="border-b border-[#1e293b] pb-4">
        <h1 className="text-2xl font-bold text-white">Tổng quan content</h1>
        <p className="text-sm text-gray-400 mt-1">
          Tổng hợp hiệu quả nội dung organic trên các kênh (views, tương tác, follow…)
        </p>
      </div>

      {/* Quick Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg p-3 text-xs flex items-center gap-2">
        <Info size={16} />
        <span>Màn hình hiển thị Báo cáo hiệu quả nội dung (Content Performance). Lựa chọn các bộ lọc phía trên để lọc chi tiết.</span>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 flex flex-wrap items-center gap-3">
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs font-semibold cursor-pointer">
          <Funnel size={14} />
          Lưu bộ lọc
        </button>
        
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f2937] border border-[#1f2937] rounded-lg text-xs text-gray-400">
          <Calendar size={14} />
          <span>Thời gian: <strong className="text-white">Tháng trước hoặc tháng này</strong></span>
          <button className="text-gray-500 hover:text-white ml-1">×</button>
        </div>

        {/* Dropdowns */}
        {["Nền tảng", "Kênh", "Team", "Nhân viên", "Thời gian ghi dữ liệu"].map((filter, i) => (
          <div key={i} className="relative">
            <select className="bg-[#1f2937] border border-[#1f2937] text-gray-300 hover:border-gray-700 rounded-lg px-3 py-1.5 pr-8 text-xs appearance-none focus:outline-none focus:border-blue-500 cursor-pointer min-w-[120px]">
              <option>{filter}</option>
              <option>Tất cả {filter}</option>
            </select>
            <CaretDown size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Top Row: Donut + KPI Card Grid + Production/Post Donuts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Donut platform views */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Tổng lượt xem theo nền tảng</h3>
            <div className="relative w-full h-[160px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={viewsPlatformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {viewsPlatformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white">255.7M</span>
                <span className="text-[10px] text-gray-500">Tổng</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            {viewsPlatformData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-gray-400 capitalize">{item.name}:</span>
                <span className="text-white font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* KPI Stats Cards Box */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Các chỉ số tương tác chính</h3>
            <div className="grid grid-cols-2 gap-4">
              
              <div className="bg-[#1f2937]/30 border border-[#1f2937] rounded-lg p-3.5 col-span-2">
                <p className="text-[10px] text-gray-400 font-medium">Tổng Lượt Xem</p>
                <p className="text-2xl font-black text-white mt-1">{kpiStats.views}</p>
              </div>
              
              <div className="bg-[#1f2937]/30 border border-[#1f2937] rounded-lg p-3">
                <p className="text-[10px] text-gray-400 font-medium">Tổng Tương Tác</p>
                <p className="text-lg font-bold text-white mt-1">{kpiStats.interactions}</p>
              </div>
              
              <div className="bg-[#1f2937]/30 border border-[#1f2937] rounded-lg p-3">
                <p className="text-[10px] text-gray-400 font-medium">Lượt Thích</p>
                <p className="text-lg font-bold text-white mt-1">{kpiStats.likes}</p>
              </div>
              
              <div className="bg-[#1f2937]/30 border border-[#1f2937] rounded-lg p-3">
                <p className="text-[10px] text-gray-400 font-medium">Bình Luận</p>
                <p className="text-lg font-bold text-white mt-1">{kpiStats.comments}</p>
              </div>
              
              <div className="bg-[#1f2937]/30 border border-[#1f2937] rounded-lg p-3">
                <p className="text-[10px] text-gray-400 font-medium">Tổng Followers</p>
                <p className="text-lg font-bold text-white mt-1">{kpiStats.followers}</p>
              </div>

            </div>
          </div>
        </div>

        {/* Post/Production Donuts */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Phân tích Win/Not Win</h3>
            <div className="grid grid-cols-2 gap-4">
              
              {/* Noi dung dang tai */}
              <div className="flex flex-col items-center">
                <p className="text-[10px] text-gray-400 font-semibold mb-2">Nội dung đăng tải</p>
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
                    <span className="text-xs font-bold text-white">17,213</span>
                    <span className="text-[8px] text-gray-500">Tổng</span>
                  </div>
                </div>
                <div className="flex justify-center gap-3 mt-2 text-[10px]">
                  <span className="text-green-500">Win: 8.9%</span>
                  <span className="text-red-500">Not: 91.1%</span>
                </div>
              </div>

              {/* Noi dung san xuat */}
              <div className="flex flex-col items-center">
                <p className="text-[10px] text-gray-400 font-semibold mb-2">Nội dung sản xuất</p>
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
                    <span className="text-xs font-bold text-white">7,161</span>
                    <span className="text-[8px] text-gray-500">Tổng</span>
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
        <div className="lg:col-span-2 bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-[#1f2937] pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
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
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000000}M`} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Area type="monotone" dataKey="Facebook" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorFacebook)" name="Facebook" />
                <Area type="monotone" dataKey="TikTok" stroke="#db2777" strokeWidth={2} fillOpacity={1} fill="url(#colorTikTok)" name="TikTok" />
                <Area type="monotone" dataKey="Instagram" stroke="#e1306c" strokeWidth={2} fill="none" name="Instagram" />
                <Area type="monotone" dataKey="YouTube" stroke="#dc2626" strokeWidth={2} fill="none" name="YouTube" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tong so kenh donut */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Tổng số kênh</h3>
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
                <span className="text-xl font-bold text-white">152</span>
                <span className="text-[10px] text-gray-500">Tổng số kênh</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {channelsDistributionData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-gray-400 capitalize">{item.name}:</span>
                <span className="text-white font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Section: Team & Content Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tong luot view theo team */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md">
          <h3 className="text-sm font-semibold text-white mb-4">Tổng lượt view theo team</h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewsByTeamData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={9} />
                <YAxis stroke="#6b7280" fontSize={9} />
                <Tooltip formatter={(val) => `${val}M`} />
                <Bar dataKey="views" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tong noi dung theo team (Horizontal) */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md">
          <h3 className="text-sm font-semibold text-white mb-4">Tổng nội dung được tạo theo team</h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={contentByTeamData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid stroke="#1f2937" horizontal={false} />
                <XAxis type="number" stroke="#6b7280" fontSize={9} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={9} width={45} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Phan bo theo tuyen noi dung */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Phân bổ theo tuyến nội dung</h3>
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
                <span className="text-base font-bold text-white">17,224</span>
                <span className="text-[9px] text-gray-500">Tổng</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[9px] mt-2">
            {contentLineDistributionData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-gray-400">{item.name}:</span>
                <span className="text-white font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Section: Concept & SKU analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Concept Distribution */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Phân bổ theo concept</h3>
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
                <span className="text-base font-bold text-white">96,356</span>
                <span className="text-[9px] text-gray-500">Tổng</span>
              </div>
            </div>
          </div>
          <div className="flex justify-around gap-1.5 text-[10px] mt-2">
            {conceptDistributionData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-gray-400">{item.name}:</span>
                <span className="text-white font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Production Content Table */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md">
          <h3 className="text-xs font-semibold text-white mb-3">Top nội dung sản xuất nhiều video nhất</h3>
          <div className="overflow-y-auto max-h-[190px] text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1f2937] text-gray-500 text-[10px]">
                  <th className="pb-1.5">Nội dung</th>
                  <th className="pb-1.5 text-right">Số video</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/50 text-gray-300">
                {topProductionContent.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#1f2937]/20">
                    <td className="py-1.5 max-w-[140px] truncate" title={row.name}>{row.name}</td>
                    <td className="py-1.5 text-right font-bold text-white">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Sku data record */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md">
          <h3 className="text-xs font-semibold text-white mb-3">Top sản phẩm sản xuất video nhiều nhất (ghi nhận)</h3>
          <div className="overflow-y-auto max-h-[190px] text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1f2937] text-gray-500">
                  <th className="pb-1.5">SKU</th>
                  <th className="pb-1.5 text-right">Videos</th>
                  <th className="pb-1.5 text-right">Xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/50 text-gray-300">
                {topSkuDataRecord.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#1f2937]/20">
                    <td className="py-1.5 font-semibold text-white">{row.sku}</td>
                    <td className="py-1.5 text-right">{row.count}</td>
                    <td className="py-1.5 text-right text-blue-400">{row.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Sku create record */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md">
          <h3 className="text-xs font-semibold text-white mb-3">Top sản phẩm sản xuất video nhiều nhất (thời gian tạo)</h3>
          <div className="overflow-y-auto max-h-[190px] text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1f2937] text-gray-500">
                  <th className="pb-1.5">SKU</th>
                  <th className="pb-1.5 text-right">Videos</th>
                  <th className="pb-1.5 text-right">Xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/50 text-gray-300">
                {topSkuCreateRecord.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#1f2937]/20">
                    <td className="py-1.5 font-semibold text-white">{row.sku}</td>
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
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 shadow-md">
          <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
            <Tag size={14} className="text-blue-500" />
            Hiệu suất tuyến nội dung (Thời gian ghi dữ liệu)
          </h4>
          <div className="overflow-x-auto text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1f2937] text-gray-500">
                  <th className="pb-2 font-medium">Tuyến</th>
                  <th className="pb-2 text-right">Số lượng</th>
                  <th className="pb-2 text-right">Lượt xem</th>
                  <th className="pb-2 text-right">Tương tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/50 text-gray-300">
                {linePerformanceDataRecord.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#1f2937]/20">
                    <td className="py-2 font-bold text-white">{row.line}</td>
                    <td className="py-2 text-right">{row.count}</td>
                    <td className="py-2 text-right text-blue-400">{row.views}</td>
                    <td className="py-2 text-right text-gray-400">{row.interactions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hieu suat tuyen thoi gian tao */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 shadow-md">
          <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
            <Tag size={14} className="text-amber-500" />
            Hiệu suất tuyến nội dung (Thời gian tạo nội dung)
          </h4>
          <div className="overflow-x-auto text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1f2937] text-gray-500">
                  <th className="pb-2 font-medium">Tuyến</th>
                  <th className="pb-2 text-right">Số lượng</th>
                  <th className="pb-2 text-right">Lượt xem</th>
                  <th className="pb-2 text-right">Tương tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/50 text-gray-300">
                {linePerformanceCreateRecord.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#1f2937]/20">
                    <td className="py-2 font-bold text-white">{row.line}</td>
                    <td className="py-2 text-right">{row.count}</td>
                    <td className="py-2 text-right text-amber-500">{row.views}</td>
                    <td className="py-2 text-right text-gray-400">{row.interactions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hieu suat loai noi dung */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 shadow-md">
          <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
            <FileText size={14} className="text-[#db2777]" />
            Hiệu suất theo loại nội dung
          </h4>
          <div className="overflow-x-auto text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1f2937] text-gray-500">
                  <th className="pb-2 font-medium">Loại</th>
                  <th className="pb-2 text-right">Số lượng</th>
                  <th className="pb-2 text-right">Lượt xem</th>
                  <th className="pb-2 text-right">Tương tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/50 text-gray-300">
                {contentStylePerformance.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#1f2937]/20">
                    <td className="py-2 font-bold text-white">{row.type}</td>
                    <td className="py-2 text-right">{row.count}</td>
                    <td className="py-2 text-right text-pink-400">{row.views}</td>
                    <td className="py-2 text-right text-gray-400">{row.interactions}</td>
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
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 shadow-md">
          <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
            <Star size={14} className="text-blue-500" />
            Top Kênh theo view
          </h3>
          <div className="overflow-y-auto max-h-[220px] text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1f2937] text-gray-500">
                  <th className="pb-2 font-medium">Nền tảng</th>
                  <th className="pb-2 font-medium">Kênh</th>
                  <th className="pb-2 text-right">Lượt xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/50 text-gray-300">
                {topChannelsByView.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#1f2937]/20">
                    <td className="py-2">
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold ${
                        row.platform === "Facebook" ? "bg-blue-500/10 text-blue-400" : "bg-pink-500/10 text-pink-400"
                      }`}>
                        {row.platform}
                      </span>
                    </td>
                    <td className="py-2 text-white truncate max-w-[100px]">{row.name}</td>
                    <td className="py-2 text-right font-semibold text-white">{row.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Video theo view */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 shadow-md">
          <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
            <Star size={14} className="text-pink-500" />
            Top Video theo view
          </h3>
          <div className="overflow-y-auto max-h-[220px] text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1f2937] text-gray-500">
                  <th className="pb-2 font-medium">Video</th>
                  <th className="pb-2 text-right">Lượt xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/50 text-gray-300">
                {topVideosByView.map((row) => (
                  <tr key={row.id} className="hover:bg-[#1f2937]/20">
                    <td className="py-2 text-white truncate max-w-[160px]" title={row.caption}>{row.caption}</td>
                    <td className="py-2 text-right font-semibold text-white">{row.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Nhan su theo view */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 shadow-md">
          <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
            <Star size={14} className="text-amber-500" />
            Top Nhân sự theo view
          </h3>
          <div className="overflow-y-auto max-h-[220px] text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1f2937] text-gray-500">
                  <th className="pb-2 font-medium">Nhân viên</th>
                  <th className="pb-2 font-medium">Team</th>
                  <th className="pb-2 text-right">Lượt xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/50 text-gray-300">
                {topStaffByView.map((row) => (
                  <tr key={row.id} className="hover:bg-[#1f2937]/20">
                    <td className="py-2 text-white font-medium">{row.name}</td>
                    <td className="py-2 font-semibold text-blue-400">{row.team}</td>
                    <td className="py-2 text-right font-semibold text-white">{row.views}</td>
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
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md">
          <h3 className="text-xs font-bold text-white mb-4">Hiệu suất chi tiết theo kênh</h3>
          <div className="overflow-x-auto text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1f2937] text-gray-500">
                  <th className="pb-2 font-medium">Kênh</th>
                  <th className="pb-2 text-right">Lượt xem</th>
                  <th className="pb-2 text-right">Follows</th>
                  <th className="pb-2 text-right">Likes</th>
                  <th className="pb-2 text-right">Bình luận</th>
                  <th className="pb-2 text-right">Chia sẻ</th>
                  <th className="pb-2 text-right">Thời gian xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/50 text-gray-300">
                {detailChannelPerformance.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#1f2937]/20">
                    <td className="py-2.5 font-semibold text-white max-w-[100px] truncate">{row.channel}</td>
                    <td className="py-2.5 text-right text-blue-400">{row.views}</td>
                    <td className="py-2.5 text-right">{row.follows}</td>
                    <td className="py-2.5 text-right">{row.likes}</td>
                    <td className="py-2.5 text-right">{row.comments}</td>
                    <td className="py-2.5 text-right text-pink-400">{row.shares}</td>
                    <td className="py-2.5 text-right text-gray-400">{row.avgWatch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hieu suat chi tiet team */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md">
          <h3 className="text-xs font-bold text-white mb-4">Hiệu suất chi tiết theo nhân sự</h3>
          <div className="overflow-x-auto text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1f2937] text-gray-500">
                  <th className="pb-2 font-medium">Nhân sự</th>
                  <th className="pb-2 text-right">Lượt xem</th>
                  <th className="pb-2 text-right">Tiếp cận</th>
                  <th className="pb-2 text-right">Likes</th>
                  <th className="pb-2 text-right">Bình luận</th>
                  <th className="pb-2 text-right">Chia sẻ</th>
                  <th className="pb-2 text-right">Lưu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/50 text-gray-300">
                {detailStaffPerformance.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#1f2937]/20">
                    <td className="py-2.5 font-semibold text-white">{row.name}</td>
                    <td className="py-2.5 text-right text-blue-400">{row.views}</td>
                    <td className="py-2.5 text-right text-green-500">{row.reach}</td>
                    <td className="py-2.5 text-right">{row.likes}</td>
                    <td className="py-2.5 text-right">{row.comments}</td>
                    <td className="py-2.5 text-right text-pink-400">{row.shares}</td>
                    <td className="py-2.5 text-right text-gray-400">{row.saves}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Section: Hiệu quả KPI của nhân sự */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md">
        <h3 className="text-sm font-semibold text-white mb-4">Hiệu quả KPI của nhân sự</h3>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Top nhân sự đạt % KPI cao nhất chart */}
          <div className="xl:col-span-1 border-r border-[#1f2937]/80 pr-4">
            <h4 className="text-xs font-semibold text-gray-400 mb-2">Top nhân sự đạt % KPI cao nhất</h4>
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
            <h4 className="text-xs font-semibold text-gray-400 mb-2">Tỉ lệ hoàn thành task theo nhân sự</h4>
            <div className="overflow-x-auto text-[10px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#1f2937] text-gray-500">
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
                <tbody className="divide-y divide-[#1f2937]/50 text-gray-300">
                  {staffTaskCompletionData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#1f2937]/20">
                      <td className="py-2 font-semibold text-white">{row.name}</td>
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
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-4 border-b border-[#1f2937] pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FacebookLogo size={18} className="text-blue-500" />
              Meta Content
            </h3>
          </div>
          <div className="overflow-x-auto text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1f2937] text-gray-500">
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
              <tbody className="divide-y divide-[#1f2937]/50 text-gray-300">
                {metaRawContentList.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#1f2937]/20 group">
                    <td className="py-2.5 max-w-[180px] truncate text-white group-hover:text-blue-400 transition-colors" title={row.caption}>{row.caption}</td>
                    <td className="py-2.5 truncate max-w-[140px]" title={row.channel}>{row.channel}</td>
                    <td className="py-2.5 text-gray-400">{row.date}</td>
                    <td className="py-2.5 font-bold text-gray-200">{row.line}</td>
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
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-4 border-b border-[#1f2937] pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TiktokLogo size={18} className="text-pink-500" />
              TikTok Content
            </h3>
          </div>
          <div className="overflow-x-auto text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1f2937] text-gray-500">
                  <th className="pb-2">Caption</th>
                  <th className="pb-2">Kênh</th>
                  <th className="pb-2">Ngày tạo</th>
                  <th className="pb-2">Concept</th>
                  <th className="pb-2">Tuyến</th>
                  <th className="pb-2 text-right">Lượt xem</th>
                  <th className="pb-2 text-right">Thích</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/50 text-gray-300">
                {tiktokRawContentList.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#1f2937]/20 group">
                    <td className="py-2.5 max-w-[180px] truncate text-white group-hover:text-pink-400 transition-colors" title={row.caption}>{row.caption}</td>
                    <td className="py-2.5 truncate max-w-[140px]" title={row.channel}>{row.channel}</td>
                    <td className="py-2.5 text-gray-400">{row.date}</td>
                    <td className="py-2.5 font-semibold text-blue-400">{row.concept}</td>
                    <td className="py-2.5 font-bold text-gray-200">{row.line}</td>
                    <td className="py-2.5 text-right text-pink-400 font-semibold">{row.views}</td>
                    <td className="py-2.5 text-right">{row.likes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Youtube Content Table */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-4 border-b border-[#1f2937] pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <YoutubeLogo size={18} className="text-red-500" />
              YouTube Content
            </h3>
          </div>
          <div className="overflow-x-auto text-[10px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1f2937] text-gray-500">
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
              <tbody className="divide-y divide-[#1f2937]/50 text-gray-300">
                {youtubeRawContentList.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#1f2937]/20 group">
                    <td className="py-2.5 max-w-[180px] truncate text-white group-hover:text-red-400 transition-colors" title={row.caption}>{row.caption}</td>
                    <td className="py-2.5 truncate max-w-[140px]" title={row.channel}>{row.channel}</td>
                    <td className="py-2.5 text-gray-400">{row.date}</td>
                    <td className="py-2.5 text-gray-400">{row.concept}</td>
                    <td className="py-2.5 font-bold text-gray-200">{row.line}</td>
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
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 flex items-start gap-3 mt-4 text-xs text-gray-400">
        <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-gray-200">Giao diện phác thảo (Design Only)</span>.
          Các tính năng đăng tải tự động, cấu hình phân công lịch đăng và thu thập video từ link mạng xã hội hiện đang hoạt động ở chế độ Demo Giao Diện (Mockup).
        </div>
      </div>

    </div>
  );
}
