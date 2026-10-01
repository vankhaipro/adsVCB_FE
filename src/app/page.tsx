"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SpinnerGap, Circle, Info,
  CurrencyDollar, TrendUp, Eye, Waveform,
  CursorClick, ShoppingCart, Lightning, ChartBar,
  type Icon,
} from "@phosphor-icons/react";
import { apiGet, fmtVnd, datesToQuery } from "@/lib/api";
import { pageNameKey } from "@/lib/pageNameKey";
import { useChartColors } from "@/lib/chartTheme";
import OrdersBreakdown from "@/components/OrdersBreakdown";
import OverviewHeader, { type KpiItem } from "@/components/overview/OverviewHeader";
import { presetToDates } from "@/components/DateRangePicker";
import OverviewBody from "@/components/overview/OverviewBody";
import type { CampaignTableHandle } from "@/components/overview/CampaignTable";
import type { ProductTableHandle } from "@/components/overview/ProductTable";
import { exportWorkbook, type ExportSheet } from "@/lib/exportExcel";
import type { BreakdownData, TeamBreakdown, TrendPoint } from "@/components/overview/dashboardData";

// Bản ghi kênh organic trả về từ /channels (chỉ các field trang này dùng).
type OrganicChannelRow = {
  id: string;
  channelName: string | null;
  platform: string | null;
  team: string | null;
  pageId: string | null;
  adCampaignCount?: number;
};

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




