"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, SpinnerGap, Play, Trash, GitBranch, X } from "@phosphor-icons/react";
import { apiGet, apiPost, apiPatch } from "@/lib/api";
import { API_URL } from "@/lib/api";

type Rule = {
  id: string;
  name: string;
  platform: string | null;
  condition: { metric?: string; value?: string };
  action: { type?: string; execute?: boolean };
  schedule: string | null;
  isActive: boolean;
  lastRunAt: string | null;
};

const CRON = [
  { v: "*/30 * * * *", l: "Mỗi 30 phút" },
  { v: "0 * * * *", l: "Mỗi giờ" },
  { v: "0 7 * * *", l: "07:00 hằng ngày" },
  { v: "0 23 * * *", l: "23:00 hằng ngày" },
];
const condLabel = (c: Rule["condition"]) =>
  c.metric === "status" ? `Trạng thái = ${c.value}` : c.metric === "budget_gt" ? `Ngân sách > ${c.value}` : "Mọi chiến dịch";
const actLabel = (a: Rule["action"]) =>
  a.type === "pause" ? "Tắt" : a.type === "enable" ? "Bật" : "Chỉ cảnh báo";

export default function AutoRulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [f, setF] = useState({
    name: "",
    platform: "",
    condMetric: "all",
    condValue: "",
    actType: "notify",
    schedule: "0 7 * * *",
    isActive: false,
  });

  const load = useCallback(() => {
    setLoading(true);
    apiGet("/rules").then(setRules).catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    if (!f.name) return;
    setSaving(true);
    try {
      await apiPost("/rules", {
        name: f.name,
        platform: f.platform || null,
        condition:
          f.condMetric === "all" ? { metric: "all" } : { metric: f.condMetric, value: f.condValue },
        action: f.actType === "notify" ? { type: "notify" } : { type: f.actType, execute: true },
        schedule: f.schedule,
        isActive: f.isActive,
      });
      setShow(false);
      setF({ name: "", platform: "", condMetric: "all", condValue: "", actType: "notify", schedule: "0 7 * * *", isActive: false });
      load();
    } catch (e) {
      alert("Lỗi: " + (e instanceof Error ? e.message : ""));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (r: Rule) => {
    setBusy(r.id);
    try {
      await apiPatch(`/rules/${r.id}`, { isActive: !r.isActive });
      setRules((p) => p.map((x) => (x.id === r.id ? { ...x, isActive: !x.isActive } : x)));
    } finally {
      setBusy(null);
    }
  };

  const runNow = async (r: Rule) => {
    if (r.action.execute && !confirm(`Chạy thử "${r.name}" — sẽ THỰC THI ${actLabel(r.action)} lên campaign khớp (tài khoản thật). Tiếp tục?`)) return;
    setBusy(r.id);
    try {
      const res = await apiPost(`/rules/${r.id}/run`);
      alert(`Đã chạy: ${res.matched ?? 0} chiến dịch khớp điều kiện.`);
      load();
    } catch (e) {
      alert("Lỗi: " + (e instanceof Error ? e.message : ""));
    } finally {
      setBusy(null);
    }
  };

  const remove = async (r: Rule) => {
    if (!confirm(`Xoá quy tắc "${r.name}"?`)) return;
    setBusy(r.id);
    try {
      await fetch(`${API_URL}/rules/${r.id}`, { method: "DELETE" });
      setRules((p) => p.filter((x) => x.id !== r.id));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quy tắc tự động</h1>
          <p className="text-sm text-muted-foreground mt-1">{rules.length} quy tắc. Engine chạy theo lịch (cron) ở backend.</p>
        </div>
        <button
          onClick={() => setShow(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-foreground text-sm font-medium rounded-md"
        >
          <Plus size={16} weight="bold" /> Tạo quy tắc
        </button>
      </div>

      {loading ? (
        <div className="p-6 text-muted-foreground text-sm flex items-center gap-2">
          <SpinnerGap size={18} className="animate-spin" /> Đang tải…
        </div>
      ) : rules.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground text-sm">
          Chưa có quy tắc nào. Bấm “Tạo quy tắc”.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rules.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <GitBranch size={20} className="text-blue-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-foreground font-medium">{r.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {r.platform ?? "Tất cả"} · NẾU {condLabel(r.condition)} → {actLabel(r.action)}
                  {r.action.execute ? " (tự thực thi)" : ""} · {CRON.find((c) => c.v === r.schedule)?.l ?? r.schedule ?? "thủ công"}
                </div>
              </div>
              <button
                onClick={() => toggleActive(r)}
                disabled={busy === r.id}
                className={`text-xs px-3 py-1.5 rounded-md border ${
                  r.isActive ? "border-green-900/50 text-green-400" : "border-border text-muted-foreground"
                }`}
              >
                {r.isActive ? "Đang bật" : "Tắt"}
              </button>
              <button
                onClick={() => runNow(r)}
                disabled={busy === r.id}
                title="Chạy thử"
                className="text-muted-foreground hover:text-foreground p-1.5"
              >
                {busy === r.id ? <SpinnerGap size={16} className="animate-spin" /> : <Play size={16} />}
              </button>
              <button onClick={() => remove(r)} disabled={busy === r.id} title="Xoá" className="text-muted-foreground hover:text-red-400 p-1.5">
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground font-semibold">Tạo quy tắc tự động</h3>
              <button onClick={() => setShow(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <input
                value={f.name}
                onChange={(e) => setF({ ...f, name: e.target.value })}
                placeholder="Tên quy tắc"
                className="bg-background border border-border rounded-md px-3 py-2 text-foreground outline-none"
              />
              <select value={f.platform} onChange={(e) => setF({ ...f, platform: e.target.value })} className="bg-background border border-border rounded-md px-3 py-2 text-foreground outline-none">
                <option value="">Mọi nền tảng</option>
                <option value="META">Meta</option>
                <option value="TIKTOK">TikTok</option>
              </select>
              <div className="flex gap-2">
                <select value={f.condMetric} onChange={(e) => setF({ ...f, condMetric: e.target.value })} className="bg-background border border-border rounded-md px-3 py-2 text-foreground outline-none flex-1">
                  <option value="all">Mọi chiến dịch</option>
                  <option value="status">Theo trạng thái</option>
                  <option value="budget_gt">Ngân sách lớn hơn</option>
                </select>
                {f.condMetric !== "all" && (
                  <input
                    value={f.condValue}
                    onChange={(e) => setF({ ...f, condValue: e.target.value })}
                    placeholder={f.condMetric === "status" ? "ACTIVE / PAUSED" : "VD: 500000"}
                    className="bg-background border border-border rounded-md px-3 py-2 text-foreground outline-none w-36"
                  />
                )}
              </div>
              <select value={f.actType} onChange={(e) => setF({ ...f, actType: e.target.value })} className="bg-background border border-border rounded-md px-3 py-2 text-foreground outline-none">
                <option value="notify">Chỉ cảnh báo (an toàn)</option>
                <option value="pause">Tắt campaign (thực thi thật)</option>
                <option value="enable">Bật campaign (thực thi thật)</option>
              </select>
              <select value={f.schedule} onChange={(e) => setF({ ...f, schedule: e.target.value })} className="bg-background border border-border rounded-md px-3 py-2 text-foreground outline-none">
                {CRON.map((c) => (
                  <option key={c.v} value={c.v}>{c.l}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-foreground">
                <input type="checkbox" checked={f.isActive} onChange={(e) => setF({ ...f, isActive: e.target.checked })} />
                Kích hoạt ngay
              </label>
              {f.actType !== "notify" && (
                <p className="text-xs text-amber-400/80">⚠️ Hành động này sẽ tác động lên tài khoản quảng cáo thật khi chạy.</p>
              )}
              <button
                onClick={create}
                disabled={saving || !f.name}
                className="mt-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-foreground font-medium rounded-md"
              >
                {saving ? <SpinnerGap size={16} className="animate-spin" /> : <Plus size={16} weight="bold" />}
                Tạo quy tắc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
