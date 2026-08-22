"use client";

import { Fragment, useEffect, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid,
  PieChart, Pie, Legend, LabelList, Label,
} from "recharts";
import { SpinnerGap } from "@phosphor-icons/react";
import { apiGet, fmtVnd } from "@/lib/api";
import { useChartColors } from "@/lib/chartTheme";
import DateRangePicker, { presetToDates } from "@/components/DateRangePicker";

type Report = {
  byPlatform: { platform: string; spend: number; accounts: number; campaigns: number }[];
  spendByAccount: { name: string; platform: string; spend: number }[];
};

type Grp = { name: string; spend: number; result: number; campaigns: number; cp: number };
// Tuyến nội dung tách riêng khỏi Grp: chi tiêu gồm cả TikTok, còn CP/kết quả phải tách theo
// mục tiêu (mỗi mục tiêu một đơn vị kết quả — xem ghi chú byLine ở adsVCB_BE/ads.service.ts).
type LineSpend = { name: string; spend: number; spendMeta: number; spendTiktok: number; campaigns: number };
type LineObj = { line: string; objective: string; spend: number; result: number; campaigns: number; cp: number };
// Kết quả của tài khoản tách theo mục tiêu — không còn cột "kết quả" gộp, vì mỗi tài khoản
// chạy nhiều mục tiêu và mỗi mục tiêu một đơn vị (tin nhắn / like / đơn hàng).
type AcctObj = { spend: number; result: number; campaigns: number; cp: number };
type Acct = { name: string; spend: number; active: number; total: number; pct: number; byObjective: Record<string, AcctObj> };
type TopSpend = { name: string; account: string; spend: number; result: number; resultLabel: string; cp: number; spender: string };
type NameQ = { name: string; count: number; pct: number };
type NameErr = { name: string; cls: string; missing: string[]; spend: number };
type MetaReport = {
  kpis: { totalSpend: number; activeCampaigns: number; totalCampaigns: number; messages: number; likes: number; cpMess: number };
  bySpender: Grp[];
  byObjective: Grp[];
  byTeam: Grp[];
  byLine: LineSpend[];
  byLineObjective: LineObj[];
  byAccount: Acct[];
  topSpend: TopSpend[];
  topMess: { name: string; cp: number; messages: number }[];
  namingQuality: NameQ[];
  namingErrors: NameErr[];
  messThreshold: number;
  industries: string[];
  industry: string | null;
  warnings: { level: "danger" | "warn" | "ok"; text: string }[];
};

const platColor = (p: string) => (p === "META" ? "#60a5fa" : "#f472b6");

// Bảng màu dùng chung cho các chiều phân loại.
const SPENDER_COLORS: Record<string, string> = { "Việt": "#1e3a8a", "Thành": "#f59e0b", "SB": "#10b981", "Không xác định": "#ef4444" };
// "Chưa khai tuyến" = CK có dùng hệ tuyến nhưng tên thiếu A1–A5 (BE gắn nhãn này sau khi đã
// loại CK Website ra khỏi hệ tuyến). Xám để không bị nhìn nhầm là một tuyến thật.
const LINE_COLORS: Record<string, string> = { A4: "#ef4444", A1: "#10b981", A2: "#3b82f6", A3: "#8b5cf6", A5: "#f59e0b", "Chưa khai tuyến": "#6b7280" };
// Khoá phải khớp CampaignObjectiveLabel ở adsVCB_BE/src/lib/campaign-objective.ts.
// Thiếu khoá nào thì cột đó rơi về PALETTE[i] và đổi màu theo thứ tự sắp xếp.
const OBJ_COLORS: Record<string, string> = { "Mess": "#f59e0b", "Like page": "#10b981", "Chuyển đổi web": "#ef4444", "Tương tác": "#3b82f6", "Follow": "#a855f7", "Khác": "#6b7280" };
const NAMEQ_COLORS: Record<string, string> = { "Chuẩn": "#10b981", "SB tự động": "#3b82f6", "Thiếu thành phần": "#f59e0b", "Ngoài hệ thống / Rác": "#ef4444" };
// Đơn vị của "kết quả" từng mục tiêu — ghi rõ trên card CP để không ai cộng chúng với nhau.
const RESULT_UNIT: Record<string, string> = {
  "Mess": "tin nhắn", "Like page": "like trang", "Chuyển đổi web": "đơn hàng",
  "Tương tác": "click", "Follow": "follow", "Khác": "kết quả",
};
// Cột kết quả của bảng "Theo tài khoản", theo thứ tự hiển thị. Mục tiêu nào không có tài khoản
// nào chạy thì cột đó tự ẩn; mục tiêu ngoài danh sách này hiện ở dòng phụ dưới tên tài khoản.
const ACCT_OBJ_COLS = [
  { key: "Mess", result: "Tin nhắn", cp: "CP/tin nhắn" },
  { key: "Like page", result: "Like page", cp: "CP/like" },
  { key: "Chuyển đổi web", result: "Đơn web", cp: "CP/đơn" },
] as const;
const PALETTE = ["#1e3a8a", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#3b82f6", "#14b8a6", "#f472b6", "#64748b"];

const fmtM = (n: number) => `${(n / 1e6).toFixed(1)}M`;
const fmtNum = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n || 0));

