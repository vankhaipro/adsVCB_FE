"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SpinnerGap, Circle, Info,
  CurrencyDollar, TrendUp, Eye, Waveform,
  CursorClick, ShoppingCart, Lightning, ChartBar,
  type Icon,
} from "@phosphor-icons/react";
import { apiGet, apiPost, fmtVnd } from "@/lib/api";
import { useChartColors } from "@/lib/chartTheme";
import OrdersBreakdown from "@/components/OrdersBreakdown";
import OverviewHeader, { type KpiItem } from "@/components/overview/OverviewHeader";
import OverviewBody from "@/components/overview/OverviewBody";
import { KPIS, type Kpi } from "@/components/overview/dashboardData";

// Bản Tổng quan cũ (dữ liệu thật) được giữ lại — đặt true để bật lại.
const LEGACY_OVERVIEW: boolean = false;
import {
  ResponsiveContainer, PieChart, Pie, Cell, Label,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  Tooltip as RechartsTooltip
} from "recharts";

type Campaign = {
  id: string;
  platform: string;
  externalId: string;
  name: string;
  status: string | null;
  objective: string | null;
  budget: number;
  budgetMode: string | null;
  adAccount: { id: string; name: string | null; platform: string; externalId: string } | null;
};

type Account = {
  id: string;
  platform: string;
  externalId: string;
  name: string | null;
  status: string | null;
  amountSpent: number;
};

// ===== Dữ liệu doanh thu thật từ Sapo =====
type SapoData = {
  totalRevenue: number;
  totalReceived: number;
  totalDiscounts: number;
  orderCount: number;
  bySource: { source: string; revenue: number; orders: number }[];
  byFinancialStatus: { status: string; revenue: number; orders: number }[];
};
type SapoSku = { sku: string; revenue: number; quantity: number; lines: number };

// ===== Insight quảng cáo thật từ Meta/TikTok (qua Pipeboard) =====
type InsightData = {
  totalSpend: number;
  impressions: number;
  clicks: number;
  reach: number;
  messages: number;
  likes: number;
  comments: number;
  conversions: number;
  cpc: number;
  ctr: number;
  cpm: number;
  frequency: number;
  costPerMessage: number;
  costPerComment: number;
  byPlatform: { platform: string; spend: number }[];
  hasData: boolean;
};

type InsightAgg = {
  spend: number; impressions: number; clicks: number; reach: number;
  messages: number; likes: number; comments: number; conversions: number; campaigns: number;
};
type BreakdownData = {
  byPlatform: (InsightAgg & { platform: string })[];
  byChannel: (InsightAgg & { name: string; platform: string })[];
  byContentLine: (InsightAgg & { line: string })[];
  byObjective: (InsightAgg & { objective: string })[];
  hasData: boolean;
};

// Hash function to make generated data deterministic per campaign
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Map khoảng thời gian của bộ lọc -> query ?from=&to= cho API Sapo
function rangeToQuery(range: string): string {
  const now = new Date();
  const end = new Date(now);
  let start = new Date(now);
  start.setHours(0, 0, 0, 0);
  switch (range) {
    case "today":
      break;
    case "yesterday":
      start.setDate(start.getDate() - 1);
      end.setTime(start.getTime());
      end.setHours(23, 59, 59, 999);
      break;
    case "last7days":
      start.setDate(start.getDate() - 6);
      break;
    case "last30days":
      start.setDate(start.getDate() - 29);
      break;
    case "thisMonth":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "lastMonth": {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const e = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return `from=${start.toISOString()}&to=${e.toISOString()}`;
    }
    default:
      start.setDate(start.getDate() - 29);
  }
  return `from=${start.toISOString()}&to=${end.toISOString()}`;
}

// Extracted properties from campaign name
function parseCampaignName(name: string, id: string) {
  const upper = name.toUpperCase();
  const hash = hashString(id);

  // 1. SKU Extraction
  // Look for product SKUs (e.g. B400815, NM101, L0006, L000963, N101220, N0006, N001347, N200099)
  const skuRegex = /\b([A-Z]{1,3}\d{3,7})\b/i;
  const skuMatch = name.match(skuRegex);
  let sku = skuMatch ? skuMatch[1].toUpperCase() : "";

  if (!sku) {
    const kRegex = /\b(K\d+)\b/i;
    const kMatch = name.match(kRegex);
    if (kMatch) {
      const kCode = kMatch[1].toUpperCase();
      // Map K0, K1, K2 to realistic SKU codes
      if (kCode === "K2") sku = "B400815";
      else if (kCode === "K1") sku = "NM101";
      else if (kCode === "K0") sku = "L000963";
      else sku = kCode;
    }
  }

  // Predefined SKUs mapping from screenshot if not matched
  const predefinedSkus = ["B400815", "NM101", "L0006", "L000963", "N101220", "N0006", "N001347", "N200099"];
  if (!sku || sku === "Khác") {
    sku = predefinedSkus[hash % predefinedSkus.length];
  }

  // 2. Staff Extraction
  let staff = "Khác";
  const cleanName = name.trim();
  if (/^(Việt|Viet)\b/i.test(cleanName)) staff = "Việt";
  else if (/^(Thành|Thanh)\b/i.test(cleanName)) staff = "Thành";
  else if (/^(Ngọc|Ngoc)\b/i.test(cleanName)) staff = "Ngọc";
  else if (/^(Cương|Cuong)\b/i.test(cleanName)) staff = "Cương";

  // 3. Channel Extraction
  let channel = "Facebook Feed";
  if (upper.includes("MESS") || upper.includes("TIN NHAN")) {
    channel = "Messenger";
  } else if (upper.includes("LIKE PAGE") || upper.includes("THICH TRANG")) {
    channel = "Facebook Page Likes";
  } else if (upper.includes("IG") || upper.includes("INSTAGRAM")) {
    channel = "Instagram";
  }

  return { sku, staff, channel };
}

