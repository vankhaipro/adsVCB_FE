"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid,
  PieChart, Pie, Legend, LabelList,
} from "recharts";
import { SpinnerGap, WarningOctagon, WarningCircle, CheckCircle } from "@phosphor-icons/react";
import { apiGet, fmtVnd } from "@/lib/api";
import { useChartColors } from "@/lib/chartTheme";
import DateRangePicker, { presetToDates } from "@/components/DateRangePicker";

type Report = {
  byPlatform: { platform: string; spend: number; accounts: number; campaigns: number }[];
  spendByAccount: { name: string; platform: string; spend: number }[];
};

type Grp = { name: string; spend: number; result: number; campaigns: number; cp: number };
type Acct = { name: string; spend: number; result: number; active: number; total: number; cp: number; pct: number };
type TopSpend = { name: string; account: string; spend: number; result: number; resultLabel: string; cp: number; spender: string };
type NameQ = { name: string; count: number; pct: number };
type NameErr = { name: string; cls: string; missing: string[]; spend: number };
type MetaReport = {
  kpis: { totalSpend: number; activeCampaigns: number; totalCampaigns: number; messages: number; likes: number; cpMess: number };
  bySpender: Grp[];
  byObjective: Grp[];
  byTeam: Grp[];
  byLine: Grp[];
  byAccount: Acct[];
  topSpend: TopSpend[];
  topMess: { name: string; cp: number; messages: number }[];
  namingQuality: NameQ[];
  namingErrors: NameErr[];
  messThreshold: number;
  warnings: { level: "danger" | "warn" | "ok"; text: string }[];
};

const platColor = (p: string) => (p === "META" ? "#60a5fa" : "#f472b6");

// Bảng màu dùng chung cho các chiều phân loại.
const SPENDER_COLORS: Record<string, string> = { "Việt": "#1e3a8a", "Thành": "#f59e0b", "SB": "#10b981", "Không xác định": "#ef4444" };
const LINE_COLORS: Record<string, string> = { A4: "#ef4444", A1: "#10b981", A2: "#3b82f6", A3: "#8b5cf6", A5: "#f59e0b", "Không rõ": "#6b7280" };
const OBJ_COLORS: Record<string, string> = { "Mess": "#f59e0b", "Like page": "#10b981", "Chuyển đổi web": "#ef4444", "Tương tác": "#3b82f6", "Không XĐ": "#6b7280" };
const NAMEQ_COLORS: Record<string, string> = { "Chuẩn": "#10b981", "SB tự động": "#3b82f6", "Thiếu thành phần": "#f59e0b", "Ngoài hệ thống / Rác": "#ef4444" };
const PALETTE = ["#1e3a8a", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#3b82f6", "#14b8a6", "#f472b6", "#64748b"];

const fmtM = (n: number) => `${(n / 1e6).toFixed(1)}M`;
const fmtNum = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n || 0));

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5 mb-3">{subtitle}</p>}
      {!subtitle && <div className="mb-3" />}
      {children}
    </div>
  );
}

