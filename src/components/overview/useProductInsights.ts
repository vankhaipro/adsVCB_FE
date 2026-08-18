"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, datesToQuery } from "@/lib/api";
import { presetToDates } from "@/components/DateRangePicker";

export type ProductRow = {
  code: string;
  name: string;
  videos: number;
  videoViews: number;
  organicComments: number;
  campaigns: number;
  spend: number;
  likes: number;
  messages: number;
  comments: number;
  costPerMessage: number;
  costPerLike: number;
  hasAds: boolean;
  hasVideo: boolean;
};

export type ProductTotals = Omit<ProductRow, "code" | "name" | "costPerMessage" | "costPerLike" | "hasAds" | "hasVideo" | "videoViews"> & {
  codes: number;
};

type ProductInsights = {
  range: { from: string; to: string };
  videoRange: { from: string; to: string };
  meta: { catalogSize: number };
  rows: ProductRow[];
  unmatched: Omit<ProductRow, "code" | "name" | "costPerMessage" | "costPerLike" | "hasAds" | "hasVideo">;
  totals: ProductTotals;
};

// Dữ liệu cho bảng "Hiệu quả theo sản phẩm".
//
// Cố ý KHÔNG dùng useTableInsights: hook đó dựng accountOptions với id = tên tài khoản (vì
// /mkt-api/campaigns/insights không trả account id), trong khi BE lọc theo adAccountId —
// truyền xuống endpoint này sẽ luôn ra rỗng mà không báo lỗi. Ngoài ra dữ liệu video không
// có trong endpoint đó, và sau khi BE đã gộp theo sản phẩm thì không lọc client được nữa.
export function useProductInsights() {
  const initial = useMemo(() => presetToDates("thisMonth"), []);
  const [presetId, setPresetId] = useState("thisMonth");
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);

  const [data, setData] = useState<ProductInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiGet(`/mkt-api/insights/by-product?${datesToQuery(from, to)}`)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  return {
    rows: data?.rows ?? [],
    unmatched: data?.unmatched ?? null,
    totals: data?.totals ?? null,
    videoRange: data?.videoRange ?? null,
    loading,
    dateState: {
      presetId,
      from,
      to,
      onApply: (v: { presetId: string; from: string; to: string }) => {
        setPresetId(v.presetId);
        setFrom(v.from);
        setTo(v.to);
      },
    },
  };
}
