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
  onDateApply: (v: { presetId: string; from: string; to: string }) => void;
  onAccountChange: (id: string) => void;
  onCampaignChange: (id: string) => void;
}

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

  const [rawCampaigns, setRawCampaigns] = useState<any[]>([]);
  const [sapoSkus, setSapoSkus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const q = datesToQuery(from, to);
    setLoading(true);
    const jobs: Promise<any>[] = [apiGet(`/mkt-api/campaigns/insights?${q}`)];
    if (withSapo) jobs.push(apiGet(`/sapo/revenue/by-sku?${q}&limit=50`));

    Promise.all(jobs)
      .then(([camps, skus]) => {
        if (cancelled) return;
        setRawCampaigns(Array.isArray(camps) ? camps : []);
        if (withSapo) setSapoSkus(Array.isArray(skus) ? skus : []);
      })
      .catch(() => {
        if (cancelled) return;
        setRawCampaigns([]);
        if (withSapo) setSapoSkus([]);
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

  // Lọc phía client theo tài khoản (theo name) + chiến dịch (theo id).
  const filteredCampaigns = useMemo(() => {
    return rawCampaigns.filter((c) => {
      if (accountId !== "ALL" && c.adAccount?.name !== accountId) return false;
      if (campaignId !== "ALL" && c.id !== campaignId) return false;
      return true;
    });
  }, [rawCampaigns, accountId, campaignId]);

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
    onDateApply,
    onAccountChange: setAccountId,
    onCampaignChange: setCampaignId,
  };

  return {
    filteredCampaigns,
    sapoSkus,
    accountOptions,
    campaignOptions,
    loading,
    filterState,
  };
}
