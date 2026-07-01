"use client";

import { useState } from "react";

// Hiển thị text (thường bị truncate trong bảng): hover xem full, bấm để sao chép.
export default function CopyableText({
  text,
  className = "",
}: {
  text: string | null | undefined;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const value = text ?? "";

  async function copy(e: React.MouseEvent) {
    e.stopPropagation();
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard bị chặn — bỏ qua, người dùng vẫn bôi đen copy được */
    }
  }

  return (
    <span
      onClick={copy}
      title={copied ? "✓ Đã sao chép" : value ? `${value}\n(Bấm để sao chép)` : ""}
      className={`cursor-pointer hover:text-blue-400 transition-colors ${className}`}
    >
      {value}
    </span>
  );
}
