"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Calendar, CaretLeft, CaretRight, CaretDown } from "@phosphor-icons/react";

/* ----------------------------- Date helpers ----------------------------- */

const pad = (n: number) => String(n).padStart(2, "0");
const toYmd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = (s: string) => new Date(`${s}T00:00:00`);
const fmtVi = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => {
  const x = startOfDay(d);
  x.setDate(x.getDate() + n);
  return x;
};
// Thứ Hai = đầu tuần. getDay(): 0=CN..6=T7 → offset so với T2
const mondayOffset = (d: Date) => (d.getDay() + 6) % 7;
const startOfWeek = (d: Date) => addDays(d, -mondayOffset(d));
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export type DatePreset = { id: string; label: string };

export const DATE_PRESETS: DatePreset[] = [
  { id: "today", label: "Hôm nay" },
  { id: "yesterday", label: "Hôm qua" },
  { id: "last7days", label: "7 ngày qua" },
  { id: "last14days", label: "14 ngày qua" },
  { id: "last30days", label: "30 ngày qua" },
  { id: "thisWeek", label: "Tuần này" },
  { id: "lastWeek", label: "Tuần trước" },
  { id: "thisMonth", label: "Tháng này" },
  { id: "lastMonth", label: "Tháng trước" },
];

// Trả về [from, to] dạng YYYY-MM-DD cho mỗi preset (tính theo hôm nay, giờ local)
export function presetToDates(id: string): { from: string; to: string } {
  const today = startOfDay(new Date());
  let from = today;
  let to = today;
  switch (id) {
    case "today":
      break;
    case "yesterday":
      from = to = addDays(today, -1);
      break;
    case "last7days":
      from = addDays(today, -6);
      break;
    case "last14days":
      from = addDays(today, -13);
      break;
    case "last30days":
      from = addDays(today, -29);
      break;
    case "thisWeek":
      from = startOfWeek(today);
      break;
    case "lastWeek":
      from = addDays(startOfWeek(today), -7);
      to = addDays(from, 6);
      break;
    case "thisMonth":
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case "lastMonth":
      from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      to = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
    default:
      from = new Date(today.getFullYear(), today.getMonth(), 1);
  }
  return { from: toYmd(from), to: toYmd(to) };
}

export function presetLabel(id: string): string {
  return DATE_PRESETS.find((p) => p.id === id)?.label ?? "Tùy chỉnh";
}