function fmtVndShort(n: number): string {
  const abs = Math.abs(n || 0);
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}Bđ`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}Mđ`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(0)}Kđ`;
  return `${Math.round(n)}đ`;
}

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
  const [lineObjective, setLineObjective] = useState("Mess");
  const [dateRange, setDateRange] = useState("last30days");
  const [dateFrom, setDateFrom] = useState(() => presetToDates("last30days").from);
  const [dateTo, setDateTo] = useState(() => presetToDates("last30days").to);
  const [loading, setLoading] = useState(true);
  // "" = tất cả ngành. Danh sách lựa chọn do BE trả về (m.industries) nên không hardcode.
  const [industry, setIndustry] = useState("");

  useEffect(() => {
    setLoading(true);
    const q = `from=${dateFrom}&to=${dateTo}${industry ? `&industry=${encodeURIComponent(industry)}` : ""}`;
    Promise.all([
      apiGet(`/mkt-api/reports?${q}`).then(setR).catch(() => {}),
      apiGet(`/mkt-api/reports/meta?${q}`).then(setM).catch(() => setM(null)),
    ]).finally(() => setLoading(false));
  }, [dateFrom, dateTo, industry]);

  const axisTick = { fill: chart.axis, fontSize: 10 };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Báo cáo</h1>
          <p className="text-sm text-muted-foreground mt-1">Phân tích chi tiêu &amp; hiệu quả quảng cáo Meta theo người chạy, mục tiêu, team &amp; tuyến nội dung.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
          {/* Lọc ngành hàng — tách hẳn số liệu Đồ da / Kim hoàn / Đá quý.
              Danh sách luôn đầy đủ vì BE tính industries TRƯỚC khi áp bộ lọc. */}
          {(m?.industries?.length ?? 0) > 1 && (
            <div className="flex items-center gap-1.5">
              {[{ v: "", label: "Tất cả ngành" }, ...(m?.industries ?? []).map((i) => ({ v: i, label: i }))].map((o) => (
                <button
                  key={o.v || "all"}
                  onClick={() => setIndustry(o.v)}
                  className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                    o.v === industry
                      ? "bg-foreground text-background border-foreground font-medium"
                      : "bg-card text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
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
                  <div className="flex items-center gap-4 h-72">
                    <div className="w-[180px] h-[180px] shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={m.bySpender} dataKey="spend" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                            {m.bySpender.map((s, i) => (
                              <Cell key={i} fill={SPENDER_COLORS[s.name] || PALETTE[i % PALETTE.length]} />
                            ))}
                            <Label value={fmtVndShort(m.kpis.totalSpend)} position="center" fill={chart.labelFill} fontSize={11} fontWeight="bold" />
                          </Pie>
                          <Tooltip formatter={(v) => fmtVnd(Number(v))} contentStyle={chart.tooltip} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 flex flex-col gap-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                      {m.bySpender.map((s, i) => {
                        const pct = m.kpis.totalSpend > 0 ? ((s.spend / m.kpis.totalSpend) * 100).toFixed(1) : "0";
                        const color = SPENDER_COLORS[s.name] || PALETTE[i % PALETTE.length];
                        return (
                          <div key={i} className="flex items-center justify-between gap-1.5 min-w-0 bg-muted/30 px-2 py-1 rounded">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                              <span className="text-foreground font-medium text-xs truncate" title={s.name}>{s.name}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-blue-600 dark:text-blue-400 font-medium text-[11px]">{fmtVndShort(s.spend)}</span>
                              <span className="font-semibold text-foreground text-[10px] bg-background px-1 py-0.5 rounded border border-border">{pct}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
              <AccountTable data={m.byAccount ?? []} />

              {/* 4. Tuyến nội dung */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card title="Chi tiêu theo tuyến nội dung" subtitle="Ngân sách theo tuyến A1–A5, tách Meta &amp; TikTok. Không gồm CK Website (không dùng hệ tuyến).">
                  {/* ?? [] : backend cũ chưa có byLine dạng mới / byLineObjective — thà vẽ rỗng còn hơn vỡ trang */}
                  <div style={{ height: Math.max(200, (m.byLine ?? []).length * 44) }} className="w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={m.byLine ?? []} layout="vertical" margin={{ top: 4, right: 64, bottom: 4, left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} horizontal={false} />
                        <XAxis type="number" tick={axisTick} tickFormatter={fmtM} />
                        <YAxis type="category" dataKey="name" tick={axisTick} width={70} />
                        <Tooltip
                          formatter={(v, n) => [fmtVnd(Number(v)), n]}
                          contentStyle={chart.tooltip}
                          cursor={{ fill: chart.cursor }}
                        />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="spendMeta" name="Meta" stackId="p" fill={platColor("META")} />
                        <Bar dataKey="spendTiktok" name="TikTok" stackId="p" fill={platColor("TIKTOK")} radius={[0, 4, 4, 0]}>
                          {/* dataKey="spend" = tổng 2 nền tảng, đặt ở cuối stack */}
                          <LabelList dataKey="spend" position="right" formatter={(v) => fmtM(Number(v))} style={{ fill: chart.axis, fontSize: 10 }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <LineCpCard data={m.byLineObjective ?? []} selected={lineObjective} onSelect={setLineObjective} chart={chart} axisTick={axisTick} />
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
                  <div className="flex items-center gap-4 h-64">
                    <div className="w-[170px] h-[170px] shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={m.namingQuality} dataKey="count" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                            {m.namingQuality.map((q, i) => <Cell key={i} fill={NAMEQ_COLORS[q.name] || PALETTE[i % PALETTE.length]} />)}
                            <Label value={`${m.kpis.totalCampaigns} CK`} position="center" fill={chart.labelFill} fontSize={12} fontWeight="bold" />
                          </Pie>
                          <Tooltip formatter={(v, _n, p) => [`${fmtNum(Number(v))} CK · ${(p?.payload as NameQ).pct.toFixed(1)}%`, "Số CK"]} contentStyle={chart.tooltip} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                      {m.namingQuality.map((q, i) => {
                        const color = NAMEQ_COLORS[q.name] || PALETTE[i % PALETTE.length];
                        return (
                          <div key={i} className="flex items-center justify-between gap-1.5 min-w-0 bg-muted/30 px-2 py-1 rounded">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                              <span className="text-foreground font-medium text-xs truncate" title={q.name}>{q.name}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-blue-600 dark:text-blue-400 font-medium text-[11px]">{q.count} CK</span>
                              <span className="font-semibold text-foreground text-[10px] bg-background px-1 py-0.5 rounded border border-border">{q.pct.toFixed(1)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
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

              {/* Spend by account (giữ lại) */}
              {r && r.spendByAccount.length > 0 && (
                <Card title="Top tài khoản theo chi tiêu">
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={r.spendByAccount} margin={{ top: 22, right: 8, bottom: 60, left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                        <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} tick={{ ...axisTick }} height={70} />
                        <YAxis tick={axisTick} tickFormatter={fmtM} />
                        <Tooltip formatter={(v) => fmtVnd(Number(v))} contentStyle={chart.tooltip} cursor={{ fill: chart.cursor }} />
                        <Bar dataKey="spend" radius={[4, 4, 0, 0]}>
                          {r.spendByAccount.map((a, i) => <Cell key={i} fill={platColor(a.platform)} />)}
                          <LabelList dataKey="spend" position="top" formatter={(v: any) => fmtVndShort(Number(v || 0))} style={{ fill: chart.axis, fontSize: 10, fontWeight: "600" }} />
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

// Bảng "Theo tài khoản" — kết quả & CP tách theo mục tiêu.
//
// Cột "Kết quả"/"CP/kq" gộp cũ đã bỏ: tài khoản "Tăng trưởng thần tốc" chia tiền cho Mess (74%),
// web (14%) và Like page (11%), nên nó cộng tin nhắn + đơn hàng + like vào một mẫu số. Riêng
// like page nhiều gấp nhiều lần tin nhắn nên nó kéo CP xuống, ra 376đ/kq — không phải giá mess.
function AccountTable({ data }: { data: Acct[] }) {
  // Chỉ hiện cột của mục tiêu thực sự có tài khoản chạy.
  const cols = ACCT_OBJ_COLS.filter((c) => data.some((a) => a.byObjective?.[c.key]?.spend > 0));
  const colKeys = new Set<string>(cols.map((c) => c.key));
  const num = (v: number | undefined) => (v ? fmtNum(v) : "—");

  return (
    <Card title="Theo tài khoản" subtitle="Chi tiêu, số CK active/tổng, và kết quả + CP tách riêng từng mục tiêu.">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="text-left text-xs text-muted-foreground border-b border-border">
              <th className="py-2 pr-3 font-medium">Tài khoản</th>
              <th className="py-2 px-3 font-medium text-right">Chi tiêu</th>
              <th className="py-2 px-3 font-medium text-right">%</th>
              <th className="py-2 px-3 font-medium text-right">Active / Tổng</th>
              {cols.map((c) => (
                <Fragment key={c.key}>
                  <th className="py-2 px-3 font-medium text-right border-l border-border/50">{c.result}</th>
                  <th className="py-2 px-3 font-medium text-right">{c.cp}</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((a) => {
              // Mục tiêu có chi tiêu nhưng không có cột riêng (vd Tương tác, Follow) — cho xuống
              // dòng phụ để tiền của chúng không biến mất khỏi bảng.
              const rest = Object.entries(a.byObjective || {}).filter(([k, o]) => !colKeys.has(k) && o.spend > 0);
              return (
                <tr key={a.name} className="border-b border-border/50">
                  <td className="py-2 pr-3 text-foreground">
                    {a.name}
                    {rest.length > 0 && (
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {rest.map(([k, o]) => `${k}: ${fmtVndShort(o.spend)}${o.result > 0 ? ` · ${fmtNum(o.cp)}đ/${RESULT_UNIT[k] || "kq"}` : ""}`).join(" · ")}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right text-foreground align-top">{fmtVnd(a.spend)}</td>
                  <td className="py-2 px-3 text-right text-muted-foreground align-top">{a.pct.toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right text-muted-foreground align-top">{a.active} / {a.total}</td>
                  {cols.map((c) => {
                    const o = a.byObjective?.[c.key];
                    return (
                      <Fragment key={c.key}>
                        <td className="py-2 px-3 text-right text-muted-foreground align-top border-l border-border/50">{num(o?.result)}</td>
                        <td className="py-2 px-3 text-right text-foreground align-top">{num(o?.cp)}</td>
                      </Fragment>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// CP/kết quả theo tuyến — MỘT mục tiêu tại một thời điểm.
//
// Không gộp mọi mục tiêu vào một cột như trước: "kết quả" của Mess là tin nhắn, của Like page
// là like, của Chuyển đổi web là đơn hàng. Cộng chung rồi chia làm CP/tin nhắn của tuyến A4
// tụt từ 6.897đ xuống 5.798đ vì bị like & click pha loãng.
function LineCpCard({
  data, selected, onSelect, chart, axisTick,
}: {
  data: LineObj[];
  selected: string;
  onSelect: (v: string) => void;
  chart: ReturnType<typeof useChartColors>;
  axisTick: { fill: string; fontSize: number };
}) {
  // Mục tiêu nào tiêu nhiều tiền hơn đứng trước; data đã sort sẵn theo spend giảm dần.
  const objectives = [...new Set(data.map((d) => d.objective))];
  const active = objectives.includes(selected) ? selected : objectives[0];
  const rows = data.filter((d) => d.objective === active).sort((a, b) => b.spend - a.spend);
  const unit = RESULT_UNIT[active] || "kết quả";

  return (
    <Card
      title="CP / kết quả theo tuyến nội dung"
      subtitle={objectives.length ? `VND cho mỗi ${unit} — chỉ Meta, không gồm CK Website (insight TikTok chưa có chỉ số kết quả).` : "Chưa có dữ liệu."}
    >
      <div className="flex flex-wrap gap-1.5 mb-3">
        {objectives.map((o) => (
          <button
            key={o}
            onClick={() => onSelect(o)}
            className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
              o === active
                ? "bg-foreground text-background border-foreground font-medium"
                : "bg-muted/30 text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="text-sm text-muted-foreground">Không có tuyến nào có kết quả cho mục tiêu này.</div>
      ) : (
        <div style={{ height: Math.max(160, rows.length * 44) }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 64, bottom: 4, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} horizontal={false} />
              <XAxis type="number" tick={axisTick} tickFormatter={(v) => fmtNum(v)} />
              <YAxis type="category" dataKey="line" tick={axisTick} width={70} />
              <Tooltip
                formatter={(v, _n, p) => {
                  const d = p?.payload as LineObj;
                  return [`${fmtVnd(Number(v))} / ${unit} · ${fmtNum(d.result)} ${unit} · ${d.campaigns} CK`, "CP"];
                }}
                contentStyle={chart.tooltip}
                cursor={{ fill: chart.cursor }}
              />
              <Bar dataKey="cp" radius={[0, 4, 4, 0]}>
                {rows.map((d, i) => <Cell key={i} fill={LINE_COLORS[d.line] || PALETTE[i % PALETTE.length]} />)}
                <LabelList dataKey="cp" position="right" formatter={(v) => fmtNum(Number(v))} style={{ fill: chart.axis, fontSize: 10 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
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
