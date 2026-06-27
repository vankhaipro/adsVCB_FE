"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from "recharts";
import { SpinnerGap } from "@phosphor-icons/react";
import { apiGet, fmtVnd } from "@/lib/api";
import { useChartColors } from "@/lib/chartTheme";

type Report = {
  byPlatform: { platform: string; spend: number; accounts: number; campaigns: number }[];
  spendByAccount: { name: string; platform: string; spend: number }[];
};

const platColor = (p: string) => (p === "META" ? "#60a5fa" : "#f472b6");

export default function ReportsPage() {
  const chart = useChartColors();
  const [r, setR] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/ads/reports").then(setR).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Báo cáo</h1>
        <p className="text-sm text-muted-foreground mt-1">Tổng hợp chi tiêu &amp; chiến dịch theo nền tảng.</p>
      </div>

      {loading ? (
        <div className="p-6 text-muted-foreground text-sm flex items-center gap-2">
          <SpinnerGap size={18} className="animate-spin" /> Đang tải…
        </div>
      ) : !r ? (
        <div className="text-sm text-amber-400">Không tải được báo cáo — kiểm tra backend.</div>
      ) : (
        <>
          {/* Platform summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {r.byPlatform.map((p) => (
              <div key={p.platform} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold" style={{ color: platColor(p.platform) }}>
                    {p.platform === "META" ? "Meta Ads" : "TikTok Ads"}
                  </span>
                  <span className="text-xs text-muted-foreground">{p.accounts} tài khoản</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{fmtVnd(p.spend)}</div>
                <div className="text-xs text-muted-foreground mt-1">{p.campaigns} chiến dịch</div>
              </div>
            ))}
          </div>

          {/* Spend by account */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-base font-semibold text-foreground mb-4">Top tài khoản theo chi tiêu</h2>
            {r.spendByAccount.length === 0 ? (
              <div className="text-sm text-muted-foreground">Chưa có dữ liệu chi tiêu.</div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={r.spendByAccount} margin={{ top: 8, right: 8, bottom: 60, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                    <XAxis
                      dataKey="name"
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                      height={70}
                    />
                    <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                    <Tooltip
                      formatter={(v) => fmtVnd(Number(v))}
                      contentStyle={chart.tooltip}
                    />
                    <Bar dataKey="spend" radius={[4, 4, 0, 0]}>
                      {r.spendByAccount.map((a, i) => (
                        <Cell key={i} fill={platColor(a.platform)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
