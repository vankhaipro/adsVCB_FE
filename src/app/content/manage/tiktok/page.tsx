"use client";

import { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlass,
  FloppyDisk,
  DownloadSimple,
  X,
  ArrowsDownUp,
  TiktokLogo
} from "@phosphor-icons/react";
import { apiGet } from "@/lib/api";

// Mock data based on TikTok content screenshots
const initialVideos = [
  {
    id: "1",
    caption: "Bốn tuổi này mang trang sức gì vào năm...",
    permalink: "https://www.tiktok.com/@huyktrangsuc/video/1",
    channel: "huyktrangsuc",
    format: "VIDEO",
    date: "26/6/2026",
    staff: "[Trọng Đặng Văn]",
    concept: "Mới",
    line: "A5",
    productCode: "",
    productName: "",
    totalViews: 53,
    totalViewsPaid: 0,
    totalViewsOrganic: 0,
    totalReach: 0,
    totalLikes: 3,
    totalComments: 5,
    totalShares: 1,
    views: 43,
    viewsPaid: 0,
    viewsOrganic: 0,
    reach: 0,
    likes: 2,
    comments: 5,
    shares: 1,
    avgWatchTime: 21.45
  },
  {
    id: "2",
    caption: "Phụ nữ nên đeo trang sức gì vào mùa hè...",
    permalink: "https://www.tiktok.com/@HuykMeDaQuy/video/2",
    channel: "Huyk Mê Đá Quý",
    format: "VIDEO",
    date: "26/6/2026",
    staff: "[Trung Hiếu]",
    concept: "Cũ",
    line: "A1",
    productCode: "",
    productName: "",
    totalViews: 63,
    totalViewsPaid: 0,
    totalViewsOrganic: 0,
    totalReach: 0,
    totalLikes: 2,
    totalComments: 0,
    totalShares: 1,
    views: 63,
    viewsPaid: 0,
    viewsOrganic: 0,
    reach: 0,
    likes: 2,
    comments: 0,
    shares: 1,
    avgWatchTime: 4.81
  },
  {
    id: "3",
    caption: "Vàng bị nam châm hút là thật hay giả...",
    permalink: "https://www.tiktok.com/@huyktrangssuc/video/3",
    channel: "huyktrangssuc...",
    format: "VIDEO",
    date: "26/6/2026",
    staff: "[Bui Doan]",
    concept: "Cũ",
    line: "A2",
    productCode: "",
    productName: "",
    totalViews: 763,
    totalViewsPaid: 0,
    totalViewsOrganic: 0,
    totalReach: 0,
    totalLikes: 18,
    totalComments: 0,
    totalShares: 0,
    views: 763,
    viewsPaid: 0,
    viewsOrganic: 0,
    reach: 0,
    likes: 18,
    comments: 0,
    shares: 0,
    avgWatchTime: 19.85
  },
  {
    id: "4",
    caption: "Bốn tuổi này mang trang sức gì vào năm...",
    permalink: "https://www.tiktok.com/@huyktrangsuc/video/4",
    channel: "huyktrangsuc",
    format: "VIDEO",
    date: "26/6/2026",
    staff: "[Trọng Đặng Văn]",
    concept: "Cũ",
    line: "A5",
    productCode: "",
    productName: "",
    totalViews: 10,
    totalViewsPaid: 0,
    totalViewsOrganic: 0,
    totalReach: 0,
    totalLikes: 1,
    totalComments: 0,
    totalShares: 0,
    views: 10,
    viewsPaid: 0,
    viewsOrganic: 0,
    reach: 0,
    likes: 1,
    comments: 0,
    shares: 0,
    avgWatchTime: 7.75
  },
  {
    id: "5",
    caption: "Chị em phụ nữ nên đeo trang sức gì...",
    permalink: "https://www.tiktok.com/@HuykSilver/video/5",
    channel: "Huyk.Silver",
    format: "VIDEO",
    date: "26/6/2026",
    staff: "[Nguyễn An]",
    concept: "Cũ",
    line: "A4",
    productCode: "",
    productName: "",
    totalViews: 68,
    totalViewsPaid: 0,
    totalViewsOrganic: 0,
    totalReach: 0,
    totalLikes: 1,
    totalComments: 0,
    totalShares: 0,
    views: 68,
    viewsPaid: 0,
    viewsOrganic: 0,
    reach: 0,
    likes: 1,
    comments: 0,
    shares: 0,
    avgWatchTime: 4.10
  },
  {
    id: "6",
    caption: "Ít ai để ý rằng, ngón tay đeo nhẫn...",
    permalink: "https://www.tiktok.com/@HuykKimHoan/video/6",
    channel: "HuyK - Kim Hoà...",
    format: "VIDEO",
    date: "26/6/2026",
    staff: "[Nguyễn Thị Ánh]",
    concept: "Mới",
    line: "A1",
    productCode: "",
    productName: "",
    totalViews: 50,
    totalViewsPaid: 0,
    totalViewsOrganic: 0,
    totalReach: 0,
    totalLikes: 1,
    totalComments: 0,
    totalShares: 0,
    views: 50,
    viewsPaid: 0,
    viewsOrganic: 0,
    reach: 0,
    likes: 1,
    comments: 0,
    shares: 0,
    avgWatchTime: 9.55
  },
  {
    id: "7",
    caption: "Mọi người có thực sự biết về đá quý...",
    permalink: "https://www.tiktok.com/@HuykSilver/video/7",
    channel: "Huyk.Silver",
    format: "VIDEO",
    date: "26/6/2026",
    staff: "[Nguyễn An]",
    concept: "Cũ",
    line: "A3",
    productCode: "",
    productName: "",
    totalViews: 644,
    totalViewsPaid: 0,
    totalViewsOrganic: 0,
    totalReach: 0,
    totalLikes: 13,
    totalComments: 0,
    totalShares: 0,
    views: 644,
    viewsPaid: 0,
    viewsOrganic: 0,
    reach: 0,
    likes: 13,
    comments: 0,
    shares: 0,
    avgWatchTime: 5.69
  },
  {
    id: "8",
    caption: "Đố mọi người biết đây là đá quý gì...",
    permalink: "https://www.tiktok.com/@HuykMeDaQuy/video/8",
    channel: "Huyk Mê Đá Quý",
    format: "VIDEO",
    date: "26/6/2026",
    staff: "[Trung Hiếu]",
    concept: "Mới",
    line: "A2",
    productCode: "",
    productName: "",
    totalViews: 421,
    totalViewsPaid: 0,
    totalViewsOrganic: 0,
    totalReach: 0,
    totalLikes: 3,
    totalComments: 0,
    totalShares: 0,
    views: 421,
    viewsPaid: 0,
    viewsOrganic: 0,
    reach: 0,
    likes: 3,
    comments: 0,
    shares: 0,
    avgWatchTime: 9.13
  },
  {
    id: "9",
    caption: "Ai đang tình muốn mua trang sức thì...",
    permalink: "https://www.tiktok.com/@HuyKTrangSuc/video/9",
    channel: "HuyK - Trang S...",
    format: "VIDEO",
    date: "25/6/2026",
    staff: "[Văn Nguyễn]",
    concept: "Cũ",
    line: "A4",
    productCode: "",
    productName: "",
    totalViews: 2197,
    totalViewsPaid: 0,
    totalViewsOrganic: 0,
    totalReach: 0,
    totalLikes: 50,
    totalComments: 10,
    totalShares: 3,
    views: 2197,
    viewsPaid: 0,
    viewsOrganic: 0,
    reach: 0,
    likes: 50,
    comments: 10,
    shares: 3,
    avgWatchTime: 5.20
  },
  {
    id: "10",
    caption: "Người mà vẫn đeo chiếc nhẫn này thì...",
    permalink: "https://www.tiktok.com/@HuyKTrangSuc/video/10",
    channel: "HuyK - Trang S...",
    format: "VIDEO",
    date: "25/6/2026",
    staff: "[Văn Nguyễn]",
    concept: "Mới",
    line: "A4",
    productCode: "",
    productName: "",
    totalViews: 1567,
    totalViewsPaid: 0,
    totalViewsOrganic: 0,
    totalReach: 0,
    totalLikes: 27,
    totalComments: 3,
    totalShares: 3,
    views: 1567,
    viewsPaid: 0,
    viewsOrganic: 0,
    reach: 0,
    likes: 27,
    comments: 3,
    shares: 3,
    avgWatchTime: 10.23
  },
  {
    id: "11",
    caption: "Thợ Việt Nam chế tác trang sức đá quý...",
    permalink: "https://www.tiktok.com/@NhanNhanTho/video/11",
    channel: "Nhạn Nhạn - Th...",
    format: "VIDEO",
    date: "25/6/2026",
    staff: "[]",
    concept: "",
    line: "A3",
    productCode: "",
    productName: "",
    totalViews: 257,
    totalViewsPaid: 0,
    totalViewsOrganic: 0,
    totalReach: 0,
    totalLikes: 13,
    totalComments: 0,
    totalShares: 0,
    views: 257,
    viewsPaid: 0,
    viewsOrganic: 0,
    reach: 0,
    likes: 13,
    comments: 0,
    shares: 0,
    avgWatchTime: 16.50
  },
  {
    id: "12",
    caption: "Những vị hoàng đế đeo nhẫn ngọc như...",
    permalink: "https://www.tiktok.com/@HuyKMeKim/video/12",
    channel: "HuyK Mê Kim ...",
    format: "VIDEO",
    date: "25/6/2026",
    staff: "[Phong Nguyễn...]",
    concept: "Mới",
    line: "A2",
    productCode: "",
    productName: "",
    totalViews: 147,
    totalViewsPaid: 0,
    totalViewsOrganic: 0,
    totalReach: 0,
    totalLikes: 7,
    totalComments: 0,
    totalShares: 0,
    views: 147,
    viewsPaid: 0,
    viewsOrganic: 0,
    reach: 0,
    likes: 7,
    comments: 0,
    shares: 0,
    avgWatchTime: 13.28
  }
];

