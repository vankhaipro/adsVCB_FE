"use client";

import { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlass,
  FloppyDisk,
  DownloadSimple,
  X,
  ArrowsDownUp,
  FacebookLogo,
  InstagramLogo
} from "@phosphor-icons/react";
import { apiGet } from "@/lib/api";
import ContentFilterDropdowns, { matchContentFilters, EMPTY_DIM_FILTERS } from "@/components/ContentFilterDropdowns";
import CopyableText from "@/components/CopyableText";

// Mock data based on user screenshots
const initialPosts = [
  {
    id: "1",
    caption: "Đố mọi người biết đây là sản phẩm gì...",
    link: "https://www.facebook.com/watch?v=123",
    channel: "Huyk Mê Đá Quý",
    platform: "facebook",
    date: "26/6/2026",
    productCode: "",
    productName: "",
    concept: "Mới",
    line: "A2",
    team: "Team K3",
    staff: "[Trung Hiếu]",
    totalViews: 990,
    totalReach: 699,
    totalLikes: 6,
    totalComments: 0,
    totalShares: 0,
    views: 990,
    reach: 699,
    likes: 6,
    comments: 0,
    productLine: "Khác"
  },
  {
    id: "2",
    caption: "Phụ nữ nên đeo trang sức gì vào mùa hè...",
    link: "https://www.facebook.com/watch?v=124",
    channel: "Huyk Mê Đá Quý",
    platform: "facebook",
    date: "26/6/2026",
    productCode: "",
    productName: "",
    concept: "Cũ",
    line: "A1",
    team: "Team K3",
    staff: "[Trung Hiếu]",
    totalViews: 539,
    totalReach: 85,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 1,
    views: 539,
    reach: 85,
    likes: 0,
    comments: 0,
    productLine: "Vàng"
  },
  {
    id: "3",
    caption: "đặt chiếc dây chuyền này lên bàn cân...",
    link: "https://www.facebook.com/watch?v=125",
    channel: "1/2/2001",
    platform: "facebook",
    date: "26/6/2026",
    productCode: "",
    productName: "",
    concept: "Mới",
    line: "A4",
    team: "Team K2",
    staff: "[Bùi Minh Quyết]",
    totalViews: 46,
    totalReach: 33,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    views: 46,
    reach: 33,
    likes: 0,
    comments: 0,
    productLine: "Khác"
  },
  {
    id: "4",
    caption: "dây chuyền mở khóa tình yêu độc đáo...",
    link: "https://www.facebook.com/watch?v=126",
    channel: "1/2/2001",
    platform: "facebook",
    date: "26/6/2026",
    productCode: "",
    productName: "",
    concept: "Cũ",
    line: "A2",
    team: "Team K2",
    staff: "[Bùi Minh Quyết]",
    totalViews: 25,
    totalReach: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    views: 25,
    reach: 0,
    likes: 0,
    comments: 0,
    productLine: "Khác"
  },
  {
    id: "5",
    caption: "Người tặng bạn chiếc nhẫn này là ai...",
    link: "https://www.facebook.com/watch?v=127",
    channel: "Huyk - Chế Tác ...",
    platform: "facebook",
    date: "26/6/2026",
    productCode: "",
    productName: "",
    concept: "Mới",
    line: "A4",
    team: "Team K2",
    staff: "[Bui Doan]",
    totalViews: 138,
    totalReach: 122,
    totalLikes: 3,
    totalComments: 1,
    totalShares: 1,
    views: 138,
    reach: 122,
    likes: 3,
    comments: 1,
    productLine: "Vàng"
  },
  {
    id: "6",
    caption: "Vàng bị nam châm hút là thật hay giả...",
    link: "https://www.facebook.com/watch?v=128",
    channel: "Huyk - Chế Tác ...",
    platform: "facebook",
    date: "26/6/2026",
    productCode: "",
    productName: "",
    concept: "Cũ",
    line: "A2",
    team: "Team K2",
    staff: "[Bui Doan]",
    totalViews: 367,
    totalReach: 133,
    totalLikes: 2,
    totalComments: 0,
    totalShares: 0,
    views: 367,
    reach: 133,
    likes: 2,
    comments: 0,
    productLine: "Khác"
  },
  {
    id: "7",
    caption: "Người mà vẫn đeo chiếc lắc tay này...",
    link: "https://www.facebook.com/watch?v=129",
    channel: "Huyk - Trang S...",
    platform: "facebook",
    date: "26/6/2026",
    productCode: "",
    productName: "",
    concept: "Mới",
    line: "A4",
    team: "Team K2",
    staff: "[Văn Nguyễn]",
    totalViews: 0,
    totalReach: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    views: 0,
    reach: 0,
    likes: 0,
    comments: 0,
    productLine: "Vàng"
  },
  {
    id: "8",
    caption: "Vàng bị nam châm hút - P2...",
    link: "https://www.instagram.com/p/130",
    channel: "Huyk - Chế Tác ...",
    platform: "instagram",
    date: "26/6/2026",
    productCode: "",
    productName: "",
    concept: "Cũ",
    line: "A2",
    team: "Team K2",
    staff: "[Bui Doan]",
    totalViews: 54,
    totalReach: 0,
    totalLikes: 1,
    totalComments: 0,
    totalShares: 0,
    views: 54,
    reach: 0,
    likes: 1,
    comments: 0,
    productLine: "Vàng"
  },
  {
    id: "9",
    caption: "Trạm khắc thủ công tinh xảo trên đá...",
    link: "https://www.facebook.com/watch?v=131",
    channel: "Nhạn Nhạn - X...",
    platform: "facebook",
    date: "25/6/2026",
    productCode: "",
    productName: "",
    concept: "",
    line: "A2",
    team: "",
    staff: "[]",
    totalViews: 61,
    totalReach: 38,
    totalLikes: 2,
    totalComments: 0,
    totalShares: 0,
    views: 61,
    reach: 38,
    likes: 2,
    comments: 0,
    productLine: "Khác"
  },
  {
    id: "10",
    caption: "Đang khâu mà đứt chỉ thì phải làm sao...",
    link: "https://www.facebook.com/watch?v=132",
    channel: "Nhạn Nhạn - X...",
    platform: "facebook",
    date: "25/6/2026",
    productCode: "",
    productName: "",
    concept: "",
    line: "A2",
    team: "",
    staff: "[]",
    totalViews: 308,
    totalReach: 263,
    totalLikes: 1,
    totalComments: 0,
    totalShares: 0,
    views: 308,
    reach: 263,
    likes: 1,
    comments: 0,
    productLine: "Khác"
  },
  {
    id: "11",
    caption: "Mẫu như này thì đeo ngón nào hợp...",
    link: "https://www.facebook.com/watch?v=133",
    channel: "Nhạn Nhạn - X...",
    platform: "facebook",
    date: "25/6/2026",
    productCode: "",
    productName: "",
    concept: "",
    line: "A4",
    team: "",
    staff: "[]",
    totalViews: 38,
    totalReach: 34,
    totalLikes: 3,
    totalComments: 0,
    totalShares: 1,
    views: 38,
    reach: 34,
    likes: 3,
    comments: 0,
    productLine: "Khác"
  },
  {
    id: "12",
    caption: "Vũ khí của thợ kim hoàn chuyên nghiệp...",
    link: "https://www.facebook.com/watch?v=134",
    channel: "Nhạn Nhạn - X...",
    platform: "facebook",
    date: "25/6/2026",
    productCode: "",
    productName: "",
    concept: "",
    line: "A2",
    team: "",
    staff: "[]",
    totalViews: 30,
    totalReach: 25,
    totalLikes: 2,
    totalComments: 0,
    totalShares: 0,
    views: 30,
    reach: 25,
    likes: 2,
    comments: 0,
    productLine: "Khác"
  }
];

