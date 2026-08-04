"use client";

import { useMemo } from "react";
import DateRangePicker from "@/components/DateRangePicker";
import FilterDropdown, { type FilterPill } from "./FilterDropdown";
import type { TableFilterState } from "./useTableInsights";

interface TableFilterBarProps extends TableFilterState {
  accountOptions: { id: string; name: string }[];
  campaignOptions: { id: string; name: string }[];
  // Bỏ trống thì không hiện dropdown Kênh (bảng SKU không cần).
  pageOptions?: { id: string; name: string }[];
}

// Thanh lọc dùng chung cho các bảng ở Tổng quan: ngày / chiến dịch / tài khoản QC / kênh.
export default function TableFilterBar({
  presetId,
  from,
  to,
  onDateApply,
  accountId,
  onAccountChange,
  accountOptions,
  campaignId,
  onCampaignChange,
  campaignOptions,
  pageName,
  onPageNameChange,
  pageOptions,
}: TableFilterBarProps) {
  const campaignPills = useMemo<FilterPill[]>(
    () => campaignOptions.map((o) => ({ id: o.id, label: o.name })),
    [campaignOptions],
  );
  const accountPills = useMemo<FilterPill[]>(
    () => accountOptions.map((o) => ({ id: o.id, label: o.name })),
    [accountOptions],
  );
  const pagePills = useMemo<FilterPill[]>(
    () => (pageOptions ?? []).map((o) => ({ id: o.id, label: o.name })),
    [pageOptions],
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DateRangePicker presetId={presetId} from={from} to={to} onApply={onDateApply} />
      <FilterDropdown label="Chiến dịch:" items={campaignPills} value={campaignId} onChange={onCampaignChange} searchable />
      <FilterDropdown label="Tài khoản:" items={accountPills} value={accountId} onChange={onAccountChange} searchable />
      {pageOptions && (
        <FilterDropdown label="Kênh:" items={pagePills} value={pageName} onChange={onPageNameChange} searchable />
      )}
    </div>
  );
}
