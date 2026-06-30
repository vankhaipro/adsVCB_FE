"use client";

import { useEffect, useRef, useState } from "react";
import { Funnel, CaretDown, Plus, X } from "@phosphor-icons/react";

export type MetricCondition = { metric: string; op: string; value: string; value2?: string };

export const METRICS: { id: string; label: string }[] = [
  { id: "spend", label: "Chi tiêu" },
  { id: "impressions", label: "Lượt hiển thị" },
  { id: "reach", label: "Người tiếp cận" },
  { id: "clicks", label: "Lượt click" },
  { id: "messages", label: "Tin nhắn" },
  { id: "results", label: "Kết quả" },
  { id: "ctr", label: "CTR (%)" },
  { id: "cpc", label: "CPC" },
  { id: "cpm", label: "CPM" },
  { id: "costPerResult", label: "Chi phí/Kết quả" },
];

export const OPS: { id: string; label: string }[] = [
  { id: "gt", label: "> lớn hơn" },
  { id: "gte", label: "≥ lớn hơn hoặc bằng" },
  { id: "lt", label: "< nhỏ hơn" },
  { id: "lte", label: "≤ nhỏ hơn hoặc bằng" },
  { id: "eq", label: "= bằng" },
  { id: "between", label: "Trong khoảng" },
];

// Điều kiện đã đủ thông tin để áp dụng?
export function condComplete(c: MetricCondition): boolean {
  if (!c.metric || !c.op) return false;
  if (c.op === "between") return c.value !== "" && c.value2 != null && c.value2 !== "";
  return c.value !== "";
}

// So khớp một giá trị chỉ số với điều kiện.
export function matchMetric(value: number | undefined, c: MetricCondition): boolean {
  const v = Number(value) || 0;
  const a = Number(c.value) || 0;
  const b = Number(c.value2) || 0;
  switch (c.op) {
    case "gt":
      return v > a;
    case "gte":
      return v >= a;
    case "lt":
      return v < a;
    case "lte":
      return v <= a;
    case "eq":
      return v === a;
    case "between":
      return v >= Math.min(a, b) && v <= Math.max(a, b);
    default:
      return true;
  }
}

const SELECT_CLS =
  "bg-background border border-border rounded-md px-2 py-1.5 text-xs text-foreground outline-none cursor-pointer";
const INPUT_CLS =
  "bg-background border border-border rounded-md px-2 py-1.5 text-xs text-foreground outline-none w-20";

type Props = {
  value: MetricCondition[];
  onApply: (conds: MetricCondition[]) => void;
};

export default function MetricFilter({ value, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<MetricCondition[]>(value);
  const ref = useRef<HTMLDivElement>(null);

  // Mở panel -> nạp lại draft từ giá trị đang áp dụng (thêm 1 dòng trống nếu rỗng)
  useEffect(() => {
    if (open) {
      setDraft(value.length ? value : [{ metric: "spend", op: "gt", value: "" }]);
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const update = (i: number, patch: Partial<MetricCondition>) =>
    setDraft((d) => d.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const addRow = () => setDraft((d) => [...d, { metric: "spend", op: "gt", value: "" }]);
  const removeRow = (i: number) => setDraft((d) => d.filter((_, idx) => idx !== i));

  const apply = () => {
    onApply(draft.filter(condComplete));
    setOpen(false);
  };
  const clearAll = () => {
    setDraft([{ metric: "spend", op: "gt", value: "" }]);
    onApply([]);
    setOpen(false);
  };

  const activeCount = value.length;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 border rounded-md px-3 py-1.5 text-xs transition-colors ${
          activeCount > 0
            ? "bg-blue-500/10 border-blue-500/40 text-foreground"
            : "bg-background border-border text-muted-foreground hover:bg-card"
        }`}
      >
        <Funnel size={14} className={activeCount > 0 ? "text-blue-500" : "text-blue-400"} weight={activeCount > 0 ? "fill" : "regular"} />
        <span className="font-medium">Lọc theo chỉ số</span>
        {activeCount > 0 && (
          <span className="bg-blue-600 text-white rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none">
            {activeCount}
          </span>
        )}
        <CaretDown size={12} className="text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 w-[380px] bg-card border border-border rounded-xl shadow-xl p-4">
          <div className="text-sm font-semibold text-foreground mb-3">Lọc theo chỉ số</div>

          <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto">
            {draft.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <select
                  value={c.metric}
                  onChange={(e) => update(i, { metric: e.target.value })}
                  className={`${SELECT_CLS} flex-1`}
                >
                  {METRICS.map((m) => (
                    <option key={m.id} value={m.id} className="bg-background">
                      {m.label}
                    </option>
                  ))}
                </select>
                <select
                  value={c.op}
                  onChange={(e) => update(i, { op: e.target.value })}
                  className={SELECT_CLS}
                  title={OPS.find((o) => o.id === c.op)?.label}
                >
                  {OPS.map((o) => (
                    <option key={o.id} value={o.id} className="bg-background">
                      {o.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={c.value}
                  onChange={(e) => update(i, { value: e.target.value })}
                  placeholder="0"
                  className={INPUT_CLS}
                />
                {c.op === "between" && (
                  <>
                    <span className="text-muted-foreground text-xs">→</span>
                    <input
                      type="number"
                      value={c.value2 ?? ""}
                      onChange={(e) => update(i, { value2: e.target.value })}
                      placeholder="0"
                      className={INPUT_CLS}
                    />
                  </>
                )}
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-muted"
                  aria-label="Xóa điều kiện"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1 mt-2 text-xs font-medium text-blue-500 hover:text-blue-600"
          >
            <Plus size={14} /> Thêm điều kiện
          </button>

          <div className="flex justify-between items-center gap-2 mt-4 pt-3 border-t border-border">
            <button
              type="button"
              onClick={clearAll}
              className="px-3 py-2 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Xóa hết
            </button>
            <button
              type="button"
              onClick={apply}
              className="px-4 py-2 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
