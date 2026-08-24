"use client";

import { useCallback, useEffect, useState } from "react";
import { SpinnerGap, MetaLogo, TiktokLogo } from "@phosphor-icons/react";
import { apiGet, fmtVnd } from "@/lib/api";
import DateRangePicker, { presetToDates } from "@/components/DateRangePicker";

type AdAccount = {
  id: string;
  platform: string;
  externalId: string;
  name: string | null;
  status: string | null;
  amountSpent: number; // trọn đời — KHÔNG dùng để hiển thị ở trang có lọc ngày
  spend: number; // chi tiêu trong kỳ đang chọn
  campaigns: number; // số CK có chi tiêu trong kỳ
  _count: { campaigns: number };
};

export default function AdAccountsPage() {
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("thisMonth");
  const [dateFrom, setDateFrom] = useState(() => presetToDates("thisMonth").from);
  const [dateTo, setDateTo] = useState(() => presetToDates("thisMonth").to);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAccounts(await apiGet(`/mkt-api/accounts?from=${dateFrom}&to=${dateTo}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    load();
  }, [load]);

  // Chỉ hiện tài khoản có tiêu tiền TRONG KỲ đang chọn. Tài khoản 0đ là đã ngừng dùng hoặc
  // chưa chạy gì trong kỳ — chúng chiếm chỗ trong lưới mà không mang thông tin gì.
  // Lọc theo `spend` (BE tính từ AdInsight cho cả 2 nền tảng), KHÔNG theo `amountSpent` vì
  // trường đó là tổng trọn đời và luôn = 0 với TikTok.
  const visible = accounts.filter((a) => a.spend > 0);
  const hiddenCount = accounts.length - visible.length;

  return (
    <div className="flex flex-col gap-5 w-full max-w-full overflow-x-hidden pb-10">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tài khoản quảng cáo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {visible.length} tài khoản có chi tiêu trong kỳ (Meta + TikTok) qua Pipeboard.
            {hiddenCount > 0 && ` Đã ẩn ${hiddenCount} tài khoản 0đ.`}
          </p>
        </div>
        <DateRangePicker
          presetId={dateRange}
          from={dateFrom}
          to={dateTo}
          onApply={({ presetId, from, to }) => {
            setDateRange(presetId);
            setDateFrom(from);
            setDateTo(to);
          }}
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm p-6">
          <SpinnerGap size={18} className="animate-spin" /> Đang tải…
        </div>
      ) : error ? (
        <div className="text-sm text-amber-400 bg-amber-950/30 border border-amber-900/40 rounded-md p-3">
          {error} — kiểm tra backend đã chạy.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((a) => {
            const meta = a.platform === "META";
            return (
              <div
                key={a.id}
                className={`bg-card border rounded-xl p-5 flex flex-col gap-3 ${
                  meta ? "border-blue-900/30" : "border-pink-900/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  {meta ? (
                    <MetaLogo size={28} weight="fill" className="text-blue-400" />
                  ) : (
                    <TiktokLogo size={28} weight="fill" className="text-pink-400" />
                  )}
                  <div className="min-w-0">
                    <div className="text-foreground font-semibold truncate" title={a.name ?? ""}>
                      {a.name ?? a.externalId}
                    </div>
                    <div className="text-xs text-muted-foreground">{meta ? "Meta Ads" : "TikTok Ads"}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Chiến dịch có chi tiêu</span>
                  <span className="text-foreground font-medium" title={`${a._count.campaigns} chiến dịch tổng cộng`}>
                    {a.campaigns} <span className="text-muted-foreground font-normal">/ {a._count.campaigns}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Chi tiêu trong kỳ</span>
                  <span className="text-foreground font-medium">{fmtVnd(a.spend)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
