"use client";

import { useEffect, useState } from "react";
import { WarningCircle, SpinnerGap, Wrench } from "@phosphor-icons/react";
import { apiGet } from "@/lib/api";

type Alert = { id: string; type: string; severity: string; message: string; createdAt: string };

const color = (s: string) =>
  s === "CRITICAL" ? "text-red-500" : s === "WARN" ? "text-amber-400" : "text-blue-400";

// Tạm khoá trang: luật sinh cảnh báo còn đang hoàn thiện, số liệu hiển thị chưa tin được.
// Đổi về false là trang chạy lại như cũ — toàn bộ code bên dưới giữ nguyên, không xoá gì.
const UNDER_DEVELOPMENT = true;

export default function AlertsPage() {
  const [items, setItems] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (UNDER_DEVELOPMENT) return; // không gọi API khi trang đang khoá
    apiGet("/alerts").then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Đặt SAU các hook để không vi phạm rules-of-hooks (hook phải chạy vô điều kiện).
  if (UNDER_DEVELOPMENT) {
    return (
      <div className="flex flex-col gap-5 pb-10">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cảnh báo</h1>
          <p className="text-sm text-muted-foreground mt-1">Tính năng đang được hoàn thiện.</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-10 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-muted/40 border border-border flex items-center justify-center">
            <Wrench size={22} className="text-muted-foreground" />
          </div>
          <h2 className="text-base font-semibold text-foreground">Đang trong quá trình phát triển</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Bộ luật sinh cảnh báo đang được xây dựng lại. Trang sẽ mở lại khi các cảnh báo phản ánh
            đúng số liệu thực tế.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cảnh báo</h1>
        <p className="text-sm text-muted-foreground mt-1">{items.length} cảnh báo gần đây.</p>
      </div>
      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {loading ? (
          <div className="p-6 text-muted-foreground text-sm flex items-center gap-2">
            <SpinnerGap size={18} className="animate-spin" /> Đang tải…
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">Chưa có cảnh báo.</div>
        ) : (
          items.map((a) => (
            <div key={a.id} className="flex items-start gap-3 p-4">
              <WarningCircle size={18} weight="fill" className={`${color(a.severity)} mt-0.5 flex-shrink-0`} />
              <div className="flex-1">
                <div className="flex justify-between gap-3">
                  <p className="text-sm text-foreground">{a.message}</p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(a.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{a.type}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
