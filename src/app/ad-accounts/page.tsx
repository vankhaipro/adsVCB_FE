"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowsClockwise, SpinnerGap, MetaLogo, TiktokLogo } from "@phosphor-icons/react";
import { apiGet, fmtVnd } from "@/lib/api";

type AdAccount = {
  id: string;
  platform: string;
  externalId: string;
  name: string | null;
  status: string | null;
  amountSpent: number;
  _count: { campaigns: number };
};

export default function AdAccountsPage() {
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAccounts(await apiGet("/ads/accounts"));
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

  return (
    <div className="flex flex-col gap-5 w-full max-w-full overflow-x-hidden pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Tài khoản quảng cáo</h1>
          <p className="text-sm text-gray-400 mt-1">
            {accounts.length} tài khoản (Meta + TikTok) qua Pipeboard.
          </p>
        </div>
        <button
          onClick={sync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-md transition-colors"
        >
          {syncing ? <SpinnerGap size={16} className="animate-spin" /> : <ArrowsClockwise size={16} />}
          Đồng bộ
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm p-6">
          <SpinnerGap size={18} className="animate-spin" /> Đang tải…
        </div>
      ) : error ? (
        <div className="text-sm text-amber-400 bg-amber-950/30 border border-amber-900/40 rounded-md p-3">
          {error} — kiểm tra backend đã chạy.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((a) => {
            const meta = a.platform === "META";
            return (
              <div
                key={a.id}
                className={`bg-[#111827] border rounded-xl p-5 flex flex-col gap-3 ${
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
                    <div className="text-white font-semibold truncate" title={a.name ?? ""}>
                      {a.name ?? a.externalId}
                    </div>
                    <div className="text-xs text-gray-500">{meta ? "Meta Ads" : "TikTok Ads"}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Chiến dịch</span>
                  <span className="text-gray-200 font-medium">{a._count.campaigns}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Đã chi tiêu</span>
                  <span className="text-gray-200 font-medium">{fmtVnd(a.amountSpent)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
