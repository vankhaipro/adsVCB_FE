"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, SpinnerGap, ArrowSquareOut } from "@phosphor-icons/react";
import { apiGet } from "@/lib/api";

type VideoRow = {
  platform: string;
  channelName: string | null;
  channelUrl: string | null;
  staff: string | null;
  team: string | null;
  postUrl: string | null;
  caption: string | null;
  hashtags: string | null;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  followers: number;
  postedAt: string | null;
};

const PLATFORM_LABEL: Record<string, string> = {
  TIKTOK: "TikTok", YOUTUBE: "YouTube", FACEBOOK: "Facebook", INSTAGRAM: "Instagram",
};
const fmtNum = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n || 0));
const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

function VideosInner() {
  const params = useSearchParams();
  const router = useRouter();
  const channelId = params.get("channelId") || "";
  const platform = params.get("platform") || "";

  const [rows, setRows] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams();
      if (channelId) q.set("channelId", channelId);
      if (platform) q.set("platform", platform);
      setRows(await apiGet(`/organic/videos?${q.toString()}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [channelId, platform]);

  useEffect(() => {
    load();
  }, [load]);

  const title = rows[0]?.channelName || "Video organic";

  return (
    <div className="flex flex-col gap-5 w-full max-w-full overflow-x-hidden pb-10">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/channels")} className="text-gray-400 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-sm text-gray-400 mt-1">{rows.length} bài viết (tháng hiện tại)</p>
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-md px-4 py-2">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center p-20 gap-3 text-gray-400">
          <SpinnerGap size={28} className="animate-spin text-blue-500" /> Đang tải...
        </div>
      ) : (
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="border-b border-[#1e293b] text-blue-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Nền tảng</th>
                  <th className="px-4 py-3 font-medium">Tên kênh</th>
                  <th className="px-4 py-3 font-medium">Bài viết</th>
                  <th className="px-4 py-3 font-medium">Caption</th>
                  <th className="px-4 py-3 font-medium">Hashtag</th>
                  <th className="px-4 py-3 font-medium text-right">Views</th>
                  <th className="px-4 py-3 font-medium text-right">Like</th>
                  <th className="px-4 py-3 font-medium text-right">Share</th>
                  <th className="px-4 py-3 font-medium text-right">Comment</th>
                  <th className="px-4 py-3 font-medium text-right">Follow</th>
                  <th className="px-4 py-3 font-medium">Ngày đăng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]/60 text-gray-300">
                {rows.length === 0 ? (
                  <tr><td colSpan={11} className="px-4 py-10 text-center text-gray-500">Chưa có dữ liệu. Hãy đồng bộ kênh.</td></tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={i} className="hover:bg-[#1e293b]/40">
                      <td className="px-4 py-2.5">{PLATFORM_LABEL[r.platform] || r.platform}</td>
                      <td className="px-4 py-2.5 max-w-[140px] truncate" title={r.channelName || ""}>{r.channelName || "—"}</td>
                      <td className="px-4 py-2.5">
                        {r.postUrl ? (
                          <a href={r.postUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">
                            Mở <ArrowSquareOut size={12} />
                          </a>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-2.5 max-w-[220px] truncate" title={r.caption || ""}>{r.caption || "—"}</td>
                      <td className="px-4 py-2.5 max-w-[160px] truncate text-gray-400" title={r.hashtags || ""}>{r.hashtags || "—"}</td>
                      <td className="px-4 py-2.5 text-right">{fmtNum(r.views)}</td>
                      <td className="px-4 py-2.5 text-right">{fmtNum(r.likes)}</td>
                      <td className="px-4 py-2.5 text-right">{fmtNum(r.shares)}</td>
                      <td className="px-4 py-2.5 text-right">{fmtNum(r.comments)}</td>
                      <td className="px-4 py-2.5 text-right text-gray-400">{fmtNum(r.followers)}</td>
                      <td className="px-4 py-2.5 text-gray-400">{fmtDate(r.postedAt)}</td>
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

export default function ChannelVideosPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-400 text-sm">Đang tải...</div>}>
      <VideosInner />
    </Suspense>
  );
}
