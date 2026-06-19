"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowsClockwise, SpinnerGap, MagnifyingGlass, MetaLogo, TiktokLogo, Plus, X,
} from "@phosphor-icons/react";
import { apiGet, apiPatch, apiPost, fmtVnd } from "@/lib/api";

type Campaign = {
  id: string;
  platform: string;
  name: string;
  status: string | null;
  objective: string | null;
  budget: number;
  adAccount: { name: string | null; platform: string } | null;
};
type Account = { id: string; platform: string; name: string | null };

const RUNNING = new Set(["ACTIVE", "ENABLE", "CAMPAIGN_STATUS_ENABLE"]);
const isRunning = (s: string | null) => !!s && RUNNING.has(s);

const OBJECTIVES: Record<string, string[]> = {
  META: ["OUTCOME_TRAFFIC", "OUTCOME_ENGAGEMENT", "OUTCOME_LEADS", "OUTCOME_SALES", "OUTCOME_AWARENESS"],
  TIKTOK: ["TRAFFIC", "ENGAGEMENT", "VIDEO_VIEWS", "REACH", "WEB_CONVERSIONS", "LEAD_GENERATION"],
};

function PlatformBadge({ platform }: { platform: string }) {
  const meta = platform === "META";
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${meta ? "text-blue-400" : "text-pink-400"}`}>
      {meta ? <MetaLogo size={14} weight="fill" /> : <TiktokLogo size={14} weight="fill" />}
      {meta ? "Meta" : "TikTok"}
    </span>
  );
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [platform, setPlatform] = useState<"ALL" | "META" | "TIKTOK">("ALL");
  const [q, setQ] = useState("");

  // create modal
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ accountId: "", name: "", objective: "", budget: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, a] = await Promise.all([apiGet("/ads/campaigns"), apiGet("/ads/accounts")]);
      setCampaigns(c);
      setAccounts(a);
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

  const toggle = async (c: Campaign) => {
    const turnOn = !isRunning(c.status);
    if (!confirm(`${turnOn ? "BẬT" : "TẮT"} chiến dịch "${c.name}"?\n(Tác động lên tài khoản quảng cáo thật)`)) return;
    setBusyId(c.id);
    try {
      const updated = await apiPatch(`/ads/campaigns/${c.id}/status`, { on: turnOn });
      setCampaigns((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: updated.status } : x)));
    } catch (e) {
      alert("Lỗi: " + (e instanceof Error ? e.message : "không đổi được trạng thái"));
    } finally {
      setBusyId(null);
    }
  };

  const submitCreate = async () => {
    if (!form.accountId || !form.name) return;
    setCreating(true);
    try {
      await apiPost("/ads/campaigns", {
        accountId: form.accountId,
        name: form.name,
        objective: form.objective || undefined,
        budget: form.budget ? Number(form.budget) : undefined,
      });
      setShowCreate(false);
      setForm({ accountId: "", name: "", objective: "", budget: "" });
      await load();
    } catch (e) {
      alert("Lỗi tạo campaign: " + (e instanceof Error ? e.message : ""));
    } finally {
      setCreating(false);
    }
  };

  const filtered = useMemo(
    () =>
      campaigns.filter(
        (c) => (platform === "ALL" || c.platform === platform) && (!q || c.name.toLowerCase().includes(q.toLowerCase()))
      ),
    [campaigns, platform, q]
  );
  const shown = filtered.slice(0, 150);
  const selectedAccount = accounts.find((a) => a.id === form.accountId);

  return (
    <div className="flex flex-col gap-5 w-full max-w-full overflow-x-hidden pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Chiến dịch</h1>
          <p className="text-sm text-gray-400 mt-1">{filtered.length} chiến dịch (Meta + TikTok).</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1f2937] hover:bg-[#374151] text-gray-200 text-sm font-medium rounded-md border border-[#374151]"
          >
            <Plus size={16} weight="bold" /> Tạo chiến dịch
          </button>
          <button
            onClick={sync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-md"
          >
            {syncing ? <SpinnerGap size={16} className="animate-spin" /> : <ArrowsClockwise size={16} />}
            Đồng bộ
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-[#111827] border border-[#1f2937] rounded-md p-1">
          {(["ALL", "META", "TIKTOK"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`px-3 py-1.5 text-xs rounded ${platform === p ? "bg-[#1f2937] text-white" : "text-gray-400 hover:text-white"}`}
            >
              {p === "ALL" ? "Tất cả" : p === "META" ? "Meta" : "TikTok"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-[#111827] border border-[#1f2937] rounded-md px-3 py-1.5 flex-1 min-w-[200px] max-w-sm">
          <MagnifyingGlass size={16} className="text-gray-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên chiến dịch…"
            className="bg-transparent text-sm text-gray-200 outline-none w-full placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm p-6">
            <SpinnerGap size={18} className="animate-spin" /> Đang tải…
          </div>
        ) : error ? (
          <div className="text-sm text-amber-400 bg-amber-950/30 m-4 border border-amber-900/40 rounded-md p-3">
            {error} — kiểm tra backend đã chạy (npm run dev trong adsVCB_BE).
          </div>
        ) : shown.length === 0 ? (
          <div className="text-sm text-gray-500 p-6 text-center">Chưa có chiến dịch. Bấm “Đồng bộ”.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 text-xs uppercase border-b border-[#1f2937]">
                  <th className="px-4 py-3 font-medium">Chiến dịch</th>
                  <th className="px-4 py-3 font-medium">Nền tảng</th>
                  <th className="px-4 py-3 font-medium">Tài khoản</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-right">Ngân sách</th>
                  <th className="px-4 py-3 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((c) => (
                  <tr key={c.id} className="border-b border-[#1f2937]/60 hover:bg-[#1f2937]/40">
                    <td className="px-4 py-3 text-gray-200 max-w-[300px] truncate" title={c.name}>{c.name}</td>
                    <td className="px-4 py-3"><PlatformBadge platform={c.platform} /></td>
                    <td className="px-4 py-3 text-gray-400 max-w-[150px] truncate">{c.adAccount?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${isRunning(c.status) ? "text-green-500" : "text-gray-500"}`}>
                        ● {c.status ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-right">{c.budget > 0 ? fmtVnd(c.budget) : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggle(c)}
                        disabled={busyId === c.id}
                        className={`text-xs px-3 py-1.5 rounded-md border disabled:opacity-50 ${
                          isRunning(c.status)
                            ? "border-red-900/50 text-red-400 hover:bg-red-950/40"
                            : "border-green-900/50 text-green-400 hover:bg-green-950/40"
                        }`}
                      >
                        {busyId === c.id ? "…" : isRunning(c.status) ? "Tắt" : "Bật"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > shown.length && (
              <div className="text-xs text-gray-500 px-4 py-3">
                Hiển thị {shown.length} / {filtered.length} — lọc bớt để xem thêm.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Tạo chiến dịch mới</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-xs text-gray-400">Tài khoản</label>
              <select
                value={form.accountId}
                onChange={(e) => setForm({ ...form, accountId: e.target.value, objective: "" })}
                className="bg-[#0a0a0a] border border-[#1f2937] rounded-md px-3 py-2 text-sm text-gray-200 outline-none"
              >
                <option value="">— Chọn tài khoản —</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.platform}] {a.name ?? a.id}
                  </option>
                ))}
              </select>

              <label className="text-xs text-gray-400">Tên chiến dịch</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-[#0a0a0a] border border-[#1f2937] rounded-md px-3 py-2 text-sm text-gray-200 outline-none"
                placeholder="VD: Test - Remarketing"
              />

              <label className="text-xs text-gray-400">Mục tiêu</label>
              <select
                value={form.objective}
                onChange={(e) => setForm({ ...form, objective: e.target.value })}
                disabled={!selectedAccount}
                className="bg-[#0a0a0a] border border-[#1f2937] rounded-md px-3 py-2 text-sm text-gray-200 outline-none disabled:opacity-50"
              >
                <option value="">— Mặc định —</option>
                {(OBJECTIVES[selectedAccount?.platform ?? ""] ?? []).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>

              <label className="text-xs text-gray-400">Ngân sách/ngày (đ, tuỳ chọn)</label>
              <input
                type="number"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="bg-[#0a0a0a] border border-[#1f2937] rounded-md px-3 py-2 text-sm text-gray-200 outline-none"
                placeholder="VD: 100000"
              />

              <p className="text-xs text-amber-400/80">⚠️ Chiến dịch tạo mới mặc định ở trạng thái TẮT (PAUSED) trên tài khoản thật.</p>

              <button
                onClick={submitCreate}
                disabled={creating || !form.accountId || !form.name}
                className="mt-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-md"
              >
                {creating ? <SpinnerGap size={16} className="animate-spin" /> : <Plus size={16} weight="bold" />}
                Tạo (PAUSED)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
