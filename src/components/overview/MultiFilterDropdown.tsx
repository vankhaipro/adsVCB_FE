"use client";

import { useRef, useState, useEffect } from "react";
import { CaretDown, Check } from "@phosphor-icons/react";
import type { FilterPill } from "./FilterDropdown";

type MultiFilterDropdownProps = {
  label: string;
  items: FilterPill[];
  /** Mảng rỗng = không lọc ("Tất cả"). */
  values: string[];
  onChange: (v: string[]) => void;
  searchable?: boolean;
};

// Bản đa chọn của FilterDropdown, giữ nguyên ngôn ngữ thị giác của nó (cùng class nút, cùng
// panel, cùng ô tìm kiếm) nhưng cho tick nhiều mục.
//
// Cần đa chọn vì các team gộp nhóm theo nhiều chiều khác nhau: có team thuộc thị trường
// Việt Nam, có team thuộc Global; nhiều team cùng làm đồ da hoặc đá quý. Không có một
// chiều phân loại sẵn nào phủ hết, nên để người dùng tự gom.
export default function MultiFilterDropdown({
  label, items, values, onChange, searchable = false,
}: MultiFilterDropdownProps) {
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

  // 1 mục thì hiện luôn tên cho dễ đọc; nhiều mục thì hiện số lượng cho khỏi tràn nút.
  const displayLabel =
    values.length === 0
      ? "Tất cả"
      : values.length === 1
        ? (items.find((i) => i.id === values[0])?.label ?? values[0])
        : `${values.length} mục`;

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (id: string) => {
    onChange(values.includes(id) ? values.filter((v) => v !== id) : [...values, id]);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch("");
        }}
        className="flex items-center gap-1.5 bg-background border border-border hover:bg-card hover:border-border/80 transition-colors rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer text-left select-none max-w-[240px] shadow-sm"
      >
        <span className="text-muted-foreground font-medium shrink-0">{label}</span>
        <span className="font-semibold truncate max-w-[130px]" title={values.join(", ") || "Tất cả"}>
          {displayLabel}
        </span>
        <CaretDown size={10} className="text-muted-foreground shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 z-50 min-w-[220px] max-w-[300px] bg-card border border-border rounded-lg shadow-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {searchable && (
            <div className="p-2 border-b border-border bg-background/50">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Tìm ${label.replace(":", "").toLowerCase()}...`}
                className="w-full bg-card border border-border rounded px-2 py-1.5 text-xs text-foreground outline-none focus:border-blue-500"
              />
            </div>
          )}
          <div className="max-h-56 overflow-y-auto p-1 scrollbar-thin">
            {/* Bỏ tick hết = không lọc. Panel KHÔNG tự đóng khi tick để chọn liên tiếp được. */}
            <button
              type="button"
              onClick={() => onChange([])}
              className={`w-full text-left px-2.5 py-1.5 text-xs rounded transition-colors ${
                values.length === 0
                  ? "bg-blue-600/20 text-blue-400 font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Tất cả
            </button>
            {filtered.map((item) => {
              const checked = values.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggle(item.id)}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded transition-colors flex items-center gap-2 ${
                    checked ? "text-blue-400 font-semibold" : "text-foreground hover:bg-muted"
                  }`}
                  title={item.label}
                >
                  <span
                    className={`w-3.5 h-3.5 shrink-0 rounded border flex items-center justify-center ${
                      checked ? "bg-blue-600 border-blue-600" : "border-border"
                    }`}
                  >
                    {checked && <Check size={10} weight="bold" className="text-white" />}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-3 text-center text-xs text-muted-foreground">Không tìm thấy</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
