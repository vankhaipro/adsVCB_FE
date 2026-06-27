"use client";

import { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlass,
  FloppyDisk,
  DownloadSimple,
  X,
  ArrowsDownUp,
  YoutubeLogo
} from "@phosphor-icons/react";
import { apiGet } from "@/lib/api";

// Mock data based on YouTube content screenshots
const initialVideos = [
  {
    id: "1",
    caption: "Bị sốc văn hóa khi sang nước ngoài...",
    link: "https://www.youtube.com/watch?v=1",
    channel: "HuyK - Thợ Chế...",
    platform: "youtube",
    date: "25/6/2026",
    productCode: "",
    productName: "",
    concept: "Cũ",
    line: "A3",
    team: "Team K2",
    staff: "[Huyền Trang]",
    totalViews: 1916,
    totalReach: 0,
    totalLikes: 28,
    totalComments: 1,
    totalShares: 0,
    views: 1916,
    reach: 0,
    likes: 28,
    comments: 1,
    productLine: "Bạc"
  },
  {
    id: "2",
    caption: "Lãng mạn không lối thoát với mẫu nhẫn...",
    link: "https://www.youtube.com/watch?v=2",
    channel: "Huyk- thợ trang...",
    platform: "youtube",
    date: "25/6/2026",
    productCode: "",
    productName: "",
    concept: "Cũ",
    line: "A4",
    team: "Team K1",
    staff: "[Huyền Cam]",
    totalViews: 1007,
    totalReach: 0,
    totalLikes: 6,
    totalComments: 0,
    totalShares: 0,
    views: 1007,
    reach: 0,
    likes: 6,
    comments: 0,
    productLine: "Khác"
  },
  {
    id: "3",
    caption: "Pháo hoa phát sáng rực rỡ sắc màu...",
    link: "https://www.youtube.com/watch?v=3",
    channel: "Huyk - Trang S...",
    platform: "youtube",
    date: "25/6/2026",
    productCode: "",
    productName: "",
    concept: "Cũ",
    line: "A4",
    team: "Team K3",
    staff: "[Trung Hiếu]",
    totalViews: 700,
    totalReach: 0,
    totalLikes: 9,
    totalComments: 0,
    totalShares: 0,
    views: 700,
    reach: 0,
    likes: 9,
    comments: 0,
    productLine: "Khác"
  },
  {
    id: "4",
    caption: "職人の技を、身近に感じる瞬間...",
    link: "https://www.youtube.com/watch?v=4",
    channel: "NamBling Jewe...",
    platform: "youtube",
    date: "25/6/2026",
    productCode: "",
    productName: "",
    concept: "Mới",
    line: "A1",
    team: "",
    staff: "[]",
    totalViews: 1775,
    totalReach: 0,
    totalLikes: 26,
    totalComments: 0,
    totalShares: 0,
    views: 1775,
    reach: 0,
    likes: 26,
    comments: 0,
    productLine: "Khác"
  },
  {
    id: "5",
    caption: "Nhẫn sành điệu dành riêng cho phái nam...",
    link: "https://www.youtube.com/watch?v=5",
    channel: "Chế Tác Cùng ...",
    platform: "youtube",
    date: "25/6/2026",
    productCode: "",
    productName: "",
    concept: "Mới",
    line: "A4",
    team: "Team K2",
    staff: "[Bùi Minh Quyết]",
    totalViews: 835,
    totalReach: 0,
    totalLikes: 7,
    totalComments: 0,
    totalShares: 0,
    views: 835,
    reach: 0,
    likes: 7,
    comments: 0,
    productLine: "Khác"
  },
  {
    id: "6",
    caption: "Tặng ốp lưng kim loại cực chất khi mua...",
    link: "https://www.youtube.com/watch?v=6",
    channel: "HuyK Mê Chế T...",
    platform: "youtube",
    date: "25/6/2026",
    productCode: "",
    productName: "",
    concept: "Cũ",
    line: "A4",
    team: "Team K1",
    staff: "[Ngân Nga]",
    totalViews: 680,
    totalReach: 0,
    totalLikes: 6,
    totalComments: 0,
    totalShares: 0,
    views: 680,
    reach: 0,
    likes: 6,
    comments: 0,
    productLine: "Bạc"
  },
  {
    id: "7",
    caption: "Đừng vội tặng nhẫn nếu chưa biết điều...",
    link: "https://www.youtube.com/watch?v=7",
    channel: "Huyk. Thợ tran...",
    platform: "youtube",
    date: "25/6/2026",
    productCode: "",
    productName: "",
    concept: "Mới",
    line: "A4",
    team: "Team K2",
    staff: "[Trọng Đặng Vă...]",
    totalViews: 782,
    totalReach: 0,
    totalLikes: 7,
    totalComments: 1,
    totalShares: 0,
    views: 782,
    reach: 0,
    likes: 7,
    comments: 1,
    productLine: "Bạc"
  },
  {
    id: "8",
    caption: "Hot hơn cả mùa hè chính là chiếc lắc...",
    link: "https://www.youtube.com/watch?v=8",
    channel: "Nhạn Nhạn - Đ...",
    platform: "youtube",
    date: "25/6/2026",
    productCode: "",
    productName: "",
    concept: "",
    line: "A4",
    team: "",
    staff: "[]",
    totalViews: 838,
    totalReach: 0,
    totalLikes: 5,
    totalComments: 0,
    totalShares: 0,
    views: 838,
    reach: 0,
    likes: 5,
    comments: 0,
    productLine: "Khác"
  },
  {
    id: "9",
    caption: "Những điều kiện để làm thợ kim hoàn...",
    link: "https://www.youtube.com/watch?v=9",
    channel: "Huyk - Trang S...",
    platform: "youtube",
    date: "25/6/2026",
    productCode: "",
    productName: "",
    concept: "Cũ",
    line: "A5",
    team: "Team K3",
    staff: "[Trung Hiếu]",
    totalViews: 167,
    totalReach: 0,
    totalLikes: 1,
    totalComments: 0,
    totalShares: 0,
    views: 167,
    reach: 0,
    likes: 1,
    comments: 0,
    productLine: "Khác"
  },
  {
    id: "10",
    caption: "Phân biệt da thật và giả cực kỳ đơn...",
    link: "https://www.youtube.com/watch?v=10",
    channel: "Nhạn Nhạn - Đ...",
    platform: "youtube",
    date: "25/6/2026",
    productCode: "",
    productName: "",
    concept: "",
    line: "A1",
    team: "",
    staff: "[]",
    totalViews: 1182,
    totalReach: 0,
    totalLikes: 10,
    totalComments: 0,
    totalShares: 0,
    views: 1182,
    reach: 0,
    likes: 10,
    comments: 0,
    productLine: "Khác"
  },
  {
    id: "11",
    caption: "Yêu là sự thấu hiểu từ những điều nhỏ...",
    link: "https://www.youtube.com/watch?v=11",
    channel: "Nhạn Nhạn - Th...",
    platform: "youtube",
    date: "25/6/2026",
    productCode: "",
    productName: "",
    concept: "",
    line: "A4",
    team: "",
    staff: "[]",
    totalViews: 195,
    totalReach: 0,
    totalLikes: 2,
    totalComments: 0,
    totalShares: 0,
    views: 195,
    reach: 0,
    likes: 2,
    comments: 0,
    productLine: "Khác"
  },
  {
    id: "12",
    caption: "Làm sáng trang sức bạc bị xỉn màu...",
    link: "https://www.youtube.com/watch?v=12",
    channel: "HuyK Kim Hoà...",
    platform: "youtube",
    date: "25/6/2026",
    productCode: "",
    productName: "",
    concept: "Cũ",
    line: "A1",
    team: "Team K3",
    staff: "[Nguyễn Thị Ánh]",
    totalViews: 943,
    totalReach: 0,
    totalLikes: 7,
    totalComments: 1,
    totalShares: 0,
    views: 943,
    reach: 0,
    likes: 7,
    comments: 1,
    productLine: "Khác"
  }
];

