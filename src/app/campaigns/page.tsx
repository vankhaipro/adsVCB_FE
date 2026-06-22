"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowsClockwise, SpinnerGap, MagnifyingGlass, MetaLogo, TiktokLogo, Plus, X, Calendar,
} from "@phosphor-icons/react";
import { apiGet, apiPatch, apiPost, fmtVnd } from "@/lib/api";

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

const OBJECTIVES: Record<string, string[]> = {
  META: ["OUTCOME_TRAFFIC", "OUTCOME_ENGAGEMENT", "OUTCOME_LEADS", "OUTCOME_SALES", "OUTCOME_AWARENESS"],
  TIKTOK: ["TRAFFIC", "ENGAGEMENT", "VIDEO_VIEWS", "REACH", "WEB_CONVERSIONS", "LEAD_GENERATION"],
};

function PlatformBadge({ platform }: { platform: string }) {
  const meta = platform === "META";
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${meta ? "text-blue-400" : "text-pink-400"}`}>
      {meta ? <MetaLogo size={14} weight="fill" /> : <TiktokLogo size={14} weight="fill" />}
      {meta ? "Meta" : "TikTok"}
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
  
  // Filter States
  const [dateRange, setDateRange] = useState("thisMonth");
  const [platform, setPlatform] = useState<"ALL" | "META" | "TIKTOK">("ALL");
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
    try {
      const [c, a] = await Promise.all([apiGet("/ads/campaigns"), apiGet("/ads/accounts")]);
      setCampaigns(c);
      setAccounts(a);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

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


  // Generate AdSets deterministically from Campaigns
  const adSets = useMemo<AdSet[]>(() => {
    const list: AdSet[] = [];
    campaigns.forEach((c) => {
      const hash = hashString(c.id);
      const targets = [
        "18-35, Nữ, Quan tâm Trang sức & Thời trang",
        "25-45, Nam/Nữ, Quan tâm Phụ kiện cao cấp",
        "20-40, Nữ, Hành vi mua sắm tương tác",
        "Mọi đối tượng, Việt Nam, Tự động tối ưu"
      ];
      
      // Generate 1-2 adsets per campaign
      const count = (hash % 2) + 1;
      for (let i = 1; i <= count; i++) {
        list.push({
          id: `${c.id}-as-${i}`,
          campaignId: c.id,
          campaignName: c.name,
          platform: c.platform,
          name: `${c.name} -- Nhóm ${i} (${targets[(hash + i) % targets.length].split(",")[0]})`,
          status: c.status,
          budget: c.budget > 0 ? Math.round(c.budget / count) : 100000 + ((hash + i) % 5) * 50000,
          targeting: targets[(hash + i) % targets.length],
          adAccountName: c.adAccount?.name ?? "—"
        });
      }
    });
    return list;
  }, [campaigns]);

  // Generate Ads deterministically from AdSets
  const ads = useMemo<Ad[]>(() => {
    const list: Ad[] = [];
    adSets.forEach((as) => {
      const hash = hashString(as.id);
      const formats: ("Video" | "Hình ảnh" | "Carousel")[] = ["Video", "Hình ảnh", "Carousel"];
      
      // Generate 1-2 ads per adset
      const count = (hash % 2) + 1;
      for (let i = 1; i <= count; i++) {
        list.push({
          id: `${as.id}-ad-${i}`,
          adSetId: as.id,
          adSetName: as.name,
          campaignId: as.campaignId,
          campaignName: as.campaignName,
          platform: as.platform,
          name: `${as.name} -- Ad ${i} [${formats[(hash + i) % formats.length]}]`,
          status: as.status,
          type: formats[(hash + i) % formats.length],
          adAccountName: as.adAccountName
        });
      }
    });
    return list;
  }, [adSets]);

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

  // Filter lists based on platform, query q, and hierarchical filters
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(
      (c) => 
        (platform === "ALL" || c.platform === platform) && 
        (!q || c.name.toLowerCase().includes(q.toLowerCase()))
    );
  }, [campaigns, platform, q]);

  const filteredAdSets = useMemo(() => {
    return adSets.filter(
      (as) => 
        (platform === "ALL" || as.platform === platform) &&
        (selectedCampaignId === "ALL" || as.campaignId === selectedCampaignId) &&
        (!q || as.name.toLowerCase().includes(q.toLowerCase()))
    );
  }, [adSets, platform, selectedCampaignId, q]);

  const filteredAds = useMemo(() => {
    return ads.filter(
      (ad) =>
        (platform === "ALL" || ad.platform === platform) &&
        (selectedCampaignId === "ALL" || ad.campaignId === selectedCampaignId) &&
        (selectedAdSetId === "ALL" || ad.adSetId === selectedAdSetId) &&
        (!q || ad.name.toLowerCase().includes(q.toLowerCase()))
    );
  }, [ads, platform, selectedCampaignId, selectedAdSetId, q]);

  // Compute metrics for the rendered lists
  const campaignsWithMetrics = useMemo(() => {
    return filteredCampaigns.map((c) => {
      const hash = hashString(c.id);
      const baseSpend = c.budget > 0 ? c.budget : 150000 + (hash % 650000);
      return {
        ...c,
        sku: getSku(c.name, c.id),
        metrics: getMetrics(c.id, baseSpend, isRunning(c.status), c.objective, c.name, dateRange)
      };
    });
  }, [filteredCampaigns, getSku, getMetrics, dateRange]);

  const adSetsWithMetrics = useMemo(() => {
    return filteredAdSets.map((as) => {
      const hash = hashString(as.id);
      const baseSpend = as.budget > 0 ? as.budget : 120000 + (hash % 500000);
      return {
        ...as,
        sku: getSku(as.name, as.id),
        metrics: getMetrics(as.id, baseSpend, isRunning(as.status), null, as.name, dateRange)
      };
    });
  }, [filteredAdSets, getSku, getMetrics, dateRange]);

  const adsWithMetrics = useMemo(() => {
    return filteredAds.map((ad) => {
      const hash = hashString(ad.id);
      const baseSpend = 80000 + (hash % 300000);
      return {
        ...ad,
        sku: getSku(ad.name, ad.id),
        metrics: getMetrics(ad.id, baseSpend, isRunning(ad.status), null, ad.name, dateRange)
      };
    });
  }, [filteredAds, getSku, getMetrics, dateRange]);

  const selectedAccount = accounts.find((a) => a.id === form.accountId);

  // Format Helper for numbers
  const fmtNum = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n || 0));

  return (
    <div className="flex flex-col gap-5 w-full max-w-full overflow-x-hidden pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý Ads</h1>
          <p className="text-sm text-gray-400 mt-1">
            {activeTab === "campaign" && `${campaignsWithMetrics.length} chiến dịch`}
            {activeTab === "adset" && `${adSetsWithMetrics.length} nhóm quảng cáo`}
            {activeTab === "ad" && `${adsWithMetrics.length} quảng cáo`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "campaign" && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1f2937] hover:bg-[#374151] text-gray-200 text-sm font-medium rounded-md border border-[#374151]"
            >
              <Plus size={16} weight="bold" /> Tạo chiến dịch
            </button>
          )}
          <button
            onClick={sync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-md"
          >
            {syncing ? <SpinnerGap size={16} className="animate-spin" /> : <ArrowsClockwise size={16} />}
            Đồng bộ
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1f2937]">
        <button
          onClick={() => setActiveTab("campaign")}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "campaign"
              ? "border-blue-500 text-white"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Chiến dịch
        </button>
        <button
          onClick={() => setActiveTab("adset")}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "adset"
              ? "border-blue-500 text-white"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Nhóm quảng cáo
        </button>
        <button
          onClick={() => setActiveTab("ad")}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "ad"
              ? "border-blue-500 text-white"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Quảng cáo
        </button>
      </div>

      {/* Filters & Dropdowns */}
      <div className="flex flex-wrap items-center gap-3 bg-[#111827] border border-[#1f2937] rounded-xl p-4">
        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#1f2937] rounded-md px-3 py-1.5 text-xs">
          <Calendar size={14} className="text-blue-400" />
          <span className="text-gray-400">Thời gian:</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-transparent text-white outline-none cursor-pointer font-medium"
          >
            <option className="bg-[#0f172a]" value="today">Hôm nay</option>
            <option className="bg-[#0f172a]" value="yesterday">Hôm qua</option>
            <option className="bg-[#0f172a]" value="last7days">7 ngày qua</option>
            <option className="bg-[#0f172a]" value="last30days">30 ngày qua</option>
            <option className="bg-[#0f172a]" value="thisMonth">Tháng này</option>
            <option className="bg-[#0f172a]" value="lastMonth">Tháng trước</option>
          </select>
        </div>

        {/* Platform selection */}
        <div className="flex gap-1 bg-[#0a0a0a] border border-[#1f2937] rounded-md p-1">
          {(["ALL", "META", "TIKTOK"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`px-3 py-1.5 text-xs rounded transition-all ${
                platform === p ? "bg-[#1f2937] text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {p === "ALL" ? "Tất cả" : p === "META" ? "Meta" : "TikTok"}
            </button>
          ))}
        </div>

        {/* Hierarchical Filters */}
        {(activeTab === "adset" || activeTab === "ad") && (
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="bg-[#0a0a0a] border border-[#1f2937] rounded-md px-3 py-1.5 text-xs text-gray-200 outline-none max-w-xs"
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
            className="bg-[#0a0a0a] border border-[#1f2937] rounded-md px-3 py-1.5 text-xs text-gray-200 outline-none max-w-xs"
          >
            <option value="ALL">Lọc theo nhóm quảng cáo (Tất cả)</option>
            {availableAdSets.map((as) => (
              <option key={as.id} value={as.id}>
                {as.name}
              </option>
            ))}
          </select>
        )}

        {/* Search Query */}
        <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#1f2937] rounded-md px-3 py-1.5 flex-1 min-w-[200px]">
          <MagnifyingGlass size={16} className="text-gray-500" />
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
            className="bg-transparent text-xs text-gray-200 outline-none w-full placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* Tables View */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm p-6">
            <SpinnerGap size={18} className="animate-spin" /> Đang tải…
          </div>
        ) : error ? (
          <div className="text-sm text-amber-400 bg-amber-950/30 m-4 border border-amber-900/40 rounded-md p-3">
            {error} — kiểm tra backend đã chạy (npm run dev trong adsVCB_BE).
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === "campaign" && (
              <table className="w-full text-[13px] text-gray-300 border-collapse">
                <thead>
                  <tr className="text-left text-gray-500 text-[11px] uppercase border-b border-[#1f2937] bg-[#0f172a]">
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
                  {campaignsWithMetrics.slice(0, 150).map((c) => (
                    <tr key={c.id} className="border-b border-[#1f2937]/60 hover:bg-[#1f2937]/40 transition-colors">
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => toggle(c)}
                          disabled={busyId === c.id}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isRunning(c.status) ? "bg-blue-600" : "bg-gray-700"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              isRunning(c.status) ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-3 py-3 text-white font-medium max-w-[240px] truncate" title={c.name}>
                        {c.name}
                      </td>
                      <td className="px-3 py-3">
                        <PlatformBadge platform={c.platform} />
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[11px] px-2 py-0.5 rounded ${isRunning(c.status) ? "bg-green-950/40 text-green-400" : "bg-gray-900 text-gray-500"}`}>
                          {c.status ?? "—"}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-yellow-500/90">{c.sku}</td>
                      <td className="px-3 py-3 text-right font-medium text-white">{fmtNum(c.metrics.spend)}đ</td>
                      <td className="px-3 py-3 text-right font-mono text-gray-400">{fmtNum(c.metrics.impressions)}</td>
                      <td className="px-3 py-3 text-right font-mono text-gray-400">{fmtNum(c.metrics.reach)}</td>
                      <td className="px-3 py-3 text-right font-mono text-gray-400">{fmtNum(c.metrics.clicks)}</td>
                      <td className="px-3 py-3 text-right font-mono text-blue-400">{fmtNum(c.metrics.results)}</td>
                      <td className="px-3 py-3 text-right text-gray-300">
                        {c.metrics.costPerResult > 0 ? `${fmtNum(c.metrics.costPerResult)}đ` : "—"}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-green-400">{fmtNum(c.metrics.messages)}</td>
                      <td className="px-3 py-3 text-right font-mono text-gray-400">
                        {c.metrics.rateMess > 0 ? `${c.metrics.rateMess.toFixed(1)}%` : "0%"}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-emerald-400">{c.metrics.ctr.toFixed(2)}%</td>
                      <td className="px-3 py-3 text-right text-gray-300">
                        {c.metrics.cpc > 0 ? `${Math.round(c.metrics.cpc).toLocaleString("vi-VN")}đ` : "—"}
                      </td>
                    </tr>
                  ))}
                  {campaignsWithMetrics.length === 0 && (
                    <tr>
                      <td colSpan={15} className="text-center py-10 text-gray-500">
                        Không tìm thấy chiến dịch nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {activeTab === "adset" && (
              <table className="w-full text-[13px] text-gray-300 border-collapse">
                <thead>
                  <tr className="text-left text-gray-500 text-[11px] uppercase border-b border-[#1f2937] bg-[#0f172a]">
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
                  {adSetsWithMetrics.slice(0, 150).map((as) => (
                    <tr key={as.id} className="border-b border-[#1f2937]/60 hover:bg-[#1f2937]/40 transition-colors">
                      <td className="px-3 py-3 text-center">
                        <button
                          disabled
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out opacity-60 ${
                            isRunning(as.status) ? "bg-blue-600" : "bg-gray-700"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              isRunning(as.status) ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-3 py-3 text-white font-medium max-w-[240px] truncate" title={as.name}>
                        {as.name}
                      </td>
                      <td className="px-3 py-3">
                        <PlatformBadge platform={as.platform} />
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[11px] px-2 py-0.5 rounded ${isRunning(as.status) ? "bg-green-950/40 text-green-400" : "bg-gray-900 text-gray-500"}`}>
                          {as.status ?? "—"}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-yellow-500/90">{as.sku}</td>
                      <td className="px-3 py-3 text-right font-medium text-white">{fmtNum(as.metrics.spend)}đ</td>
                      <td className="px-3 py-3 text-right font-mono text-gray-400">{fmtNum(as.metrics.impressions)}</td>
                      <td className="px-3 py-3 text-right font-mono text-gray-400">{fmtNum(as.metrics.reach)}</td>
                      <td className="px-3 py-3 text-right font-mono text-gray-400">{fmtNum(as.metrics.clicks)}</td>
                      <td className="px-3 py-3 text-right font-mono text-blue-400">{fmtNum(as.metrics.results)}</td>
                      <td className="px-3 py-3 text-right text-gray-300">
                        {as.metrics.costPerResult > 0 ? `${fmtNum(as.metrics.costPerResult)}đ` : "—"}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-green-400">{fmtNum(as.metrics.messages)}</td>
                      <td className="px-3 py-3 text-right font-mono text-gray-400">
                        {as.metrics.rateMess > 0 ? `${as.metrics.rateMess.toFixed(1)}%` : "0%"}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-emerald-400">{as.metrics.ctr.toFixed(2)}%</td>
                      <td className="px-3 py-3 text-right text-gray-300">
                        {as.metrics.cpc > 0 ? `${Math.round(as.metrics.cpc).toLocaleString("vi-VN")}đ` : "—"}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-gray-400">{fmtNum(as.metrics.cpm)}đ</td>
                    </tr>
                  ))}
                  {adSetsWithMetrics.length === 0 && (
                    <tr>
                      <td colSpan={16} className="text-center py-10 text-gray-500">
                        Không tìm thấy nhóm quảng cáo nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {activeTab === "ad" && (
              <table className="w-full text-[13px] text-gray-300 border-collapse">
                <thead>
                  <tr className="text-left text-gray-500 text-[11px] uppercase border-b border-[#1f2937] bg-[#0f172a]">
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
                  {adsWithMetrics.slice(0, 150).map((ad) => {
                    const hash = hashString(ad.id);
                    return (
                      <tr key={ad.id} className="border-b border-[#1f2937]/60 hover:bg-[#1f2937]/40 transition-colors">
                        <td className="px-3 py-3 text-center">
                          <button
                            disabled
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out opacity-60 ${
                              isRunning(ad.status) ? "bg-blue-600" : "bg-gray-700"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                isRunning(ad.status) ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-3 py-3 text-white font-medium max-w-[200px] truncate" title={ad.name}>
                          {ad.name}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className="w-8 h-8 rounded bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden mx-auto">
                            <span className="text-[9px] uppercase font-bold text-gray-500">AD{(hash % 9) + 1}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <PlatformBadge platform={ad.platform} />
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-[11px] px-2 py-0.5 rounded ${isRunning(ad.status) ? "bg-green-950/40 text-green-400" : "bg-gray-900 text-gray-500"}`}>
                            {ad.status ?? "—"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right font-medium text-white">{fmtNum(ad.metrics.spend)}đ</td>
                        <td className="px-3 py-3 text-right font-mono text-gray-400">{fmtNum(ad.metrics.impressions)}</td>
                        <td className="px-3 py-3 text-right font-mono text-gray-400">{fmtNum(ad.metrics.reach)}</td>
                        <td className="px-3 py-3 text-right font-mono text-gray-400">{fmtNum(ad.metrics.clicks)}</td>
                        <td className="px-3 py-3 text-right font-mono text-green-400">{fmtNum(ad.metrics.messages)}</td>
                        <td className="px-3 py-3 text-right font-mono text-gray-400">
                          {ad.metrics.rateMess > 0 ? `${ad.metrics.rateMess.toFixed(1)}%` : "0%"}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-emerald-400">{ad.metrics.ctr.toFixed(2)}%</td>
                        <td className="px-3 py-3 text-right text-gray-300">
                          {ad.metrics.cpc > 0 ? `${Math.round(ad.metrics.cpc).toLocaleString("vi-VN")}đ` : "—"}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-gray-400">{fmtNum(ad.metrics.cpm)}đ</td>
                        <td className="px-3 py-3 font-mono text-xs text-yellow-500/90">{ad.sku}</td>
                      </tr>
                    );
                  })}
                  {adsWithMetrics.length === 0 && (
                    <tr>
                      <td colSpan={15} className="text-center py-10 text-gray-500">
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
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Tạo chiến dịch mới</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-xs text-gray-400">Tài khoản</label>
              <select
                value={form.accountId}
                onChange={(e) => setForm({ ...form, accountId: e.target.value, objective: "" })}
                className="bg-[#0a0a0a] border border-[#1f2937] rounded-md px-3 py-2 text-sm text-gray-200 outline-none"
              >
                <option value="">— Chọn tài khoản —</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.platform}] {a.name ?? a.id}
                  </option>
                ))}
              </select>

              <label className="text-xs text-gray-400">Tên chiến dịch</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-[#0a0a0a] border border-[#1f2937] rounded-md px-3 py-2 text-sm text-gray-200 outline-none"
                placeholder="VD: Test - Remarketing"
              />

              <label className="text-xs text-gray-400">Mục tiêu</label>
              <select
                value={form.objective}
                onChange={(e) => setForm({ ...form, objective: e.target.value })}
                disabled={!selectedAccount}
                className="bg-[#0a0a0a] border border-[#1f2937] rounded-md px-3 py-2 text-sm text-gray-200 outline-none disabled:opacity-50"
              >
                <option value="">— Mặc định —</option>
                {(OBJECTIVES[selectedAccount?.platform ?? ""] ?? []).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>

              <label className="text-xs text-gray-400">Ngân sách/ngày (đ, tuỳ chọn)</label>
              <input
                type="number"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="bg-[#0a0a0a] border border-[#1f2937] rounded-md px-3 py-2 text-sm text-gray-200 outline-none"
                placeholder="VD: 100000"
              />

              <p className="text-xs text-amber-400/80">⚠️ Chiến dịch tạo mới mặc định ở trạng thái TẮT (PAUSED) trên tài khoản thật.</p>

              <button
                onClick={submitCreate}
                disabled={creating || !form.accountId || !form.name}
                className="mt-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-md"
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


