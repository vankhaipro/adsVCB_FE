"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowsClockwise, Plus, SpinnerGap, WarningCircle, MetaLogo, TiktokLogo } from "@phosphor-icons/react";
import { apiGet, fmtVnd } from "@/lib/api";

type Overview = {
  totalCampaigns: number;
  runningCampaigns: number;
  totalAccounts: number;
  totalSpent: number;
};
type Campaign = {
  id: string;
  platform: string;
  name: string;
  status: string | null;
  budget: number;
  adAccount: { name: string | null } | null;
};

const RUNNING = new Set(["ACTIVE", "ENABLE"]);

export default function OverviewPage() {
  const [ov, setOv] = useState<Overview | null>(null);
  const [running, setRunning] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [o, camps] = await Promise.all([apiGet("/ads/overview"), apiGet("/ads/campaigns")]);
      setOv(o);
      setRunning((camps as Campaign[]).filter((c) => c.status && RUNNING.has(c.status)).slice(0, 6));
    } catch {
      /* backend chưa chạy */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async () => {
    setSyncing(true);
    try {
      await apiGet("/ads/sync");
      await load();
    } finally {
      setSyncing(false);
    }
  };

  const kpis = [
    { label: "Tổng chi tiêu", value: ov ? fmtVnd(ov.totalSpent) : "—", color: "blue" },
    { label: "Tổng chiến dịch", value: ov ? ov.totalCampaigns.toLocaleString("vi-VN") : "—", color: "green" },
    { label: "Tài khoản quảng cáo", value: ov ? String(ov.totalAccounts) : "—", color: "purple" },
    { label: "Đang chạy", value: ov ? `${ov.runningCampaigns} / ${ov.totalCampaigns}` : "—", color: "orange" },
  ];
  const colorMap: Record<string, string> = {
    blue: "border-blue-900/30 text-blue-400 from-blue-900/20",
    green: "border-green-900/30 text-green-400 from-green-900/20",
    purple: "border-purple-900/30 text-purple-400 from-purple-900/20",
    orange: "border-orange-900/30 text-orange-400 from-orange-900/20",
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-x-hidden pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Tổng quan</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-[#1f2937] hover:bg-[#374151] disabled:opacity-60 text-gray-200 text-sm font-medium rounded-md transition-colors border border-[#374151]"
          >
            {syncing ? <SpinnerGap size={16} className="animate-spin" /> : <ArrowsClockwise size={16} />}
            Làm mới dữ liệu
          </button>
          <Link
            href="/auto-rules"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-lg shadow-blue-500/20"
          >
            <Plus size={16} weight="bold" />
            Tạo quy tắc mới
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className={`bg-[#111827] border rounded-xl p-4 flex flex-col relative overflow-hidden ${colorMap[k.color].split(" ")[0]}`}
          >
            <div className={`absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t ${colorMap[k.color].split(" ")[2]} to-transparent pointer-events-none`} />
            <span className={`text-sm font-medium mb-2 ${colorMap[k.color].split(" ")[1]}`}>{k.label}</span>
            <div className="text-2xl font-bold text-white">{loading ? "…" : k.value}</div>
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Running campaigns (real) */}
        <div className="lg:col-span-2 bg-[#111827] border border-[#1f2937] rounded-xl flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-[#1f2937]">
            <h2 className="text-base font-semibold text-white">Chiến dịch đang chạy</h2>
            <Link href="/campaigns" className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1.5">
              Xem tất cả
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-xs text-gray-500 uppercase border-b border-[#1f2937]">
                <tr>
                  <th className="px-4 py-3 font-medium">Chiến dịch</th>
                  <th className="px-4 py-3 font-medium">Nền tảng</th>
                  <th className="px-4 py-3 font-medium">Tài khoản</th>
                  <th className="px-4 py-3 font-medium text-right">Ngân sách</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]">
                {running.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500 text-sm">
                      {loading ? "Đang tải…" : "Chưa có chiến dịch đang chạy. Bấm “Làm mới dữ liệu”."}
                    </td>
                  </tr>
                ) : (
                  running.map((c) => (
                    <tr key={c.id} className="hover:bg-[#1f2937]/50">
                      <td className="px-4 py-3 max-w-[280px] truncate text-gray-200" title={c.name}>
                        {c.name}
                      </td>
                      <td className="px-4 py-3">
                        {c.platform === "META" ? (
                          <MetaLogo size={16} weight="fill" className="text-blue-400" />
                        ) : (
                          <TiktokLogo size={16} weight="fill" className="text-pink-400" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 max-w-[160px] truncate">{c.adAccount?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-300 text-right">{c.budget > 0 ? fmtVnd(c.budget) : "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: schedule + alerts (sẽ wire ở Phase 4) */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl flex flex-col flex-1">
            <div className="flex items-center justify-between p-4 border-b border-[#1f2937]">
              <h2 className="text-base font-semibold text-white">Lịch trình hệ thống</h2>
              <Link href="/schedule" className="text-xs text-blue-400 hover:text-blue-300">Xem tất cả</Link>
            </div>
            <div className="p-4 text-sm text-gray-500">Chưa có lịch trình. Tạo ở tab Quy tắc tự động.</div>
          </div>

          <div className="bg-[#111827] border border-[#1f2937] rounded-xl flex flex-col flex-1">
            <div className="flex items-center justify-between p-4 border-b border-[#1f2937]">
              <h2 className="text-base font-semibold text-white">Cảnh báo</h2>
              <Link href="/alerts" className="text-xs text-blue-400 hover:text-blue-300">Xem tất cả</Link>
            </div>
            <div className="p-4 flex items-start gap-3 text-gray-500 text-sm">
              <WarningCircle size={18} className="text-gray-600 mt-0.5 flex-shrink-0" />
              Chưa có cảnh báo.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