function OverviewInner() {
  const chart = useChartColors();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncingData, setSyncingData] = useState(false);

  // Dữ liệu doanh thu thật từ Sapo (theo khoảng thời gian đang chọn)
  const [sapo, setSapo] = useState<SapoData | null>(null);
  const [sapoSkus, setSapoSkus] = useState<SapoSku[]>([]);
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [breakdown, setBreakdown] = useState<BreakdownData | null>(null);
  const [campaignsInsights, setCampaignsInsights] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  // Tab từ query param ?tab=overview|channel|mode
  const TAB_VALUES = ["overview", "channel", "mode", "orders"] as const;
  type TabValue = typeof TAB_VALUES[number];
  const rawTab = searchParams.get("tab");
  const selectedTab: TabValue = TAB_VALUES.includes(rawTab as TabValue) ? (rawTab as TabValue) : "overview";

  function setSelectedTab(tab: TabValue) {
    router.push(`?tab=${tab}`, { scroll: false });
  }

  // Filters State
  const [dateRange, setDateRange] = useState("last30days");
  const [platform, setPlatform] = useState("ALL");
  const [objective, setObjective] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [accountId, setAccountId] = useState("ALL");
  const [channel, setChannel] = useState("ALL");
  const [staff, setStaff] = useState("ALL");

  // Load Initial Data
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [camps, accs] = await Promise.all([
        apiGet("/mkt-api/campaigns"),
        apiGet("/mkt-api/accounts")
      ]);
      setCampaigns(camps);
      setAccounts(accs);
    } catch {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Doanh thu Sapo chỉ map được theo thời gian (utm_id của đơn ở cấp ad,
  // không gắn được vào campaign/nền tảng/tài khoản) → chỉ phụ thuộc dateRange.
  const loadSapo = useCallback(async () => {
    const q = rangeToQuery(dateRange);
    try {
      const [rev, skus] = await Promise.all([
        apiGet(`/sapo/revenue?${q}`),
        apiGet(`/sapo/revenue/by-sku?${q}&limit=50`),
      ]);
      setSapo(rev);
      setSapoSkus(skus);
    } catch {
      setSapo(null);
      setSapoSkus([]);
    }
  }, [dateRange]);

  // Chỉ số quảng cáo (Meta/TikTok) tôn trọng toàn bộ bộ lọc của Tổng quan.
  const loadInsights = useCallback(async () => {
    const params = new URLSearchParams(rangeToQuery(dateRange));
    if (platform !== "ALL") params.set("platform", platform);
    if (objective !== "ALL") params.set("objective", objective);
    if (accountId !== "ALL") params.set("accountId", accountId);
    if (channel !== "ALL") params.set("channel", channel);
    if (staff !== "ALL") params.set("staff", staff);
    const q = params.toString();
    try {
      const [ins, brk, trend, camps] = await Promise.all([
        apiGet(`/mkt-api/insights?${q}`),
        apiGet(`/mkt-api/insights/breakdown?${q}`),
        apiGet(`/mkt-api/insights/trend?${q}`),
        apiGet(`/mkt-api/campaigns/insights?${q}`)
      ]);
      setInsights(ins);
      setBreakdown(brk);
      setTrendData(trend);
      setCampaignsInsights(camps);
    } catch {
      setInsights(null);
      setBreakdown(null);
      setTrendData([]);
      setCampaignsInsights([]);
    }
  }, [dateRange, platform, objective, accountId, channel, staff]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSapo();
  }, [loadSapo]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInsights();
  }, [loadInsights]);

  // "Làm mới": chỉ tải lại dữ liệu từ DB (không gọi sync).
  const refresh = async () => {
    setSyncing(true);
    try {
      await Promise.all([load(), loadSapo(), loadInsights()]);
    } finally {
      setSyncing(false);
    }
  };

  // "Đồng bộ dữ liệu": kéo dữ liệu mới từ các nguồn (Pipeboard + Sapo).
  // Chạy tuần tự /ads/sync trước (bước insight/sapo map theo campaign),
  // mỗi bước chịu lỗi riêng để 1 lỗi không chặn các bước còn lại.
  const syncData = async () => {
    setSyncingData(true);
    const summarize = (r: any) => {
      if (r == null || typeof r !== "object") return "xong";
      if (typeof r.rows === "number") return `${r.rows} dòng`;
      if (typeof r.saved === "number") return `${r.saved} đơn`;
      if (typeof r.campaigns === "number") return `${r.campaigns} chiến dịch`;
      return "xong";
    };
    const steps: { name: string; ok: boolean; detail: string }[] = [];
    const run = async (name: string, fn: () => Promise<unknown>) => {
      try {
        const r = await fn();
        steps.push({ name, ok: true, detail: summarize(r) });
      } catch (e) {
        steps.push({ name, ok: false, detail: e instanceof Error ? e.message : "lỗi" });
      }
    };
    await run("Chiến dịch & quảng cáo", () => apiGet("/mkt-api/sync"));
    await run("Chỉ số quảng cáo", () => apiGet("/mkt-api/sync-insights?days=30"));
    await run("Đơn hàng Sapo", () => apiPost("/sapo/sync?days=30"));
    try {
      await Promise.all([load(), loadSapo(), loadInsights()]);
    } finally {
      setSyncingData(false);
    }
    alert(
      "Kết quả đồng bộ:\n" +
        steps.map((s) => `${s.ok ? "✅" : "❌"} ${s.name}: ${s.detail}`).join("\n")
    );
  };

  // Format Helper for numbers
  const fmtNum = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n || 0));
  const fmtCompact = (n: number) => {
    const abs = Math.abs(n || 0);
    if (abs >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return fmtNum(n);
  };

  const overviewKpis = useMemo((): KpiItem[] => {
    const ICONS: Record<string, Icon> = {
      spend: CurrencyDollar,
      revenue: TrendUp,
      reach: Eye,
      impressions: Waveform,
      clicks: CursorClick,
      orders: ShoppingCart,
      ctr: Lightning,
      roas: ChartBar,
    };

    const hasData = !!insights?.hasData;
    const spend = insights?.totalSpend ?? 0;
    const revenue = sapo?.totalRevenue ?? 0;
    const impressions = insights?.impressions ?? 0;
    const reach = insights?.reach ?? 0;
    const clicks = insights?.clicks ?? 0;
    const orders = sapo?.orderCount ?? 0;
    const ctr = insights?.ctr ?? 0;
    const roas = spend > 0 ? revenue / spend : 0;

    const data = [
      { key: "spend", label: "Chi phí quảng cáo", value: `${fmtNum(spend)}đ`, sub: `Tổng ngân sách chi tiêu`, change: undefined, color: "text-blue-400", bg: "bg-blue-500/10" },
      { key: "revenue", label: "Doanh thu (Sapo)", value: `${fmtNum(revenue)}đ`, sub: `Từ các đơn hàng thực tế`, change: undefined, color: "text-green-400", bg: "bg-green-500/10" },
      { key: "impressions", label: "Lượt hiển thị", value: fmtNum(impressions), sub: `Tổng số lần quảng cáo hiện`, change: undefined, color: "text-purple-400", bg: "bg-purple-500/10" },
      { key: "reach", label: "Số người tiếp cận", value: fmtNum(reach), sub: `Số người xem quảng cáo`, change: undefined, color: "text-indigo-400", bg: "bg-indigo-500/10" },
      { key: "clicks", label: "Lượt nhấp liên kết", value: fmtNum(clicks), sub: `Tổng click vào QC`, change: undefined, color: "text-orange-400", bg: "bg-orange-500/10" },
      { key: "orders", label: "Số đơn hàng", value: fmtNum(orders), sub: `Tổng số đơn từ Sapo`, change: undefined, color: "text-emerald-400", bg: "bg-emerald-500/10" },
      { key: "ctr", label: "Tỷ lệ nhấp (CTR)", value: `${ctr.toFixed(2)}%`, sub: `Tỷ lệ CTR trung bình`, change: undefined, color: "text-yellow-400", bg: "bg-yellow-500/10" },
      { key: "roas", label: "Chỉ số ROAS", value: `${roas.toFixed(2)}x`, sub: `Doanh thu / Chi phí`, change: undefined, color: "text-pink-400", bg: "bg-pink-500/10" }
    ];

    return data.map((k) => ({
      label: k.label,
      value: hasData || revenue > 0 ? k.value : "—",
      sub: k.sub,
      change: k.change,
      icon: ICONS[k.key],
      iconColor: k.color,
      iconBg: k.bg,
    }));
  }, [insights, sapo]);

  return (
    <div className="flex flex-col gap-5 w-full max-w-full overflow-x-hidden pb-10 font-sans -m-4 sm:-m-5 p-4 sm:p-5 bg-background min-h-full">
      {/* Navigation Tabs — URL query param: ?tab=overview|channel|mode */}
      <div className="flex border-b border-border gap-1 bg-background rounded-t-xl px-2 pt-1">
        {([
          { value: "overview", label: "Tổng quan" },
          { value: "channel", label: "Hiệu quả theo Kênh" },
          { value: "mode",    label: "Hiệu quả theo Mode" },
          { value: "orders",  label: "Đơn hàng bán" },
        ] as { value: TabValue; label: string }[]).map((t) => (
          <button
            key={t.value}
            onClick={() => setSelectedTab(t.value)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${
              selectedTab === t.value
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <OverviewHeader
        search={search}
        onSearchChange={setSearch}
        platform={platform}
        status={statusFilter}
        objective={objective}
        dateRange={dateRange}
        staff={staff}
        accountId={accountId}
        accounts={accounts}
        onPlatformChange={(v) => {
          setPlatform(v);
          setAccountId("ALL");
        }}
        onStatusChange={setStatusFilter}
        onObjectiveChange={setObjective}
        onDateRangeChange={setDateRange}
        onStaffChange={setStaff}
        onAccountIdChange={setAccountId}
        kpis={overviewKpis}
        showKpis={selectedTab === "overview"}
        onRefresh={refresh}
        onSync={syncData}
        onExport={() => alert("Bắt đầu xuất dữ liệu báo cáo...")}
        refreshing={syncing || loading}
        syncing={syncingData}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-3 bg-background rounded-xl border border-border">
          <SpinnerGap size={36} className="animate-spin text-blue-600" />
          <span className="text-sm text-muted-foreground">Đang tải và đồng bộ hóa báo cáo...</span>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW — dựng lại theo Figma */}
          {selectedTab === "overview" && (
            <OverviewBody 
              campaigns={campaignsInsights}
              sapoSkus={sapoSkus}
              trend={trendData}
              breakdown={breakdown}
            />
          )}
          {LEGACY_OVERVIEW && (() => {
            const adReal = !!insights?.hasData;
            const platSpend = insights?.byPlatform ?? [];
            const adTotalSpend = insights?.totalSpend ?? 0;
            const bdReal = !!breakdown?.hasData;
            const msgByPlatform = (breakdown?.byPlatform ?? []).map((p) => ({
              name: p.platform === "TIKTOK" ? "tiktok" : "facebook",
              "Tin nhắn": p.messages,
              "Chi phí/tin nhắn": p.messages > 0 ? Math.round(p.spend / p.messages) : 0,
            }));
            const likeByPlatform = (breakdown?.byPlatform ?? []).map((p) => ({
              name: p.platform === "TIKTOK" ? "tiktok" : "facebook",
              "Like page": p.likes,
              "Chi phí/like": p.likes > 0 ? Math.round(p.spend / p.likes) : 0,
            }));
            const contentLineData = (breakdown?.byContentLine ?? []).map((c) => ({
              name: c.line,
              "Ngân sách": Math.round(c.spend / 1e6),
              "Số quảng cáo": c.campaigns,
            }));
            const channelRows = breakdown?.byChannel ?? [];
            return (
              <div className="flex flex-col gap-6">
                {/* ── ROW 2: Donut + 2 bar charts + SKU table ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                  {/* LEFT COL: 3 stacked panels */}
                  <div className="lg:col-span-4 flex flex-col gap-5">

                    {/* Platform Donut */}
                    <div className="bg-background border border-border rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Phân bổ ngân sách nền tảng</h3>
                      {!adReal ? (
                        <div className="h-[130px] flex flex-col items-center justify-center text-center gap-1 text-muted-foreground">
                          <Info size={20} />
                          <span className="text-[16px]">Cần đồng bộ chi phí QC<br />(insight Meta/TikTok)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <div className="w-[130px] h-[130px] shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={platSpend} cx="50%" cy="50%" innerRadius={40} outerRadius={58}
                                  paddingAngle={3} dataKey="spend" stroke="none">
                                  {platSpend.map((p, i) => <Cell key={i} fill={p.platform === "TIKTOK" ? "#f472b6" : "#3b82f6"} />)}
                                  <Label value={fmtVnd(adTotalSpend)} position="centerTop" dy={5} fill={chart.labelFill} fontSize={9} fontWeight="bold" />
                                  <Label value="Tổng" position="centerBottom" dy={-5} fill="#94a3b8" fontSize={9} />
                                </Pie>
                                <RechartsTooltip contentStyle={chart.tooltip} formatter={(v) => fmtVnd(Number(v))} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex flex-col gap-2 text-[16px]">
                            {platSpend.map((p, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.platform === "TIKTOK" ? "#f472b6" : "#3b82f6" }} />
                                <span className="text-muted-foreground">{p.platform === "TIKTOK" ? "TikTok Ads" : "Meta Ads"}</span>
                                <span className="font-semibold text-foreground ml-1">
                                  {adTotalSpend > 0 ? ((p.spend / adTotalSpend) * 100).toFixed(1) : 0}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Message Bar by Platform */}
                    <div className="bg-background border border-border rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Hiệu quả tin nhắn</h3>
                      <div className="h-44">
                        {!bdReal ? (
                          <div className="h-full flex flex-col items-center justify-center text-center gap-1 text-muted-foreground">
                            <Info size={20} />
                            <span className="text-[16px]">Cần đồng bộ insight Meta/TikTok</span>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={msgByPlatform} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                              <XAxis dataKey="name" stroke={chart.axis} fontSize={10} tickLine={false} />
                              <YAxis yAxisId="left" stroke={chart.axis} fontSize={9} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                              <YAxis yAxisId="right" orientation="right" stroke={chart.axis} fontSize={9} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                              <RechartsTooltip contentStyle={chart.tooltip} />
                              <Legend wrapperStyle={{ fontSize: '10px' }} />
                              <Bar yAxisId="left" dataKey="Tin nhắn" fill="#10b981" radius={[3, 3, 0, 0]} />
                              <Bar yAxisId="right" dataKey="Chi phí/tin nhắn" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>

                    {/* Like Bar by Platform */}
                    <div className="bg-background border border-border rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Hiệu quả like page</h3>
                      <div className="h-44">
                        {!bdReal ? (
                          <div className="h-full flex flex-col items-center justify-center text-center gap-1 text-muted-foreground">
                            <Info size={20} />
                            <span className="text-[16px]">Cần đồng bộ insight Meta/TikTok</span>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={likeByPlatform} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                              <XAxis dataKey="name" stroke={chart.axis} fontSize={10} tickLine={false} />
                              <YAxis yAxisId="left" stroke={chart.axis} fontSize={9} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                              <YAxis yAxisId="right" orientation="right" stroke={chart.axis} fontSize={9} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                              <RechartsTooltip contentStyle={chart.tooltip} />
                              <Legend wrapperStyle={{ fontSize: '10px' }} />
                              <Bar yAxisId="left" dataKey="Like page" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                              <Bar yAxisId="right" dataKey="Chi phí/like" fill="#06b6d4" radius={[3, 3, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COL: SKU Table */}
                  <div className="lg:col-span-8 flex flex-col gap-5">

                    {/* SKU Detail Table */}
                    <div className="bg-background border border-border rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                        <h3 className="text-sm font-semibold text-foreground">Doanh thu theo SKU (Sapo)</h3>
                        <span className="text-xs text-muted-foreground">Theo doanh thu thật</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left whitespace-nowrap">
                          <thead className="border-b border-border">
                            <tr>
                              <th className="px-4 py-3 font-medium text-blue-400">SKU</th>
                              <th className="px-4 py-3 font-medium text-blue-400 text-right">Số lượng bán</th>
                              <th className="px-4 py-3 font-medium text-blue-400 text-right">Số dòng đơn</th>
                              <th className="px-4 py-3 font-medium text-blue-400 text-right">Doanh thu</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border text-foreground">
                            {sapoSkus.length === 0 ? (
                              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Chưa có dữ liệu SKU. Hãy đồng bộ Sapo.</td></tr>
                            ) : (
                              sapoSkus.map((s, idx) => (
                                <tr key={s.sku || idx} className="hover:bg-card/40">
                                  <td className="px-4 py-2.5 font-semibold text-foreground">{s.sku}</td>
                                  <td className="px-4 py-2.5 text-right">{fmtNum(s.quantity)}</td>
                                  <td className="px-4 py-2.5 text-right text-muted-foreground">{fmtNum(s.lines)}</td>
                                  <td className="px-4 py-2.5 text-right font-medium text-green-400">{fmtVnd(s.revenue)}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                          {sapoSkus.length > 0 && (
                            <tfoot className="border-t border-border">
                              <tr>
                                <td colSpan={4} className="px-4 py-2 text-right text-[16px] text-muted-foreground">Top {sapoSkus.length} SKU theo doanh thu</td>
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>
                    </div>

                    {/* Content Line Bar - full width */}
                    <div className="bg-background border border-border rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Hiệu quả theo tuyến nội dung</h3>
                      <div className="h-[140px]">
                        {!bdReal ? (
                          <div className="h-full flex flex-col items-center justify-center text-center gap-1 text-muted-foreground">
                            <Info size={20} />
                            <span className="text-[16px]">Cần đồng bộ chi phí QC theo tuyến nội dung</span>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={contentLineData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                              <XAxis dataKey="name" stroke={chart.axis} fontSize={10} tickLine={false} />
                              <YAxis yAxisId="left" stroke={chart.axis} fontSize={9} tickLine={false} tickFormatter={(v) => `${v}M`} />
                              <YAxis yAxisId="right" orientation="right" stroke={chart.axis} fontSize={9} tickLine={false} />
                              <RechartsTooltip contentStyle={chart.tooltip} />
                              <Legend wrapperStyle={{ fontSize: '10px' }} />
                              <Bar yAxisId="left" dataKey="Ngân sách" fill="#10b981" radius={[3, 3, 0, 0]} />
                              <Bar yAxisId="right" dataKey="Số quảng cáo" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>

                    {/* Channel Detail Table */}
                    <div className="bg-background border border-border rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                        <h3 className="text-sm font-semibold text-foreground">Hiệu suất chi tiết theo Kênh</h3>
                        <span className="text-xs text-muted-foreground">Sắp xếp theo chi tiêu</span>
                      </div>
                      {!bdReal ? (
                        <div className="px-5 py-10 flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
                          <Info size={22} />
                          <span className="text-[16px] max-w-[260px]">Chi tiêu/like/tin nhắn theo kênh cần đồng bộ insight Meta/TikTok.</span>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left whitespace-nowrap">
                            <thead className="border-b border-border">
                              <tr>
                                <th className="px-4 py-3 font-medium text-blue-400">Kênh</th>
                                <th className="px-4 py-3 font-medium text-blue-400 text-center">Nền tảng</th>
                                <th className="px-4 py-3 font-medium text-blue-400 text-right">Quảng cáo</th>
                                <th className="px-4 py-3 font-medium text-blue-400 text-right">Chi tiêu</th>
                                <th className="px-4 py-3 font-medium text-blue-400 text-right">Like</th>
                                <th className="px-4 py-3 font-medium text-blue-400 text-right">Tin nhắn</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border text-foreground">
                              {channelRows.slice(0, 14).map((ch, i) => (
                                <tr key={i} className="hover:bg-card/40">
                                  <td className="px-4 py-2.5 text-blue-400 font-medium max-w-[200px] truncate" title={ch.name}>{ch.name}</td>
                                  <td className="px-4 py-2.5 text-center">
                                    <span className={`text-[15px] px-2 py-0.5 rounded font-medium ${ch.platform === "TIKTOK" ? "bg-pink-500/20 text-pink-400" : "bg-blue-500/20 text-blue-400"}`}>
                                      {ch.platform === "TIKTOK" ? "tiktok" : "facebook"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2.5 text-right">{ch.campaigns}</td>
                                  <td className="px-4 py-2.5 text-right">{fmtVnd(ch.spend)}</td>
                                  <td className="px-4 py-2.5 text-right">{fmtNum(ch.likes)}</td>
                                  <td className="px-4 py-2.5 text-right">{fmtNum(ch.messages)}</td>
                                </tr>
                              ))}
                            </tbody>
                            {channelRows.length > 14 && (
                              <tfoot className="border-t border-border">
                                <tr>
                                  <td colSpan={6} className="px-4 py-2 text-right text-[16px] text-muted-foreground">{channelRows.length} kênh</td>
                                </tr>
                              </tfoot>
                            )}
                          </table>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>
          );})()}

          {/* TAB 2: EFFICIENCY BY CHANNEL (SmartBI-style) */}
          {selectedTab === "channel" && (() => {
            // Dữ liệu THẬT từ insight Meta/TikTok (qua /ads/insights + /ads/insights/breakdown)
            const adReal = !!insights?.hasData;
            const bd = breakdown;
            const channelRows = (bd?.byChannel ?? []).map((c) => ({
              name: c.name, spend: c.spend, messages: c.messages, likes: c.likes,
              clicks: c.clicks, impressions: c.impressions, reach: c.reach, comments: c.comments ?? 0,
            }));

            const totalSpend = insights?.totalSpend ?? 0;
            const totalLikes = insights?.likes ?? 0;
            const totalMessages = insights?.messages ?? 0;
            const totalComments = insights?.comments ?? 0;
            const totalReach = insights?.reach ?? 0;
            const cpc = insights?.cpc ?? 0;
            const cpm = insights?.cpm ?? 0;
            const ctr = insights?.ctr ?? 0;
            const freq = insights?.frequency ?? 0;
            const costPerLike = totalLikes > 0 ? totalSpend / totalLikes : 0;
            const costPerMess = insights?.costPerMessage ?? 0;
            const costPerComment = insights?.costPerComment ?? 0;

            // Sorted tables
            const likeRanking = [...channelRows].sort((a, b) => b.likes - a.likes);
            const messRanking = [...channelRows].sort((a, b) => b.messages - a.messages);

            // Donut data: top channels + "Khác"
            const TOP_N = 12;
            const topChannels = channelRows.slice(0, TOP_N);
            const restSpend = channelRows.slice(TOP_N).reduce((s, c) => s + c.spend, 0);
            const DONUT_COLORS = [
              "#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4",
              "#f97316","#84cc16","#ec4899","#14b8a6","#a855f7","#fb923c","#94a3b8"
            ];
            const donutData = [
              ...topChannels.map((c, i) => ({ name: c.name, value: c.spend, color: DONUT_COLORS[i] })),
              ...(restSpend > 0 ? [{ name: "Khác", value: restSpend, color: "#94a3b8" }] : [])
            ];

            // Horizontal bar: ngân sách theo mục tiêu (objective thật)
            const objBarData = (bd?.byObjective ?? []).map((o, i) => ({
              name: o.objective, value: o.spend, color: DONUT_COLORS[i] || "#94a3b8",
            }));

            // Top 30 kênh theo chi tiêu
            const scatterData = channelRows.slice(0, 30).map((ch) => ({
              name: ch.name.length > 20 ? ch.name.slice(0, 20) + "…" : ch.name,
              messages: ch.messages,
              likes: ch.likes,
              spend: ch.spend,
              comments: ch.comments,
            }));

            return (
              <div className="flex flex-col gap-6">

                {/* ── 12 KPI CARDS ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[
                    { label: "Chi phí quảng cáo", value: adReal ? fmtVnd(totalSpend) : "—", color: "text-blue-400", trend: null },
                    { label: "Like Page | Follows", value: adReal ? fmtNum(totalLikes) : "—", color: "text-foreground", trend: null },
                    { label: "Tin nhắn", value: adReal ? fmtNum(totalMessages) : "—", color: "text-foreground", trend: null },
                    { label: "Bình luận", value: adReal ? fmtNum(totalComments) : "—", color: adReal ? "text-foreground" : "text-muted-foreground", trend: null },
                    { label: "Lượt tiếp cận", value: adReal ? fmtNum(totalReach) : "—", color: "text-foreground", trend: null },
                    { label: "CPM", value: adReal ? fmtVnd(cpm) : "—", color: "text-foreground", trend: null },
                    { label: "CPC", value: adReal ? fmtVnd(cpc) : "—", color: "text-foreground", trend: null },
                    { label: "Chi phí/Like page", value: costPerLike > 0 ? fmtVnd(costPerLike) : "—", color: "text-foreground", trend: null },
                    { label: "Chi phí/tin nhắn", value: costPerMess > 0 ? fmtVnd(costPerMess) : "—", color: "text-foreground", trend: null },
                    { label: "Chi phí/bình luận", value: costPerComment > 0 ? fmtVnd(costPerComment) : "—", color: costPerComment > 0 ? "text-foreground" : "text-muted-foreground", trend: null },
                    { label: "CTR", value: adReal ? `${ctr.toFixed(2)}%` : "—", color: "text-foreground", trend: null },
                    { label: "Frequency", value: adReal ? freq.toFixed(2) : "—", color: "text-foreground", trend: null },
                  ].map((k, i) => (
                    <div key={i} className="bg-background border border-border rounded-xl p-4 flex flex-col justify-between min-h-[90px]">
                      <span className="text-[16px] font-medium text-muted-foreground block mb-1">{k.label}</span>
                      <div className={`text-lg font-bold leading-tight ${k.color}`}>{k.value}</div>
                    </div>
                  ))}
                </div>

                {/* ── 3 CHARTS ROW ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                  {/* Donut: Budget by Channel */}
                  <div className="lg:col-span-4 bg-background border border-border rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Phân bổ ngân sách theo kênh</h3>
                    <div className="flex flex-col gap-5 items-center">
                      {/* Donut */}
                      <div className="w-[200px] h-[200px] shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={donutData} cx="50%" cy="50%" innerRadius={65} outerRadius={95}
                              paddingAngle={1} dataKey="value" stroke="none">
                              {donutData.map((_, i) => <Cell key={i} fill={donutData[i].color} />)}
                              <Label value={fmtVnd(totalSpend)} position="center" fill={chart.labelFill} fontSize={11} fontWeight="bold" />
                            </Pie>
                            <RechartsTooltip contentStyle={chart.tooltip} formatter={(v) => fmtVnd(Number(v))} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      {/* Legend */}
                      <div className="flex flex-col gap-2 text-[16px] overflow-y-auto max-h-[140px] w-full px-2 custom-scrollbar">
                        {donutData.map((d, i) => (
                          <div key={i} className="flex items-center justify-between gap-2 min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }}/>
                              <span className="text-muted-foreground truncate" title={d.name}>{d.name}</span>
                            </div>
                            <span className="text-foreground shrink-0 font-medium ml-1">
                              {totalSpend > 0 ? ((d.value / totalSpend) * 100).toFixed(1) : 0}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Bar: Budget by Objective */}
                  <div className="lg:col-span-4 bg-background border border-border rounded-xl p-5 flex flex-col">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Phân bổ ngân sách theo mục tiêu</h3>
                    <div className="flex-1 flex flex-col justify-center gap-3">
                      {objBarData.map((obj, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <div className="flex justify-between text-[15px]">
                            <span className="text-muted-foreground font-medium">{obj.name}</span>
                            <span className="text-foreground">{fmtVnd(obj.value)}</span>
                          </div>
                          <div className="h-5 bg-card rounded overflow-hidden">
                            <div
                              className="h-full rounded transition-all"
                              style={{
                                width: `${totalSpend > 0 ? Math.min(100, (obj.value / totalSpend) * 100) : 0}%`,
                                background: obj.color
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scatter/Dot: Top 30 channels by objective */}
                  <div className="lg:col-span-4 bg-background border border-border rounded-xl p-5 flex flex-col">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Ngân sách top {Math.min(30, scatterData.length)} kênh</h3>
                    <div className="text-[15px] flex gap-3 mb-2">
                      <span className="flex items-center gap-1"><Circle size={8} weight="fill" className="text-blue-400"/>Tin nhắn</span>
                      <span className="flex items-center gap-1"><Circle size={8} weight="fill" className="text-amber-400"/>Thích trang</span>
                      <span className="flex items-center gap-1"><Circle size={8} weight="fill" className="text-green-400"/>Bình luận</span>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                      <div className="flex flex-col gap-2 min-w-0">
                        {scatterData.slice(0, 12).map((d, i) => {
                          return (
                            <div key={i} className="flex items-center gap-2 text-[15px]">
                              <span className="text-muted-foreground w-4 text-right shrink-0">{i + 1}</span>
                              <span className="text-foreground w-28 truncate shrink-0" title={d.name}>{d.name}</span>
                              <div className="flex-1 flex items-center gap-1 min-w-0">
                                <div className="h-1.5 rounded bg-blue-500 shrink-0" style={{ width: `${Math.max(2, (d.messages / (scatterData[0]?.messages || 1)) * 60)}%` }} />
                                <div className="h-1.5 rounded bg-amber-400 shrink-0" style={{ width: `${Math.max(2, (d.likes / (scatterData[0]?.likes || 1)) * 40)}%` }} />
                                <div className="h-1.5 rounded bg-green-400 shrink-0" style={{ width: `${Math.max(2, (d.comments / (scatterData[0]?.comments || 1)) * 30)}%` }} />
                              </div>
                              <span className="text-muted-foreground shrink-0">{fmtVnd(d.spend).replace("đ", "")}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── 2 RANKING TABLES SIDE BY SIDE ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                  {/* Table 1: Like Page Channel Ranking */}
                  <div className="bg-background border border-border rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                      <span className="text-lg">👍</span>
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Hiệu quả kênh chạy Like Page</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="text-muted-foreground border-b border-border">
                          <tr>
                            <th className="px-4 py-2 font-medium w-8">#</th>
                            <th className="px-4 py-2 font-medium text-blue-400">Kênh</th>
                            <th className="px-4 py-2 font-medium text-right text-blue-400">Like page</th>
                            <th className="px-4 py-2 font-medium text-right text-blue-400">Chi phí/like page</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {likeRanking.filter(r => r.likes > 0).slice(0, 20).map((r, i) => {
                            const cpl = r.likes > 0 ? Math.round(r.spend / r.likes) : 0;
                            return (
                              <tr key={i} className="hover:bg-card/40">
                                <td className="px-4 py-2.5 text-muted-foreground">{i + 1}</td>
                                <td className="px-4 py-2.5 text-blue-400 font-medium max-w-[180px] truncate" title={r.name}>{r.name}</td>
                                <td className="px-4 py-2.5 text-right text-foreground">{fmtNum(r.likes)}</td>
                                <td className="px-4 py-2.5 text-right text-blue-400 font-medium">{cpl > 0 ? fmtVnd(cpl) : "—"}</td>
                              </tr>
                            );
                          })}
                          {likeRanking.filter(r => r.likes > 0).length === 0 && (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Không có dữ liệu</td></tr>
                          )}
                        </tbody>
                        <tfoot className="border-t border-border">
                          <tr>
                            <td colSpan={4} className="px-4 py-2 text-right text-[15px] text-muted-foreground">
                              {likeRanking.filter(r => r.likes > 0).length} kênh
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Table 2: Messenger Channel Ranking */}
                  <div className="bg-background border border-border rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                      <span className="text-lg">💬</span>
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Hiệu quả kênh chạy Mess</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="text-muted-foreground border-b border-border">
                          <tr>
                            <th className="px-4 py-2 font-medium w-8">#</th>
                            <th className="px-4 py-2 font-medium text-blue-400">Kênh</th>
                            <th className="px-4 py-2 font-medium text-right text-blue-400">Tin nhắn</th>
                            <th className="px-4 py-2 font-medium text-right text-blue-400">Chi phí/tin nhắn</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {messRanking.filter(r => r.messages > 0).slice(0, 20).map((r, i) => {
                            const cpm2 = r.messages > 0 ? Math.round(r.spend / r.messages) : 0;
                            return (
                              <tr key={i} className="hover:bg-card/40">
                                <td className="px-4 py-2.5 text-muted-foreground">{i + 1}</td>
                                <td className="px-4 py-2.5 text-blue-400 font-medium max-w-[180px] truncate" title={r.name}>{r.name}</td>
                                <td className="px-4 py-2.5 text-right text-foreground">{fmtNum(r.messages)}</td>
                                <td className="px-4 py-2.5 text-right text-blue-400 font-medium">{cpm2 > 0 ? fmtVnd(cpm2) : "—"}</td>
                              </tr>
                            );
                          })}
                          {messRanking.filter(r => r.messages > 0).length === 0 && (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Không có dữ liệu</td></tr>
                          )}
                        </tbody>
                        <tfoot className="border-t border-border">
                          <tr>
                            <td colSpan={4} className="px-4 py-2 text-right text-[15px] text-muted-foreground">
                              {messRanking.filter(r => r.messages > 0).length} kênh
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}


          {/* TAB 3: EFFICIENCY BY MODE */}
          {selectedTab === "mode" && (
            <div className="flex flex-col gap-6">
              {/* Objective breakdown table */}
              <div className="bg-background border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Phân tích hiệu quả theo Mục tiêu (Objective Mode)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left whitespace-nowrap">
                    <thead className="text-muted-foreground uppercase border-b border-border">
                      <tr>
                        <th className="px-4 py-3 font-medium">Mục tiêu tối ưu</th>
                        <th className="px-4 py-3 font-medium text-right">Chi tiêu</th>
                        <th className="px-4 py-3 font-medium text-right">Hiển thị</th>
                        <th className="px-4 py-3 font-medium text-right">Click</th>
                        <th className="px-4 py-3 font-medium text-right">CTR</th>
                        <th className="px-4 py-3 font-medium text-right">CPC</th>
                        <th className="px-4 py-3 font-medium text-right">Tin nhắn / Lượt chuyển đổi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-foreground">
                      {!breakdown?.hasData ? (
                        <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Chưa có dữ liệu insight. Hãy đồng bộ insight Meta/TikTok.</td></tr>
                      ) : (
                        breakdown.byObjective.map((o, idx) => {
                          const ctr = o.impressions > 0 ? (o.clicks / o.impressions) * 100 : 0;
                          const cpc = o.clicks > 0 ? o.spend / o.clicks : 0;
                          const conv = o.messages + o.conversions;
                          return (
                            <tr key={idx} className="hover:bg-card/40">
                              <td className="px-4 py-3 font-semibold text-foreground">{o.objective}</td>
                              <td className="px-4 py-3 text-right">{fmtVnd(o.spend)}</td>
                              <td className="px-4 py-3 text-right">{fmtNum(o.impressions)}</td>
                              <td className="px-4 py-3 text-right">{fmtNum(o.clicks)}</td>
                              <td className="px-4 py-3 text-right">{ctr.toFixed(2)}%</td>
                              <td className="px-4 py-3 text-right">{cpc > 0 ? fmtVnd(cpc) : "—"}</td>
                              <td className="px-4 py-3 text-right text-blue-400">{fmtNum(conv)}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ĐƠN HÀNG BÁN (Sapo) */}
          {selectedTab === "orders" && (
            <OrdersBreakdown query={rangeToQuery(dateRange)} />
          )}
        </>
      )}
    </div>
  );
}

export default function OverviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground text-sm">Đang tải...</div>}>
      <OverviewInner />
    </Suspense>
  );
}
