"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SpinnerGap, MagnifyingGlass, Check, MetaLogo, TiktokLogo, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { apiGet, apiPatch, fmtVnd } from "@/lib/api";

type Campaign = {
  id: string;
  platform: string;
  name: string;
  budget: number;
  adAccount: { name: string | null } | null;
};

export default function BudgetPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // Phân trang
  const [page, setPage] = useState(0);
  const BUDGET_PER_PAGE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCampaigns(await apiGet("/mkt-api/campaigns"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Reset trang về 0 khi tìm kiếm
  useEffect(() => {
    setPage(0);
  }, [q]);

  const save = async (c: Campaign) => {
    const val = Number(edits[c.id]);
    if (!val || val <= 0) return;
    if (!confirm(`Đổi ngân sách "${c.name}" thành ${fmtVnd(val)}?\n(Tác động tài khoản thật)`)) return;
    setSavingId(c.id);
    try {
      await apiPatch(`/mkt-api/campaigns/${c.id}`, { budget: val });
      setCampaigns((prev) => prev.map((x) => (x.id === c.id ? { ...x, budget: val } : x)));
      setEdits((e) => ({ ...e, [c.id]: "" }));
    } catch (e) {
      alert("Lỗi: " + (e instanceof Error ? e.message : ""));
    } finally {
      setSavingId(null);
    }
  };

  const filtered = useMemo(
    () => campaigns.filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase())),
    [campaigns, q]
  );

  // Tính toán phân trang
  const pages = Math.max(1, Math.ceil(filtered.length / BUDGET_PER_PAGE));
  const start = page * BUDGET_PER_PAGE;
  const shown = filtered.slice(start, start + BUDGET_PER_PAGE);

  const pageRange = [...Array(pages).keys()].filter(i => {
    const maxVisible = 5;
    let startPage = Math.max(0, page - 2);
    let endPage = Math.min(pages - 1, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(0, endPage - maxVisible + 1);
    }
    return i >= startPage && i <= endPage;
  });

  const totalBudget = campaigns.reduce((s, c) => s + (c.budget || 0), 0);

  return (
    <div className="flex flex-col gap-5 w-full max-w-full overflow-x-hidden pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Ngân sách</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tổng ngân sách chiến dịch: <span className="text-blue-400 font-bold text-base">{fmtVnd(totalBudget)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-md px-3 py-1.5 w-full max-w-xs">
          <MagnifyingGlass size={16} className="text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm chiến dịch…"
            className="bg-transparent text-sm text-foreground outline-none w-full placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Hướng dẫn sử dụng */}
      <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg p-3 text-xs">
        📌 <strong>Mục đích trang này:</strong> Cho phép bạn xem nhanh và chỉnh sửa ngân sách hàng ngày của toàn bộ chiến dịch quảng cáo (Meta & TikTok) trực tiếp tại đây. Khi nhập số tiền mới và nhấn nút tích xanh (✓), hệ thống sẽ gọi API cập nhật trực tiếp lên tài khoản quảng cáo thực tế của bạn ngay lập tức.
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-md">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm p-6 justify-center">
            <SpinnerGap size={18} className="animate-spin text-blue-500" /> Đang tải dữ liệu…
          </div>
        ) : error ? (
          <div className="text-sm text-amber-400 bg-amber-950/30 m-4 border border-amber-900/40 rounded-md p-3">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-muted-foreground text-xs uppercase border-b border-border bg-card/50">
                  <th className="px-4 py-3 font-semibold">Chiến dịch</th>
                  <th className="px-4 py-3 font-semibold">Tài khoản quảng cáo</th>
                  <th className="px-4 py-3 font-semibold text-right">Ngân sách hiện tại</th>
                  <th className="px-4 py-3 font-semibold text-center w-52">Đổi ngân sách thành (đ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {shown.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      Không tìm thấy chiến dịch nào.
                    </td>
                  </tr>
                ) : (
                  shown.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-foreground font-medium max-w-[320px] truncate" title={c.name}>
                        <span className="inline-flex items-center gap-2">
                          {c.platform === "META" ? (
                            <MetaLogo size={14} weight="fill" className="text-blue-400" />
                          ) : (
                            <TiktokLogo size={14} weight="fill" className="text-pink-400" />
                          )}
                          {c.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate" title={c.adAccount?.name ?? ""}>
                        {c.adAccount?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-foreground text-right font-semibold font-mono">
                        {c.budget > 0 ? fmtVnd(c.budget) : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <input
                            type="number"
                            value={edits[c.id] ?? ""}
                            onChange={(e) => setEdits((x) => ({ ...x, [c.id]: e.target.value }))}
                            placeholder="VD: 200000"
                            className="bg-background border border-border rounded-md px-2 py-1 text-xs text-foreground outline-none w-32 focus:border-blue-500 font-mono"
                          />
                          <button
                            onClick={() => save(c)}
                            disabled={savingId === c.id || !edits[c.id]}
                            className="text-xs p-1.5 rounded-md border border-blue-600/30 text-blue-400 hover:bg-blue-600/20 disabled:opacity-40 cursor-pointer transition-colors"
                          >
                            {savingId === c.id ? <SpinnerGap size={14} className="animate-spin" /> : <Check size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Phân trang */}
            {filtered.length > BUDGET_PER_PAGE && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-card/10">
                <span className="text-[12px] text-muted-foreground">
                  Hiển thị {start + 1}–{Math.min(start + BUDGET_PER_PAGE, filtered.length)} trong {filtered.length} chiến dịch
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <CaretLeft size={14} weight="bold" />
                  </button>
                  
                  {pageRange.map(i => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`w-6 h-6 flex items-center justify-center rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        page === i 
                          ? "bg-blue-600 text-white" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage(p => Math.min(pages - 1, p + 1))}
                    disabled={page === pages - 1}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <CaretRight size={14} weight="bold" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
