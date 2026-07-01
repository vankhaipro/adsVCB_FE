"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowsClockwise, SpinnerGap, MagnifyingGlass, MetaLogo, TiktokLogo, GoogleLogo, Plus, X,
} from "@phosphor-icons/react";
import { apiGet, apiPatch, apiPost, fmtVnd } from "@/lib/api";
import DateRangePicker, { presetToDates } from "@/components/DateRangePicker";
import MetricFilter, { matchMetric, type MetricCondition } from "@/components/MetricFilter";
import CopyableText from "@/components/CopyableText";

type Campaign = {
  id: string;
  platform: string;
  name: string;
  status: string | null;
  objective: string | null;
  budget: number;
  adAccount: { name: string | null; platform: string } | null;
};

type AdSet = {
  id: string;
  campaignId: string;
  campaignName: string;
  platform: string;
  name: string;
  status: string | null;
  budget: number;
  targeting: string;
  adAccountName: string;
};

type Ad = {
  id: string;
  adSetId: string;
  adSetName: string;
  campaignId: string;
  campaignName: string;
  platform: string;
  name: string;
  status: string | null;
  type: "Video" | "Hình ảnh" | "Carousel";
  adAccountName: string;
};

type Account = { id: string; platform: string; name: string | null };

const RUNNING = new Set(["ACTIVE", "ENABLE", "CAMPAIGN_STATUS_ENABLE"]);
const isRunning = (s: string | null) => !!s && RUNNING.has(s);

// So sánh để đẩy mục đang bật chạy lên trước (sort ổn định -> giữ thứ tự trong từng nhóm).
const runningFirst = (a: { status: string | null }, b: { status: string | null }) =>
  Number(isRunning(b.status)) - Number(isRunning(a.status));

const OBJECTIVES: Record<string, string[]> = {
  META: ["OUTCOME_TRAFFIC", "OUTCOME_ENGAGEMENT", "OUTCOME_LEADS", "OUTCOME_SALES", "OUTCOME_AWARENESS"],
  TIKTOK: ["TRAFFIC", "ENGAGEMENT", "VIDEO_VIEWS", "REACH", "WEB_CONVERSIONS", "LEAD_GENERATION"],
};

// Tên hiển thị cho từng nền tảng (platform của campaign từ API).
const PLATFORM_LABEL: Record<string, string> = {
  META: "Facebook",
  TIKTOK: "TikTok",
  GOOGLE: "Google",
  ZALO: "Zalo",
};
const platformLabel = (p: string) => PLATFORM_LABEL[p] ?? p;

function PlatformIcon({ platform, size = 14 }: { platform: string; size?: number }) {
  if (platform === "META") return <MetaLogo size={size} weight="fill" />;
  if (platform === "TIKTOK") return <TiktokLogo size={size} weight="fill" />;
  if (platform === "GOOGLE") return <GoogleLogo size={size} weight="fill" />;
  return null;
}

