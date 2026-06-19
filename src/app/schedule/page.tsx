"use client";

import { useEffect, useState } from "react";
import { SpinnerGap, Calendar } from "@phosphor-icons/react";
import { apiGet } from "@/lib/api";

type Rule = {
  id: string;
  name: string;
  platform: string | null;
  schedule: string | null;
  isActive: boolean;
  lastRunAt: string | null;
};

const CRON_LABEL: Record<string, string> = {
  "*/30 * * * *": "Mỗi 30 phút",
  "0 * * * *": "Mỗi giờ",
  "0 7 * * *": "07:00 hằng ngày",
  "0 23 * * *": "23:00 hằng ngày",
};

export default function SchedulePage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/schedule").then(setRules).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-5 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Lịch trình</h1>
        <p className="text-sm text-gray-400 mt-1">Các quy tắc tự động chạy theo lịch.</p>
      </div>
      {loading ? (
        <div className="p-6 text-gray-400 text-sm flex items-center gap-2">
          <SpinnerGap size={18} className="animate-spin" /> Đang tải…
        </div>
      ) : rules.length === 0 ? (
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-6 text-center text-gray-500 text-sm">
          Chưa có lịch trình. Tạo quy tắc có lịch ở tab <span className="text-gray-300">Quy tắc tự động</span>.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rules.map((r) => (
            <div key={r.id} className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-white font-semibold">
                  <Calendar size={18} className="text-blue-400" />
                  {r.name}
                </span>
                <span className={`text-xs ${r.isActive ? "text-green-500" : "text-gray-500"}`}>
                  {r.isActive ? "Đang bật" : "Tắt"}
                </span>
              </div>
              <div className="text-sm text-gray-300">{CRON_LABEL[r.schedule ?? ""] ?? r.schedule}</div>
              <div className="text-xs text-gray-500">
                Nền tảng: {r.platform ?? "Tất cả"} · Lần chạy gần nhất:{" "}
                {r.lastRunAt ? new Date(r.lastRunAt).toLocaleString("vi-VN") : "chưa chạy"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
