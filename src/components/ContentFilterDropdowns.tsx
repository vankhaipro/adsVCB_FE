"use client";

import { useEffect, useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { apiGet } from "@/lib/api";

export type ContentDimFilters = {
  concept: string;
  line: string;
  team: string;
  staff: string;
  channel: string;
};

export const EMPTY_DIM_FILTERS: ContentDimFilters = {
  concept: "",
  line: "",
  team: "",
  staff: "",
  channel: "",
};

type Item = {
  concept?: string;
  line?: string;
  team?: string;
  staff?: string;
  channel?: string;
};

// Một dòng có khớp toàn bộ điều kiện lọc đang chọn không (AND).
// concept/line/team/channel: khớp chính xác; staff: khớp chứa (gõ tên một phần).
export function matchContentFilters(it: Item, f: ContentDimFilters): boolean {
  const eq = (val: string | undefined, sel: string) => !sel || (val ?? "") === sel;
  const has = (val: string | undefined, sel: string) =>
    !sel || (val ?? "").toLowerCase().includes(sel.toLowerCase());
  return (
    eq(it.concept, f.concept) &&
    eq(it.line, f.line) &&
    eq(it.team, f.team) &&
    has(it.staff, f.staff) &&
    eq(it.channel, f.channel)
  );
}

function uniq(vals: (string | undefined)[]) {
  return [...new Set(vals.map((v) => (v ?? "").trim()).filter((v) => v && v !== "-"))].sort((a, b) =>
    a.localeCompare(b)
  );
}

function SelectBox({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-muted/50 border border-border rounded-lg pl-3 pr-7 py-1.5 text-xs text-foreground appearance-none focus:border-blue-500 focus:outline-none cursor-pointer max-w-[160px]"
      >
        <option value="">{label}: Tất cả</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <CaretDown
        size={10}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
    </div>
  );
}

export default function ContentFilterDropdowns({
  items,
  value,
  onChange,
}: {
  items: Item[];
  value: ContentDimFilters;
  onChange: (f: ContentDimFilters) => void;
}) {
  // Danh sách gốc Team/Nhân viên từ Settings (đầy đủ, không phụ thuộc dữ liệu video).
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [staffNames, setStaffNames] = useState<string[]>([]);
  useEffect(() => {
    apiGet("/teams")
      .then((r: { name?: string }[]) => setTeamNames(r.map((t) => t.name ?? "").filter(Boolean)))
      .catch(() => {});
    apiGet("/employees")
      .then((r: { name?: string }[]) => setStaffNames(r.map((e) => e.name ?? "").filter(Boolean)))
      .catch(() => {});
  }, []);

  const conceptOpts = uniq(items.map((i) => i.concept));
  const lineOpts = uniq(items.map((i) => i.line));
  const channelOpts = uniq(items.map((i) => i.channel));
  // Team ưu tiên danh sách gốc; fallback derive từ dữ liệu nếu chưa tải xong.
  const teamOpts = teamNames.length ? teamNames : uniq(items.map((i) => i.team));

  const set = (patch: Partial<ContentDimFilters>) => onChange({ ...value, ...patch });
  const hasActive = !!(value.concept || value.line || value.team || value.staff || value.channel);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SelectBox label="Concept" value={value.concept} options={conceptOpts} onChange={(v) => set({ concept: v })} />
      <SelectBox label="Tuyến" value={value.line} options={lineOpts} onChange={(v) => set({ line: v })} />
      <SelectBox label="Team" value={value.team} options={teamOpts} onChange={(v) => set({ team: v })} />

      {/* Nhân sự: gõ tên để lọc (gợi ý toàn bộ nhân viên) */}
      <div className="relative">
        <input
          list="content-staff-options"
          value={value.staff}
          onChange={(e) => set({ staff: e.target.value })}
          placeholder="Nhân sự: gõ tên…"
          className="bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:border-blue-500 focus:outline-none w-[150px]"
        />
        <datalist id="content-staff-options">
          {staffNames.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </div>

      <SelectBox label="Kênh" value={value.channel} options={channelOpts} onChange={(v) => set({ channel: v })} />

      {hasActive && (
        <button
          type="button"
          onClick={() => onChange(EMPTY_DIM_FILTERS)}
          className="px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          Xóa lọc
        </button>
      )}
    </div>
  );
}
