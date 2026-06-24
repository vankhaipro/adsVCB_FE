"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowsClockwise, SpinnerGap, Plus, Trash, Broadcast,
} from "@phosphor-icons/react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";

type Channel = {
  id: string;
  staff: string | null;
  team: string | null;
  channelName: string;
  platform: string;
  externalId: string | null;
  url: string | null;
  isActive: boolean;
  createdAt: string;
  followers: number;
  lastSyncAt: string | null;
};

const PLATFORM_LABEL: Record<string, string> = {
  TIKTOK: "TikTok", YOUTUBE: "YouTube", FACEBOOK: "Facebook", INSTAGRAM: "Instagram",
};
const PLATFORM_COLOR: Record<string, string> = {
  TIKTOK: "bg-pink-500/20 text-pink-400",
  YOUTUBE: "bg-red-500/20 text-red-400",
  FACEBOOK: "bg-blue-500/20 text-blue-400",
  INSTAGRAM: "bg-purple-500/20 text-purple-400",
};

const fmtNum = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n || 0));
const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  // Form thêm kênh
  const [url, setUrl] = useState("");
  const [staff, setStaff] = useState("");
  const [team, setTeam] = useState("");
  const [channelName, setChannelName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setChannels(await apiGet("/channels"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addChannel = async () => {
    if (!url.trim()) {
      setError("Vui lòng nhập URL kênh");
      return;
    }
    setAdding(true);
    setError(null);
    try {
      await apiPost("/channels", {
        url: url.trim(),
        staff: staff.trim() || undefined,
        team: team.trim() || undefined,
        channelName: channelName.trim() || undefined,
      });
      setUrl(""); setStaff(""); setTeam(""); setChannelName("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Thêm kênh lỗi");
    } finally {
      setAdding(false);
    }
  };

  const toggleActive = async (c: Channel) => {
    try {
      await apiPatch(`/channels/${c.id}`, { isActive: !c.isActive });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cập nhật trạng thái lỗi");
    }
  };

  const syncOne = async (id: string) => {
    setSyncingId(id);
    setError(null);
    try {
      await apiGet(`/organic/sync/${id}`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đồng bộ kênh lỗi");
    } finally {
      setSyncingId(null);
    }
  };

  const syncAll = async () => {
    setSyncingAll(true);
    setError(null);
    try {
      await apiGet("/organic/sync");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đồng bộ lỗi");
    } finally {
      setSyncingAll(false);
    }
  };

  const remove = async (c: Channel) => {
    if (!confirm(`Xóa kênh "${c.channelName}"?`)) return;
    try {
      await apiDelete(`/channels/${c.id}`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xóa kênh lỗi");
    }
  };

  const inputCls =
    "bg-[#1e293b] border border-[#334155] rounded-md px-3 py-2 text-sm text-white outline-none focus:border-blue-500 placeholder:text-gray-500";

  return (
    <div className="flex flex-col gap-5 w-full max-w-full overflow-x-hidden pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Broadcast size={24} className="text-blue-400" /> Kênh organic
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {channels.length} kênh — kênh BẬT sẽ được lấy dữ liệu qua RapidAPI.
          </p>
        </div>
        <button
          onClick={syncAll}
          disabled={syncingAll}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-md transition-colors"
        >
          {syncingAll ? <SpinnerGap size={16} className="animate-spin" /> : <ArrowsClockwise size={16} />}
          Đồng bộ tất cả
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-md px-4 py-2">
          {error}
        </div>
      )}

      {/* Form thêm kênh */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Thêm kênh mới</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 flex-1 min-w-[260px]">
            <label className="text-xs text-gray-400">URL kênh *</label>
            <input
              className={inputCls}
              placeholder="https://www.tiktok.com/@tenkenh"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1 w-[160px]">
            <label className="text-xs text-gray-400">Tên kênh</label>
            <input className={inputCls} placeholder="(tự điền nếu trống)" value={channelName} onChange={(e) => setChannelName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1 w-[140px]">
            <label className="text-xs text-gray-400">Nhân viên</label>
            <input className={inputCls} value={staff} onChange={(e) => setStaff(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1 w-[140px]">
            <label className="text-xs text-gray-400">Team</label>
            <input className={inputCls} value={team} onChange={(e) => setTeam(e.target.value)} />
          </div>
          <button
            onClick={addChannel}
            disabled={adding}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-medium rounded-md transition-colors h-[38px]"
          >
            {adding ? <SpinnerGap size={16} className="animate-spin" /> : <Plus size={16} />}
            Thêm
          </button>
        </div>
        <p className="text-[11px] text-gray-500 mt-2">Nền tảng &amp; ID kênh được tự nhận diện từ URL.</p>
      </div>

      {/* Bảng kênh */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-3">
          <SpinnerGap size={32} className="animate-spin text-blue-500" />
          <span className="text-sm text-gray-400">Đang tải...</span>
        </div>
      ) : (
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="border-b border-[#1e293b] text-blue-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Nhân viên</th>
                  <th className="px-4 py-3 font-medium">Team</th>
                  <th className="px-4 py-3 font-medium">Tên kênh</th>
                  <th className="px-4 py-3 font-medium">Nền tảng</th>
                  <th className="px-4 py-3 font-medium">ID kênh</th>
                  <th className="px-4 py-3 font-medium">URL</th>
                  <th className="px-4 py-3 font-medium text-right">Followers</th>
                  <th className="px-4 py-3 font-medium text-center">Trạng thái</th>
                  <th className="px-4 py-3 font-medium">Date thêm</th>
                  <th className="px-4 py-3 font-medium text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]/60 text-gray-300">
                {channels.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-10 text-center text-gray-500">Chưa có kênh nào. Thêm kênh bằng URL ở trên.</td></tr>
                ) : (
                  channels.map((c) => (
                    <tr key={c.id} className="hover:bg-[#1e293b]/40">
                      <td className="px-4 py-2.5">{c.staff || "—"}</td>
                      <td className="px-4 py-2.5">{c.team || "—"}</td>
                      <td className="px-4 py-2.5 font-medium text-white max-w-[200px] truncate" title={c.channelName}>{c.channelName}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${PLATFORM_COLOR[c.platform] || "bg-gray-500/20 text-gray-400"}`}>
                          {PLATFORM_LABEL[c.platform] || c.platform}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-400">{c.externalId || "—"}</td>
                      <td className="px-4 py-2.5 max-w-[180px] truncate">
                        {c.url ? <a href={c.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline" title={c.url}>{c.url}</a> : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-200">{fmtNum(c.followers)}</td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          onClick={() => toggleActive(c)}
                          title={c.isActive ? "Đang BẬT — bấm để tắt" : "Đang TẮT — bấm để bật"}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${c.isActive ? "bg-green-600" : "bg-gray-600"}`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${c.isActive ? "translate-x-5" : "translate-x-1"}`} />
                        </button>
                      </td>
                      <td className="px-4 py-2.5 text-gray-400">{fmtDate(c.createdAt)}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => syncOne(c.id)}
                            disabled={syncingId === c.id}
                            title="Đồng bộ kênh này"
                            className="text-gray-400 hover:text-blue-400 disabled:opacity-50"
                          >
                            {syncingId === c.id ? <SpinnerGap size={16} className="animate-spin" /> : <ArrowsClockwise size={16} />}
                          </button>
                          <button onClick={() => remove(c)} title="Xóa kênh" className="text-gray-400 hover:text-red-400">
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