export default function TiktokContentPage() {
  const [videos, setVideos] = useState(initialVideos);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Nạp data thật từ BE (TikTok organic).
  useEffect(() => {
    apiGet("/content/list?platform=TIKTOK")
      .then((rows: any[]) => setVideos(rows.map((r) => ({
        id: r.videoId, caption: r.caption ?? "", permalink: r.link ?? "#", channel: r.channel ?? "", format: "VIDEO", date: r.date ?? "",
        staff: r.staff ?? "-", concept: r.concept ?? "-", line: r.line ?? "-", productCode: r.productCode ?? "", productName: r.productName ?? "",
        totalViews: r.views ?? 0, totalViewsPaid: 0, totalViewsOrganic: r.views ?? 0, totalReach: r.reach ?? 0, totalLikes: r.likes ?? 0, totalComments: r.comments ?? 0, totalShares: r.shares ?? 0,
        views: r.views ?? 0, viewsPaid: 0, viewsOrganic: r.views ?? 0, reach: r.reach ?? 0, likes: r.likes ?? 0, comments: r.comments ?? 0, shares: r.shares ?? 0, avgWatchTime: 0,
      }))))
      .catch(() => {});
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  // Active filters list
  const [activeFilters, setActiveFilters] = useState([
    { id: "date", label: "date trong khoảng thời gian: 30 ngày qua" },
    { id: "created_time", label: "created_time trong khoảng thời gian: 30 ngày qua" }
  ]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on "/" keydown
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Remove individual filter tag
  function removeFilter(id: string) {
    setActiveFilters(activeFilters.filter((filter) => filter.id !== id));
  }

  // Handle Sort
  function requestSort(key: string) {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedData = [...videos].sort((a: any, b: any) => {
      if (a[key] === undefined || b[key] === undefined) return 0;
      if (typeof a[key] === "number" && typeof b[key] === "number") {
        return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
      }
      return direction === "asc"
        ? String(a[key]).localeCompare(String(b[key]))
        : String(b[key]).localeCompare(String(a[key]));
    });
    setVideos(sortedData);
  }

  // Handle Select All
  function handleSelectAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setSelectedIds(videos.map((vid) => vid.id));
    } else {
      setSelectedIds([]);
    }
  }

  // Handle Select Row
  function handleSelectRow(id: string, checked: boolean) {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    }
  }

  // Filter list by search query
  const filteredVideos = videos.filter((vid) => {
    return (
      vid.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vid.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vid.staff.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300 w-full max-w-full text-gray-200">
      
      {/* Sticky Filters Toolbar Row */}
      <div className="sticky top-0 z-20 bg-[#0a0a0a] py-2 -mx-4 px-4 sm:-mx-5 sm:px-5 shrink-0">
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-3 flex flex-wrap items-center justify-between gap-4 shadow-md">
          {/* Left Side: Filter Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <div
                key={filter.id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f2937] border border-[#1f2937] hover:border-gray-700 rounded-lg text-xs text-gray-300 transition-colors"
              >
                <span>{filter.label}</span>
                <button
                  onClick={() => removeFilter(filter.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                  title="Xóa bộ lọc"
                >
                  <X size={12} weight="bold" />
                </button>
              </div>
            ))}
          </div>

          {/* Right Side: Input & Action Buttons */}
          <div className="flex items-center gap-3.5">
            {/* Quick Filter Search input */}
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Bộ lọc (/)"
                className="bg-[#1f2937]/50 border border-[#1f2937] hover:border-gray-700 rounded-lg px-3 py-1.5 pl-9 text-xs focus:border-blue-500 focus:outline-none w-[180px] text-white transition-all font-medium"
              />
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            </div>

            {/* Save Button */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f2937]/80 hover:bg-[#1f2937] border border-[#1f2937] text-blue-400 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
              <FloppyDisk size={14} />
              Lưu
            </button>

            {/* Export Button */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f2937]/80 hover:bg-[#1f2937] border border-[#1f2937] text-gray-300 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
              <DownloadSimple size={14} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl shadow-md overflow-hidden">
        <div className="overflow-auto w-full max-h-[calc(100vh-380px)] custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse relative">
            <thead>
              <tr className="border-b border-[#1f2937] text-gray-400 font-semibold select-none">
                
                {/* Checkbox column */}
                <th className="sticky top-0 z-10 bg-[#1e293b] py-3 px-4 w-12 text-center border-r border-[#1f2937]/40">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === videos.length && videos.length > 0}
                    onChange={handleSelectAll}
                    className="accent-blue-500 cursor-pointer rounded"
                  />
                </th>

                {/* Column Headers */}
                {[
                  { key: "caption", label: "Caption" },
                  { key: "permalink", label: "permalink" },
                  { key: "channel", label: "Kênh" },
                  { key: "format", label: "Định dạng" },
                  { key: "date", label: "Ngày tạo" },
                  { key: "staff", label: "Nhân sự" },
                  { key: "concept", label: "Concept" },
                  { key: "line", label: "Tuyến nội dung" },
                  { key: "productCode", label: "Mã sản phẩm" },
                  { key: "productName", label: "Tên sản phẩm" },
                  { key: "totalViews", label: "Tổng lượt xem" },
                  { key: "totalViewsPaid", label: "Tổng lượt xem trả phí" },
                  { key: "totalViewsOrganic", label: "Tổng lượt xem tự nhiên" },
                  { key: "totalReach", label: "Tổng lượt tiếp cận" },
                  { key: "totalLikes", label: "Tổng lượt thích" },
                  { key: "totalComments", label: "Tổng lượt bình luận" },
                  { key: "totalShares", label: "Tổng lượt chia sẻ" },
                  { key: "views", label: "Lượt xem" },
                  { key: "viewsPaid", label: "Lượt xem trả phí" },
                  { key: "viewsOrganic", label: "Lượt xem tự nhiên" },
                  { key: "reach", label: "Lượt tiếp cận" },
                  { key: "likes", label: "Lượt thả cảm xúc" },
                  { key: "comments", label: "Lượt Bình luận" },
                  { key: "shares", label: "Lượt chia sẻ" },
                  { key: "avgWatchTime", label: "Thời gian xem trung bình" }
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.key && requestSort(col.key)}
                    className="sticky top-0 z-10 bg-[#1e293b] py-3 px-4 font-bold border-r border-[#1f2937]/40 cursor-pointer hover:bg-[#1f2937]/40 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <span>{col.label}</span>
                      <ArrowsDownUp size={11} className="text-gray-500" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#1f2937]/40 text-gray-300">
              {filteredVideos.map((vid) => {
                const isSelected = selectedIds.includes(vid.id);
                return (
                  <tr
                    key={vid.id}
                    className={`hover:bg-[#1f2937]/20 transition-all ${
                      isSelected ? "bg-blue-500/5" : ""
                    }`}
                  >
                    {/* Checkbox cell */}
                    <td className="py-2.5 px-4 text-center border-r border-[#1f2937]/40">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(vid.id, e.target.checked)}
                        className="accent-blue-500 cursor-pointer rounded"
                      />
                    </td>

                    {/* Content cells */}
                    <td className="py-2.5 px-4 max-w-[200px] truncate border-r border-[#1f2937]/40 font-medium text-white" title={vid.caption}>
                      {vid.caption}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40">
                      <a href={vid.permalink} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                        https://www.tik...
                      </a>
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 font-medium text-gray-400">
                      {vid.channel}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 font-medium text-gray-400">
                      <div className="flex items-center gap-1.5 capitalize">
                        <TiktokLogo size={14} className="text-pink-500 fill-current" />
                        <span>{vid.format}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-gray-500">
                      {vid.date}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 font-semibold text-[#a3a3a3]">
                      {vid.staff}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 font-semibold text-gray-400">
                      {vid.concept}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 font-bold text-gray-300">
                      {vid.line}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-gray-500">
                      {vid.productCode}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-gray-500">
                      {vid.productName}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-right font-semibold font-mono">
                      {vid.totalViews.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-right font-semibold font-mono text-gray-500">
                      {vid.totalViewsPaid.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-right font-semibold font-mono text-gray-500">
                      {vid.totalViewsOrganic.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-right font-semibold font-mono text-gray-500">
                      {vid.totalReach.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-right font-semibold font-mono text-gray-400">
                      {vid.totalLikes.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-right font-semibold font-mono text-gray-400">
                      {vid.totalComments.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-right font-semibold font-mono text-gray-400">
                      {vid.totalShares.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-right font-semibold font-mono">
                      {vid.views.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-right font-semibold font-mono text-gray-500">
                      {vid.viewsPaid.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-right font-semibold font-mono text-gray-500">
                      {vid.viewsOrganic.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-right font-semibold font-mono text-gray-500">
                      {vid.reach.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-right font-semibold font-mono text-gray-400">
                      {vid.likes.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-right font-semibold font-mono text-gray-400">
                      {vid.comments.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-right font-semibold font-mono text-gray-400">
                      {vid.shares.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 font-semibold text-[#d4d4d8] text-right font-mono">
                      {vid.avgWatchTime.toLocaleString("vi-VN", { minimumFractionDigits: 2 })}
                    </td>

                  </tr>
                );
              })}
            </tbody>

            {/* Total Footer matching user screenshot sums exactly */}
            <tfoot>
              <tr className="bg-[#111827] text-white font-bold">
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] text-center"></td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] font-black">
                  TỔNG (1844)
                </td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937]"></td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937]"></td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937]"></td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937]"></td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937]"></td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937]"></td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937]"></td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937]"></td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937]"></td>
                
                {/* Sums matched exactly to TikTok screenshots */}
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] text-right font-black font-mono">
                  1.018.122
                </td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] text-right font-black font-mono text-gray-500">
                  0
                </td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] text-right font-black font-mono text-gray-500">
                  0
                </td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] text-right font-black font-mono text-gray-500">
                  0
                </td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] text-right font-black font-mono">
                  23.563
                </td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] text-right font-black font-mono">
                  2.049
                </td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] text-right font-black font-mono text-[#a3a3a3]">
                  8.107
                </td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] text-right font-black font-mono">
                  16.042.176
                </td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] text-right font-black font-mono text-gray-500">
                  0
                </td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] text-right font-black font-mono text-gray-500">
                  0
                </td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] text-right font-black font-mono text-gray-500">
                  0
                </td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] text-right font-black font-mono text-[#3b82f6]">
                  298.974
                </td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] text-right font-black font-mono text-gray-400">
                  21.027
                </td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] text-right font-black font-mono text-gray-400">
                  44.930
                </td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-t-2 border-[#1f2937] text-right font-black font-mono text-amber-500">
                  8,51
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* CSS details to style horizontal scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #111827;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1f2937;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #374151;
        }
      `}</style>

    </div>
  );
}
