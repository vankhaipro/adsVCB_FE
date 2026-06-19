"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SpinnerGap, MagnifyingGlass, Check, MetaLogo, TiktokLogo } from "@phosphor-icons/react";
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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCampaigns(await apiGet("/ads/campaigns"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (c: Campaign) => {
    const val = Number(edits[c.id]);
    if (!val || val <= 0) return;
    if (!confirm(`Đổi ngân sách "${c.name}" thành ${fmtVnd(val)}?\n(Tác động tài khoản thật)`)) return;
    setSavingId(c.id);
    try {
      await apiPatch(`/ads/campaigns/${c.id}`, { budget: val });
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
  const shown = filtered.slice(0, 150);
  const totalBudget = campaigns.reduce((s, c) => s + (c.budget || 0), 0);

  return (
    <div className="flex flex-col gap-5 w-full max-w-full overflow-x-hidden pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Ngân sách</h1>
          <p className="text-sm text-gray-400 mt-1">
            Tổng ngân sách campaign: <span className="text-gray-200 font-medium">{fmtVnd(totalBudget)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#111827] border border-[#1f2937] rounded-md px-3 py-1.5 w-full max-w-xs">
          <MagnifyingGlass size={16} className="text-gray-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm chiến dịch…"
            className="bg-transparent text-sm text-gray-200 outline-none w-full placeholder:text-gray-600"
          />
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm p-6">
            <SpinnerGap size={18} className="animate-spin" /> Đang tải…
          </div>
        ) : error ? (
          <div className="text-sm text-amber-400 bg-amber-950/30 m-4 border border-amber-900/40 rounded-md p-3">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 text-xs uppercase border-b border-[#1f2937]">
                  <th className="px-4 py-3 font-medium">Chiến dịch</th>
                  <th className="px-4 py-3 font-medium">Tài khoản</th>
                  <th className="px-4 py-3 font-medium text-right">Ngân sách hiện tại</th>
                  <th className="px-4 py-3 font-medium">Đổi thành</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((c) => (
                  <tr key={c.id} className="border-b border-[#1f2937]/60 hover:bg-[#1f2937]/40">
                    <td className="px-4 py-3 text-gray-200 max-w-[280px] truncate" title={c.name}>
                      <span className="inline-flex items-center gap-2">
                        {c.platform === "META" ? (
                          <MetaLogo size={14} weight="fill" className="text-blue-400" />
                        ) : (
                          <TiktokLogo size={14} weight="fill" className="text-pink-400" />
                        )}
                        {c.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 max-w-[140px] truncate">{c.adAccount?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-300 text-right">{c.budget > 0 ? fmtVnd(c.budget) : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={edits[c.id] ?? ""}
                          onChange={(e) => setEdits((x) => ({ ...x, [c.id]: e.target.value }))}
                          placeholder="VD: 200000"
                          className="bg-[#0a0a0a] border border-[#1f2937] rounded-md px-2 py-1 text-sm text-gray-200 outline-none w-32"
                        />
                        <button
                          onClick={() => save(c)}
                          disabled={savingId === c.id || !edits[c.id]}
                          className="text-xs px-2.5 py-1.5 rounded-md border border-blue-900/50 text-blue-400 hover:bg-blue-950/40 disabled:opacity-40"
                        >
                          {savingId === c.id ? <SpinnerGap size={14} className="animate-spin" /> : <Check size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > shown.length && (
              <div className="text-xs text-gray-500 px-4 py-3">Hiển thị {shown.length} / {filtered.length}.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
