"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { apiGet } from "@/lib/api";
import { useChartColors } from "@/lib/chartTheme";
import Pagination from "@/components/Pagination";
import DateRangePicker, { presetToDates } from "@/components/DateRangePicker";
import {
  CaretDown,
  FacebookLogo,
  TiktokLogo,
  YoutubeLogo,
  TrendUp,
  Info,
  Tag,
  Star,
  Funnel,
  Download
} from "@phosphor-icons/react";
import { exportWorkbook } from "@/lib/exportExcel";
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
// Báo cáo content thật từ BE (/content/report) + danh sách nội dung (/content/list).
type Grp = { name: string; views: number; count: number };
type GrpRich = Grp & { interactions: number; likes: number; comments: number; shares: number };
type ChannelDetail = { name: string; platform: string; views: number; followers: number; likes: number; comments: number; shares: number; count: number };
type StaffDetail = { name: string; team: string | null; views: number; likes: number; comments: number; shares: number; count: number };
type ListItem = {
  videoId: string; caption: string | null; link: string | null; channel: string | null;
  platform: string; date: string | null; productCode: string | null; concept: string | null;
  line: string | null; team: string | null; staff: string | null;
  views: number; reach: number | null; likes: number; comments: number;
};
type Report = {
  kpis: { views: number; interactions: number; likes: number; comments: number; shares: number; followers: number; videoCount: number };
  byPlatform: Grp[];
  byConcept: Grp[];
  byLine: GrpRich[];
  byTeam: Grp[];
  byMarket?: Grp[];
  byIndustry?: Grp[];
  byProduct: GrpRich[];
  winRate: { win: number; notWin: number; total: number };
  channelsByPlatform: { name: string; count: number }[];
  trendByPlatform: { date: string; FACEBOOK: number; TIKTOK: number; INSTAGRAM: number; YOUTUBE: number }[];
  topVideos: { videoId: string; platform: string; caption: string | null; postUrl: string | null; views: number; likes: number; channelName: string | null; staffName: string | null }[];
  topChannels: { name: string; platform: string; views: number; followers: number; count: number }[];
  topStaff: { name: string; team: string | null; views: number; count: number }[];
  channelDetail: ChannelDetail[];
  staffDetail: StaffDetail[];
  topContent: { name: string; count: number; views: number }[];
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

function FilterSelect({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xoá ô tìm kiếm mỗi khi dropdown đóng (điều chỉnh state lúc render).
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    if (!isOpen) setSearch("");
  }

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : "Tất cả";

  const showSearch = options.length > 8;
  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative z-20" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-muted hover:bg-muted/80 border border-border text-foreground rounded-lg pl-3 pr-8 py-1.5 text-xs focus:outline-none focus:border-blue-500 cursor-pointer min-w-[125px] max-w-[200px] flex items-center justify-between gap-1 w-full text-left"
      >
        <span className="truncate">
          {label}: {displayLabel}
        </span>
        <CaretDown size={10} className="text-muted-foreground shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 z-30 min-w-[220px] max-w-[300px] bg-card border border-border rounded-lg shadow-xl py-1 flex flex-col max-h-72 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
          {showSearch && (
            <div className="px-2 py-1.5 border-b border-border">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full bg-muted border border-border rounded px-2 py-1 text-xs text-foreground outline-none focus:border-blue-500 placeholder:text-muted-foreground"
                autoFocus
              />
            </div>
          )}
          <div className="overflow-y-auto flex-1">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-600 hover:text-white transition-colors ${
                value === "" ? "bg-blue-600/10 text-blue-500 font-bold" : "text-foreground"
              }`}
            >
              {label}: Tất cả
            </button>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-600 hover:text-white transition-colors truncate ${
                    o.value === value ? "bg-blue-600/10 text-blue-500 font-bold" : "text-foreground"
                  }`}
                  title={o.label}
                >
                  {o.label}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                Không tìm thấy kết quả
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContentOverviewPage() {
  const chart = useChartColors();
  const [report, setReport] = useState<Report | null>(null);
  const [list, setList] = useState<ListItem[]>([]);
  const [metaPage, setMetaPage] = useState(1);
  const [tiktokPage, setTiktokPage] = useState(1);
  const [youtubePage, setYoutubePage] = useState(1);

  // ===== Bộ lọc =====
  const [platform, setPlatform] = useState("");
  const [team, setTeam] = useState("");
  const [staff, setStaff] = useState("");
  const [channel, setChannel] = useState("");
  const [dateRange, setDateRange] = useState("last30days");
  const [customFrom, setCustomFrom] = useState(() => presetToDates("last30days").from);
  const [customTo, setCustomTo] = useState(() => presetToDates("last30days").to);

  // Danh sách option cho dropdown — lấy từ toàn bộ dữ liệu (không lọc), nạp 1 lần.
  const [allList, setAllList] = useState<ListItem[]>([]);
  useEffect(() => {
    apiGet("/content/list").then(setAllList).catch(() => {});
  }, []);

  // Query string từ bộ lọc hiện tại.
  const filterQuery = (() => {
    const p = new URLSearchParams();
    const s = new Date(`${customFrom}T00:00:00`);
    const e = new Date(`${customTo}T23:59:59.999`);
    p.set("from", s.toISOString());
    p.set("to", e.toISOString());
    if (platform) p.set("platform", platform);
    if (team) p.set("team", team);
    if (staff) p.set("staff", staff);
    if (channel) p.set("channel", channel);
    return p.toString();
  })();

  // Nạp lại dữ liệu hiển thị mỗi khi bộ lọc đổi. Chỉ setState trong .then().
  useEffect(() => {
    let cancelled = false;
    apiGet(`/content/report?${filterQuery}`)
      .then((d) => { if (!cancelled) setReport(d); })
      .catch(() => {});
    apiGet(`/content/list?${filterQuery}`)
      .then((d) => { if (!cancelled) setList(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [filterQuery]);

  // Về trang 1 ở cả 3 bảng khi bộ lọc đổi (điều chỉnh state lúc render).
  const [prevFilterQuery, setPrevFilterQuery] = useState(filterQuery);
  if (prevFilterQuery !== filterQuery) {
    setPrevFilterQuery(filterQuery);
    setMetaPage(1);
    setTiktokPage(1);
    setYoutubePage(1);
  }

  const distinct = (vals: (string | null)[]) =>
    [...new Set(vals.filter((v): v is string => !!v))].sort((a, b) => a.localeCompare(b));

  // Dynamic cascading dropdown options based on other active filters
  const platformOptions = useMemo(() => {
    let filtered = allList;
    if (team) filtered = filtered.filter((x) => x.team === team);
    if (staff) filtered = filtered.filter((x) => x.staff === staff);
    if (channel) filtered = filtered.filter((x) => x.channel === channel);
    return [...new Set(filtered.map((x) => x.platform.toUpperCase()))]
      .map((p) => ({ value: p, label: PLATFORM_LABEL[p] || p }));
  }, [allList, team, staff, channel]);

  const channelOptions = useMemo(() => {
    let filtered = allList;
    if (platform) filtered = filtered.filter((x) => x.platform.toUpperCase() === platform.toUpperCase());
    if (team) filtered = filtered.filter((x) => x.team === team);
    if (staff) filtered = filtered.filter((x) => x.staff === staff);
    return distinct(filtered.map((x) => x.channel));
  }, [allList, platform, team, staff]);

  const teamOptions = useMemo(() => {
    let filtered = allList;
    if (platform) filtered = filtered.filter((x) => x.platform.toUpperCase() === platform.toUpperCase());
    if (channel) filtered = filtered.filter((x) => x.channel === channel);
    if (staff) filtered = filtered.filter((x) => x.staff === staff);
    return distinct(filtered.map((x) => x.team)).filter((t) => t !== "Không xác định");
  }, [allList, platform, channel, staff]);

  const staffOptions = useMemo(() => {
    let filtered = allList;
    if (platform) filtered = filtered.filter((x) => x.platform.toUpperCase() === platform.toUpperCase());
    if (channel) filtered = filtered.filter((x) => x.channel === channel);
    if (team) filtered = filtered.filter((x) => x.team === team);
    return distinct(filtered.map((x) => x.staff));
  }, [allList, platform, channel, team]);

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

  const marketDistributionData = useMemo(() => {
    if (!report?.byMarket?.length) return [];
    const tot = report.byMarket.reduce((s, m) => s + m.views, 0) || 1;
    const colors: Record<string, string> = {
      "Việt Nam": "#10b981", // Green
      "Global": "#8b5cf6",   // Purple
      "Khác": "#6b7280"
    };
    return report.byMarket.map((m) => ({
      name: m.name,
      value: Number(((m.views / tot) * 100).toFixed(2)),
      color: colors[m.name] || "#6b7280"
    }));
  }, [report]);


  const industryDistributionData = useMemo(() => {
    if (!report?.byIndustry?.length) return [];
    const tot = report.byIndustry.reduce((s: number, ind: Grp) => s + ind.views, 0) || 1;
    const colors: Record<string, string> = {
      "Kim hoàn": "#f59e0b", // Gold/Amber
      "Đồ da": "#3b82f6",    // Blue
      "Khác": "#6b7280"
    };
    return report.byIndustry.map((ind: Grp) => ({
      name: ind.name,
      value: Number(((ind.views / tot) * 100).toFixed(2)),
      color: colors[ind.name] || "#6b7280"
    }));
  }, [report]);


  const marketIndustryBarData = useMemo(() => {
    const list: { name: string; views: number; fill: string }[] = [];
    if (report?.byMarket) {
      report.byMarket.forEach((m: Grp) => {
        list.push({ name: m.name, views: m.views, fill: m.name === "Global" ? "#8b5cf6" : "#10b981" });
      });
    }
    if (report?.byIndustry) {
      report.byIndustry.forEach((ind: Grp) => {
        list.push({ name: ind.name, views: ind.views, fill: ind.name === "Đồ da" ? "#3b82f6" : "#f59e0b" });
      });
    }
    return list;
  }, [report]);
  const viewsTrendData = report?.trendByPlatform
    ? report.trendByPlatform.map((d) => ({ name: d.date.slice(5).replace("-", "/"), Facebook: d.FACEBOOK, Instagram: d.INSTAGRAM, TikTok: d.TIKTOK, YouTube: d.YOUTUBE }))
    : [];
  const topVideosByView = report?.topVideos ? report.topVideos.map((v, i) => ({ id: i + 1, caption: v.caption || "", link: v.postUrl || "#", views: fmtNum(v.views) })) : [];
  const topChannelsByView = report?.topChannels ? report.topChannels.map((c) => ({ platform: PLATFORM_LABEL[c.platform] || c.platform, name: c.name, views: fmtNum(c.views), follows: fmtNum(c.followers) })) : [];
  const topStaffByView = report?.topStaff ? report.topStaff.map((s, i) => ({ id: i + 1, name: s.name, team: s.team || "-", views: fmtNum(s.views) })) : [];
  // Trước đây mỗi bảng dưới đây có 2 bản "(ghi nhận)" và "(thời gian tạo)" cùng trỏ vào một
  // biến, nên hiện ra hai bảng số y hệt nhau — người xem tưởng là hai chỉ số khác nhau.
  // OrganicVideo chỉ có postedAt (ngày đăng) và lastSyncedAt (@updatedAt, mốc kỹ thuật),
  // không có mốc nào để phân biệt hai chiều đó, nên chỉ giữ một bảng cho mỗi loại.
  const realTopSkuData = report?.byProduct
    ? report.byProduct.filter((x) => x.name !== "Khác").slice(0, 10)
        .map((x) => ({ sku: x.name, count: x.count, views: fmtNum(x.views) }))
    : [];

  const realLinePerf = report?.byLine
    ? report.byLine.filter((x) => x.name !== "Khác")
        .map((x) => ({ line: x.name, count: fmtNum(x.count), views: fmtNum(x.views), interactions: fmtNum(x.interactions) }))
    : [];

  // Top nội dung trùng caption nhiều nhất.
  const topProductionContent = report?.topContent ? report.topContent.map((x) => ({ name: x.name, count: x.count })) : [];

  // Hiệu suất chi tiết theo kênh / nhân sự (bỏ cột không có nguồn: avgWatch, reach, saves).
  const detailChannelPerformance = report?.channelDetail
    ? report.channelDetail.map((c) => ({
        platform: PLATFORM_LABEL[c.platform] || c.platform, channel: c.name,
        views: fmtNum(c.views), follows: fmtNum(c.followers),
        likes: fmtNum(c.likes), comments: fmtNum(c.comments), shares: fmtNum(c.shares),
      }))
    : [];
  const detailStaffPerformance = report?.staffDetail
    ? report.staffDetail.map((s) => ({
        name: s.name, views: fmtNum(s.views),
        likes: fmtNum(s.likes), comments: fmtNum(s.comments), shares: fmtNum(s.shares),
      }))
    : [];

  // Danh sách nội dung thô theo nền tảng (từ /content/list) — phân trang 10 dòng/trang.
  const metaRawContentList = list.filter((x) => x.platform === "facebook" || x.platform === "instagram");
  const tiktokRawContentList = list.filter((x) => x.platform === "tiktok");
  const youtubeRawContentList = list.filter((x) => x.platform === "youtube");

  // Xuất Excel: dùng dữ liệu SỐ THÔ (report.channelDetail/staffDetail, chưa qua fmtNum ở trên)
  // để Excel tự hiển thị/tính tổng được, không export bản đã format thành chuỗi.
  const exportContentOverview = () => {
    const contentCols = (items: typeof list) => items.map((x) => ({
      "Caption": x.caption, "Kênh": x.channel, "Ngày tạo": x.date,
      "Concept": x.concept, "Tuyến": x.line,
      "Lượt xem": x.views, "Tiếp cận": x.reach, "Thích": x.likes, "Bình luận": x.comments,
    }));
    const ok = exportWorkbook(`tong-quan-content-${new Date().toISOString().slice(0, 10)}.xlsx`, [
      {
        name: "Hiệu suất theo kênh",
        rows: (report?.channelDetail || []).map((c) => ({
          "Nền tảng": PLATFORM_LABEL[c.platform] || c.platform, "Kênh": c.name,
          "Lượt xem": c.views, "Follow": c.followers,
          "Thích": c.likes, "Bình luận": c.comments, "Chia sẻ": c.shares,
        })),
      },
      {
        name: "Hiệu suất theo nhân sự",
        rows: (report?.staffDetail || []).map((s) => ({
          "Nhân sự": s.name, "Team": s.team,
          "Lượt xem": s.views, "Thích": s.likes, "Bình luận": s.comments, "Chia sẻ": s.shares,
        })),
      },
      { name: "Content Meta", rows: contentCols(metaRawContentList) },
      { name: "Content TikTok", rows: contentCols(tiktokRawContentList) },
      { name: "Content YouTube", rows: contentCols(youtubeRawContentList) },
    ]);
    if (!ok) alert("Không có dữ liệu để xuất.");
  };

  const PAGE_SIZE = 10;
  const paged = (arr: ListItem[], p: number) => arr.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE);

  // Số tổng cho phần giữa các donut (thay số hardcode).
  const channelsTotal = report?.channelsByPlatform?.reduce((s, x) => s + x.count, 0) ?? 0;
  const lineTotal = report?.byLine?.reduce((s, x) => s + x.count, 0) ?? 0;
  const conceptTotal = report?.byConcept?.reduce((s, x) => s + x.count, 0) ?? 0;
  const winTotal = report?.winRate?.total ?? 0;
  const winPct = winTotal ? Number(((report!.winRate.win / winTotal) * 100).toFixed(1)) : 0;
  const notWinPct = winTotal ? Number(((report!.winRate.notWin / winTotal) * 100).toFixed(1)) : 0;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="border-b border-border pb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tổng quan content</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tổng hợp hiệu quả nội dung organic trên các kênh (views, tương tác, follow…)
          </p>
        </div>
        <button
          type="button"
          onClick={exportContentOverview}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-foreground text-sm font-medium rounded-lg transition-colors shrink-0"
        >
          <Download size={16} />
          Xuất Excel
        </button>
      </div>

      {/* Quick Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg p-3 text-xs flex items-center gap-2">
        <Info size={16} />
        <span>Màn hình hiển thị Báo cáo hiệu quả nội dung (Content Performance). Lựa chọn các bộ lọc phía trên để lọc chi tiết.</span>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center gap-3">
        {/* Thời gian */}
        <DateRangePicker
          presetId={dateRange}
          from={customFrom}
          to={customTo}
          onApply={({ presetId, from, to }) => {
            setDateRange(presetId);
            setCustomFrom(from);
            setCustomTo(to);
          }}
        />

        {/* Nền tảng */}
        <FilterSelect label="Nền tảng" value={platform} onChange={setPlatform}
          options={platformOptions} />
        {/* Kênh */}
        <FilterSelect label="Kênh" value={channel} onChange={setChannel}
          options={channelOptions.map((c) => ({ value: c, label: c }))} />
        {/* Team */}
        <FilterSelect label="Team" value={team} onChange={setTeam}
          options={teamOptions.map((t) => ({ value: t, label: t }))} />
        {/* Nhân viên */}
        <FilterSelect label="Nhân viên" value={staff} onChange={setStaff}
          options={staffOptions.map((s) => ({ value: s, label: s }))} />

        {/* Reset */}
        {(platform || channel || team || staff) && (
          <button
            type="button"
            onClick={() => { setPlatform(""); setChannel(""); setTeam(""); setStaff(""); }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Funnel size={12} /> Xóa lọc
          </button>
        )}
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
                <span className="text-[13px] text-muted-foreground">Tổng</span>
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
                <p className="text-[13px] text-muted-foreground font-medium">Tổng Lượt Xem</p>
                <p className="text-2xl font-black text-foreground mt-1">{kpi.views}</p>
              </div>
              
              <div className="bg-muted/30 border border-border rounded-lg p-3">
                <p className="text-[13px] text-muted-foreground font-medium">Tổng Tương Tác</p>
                <p className="text-lg font-bold text-foreground mt-1">{kpi.interactions}</p>
              </div>
              
              <div className="bg-muted/30 border border-border rounded-lg p-3">
                <p className="text-[13px] text-muted-foreground font-medium">Lượt Thích</p>
                <p className="text-lg font-bold text-foreground mt-1">{kpi.likes}</p>
              </div>
              
              <div className="bg-muted/30 border border-border rounded-lg p-3">
                <p className="text-[13px] text-muted-foreground font-medium">Bình Luận</p>
                <p className="text-lg font-bold text-foreground mt-1">{kpi.comments}</p>
              </div>
              
              <div className="bg-muted/30 border border-border rounded-lg p-3">
                <p className="text-[13px] text-muted-foreground font-medium">Tổng Followers</p>
                <p className="text-lg font-bold text-foreground mt-1">{kpi.followers}</p>
              </div>

            </div>
          </div>
        </div>

        {/* Post/Production Donuts */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Phân tích Win/Not Win</h3>
            <div className="flex justify-center">

              {/* Nội dung đăng tải */}
              <div className="flex flex-col items-center">
                <p className="text-[13px] text-muted-foreground font-semibold mb-2">Nội dung đăng tải</p>
                <div className="relative w-[180px] h-[160px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={postContentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={72}
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
                    <span className="text-base font-bold text-foreground">{fmtNum(winTotal)}</span>
                    <span className="text-[11px] text-muted-foreground">Tổng video</span>
                  </div>
                </div>
                <div className="flex justify-center gap-3 mt-2 text-[13px]">
                  <span className="text-green-500">Win: {winPct}%</span>
                  <span className="text-red-500">Not: {notWinPct}%</span>
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
                <span className="text-xl font-bold text-foreground">{fmtNum(channelsTotal)}</span>
                <span className="text-[13px] text-muted-foreground">Tổng số kênh</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[13px]">
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
                <YAxis stroke="#6b7280" fontSize={9} tickFormatter={(v) => fmtCompact(v)} />
                <Tooltip formatter={(val) => [fmtNum(Number(val)), "Lượt xem"]} />
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
                <span className="text-base font-bold text-foreground">{fmtNum(lineTotal)}</span>
                <span className="text-[12px] text-muted-foreground">Tổng</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[12px] mt-2">
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

      {/* Section: Phân tích theo Thị trường & Ngành hàng */}
      {marketDistributionData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Phân bổ theo Thị trường */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-md lg:col-span-3 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Phân bổ theo Thị trường</h3>
              <div className="relative w-full h-[150px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={marketDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {marketDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-foreground">{totalViewsLabel}</span>
                  <span className="text-[10px] text-muted-foreground">Tổng view</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs mt-3">
              {marketDistributionData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground truncate">{item.name}:</span>
                  <span className="text-foreground font-bold">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Phân bổ theo Ngành hàng */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-md lg:col-span-3 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Phân bổ theo Ngành hàng</h3>
              <div className="relative w-full h-[150px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={industryDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {industryDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-foreground">{totalViewsLabel}</span>
                  <span className="text-[10px] text-muted-foreground">Tổng view</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs mt-3">
              {industryDistributionData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground truncate">{item.name}:</span>
                  <span className="text-foreground font-bold">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chi tiết lượt xem theo Thị trường & Ngành hàng */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-md lg:col-span-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Tổng lượt xem theo Thị trường & Ngành hàng</h3>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marketIndustryBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={10} />
                  <YAxis stroke="#6b7280" fontSize={10} />
                  <Tooltip formatter={(val) => fmtNum(Number(val))} />
                  <Bar dataKey="views" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={35}>
                    {marketIndustryBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Section: Concept & SKU analysis — 3 cột từ khi bỏ bảng Top SKU trùng lặp */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
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
                <span className="text-base font-bold text-foreground">{fmtNum(conceptTotal)}</span>
                <span className="text-[12px] text-muted-foreground">Tổng</span>
              </div>
            </div>
          </div>
          <div className="flex justify-around gap-1.5 text-[13px] mt-2">
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
                <tr className="border-b border-border text-muted-foreground text-[13px]">
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

        {/* Top Sku */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-md">
          <h3 className="text-xs font-semibold text-foreground mb-3">Top sản phẩm sản xuất video nhiều nhất</h3>
          <div className="overflow-y-auto max-h-[190px] text-[13px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-1.5">SKU</th>
                  <th className="pb-1.5 text-right">Videos</th>
                  <th className="pb-1.5 text-right">Xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {realTopSkuData.map((row, idx) => (
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

      </div>

      {/* Section: Hiệu suất tuyến nội dung */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-md">
        <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
          <Tag size={14} className="text-blue-500" />
          Hiệu suất tuyến nội dung
        </h4>
        <div className="overflow-x-auto text-[13px]">
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
              {realLinePerf.map((row, idx) => (
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

      {/* Section: Top Performance list grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Kenh theo view */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-md">
          <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
            <Star size={14} className="text-blue-500" />
            Top Kênh theo view
          </h3>
          <div className="overflow-y-auto max-h-[220px] text-[13px]">
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
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold ${
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
          <div className="overflow-y-auto max-h-[220px] text-[13px]">
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
                    <td className="py-2 text-foreground truncate max-w-[160px]" title={row.caption ?? undefined}>{row.caption}</td>
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
          <div className="overflow-y-auto max-h-[220px] text-[13px]">
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
          <div className="overflow-x-auto text-[13px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2 font-medium">Kênh</th>
                  <th className="pb-2 text-right">Lượt xem</th>
                  <th className="pb-2 text-right">Follows</th>
                  <th className="pb-2 text-right">Likes</th>
                  <th className="pb-2 text-right">Bình luận</th>
                  <th className="pb-2 text-right">Chia sẻ</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hieu suat chi tiet team */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-md">
          <h3 className="text-xs font-bold text-foreground mb-4">Hiệu suất chi tiết theo nhân sự</h3>
          <div className="overflow-x-auto text-[13px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2 font-medium">Nhân sự</th>
                  <th className="pb-2 text-right">Lượt xem</th>
                  <th className="pb-2 text-right">Likes</th>
                  <th className="pb-2 text-right">Bình luận</th>
                  <th className="pb-2 text-right">Chia sẻ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {detailStaffPerformance.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="py-2.5 font-semibold text-foreground">{row.name}</td>
                    <td className="py-2.5 text-right text-blue-400">{row.views}</td>
                    <td className="py-2.5 text-right">{row.likes}</td>
                    <td className="py-2.5 text-right">{row.comments}</td>
                    <td className="py-2.5 text-right text-pink-400">{row.shares}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          <div className="overflow-x-auto text-[13px]">
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
                {paged(metaRawContentList, metaPage).map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 group">
                    <td className="py-2.5 max-w-[180px] truncate text-foreground group-hover:text-blue-400 transition-colors" title={row.caption ?? undefined}>{row.caption}</td>
                    <td className="py-2.5 truncate max-w-[140px]" title={row.channel ?? undefined}>{row.channel}</td>
                    <td className="py-2.5 text-muted-foreground">{row.date}</td>
                    <td className="py-2.5 font-bold text-foreground">{row.line}</td>
                    <td className="py-2.5 text-right text-blue-400 font-semibold">{row.views}</td>
                    <td className="py-2.5 text-right text-green-500">{row.reach ?? "—"}</td>
                    <td className="py-2.5 text-right">{row.likes}</td>
                    <td className="py-2.5 text-right">{row.comments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={metaPage} pageSize={PAGE_SIZE} total={metaRawContentList.length} onChange={setMetaPage} />
        </div>

        {/* Tiktok Content Table */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TiktokLogo size={18} className="text-pink-500" />
              TikTok Content
            </h3>
          </div>
          <div className="overflow-x-auto text-[13px]">
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
                {paged(tiktokRawContentList, tiktokPage).map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 group">
                    <td className="py-2.5 max-w-[180px] truncate text-foreground group-hover:text-pink-400 transition-colors" title={row.caption ?? undefined}>{row.caption}</td>
                    <td className="py-2.5 truncate max-w-[140px]" title={row.channel ?? undefined}>{row.channel}</td>
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
          <Pagination page={tiktokPage} pageSize={PAGE_SIZE} total={tiktokRawContentList.length} onChange={setTiktokPage} />
        </div>

        {/* Youtube Content Table */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <YoutubeLogo size={18} className="text-red-500" />
              YouTube Content
            </h3>
          </div>
          <div className="overflow-x-auto text-[13px]">
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
                {paged(youtubeRawContentList, youtubePage).map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 group">
                    <td className="py-2.5 max-w-[180px] truncate text-foreground group-hover:text-red-400 transition-colors" title={row.caption ?? undefined}>{row.caption}</td>
                    <td className="py-2.5 truncate max-w-[140px]" title={row.channel ?? undefined}>{row.channel}</td>
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
          <Pagination page={youtubePage} pageSize={PAGE_SIZE} total={youtubeRawContentList.length} onChange={setYoutubePage} />
        </div>

      </div>

    </div>
  );
}
