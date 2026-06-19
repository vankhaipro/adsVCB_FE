"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MetaLogo,
  TiktokLogo,
  GoogleLogo,
  PlugsConnected,
  ArrowSquareOut,
  CheckCircle,
  SpinnerGap,
  ArrowsClockwise,
} from "@phosphor-icons/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// Các nền tảng có thể kết nối (khớp integration type của Unified.to)
const providers = [
  {
    type: "metaads",
    name: "Meta Ads",
    desc: "Facebook & Instagram Ads",
    Icon: MetaLogo,
    color: "text-blue-400",
    ring: "border-blue-900/40",
  },
  {
    type: "tiktokads",
    name: "TikTok Ads",
    desc: "Quảng cáo TikTok for Business",
    Icon: TiktokLogo,
    color: "text-pink-400",
    ring: "border-pink-900/40",
  },
  {
    type: "googleads",
    name: "Google Ads",
    desc: "Chiến dịch Google / YouTube Ads",
    Icon: GoogleLogo,
    color: "text-emerald-400",
    ring: "border-emerald-900/40",
  },
];

type Connection = {
  id: string;
  integration_type?: string;
  type?: string;
  is_paused?: boolean;
};

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [synced, setSynced] = useState<Record<string, number>>({});
  const [notice, setNotice] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  // Đọc kết quả OAuth từ query (?connected=... hoặc ?error=...) khi quay về từ backend.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("connected")) {
      setNotice({ type: "ok", msg: `Đã kết nối ${p.get("connected")} thành công!` });
    } else if (p.get("error")) {
      setNotice({ type: "err", msg: `Kết nối thất bại: ${p.get("error")}` });
    }
  }, []);

  const isAds = (c: Connection) => /ads/i.test(c.integration_type ?? c.type ?? "");

  const sync = async (id: string) => {
    setSyncing(id);
    try {
      const res = await fetch(`${API_URL}/sync/${id}/campaigns`);
      const data = await res.json();
      if (typeof data.synced === "number") {
        setSynced((s) => ({ ...s, [id]: data.synced }));
      }
    } catch {
      /* bỏ qua, người dùng có thể bấm lại */
    } finally {
      setSyncing(null);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/unified/connections`);
      if (!res.ok) throw new Error(`API trả về ${res.status}`);
      const data = await res.json();
      setConnections(Array.isArray(data) ? data : []);
    } catch {
      setError(
        `Không gọi được ${API_URL}. Hãy chạy backend (npm run dev trong adsVCB_BE) và bật CORS.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-x-hidden pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <PlugsConnected size={24} weight="fill" className="text-blue-400" />
            Kết nối tài khoản
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Liên kết tài khoản quảng cáo qua Unified.to để đồng bộ dữ liệu chiến dịch.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-[#1f2937] hover:bg-[#374151] text-gray-200 text-sm font-medium rounded-md transition-colors border border-[#374151]"
        >
          <ArrowsClockwise size={16} />
          Làm mới
        </button>
      </div>

      {/* Thông báo kết quả kết nối */}
      {notice && (
        <div
          className={`text-sm rounded-md p-3 border ${
            notice.type === "ok"
              ? "text-green-400 bg-green-950/30 border-green-900/40"
              : "text-red-400 bg-red-950/30 border-red-900/40"
          }`}
        >
          {notice.msg}
        </div>
      )}

      {/* Provider cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map(({ type, name, desc, Icon, color, ring }) => (
          <div
            key={type}
            className={`bg-[#111827] border ${ring} rounded-xl p-5 flex flex-col gap-4`}
          >
            <div className="flex items-center gap-3">
              <Icon size={32} weight="fill" className={color} />
              <div>
                <div className="text-white font-semibold">{name}</div>
                <div className="text-xs text-gray-500">{desc}</div>
              </div>
            </div>
            <a
              href={`${API_URL}/connect/${type}`}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Kết nối
              <ArrowSquareOut size={15} weight="bold" />
            </a>
          </div>
        ))}
      </div>

      {/* Connected accounts */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5">
        <h2 className="text-base font-semibold text-white mb-4">
          Tài khoản đã kết nối
        </h2>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-6">
            <SpinnerGap size={18} className="animate-spin" />
            Đang tải…
          </div>
        ) : error ? (
          <div className="text-sm text-amber-400 bg-amber-950/30 border border-amber-900/40 rounded-md p-3">
            {error}
          </div>
        ) : connections.length === 0 ? (
          <div className="text-sm text-gray-500 py-6 text-center">
            Chưa có tài khoản nào được kết nối. Bấm “Kết nối” ở trên để bắt đầu.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[#1f2937]">
            {connections.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <CheckCircle size={18} weight="fill" className="text-green-500" />
                  <div>
                    <div className="text-sm text-gray-200">
                      {c.integration_type ?? c.type ?? "—"}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">{c.id}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {synced[c.id] != null && (
                    <span className="text-xs text-green-400">
                      Đã đồng bộ {synced[c.id]} campaign
                    </span>
                  )}
                  {isAds(c) && (
                    <button
                      onClick={() => sync(c.id)}
                      disabled={syncing === c.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-[#374151] bg-[#1f2937] hover:bg-[#374151] text-gray-200 disabled:opacity-60 transition-colors"
                    >
                      {syncing === c.id ? (
                        <SpinnerGap size={14} className="animate-spin" />
                      ) : (
                        <ArrowsClockwise size={14} />
                      )}
                      Đồng bộ
                    </button>
                  )}
                  <span
                    className={`text-xs ${
                      c.is_paused ? "text-gray-500" : "text-green-500"
                    }`}
                  >
                    {c.is_paused ? "Tạm dừng" : "Hoạt động"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
