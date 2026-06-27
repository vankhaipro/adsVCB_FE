"use client";

import { useEffect, useState } from "react";
import { WarningCircle, SpinnerGap } from "@phosphor-icons/react";
import { apiGet } from "@/lib/api";

type Alert = { id: string; type: string; severity: string; message: string; createdAt: string };

const color = (s: string) =>
  s === "CRITICAL" ? "text-red-500" : s === "WARN" ? "text-amber-400" : "text-blue-400";

export default function AlertsPage() {
  const [items, setItems] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/alerts").then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, []);

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
