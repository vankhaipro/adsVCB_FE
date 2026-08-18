"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, datesToQuery } from "@/lib/api";
import { presetToDates } from "@/components/DateRangePicker";

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

  const [rawCampaigns, setRawCampaigns] = useState<any[]>([]);
  // Danh mục mã gốc SKU -> tên sản phẩm (tĩnh, lấy từ Sapo OrderLineItem).
  const [skuCatalog, setSkuCatalog] = useState<{ sku: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const q = datesToQuery(from, to);
    setLoading(true);
    const fetchCamps = apiGet(`/mkt-api/campaigns/insights?${q}`).catch(() => []);
    const fetchCatalog = withSapo ? apiGet(`/sapo/sku-catalog`).catch(() => []) : Promise.resolve([]);

    Promise.all([fetchCamps, fetchCatalog])
      .then(([camps, catalog]) => {
        if (cancelled) return;
        setRawCampaigns(Array.isArray(camps) ? camps : []);
        setSkuCatalog(Array.isArray(catalog) ? catalog : []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [from, to, withSapo]);

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

  const filterState: TableFilterState = {
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
  };

  return {
    filteredCampaigns,
    skuCatalog,
    accountOptions,
    campaignOptions,
    pageOptions,
    teamOptions,
    loading,
    filterState,
  };
}