export default function ReportsPage() {
  const chart = useChartColors();
  const [r, setR] = useState<Report | null>(null);
  const [m, setM] = useState<MetaReport | null>(null);
  const [dateRange, setDateRange] = useState("last30days");
  const [dateFrom, setDateFrom] = useState(() => presetToDates("last30days").from);
  const [dateTo, setDateTo] = useState(() => presetToDates("last30days").to);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiGet("/mkt-api/reports").then(setR).catch(() => {}),
      apiGet(`/mkt-api/reports/meta?from=${dateFrom}&to=${dateTo}`).then(setM).catch(() => setM(null)),
    ]).finally(() => setLoading(false));
  }, [dateFrom, dateTo]);

  const axisTick = { fill: chart.axis, fontSize: 10 };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Báo cáo</h1>
          <p className="text-sm text-muted-foreground mt-1">Phân tích chi tiêu &amp; hiệu quả quảng cáo Meta theo người chạy, mục tiêu, team &amp; tuyến nội dung.</p>
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
        <div className="p-6 text-muted-foreground text-sm flex items-center gap-2">
          <SpinnerGap size={18} className="animate-spin" /> Đang tải…
        </div>
      ) : (
        <>
          {/* Platform summary */}
          {r && (
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
          )}

          {!m ? (
            <div className="text-sm text-amber-400">Không tải được báo cáo Meta — kiểm tra backend.</div>
          ) : (
            <>
              {/* KPI row */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: "Tổng chi tiêu", value: fmtVnd(m.kpis.totalSpend) },
                  { label: "Active campaigns", value: `${m.kpis.activeCampaigns} / ${m.kpis.totalCampaigns}` },
                  { label: "Tin nhắn (Mess)", value: fmtNum(m.kpis.messages) },
                  { label: "Like page", value: fmtNum(m.kpis.likes) },
                  { label: "CP / Mess", value: fmtVnd(m.kpis.cpMess) },
                ].map((k) => (
                  <div key={k.label} className="bg-card border border-border rounded-xl p-4">
                    <div className="text-xs text-muted-foreground">{k.label}</div>
                    <div className="text-lg font-bold text-foreground mt-1">{k.value}</div>
                  </div>
                ))}
              </div>

              {/* 1. Người chạy */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card title="Chi tiêu theo người chạy">
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={m.bySpender} dataKey="spend" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                          {m.bySpender.map((s, i) => (
                            <Cell key={i} fill={SPENDER_COLORS[s.name] || PALETTE[i % PALETTE.length]} />
                          ))}
                        </Pie>
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Tooltip formatter={(v) => fmtVnd(Number(v))} contentStyle={chart.tooltip} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card title="CP / kết quả theo người chạy" subtitle="Chi phí trung bình cho mỗi kết quả — càng thấp càng hiệu quả.">
                  <HBar data={m.bySpender} colorMap={SPENDER_COLORS} chart={chart} axisTick={axisTick} valueFmt={(v) => fmtNum(v)} />
                </Card>
              </div>

              {/* 2. Mục tiêu */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card title="Chi tiêu theo mục tiêu">
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={m.byObjective} margin={{ top: 20, right: 8, bottom: 8, left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                        <XAxis dataKey="name" tick={axisTick} interval={0} />
                        <YAxis tick={axisTick} tickFormatter={fmtM} />
                        <Tooltip formatter={(v) => fmtVnd(Number(v))} contentStyle={chart.tooltip} cursor={{ fill: chart.cursor }} />
                        <Bar dataKey="spend" radius={[4, 4, 0, 0]}>
                          {m.byObjective.map((o, i) => <Cell key={i} fill={OBJ_COLORS[o.name] || PALETTE[i % PALETTE.length]} />)}
                          <LabelList dataKey="spend" position="top" formatter={(v) => fmtM(Number(v))} style={{ fill: chart.axis, fontSize: 10 }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card title="CP / kết quả theo mục tiêu" subtitle="VND cho mỗi kết quả của từng loại mục tiêu.">
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={m.byObjective} margin={{ top: 20, right: 8, bottom: 8, left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                        <XAxis dataKey="name" tick={axisTick} interval={0} />
                        <YAxis tick={axisTick} tickFormatter={(v) => `${(v / 1e3).toFixed(0)}k`} />
                        <Tooltip formatter={(v) => fmtVnd(Number(v))} contentStyle={chart.tooltip} cursor={{ fill: chart.cursor }} />
                        <Bar dataKey="cp" radius={[4, 4, 0, 0]}>
                          {m.byObjective.map((o, i) => <Cell key={i} fill={OBJ_COLORS[o.name] || PALETTE[i % PALETTE.length]} />)}
                          <LabelList dataKey="cp" position="top" formatter={(v) => `${(Number(v) / 1e3).toFixed(1)}k`} style={{ fill: chart.axis, fontSize: 10 }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* 3. Team */}
              <Card title="Chi tiêu theo Team" subtitle="Tổng chi tiêu mỗi team trong kỳ (tất cả tài khoản).">
                <div style={{ height: Math.max(240, m.byTeam.length * 34) }} className="w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={m.byTeam} layout="vertical" margin={{ top: 4, right: 60, bottom: 4, left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} horizontal={false} />
                      <XAxis type="number" tick={axisTick} tickFormatter={fmtM} />
                      <YAxis type="category" dataKey="name" tick={axisTick} width={110} />
                      <Tooltip formatter={(v) => fmtVnd(Number(v))} contentStyle={chart.tooltip} cursor={{ fill: chart.cursor }} />
                      <Bar dataKey="spend" radius={[0, 4, 4, 0]}>
                        {m.byTeam.map((t, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                        <LabelList dataKey="spend" position="right" formatter={(v) => fmtM(Number(v))} style={{ fill: chart.axis, fontSize: 10 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Theo tài khoản */}
              <Card title="Theo tài khoản" subtitle="Chi tiêu, số CK active/tổng và CP/kết quả từng tài khoản quảng cáo.">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[560px]">
                    <thead>
                      <tr className="text-left text-xs text-muted-foreground border-b border-border">
                        <th className="py-2 pr-3 font-medium">Tài khoản</th>
                        <th className="py-2 px-3 font-medium text-right">Chi tiêu</th>
                        <th className="py-2 px-3 font-medium text-right">%</th>
                        <th className="py-2 px-3 font-medium text-right">Active / Tổng</th>
                        <th className="py-2 px-3 font-medium text-right">Kết quả</th>
                        <th className="py-2 pl-3 font-medium text-right">CP/kq</th>
                      </tr>
                    </thead>
                    <tbody>
                      {m.byAccount.map((a) => (
                        <tr key={a.name} className="border-b border-border/50">
                          <td className="py-2 pr-3 text-foreground">{a.name}</td>
                          <td className="py-2 px-3 text-right text-foreground">{fmtVnd(a.spend)}</td>
                          <td className="py-2 px-3 text-right text-muted-foreground">{a.pct.toFixed(1)}%</td>
                          <td className="py-2 px-3 text-right text-muted-foreground">{a.active} / {a.total}</td>
                          <td className="py-2 px-3 text-right text-muted-foreground">{fmtNum(a.result)}</td>
                          <td className="py-2 pl-3 text-right text-foreground">{fmtNum(a.cp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* 4. Tuyến nội dung */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card title="Chi tiêu theo tuyến nội dung" subtitle="Ngân sách phân bổ theo tuyến A1–A5.">
                  <HBar data={m.byLine} colorMap={LINE_COLORS} chart={chart} axisTick={axisTick} field="spend" valueFmt={fmtM} width={70} />
                </Card>
                <Card title="CP / kết quả theo tuyến nội dung" subtitle="Hiệu quả chi phí mỗi tuyến.">
                  <HBar data={m.byLine} colorMap={LINE_COLORS} chart={chart} axisTick={axisTick} field="cp" valueFmt={(v) => fmtNum(v)} width={70} />
                </Card>
              </div>

              {/* Top 10 chi tiêu cao nhất */}
              <Card title="Top 10 chiến dịch chi tiêu cao nhất" subtitle="Chiến dịch tiêu ngân sách nhiều nhất trong kỳ.">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr className="text-left text-xs text-muted-foreground border-b border-border">
                        <th className="py-2 pr-3 font-medium w-8">#</th>
                        <th className="py-2 px-3 font-medium">Chiến dịch</th>
                        <th className="py-2 px-3 font-medium">Tài khoản</th>
                        <th className="py-2 px-3 font-medium text-right">Chi tiêu</th>
                        <th className="py-2 px-3 font-medium text-right">Kết quả</th>
                        <th className="py-2 pl-3 font-medium text-right">CP/kq</th>
                      </tr>
                    </thead>
                    <tbody>
                      {m.topSpend.map((t, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-2 pr-3 text-muted-foreground">{i + 1}</td>
                          <td className="py-2 px-3 text-foreground max-w-[280px] truncate" title={t.name}>{t.name}</td>
                          <td className="py-2 px-3 text-muted-foreground">{t.account}</td>
                          <td className="py-2 px-3 text-right text-foreground">{fmtVnd(t.spend)}</td>
                          <td className="py-2 px-3 text-right text-muted-foreground">{fmtNum(t.result)} {t.resultLabel}</td>
                          <td className="py-2 pl-3 text-right text-foreground">{fmtNum(t.cp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* 5. Top Mess */}
              <Card title="Top 10 Mess — CP/tin nhắn tốt nhất" subtitle={`Ngưỡng ${fmtNum(m.messThreshold)} VND/msg là mức tốt. Xanh = hiệu quả, cam = cần cải thiện.`}>
                {m.topMess.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Chưa có campaign Mess trong kỳ.</div>
                ) : (
                  <div style={{ height: Math.max(240, m.topMess.length * 36) }} className="w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={m.topMess} layout="vertical" margin={{ top: 4, right: 90, bottom: 4, left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} horizontal={false} />
                        <XAxis type="number" tick={axisTick} tickFormatter={(v) => fmtNum(v)} />
                        <YAxis type="category" dataKey="name" tick={{ ...axisTick, fontSize: 10 }} width={200} tickFormatter={(v: string) => (v.length > 34 ? v.slice(0, 33) + "…" : v)} />
                        <Tooltip
                          formatter={(v, _n, p) => [`${fmtVnd(Number(v))} · ${fmtNum((p?.payload as { messages: number }).messages)} msg`, "CP/tin nhắn"]}
                          contentStyle={chart.tooltip}
                          cursor={{ fill: chart.cursor }}
                        />
                        <Bar dataKey="cp" radius={[0, 4, 4, 0]}>
                          {m.topMess.map((t, i) => <Cell key={i} fill={t.cp <= m.messThreshold ? "#10b981" : "#f59e0b"} />)}
                          <LabelList dataKey="cp" position="right" formatter={(v) => fmtNum(Number(v))} style={{ fill: chart.axis, fontSize: 10 }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>

              {/* Chất lượng đặt tên */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card title="Chất lượng đặt tên" subtitle="Tỉ lệ chiến dịch đặt tên đúng chuẩn hệ thống.">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={m.namingQuality} dataKey="count" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                          {m.namingQuality.map((q, i) => <Cell key={i} fill={NAMEQ_COLORS[q.name] || PALETTE[i % PALETTE.length]} />)}
                        </Pie>
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Tooltip formatter={(v, _n, p) => [`${fmtNum(Number(v))} CK · ${(p?.payload as NameQ).pct.toFixed(1)}%`, "Số CK"]} contentStyle={chart.tooltip} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card title="Lỗi đặt tên — chiến dịch đang active" subtitle="CK active thiếu thành phần trong tên (ưu tiên chi tiêu cao).">
                  {m.namingErrors.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Không có lỗi đặt tên nào — tất cả CK active đều đúng chuẩn. 🎉</div>
                  ) : (
                    <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                      {m.namingErrors.map((e, i) => (
                        <li key={i} className="text-sm border-b border-border/50 pb-2 last:border-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-foreground truncate" title={e.name}>{e.name}</span>
                            <span className="text-xs text-muted-foreground shrink-0">{fmtVnd(e.spend)}</span>
                          </div>
                          <div className="text-xs mt-0.5">
                            <span className="text-amber-500">{e.cls}</span>
                            <span className="text-muted-foreground"> — thiếu {e.missing.join(", ")}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </div>

              {/* 6. Cảnh báo & Khuyến nghị */}
              <Card title="Cảnh báo & Khuyến nghị">
                {m.warnings.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Không có cảnh báo nào trong kỳ.</div>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {m.warnings.map((w, i) => {
                      const Icon = w.level === "danger" ? WarningOctagon : w.level === "warn" ? WarningCircle : CheckCircle;
                      const color = w.level === "danger" ? "#ef4444" : w.level === "warn" ? "#f59e0b" : "#10b981";
                      return (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <Icon size={18} weight="fill" style={{ color }} className="mt-0.5 shrink-0" />
                          <span className="text-foreground">{w.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>

              {/* Spend by account (giữ lại) */}
              {r && r.spendByAccount.length > 0 && (
                <Card title="Top tài khoản theo chi tiêu">
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={r.spendByAccount} margin={{ top: 8, right: 8, bottom: 60, left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                        <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} tick={{ ...axisTick }} height={70} />
                        <YAxis tick={axisTick} tickFormatter={fmtM} />
                        <Tooltip formatter={(v) => fmtVnd(Number(v))} contentStyle={chart.tooltip} cursor={{ fill: chart.cursor }} />
                        <Bar dataKey="spend" radius={[4, 4, 0, 0]}>
                          {r.spendByAccount.map((a, i) => <Cell key={i} fill={platColor(a.platform)} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

// Horizontal bar chart tái dùng cho các chiều nhỏ (người chạy / tuyến ND).
function HBar({
  data, colorMap, chart, axisTick, field = "cp", valueFmt, width = 90,
}: {
  data: Grp[];
  colorMap: Record<string, string>;
  chart: ReturnType<typeof useChartColors>;
  axisTick: { fill: string; fontSize: number };
  field?: "cp" | "spend";
  valueFmt: (v: number) => string;
  width?: number;
}) {
  return (
    <div style={{ height: Math.max(200, data.length * 44) }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 56, bottom: 4, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} horizontal={false} />
          <XAxis type="number" tick={axisTick} tickFormatter={valueFmt} />
          <YAxis type="category" dataKey="name" tick={axisTick} width={width} />
          <Tooltip formatter={(v) => valueFmt(Number(v))} contentStyle={chart.tooltip} cursor={{ fill: chart.cursor }} />
          <Bar dataKey={field} radius={[0, 4, 4, 0]}>
            {data.map((d, i) => <Cell key={i} fill={colorMap[d.name] || PALETTE[i % PALETTE.length]} />)}
            <LabelList dataKey={field} position="right" formatter={(v) => valueFmt(Number(v))} style={{ fill: chart.axis, fontSize: 10 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
