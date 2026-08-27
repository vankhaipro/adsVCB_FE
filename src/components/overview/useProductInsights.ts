"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  meta: { catalogSize: number; teams: string[] };
  rows: ProductRow[];
  unmatched: Omit<ProductRow, "code" | "name" | "costPerMessage" | "costPerLike" | "hasAds" | "hasVideo">;
  totals: ProductTotals;
};

const EMPTY_ROWS: ProductRow[] = [];
const EMPTY_TEAMS: { id: string; name: string }[] = [];

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
  const [objectiveLabel, setObjectiveLabel] = useState("ALL");
  const [teams, setTeams] = useState<string[]>([]);

  // URLSearchParams chứ không nối chuỗi: nhãn có dấu tiếng Việt và khoảng trắng
  // ("Chuyển đổi web") bắt buộc phải được encode.
  const query = useMemo(() => {
    const params = new URLSearchParams(datesToQuery(from, to));
    if (objectiveLabel !== "ALL") params.set("objectiveLabel", objectiveLabel);
    // append chứ không set: BE nhận ?team=A&team=B rồi gom thành mảng.
    for (const t of teams) params.append("team", t);
    return params.toString();
  }, [from, to, objectiveLabel, teams]);

  // Lưu kèm query đã tạo ra dữ liệu, để suy ra "đang tải" thay vì setLoading(true)
  // ngay trong effect (gây cascading render). Cách này còn đúng hơn: ngay ở lần
  // render đổi bộ lọc đã là loading, không có nhịp hiện dữ liệu cũ với loading=false.
  const [result, setResult] = useState<{ query: string; data: ProductInsights | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiGet(`/mkt-api/insights/by-product?${query}`)
      .then((d) => {
        if (!cancelled) setResult({ query, data: d });
      })
      .catch(() => {
        if (!cancelled) setResult({ query, data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const loading = result?.query !== query;
  const data = result?.data ?? null;

  const rows = useMemo(() => data?.rows ?? EMPTY_ROWS, [data]);
  const unmatched = data?.unmatched ?? null;
  const totals = data?.totals ?? null;
  const videoRange = data?.videoRange ?? null;
  const teamOptions = useMemo(() => {
    if (!data?.meta?.teams) return EMPTY_TEAMS;
    return data.meta.teams
      .filter((t) => t !== "Không xác định" && !t.includes("Chưa khai báo"))
      .map((t) => ({ id: t, name: t }));
  }, [data]);

  const dateStateOnApply = useCallback((v: { presetId: string; from: string; to: string }) => {
    setPresetId(v.presetId);
    setFrom(v.from);
    setTo(v.to);
  }, []);

  return useMemo(
    () => ({
      rows,
      unmatched,
      totals,
      videoRange,
      teamOptions,
      loading,
      // Danh tính bộ lọc dạng chuỗi (chính là query gửi lên BE) — ProductTable dùng làm
      // mốc reset phân trang. Phải là nguyên thuỷ vì được so ngay trong thân render.
      filterKey: query,
      objectiveState: { value: objectiveLabel, onChange: setObjectiveLabel },
      teamState: { values: teams, onChange: setTeams },
      dateState: {
        presetId,
        from,
        to,
        onApply: dateStateOnApply,
      },
    }),
    [rows, unmatched, totals, videoRange, teamOptions, loading, query, objectiveLabel, teams, presetId, from, to, dateStateOnApply]
  );
}
