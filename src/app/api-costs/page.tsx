"use client";

import { useEffect, useState } from "react";
import { ArrowClockwise, SpinnerGap, WarningCircle } from "@phosphor-icons/react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend,
} from "recharts";
import { apiGet, apiPost } from "@/lib/api";
import { useAuthRole } from "@/lib/useAuthUser";
import { useChartColors } from "@/lib/chartTheme";
import { Panel } from "@/components/overview/parts";

type Provider = {
  id: "TIKHUB" | "DEEPSEEK";
  name: string;
  purpose: string;
  pricing: string;
  configured: boolean;
  balance: number | null;
  // Có giá trị = gọi live thất bại, `balance` là của lần chụp gần nhất lúc này.
  balanceAt?: string;
  currency: string;
  error?: string;
  today?: { usage: number; requests: number; paidRequests: number; byGroup: { label: string; requests: number }[] };
  spendInRange: number;
  topupInRange: number;
  avgDaily7: number | null;
  daysLeft: number | null;
};

type Other = { name: string; purpose: string; billing: string; status: "ok" | "blocked" | "missing"; note: string };

type Summary = {
  generatedAt: string;
  days: number;
  firstSnapshotAt: string | null;
  providers: Provider[];
  daily: { date: string; TIKHUB: number; DEEPSEEK: number }[];
  topups: { date: string; provider: string; amount: number }[];
  others: Other[];
};

const COLORS = { TIKHUB: "#ec4899", DEEPSEEK: "#3b82f6" } as const;
const RANGES = [7, 30, 90];

// Chi phí API tính bằng cent lẻ — hiện 3 số lẻ khi dưới 1 USD, không thì mọi ngày đều "$0.00".
const fmtUsd = (n: number | null | undefined) =>
  n == null ? "—" : `$${n.toLocaleString("en-US", { minimumFractionDigits: n < 1 ? 3 : 2, maximumFractionDigits: n < 1 ? 3 : 2 })}`;

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });

