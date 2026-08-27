"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, datesToQuery } from "@/lib/api";
import { presetToDates } from "@/components/DateRangePicker";

// Một dòng insight chiến dịch từ /mkt-api/campaigns/insights.
// Khớp đúng object mà ads.service.ts#getCampaignsWithInsights dựng: các chỉ số luôn
// có mặt (BE gán từ tổng đã tính, mặc định 0) nên để non-optional.
export interface CampaignInsight {
  id: string;
  name: string;
  platform: string;
  status: string;
  budget: number;
  budgetMode?: string | null;
  adAccount?: { name?: string } | null;
  channel: string;
  objective: string | null;
  objectiveLabel: string;
  team: string;
  staff: string;
  contentLine: string;
  pageName: string;
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
  messages: number;
  likes: number;
  comments: number;
  conversions: number;
  revenue: number;
  ordersCount: number;
  ctr: number;
  cpc: number;
  cpm: number;
  cpa: number;
  roas: number;
  frequency: number;
  createdTime: number;
  /** BE hiện KHÔNG trả field này — cột "Chia sẻ" ở CampaignTable luôn rỗng. */
  shares?: number;
}

export interface TableFilterState {
  presetId: string;
  from: string;
  to: string;
  accountId: string;
  campaignId: string;
  pageName: string;
  objectiveLabel: string;
  /** Mảng rỗng = không lọc. Đa chọn vì team gộp nhóm theo nhiều chiều (thị trường / ngành). */
  teams: string[];
  keyword: string;
  onDateApply: (v: { presetId: string; from: string; to: string }) => void;
  onAccountChange: (id: string) => void;
  onCampaignChange: (id: string) => void;
  onPageNameChange: (v: string) => void;
  onObjectiveLabelChange: (v: string) => void;
  onTeamsChange: (v: string[]) => void;
  onKeywordChange: (v: string) => void;
}

// Danh sách HIỂN THỊ cho dropdown mục tiêu. Phải khớp CAMPAIGN_OBJECTIVE_LABELS ở
// adsVCB_BE/src/lib/campaign-objective.ts — đây chỉ là nhãn để render, LUẬT phân loại chỉ
// tồn tại ở BE và về FE qua field `objectiveLabel` của mỗi campaign.
// 'Khác' cố ý không có trong danh sách: hiện không campaign nào rơi vào đó.
export const OBJECTIVE_LABELS = [
  "Mess", "Like page", "Follow", "Chuyển đổi web", "Tương tác",
] as const;

interface UseTableInsightsOptions {
  withSapo?: boolean;
}

const EMPTY_CAMPAIGNS: CampaignInsight[] = [];
const EMPTY_CATALOG: { sku: string; name: string }[] = [];

