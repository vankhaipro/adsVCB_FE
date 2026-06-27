"use client";

import { useEffect, useState } from "react";
import { SpinnerGap } from "@phosphor-icons/react";
import { apiGet } from "@/lib/api";

type Log = { id: string; level: string; action: string; detail: string | null; createdAt: string };

const dot = (l: string) =>
  l === "ERROR" ? "bg-red-500" : l === "WARN" ? "bg-amber-400" : "bg-green-500";

export default function LogsPage() {
  const [items, setItems] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/logs").then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-5 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nhật ký hệ thống</h1>
        <p className="text-sm text-muted-foreground mt-1">{items.length} bản ghi gần nhất.</p>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-muted-foreground text-sm flex items-center gap-2">
            <SpinnerGap size={18} className="animate-spin" /> Đang tải…
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">Chưa có nhật ký.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground text-xs uppercase border-b border-border">
                  <th className="px-4 py-3 font-medium">Thời gian</th>
                  <th className="px-4 py-3 font-medium">Mức</th>
                  <th className="px-4 py-3 font-medium">Hành động</th>
                  <th className="px-4 py-3 font-medium">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {items.map((l) => (
                  <tr key={l.id} className="border-b border-border">
                    <td className="px-4 py-2.5 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5 text-xs text-foreground">
                        <span className={`w-2 h-2 rounded-full ${dot(l.level)}`} />
                        {l.level}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-foreground font-mono text-xs">{l.action}</td>
                    <td className="px-4 py-2.5 text-muted-foreground max-w-[420px] truncate" title={l.detail ?? ""}>
                      {l.detail ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