export default function ApiCostsPage() {
  const role = useAuthRole();
  const isAdmin = role === "ADMIN";
  const { axis: AXIS, grid: GRID, cursor, tooltip: tooltipStyle } = useChartColors();

  const [days, setDays] = useState(30);
  const [reloadKey, setReloadKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lưu dữ liệu kèm khoá đã sinh ra nó: "đang tải" suy ra bằng cách so khoá (cùng cách với
  // trang Tài khoản quảng cáo), tránh setLoading đồng bộ trong effect.
  const key = `${days}:${reloadKey}`;
  const [result, setResult] = useState<{ key: string; data: Summary | null } | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    // cache: false — số dư đổi theo giờ, cache GET 5 phút phía client sẽ che mất lần làm mới.
    apiGet(`/api-costs?days=${days}`, { cache: false })
      .then((d) => {
        if (cancelled) return;
        setResult({ key, data: d });
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setResult({ key, data: null });
        setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
      });
    return () => {
      cancelled = true;
    };
  }, [key, days, isAdmin]);

  async function refresh() {
    setRefreshing(true);
    try {
      await apiPost("/api-costs/snapshot");
      setReloadKey((k) => k + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Làm mới thất bại");
    } finally {
      setRefreshing(false);
    }
  }

  // role null = chưa đọc xong localStorage (luôn null ở lần render server) — chưa kết luận
  // gì, tránh chớp dòng "không có quyền" với chính ADMIN.
  if (!isAdmin) {
    return role == null ? null : (
      <div className="text-sm text-muted-foreground p-6">Chỉ tài khoản ADMIN được xem chi phí API.</div>
    );
  }

  const loading = result?.key !== key;
  const data = result?.data ?? null;
  const tickEvery = days > 30 ? 7 : days > 7 ? 3 : 1;
  const ticks = data?.daily.filter((_, i, a) => (a.length - 1 - i) % tickEvery === 0).map((d) => d.date);

  return (
    <div className="flex flex-col gap-5 w-full max-w-full overflow-x-hidden pb-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chi phí API</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Số dư và chi tiêu các dịch vụ bên thứ 3 tính phí theo lượt dùng.
            {data && ` Cập nhật ${fmtDateTime(data.generatedAt)}.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border overflow-hidden text-sm">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setDays(r)}
                className={`px-3 py-1.5 transition-colors ${
                  days === r ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {r} ngày
              </button>
            ))}
          </div>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm text-foreground hover:bg-muted disabled:opacity-50"
          >
            <ArrowClockwise size={14} className={refreshing ? "animate-spin" : ""} /> Làm mới
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm p-6">
          <SpinnerGap size={18} className="animate-spin" /> Đang tải…
        </div>
      ) : error && !data ? (
        <div className="text-sm text-amber-400 bg-amber-950/30 border border-amber-900/40 rounded-md p-3">
          {error} — kiểm tra backend đã chạy.
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.providers.map((p) => (
              <ProviderCard key={p.id} p={p} days={data.days} />
            ))}
          </div>

          <Panel
            title="Chi phí theo ngày"
            subtitle="Suy ra từ độ giảm số dư giữa các lần chụp mỗi giờ (giờ Việt Nam)"
            bodyClassName="px-3 pb-4"
          >
            {data.firstSnapshotAt && (
              <p className="px-2 pb-3 text-xs text-muted-foreground">
                Bắt đầu ghi nhận từ {fmtDateTime(data.firstSnapshotAt)}. Trước mốc này không có dữ liệu vì TikHub và
                DeepSeek không lưu lịch sử chi tiêu.
              </p>
            )}
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={data.daily} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke={AXIS}
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    ticks={ticks}
                    tickFormatter={(d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`}
                  />
                  <YAxis stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <RTooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: cursor }}
                    formatter={(v, name) => [fmtUsd(Number(v)), name === "TIKHUB" ? "TikHub" : "DeepSeek"]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11 }}
                    formatter={(v) => (v === "TIKHUB" ? "TikHub" : "DeepSeek")}
                  />
                  <Bar dataKey="TIKHUB" stackId="a" fill={COLORS.TIKHUB} />
                  <Bar dataKey="DEEPSEEK" stackId="a" fill={COLORS.DEEPSEEK} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          {data.topups.length > 0 && (
            <Panel title="Nạp tiền trong kỳ" subtitle="Số dư tăng giữa hai lần chụp">
              <ul className="flex flex-col gap-1.5 text-sm">
                {data.topups.map((t, i) => (
                  <li key={i} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t.date} · {t.provider === "TIKHUB" ? "TikHub" : "DeepSeek"}
                    </span>
                    <span className="text-emerald-400 font-medium">+{fmtUsd(t.amount)}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <Panel title="Dịch vụ khác" subtitle="Không tính phí theo lượt, hoặc không có API xem số dư">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b border-border">
                    <th className="py-2 pr-4 font-medium">Dịch vụ</th>
                    <th className="py-2 pr-4 font-medium">Dùng cho</th>
                    <th className="py-2 pr-4 font-medium">Tính phí</th>
                    <th className="py-2 font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {data.others.map((o) => (
                    <tr key={o.name} className="border-b border-border/50 last:border-0">
                      <td className="py-2 pr-4 text-foreground font-medium whitespace-nowrap">{o.name}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{o.purpose}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{o.billing}</td>
                      <td className="py-2">
                        <StatusBadge status={o.status} />
                        {o.note && <div className="text-xs text-muted-foreground mt-0.5">{o.note}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      ) : null}
    </div>
  );
}

function ProviderCard({ p, days }: { p: Provider; days: number }) {
  // Dưới 2 tuần là phải nạp: cron organic chạy mỗi đêm, hết tiền giữa chừng là mất dữ liệu cả ngày.
  const low = p.daysLeft != null && p.daysLeft < 14;

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[p.id] }} />
            <span className="text-foreground font-semibold">{p.name}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {p.purpose} · {p.pricing}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Số dư</div>
          <div className={`text-2xl font-bold ${low ? "text-amber-400" : "text-foreground"}`}>
            {p.configured ? fmtUsd(p.balance) : "—"}
          </div>
        </div>
      </div>

      {!p.configured ? (
        <div className="text-sm text-muted-foreground">Chưa cấu hình API key trong .env.</div>
      ) : p.balanceAt ? (
        <div className="text-xs text-muted-foreground" title={p.error}>
          Số dư lấy từ lần chụp {fmtDateTime(p.balanceAt)}, vì {p.name} chưa trả số dư mới. Thử lại sau ít phút.
        </div>
      ) : p.error ? (
        <div className="flex items-start gap-2 text-sm text-amber-400">
          <WarningCircle size={16} className="mt-0.5 shrink-0" /> {p.error}
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-3 text-sm">
        <Stat label={`Chi tiêu ${days} ngày`} value={fmtUsd(p.spendInRange)} />
        <Stat label="TB/ngày (7 ngày)" value={fmtUsd(p.avgDaily7)} />
        <Stat
          label="Ước tính còn"
          value={p.daysLeft != null ? `~${p.daysLeft} ngày` : "—"}
          className={low ? "text-amber-400" : undefined}
        />
      </div>

      {p.today && (
        <div className="border-t border-border pt-3 flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground" title="TikHub tính ngày theo giờ Los Angeles, reset lúc 14h–15h giờ VN">
              Hôm nay (theo TikHub)
            </span>
            <span className="text-foreground font-medium">
              {fmtUsd(p.today.usage)} · {p.today.paidRequests.toLocaleString("vi-VN")} request tính phí
            </span>
          </div>
          {p.today.byGroup.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {p.today.byGroup.map((g) => (
                <span key={g.label} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {g.label}: {g.requests.toLocaleString("vi-VN")}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-medium ${className ?? "text-foreground"}`}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: Other["status"] }) {
  const map = {
    ok: ["Đang dùng", "bg-emerald-950/40 text-emerald-400"],
    blocked: ["Hết hạn mức", "bg-amber-950/40 text-amber-400"],
    missing: ["Chưa cấu hình", "bg-muted text-muted-foreground"],
  } as const;
  const [label, cls] = map[status];
  return <span className={`text-xs px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}