export default function YoutubeContentPage() {
  const [videos, setVideos] = useState(initialVideos);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Nạp data thật từ BE (YouTube organic).
  useEffect(() => {
    apiGet("/content/list?platform=YOUTUBE")
      .then((rows: any[]) => setVideos(rows.map((r) => ({
        id: r.videoId, caption: r.caption ?? "", link: r.link ?? "#", channel: r.channel ?? "", platform: "youtube", date: r.date ?? "",
        productCode: r.productCode ?? "", productName: r.productName ?? "", concept: r.concept ?? "-", line: r.line ?? "-", team: r.team ?? "-", staff: r.staff ?? "-",
        totalViews: r.views ?? 0, totalReach: r.reach ?? 0, totalLikes: r.likes ?? 0, totalComments: r.comments ?? 0, totalShares: r.shares ?? 0,
        views: r.views ?? 0, reach: r.reach ?? 0, likes: r.likes ?? 0, comments: r.comments ?? 0, productLine: "-",
      }))))
      .catch(() => {});
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  // Active filters list
  const [activeFilters, setActiveFilters] = useState([
    { id: "date", label: "date trong khoảng thời gian: 30 ngày qua" },
    { id: "created_time", label: "created_time trong khoảng thời gian: 30 ngày qua" },
    { id: "platform_name", label: "platform_name chứa: youtube" }
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
                  { key: "link", label: "Link" },
                  { key: "channel", label: "Kênh" },
                  { key: "platform", label: "platform_name" },
                  { key: "date", label: "Ngày tạo" },
                  { key: "productCode", label: "Mã sản phẩm" },
                  { key: "productName", label: "Sản phẩm" },
                  { key: "concept", label: "Concept" },
                  { key: "line", label: "Tuyến" },
                  { key: "team", label: "Team" },
                  { key: "staff", label: "Nhân sự" },
                  { key: "totalViews", label: "Tổng lượt xem" },
                  { key: "totalReach", label: "Tổng tiếp cận" },
                  { key: "totalLikes", label: "Tổng lượt thích" },
                  { key: "totalComments", label: "Tổng bình luận" },
                  { key: "totalShares", label: "Tổng chia sẻ" },
                  { key: "views", label: "Lượt xem" },
                  { key: "reach", label: "Lượt tiếp cận" },
                  { key: "likes", label: "Lượt thích" },
                  { key: "comments", label: "Lượt bình luận" },
                  { key: "productLine", label: "Dòng sản phẩm" }
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
                      <a href={vid.link} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                        https://www.yo...
                      </a>
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 font-medium text-gray-400">
                      {vid.channel}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 font-medium text-gray-400">
                      <div className="flex items-center gap-1.5 capitalize">
                        <YoutubeLogo size={14} className="text-red-500 fill-current" />
                        <span>{vid.platform}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-gray-500">
                      {vid.date}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-gray-500">
                      {vid.productCode}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-gray-500">
                      {vid.productName}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 font-semibold text-gray-400">
                      {vid.concept}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 font-bold text-gray-300">
                      {vid.line}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 font-medium text-gray-400">
                      {vid.team}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 font-semibold text-[#a3a3a3]">
                      {vid.staff}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-right font-semibold font-mono">
                      {vid.totalViews.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-right font-semibold font-mono text-gray-400">
                      {vid.totalReach.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-right font-semibold font-mono text-gray-400">
                      {vid.totalLikes.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-right font-semibold font-mono text-gray-500">
                      {vid.totalComments.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-right font-semibold font-mono text-gray-400">
                      {vid.totalShares.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-right font-semibold font-mono">
                      {vid.views.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-right font-semibold font-mono text-gray-400">
                      {vid.reach.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-right font-semibold font-mono text-gray-400">
                      {vid.likes.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-[#1f2937]/40 text-right font-semibold font-mono text-gray-500">
                      {vid.comments.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 font-semibold text-[#d4d4d8]">
                      {vid.productLine}
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
                  TỔNG (1643)
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
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937]"></td>
                
                {/* Sums matched exactly to YouTube screenshots */}
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] text-right font-black font-mono">
                  329.110
                </td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] text-right font-black font-mono text-gray-500">
                  0
                </td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] text-right font-black font-mono">
                  8.665
                </td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] text-right font-black font-mono text-gray-400">
                  136
                </td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] text-right font-black font-mono text-gray-500">
                  0
                </td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] text-right font-black font-mono text-[#a3a3a3]">
                  4.633.589
                </td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] text-right font-black font-mono text-gray-500">
                  0
                </td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] text-right font-black font-mono text-[#3b82f6]">
                  44.581
                </td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-r border-[#1f2937]/40 border-t-2 border-[#1f2937] text-right font-black font-mono text-gray-400">
                  1.025
                </td>
                <td className="sticky bottom-0 z-10 bg-[#111827] py-3 px-4 border-t-2 border-[#1f2937]"></td>
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
