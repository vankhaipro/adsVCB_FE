"use client";

import { useEffect, useState, useRef } from "react";
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

// Custom Dropdown Component để thay thế hoàn toàn thẻ select và datalist nguyên bản
function FilterDropdown({
  label,
  value,
  options,
  onChange,
  searchable = false,
  placeholder,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  searchable?: boolean;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayLabel = value || "Tất cả";
  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch("");
        }}
        className="flex items-center gap-1.5 bg-muted/50 border border-border hover:bg-card hover:border-border/80 transition-colors rounded-lg px-3 py-1.5 text-xs text-foreground cursor-pointer text-left select-none max-w-[220px]"
      >
        <span className="text-muted-foreground font-medium shrink-0">{label}:</span>
        <span className="font-semibold truncate max-w-[120px]" title={displayLabel}>{displayLabel}</span>
        <CaretDown size={10} className="text-muted-foreground shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 z-50 min-w-[180px] max-w-[260px] bg-card border border-border rounded-lg shadow-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {searchable && (
            <div className="p-2 border-b border-border bg-background/50">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder || `Tìm ${label.toLowerCase()}...`}
                className="w-full bg-card border border-border rounded px-2 py-1 text-xs text-foreground outline-none focus:border-blue-500"
              />
            </div>
          )}
          <div className="max-h-48 overflow-y-auto p-1 divide-y divide-border/20 scrollbar-thin">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 text-xs rounded transition-colors ${
                value === "" 
                  ? "bg-blue-600/20 text-blue-400 font-semibold" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Tất cả
            </button>
            {filtered.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => {
                  onChange(o);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 text-xs rounded transition-colors truncate ${
                  value === o 
                    ? "bg-blue-600/20 text-blue-400 font-semibold" 
                    : "text-foreground hover:bg-muted"
                }`}
                title={o}
              >
                {o}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="p-3 text-center text-xs text-muted-foreground">Không tìm thấy</div>
            )}
          </div>
        </div>
      )}
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
      .then((r: { name?: string }[]) =>
        setTeamNames([...new Set(r.map((t) => t.name ?? "").filter(Boolean))])
      )
      .catch(() => {});
    apiGet("/employees")
      .then((r: { name?: string }[]) =>
        setStaffNames([...new Set(r.map((e) => e.name ?? "").filter(Boolean))])
      )
      .catch(() => {});
  }, []);

  const conceptOpts = uniq(items.map((i) => i.concept));
  const lineOpts = uniq(items.map((i) => i.line));
  const channelOpts = uniq(items.map((i) => i.channel));
  const teamOpts = teamNames.length ? teamNames : uniq(items.map((i) => i.team));

  const set = (patch: Partial<ContentDimFilters>) => onChange({ ...value, ...patch });
  const hasActive = !!(value.concept || value.line || value.team || value.staff || value.channel);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterDropdown label="Concept" value={value.concept} options={conceptOpts} onChange={(v) => set({ concept: v })} searchable={false} />
      <FilterDropdown label="Tuyến" value={value.line} options={lineOpts} onChange={(v) => set({ line: v })} searchable={false} />
      <FilterDropdown label="Team" value={value.team} options={teamOpts} onChange={(v) => set({ team: v })} searchable={true} />
      <FilterDropdown label="Nhân sự" value={value.staff} options={staffNames} onChange={(v) => set({ staff: v })} searchable={true} placeholder="Tìm nhân sự…" />
      <FilterDropdown label="Kênh" value={value.channel} options={channelOpts} onChange={(v) => set({ channel: v })} searchable={true} />

      {hasActive && (
        <button
          type="button"
          onClick={() => onChange(EMPTY_DIM_FILTERS)}
          className="px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors hover:underline"
        >
          Xóa lọc
        </button>
      )}
    </div>
  );
}
