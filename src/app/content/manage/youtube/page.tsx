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
import ContentFilterDropdowns, { matchContentFilters, EMPTY_DIM_FILTERS } from "@/components/ContentFilterDropdowns";
import CopyableText from "@/components/CopyableText";

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
  const [dimFilters, setDimFilters] = useState(EMPTY_DIM_FILTERS);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

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

  // Filter list by search query + dropdown chỉ số
  const filteredVideos = videos.filter((vid) => {
    const matchesSearch =
      vid.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vid.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vid.staff.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && matchContentFilters(vid, dimFilters);
  });

  const totals = filteredVideos.reduce((acc, curr) => {
    acc.totalViews += curr.totalViews || 0;
    acc.totalReach += curr.totalReach || 0;
    acc.totalLikes += curr.totalLikes || 0;
    acc.totalComments += curr.totalComments || 0;
    acc.totalShares += curr.totalShares || 0;
    acc.views += curr.views || 0;
    acc.reach += curr.reach || 0;
    acc.likes += curr.likes || 0;
    acc.comments += curr.comments || 0;
    return acc;
  }, { totalViews: 0, totalReach: 0, totalLikes: 0, totalComments: 0, totalShares: 0, views: 0, reach: 0, likes: 0, comments: 0 });

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dimFilters]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredVideos.length / itemsPerPage));
  const paginatedVideos = filteredVideos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300 w-full max-w-full text-foreground">
      
      {/* Sticky Filters Toolbar Row */}
      <div className="sticky top-0 z-20 bg-background py-2 -mx-4 px-4 sm:-mx-5 sm:px-5 shrink-0">
        <div className="bg-card border border-border rounded-xl p-3 flex flex-wrap items-center justify-between gap-4 shadow-md">
          {/* Left Side: Bộ lọc theo chiều (concept/tuyến/team/nhân sự/kênh) */}
          <ContentFilterDropdowns items={videos} value={dimFilters} onChange={setDimFilters} />

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
                className="bg-muted/50 border border-border hover:border-border rounded-lg px-3 py-1.5 pl-9 text-xs focus:border-blue-500 focus:outline-none w-[180px] text-foreground transition-all font-medium"
              />
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            </div>

            {/* Save Button */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/80 hover:bg-muted border border-border text-blue-400 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
              <FloppyDisk size={14} />
              Lưu
            </button>

            {/* Export Button */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/80 hover:bg-muted border border-border text-foreground rounded-lg text-xs font-semibold cursor-pointer transition-colors">
              <DownloadSimple size={14} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-card border border-border rounded-xl shadow-md overflow-hidden">
        <div className="overflow-auto w-full max-h-[calc(100vh-380px)] custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse relative">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-semibold select-none">
                
                {/* Checkbox column */}
                <th className="sticky top-0 z-10 bg-card py-3 px-4 w-12 text-center border-r border-border">
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
                    className="sticky top-0 z-10 bg-card py-3 px-4 font-bold border-r border-border cursor-pointer hover:bg-muted/40 hover:text-foreground transition-colors"
                  >
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <span>{col.label}</span>
                      <ArrowsDownUp size={11} className="text-muted-foreground" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border text-foreground">
              {paginatedVideos.map((vid) => {
                const isSelected = selectedIds.includes(vid.id);
                return (
                  <tr
                    key={vid.id}
                    className={`hover:bg-muted/20 transition-all ${
                      isSelected ? "bg-blue-500/5" : ""
                    }`}
                  >
                    {/* Checkbox cell */}
                    <td className="py-2.5 px-4 text-center border-r border-border">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(vid.id, e.target.checked)}
                        className="accent-blue-500 cursor-pointer rounded"
                      />
                    </td>

                    {/* Content cells */}
                    <td className="py-2.5 px-4 max-w-[200px] truncate border-r border-border font-medium text-foreground">
                      <CopyableText text={vid.caption} />
                    </td>

                    <td className="py-2.5 px-4 border-r border-border">
                      <a href={vid.link} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                        https://www.yo...
                      </a>
                    </td>

                    <td className="py-2.5 px-4 border-r border-border font-medium text-muted-foreground">
                      {vid.channel}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border font-medium text-muted-foreground">
                      <div className="flex items-center gap-1.5 capitalize">
                        <YoutubeLogo size={14} className="text-red-500 fill-current" />
                        <span>{vid.platform}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-4 border-r border-border text-muted-foreground">
                      {vid.date}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border text-muted-foreground">
                      {vid.productCode}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border text-muted-foreground">
                      {vid.productName}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border font-semibold text-muted-foreground">
                      {vid.concept}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border font-bold text-foreground">
                      {vid.line}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border font-medium text-muted-foreground">
                      {vid.team}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border font-semibold text-muted-foreground">
                      {vid.staff}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border text-right font-semibold font-mono">
                      {vid.totalViews.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border text-right font-semibold font-mono text-muted-foreground">
                      {vid.totalReach.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border text-right font-semibold font-mono text-muted-foreground">
                      {vid.totalLikes.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border text-right font-semibold font-mono text-muted-foreground">
                      {vid.totalComments.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border text-right font-semibold font-mono text-muted-foreground">
                      {vid.totalShares.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border text-right font-semibold font-mono">
                      {vid.views.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border text-right font-semibold font-mono text-muted-foreground">
                      {vid.reach.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border text-right font-semibold font-mono text-muted-foreground">
                      {vid.likes.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border text-right font-semibold font-mono text-muted-foreground">
                      {vid.comments.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 font-semibold text-foreground">
                      {vid.productLine}
                    </td>

                  </tr>
                );
              })}
            </tbody>

            {/* Total Footer */}
            <tfoot>
              <tr className="bg-card text-foreground font-bold">
                <td className="sticky bottom-0 z-10 bg-card py-3 px-4 border-r border-border border-t-2 border-border text-center"></td>
                <td className="sticky bottom-0 z-10 bg-card py-3 px-4 border-r border-border border-t-2 border-border font-black">
                  TỔNG ({filteredVideos.length})
                </td>
                <td className="sticky bottom-0 z-10 bg-card py-3 px-4 border-r border-border border-t-2 border-border"></td>
                <td className="sticky bottom-0 z-10 bg-card py-3 px-4 border-r border-border border-t-2 border-border"></td>
                <td className="sticky bottom-0 z-10 bg-card py-3 px-4 border-r border-border border-t-2 border-border"></td>
                <td className="sticky bottom-0 z-10 bg-card py-3 px-4 border-r border-border border-t-2 border-border"></td>
                <td className="sticky bottom-0 z-10 bg-card py-3 px-4 border-r border-border border-t-2 border-border"></td>
                <td className="sticky bottom-0 z-10 bg-card py-3 px-4 border-r border-border border-t-2 border-border"></td>
                <td className="sticky bottom-0 z-10 bg-card py-3 px-4 border-r border-border border-t-2 border-border"></td>
                <td className="sticky bottom-0 z-10 bg-card py-3 px-4 border-r border-border border-t-2 border-border"></td>
                <td className="sticky bottom-0 z-10 bg-card py-3 px-4 border-r border-border border-t-2 border-border"></td>
                <td className="sticky bottom-0 z-10 bg-card py-3 px-4 border-r border-border border-t-2 border-border"></td>
                
                <td className="sticky bottom-0 z-10 bg-card py-3 px-4 border-r border-border border-t-2 border-border text-right font-black font-mono">
                  {totals.totalViews.toLocaleString("vi-VN")}
                </td>
                <td className="sticky bottom-0 z-10 bg-card py-3 px-4 border-r border-border border-t-2 border-border text-right font-black font-mono text-muted-foreground">
                  {totals.totalReach.toLocaleString("vi-VN")}
                </td>
                <td className="sticky bottom-0 z-10 bg-card py-3 px-4 border-r border-border border-t-2 border-border text-right font-black font-mono">
                  {totals.totalLikes.toLocaleString("vi-VN")}
                </td>
                <td className="sticky bottom-0 z-10 bg-card py-3 px-4 border-r border-border border-t-2 border-border text-right font-black font-mono text-muted-foreground">
                  {totals.totalComments.toLocaleString("vi-VN")}
                </td>
                <td className="sticky bottom-0 z-10 bg-card py-3 px-4 border-r border-border border-t-2 border-border text-right font-black font-mono text-muted-foreground">
                  {totals.totalShares.toLocaleString("vi-VN")}
                </td>
                <td className="sticky bottom-0 z-10 bg-card py-3 px-4 border-r border-border border-t-2 border-border text-right font-black font-mono text-muted-foreground">
                  {totals.views.toLocaleString("vi-VN")}
                </td>
                <td className="sticky bottom-0 z-10 bg-card py-3 px-4 border-r border-border border-t-2 border-border text-right font-black font-mono text-muted-foreground">
                  {totals.reach.toLocaleString("vi-VN")}
                </td>
                <td className="sticky bottom-0 z-10 bg-card py-3 px-4 border-r border-border border-t-2 border-border text-right font-black font-mono text-primary">
                  {totals.likes.toLocaleString("vi-VN")}
                </td>
                <td className="sticky bottom-0 z-10 bg-card py-3 px-4 border-r border-border border-t-2 border-border text-right font-black font-mono text-muted-foreground">
                  {totals.comments.toLocaleString("vi-VN")}
                </td>
                <td className="sticky bottom-0 z-10 bg-card py-3 px-4 border-t-2 border-border"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground bg-card border border-border rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span>Hiển thị</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-background border border-border rounded px-2 py-1 outline-none focus:border-blue-500 text-foreground"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
          </select>
          <span>bản ghi / trang</span>
        </div>
        
        <div className="flex items-center gap-3">
          <span>Trang {currentPage} / {totalPages} (Tổng số {filteredVideos.length} bản ghi)</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded bg-muted/80 border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-foreground font-medium"
            >
              Trước
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded bg-muted/80 border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-foreground font-medium"
            >
              Sau
            </button>
          </div>
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
