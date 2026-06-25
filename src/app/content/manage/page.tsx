"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import {
  CaretDown,
  FacebookLogo,
  TiktokLogo,
  YoutubeLogo,
  CloudArrowDown,
  ChartPie,
  Plus,
  Eye,
  Clock,
  FileText,
  TrendUp,
  DownloadSimple,
  Link as LinkIcon,
  List,
  MagnifyingGlass,
  ArrowSquareOut,
  Funnel,
  Download,
  Trash,
  Info
} from "@phosphor-icons/react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const options = [
  { id: "overview", label: "Tổng quan", icon: ChartPie },
  { id: "meta", label: "Meta Content", icon: FacebookLogo },
  { id: "tiktok", label: "Tiktok Content", icon: TiktokLogo },
  { id: "youtube", label: "Youtube Content", icon: YoutubeLogo },
  { id: "sourcing", label: "Sourcing Content", icon: CloudArrowDown },
];

// Mock data for the Overview Tab
const overviewStats = [
  { label: "Tổng Lượt Tiếp Cận (Reach)", value: "4,890,200", change: "+12.4%", trend: "up" },
  { label: "Tỷ Lệ Tương Tác (Engagement)", value: "6.85%", change: "+1.2%", trend: "up" },
  { label: "Tổng Người Theo Dõi", value: "1,248,900", change: "+5.2%", trend: "up" },
  { label: "Bài Viết Đã Lên Lịch", value: "24 bài viết", change: "+4 bài", trend: "up" },
];

const reachChartData = [
  { name: "Thứ 2", Meta: 120000, TikTok: 150000, YouTube: 80000 },
  { name: "Thứ 3", Meta: 140000, TikTok: 180000, YouTube: 95000 },
  { name: "Thứ 4", Meta: 135000, TikTok: 210000, YouTube: 110000 },
  { name: "Thứ 5", Meta: 160000, TikTok: 240000, YouTube: 105000 },
  { name: "Thứ 6", Meta: 185000, TikTok: 290000, YouTube: 130000 },
  { name: "Thứ 7", Meta: 210000, TikTok: 350000, YouTube: 160000 },
  { name: "Chủ Nhật", Meta: 240000, TikTok: 380000, YouTube: 180000 },
];

const platformBreakdown = [
  { platform: "Meta Content", reach: "1,180,000", followers: "450k", color: "bg-blue-600", text: "text-blue-500", icon: FacebookLogo },
  { platform: "Tiktok Content", reach: "2,420,200", followers: "620k", color: "bg-pink-600", text: "text-pink-500", icon: TiktokLogo },
  { platform: "Youtube Content", reach: "1,290,000", followers: "178.9k", color: "bg-red-600", text: "text-red-500", icon: YoutubeLogo },
];

const recentPosts = [
  { id: "1", title: "Review chi tiết tính năng tối ưu quảng cáo VCB Auto Ads", platform: "Youtube", date: "Hôm qua, 14:30", views: "12,400", engagement: "1,200", status: "Published" },
  { id: "2", title: "Hướng dẫn liên kết tài khoản quảng cáo Facebook trong 2 bước", platform: "Meta", date: "Hôm qua, 09:15", views: "8,900", engagement: "940", status: "Published" },
  { id: "3", title: "Trào lưu làm việc tự động với AI bot cực hot hiện nay", platform: "Tiktok", date: "24 Th06, 20:00", views: "84,500", engagement: "7,800", status: "Published" },
  { id: "4", title: "Bí quyết quản lý ngân sách quảng cáo không lo vỡ trận", platform: "Meta", date: "23 Th06, 11:00", views: "4,500", engagement: "320", status: "Published" },
];

// Mock data for Meta Content Tab
const metaPosts = [
  { id: "m1", title: "Cách chạy quảng cáo chuyển đổi hiệu quả năm 2026", type: "Facebook Post", date: "26 Th06, 08:00", status: "Scheduled", reach: "0", engagement: "0" },
  { id: "m2", title: "Chia sẻ tips target đối tượng khách hàng bất động sản cao cấp", type: "Facebook Post", date: "25 Th06, 17:30", status: "Published", reach: "15,200", engagement: "1,480" },
  { id: "m3", title: "Video ngắn: Hướng dẫn đọc báo cáo Ads siêu tốc", type: "Instagram Reel", date: "24 Th06, 15:00", status: "Published", reach: "28,400", engagement: "3,120" },
  { id: "m4", title: "Chương trình ưu đãi nạp tiền Ads tài khoản đại lý VCB", type: "Facebook Image", date: "Draft", status: "Draft", reach: "0", engagement: "0" },
];

