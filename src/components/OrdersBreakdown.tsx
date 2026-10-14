"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";
import { useChartColors } from "@/lib/chartTheme";
import { ChartPie, UsersThree } from "@phosphor-icons/react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import type { ExportSheet } from "@/lib/exportExcel";
import { channelKey, filterOrders, formatOrderMoney, groupOrders, orderStaff, orderTeam, UNKNOWN_ORDER_OWNER, type OrderFilters, type OrderGroup, type SalesDashboard } from "@/lib/salesOrders";

const COLORS = ["#3b82f6", "#db2777", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#64748b"];
const num = (n: number) => new Intl.NumberFormat("vi-VN").format(n);
const date = (s: string) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(s));
const emptyFilters = { platform: "", channel: "", staff: "", team: "", status: "REVENUE", search: "", role: "owner" as const };
const marketFilters = (market: string) => ({ ...emptyFilters, status: market === "GLOBAL" ? "ALL" : "REVENUE" });
export type OrdersBreakdownHandle = { exportSheets: () => ExportSheet[] };

function Select({ label, value, options, onChange, all = true }: { label: string; value: string; options: { id: string; label: string }[]; onChange: (v: string) => void; all?: boolean }) {
  return <label className="flex flex-col gap-1 text-xs text-muted-foreground min-w-36 max-w-full">
    {label}
    <select aria-label={label} value={value} onChange={e => onChange(e.target.value)} className="border border-border rounded-lg bg-card text-foreground px-3 py-2 text-sm max-w-64">
      {all && <option value="">Tất cả</option>}
      {value && !options.some(o => o.id === value) && <option value={value}>{value} (không có đơn trong kỳ)</option>}
      {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
    </select>
  </label>;
}

function GroupTable({ title, rows, staff = false, total, onSelect }: { title: string; rows: OrderGroup[]; staff?: boolean; total: number; onSelect: (row: OrderGroup) => void }) {
  return <section className="bg-card border border-border rounded-xl p-5 shadow-sm">
    <h3 className="font-semibold text-sm mb-4">{title} <span className="text-muted-foreground font-normal">({rows.length})</span></h3>
    <div className="overflow-auto max-h-[440px]">
      <table className="w-full text-xs text-left whitespace-nowrap">
        <thead className="sticky top-0 bg-card text-muted-foreground border-b border-border"><tr>
          <th className="p-3">{staff ? "Nhân viên" : title === "Theo team" ? "Team" : "Kênh"}</th>
          {staff && <th className="p-3">Team</th>}
          <th className="p-3 text-right">Số đơn</th><th className="p-3 text-right">Doanh thu</th><th className="p-3 text-right">% DT</th><th className="p-3">Chi tiết</th>
        </tr></thead>
        <tbody className="divide-y divide-border">
          {!rows.length && <tr><td colSpan={staff ? 6 : 5} className="p-8 text-center text-muted-foreground">Không có đơn phù hợp bộ lọc</td></tr>}
          {rows.map(r => <tr key={r.key} className="hover:bg-muted/30">
            <td className="p-3 font-medium max-w-72 truncate" title={r.name}>{r.name}</td>
            {staff && <td className="p-3 text-muted-foreground">{r.team}</td>}
            <td className="p-3 text-right tabular-nums">{num(r.orders)}</td>
            <td className="p-3 text-right font-semibold tabular-nums">{formatOrderMoney(r.revenue, r.currency)}</td>
            <td className="p-3 text-right text-muted-foreground">{total > 0 ? (r.revenue / total * 100).toFixed(1) : "0"}%</td>
            <td className="p-3"><button className="text-blue-500 hover:underline" onClick={() => onSelect(r)}>Xem đơn</button></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </section>;
}

export default forwardRef<OrdersBreakdownHandle, { query: string }>(function OrdersBreakdown({ query }, ref) {
  const [market, setMarket] = useState("VIETNAM");
  const [result, setResult] = useState<{ key: string; data?: SalesDashboard; error?: string } | null>(null);
  const [retry, setRetry] = useState(0);
  const [filters, setFilters] = useState<Omit<OrderFilters, "currency">>(emptyFilters);
  const [selectedCurrency, setCurrency] = useState("");
  const [view, setView] = useState<"staff" | "channel" | "team" | "orders">("staff");
  const [page, setPage] = useState(1);
  const chart = useChartColors();
  const requestKey = `${market}:${query}:${retry}`;
  const current = result?.key === requestKey ? result : null;
  const data = current?.data;
  const loading = !current;

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(query);
    params.set("market", market);
    if (retry) params.set("refresh", String(retry));
    apiGet(`/sales-orders/dashboard?${params}`)
      .then((value: SalesDashboard) => { if (!cancelled) setResult({ key: requestKey, data: value }); })
      .catch((e: Error) => { if (!cancelled) setResult({ key: requestKey, error: e.message || "Không tải được đơn hàng." }); });
    return () => { cancelled = true; };
  }, [query, market, requestKey, retry]);

  const allOrders = useMemo(() => data?.orders ?? [], [data]);
  const currencyCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of allOrders) counts.set(o.currency, (counts.get(o.currency) || 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [allOrders]);
  const currencies = currencyCounts.map(([code]) => code);
  const currency = currencies.includes(selectedCurrency) ? selectedCurrency : currencies[0] || "VND";
  const options = useMemo(() => {
    const rows = allOrders.filter(o => o.currency === currency);
    const unique = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b, "vi")).map(s => ({ id: s, label: s }));
    return {
      platforms: unique(rows.map(o => o.platform)), staffs: unique(rows.map(o => orderStaff(o, filters.role))),
      teams: unique(rows.map(o => orderTeam(o, filters.role))), statuses: unique(rows.map(o => o.status)),
      channels: [...new Map(rows.map(o => [channelKey(o), { id: channelKey(o), label: `${o.channel} · ${o.platform}${o.pageId ? ` · ${o.pageId}` : ""}` }])).values()].sort((a, b) => a.label.localeCompare(b.label, "vi")),
    };
  }, [allOrders, currency, filters.role]);
  const orders = useMemo(() => filterOrders(allOrders, { ...filters, currency }), [allOrders, filters, currency]);
  const byStaff = useMemo(() => groupOrders(orders, "staff", filters.role), [orders, filters.role]);
  const byChannel = useMemo(() => groupOrders(orders, "channel", filters.role), [orders, filters.role]);
  const byTeam = useMemo(() => groupOrders(orders, "team", filters.role), [orders, filters.role]);
  const revenue = orders.reduce((sum, o) => sum + o.revenue, 0);
  const eligibleCount = orders.filter(o => o.eligible).length;
  const unknownCount = orders.filter(o => orderStaff(o, filters.role) === UNKNOWN_ORDER_OWNER || orderTeam(o, filters.role) === UNKNOWN_ORDER_OWNER).length;
  const pie = byChannel.filter(r => r.revenue > 0).slice(0, 6).map(r => ({ name: r.name, value: r.revenue }));
  const rest = byChannel.filter(r => r.revenue > 0).slice(6).reduce((sum, r) => sum + r.revenue, 0);
  if (rest > 0) pie.push({ name: "Các kênh còn lại", value: rest });
  const pageCount = Math.max(1, Math.ceil(orders.length / 30));
  const currentPage = Math.min(page, pageCount);
  const updateFilter = <K extends keyof typeof filters>(key: K, value: typeof filters[K]) => {
    setFilters(f => ({ ...f, [key]: value })); setPage(1);
  };

  useImperativeHandle(ref, () => ({ exportSheets: (): ExportSheet[] => {
    if (!data) return [];
    const groupSheet = (name: string, rows: OrderGroup[]) => ({ name, rows: rows.map(r => ({ "Tên": r.name, "Team": r.team, "Số đơn": r.orders, "Doanh thu": r.revenue, "Tiền tệ": r.currency })) });
    return [
      { name: "Thông tin báo cáo", rows: [{ "Thị trường": market === "GLOBAL" ? "Global" : "Việt Nam", "Nguồn": data.sourceName, "Khoảng ngày": query, "Tiền tệ": currency, "Phân bổ": filters.role === "owner" ? "Người phụ trách kênh" : "Người bán", "Bộ lọc": JSON.stringify(filters), "Quy tắc doanh thu": data.revenueRule, "Cập nhật": data.loadedAt }] },
      groupSheet("Theo nhân viên", byStaff), groupSheet("Theo kênh", byChannel), groupSheet("Theo team", byTeam),
      { name: "Chi tiết đơn hàng", rows: orders.map(o => ({ "Mã đơn": o.code, "ID nguồn": o.externalId, "Nguồn": o.source, "Ngày tạo (VN)": date(o.orderedAt), "Kênh": o.channel, "ID kênh nguồn": o.pageId || "", "Nền tảng": o.platform, "Phụ trách kênh": o.owner, "Team kênh": o.team, "Người bán": o.seller, "Team người bán": o.sellerTeam, "Trạng thái": o.status, "Giá trị đơn": o.value, "Doanh thu": o.revenue, "Tiền tệ": o.currency, "Đối chiếu": o.attribution })) },
    ];
  } }), [data, market, query, currency, filters, orders, byStaff, byChannel, byTeam]);

  function showGroup(row: OrderGroup, type: "staff" | "channel" | "team") {
    const key = JSON.parse(row.key) as string[];
    setFilters(f => ({ ...f, ...(type === "staff" ? { staff: row.name, team: row.team } : type === "team" ? { team: row.name } : { channel: key[1] }) }));
    setPage(1); setView("orders");
  }

  return <div className="flex flex-col gap-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div role="tablist" aria-label="Thị trường đơn hàng" className="inline-flex p-1 bg-muted rounded-xl border border-border">
        {[{ id: "VIETNAM", label: "Việt Nam", sub: "Sapo" }, { id: "GLOBAL", label: "Global", sub: "Pancake" }].map(m => <button key={m.id} role="tab" aria-selected={market === m.id}
          onClick={() => { setMarket(m.id); setFilters(marketFilters(m.id)); setCurrency(""); setPage(1); }}
          className={`px-5 py-2 rounded-lg text-sm transition-colors ${market === m.id ? "bg-card shadow-sm text-blue-500 font-semibold" : "text-muted-foreground hover:text-foreground"}`}>
          {m.label} <span className="text-xs font-normal ml-1">· {m.sub}</span>
        </button>)}
      </div>
      {data && <span className="text-xs text-muted-foreground">{data.sourceName} · {data.syncSchedule ? 'Đồng bộ lúc' : 'Tải lúc'} {date(data.loadedAt)}{data.syncSchedule ? ` · Lịch: ${data.syncSchedule}` : ''}</span>}
    </div>
    {loading ? <div role="status" className="border border-border rounded-xl bg-card p-12 text-center text-muted-foreground animate-pulse">Đang tải và đối chiếu đơn hàng {market === "GLOBAL" ? "Pancake" : "Sapo"}…</div>
      : current?.error ? <div role="alert" className="border border-red-500/30 bg-red-500/5 rounded-xl p-6 text-sm"><p>{current.error}</p><button className="mt-3 text-blue-500 underline" onClick={() => setRetry(n => n + 1)}>Thử lại</button></div>
      : <>
        {data?.syncWarning && <p role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">{data.syncWarning}</p>}
        <div className="rounded-xl border border-border bg-card p-4 text-sm">
          <p><strong>{num(allOrders.length)} đơn trong khoảng ngày đã chọn</strong> · Tất cả trạng thái và tiền tệ, trước bộ lọc bên dưới.</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {currencyCounts.map(([code, count]) => <button key={code} onClick={() => { setCurrency(code); setFilters(marketFilters(market)); setPage(1); }}
              className={`rounded-lg border px-3 py-1.5 text-xs ${currency === code ? "border-blue-500 bg-blue-500/10 text-blue-500" : "border-border text-muted-foreground hover:bg-muted"}`}>
              {code}: {num(count)} đơn
            </button>)}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <Select label="Tiền tệ" value={currency} options={currencies.length ? currencyCounts.map(([code, count]) => ({ id: code, label: `${code} · ${num(count)} đơn` })) : [{ id: "VND", label: "VND" }]} all={false} onChange={v => { setCurrency(v); setFilters(f => ({ ...marketFilters(market), role: f.role })); setPage(1); }} />
          <Select label="Phân bổ theo" value={filters.role} all={false} options={[{ id: "owner", label: "Người phụ trách kênh" }, { id: "seller", label: "Người bán / xử lý đơn" }]} onChange={v => { setFilters(f => ({ ...f, role: v as "owner" | "seller", staff: "", team: "" })); setPage(1); }} />
          <Select label="Nền tảng" value={filters.platform} options={options.platforms} onChange={v => updateFilter("platform", v)} />
          <Select label="Kênh" value={filters.channel} options={options.channels} onChange={v => updateFilter("channel", v)} />
          <Select label="Team" value={filters.team} options={options.teams} onChange={v => updateFilter("team", v)} />
          <Select label="Nhân viên" value={filters.staff} options={options.staffs} onChange={v => updateFilter("staff", v)} />
          <Select label="Trạng thái đơn" value={filters.status} all={false} options={[{ id: "REVENUE", label: "Đơn ghi nhận doanh thu" }, { id: "ALL", label: "Tất cả trạng thái" }, ...options.statuses]} onChange={v => updateFilter("status", v)} />
          <button onClick={() => { setFilters(marketFilters(market)); setPage(1); }} className="text-xs text-blue-500 hover:underline pb-2">Đặt lại bộ lọc</button>
        </div>
        <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3 leading-relaxed">
          <p>{data?.revenueRule} Lọc theo ngày tạo đơn, múi giờ Việt Nam.</p>
          <p>Tiền giữ nguyên theo đơn, chưa quy đổi; đang xem {currency}. Nhân viên/team của kênh được đối chiếu theo danh mục hiện tại, không suy đoán từ tên người bán.</p>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[{ label: "Doanh thu", value: formatOrderMoney(revenue, currency), sub: `${num(eligibleCount)} đơn đủ điều kiện` }, { label: "Số đơn theo bộ lọc", value: num(orders.length), sub: "Bao gồm các trạng thái đã chọn" }, { label: "Kênh có đơn", value: num(new Set(orders.filter(o => o.channel !== UNKNOWN_ORDER_OWNER).map(channelKey)).size), sub: "Theo kênh nguồn của đơn" }, { label: "Chưa gán đủ người / team", value: num(unknownCount), sub: "Vẫn được tính trong tổng báo cáo" }].map(k => <div key={k.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-2">{k.label}</p><p className="text-xl font-bold break-words">{k.value}</p><p className="text-xs text-muted-foreground mt-1">{k.sub}</p>
          </div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <section className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold flex items-center gap-2"><ChartPie size={18} className="text-violet-500" /> Doanh thu theo kênh</h3>
            {pie.length ? <><div className="h-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>{pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={chart.tooltip} formatter={v => formatOrderMoney(Number(v), currency)} /></PieChart></ResponsiveContainer></div>
              <div className="grid sm:grid-cols-2 gap-2 text-xs">{pie.map((p, i) => <div key={i} className="flex items-center gap-2 min-w-0"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} /><span className="truncate flex-1" title={p.name}>{p.name}</span><span>{formatOrderMoney(p.value, currency, true)}</span></div>)}</div></>
              : <p className="py-20 text-center text-sm text-muted-foreground">Chưa có doanh thu phù hợp</p>}
          </section>
          <section className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><UsersThree size={18} className="text-blue-500" /> Doanh thu theo team · {currency}</h3>
            {byTeam.some(t => t.revenue > 0) ? <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={byTeam.slice(0, 8)} margin={{ top: 12, right: 12, bottom: 20, left: 10 }}><CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} /><XAxis dataKey="name" fontSize={10} interval={0} tickFormatter={v => String(v).length > 16 ? `${String(v).slice(0, 16)}…` : String(v)} /><YAxis fontSize={10} tickFormatter={v => new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(Number(v))} /><Tooltip contentStyle={chart.tooltip} formatter={v => formatOrderMoney(Number(v), currency)} /><Bar name="Doanh thu" dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} /></BarChart></ResponsiveContainer></div> : <p className="py-20 text-center text-sm text-muted-foreground">Chưa có doanh thu phù hợp</p>}
          </section>
        </div>
        <div className="flex flex-wrap justify-between gap-3 items-center">
          <div role="tablist" aria-label="Chi tiết doanh thu" className="flex flex-wrap gap-1">
            {([{ id: "staff", label: "Theo nhân viên" }, { id: "channel", label: "Theo kênh" }, { id: "team", label: "Theo team" }, { id: "orders", label: "Chi tiết đơn hàng" }] as const).map(t => <button key={t.id} role="tab" aria-selected={view === t.id} onClick={() => setView(t.id)} className={`px-4 py-2 rounded-lg text-sm ${view === t.id ? "bg-blue-500/10 text-blue-500 font-semibold" : "text-muted-foreground hover:bg-muted"}`}>{t.label}</button>)}
          </div>
          <input aria-label="Tìm mã đơn, kênh, nhân viên" value={filters.search} onChange={e => updateFilter("search", e.target.value)} placeholder="Tìm mã đơn, kênh, nhân viên…" className="border border-border bg-card rounded-lg px-3 py-2 text-sm w-72 max-w-full" />
        </div>
        {view === "staff" && <GroupTable title={filters.role === "owner" ? "Theo người phụ trách kênh" : "Theo người bán / xử lý đơn"} rows={byStaff} staff total={revenue} onSelect={r => showGroup(r, "staff")} />}
        {view === "channel" && <GroupTable title="Theo kênh" rows={byChannel} total={revenue} onSelect={r => showGroup(r, "channel")} />}
        {view === "team" && <GroupTable title="Theo team" rows={byTeam} total={revenue} onSelect={r => showGroup(r, "team")} />}
        {view === "orders" && <section className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Chi tiết đơn hàng <span className="font-normal text-muted-foreground">({num(orders.length)})</span></h3>
          <div className="overflow-x-auto"><table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="border-b border-border text-muted-foreground"><tr>{["Mã đơn / ID nguồn", "Ngày tạo", "Kênh / Nền tảng", "Phụ trách kênh", "Team kênh", "Người bán", "Team người bán", "Trạng thái", "Giá trị đơn", "Doanh thu", "Đối chiếu"].map(h => <th className="p-3 font-medium" key={h}>{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-border">
              {!orders.length && <tr><td colSpan={11} className="p-10 text-center text-muted-foreground">Không có đơn phù hợp bộ lọc</td></tr>}
              {orders.slice((currentPage - 1) * 30, currentPage * 30).map(o => <tr key={o.id} className="hover:bg-muted/30">
                <td className="p-3"><span className="font-semibold text-blue-500">{o.code}</span><div className="text-muted-foreground mt-1">{o.source} · {o.externalId}</div></td>
                <td className="p-3">{date(o.orderedAt)}</td><td className="p-3 max-w-72"><div className="truncate" title={o.channel}>{o.channel}</div><div className="text-muted-foreground mt-1">{o.platform}{o.pageId ? ` · ${o.pageId}` : ""}</div></td>
                <td className="p-3">{o.owner}</td><td className="p-3">{o.team}</td><td className="p-3">{o.seller}</td><td className="p-3">{o.sellerTeam}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded ${o.eligible ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>{o.status}</span></td>
                <td className="p-3 text-right tabular-nums">{formatOrderMoney(o.value, o.currency)}</td><td className="p-3 text-right font-semibold tabular-nums">{formatOrderMoney(o.revenue, o.currency)}</td><td className="p-3 text-muted-foreground">{o.attribution}</td>
              </tr>)}
            </tbody>
          </table></div>
          <div className="flex items-center justify-between gap-3 mt-4 text-xs text-muted-foreground"><span>Trang {currentPage} / {pageCount} · 30 đơn/trang</span><div className="flex gap-2"><button disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="border border-border px-3 py-2 rounded disabled:opacity-40">Trước</button><button disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)} className="border border-border px-3 py-2 rounded disabled:opacity-40">Sau</button></div></div>
        </section>}
      </>}
  </div>;
});
