"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onChange: (p: number) => void;
};

// Phân trang gọn: "Hiển thị a–b / tổng" + nút ‹ 1 2 3 … › (cửa sổ 5 trang quanh trang hiện tại).
export default function Pagination({ page, pageSize, total, onChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const cur = Math.min(Math.max(1, page), totalPages);
  const end = Math.min(totalPages, Math.max(cur + 2, 5));
  const start = Math.max(1, end - 4);
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  const from = (cur - 1) * pageSize + 1;
  const to = Math.min(cur * pageSize, total);

  const btn =
    "min-w-[24px] h-6 px-1.5 flex items-center justify-center rounded-md border text-[16px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border text-[16px] text-muted-foreground">
      <span>
        Hiển thị {from}–{to} / {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={cur <= 1}
          onClick={() => onChange(cur - 1)}
          className={`${btn} bg-background border-border hover:bg-muted text-foreground`}
          aria-label="Trang trước"
        >
          <CaretLeft size={12} />
        </button>
        {start > 1 && <span className="px-0.5">…</span>}
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`${btn} ${
              p === cur
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-background border-border hover:bg-muted text-foreground"
            }`}
          >
            {p}
          </button>
        ))}
        {end < totalPages && <span className="px-0.5">…</span>}
        <button
          type="button"
          disabled={cur >= totalPages}
          onClick={() => onChange(cur + 1)}
          className={`${btn} bg-background border-border hover:bg-muted text-foreground`}
          aria-label="Trang sau"
        >
          <CaretRight size={12} />
        </button>
      </div>
    </div>
  );
}