// Mock data for TikTok Content Tab
const tiktokVideos = [
  { id: "t1", title: "Khi bạn để AI tự tối ưu ads và cái kết cực bất ngờ 😂 #auto #ai", date: "Hôm qua", views: "124,500", likes: "12,400", shares: "1,200", duration: "0:45" },
  { id: "t2", title: "Hướng dẫn cài đặt Quy Tắc Tự Động Facebook Ads siêu dễ #adsvcb", date: "3 ngày trước", views: "84,200", likes: "6,900", shares: "540", duration: "1:12" },
  { id: "t3", title: "1 ngày làm việc của Admin vận hành Auto Ads Facebook có gì?", date: "5 ngày trước", views: "215,900", likes: "18,200", shares: "2,300", duration: "2:05" },
  { id: "t4", title: "Tips né bão quét tài khoản quảng cáo mới nhất #ads #facebook", date: "1 tuần trước", views: "45,100", likes: "3,100", shares: "190", duration: "0:58" },
];

// Mock data for YouTube Content Tab
const youtubeVideos = [
  { id: "y1", title: "Khóa Học Tự Động Hóa Quảng Cáo Facebook Toàn Diện từ A - Z (Phần 1)", type: "Video", date: "Hôm nay, 10:00", status: "Scheduled", views: "0", ctr: "0.0%" },
  { id: "y2", title: "Sự Khác Biệt Giữa Tài Khoản Quảng Cáo Cá Nhân Và Doanh Nghiệp (BM)", type: "Video", date: "22 Th06, 2026", status: "Published", views: "4,890", ctr: "8.4%" },
  { id: "y3", title: "Shorts: Cách khắc phục thẻ thanh toán bị từ chối trên FB Ads", type: "Short", date: "20 Th06, 2026", status: "Published", views: "18,200", ctr: "12.1%" },
  { id: "y4", title: "Webinar: Đón đầu xu hướng quảng cáo Automation thế hệ mới", type: "Video", date: "18 Th06, 2026", status: "Published", views: "7,500", ctr: "6.9%" },
];

// Mock data for Sourcing Content Tab
const initialSourcingItems = [
  { id: "s1", title: "Review công cụ tối ưu quảng cáo thông minh Douyin", originUrl: "https://v.douyin.com/xyz123/", source: "Douyin", status: "Sourced", date: "25 Th06, 16:40", size: "45MB" },
  { id: "s2", title: "5 lỗi sai cơ bản khiến quảng cáo Facebook của bạn đắt đỏ", originUrl: "https://www.facebook.com/watch?v=987654", source: "Facebook", status: "Downloading", date: "25 Th06, 19:10", size: "120MB" },
  { id: "s3", title: "Trend biến hình cực cuốn dùng để quảng cáo thời trang", originUrl: "https://www.tiktok.com/@trend/video/112233", source: "TikTok", status: "Idea", date: "24 Th06, 10:00", size: "-" },
  { id: "s4", title: "Tài liệu thiết kế hình ảnh chạy ads có tỷ lệ click cao", originUrl: "https://pinterest.com/pin/556677", source: "Pinterest", status: "Sourced", date: "23 Th06, 14:15", size: "12MB" },
];

export default function ContentManagePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-500 py-20">Đang tải cấu hình trang...</div>}>
      <ContentManagePageContent />
    </Suspense>
  );
}

function ContentManagePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") || "overview";
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // States for Sourcing tab interactivity
  const [sourcingItems, setSourcingItems] = useState(initialSourcingItems);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newSource, setNewSource] = useState("TikTok");

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((o) => o.id === currentTab) || options[0];

  function handleSelect(id: string) {
    router.push(`/content/manage?tab=${id}`);
    setIsOpen(false);
  }

  // Handle adding sourced link
  function handleAddSourcing(e: React.FormEvent) {
    e.preventDefault();
    if (!newUrl || !newTitle) return;

    const newItem = {
      id: "s" + (sourcingItems.length + 1),
      title: newTitle,
      originUrl: newUrl,
      source: newSource,
      status: "Idea" as const,
      date: "Vừa xong",
      size: "-"
    };

    setSourcingItems([newItem, ...sourcingItems]);
    setNewUrl("");
    setNewTitle("");
  }

  // Handle delete sourcing item
  function handleDeleteSourcing(id: string) {
    setSourcingItems(sourcingItems.filter(item => item.id !== id));
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-full overflow-x-hidden pb-10 text-gray-200">
      
      {/* Header and Dropdown Selector */}
      <div className="border-b border-[#1e293b] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>Quản lý content</span>
            {selectedOption.id !== "overview" && (
              <span className="text-sm font-normal px-2.5 py-0.5 rounded-full bg-[#1f2937] text-blue-400 border border-blue-500/20">
                {selectedOption.label}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Quản lý nội dung organic: kênh, video, lịch đăng và phân công nhân sự.
          </p>
        </div>

        {/* Custom Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#111827] border border-[#1f2937] hover:border-blue-500 rounded-lg text-sm text-gray-200 min-w-[220px] transition-all duration-200 cursor-pointer shadow-lg hover:shadow-blue-500/5 focus:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <selectedOption.icon size={18} className="text-blue-500" />
              <span className="font-semibold text-white">{selectedOption.label}</span>
            </div>
            <CaretDown
              size={14}
              className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-[220px] bg-[#111827] border border-[#1f2937] rounded-lg shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {options.map((option) => {
                const isActive = selectedOption.id === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    className={`w-[calc(100%-12px)] mx-1.5 flex items-center px-3 py-2.5 rounded-md text-sm text-left transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-[#1f2937] text-[#3b82f6] font-semibold"
                        : "text-gray-400 hover:text-white hover:bg-[#1f2937]/50"
                    }`}
                  >
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Areas depending on Tab */}
      {currentTab === "overview" && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewStats.map((stat, idx) => (
              <div key={idx} className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 hover:border-gray-700 transition-all shadow-md flex flex-col justify-between">
                <span className="text-xs text-gray-400 font-medium">{stat.label}</span>
                <div className="flex items-baseline justify-between mt-3">
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                  <span className="text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <TrendUp size={12} />
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Performance Chart & Channels breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Area */}
            <div className="lg:col-span-2 bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-[#1f2937] pb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <TrendUp size={16} className="text-blue-500" />
                  Xu hướng tương tác và tiếp cận tự nhiên (Organic Reach)
                </h3>
                <span className="text-xs text-gray-500">7 ngày gần nhất</span>
              </div>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={reachChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMeta" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTikTok" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#db2777" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#db2777" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorYouTube" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
                    <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="Meta" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorMeta)" name="Meta" />
                    <Area type="monotone" dataKey="TikTok" stroke="#db2777" strokeWidth={2} fillOpacity={1} fill="url(#colorTikTok)" name="TikTok" />
                    <Area type="monotone" dataKey="YouTube" stroke="#dc2626" strokeWidth={2} fillOpacity={1} fill="url(#colorYouTube)" name="YouTube" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Channels Breakdown */}
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white mb-4 border-b border-[#1f2937] pb-3 flex items-center gap-2">
                  <List size={16} className="text-blue-500" />
                  Phân bố kênh quản lý
                </h3>
                <div className="flex flex-col gap-4">
                  {platformBreakdown.map((item, idx) => {
                    const PlatformIcon = item.icon;
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#1f2937]/30 border border-[#1f2937] hover:border-gray-700 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${item.color} text-white`}>
                            <PlatformIcon size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{item.platform}</p>
                            <p className="text-xs text-gray-400">{item.followers} followers</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${item.text}`}>{item.reach}</p>
                          <p className="text-[10px] text-gray-500">Reach tuần</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1f2937] flex justify-end">
                <button
                  onClick={() => router.push("/channels")}
                  className="text-xs font-semibold text-blue-500 hover:text-blue-400 flex items-center gap-1 cursor-pointer transition-all"
                >
                  Quản lý danh sách kênh
                  <ArrowSquareOut size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Recent organic posts */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4 border-b border-[#1f2937] pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText size={16} className="text-blue-500" />
                Nội dung đăng tải gần đây
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Xem tất cả hoạt động</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#1f2937] text-gray-400 text-xs">
                    <th className="py-2.5 font-medium">Tiêu đề bài viết</th>
                    <th className="py-2.5 font-medium">Nền tảng</th>
                    <th className="py-2.5 font-medium">Thời gian</th>
                    <th className="py-2.5 font-medium text-right">Lượt xem</th>
                    <th className="py-2.5 font-medium text-right">Tương tác</th>
                    <th className="py-2.5 font-medium text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937]/50 text-gray-300">
                  {recentPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-[#1f2937]/20 transition-colors group">
                      <td className="py-3 font-medium text-white group-hover:text-blue-400 transition-colors max-w-xs truncate">{post.title}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                          post.platform === "Meta" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                          post.platform === "Tiktok" ? "bg-pink-500/10 text-pink-400 border border-pink-500/20" :
                          "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {post.platform === "Meta" && <FacebookLogo size={12} />}
                          {post.platform === "Tiktok" && <TiktokLogo size={12} />}
                          {post.platform === "Youtube" && <YoutubeLogo size={12} />}
                          {post.platform}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-gray-400">{post.date}</td>
                      <td className="py-3 text-right text-white font-medium">{post.views}</td>
                      <td className="py-3 text-right text-gray-400">{post.engagement}</td>
                      <td className="py-3 text-center">
                        <span className="text-[10px] font-semibold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                          {post.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {currentTab === "meta" && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          
          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  className="bg-[#111827] border border-[#1f2937] hover:border-gray-700 rounded-lg px-3 py-1.5 pl-9 text-xs focus:border-blue-500 focus:outline-none w-[200px] text-white"
                />
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] rounded-lg text-xs text-gray-300 cursor-pointer">
                <Funnel size={14} />
                Bộ lọc
              </button>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs text-white font-bold transition-all shadow-lg shadow-blue-500/15 cursor-pointer">
              <Plus size={14} weight="bold" />
              Lên lịch bài viết mới
            </button>
          </div>

          {/* Performance Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-sm">
              <p className="text-xs text-gray-400 font-medium">Lượt tiếp cận trang Facebook</p>
              <h3 className="text-2xl font-bold text-white mt-2">689,400</h3>
              <p className="text-[10px] text-green-500 mt-1 font-semibold flex items-center gap-0.5">
                <TrendUp size={12} />
                +8.9% so với tuần trước
              </p>
            </div>
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-sm">
              <p className="text-xs text-gray-400 font-medium">Lượt tiếp cận Instagram</p>
              <h3 className="text-2xl font-bold text-white mt-2">490,800</h3>
              <p className="text-[10px] text-green-500 mt-1 font-semibold flex items-center gap-0.5">
                <TrendUp size={12} />
                +15.2% so với tuần trước
              </p>
            </div>
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-sm">
              <p className="text-xs text-gray-400 font-medium">Chi phí sản xuất content trung bình</p>
              <h3 className="text-2xl font-bold text-white mt-2">0đ</h3>
              <p className="text-[10px] text-gray-500 mt-1">Đội ngũ In-house organic</p>
            </div>
          </div>

          {/* Meta Content Table */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4 border-b border-[#1f2937] pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FacebookLogo size={18} className="text-blue-500" />
                Danh sách bài viết Meta (Facebook & Instagram)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#1f2937] text-gray-400 text-xs">
                    <th className="py-2.5 font-medium">Chi tiết bài viết</th>
                    <th className="py-2.5 font-medium">Phân loại</th>
                    <th className="py-2.5 font-medium">Lịch đăng/Ngày đăng</th>
                    <th className="py-2.5 font-medium text-right">Tiếp cận</th>
                    <th className="py-2.5 font-medium text-right">Tương tác</th>
                    <th className="py-2.5 font-medium text-center">Trạng thái</th>
                    <th className="py-2.5 font-medium text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937]/50 text-gray-300">
                  {metaPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-[#1f2937]/20 transition-colors group">
                      <td className="py-3.5 font-medium text-white max-w-sm truncate group-hover:text-blue-400 transition-colors">{post.title}</td>
                      <td className="py-3.5 text-xs text-gray-300">{post.type}</td>
                      <td className="py-3.5 text-xs text-gray-400">{post.date}</td>
                      <td className="py-3.5 text-right font-medium">{post.reach}</td>
                      <td className="py-3.5 text-right font-medium">{post.engagement}</td>
                      <td className="py-3.5 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          post.status === "Published" ? "bg-green-500/10 text-green-500" :
                          post.status === "Scheduled" ? "bg-blue-500/10 text-blue-500" :
                          "bg-gray-500/10 text-gray-400"
                        }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-1 hover:text-blue-500 transition-colors cursor-pointer" title="Xem chi tiết">
                            <Eye size={14} />
                          </button>
                          <button className="p-1 hover:text-red-500 transition-colors cursor-pointer" title="Xóa">
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {currentTab === "tiktok" && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          
          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm video TikTok..."
                  className="bg-[#111827] border border-[#1f2937] hover:border-gray-700 rounded-lg px-3 py-1.5 pl-9 text-xs focus:border-blue-500 focus:outline-none w-[200px] text-white"
                />
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] rounded-lg text-xs text-gray-300 cursor-pointer">
                <Funnel size={14} />
                Bộ lọc
              </button>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded-lg text-xs text-white font-bold transition-all shadow-lg shadow-pink-500/15 cursor-pointer">
              <Plus size={14} weight="bold" />
              Đăng video TikTok mới
            </button>
          </div>

          {/* TikTok Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 font-medium">Lượt Xem Video (Views)</p>
              <h3 className="text-2xl font-bold text-white mt-1">2,420,200</h3>
              <span className="text-[10px] text-green-500 font-semibold">+18.5% tuần này</span>
            </div>
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 font-medium">Lượt Tim (Likes)</p>
              <h3 className="text-2xl font-bold text-white mt-1">456,800</h3>
              <span className="text-[10px] text-green-500 font-semibold">+12.4% tuần này</span>
            </div>
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 font-medium">Chia Sẻ (Shares)</p>
              <h3 className="text-2xl font-bold text-white mt-1">12,400</h3>
              <span className="text-[10px] text-green-500 font-semibold">+22.1% tuần này</span>
            </div>
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 font-medium">Tỷ lệ xem hết (Completion Rate)</p>
              <h3 className="text-2xl font-bold text-white mt-1">15.42%</h3>
              <span className="text-[10px] text-gray-500">Mức trung bình ngành: 12%</span>
            </div>
          </div>

          {/* TikTok Grid Videos Layout */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <TiktokLogo size={18} className="text-pink-500" />
              Nội dung TikTok đã tải lên
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {tiktokVideos.map((video) => (
                <div key={video.id} className="bg-[#111827] border border-[#1f2937] hover:border-pink-500/40 rounded-xl overflow-hidden shadow-md flex flex-col group transition-all duration-300">
                  {/* Fake Thumbnail */}
                  <div className="h-44 bg-gradient-to-br from-gray-900 via-gray-800 to-pink-900/20 relative flex items-center justify-center border-b border-[#1f2937]">
                    <TiktokLogo size={48} className="text-gray-700/50 group-hover:text-pink-500/20 group-hover:scale-110 transition-all duration-300" />
                    <span className="absolute bottom-2 right-2 text-[10px] bg-black/70 px-1.5 py-0.5 rounded text-white font-mono">
                      {video.duration}
                    </span>
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="text-[10px] bg-green-500/80 px-2 py-0.5 rounded-full font-bold text-black">TikTok</span>
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-white line-clamp-2 leading-snug group-hover:text-pink-400 transition-all">
                        {video.title}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">{video.date}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-3 border-t border-[#1f2937] text-center">
                      <div>
                        <p className="text-xs font-bold text-white">{video.views}</p>
                        <p className="text-[9px] text-gray-500">Views</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-pink-400">{video.likes}</p>
                        <p className="text-[9px] text-gray-500">Likes</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{video.shares}</p>
                        <p className="text-[9px] text-gray-500">Shares</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentTab === "youtube" && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          
          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm video YouTube..."
                  className="bg-[#111827] border border-[#1f2937] hover:border-gray-700 rounded-lg px-3 py-1.5 pl-9 text-xs focus:border-blue-500 focus:outline-none w-[200px] text-white"
                />
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] rounded-lg text-xs text-gray-300 cursor-pointer">
                <Funnel size={14} />
                Bộ lọc
              </button>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-xs text-white font-bold transition-all shadow-lg shadow-red-500/15 cursor-pointer">
              <Plus size={14} weight="bold" />
              Tải lên video/Shorts mới
            </button>
          </div>

          {/* YouTube Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 font-medium">Tổng Số Sub (Subscribers)</p>
              <h3 className="text-2xl font-bold text-white mt-1">178,900</h3>
              <span className="text-[10px] text-green-500 font-semibold">+1,200 sub mới tuần này</span>
            </div>
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 font-medium">Tổng Lượt Xem (Views)</p>
              <h3 className="text-2xl font-bold text-white mt-1">1,290,000</h3>
              <span className="text-[10px] text-green-500 font-semibold">+8.4% tuần này</span>
            </div>
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 font-medium">Thời gian xem (Giờ)</p>
              <h3 className="text-2xl font-bold text-white mt-1">42,500 h</h3>
              <span className="text-[10px] text-green-500 font-semibold">+5.1% tuần này</span>
            </div>
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 font-medium">CTR Trung Bình (Click-through)</p>
              <h3 className="text-2xl font-bold text-white mt-1">7.82%</h3>
              <span className="text-[10px] text-gray-500">Mức tốt: 5% - 10%</span>
            </div>
          </div>

          {/* YouTube Video List Table */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4 border-b border-[#1f2937] pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <YoutubeLogo size={18} className="text-red-500" />
                Danh sách video YouTube Channel
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#1f2937] text-gray-400 text-xs">
                    <th className="py-2.5 font-medium">Tên Video / Thumbnail</th>
                    <th className="py-2.5 font-medium">Phân loại</th>
                    <th className="py-2.5 font-medium">Ngày phát sóng</th>
                    <th className="py-2.5 font-medium text-right">Lượt xem</th>
                    <th className="py-2.5 font-medium text-right">CTR</th>
                    <th className="py-2.5 font-medium text-center">Trạng thái</th>
                    <th className="py-2.5 font-medium text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937]/50 text-gray-300">
                  {youtubeVideos.map((video) => (
                    <tr key={video.id} className="hover:bg-[#1f2937]/20 transition-colors group">
                      <td className="py-3.5 flex items-center gap-3">
                        <div className="w-16 h-10 rounded bg-gray-800 border border-[#1f2937] flex items-center justify-center text-red-500/40 font-mono text-[10px] shrink-0">
                          {video.type === "Short" ? "Short" : "16:9"}
                        </div>
                        <span className="font-medium text-white max-w-sm truncate group-hover:text-red-400 transition-colors">{video.title}</span>
                      </td>
                      <td className="py-3.5 text-xs">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          video.type === "Short" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                        }`}>
                          {video.type}
                        </span>
                      </td>
                      <td className="py-3.5 text-xs text-gray-400">{video.date}</td>
                      <td className="py-3.5 text-right font-medium">{video.views}</td>
                      <td className="py-3.5 text-right font-medium text-gray-400">{video.ctr}</td>
                      <td className="py-3.5 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          video.status === "Published" ? "bg-green-500/10 text-green-500" :
                          video.status === "Scheduled" ? "bg-blue-500/10 text-blue-500" :
                          "bg-gray-500/10 text-gray-400"
                        }`}>
                          {video.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-1 hover:text-red-500 transition-colors cursor-pointer" title="Mở link Youtube">
                            <ArrowSquareOut size={14} />
                          </button>
                          <button className="p-1 hover:text-red-500 transition-colors cursor-pointer" title="Xóa">
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {currentTab === "sourcing" && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          
          {/* Sourcing Add Card */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <CloudArrowDown size={18} className="text-blue-500" />
              Thu thập / Sourcing Content từ đối thủ
            </h3>
            
            <form onSubmit={handleAddSourcing} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 flex flex-col gap-1.5 w-full">
                <label className="text-xs text-gray-400 font-medium">Tiêu đề / Ý tưởng content</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Video review tính năng hay ho của BM"
                  className="bg-[#1f2937]/50 border border-[#1f2937] hover:border-gray-700 rounded-lg px-3 py-2 text-xs focus:border-blue-500 focus:outline-none w-full text-white"
                />
              </div>

              <div className="flex-1 flex flex-col gap-1.5 w-full">
                <label className="text-xs text-gray-400 font-medium">Dán đường dẫn (Link Douyin, TikTok, Facebook...)</label>
                <input
                  type="url"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://www.tiktok.com/@competitor/video/..."
                  className="bg-[#1f2937]/50 border border-[#1f2937] hover:border-gray-700 rounded-lg px-3 py-2 text-xs focus:border-blue-500 focus:outline-none w-full text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5 w-full md:w-[150px]">
                <label className="text-xs text-gray-400 font-medium">Nền tảng nguồn</label>
                <select
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  className="bg-[#1f2937] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none w-full"
                >
                  <option value="TikTok">TikTok</option>
                  <option value="Facebook">Facebook Watch</option>
                  <option value="Douyin">Douyin</option>
                  <option value="Pinterest">Pinterest</option>
                </select>
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs text-white font-bold transition-all w-full md:w-auto shrink-0 shadow-lg shadow-blue-500/15 cursor-pointer"
              >
                <Plus size={14} weight="bold" />
                Thêm liên kết
              </button>
            </form>
          </div>

          {/* Sourcing Backlog Table */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4 border-b border-[#1f2937] pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <List size={18} className="text-blue-500" />
                Danh mục ý tưởng và file tải xuống
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#1f2937] text-gray-400 text-xs">
                    <th className="py-2.5 font-medium">Tiêu đề content</th>
                    <th className="py-2.5 font-medium">URL nguồn</th>
                    <th className="py-2.5 font-medium">Nguồn</th>
                    <th className="py-2.5 font-medium">Ngày thu thập</th>
                    <th className="py-2.5 font-medium">Dung lượng</th>
                    <th className="py-2.5 font-medium text-center">Trạng thái</th>
                    <th className="py-2.5 font-medium text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937]/50 text-gray-300">
                  {sourcingItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#1f2937]/20 transition-colors group">
                      <td className="py-3.5 font-medium text-white max-w-xs truncate group-hover:text-blue-400 transition-colors">{item.title}</td>
                      <td className="py-3.5 text-xs max-w-[150px] truncate text-gray-500 font-mono group-hover:text-gray-300 transition-colors">
                        <a href={item.originUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                          <LinkIcon size={12} />
                          {item.originUrl}
                        </a>
                      </td>
                      <td className="py-3.5 text-xs font-semibold text-gray-400">{item.source}</td>
                      <td className="py-3.5 text-xs text-gray-500">{item.date}</td>
                      <td className="py-3.5 text-xs text-gray-400 font-mono">{item.size}</td>
                      <td className="py-3.5 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === "Sourced" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                          item.status === "Downloading" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20 animate-pulse" :
                          "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {item.status === "Sourced" ? (
                            <button className="p-1 hover:text-blue-500 transition-colors cursor-pointer" title="Tải xuống file">
                              <Download size={14} />
                            </button>
                          ) : item.status === "Idea" ? (
                            <button
                              onClick={() => {
                                // Simulate starting download
                                setSourcingItems(sourcingItems.map(si => si.id === item.id ? { ...si, status: "Downloading" as const } : si));
                                setTimeout(() => {
                                  setSourcingItems(sourcingItems.map(si => si.id === item.id ? { ...si, status: "Sourced" as const, size: "32MB" } : si));
                                }, 3000);
                              }}
                              className="p-1 hover:text-blue-500 transition-colors cursor-pointer text-blue-400"
                              title="Tải video về Server"
                            >
                              <DownloadSimple size={14} />
                            </button>
                          ) : (
                            <button className="p-1 text-gray-500 transition-colors" disabled title="Đang xử lý...">
                              <Clock size={14} className="animate-spin" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteSourcing(item.id)}
                            className="p-1 hover:text-red-500 transition-colors cursor-pointer"
                            title="Xóa ý tưởng"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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