function OverviewInner() {
  const chart = useChartColors();
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignTableRef = useRef<CampaignTableHandle>(null);
  const productTableRef = useRef<ProductTableHandle>(null);
  const [, setCampaigns] = useState<Campaign[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Dữ liệu doanh thu thật từ Sapo (theo khoảng thời gian đang chọn) — xem sapoResult bên dưới.
  // Bảng SKU giờ tự fetch dữ liệu; state này chỉ còn phục vụ khối LEGACY_OVERVIEW (đang tắt).
  const [sapoSkus] = useState<SapoSku[]>([]);

  // Tab từ query param ?tab=overview|channel|orders
  const TAB_VALUES = ["overview", "channel", "orders"] as const;
  type TabValue = typeof TAB_VALUES[number];
  const rawTab = searchParams.get("tab");
  const selectedTab: TabValue = TAB_VALUES.includes(rawTab as TabValue) ? (rawTab as TabValue) : "overview";

  const [employeeOptions, setEmployeeOptions] = useState<{ id: string; label: string }[]>([]);

  useEffect(() => {
    apiGet("/employees")
      .then((data) => {
        if (Array.isArray(data)) {
          setEmployeeOptions(data.map((e: { name: string }) => ({ id: e.name, label: e.name })));
        }
      })
      .catch(() => {});
  }, []);

  function setSelectedTab(tab: TabValue) {
    router.push(`?tab=${tab}`, { scroll: false });
    setStaff("ALL");
  }

  // Filters State
  const [dateRange, setDateRange] = useState("thisMonth");
  const [customFrom, setCustomFrom] = useState(() => presetToDates("thisMonth").from);
  const [customTo, setCustomTo] = useState(() => presetToDates("thisMonth").to);
  const [platform, setPlatform] = useState("ALL");
  const [objective, setObjective] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [accountId, setAccountId] = useState("ALL");
  const [channel] = useState("ALL");
  const [staff, setStaff] = useState("ALL");
  const [pageName, setPageName] = useState("ALL");
  const [team, setTeam] = useState("ALL");
  const [teamOptions, setTeamOptions] = useState<{ id: string; label: string }[]>([]);
  // Toàn bộ kênh organic (từ /channels) và tập con thật sự có campaign khớp — chỉ tập con
  // được đổ vào dropdown "Kênh".
  const [allOrganicChannels, setAllOrganicChannels] = useState<{ id: string; label: string; platform: string; team: string; hasPageId: boolean; linked: number; pageId: string }[]>([]);
  const [organicChannels, setOrganicChannels] = useState<{ id: string; label: string; platform: string }[]>([]);

  const currentStaffs = useMemo(() => {
    if (selectedTab === "orders") {
      return employeeOptions;
    }
    return [
      { id: "Việt", label: "Việt" },
      { id: "Thành", label: "Thành" },
      { id: "Ngọc", label: "Ngọc" },
      { id: "Cương", label: "Cương" },
      { id: "Khác", label: "Khác" },
    ];
  }, [selectedTab, employeeOptions]);

  // Load Initial Data
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [camps, accs, chs] = await Promise.all([
        apiGet("/mkt-api/campaigns"),
        apiGet("/mkt-api/accounts"),
        apiGet("/channels").catch(() => []),
      ]);
      setCampaigns(camps);
      setAccounts(accs);
      // Dropdown "Kênh" gửi channelId — backend nối bằng Channel.pageId ↔ AdCampaign.pageId.
      // Gộp các bản ghi cùng trỏ về một page (vd "Nhạn Nhạn - Vân Phong Các" [YOUTUBE] và
      // "Nhạn Nhạn- Vân Phong Các" [FACEBOOK]): ưu tiên giữ bản có pageId, vì chỉ bản đó
      // mới nối được chính xác theo ID; các bản còn lại lùi về so tên.
      const byKey = new Map<string, { id: string; label: string; platform: string; team: string; hasPageId: boolean; linked: number; pageId: string }>();
      for (const ch of chs as OrganicChannelRow[]) {
        const name = ch?.channelName;
        if (!name || !ch?.id) continue;
        // Khoá gộp: ưu tiên pageId — hai page KHÁC NHAU là hai kênh khác nhau kể cả trùng
        // tên (vd "HuyK.เครื่องประดับทองและเงิน" và "HuyK - เครื่องประดับทองและเงิน" chuẩn
        // hoá ra cùng khoá, gộp lại sẽ nuốt mất một page kèm hơn 13 triệu chi tiêu).
        // Kênh chưa có pageId thì vẫn gộp theo tên như cũ (bản Instagram/YouTube trùng tên).
        const k = ch.pageId ? `id:${ch.pageId}` : `name:${pageNameKey(name)}`;
        if (k === "name:") continue;
        const cur = byKey.get(k);
        const hasPageId = Boolean(ch.pageId);
        const linked = Number(ch.adCampaignCount || 0);
        // Nhãn nói rõ tình trạng nối, để người dùng biết trước khi bấm thay vì thấy 0 rồi
        // không hiểu vì sao: kênh có ID nhưng chưa page nào chạy ads → "chưa có ads".
        const label = !hasPageId
          ? `${name} (so theo tên)`
          : linked === 0
            ? `${name} (chưa có ads)`
            : name;
        // Ưu tiên bản có ads thật, rồi mới tới bản có pageId — tránh chọn nhầm bản trống.
        const rank = (l: number, h: boolean) => (l > 0 ? 2 : h ? 1 : 0);
        if (!cur || rank(linked, hasPageId) > rank(cur.linked, cur.hasPageId)) {
          byKey.set(k, { id: ch.id, label, platform: ch.platform || "", team: ch.team || "", hasPageId, linked, pageId: String(ch.pageId || "") });
        }
      }

      // Sau khi gộp theo pageId vẫn có thể còn hai dòng cùng nhãn (hai page trùng tên) —
      // thêm 6 số cuối của pageId để người dùng phân biệt được chúng trên dropdown.
      const list = [...byKey.values()];
      const labelCount = new Map<string, number>();
      for (const c of list) labelCount.set(c.label, (labelCount.get(c.label) || 0) + 1);
      for (const c of list) {
        if ((labelCount.get(c.label) || 0) > 1 && c.pageId) c.label = `${c.label} · ${c.pageId.slice(-6)}`;
      }
      setAllOrganicChannels(list);
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
  const sapoQuery = datesToQuery(customFrom, customTo);
  // Lưu dữ liệu kèm query đã sinh ra nó. Khi query đổi, `sapo` tự động là null cho tới
  // khi fetch xong — thay cho setSapo(null) đồng bộ trong effect (gây cascading render).
  // Hiệu quả giữ nguyên: thẻ hiện "—" lúc đang tải thay vì đọng số của khoảng ngày trước.
  const [sapoResult, setSapoResult] = useState<{ query: string; data: SapoData | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiGet(`/sapo/revenue?${sapoQuery}`)
      .then((rev) => {
        if (!cancelled) setSapoResult({ query: sapoQuery, data: rev });
      })
      .catch(() => {
        if (!cancelled) setSapoResult({ query: sapoQuery, data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [sapoQuery]);

  const sapo = sapoResult?.query === sapoQuery ? sapoResult.data : null;

  // Chỉ số quảng cáo (Meta/TikTok) tôn trọng toàn bộ bộ lọc của Tổng quan.
  const insightsQuery = useMemo(() => {
    const params = new URLSearchParams(datesToQuery(customFrom, customTo));
    if (platform !== "ALL") params.set("platform", platform);
    if (objective !== "ALL") params.set("objective", objective);
    if (accountId !== "ALL") params.set("accountId", accountId);
    if (channel !== "ALL") params.set("channel", channel);
    if (staff !== "ALL") params.set("staff", staff);
    // pageName ở đây là Channel.id — backend nối qua Channel.pageId ↔ AdCampaign.pageId,
    // lùi về so tên khi một trong hai phía chưa có ID.
    if (pageName !== "ALL") params.set("channelId", pageName);
    if (team !== "ALL") params.set("team", team);
    // Trạng thái ACTIVE/PAUSED — backend tự gộp Meta (ACTIVE/PAUSED) và TikTok (ENABLE/DISABLE)
    // về cùng một nghĩa nên FE chỉ cần gửi đúng 2 giá trị này.
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    return params.toString();
  }, [customFrom, customTo, platform, objective, accountId, channel, staff, pageName, team, statusFilter]);

  // Cùng cách làm như sapo: dữ liệu cũ bị coi là "chưa có" ngay khi query đổi, nên không
  // cần xoá bằng tay trong effect nữa.
  const [insightsResult, setInsightsResult] = useState<{
    query: string;
    insights: InsightData | null;
    breakdown: BreakdownData | null;
    trend: TrendPoint[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const q = insightsQuery;
    Promise.all([
      apiGet(`/mkt-api/insights?${q}`),
      apiGet(`/mkt-api/insights/breakdown?${q}`),
      apiGet(`/mkt-api/insights/trend?${q}`),
    ])
      .then(([ins, brk, trend]) => {
        if (cancelled) return;
        setInsightsResult({ query: q, insights: ins, breakdown: brk, trend });

        // Chọn Team rồi thì dropdown Kênh chỉ hiện kênh của team đó.
        // So khớp theo tiền tố đã chuẩn hoá vì hai bên khác định dạng: dropdown lấy team từ
        // TÊN CHIẾN DỊCH ("Global JP") còn Channel.team do người dùng nhập ("Global - JP1/2/3").
        // Team nào không có kênh nào (vd "Khác") thì giữ nguyên toàn bộ danh sách, tránh
        // để người dùng kẹt với dropdown rỗng.
        const teamKey = pageNameKey(team);
        const matched =
          team === "ALL"
            ? allOrganicChannels
            : allOrganicChannels.filter((c) => pageNameKey(c.team).startsWith(teamKey));
        const visible = matched.length > 0 ? matched : allOrganicChannels;
        setOrganicChannels(visible.map(({ id, label, platform }) => ({ id, label, platform })));

        // Kênh đang chọn không còn trong danh sách sau khi đổi Team → bỏ chọn, nếu không
        // bộ lọc sẽ âm thầm giữ một kênh không thuộc team đang xem.
        if (pageName !== "ALL" && !visible.some((c) => c.id === pageName)) setPageName("ALL");

        // Danh sách Team lấy từ chính breakdown.byTeam (backend suy Team từ tên chiến dịch).
        // Chỉ cập nhật khi chưa lọc team, vì byTeam đã bị thu hẹp theo bộ lọc hiện tại —
        // cập nhật lúc đang lọc sẽ khiến dropdown tụt còn đúng một lựa chọn.
        if (team === "ALL") {
          setTeamOptions(
            (brk?.byTeam ?? [])
              .filter((t: TeamBreakdown) => t?.name && t.name !== "Không xác định" && !t.name.includes("Chưa khai báo"))
              .sort((a: TeamBreakdown, b: TeamBreakdown) => (b.spend || 0) - (a.spend || 0))
              .map((t: TeamBreakdown) => ({ id: t.name, label: t.name })),
          );
        }
      })
      .catch(() => {
        if (!cancelled) setInsightsResult({ query: q, insights: null, breakdown: null, trend: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [insightsQuery, allOrganicChannels, team, pageName]);

  const insightsFresh = insightsResult?.query === insightsQuery;
  const insights = insightsFresh ? insightsResult.insights : null;
  const breakdown = insightsFresh ? insightsResult.breakdown : null;
  const trendData = useMemo(
    () => (insightsFresh && insightsResult ? insightsResult.trend : []),
    [insightsFresh, insightsResult],
  );


  // Format Helper for numbers
  const fmtNum = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n || 0));

  const sapoFilterQuery = useMemo(() => {
    const p = new URLSearchParams();
    
    // Parse khoảng thời gian đã chọn
    const dateParams = new URLSearchParams(datesToQuery(customFrom, customTo));
    for (const [k, v] of dateParams.entries()) {
      p.set(k, v);
    }

    if (platform !== "ALL") p.set("platform", platform);
    if (staff !== "ALL") p.set("staff", staff);

    return p.toString();
  }, [customFrom, customTo, platform, staff]);

  const overviewKpis = useMemo((): KpiItem[] => {
    const ICONS: Record<string, Icon> = {
      spend: CurrencyDollar,
      revenue: TrendUp,
      reach: Eye,
      impressions: Waveform,
      clicks: CursorClick,
      orders: ShoppingCart,
      ctr: Lightning,
      cpm: ChartBar,
    };

    const hasData = !!insights?.hasData;
    const spend = insights?.totalSpend ?? 0;
    const revenue = sapo?.totalRevenue ?? 0;
    const impressions = insights?.impressions ?? 0;
    const reach = insights?.reach ?? 0;
    const clicks = insights?.clicks ?? 0;
    const ctr = insights?.ctr ?? 0;
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;

    const data = [
      { key: "spend", label: "Chi phí quảng cáo", value: `${fmtNum(spend)}đ`, sub: `Tổng ngân sách chi tiêu`, change: undefined, color: "text-blue-400", bg: "bg-blue-500/10" },
      { key: "impressions", label: "Lượt hiển thị", value: fmtNum(impressions), sub: `Tổng số lần quảng cáo hiện`, change: undefined, color: "text-purple-400", bg: "bg-purple-500/10" },
      { key: "reach", label: "Số người tiếp cận", value: fmtNum(reach), sub: `Số người xem quảng cáo`, change: undefined, color: "text-indigo-400", bg: "bg-indigo-500/10" },
      { key: "clicks", label: "Lượt nhấp liên kết", value: fmtNum(clicks), sub: `Tổng click vào QC`, change: undefined, color: "text-orange-400", bg: "bg-orange-500/10" },
      { key: "ctr", label: "Tỷ lệ nhấp (CTR)", value: `${ctr.toFixed(2)}%`, sub: `Tỷ lệ CTR trung bình`, change: undefined, color: "text-yellow-400", bg: "bg-yellow-500/10" },
      { key: "cpm", label: "Chi phí / 1000 lần hiển thị (CPM)", value: `${fmtNum(Math.round(cpm))}đ`, sub: `Chi phí trên 1000 lượt hiển thị`, change: undefined, color: "text-pink-400", bg: "bg-pink-500/10" }
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
    <div className="flex flex-col gap-5 w-full max-w-full overflow-x-hidden pb-10 font-sans -m-4 sm:-m-5 p-4 sm:p-5 bg-background min-h-full" suppressHydrationWarning>
      {/* Navigation Tabs — URL query param: ?tab=overview|channel|orders */}
      <div className="flex border-b border-border gap-1 bg-background rounded-t-xl px-2 pt-1" suppressHydrationWarning>
        {([
          { value: "overview", label: "Tổng quan" },
          { value: "channel", label: "Hiệu quả theo Kênh" },
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
        pageName={pageName}
        status={statusFilter}
        objective={objective}
        dateRange={dateRange}
        dateFrom={customFrom}
        dateTo={customTo}
        staff={staff}
        accountId={accountId}
        accounts={accounts}
        staffs={currentStaffs}
        organicChannels={organicChannels}
        team={team}
        teamOptions={teamOptions}
        onTeamChange={setTeam}
        onPlatformChange={(v) => {
          setPlatform(v);
          setAccountId("ALL");
        }}
        onPageNameChange={setPageName}
        onStatusChange={setStatusFilter}
        onObjectiveChange={setObjective}
        onDateApply={({ presetId, from, to }) => {
          setDateRange(presetId);
          setCustomFrom(from);
          setCustomTo(to);
        }}
        onStaffChange={setStaff}
        onAccountIdChange={setAccountId}
        kpis={overviewKpis}
        showKpis={selectedTab === "overview"}
        onExport={() => {
          const sheets = [campaignTableRef.current?.exportSheet(), productTableRef.current?.exportSheet()]
            .filter((s): s is ExportSheet => !!s);
          const ok = exportWorkbook(`tong-quan-ads-${new Date().toISOString().slice(0, 10)}.xlsx`, sheets);
          if (!ok) alert("Không có dữ liệu để xuất.");
        }}
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
              trend={trendData}
              breakdown={breakdown}
              campaignTableRef={campaignTableRef}
              productTableRef={productTableRef}
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
                          <span className="text-[14px]">Cần đồng bộ chi phí QC<br />(insight Meta/TikTok)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <div className="w-[130px] h-[130px] shrink-0">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
                          <div className="flex flex-col gap-2 text-[14px]">
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
                            <span className="text-[14px]">Cần đồng bộ insight Meta/TikTok</span>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
                            <span className="text-[14px]">Cần đồng bộ insight Meta/TikTok</span>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
                                <td colSpan={4} className="px-4 py-2 text-right text-[14px] text-muted-foreground">Top {sapoSkus.length} SKU theo doanh thu</td>
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
                            <span className="text-[14px]">Cần đồng bộ chi phí QC theo tuyến nội dung</span>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
                          <span className="text-[14px] max-w-[260px]">Chi tiêu/like/tin nhắn theo kênh cần đồng bộ insight Meta/TikTok.</span>
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
                                    <span className={`text-[13px] px-2 py-0.5 rounded font-medium ${ch.platform === "TIKTOK" ? "bg-pink-500/20 text-pink-400" : "bg-blue-500/20 text-blue-400"}`}>
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
                                  <td colSpan={6} className="px-4 py-2 text-right text-[14px] text-muted-foreground">{channelRows.length} kênh</td>
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

            // Donut data: tất cả các kênh (không giới hạn)
            const DONUT_COLORS = [
              "#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4",
              "#f97316","#84cc16","#ec4899","#14b8a6","#a855f7","#fb923c","#94a3b8"
            ];
            const donutData = channelRows.map((c, i) => ({
              name: c.name,
              value: c.spend,
              color: DONUT_COLORS[i % DONUT_COLORS.length]
            }));

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
                      <span className="text-[14px] font-medium text-muted-foreground block mb-1">{k.label}</span>
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
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
                      <div className="flex flex-col gap-2 text-[14px] overflow-y-auto max-h-[140px] w-full px-2 custom-scrollbar">
                        {donutData.map((d, i) => (
                          <div key={i} className="flex items-center justify-between gap-2 min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }}/>
                              <span className="text-muted-foreground truncate" title={d.name}>{d.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{fmtVnd(d.value)}</span>
                              <span className="text-foreground text-xs font-semibold bg-muted px-1.5 py-0.5 rounded">
                                {totalSpend > 0 ? ((d.value / totalSpend) * 100).toFixed(1) : 0}%
                              </span>
                            </div>
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
                          <div className="flex justify-between text-[13px]">
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
                    <div className="text-[13px] flex gap-3 mb-2">
                      <span className="flex items-center gap-1"><Circle size={8} weight="fill" className="text-blue-400"/>Tin nhắn</span>
                      <span className="flex items-center gap-1"><Circle size={8} weight="fill" className="text-amber-400"/>Thích trang</span>
                      <span className="flex items-center gap-1"><Circle size={8} weight="fill" className="text-green-400"/>Bình luận</span>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                      <div className="flex flex-col gap-2 min-w-0">
                        {scatterData.slice(0, 12).map((d, i) => {
                          return (
                            <div key={i} className="flex items-center gap-2 text-[13px]">
                              <span className="text-muted-foreground w-4 text-right shrink-0">{i + 1}</span>
                              <span className="text-foreground w-28 truncate shrink-0" title={d.name}>{d.name}</span>
                              <div className="flex-1 flex items-center gap-1 min-w-0">
                                <div className="h-1.5 rounded bg-blue-500 shrink-0" style={{ width: `${Math.max(2, (d.messages / (scatterData[0]?.messages || 1)) * 35)}%` }} />
                                <div className="h-1.5 rounded bg-amber-400 shrink-0" style={{ width: `${Math.max(2, (d.likes / (scatterData[0]?.likes || 1)) * 25)}%` }} />
                                <div className="h-1.5 rounded bg-green-400 shrink-0" style={{ width: `${Math.max(2, (d.comments / (scatterData[0]?.comments || 1)) * 15)}%` }} />
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
                            <td colSpan={4} className="px-4 py-2 text-right text-[13px] text-muted-foreground">
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
                            <td colSpan={4} className="px-4 py-2 text-right text-[13px] text-muted-foreground">
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


          {/* TAB 4: ĐƠN HÀNG BÁN (Sapo) */}
          {selectedTab === "orders" && (
            <OrdersBreakdown query={sapoFilterQuery} />
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
