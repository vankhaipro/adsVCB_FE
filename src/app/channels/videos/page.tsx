"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
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

  const [error, setError] = useState<string | null>(null);

  // "Đang tải" suy ra từ URL đang hiển thị so với URL cần tải (xem ad-accounts).
  const url = useMemo(() => {
    const q = new URLSearchParams();
    if (channelId) q.set("channelId", channelId);
    if (platform) q.set("platform", platform);
    return `/organic/videos?${q.toString()}`;
  }, [channelId, platform]);
  const [result, setResult] = useState<{ url: string; rows: VideoRow[] } | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiGet(url)
      .then((d) => {
        if (cancelled) return;
        setResult({ url, rows: d });
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setResult({ url, rows: [] });
        setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  const loading = result?.url !== url;
  const rows = useMemo(() => result?.rows ?? [], [result]);

  const title = rows[0]?.channelName || "Video organic";

  return (
    <div className="flex flex-col gap-5 w-full max-w-full overflow-x-hidden pb-10">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/channels")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{rows.length} bài viết (tháng hiện tại)</p>
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-md px-4 py-2">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center p-20 gap-3 text-muted-foreground">
          <SpinnerGap size={28} className="animate-spin text-blue-500" /> Đang tải...
        </div>
      ) : (
        <div className="bg-background border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="border-b border-border text-blue-400">
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
              <tbody className="divide-y divide-border text-foreground">
                {rows.length === 0 ? (
                  <tr><td colSpan={11} className="px-4 py-10 text-center text-muted-foreground">Chưa có dữ liệu. Hãy đồng bộ kênh.</td></tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={i} className="hover:bg-card/40">
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
                      <td className="px-4 py-2.5 max-w-[160px] truncate text-muted-foreground" title={r.hashtags || ""}>{r.hashtags || "—"}</td>
                      <td className="px-4 py-2.5 text-right">{fmtNum(r.views)}</td>
                      <td className="px-4 py-2.5 text-right">{fmtNum(r.likes)}</td>
                      <td className="px-4 py-2.5 text-right">{fmtNum(r.shares)}</td>
                      <td className="px-4 py-2.5 text-right">{fmtNum(r.comments)}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">{fmtNum(r.followers)}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(r.postedAt)}</td>
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
    <Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground text-sm">Đang tải...</div>}>
      <VideosInner />
    </Suspense>
  );
}