/* ------------------------------ Month grid ------------------------------ */

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function MonthGrid({
  month,
  from,
  to,
  today,
  onPick,
}: {
  month: Date; // ngày 1 của tháng
  from: Date | null;
  to: Date | null;
  today: Date;
  onPick: (d: Date) => void;
}) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstDay = new Date(year, m, 1);
  const lead = mondayOffset(firstDay);
  const daysInMonth = new Date(year, m + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, m, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const monthName = `Tháng ${m + 1} ${year}`;

  return (
    <div className="w-full sm:w-[260px] shrink-0">
      <div className="text-center text-sm font-semibold text-foreground mb-2">{monthName}</div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[14px] text-muted-foreground mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isFrom = from && sameDay(d, from);
          const isTo = to && sameDay(d, to);
          const inRange = from && to && d > from && d < to;
          const isToday = sameDay(d, today);
          const isEnd = isFrom || isTo;

          return (
            <div key={i} className="flex justify-center">
              <button
                type="button"
                onClick={() => onPick(d)}
                className={[
                  "w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                  isEnd
                    ? "bg-blue-600 text-white font-semibold"
                    : inRange
                      ? "bg-blue-500/15 text-foreground rounded-none"
                      : "text-foreground hover:bg-muted",
                  !isEnd && isToday ? "ring-1 ring-blue-500" : "",
                ].join(" ")}
              >
                {d.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------- Main component ----------------------------- */

type Props = {
  presetId: string;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  onApply: (v: { presetId: string; from: string; to: string }) => void;
};

export default function DateRangePicker({ presetId, from, to, onApply }: Props) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [vw, setVw] = useState(1280);
  // Vị trí panel (toạ độ viewport). Panel dùng position: fixed để không bị cắt bởi vùng cuộn
  // của <main> hay tràn khỏi màn hình — nút "Hủy/Áp dụng" luôn nằm trong tầm bấm.
  const [pos, setPos] = useState<{ left: number; top: number; maxH: number }>({ left: 8, top: 8, maxH: 520 });
  const isMobile = vw < 640;
  const showTwoMonths = vw >= 860;

  // draft state khi panel mở
  const [draftFrom, setDraftFrom] = useState<Date | null>(parseYmd(from));
  const [draftTo, setDraftTo] = useState<Date | null>(parseYmd(to));
  const [draftPreset, setDraftPreset] = useState(presetId);
  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const f = parseYmd(from);
    return new Date(f.getFullYear(), f.getMonth(), 1);
  });

  // Mỗi lần mở panel → nạp lại draft từ giá trị hiện tại. Bắt đúng nhịp chuyển
  // đóng→mở và điều chỉnh state ngay trong render: dùng useEffect ở đây sẽ vẽ panel
  // một nhịp với draft cũ rồi mới ghi đè.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      const f = parseYmd(from);
      setDraftFrom(f);
      setDraftTo(parseYmd(to));
      setDraftPreset(presetId);
      setViewMonth(new Date(f.getFullYear(), f.getMonth(), 1));
    }
  }

  // Tính vị trí panel theo trigger, kẹp trong viewport; cập nhật khi resize/scroll.
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setVw(w);
      const r = triggerRef.current?.getBoundingClientRect();
      if (!r) return;
      const panelW = Math.min(w - 16, w >= 860 ? 150 + 2 * 260 + 130 : 150 + 260 + 100);
      const left = Math.max(8, Math.min(r.left, w - panelW - 8));
      // Đủ chỗ phía dưới thì mở xuống; không thì mở lên nếu phía trên rộng hơn.
      const below = h - r.bottom - 16;
      const above = r.top - 16;
      const openUp = below < 420 && above > below;
      const maxH = Math.max(280, openUp ? above : below);
      const top = openUp ? Math.max(8, r.top - 8 - Math.min(maxH, 560)) : r.bottom + 8;
      setPos({ left, top, maxH: Math.min(maxH, 620) });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  // Đóng khi click ra ngoài / nhấn Esc
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

  const pickDay = (d: Date) => {
    setDraftPreset("custom");
    if (!draftFrom || draftTo) {
      setDraftFrom(d);
      setDraftTo(null);
    } else if (d < draftFrom) {
      setDraftTo(draftFrom);
      setDraftFrom(d);
    } else {
      setDraftTo(d);
    }
  };

  const pickPreset = (id: string) => {
    const { from: f, to: t } = presetToDates(id);
    const fd = parseYmd(f);
    setDraftFrom(fd);
    setDraftTo(parseYmd(t));
    setDraftPreset(id);
    setViewMonth(new Date(fd.getFullYear(), fd.getMonth(), 1));
  };

  const apply = () => {
    if (!draftFrom) return;
    const end = draftTo ?? draftFrom;
    onApply({ presetId: draftPreset, from: toYmd(draftFrom), to: toYmd(end) });
    setOpen(false);
  };

  const rightMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);
  const fieldText =
    draftFrom ? `${fmtVi(draftFrom)} - ${fmtVi(draftTo ?? draftFrom)}` : "Chọn khoảng thời gian";
  const triggerLabel =
    presetId === "custom"
      ? `${fmtVi(parseYmd(from))} - ${fmtVi(parseYmd(to))}`
      : presetLabel(presetId);

  return (
    <div className="relative" ref={ref} suppressHydrationWarning>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-background border border-border rounded-md px-3 py-1.5 text-xs hover:bg-card transition-colors"
      >
        <Calendar size={14} className="text-blue-400" />
        <span className="text-muted-foreground">Thời gian:</span>
        <span className="text-foreground font-medium">{triggerLabel}</span>
        <CaretDown size={12} className="text-muted-foreground" />
      </button>

      {/* Panel */}
      {open && (
        <>
          {/* Nền mờ chỉ trên mobile (bottom sheet) */}
          {isMobile && <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} />}
          <div
            className={`fixed z-50 flex flex-col sm:flex-row bg-card border border-border shadow-xl overflow-hidden ${
              isMobile ? "inset-x-2 bottom-2 rounded-2xl" : "rounded-xl"
            }`}
            style={
              isMobile
                ? { maxHeight: "calc(100dvh - 16px)" }
                : { left: pos.left, top: pos.top, maxHeight: pos.maxH, maxWidth: "calc(100vw - 16px)" }
            }
          >
            {/* Cột preset: mobile = hàng chip cuộn ngang, desktop = cột dọc */}
            <div className="sm:w-[150px] sm:border-r border-b sm:border-b-0 border-border sm:py-2 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-y-auto sm:overflow-x-hidden p-2 sm:p-0 shrink-0">
              {DATE_PRESETS.map((p) => {
                const active = draftPreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => pickPreset(p.id)}
                    className={`flex items-center gap-2 whitespace-nowrap sm:w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-sm rounded-full sm:rounded-none transition-colors ${
                      active ? "bg-blue-500/10 text-foreground font-medium" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span
                      className={`hidden sm:flex w-3.5 h-3.5 rounded-full border flex-shrink-0 items-center justify-center ${
                        active ? "border-blue-600" : "border-border"
                      }`}
                    >
                      {active && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                    </span>
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Cột lịch: phần cuộn + chân cố định (nút luôn thấy được) */}
            <div className="flex flex-col min-h-0 min-w-0 flex-1">
              <div className="p-3 sm:p-4 overflow-y-auto min-h-0">
                <div className="mb-3 px-3 py-2 border border-border rounded-md text-sm text-foreground bg-background">
                  {fieldText}
                </div>

                <div className="flex items-start gap-2 sm:gap-6">
                  <button
                    type="button"
                    onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                    className="p-1 rounded hover:bg-muted text-muted-foreground mt-0.5 shrink-0"
                    aria-label="Tháng trước"
                  >
                    <CaretLeft size={16} />
                  </button>

                  <div className="flex flex-1 justify-center gap-6 min-w-0">
                    <MonthGrid month={viewMonth} from={draftFrom} to={draftTo} today={today} onPick={pickDay} />
                    {showTwoMonths && (
                      <MonthGrid month={rightMonth} from={draftFrom} to={draftTo} today={today} onPick={pickDay} />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                    className="p-1 rounded hover:bg-muted text-muted-foreground mt-0.5 shrink-0"
                    aria-label="Tháng sau"
                  >
                    <CaretRight size={16} />
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 px-3 sm:px-4 py-3 border-t border-border bg-card shrink-0">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md border border-border text-foreground hover:bg-muted transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={apply}
                  disabled={!draftFrom}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-60"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