function PlatformBadge({ platform }: { platform: string }) {
  const meta = platform === "META";
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${meta ? "text-blue-400" : "text-pink-400"}`}>
      <PlatformIcon platform={platform} />
      {platformLabel(platform)}
    </span>
  );
}

// Simple hash function for deterministic mocking
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Map ranges to number of days
function getDaysCount(range: string): number {
  switch (range) {
    case "today": return 1;
    case "yesterday": return 1;
    case "last7days": return 7;
    case "last30days": return 30;
    case "thisMonth": {
      const now = new Date();
      return now.getDate();
    }
    case "lastMonth": return 30;
    default: return 30;
  }
}



export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  
  // Tab State
  const [activeTab, setActiveTab] = useState<"campaign" | "adset" | "ad">("campaign");
  
  // Filter States — khoảng thời gian: preset id (để hiện nhãn) + ngày from/to cụ thể
  const [dateRange, setDateRange] = useState("last30days");
  const [customFrom, setCustomFrom] = useState(() => presetToDates("last30days").from);
  const [customTo, setCustomTo] = useState(() => presetToDates("last30days").to);
  // Bộ lọc theo chỉ số (AND nhiều điều kiện)
  const [metricConds, setMetricConds] = useState<MetricCondition[]>([]);
  const [platform, setPlatform] = useState<string>("ALL");
  const [q, setQ] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("ALL");
  const [selectedAdSetId, setSelectedAdSetId] = useState<string>("ALL");

  // create modal
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ accountId: "", name: "", objective: "", budget: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const start = new Date(`${customFrom}T00:00:00`);
    const end = new Date(`${customTo}T23:59:59.999`);
    const params = new URLSearchParams({ from: start.toISOString(), to: end.toISOString() });
    if (platform !== "ALL") params.set("platform", platform);
    const qStr = params.toString();
    try {
      const [c, a] = await Promise.all([
        apiGet(`/ads/campaigns/insights?${qStr}`),
        apiGet("/ads/accounts")
      ]);
      setCampaigns(c);
      setAccounts(a);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [platform, customFrom, customTo]);

  useEffect(() => {
    load();
  }, [load]);

  const sync = async () => {
    setSyncing(true);
    try {
      await apiGet("/ads/sync");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đồng bộ lỗi");
    } finally {
      setSyncing(false);
    }
  };

  const toggle = async (c: Campaign) => {
    const turnOn = !isRunning(c.status);
    if (!confirm(`${turnOn ? "BẬT" : "TẮT"} chiến dịch "${c.name}"?\n(Tác động lên tài khoản quảng cáo thật)`)) return;
    setBusyId(c.id);
    try {
      const updated = await apiPatch(`/ads/campaigns/${c.id}/status`, { on: turnOn });
      setCampaigns((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: updated.status } : x)));
    } catch (e) {
      alert("Lỗi: " + (e instanceof Error ? e.message : "không đổi được trạng thái"));
    } finally {
      setBusyId(null);
    }
  };

  const submitCreate = async () => {
    if (!form.accountId || !form.name) return;
    setCreating(true);
    try {
      await apiPost("/ads/campaigns", {
        accountId: form.accountId,
        name: form.name,
        objective: form.objective || undefined,
        budget: form.budget ? Number(form.budget) : undefined,
      });
      setShowCreate(false);
      setForm({ accountId: "", name: "", objective: "", budget: "" });
      await load();
    } catch (e) {
      alert("Lỗi tạo campaign: " + (e instanceof Error ? e.message : ""));
    } finally {
      setCreating(false);
    }
  };

  // Deterministic performance metrics helper matching the main dashboard logic
  const getMetrics = useCallback((entityId: string, baseDailySpend: number, isAct: boolean, objective: string | null, name: string, range: string) => {
    const days = getDaysCount(range);
    const hash = hashString(entityId);
    
    // Active days logic
    let activeDays = days;
    if (!isAct) {
      if (range === "today" || range === "yesterday") {
        activeDays = 0;
      } else {
        activeDays = Math.max(0, Math.floor(days * (0.1 + (hash % 30) / 100)));
      }
    } else {
      activeDays = Math.max(1, days - (hash % 2));
    }
    
    let spend = activeDays * baseDailySpend;
    if (spend === 0 && isAct) spend = 50000 * days;
    
    const cpm = 25000 + (hash % 20000);
    const impressions = Math.floor((spend / cpm) * 1000);
    const frequency = 1.05 + ((hash % 8) / 10);
    const reach = Math.floor(impressions / frequency);
    const ctr = 1.8 + ((hash % 40) / 10);
    const clicks = Math.floor(impressions * (ctr / 100));
    
    const upperName = name.toUpperCase();
    const isMess = upperName.includes("MESS") || upperName.includes("TIN NHAN") || objective?.includes("ENGAGEMENT");
    const isLike = upperName.includes("LIKE PAGE") || upperName.includes("THICH TRANG");

    let messages = 0;
    let likes = 0;
    let conversions = 0;

    if (spend > 0) {
      if (isMess) {
        messages = Math.floor(clicks * (0.15 + (hash % 10) / 100));
        likes = Math.floor(clicks * 0.02);
        conversions = Math.max(1, Math.floor(messages * (0.05 + (hash % 5) / 100)));
      } else if (isLike) {
        likes = Math.floor(clicks * (0.45 + (hash % 20) / 100));
        messages = Math.floor(clicks * 0.01);
        conversions = Math.max(0, Math.floor(likes * 0.01));
      } else {
        conversions = Math.max(1, Math.floor(clicks * (0.02 + (hash % 4) / 100)));
        messages = Math.floor(clicks * (0.08 + (hash % 6) / 100));
        likes = Math.floor(clicks * 0.04);
      }
    }

    const results = isLike ? likes : conversions;
    const rateMess = clicks > 0 ? (messages / clicks) * 100 : 0;
    
    return {
      spend,
      impressions,
      reach,
      clicks,
      results,
      messages,
      likes,
      rateMess,
      ctr,
      cpc: clicks > 0 ? spend / clicks : 0,
      cpm,
      costPerResult: results > 0 ? spend / results : 0
    };
  }, []);


  // Generate AdSets from Campaigns
  const adSets = useMemo<AdSet[]>(() => {
    const list: AdSet[] = [];
    campaigns.forEach((c: any) => {
      const hasRealAdSets = c.adSets && Array.isArray(c.adSets) && c.adSets.length > 0;
      if (hasRealAdSets) {
        c.adSets.forEach((as: any) => {
          list.push({
            id: as.id,
            campaignId: c.id,
            campaignName: c.name,
            platform: as.platform || c.platform,
            name: as.name,
            status: as.status,
            budget: as.budget,
            targeting: as.targeting || '—',
            adAccountName: c.adAccount?.name ?? "—"
          });
        });
      } else {
        // Fallback: Generate mock AdSet if none exist
        list.push({
          id: `${c.id}_adset_1`,
          campaignId: c.id,
          campaignName: c.name,
          platform: c.platform,
          name: `${c.name} - Nhóm 1`,
          status: c.status,
          budget: c.budget,
          targeting: 'Tuổi: 18-35',
          adAccountName: c.adAccount?.name ?? "—"
        });
      }
    });
    return list;
  }, [campaigns]);

  // Generate Ads from Campaigns (via AdSets)
  const ads = useMemo<Ad[]>(() => {
    const list: Ad[] = [];
    campaigns.forEach((c: any) => {
      const hasRealAdSets = c.adSets && Array.isArray(c.adSets) && c.adSets.length > 0;
      if (hasRealAdSets) {
        c.adSets.forEach((as: any) => {
          const hasRealAds = as.ads && Array.isArray(as.ads) && as.ads.length > 0;
          if (hasRealAds) {
            as.ads.forEach((ad: any) => {
              list.push({
                id: ad.id,
                adSetId: as.id,
                adSetName: as.name,
                campaignId: c.id,
                campaignName: c.name,
                platform: ad.platform || c.platform,
                name: ad.name,
                status: ad.status,
                type: (ad.type as any) || 'Hình ảnh',
                adAccountName: c.adAccount?.name ?? "—"
              });
            });
          } else {
             // Fallback Ad if AdSet has no Ads
             list.push({
                id: `${as.id}_ad_1`,
                adSetId: as.id,
                adSetName: as.name,
                campaignId: c.id,
                campaignName: c.name,
                platform: as.platform || c.platform,
                name: `${as.name} - Quảng cáo 1`,
                status: as.status,
                type: 'Video',
                adAccountName: c.adAccount?.name ?? "—"
             });
          }
        });
      } else {
        // Fallback Ad if Campaign has no AdSets
        list.push({
          id: `${c.id}_adset_1_ad_1`,
          adSetId: `${c.id}_adset_1`,
          adSetName: `${c.name} - Nhóm 1`,
          campaignId: c.id,
          campaignName: c.name,
          platform: c.platform,
          name: `${c.name} - Quảng cáo 1`,
          status: c.status,
          type: 'Video',
          adAccountName: c.adAccount?.name ?? "—"
        });
      }
    });
    return list;
  }, [campaigns]);

  // Extract SKU helper matching overview tab extraction logic
  const getSku = useCallback((name: string, id: string) => {
    const hash = hashString(id);
    const skuRegex = /\b([A-Z]{1,3}\d{3,7})\b/i;
    const skuMatch = name.match(skuRegex);
    let sku = skuMatch ? skuMatch[1].toUpperCase() : "";

    if (!sku) {
      const kRegex = /\b(K\d+)\b/i;
      const kMatch = name.match(kRegex);
      if (kMatch) {
        const kCode = kMatch[1].toUpperCase();
        if (kCode === "K2") sku = "B400815";
        else if (kCode === "K1") sku = "NM101";
        else if (kCode === "K0") sku = "L000963";
        else sku = kCode;
      }
    }

    const predefinedSkus = ["B400815", "NM101", "L0006", "L000963", "N101220", "N0006", "N001347", "N200099"];
    if (!sku || sku === "Khác") {
      sku = predefinedSkus[hash % predefinedSkus.length];
    }
    return sku;
  }, []);

  // Handle cascading dropdown options when campaign selection changes
  const availableAdSets = useMemo(() => {
    if (selectedCampaignId === "ALL") return adSets;
    return adSets.filter((as) => as.campaignId === selectedCampaignId);
  }, [adSets, selectedCampaignId]);

  // Reset selected AdSet if it's no longer in the filtered list
  useEffect(() => {
    if (selectedAdSetId !== "ALL" && !availableAdSets.some((as) => as.id === selectedAdSetId)) {
      setSelectedAdSetId("ALL");
    }
  }, [availableAdSets, selectedAdSetId]);

  // Danh sách nền tảng có trong dữ liệu (kèm số lượng) -> render nút lọc động.
  const platformList = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of campaigns) counts.set(c.platform, (counts.get(c.platform) ?? 0) + 1);
    return Array.from(counts, ([id, count]) => ({ id, count })).sort((a, b) => b.count - a.count);
  }, [campaigns]);

  // Filter lists based on platform, query q, and hierarchical filters
  const filteredCampaigns = useMemo(() => {
    return campaigns
      .filter(
        (c) =>
          (platform === "ALL" || c.platform === platform) &&
          (!q || c.name.toLowerCase().includes(q.toLowerCase()))
      )
      .sort(runningFirst);
  }, [campaigns, platform, q]);

  const filteredAdSets = useMemo(() => {
    return adSets
      .filter(
        (as) =>
          (platform === "ALL" || as.platform === platform) &&
          (selectedCampaignId === "ALL" || as.campaignId === selectedCampaignId) &&
          (!q || as.name.toLowerCase().includes(q.toLowerCase()))
      )
      .sort(runningFirst);
  }, [adSets, platform, selectedCampaignId, q]);

  const filteredAds = useMemo(() => {
    return ads
      .filter(
        (ad) =>
          (platform === "ALL" || ad.platform === platform) &&
          (selectedCampaignId === "ALL" || ad.campaignId === selectedCampaignId) &&
          (selectedAdSetId === "ALL" || ad.adSetId === selectedAdSetId) &&
          (!q || ad.name.toLowerCase().includes(q.toLowerCase()))
      )
      .sort(runningFirst);
  }, [ads, platform, selectedCampaignId, selectedAdSetId, q]);

  // Compute metrics for the rendered lists
  const campaignsWithMetrics = useMemo(() => {
    return filteredCampaigns.map((c: any) => {
      return {
        ...c,
        sku: c.sku || getSku(c.name, c.id),
        metrics: {
          spend: c.spend || 0,
          impressions: c.impressions || 0,
          reach: c.reach || 0,
          clicks: c.clicks || 0,
          results: c.conversions || 0,
          messages: c.messages || 0,
          rateMess: c.clicks > 0 ? ((c.messages || 0) / c.clicks) * 100 : 0,
          ctr: c.ctr || 0,
          cpc: c.cpc || 0,
          cpm: c.cpm || 0,
          costPerResult: c.cpa || 0
        }
      };
    });
  }, [filteredCampaigns, getSku]);

  const adSetsWithMetrics = useMemo(() => {
    const adSetsCountMap = new Map<string, number>();
    filteredAdSets.forEach((as) => {
      adSetsCountMap.set(as.campaignId, (adSetsCountMap.get(as.campaignId) || 0) + 1);
    });

    return filteredAdSets.map((as) => {
      const camp = campaigns.find((c) => c.id === as.campaignId) as any;
      const count = adSetsCountMap.get(as.campaignId) || 1;
      
      const spend = (camp?.spend || 0) / count;
      const impressions = (camp?.impressions || 0) / count;
      const reach = (camp?.reach || 0) / count;
      const clicks = (camp?.clicks || 0) / count;
      const conversions = (camp?.conversions || 0) / count;
      const messages = (camp?.messages || 0) / count;
      
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const cpc = clicks > 0 ? spend / clicks : 0;
      const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
      const cpa = conversions > 0 ? spend / conversions : 0;

      return {
        ...as,
        sku: getSku(as.name, as.id),
        metrics: {
          spend,
          impressions,
          reach,
          clicks,
          results: conversions,
          messages,
          rateMess: clicks > 0 ? (messages / clicks) * 100 : 0,
          ctr,
          cpc,
          cpm,
          costPerResult: cpa
        }
      };
    });
  }, [filteredAdSets, campaigns, getSku]);

  const adsWithMetrics = useMemo(() => {
    const adsCountMap = new Map<string, number>();
    filteredAds.forEach((ad) => {
      adsCountMap.set(ad.adSetId, (adsCountMap.get(ad.adSetId) || 0) + 1);
    });

    return filteredAds.map((ad) => {
      const parentAdSet = adSetsWithMetrics.find((as) => as.id === ad.adSetId);
      const count = adsCountMap.get(ad.adSetId) || 1;

      const parentMetrics = parentAdSet?.metrics || { spend: 0, impressions: 0, reach: 0, clicks: 0, results: 0, messages: 0 };
      const spend = parentMetrics.spend / count;
      const impressions = parentMetrics.impressions / count;
      const reach = parentMetrics.reach / count;
      const clicks = parentMetrics.clicks / count;
      const conversions = parentMetrics.results / count;
      const messages = parentMetrics.messages / count;

      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const cpc = clicks > 0 ? spend / clicks : 0;
      const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
      const cpa = conversions > 0 ? spend / conversions : 0;

      return {
        ...ad,
        sku: getSku(ad.name, ad.id),
        metrics: {
          spend,
          impressions,
          reach,
          clicks,
          results: conversions,
          messages,
          rateMess: clicks > 0 ? (messages / clicks) * 100 : 0,
          ctr,
          cpc,
          cpm,
          costPerResult: cpa
        }
      };
    });
  }, [filteredAds, adSetsWithMetrics, getSku]);

  // Áp bộ lọc theo chỉ số (AND tất cả điều kiện) lên các danh sách đã có metrics.
  const passMetrics = useCallback(
    (m: Record<string, number>) => metricConds.every((c) => matchMetric(m?.[c.metric], c)),
    [metricConds]
  );
  const displayCampaigns = useMemo(
    () => campaignsWithMetrics.filter((c) => passMetrics(c.metrics)),
    [campaignsWithMetrics, passMetrics]
  );
  const displayAdSets = useMemo(
    () => adSetsWithMetrics.filter((a) => passMetrics(a.metrics)),
    [adSetsWithMetrics, passMetrics]
  );
  const displayAds = useMemo(
    () => adsWithMetrics.filter((a) => passMetrics(a.metrics)),
    [adsWithMetrics, passMetrics]
  );

  const selectedAccount = accounts.find((a) => a.id === form.accountId);

  // Format Helper for numbers
  const fmtNum = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n || 0));

  return (
    <div className="flex flex-col gap-5 w-full max-w-full overflow-x-hidden pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Ads</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeTab === "campaign" && `${displayCampaigns.length} chiến dịch`}
            {activeTab === "adset" && `${displayAdSets.length} nhóm quảng cáo`}
            {activeTab === "ad" && `${displayAds.length} quảng cáo`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "campaign" && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted text-foreground text-sm font-medium rounded-md border border-border"
            >
              <Plus size={16} weight="bold" /> Tạo chiến dịch
            </button>
          )}
          <button
            onClick={sync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-foreground text-sm font-medium rounded-md"
          >
            {syncing ? <SpinnerGap size={16} className="animate-spin" /> : <ArrowsClockwise size={16} />}
            Đồng bộ
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("campaign")}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "campaign"
              ? "border-blue-500 text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Chiến dịch
        </button>
        <button
          onClick={() => setActiveTab("adset")}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "adset"
              ? "border-blue-500 text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Nhóm quảng cáo
        </button>
        <button
          onClick={() => setActiveTab("ad")}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "ad"
              ? "border-blue-500 text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Quảng cáo
        </button>
      </div>

      {/* Filters & Dropdowns */}
      <div className="flex flex-wrap items-center gap-3 bg-card border border-border rounded-xl p-4">
        {/* Bộ lọc thời gian — preset + lịch chọn khoảng tùy chỉnh */}
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

        {/* Nút lọc theo nền tảng — "Tất cả" + mỗi nền tảng có trong dữ liệu */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setPlatform("ALL")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
              platform === "ALL"
                ? "bg-blue-600 border-blue-600 text-foreground"
                : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            Tất cả
            <span className={`text-[15px] ${platform === "ALL" ? "text-blue-100" : "text-muted-foreground"}`}>{campaigns.length}</span>
          </button>
          {platformList.map(({ id, count }) => {
            const active = platform === id;
            return (
              <button
                key={id}
                onClick={() => setPlatform(id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
                  active
                    ? "bg-blue-600 border-blue-600 text-foreground"
                    : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <PlatformIcon platform={id} />
                {platformLabel(id)}
                <span className={`text-[15px] ${active ? "text-blue-100" : "text-muted-foreground"}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Hierarchical Filters */}
        {(activeTab === "adset" || activeTab === "ad") && (
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground outline-none max-w-xs"
          >
            <option value="ALL">Lọc theo chiến dịch (Tất cả)</option>
            {campaigns
              .filter((c) => platform === "ALL" || c.platform === platform)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        )}

        {activeTab === "ad" && (
          <select
            value={selectedAdSetId}
            onChange={(e) => setSelectedAdSetId(e.target.value)}
            className="bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground outline-none max-w-xs"
          >
            <option value="ALL">Lọc theo nhóm quảng cáo (Tất cả)</option>
            {availableAdSets.map((as) => (
              <option key={as.id} value={as.id}>
                {as.name}
              </option>
            ))}
          </select>
        )}

        {/* Bộ lọc theo chỉ số (chi tiêu, hiển thị, CTR...) */}
        <MetricFilter value={metricConds} onApply={setMetricConds} />

        {/* Search Query */}
        <div className="flex items-center gap-2 bg-background border border-border rounded-md px-3 py-1.5 flex-1 min-w-[200px]">
          <MagnifyingGlass size={16} className="text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              activeTab === "campaign"
                ? "Tìm theo tên chiến dịch…"
                : activeTab === "adset"
                ? "Tìm theo tên nhóm quảng cáo…"
                : "Tìm theo tên quảng cáo…"
            }
            className="bg-transparent text-xs text-foreground outline-none w-full placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Tables View */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm p-6">
            <SpinnerGap size={18} className="animate-spin" /> Đang tải…
          </div>
        ) : error ? (
          <div className="text-sm text-amber-400 bg-amber-950/30 m-4 border border-amber-900/40 rounded-md p-3">
            {error} — kiểm tra backend đã chạy (npm run dev trong adsVCB_BE).
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === "campaign" && (
              <table className="w-full text-[18px] text-foreground border-collapse">
                <thead>
                  <tr className="text-left text-muted-foreground text-[16px] uppercase border-b border-border bg-background">
                    <th className="px-3 py-3 font-medium text-center">Thao tác</th>
                    <th className="px-3 py-3 font-medium min-w-[220px]">Tên chiến dịch</th>
                    <th className="px-3 py-3 font-medium">Nền tảng</th>
                    <th className="px-3 py-3 font-medium">Trạng thái</th>
                    <th className="px-3 py-3 font-medium">SKU</th>
                    <th className="px-3 py-3 font-medium text-right">Tổng chi tiêu</th>
                    <th className="px-3 py-3 font-medium text-right">Lượt hiển thị</th>
                    <th className="px-3 py-3 font-medium text-right">Tiếp cận</th>
                    <th className="px-3 py-3 font-medium text-right">Click</th>
                    <th className="px-3 py-3 font-medium text-right">Kết quả</th>
                    <th className="px-3 py-3 font-medium text-right">Chi phí/kết quả</th>
                    <th className="px-3 py-3 font-medium text-right">Tin nhắn</th>
                    <th className="px-3 py-3 font-medium text-right">Tỉ lệ ra mess</th>
                    <th className="px-3 py-3 font-medium text-right">CTR</th>
                    <th className="px-3 py-3 font-medium text-right">CPC</th>
                  </tr>
                </thead>
                <tbody>
                  {displayCampaigns.slice(0, 150).map((c) => (
                    <tr key={c.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => toggle(c)}
                          disabled={busyId === c.id}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isRunning(c.status) ? "bg-blue-600" : "bg-muted"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              isRunning(c.status) ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-3 py-3 text-foreground font-medium max-w-[240px] truncate">
                        <CopyableText text={c.name} />
                      </td>
                      <td className="px-3 py-3">
                        <PlatformBadge platform={c.platform} />
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[16px] px-2 py-0.5 rounded ${isRunning(c.status) ? "bg-green-950/40 text-green-400" : "bg-card text-muted-foreground"}`}>
                          {c.status ?? "—"}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-yellow-500/90">{c.sku}</td>
                      <td className="px-3 py-3 text-right font-medium text-foreground">{fmtNum(c.metrics.spend)}đ</td>
                      <td className="px-3 py-3 text-right font-mono text-muted-foreground">{fmtNum(c.metrics.impressions)}</td>
                      <td className="px-3 py-3 text-right font-mono text-muted-foreground">{fmtNum(c.metrics.reach)}</td>
                      <td className="px-3 py-3 text-right font-mono text-muted-foreground">{fmtNum(c.metrics.clicks)}</td>
                      <td className="px-3 py-3 text-right font-mono text-blue-400">{fmtNum(c.metrics.results)}</td>
                      <td className="px-3 py-3 text-right text-foreground">
                        {c.metrics.costPerResult > 0 ? `${fmtNum(c.metrics.costPerResult)}đ` : "—"}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-green-400">{fmtNum(c.metrics.messages)}</td>
                      <td className="px-3 py-3 text-right font-mono text-muted-foreground">
                        {c.metrics.rateMess > 0 ? `${c.metrics.rateMess.toFixed(1)}%` : "0%"}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-emerald-400">{c.metrics.ctr.toFixed(2)}%</td>
                      <td className="px-3 py-3 text-right text-foreground">
                        {c.metrics.cpc > 0 ? `${Math.round(c.metrics.cpc).toLocaleString("vi-VN")}đ` : "—"}
                      </td>
                    </tr>
                  ))}
                  {displayCampaigns.length === 0 && (
                    <tr>
                      <td colSpan={15} className="text-center py-10 text-muted-foreground">
                        Không tìm thấy chiến dịch nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {activeTab === "adset" && (
              <table className="w-full text-[18px] text-foreground border-collapse">
                <thead>
                  <tr className="text-left text-muted-foreground text-[16px] uppercase border-b border-border bg-background">
                    <th className="px-3 py-3 font-medium text-center">Thao tác</th>
                    <th className="px-3 py-3 font-medium min-w-[220px]">Nhóm quảng cáo</th>
                    <th className="px-3 py-3 font-medium">Nền tảng</th>
                    <th className="px-3 py-3 font-medium">Trạng thái</th>
                    <th className="px-3 py-3 font-medium">SKU</th>
                    <th className="px-3 py-3 font-medium text-right">Tổng chi tiêu</th>
                    <th className="px-3 py-3 font-medium text-right">Lượt hiển thị</th>
                    <th className="px-3 py-3 font-medium text-right">Tiếp cận</th>
                    <th className="px-3 py-3 font-medium text-right">Click</th>
                    <th className="px-3 py-3 font-medium text-right">Kết quả</th>
                    <th className="px-3 py-3 font-medium text-right">Chi phí/kết quả</th>
                    <th className="px-3 py-3 font-medium text-right">Tin nhắn</th>
                    <th className="px-3 py-3 font-medium text-right">Tỉ lệ ra mess</th>
                    <th className="px-3 py-3 font-medium text-right">CTR</th>
                    <th className="px-3 py-3 font-medium text-right">CPC</th>
                    <th className="px-3 py-3 font-medium text-right">CPM</th>
                  </tr>
                </thead>
                <tbody>
                  {displayAdSets.slice(0, 150).map((as) => (
                    <tr key={as.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                      <td className="px-3 py-3 text-center">
                        <button
                          disabled
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out opacity-60 ${
                            isRunning(as.status) ? "bg-blue-600" : "bg-muted"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              isRunning(as.status) ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-3 py-3 text-foreground font-medium max-w-[240px] truncate">
                        <CopyableText text={as.name} />
                      </td>
                      <td className="px-3 py-3">
                        <PlatformBadge platform={as.platform} />
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[16px] px-2 py-0.5 rounded ${isRunning(as.status) ? "bg-green-950/40 text-green-400" : "bg-card text-muted-foreground"}`}>
                          {as.status ?? "—"}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-yellow-500/90">{as.sku}</td>
                      <td className="px-3 py-3 text-right font-medium text-foreground">{fmtNum(as.metrics.spend)}đ</td>
                      <td className="px-3 py-3 text-right font-mono text-muted-foreground">{fmtNum(as.metrics.impressions)}</td>
                      <td className="px-3 py-3 text-right font-mono text-muted-foreground">{fmtNum(as.metrics.reach)}</td>
                      <td className="px-3 py-3 text-right font-mono text-muted-foreground">{fmtNum(as.metrics.clicks)}</td>
                      <td className="px-3 py-3 text-right font-mono text-blue-400">{fmtNum(as.metrics.results)}</td>
                      <td className="px-3 py-3 text-right text-foreground">
                        {as.metrics.costPerResult > 0 ? `${fmtNum(as.metrics.costPerResult)}đ` : "—"}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-green-400">{fmtNum(as.metrics.messages)}</td>
                      <td className="px-3 py-3 text-right font-mono text-muted-foreground">
                        {as.metrics.rateMess > 0 ? `${as.metrics.rateMess.toFixed(1)}%` : "0%"}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-emerald-400">{as.metrics.ctr.toFixed(2)}%</td>
                      <td className="px-3 py-3 text-right text-foreground">
                        {as.metrics.cpc > 0 ? `${Math.round(as.metrics.cpc).toLocaleString("vi-VN")}đ` : "—"}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-muted-foreground">{fmtNum(as.metrics.cpm)}đ</td>
                    </tr>
                  ))}
                  {displayAdSets.length === 0 && (
                    <tr>
                      <td colSpan={16} className="text-center py-10 text-muted-foreground">
                        Không tìm thấy nhóm quảng cáo nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {activeTab === "ad" && (
              <table className="w-full text-[18px] text-foreground border-collapse">
                <thead>
                  <tr className="text-left text-muted-foreground text-[16px] uppercase border-b border-border bg-background">
                    <th className="px-3 py-3 font-medium text-center">Thao tác</th>
                    <th className="px-3 py-3 font-medium min-w-[200px]">Tên quảng cáo</th>
                    <th className="px-3 py-3 font-medium text-center">Ảnh</th>
                    <th className="px-3 py-3 font-medium">Nền tảng</th>
                    <th className="px-3 py-3 font-medium">Trạng thái</th>
                    <th className="px-3 py-3 font-medium text-right">Tổng chi tiêu</th>
                    <th className="px-3 py-3 font-medium text-right">Lượt hiển thị</th>
                    <th className="px-3 py-3 font-medium text-right">Tiếp cận</th>
                    <th className="px-3 py-3 font-medium text-right">Click</th>
                    <th className="px-3 py-3 font-medium text-right">Tin nhắn</th>
                    <th className="px-3 py-3 font-medium text-right">Tỉ lệ ra mess</th>
                    <th className="px-3 py-3 font-medium text-right">CTR</th>
                    <th className="px-3 py-3 font-medium text-right">CPC</th>
                    <th className="px-3 py-3 font-medium text-right">CPM</th>
                    <th className="px-3 py-3 font-medium">SKU</th>
                  </tr>
                </thead>
                <tbody>
                  {displayAds.slice(0, 150).map((ad) => {
                    const hash = hashString(ad.id);
                    return (
                      <tr key={ad.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                        <td className="px-3 py-3 text-center">
                          <button
                            disabled
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out opacity-60 ${
                              isRunning(ad.status) ? "bg-blue-600" : "bg-muted"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                isRunning(ad.status) ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-3 py-3 text-foreground font-medium max-w-[200px] truncate">
                          <CopyableText text={ad.name} />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className="w-8 h-8 rounded bg-muted border border-border flex items-center justify-center overflow-hidden mx-auto">
                            <span className="text-[14px] uppercase font-bold text-muted-foreground">AD{(hash % 9) + 1}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <PlatformBadge platform={ad.platform} />
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-[16px] px-2 py-0.5 rounded ${isRunning(ad.status) ? "bg-green-950/40 text-green-400" : "bg-card text-muted-foreground"}`}>
                            {ad.status ?? "—"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right font-medium text-foreground">{fmtNum(ad.metrics.spend)}đ</td>
                        <td className="px-3 py-3 text-right font-mono text-muted-foreground">{fmtNum(ad.metrics.impressions)}</td>
                        <td className="px-3 py-3 text-right font-mono text-muted-foreground">{fmtNum(ad.metrics.reach)}</td>
                        <td className="px-3 py-3 text-right font-mono text-muted-foreground">{fmtNum(ad.metrics.clicks)}</td>
                        <td className="px-3 py-3 text-right font-mono text-green-400">{fmtNum(ad.metrics.messages)}</td>
                        <td className="px-3 py-3 text-right font-mono text-muted-foreground">
                          {ad.metrics.rateMess > 0 ? `${ad.metrics.rateMess.toFixed(1)}%` : "0%"}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-emerald-400">{ad.metrics.ctr.toFixed(2)}%</td>
                        <td className="px-3 py-3 text-right text-foreground">
                          {ad.metrics.cpc > 0 ? `${Math.round(ad.metrics.cpc).toLocaleString("vi-VN")}đ` : "—"}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-muted-foreground">{fmtNum(ad.metrics.cpm)}đ</td>
                        <td className="px-3 py-3 font-mono text-xs text-yellow-500/90">{ad.sku}</td>
                      </tr>
                    );
                  })}
                  {displayAds.length === 0 && (
                    <tr>
                      <td colSpan={15} className="text-center py-10 text-muted-foreground">
                        Không tìm thấy quảng cáo nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground font-semibold">Tạo chiến dịch mới</h3>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-xs text-muted-foreground">Tài khoản</label>
              <select
                value={form.accountId}
                onChange={(e) => setForm({ ...form, accountId: e.target.value, objective: "" })}
                className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none"
              >
                <option value="">— Chọn tài khoản —</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.platform}] {a.name ?? a.id}
                  </option>
                ))}
              </select>

              <label className="text-xs text-muted-foreground">Tên chiến dịch</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none"
                placeholder="VD: Test - Remarketing"
              />

              <label className="text-xs text-muted-foreground">Mục tiêu</label>
              <select
                value={form.objective}
                onChange={(e) => setForm({ ...form, objective: e.target.value })}
                disabled={!selectedAccount}
                className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none disabled:opacity-50"
              >
                <option value="">— Mặc định —</option>
                {(OBJECTIVES[selectedAccount?.platform ?? ""] ?? []).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>

              <label className="text-xs text-muted-foreground">Ngân sách/ngày (đ, tuỳ chọn)</label>
              <input
                type="number"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none"
                placeholder="VD: 100000"
              />

              <p className="text-xs text-amber-400/80">⚠️ Chiến dịch tạo mới mặc định ở trạng thái TẮT (PAUSED) trên tài khoản thật.</p>

              <button
                onClick={submitCreate}
                disabled={creating || !form.accountId || !form.name}
                className="mt-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-foreground text-sm font-medium rounded-md"
              >
                {creating ? <SpinnerGap size={16} className="animate-spin" /> : <Plus size={16} weight="bold" />}
                Tạo (PAUSED)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