export default function MetaContentPage() {
  const [posts, setPosts] = useState(initialPosts);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Nạp data thật từ BE (Meta = Facebook + Instagram organic).
  useEffect(() => {
    apiGet("/content/list?platform=META")
      .then((rows: any[]) => setPosts(rows.map((r) => ({
        id: r.videoId, caption: r.caption ?? "", link: r.link ?? "#", channel: r.channel ?? "", platform: r.platform ?? "facebook",
        date: r.date ?? "", productCode: r.productCode ?? "", productName: r.productName ?? "", concept: r.concept ?? "-",
        line: r.line ?? "-", team: r.team ?? "-", staff: r.staff ?? "-",
        totalViews: r.views ?? 0, totalReach: r.reach ?? 0, totalLikes: r.likes ?? 0, totalComments: r.comments ?? 0, totalShares: r.shares ?? 0,
        views: r.views ?? 0, reach: r.reach ?? 0, likes: r.likes ?? 0, comments: r.comments ?? 0, shares: r.shares ?? 0, productLine: "-",
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

    const sortedData = [...posts].sort((a: any, b: any) => {
      if (a[key] === undefined || b[key] === undefined) return 0;
      if (typeof a[key] === "number" && typeof b[key] === "number") {
        return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
      }
      return direction === "asc"
        ? String(a[key]).localeCompare(String(b[key]))
        : String(b[key]).localeCompare(String(a[key]));
    });
    setPosts(sortedData);
  }

  // Handle Select All
  function handleSelectAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setSelectedIds(posts.map((post) => post.id));
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

  // Filter list by search query + dropdown chỉ số (concept/tuyến/team/nhân sự/kênh)
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.staff.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && matchContentFilters(post, dimFilters);
  });

  const totals = filteredPosts.reduce((acc, curr) => {
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
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / itemsPerPage));
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300 w-full max-w-full text-foreground">
      
      {/* Sticky Filters Toolbar Row */}
      <div className="sticky top-0 z-20 bg-background py-2 -mx-4 px-4 sm:-mx-5 sm:px-5 shrink-0">
        <div className="bg-card border border-border rounded-xl p-3 flex flex-wrap items-center justify-between gap-4 shadow-md">
          {/* Left Side: Bộ lọc theo chiều (concept/tuyến/team/nhân sự/kênh) */}
          <ContentFilterDropdowns items={posts} value={dimFilters} onChange={setDimFilters} />

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
                    checked={selectedIds.length === posts.length && posts.length > 0}
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
              {paginatedPosts.map((post) => {
                const isSelected = selectedIds.includes(post.id);
                return (
                  <tr
                    key={post.id}
                    className={`hover:bg-muted/20 transition-all ${
                      isSelected ? "bg-blue-500/5" : ""
                    }`}
                  >
                    {/* Checkbox cell */}
                    <td className="py-2.5 px-4 text-center border-r border-border">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(post.id, e.target.checked)}
                        className="accent-blue-500 cursor-pointer rounded"
                      />
                    </td>

                    {/* Content cells */}
                    <td className="py-2.5 px-4 max-w-[200px] truncate border-r border-border font-medium text-foreground">
                      <CopyableText text={post.caption} />
                    </td>

                    <td className="py-2.5 px-4 border-r border-border">
                      <a href={post.link} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                        https://www.fa...
                      </a>
                    </td>

                    <td className="py-2.5 px-4 border-r border-border font-medium text-muted-foreground">
                      {post.channel}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border font-medium text-muted-foreground">
                      <div className="flex items-center gap-1.5 capitalize">
                        {post.platform === "facebook" ? (
                          <FacebookLogo size={14} className="text-blue-500 fill-current" />
                        ) : (
                          <InstagramLogo size={14} className="text-pink-500 fill-current" />
                        )}
                        <span>{post.platform}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-4 border-r border-border text-muted-foreground">
                      {post.date}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border text-muted-foreground">
                      {post.productCode}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border text-muted-foreground">
                      {post.productName}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border font-semibold text-muted-foreground">
                      {post.concept}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border font-bold text-foreground">
                      {post.line}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border font-medium text-muted-foreground">
                      {post.team}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border font-semibold text-muted-foreground">
                      {post.staff}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border text-right font-semibold font-mono">
                      {post.totalViews.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border text-right font-semibold font-mono text-muted-foreground">
                      {post.totalReach.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border text-right font-semibold font-mono text-muted-foreground">
                      {post.totalLikes.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border text-right font-semibold font-mono text-muted-foreground">
                      {post.totalComments.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border text-right font-semibold font-mono text-muted-foreground">
                      {post.totalShares.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border text-right font-semibold font-mono">
                      {post.views.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border text-right font-semibold font-mono text-muted-foreground">
                      {post.reach.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border text-right font-semibold font-mono text-muted-foreground">
                      {post.likes.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 border-r border-border text-right font-semibold font-mono text-muted-foreground">
                      {post.comments.toLocaleString("vi-VN")}
                    </td>

                    <td className="py-2.5 px-4 font-semibold text-foreground">
                      {post.productLine}
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
                  TỔNG ({filteredPosts.length})
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
                <td className="sticky bottom-0 z-10 bg-card py-3 px-4 border-r border-border border-t-2 border-border text-right font-black font-mono">
                  {totals.totalShares.toLocaleString("vi-VN")}
                </td>
                <td className="sticky bottom-0 z-10 bg-card py-3 px-4 border-r border-border border-t-2 border-border text-right font-black font-mono">
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
          <span>Trang {currentPage} / {totalPages} (Tổng số {filteredPosts.length} bản ghi)</span>
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