// Hook độc lập cho từng bảng ở Tổng quan: tự quản lý bộ lọc (ngày/tài khoản/chiến dịch)
// và tự fetch dữ liệu insight campaign (+ Sapo SKU nếu cần). Ngày lọc bằng cách gọi lại API;
// tài khoản và chiến dịch lọc phía client trên mảng đã tải.
export function useTableInsights({ withSapo = false }: UseTableInsightsOptions = {}) {
  const initial = useMemo(() => presetToDates("thisMonth"), []);

  const [presetId, setPresetId] = useState("thisMonth");
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [accountId, setAccountId] = useState("ALL");
  const [campaignId, setCampaignId] = useState("ALL");
  // Kênh = Fanpage/kênh mà quảng cáo chạy trên đó (cột "Kênh" của bảng chiến dịch).
  const [pageName, setPageName] = useState("ALL");
  const [objectiveLabel, setObjectiveLabel] = useState("ALL");
  const [teams, setTeams] = useState<string[]>([]);
  const [keyword, setKeyword] = useState("");

  // Gộp dữ liệu tải về vào MỘT state kèm khoá đã sinh ra nó. "Đang tải" được suy ra
  // bằng cách so khoá, thay vì gọi setLoading(true) ngay trong effect (cascading render).
  const fetchKey = `${datesToQuery(from, to)}|${withSapo}`;
  const [result, setResult] = useState<{
    key: string;
    campaigns: CampaignInsight[];
    catalog: { sku: string; name: string }[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const q = datesToQuery(from, to);
    const fetchCamps = apiGet(`/mkt-api/campaigns/insights?${q}`).catch(() => []);
    const fetchCatalog = withSapo ? apiGet(`/sapo/sku-catalog`).catch(() => []) : Promise.resolve([]);

    Promise.all([fetchCamps, fetchCatalog]).then(([camps, catalog]) => {
      if (cancelled) return;
      setResult({
        key: fetchKey,
        campaigns: Array.isArray(camps) ? camps : [],
        catalog: Array.isArray(catalog) ? catalog : [],
      });
    });

    return () => {
      cancelled = true;
    };
  }, [from, to, withSapo, fetchKey]);

  const loading = result?.key !== fetchKey;
  const rawCampaigns = useMemo(() => result?.campaigns ?? EMPTY_CAMPAIGNS, [result]);
  const skuCatalog = useMemo(() => result?.catalog ?? EMPTY_CATALOG, [result]);

  // Danh sách tài khoản QC lấy từ dữ liệu đã tải. Endpoint chỉ trả adAccount.name (không có id),
  // nên dùng name làm khoá lọc (đủ duy nhất theo từng tài khoản, và cũng là giá trị đang hiển thị).
  const accountOptions = useMemo(() => {
    const set = new Set<string>();
    for (const c of rawCampaigns) {
      const accName = c.adAccount?.name;
      if (accName) set.add(accName);
    }
    return Array.from(set).map((name) => ({ id: name, name }));
  }, [rawCampaigns]);

  // Danh sách chiến dịch cho dropdown.
  const campaignOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of rawCampaigns) {
      if (c.id) map.set(c.id, c.name || c.id);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [rawCampaigns]);

  // Danh sách Team cho dropdown — suy từ chính dữ liệu đang tải nên chỉ hiện team thực sự
  // có chiến dịch trong khoảng ngày, thay vì liệt kê cả những nhóm "Chưa khai báo" 0đ.
  const teamOptions = useMemo(() => {
    const set = new Set<string>();
    for (const c of rawCampaigns) if (c.team && c.team !== "Không xác định" && !c.team.includes("Chưa khai báo")) set.add(c.team);
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b, "vi"))
      .map((t) => ({ id: t, name: t }));
  }, [rawCampaigns]);

  // Danh sách kênh/Fanpage cho dropdown — cùng giá trị đang hiển thị ở cột "Kênh".
  const pageOptions = useMemo(() => {
    const set = new Set<string>();
    for (const c of rawCampaigns) {
      const p = c.pageName || c.channel;
      if (p) set.add(p);
    }
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b, "vi"))
      .map((name) => ({ id: name, name }));
  }, [rawCampaigns]);

  // Lọc phía client theo tài khoản (theo name) + chiến dịch (theo id) + kênh + từ khoá.
  const filteredCampaigns = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return rawCampaigns.filter((c) => {
      if (accountId !== "ALL" && c.adAccount?.name !== accountId) return false;
      if (campaignId !== "ALL" && c.id !== campaignId) return false;
      if (pageName !== "ALL" && (c.pageName || c.channel) !== pageName) return false;
      if (objectiveLabel !== "ALL" && c.objectiveLabel !== objectiveLabel) return false;
      if (teams.length > 0 && !teams.includes(c.team)) return false;
      if (kw) {
        // Tìm trên tên chiến dịch + kênh, đủ để bắt cả mã SKU nằm cuối tên campaign.
        const hay = `${c.name || ""} ${c.pageName || ""} ${c.channel || ""}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }, [rawCampaigns, accountId, campaignId, pageName, objectiveLabel, teams, keyword]);

  const onDateApply = useCallback(
    (v: { presetId: string; from: string; to: string }) => {
      setPresetId(v.presetId);
      setFrom(v.from);
      setTo(v.to);
    },
    [],
  );

  const filterState: TableFilterState = useMemo(
    () => ({
      presetId,
      from,
      to,
      accountId,
      campaignId,
      pageName,
      objectiveLabel,
      teams,
      keyword,
      onDateApply,
      onAccountChange: setAccountId,
      onCampaignChange: setCampaignId,
      onPageNameChange: setPageName,
      onObjectiveLabelChange: setObjectiveLabel,
      onTeamsChange: setTeams,
      onKeywordChange: setKeyword,
    }),
    [presetId, from, to, accountId, campaignId, pageName, objectiveLabel, teams, keyword, onDateApply]
  );

  // Danh tính bộ lọc dưới dạng CHUỖI, để bảng dùng làm mốc reset phân trang.
  // Bắt buộc là giá trị nguyên thuỷ: các bảng so khoá này ngay trong thân render, so bằng
  // tham chiếu mảng/đối tượng sẽ lặp vô hạn khi tham chiếu đổi mỗi lần render.
  const filterKey = useMemo(
    () => [from, to, accountId, campaignId, pageName, objectiveLabel, keyword, teams.join(",")].join("|"),
    [from, to, accountId, campaignId, pageName, objectiveLabel, keyword, teams],
  );

  return useMemo(
    () => ({
      filteredCampaigns,
      skuCatalog,
      accountOptions,
      campaignOptions,
      pageOptions,
      teamOptions,
      loading,
      filterState,
      filterKey,
    }),
    [filteredCampaigns, skuCatalog, accountOptions, campaignOptions, pageOptions, teamOptions, loading, filterState, filterKey]
  );
}
