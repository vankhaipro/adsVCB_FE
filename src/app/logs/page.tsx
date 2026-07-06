"use client";

import { useEffect, useState } from "react";
import { SpinnerGap, CheckCircle, XCircle, Clock, MagnifyingGlass, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { apiGet } from "@/lib/api";

type Log = { id: string; level: string; action: string; detail: string | null; createdAt: string };
type Channel = {
  id: string;
  channelName: string;
  platform: string;
  url: string | null;
  isActive: boolean;
  lastSyncAt: string | null;
  videoCount: number;
};

const PLATFORM_LABEL: Record<string, string> = {
  TIKTOK: "TikTok", YOUTUBE: "YouTube", FACEBOOK: "Facebook", INSTAGRAM: "Instagram",
  THREADS: "Threads", ZALO: "Zalo", SHOPEE: "Shopee",
};

const PLATFORM_COLOR: Record<string, string> = {
  TIKTOK: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
  YOUTUBE: "bg-red-500/10 text-red-400 border border-red-500/20",
  FACEBOOK: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  INSTAGRAM: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  THREADS: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20",
  ZALO: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
  SHOPEE: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
};

const dot = (l: string) =>
  l === "ERROR" ? "bg-red-500" : l === "WARN" ? "bg-amber-400" : "bg-green-500";

const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

// Hàm chuyển đổi chi tiết lỗi kỹ thuật thô thành thông tin rõ ràng, dễ hiểu cho người dùng
function parseErrorDetail(detail: string | null): string {
  if (!detail) return "—";
  
  const d = detail.trim();
  
  if (d.includes("Nền tảng THREADS chưa được hỗ trợ")) {
    return "Nền tảng THREADS chưa được hỗ trợ đồng bộ.";
  }
  if (d.includes("Kênh chưa có ID (URL không hợp lệ?)")) {
    return "URL kênh không đúng định dạng hoặc thiếu ID/Handle (Không thể quét dữ liệu).";
  }
  
  // Xử lý các lỗi HTTP từ ScrapeCreators
  if (d.includes("ScrapeCreators GET")) {
    const httpStatusMatch = /GET (\/[^\s]+) (\d{3}):/.exec(d);
    if (httpStatusMatch) {
      const endpoint = httpStatusMatch[1];
      const statusCode = httpStatusMatch[2];
      
      if (statusCode === "404") {
        if (endpoint.includes("youtube")) {
          return "Lỗi 404: Không tìm thấy kênh YouTube (URL hoặc Handle có thể đã bị nhập sai/đổi tên).";
        }
        if (endpoint.includes("facebook")) {
          return "Lỗi 404: Không tìm thấy trang Facebook (Hãy kiểm tra lại URL trang).";
        }
        if (endpoint.includes("instagram")) {
          return "Lỗi 404: Không tìm thấy tài khoản Instagram (Hãy kiểm tra lại username).";
        }
        if (endpoint.includes("tiktok")) {
          return "Lỗi 404: Không tìm thấy tài khoản TikTok (Hãy kiểm tra lại handle).";
        }
        return `Lỗi 404: Không tìm thấy tài khoản/kênh trên nền tảng.`;
      }
      
      if (statusCode === "500") {
        return "Lỗi 500: Sự cố từ máy chủ ScrapeCreators (bị chặn quét dữ liệu hoặc quá tải). Vui lòng thử lại sau.";
      }
      
      // Trích xuất message hoặc error trong JSON nếu có
      try {
        const jsonPart = d.substring(d.indexOf("{"));
        const parsedJson = JSON.parse(jsonPart);
        if (parsedJson.message) return `Lỗi API (${statusCode}): ${parsedJson.message}`;
        if (parsedJson.error) return `Lỗi API (${statusCode}): ${parsedJson.error}`;
      } catch (e) {
        // bỏ qua
      }
      
      return `Lỗi hệ thống API bên thứ ba (Mã lỗi ${statusCode}).`;
    }
  }
  
  return d;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"sync" | "raw">("sync");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SUCCESS" | "FAILED" | "PENDING">("ALL");

  // Phân trang
  const [syncPage, setSyncPage] = useState(0);
  const SYNC_PER_PAGE = 10;
  
  const [rawPage, setRawPage] = useState(0);
  const RAW_PER_PAGE = 15;

  useEffect(() => {
    Promise.all([apiGet("/logs"), apiGet("/channels")])
      .then(([l, c]) => {
        setLogs(l);
        // Loại bỏ các kênh có platform UNKNOWN
        setChannels(c.filter((ch: any) => ch.platform && ch.platform.toUpperCase() !== "UNKNOWN"));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Reset trang về 0 khi thay đổi bộ lọc hoặc tab
  useEffect(() => {
    setSyncPage(0);
    setRawPage(0);
  }, [search, statusFilter, activeTab]);

  const syncStatuses = channels.map((c) => {
    const relevantLog = logs.find((l) => {
      if (l.action !== "organic.sync" || !l.detail) return false;
      
      // 1) Khớp chính xác tuyệt đối bằng ID kênh nếu có
      if (l.detail.includes(`(ID: ${c.id})`)) return true;
      
      // 2) Khớp dự phòng bằng Tên kênh + Nền tảng (dùng cho các log cũ)
      const hasName = l.detail.includes(c.channelName);
      if (!hasName) return false;
      
      const lowDetail = l.detail.toLowerCase();
      const plat = c.platform.toLowerCase();
      
      // Đảm bảo từ khóa nền tảng khớp với log để tránh lỗi nhầm lẫn
      if (plat === "youtube" && (lowDetail.includes("youtube") || lowDetail.includes("yt"))) return true;
      if (plat === "facebook" && (lowDetail.includes("facebook") || lowDetail.includes("fb"))) return true;
      if (plat === "instagram" && (lowDetail.includes("instagram") || lowDetail.includes("ig"))) return true;
      if (plat === "tiktok" && lowDetail.includes("tiktok")) return true;
      
      // Nếu là log cũ chưa ghi rõ nền tảng nhưng trùng tên kênh
      const otherPlatforms = ["youtube", "facebook", "instagram", "tiktok"].filter(p => p !== plat);
      const hasOtherPlatform = otherPlatforms.some(p => lowDetail.includes(p));
      if (!hasOtherPlatform) return true;
      
      return false;
    });

    let status: "SUCCESS" | "FAILED" | "PENDING" = "PENDING";
    let detail = "Chưa chạy đồng bộ";
    let rawDetail = "";
    let time = c.lastSyncAt || null;

    if (relevantLog) {
      time = relevantLog.createdAt;
      rawDetail = relevantLog.detail || "";
      const logText = relevantLog.detail || "";
      
      if (relevantLog.level === "INFO" && logText.includes("thành công")) {
        status = "SUCCESS";
        const idx = logText.indexOf("thành công: ");
        if (idx !== -1) {
          detail = logText.substring(idx + "thành công: ".length);
        } else {
          detail = logText.replace(`${c.channelName} thành công: `, "");
        }
      } else if (relevantLog.level === "WARN" && logText.includes("lỗi")) {
        status = "FAILED";
        const idx = logText.indexOf("lỗi: ");
        if (idx !== -1) {
          detail = logText.substring(idx + "lỗi: ".length);
        } else {
          detail = logText.replace(`${c.channelName} lỗi: `, "");
        }
      } else {
        detail = logText;
      }
    } else if (c.lastSyncAt) {
      status = "SUCCESS";
      detail = `Đã đồng bộ (${c.videoCount || 0} video)`;
    }

    return {
      id: c.id,
      channelName: c.channelName,
      platform: c.platform,
      url: c.url,
      isActive: c.isActive,
      status,
      detail,
      rawDetail,
      time,
    };
  });

  const filteredSync = syncStatuses.filter((s) => {
    if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.channelName.toLowerCase().includes(q) ||
        (s.detail && s.detail.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Phân trang cho Tab 1 (Đồng bộ kênh)
  const syncPages = Math.max(1, Math.ceil(filteredSync.length / SYNC_PER_PAGE));
  const syncStart = syncPage * SYNC_PER_PAGE;
  const syncRows = filteredSync.slice(syncStart, syncStart + SYNC_PER_PAGE);

  const syncPageRange = [...Array(syncPages).keys()].filter(i => {
    const maxVisible = 5;
    let startPage = Math.max(0, syncPage - 2);
    let endPage = Math.min(syncPages - 1, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(0, endPage - maxVisible + 1);
    }
    return i >= startPage && i <= endPage;
  });

  // Phân trang cho Tab 2 (Tất cả nhật ký)
  const rawPages = Math.max(1, Math.ceil(logs.length / RAW_PER_PAGE));
  const rawStart = rawPage * RAW_PER_PAGE;
  const rawRows = logs.slice(rawStart, rawStart + RAW_PER_PAGE);

  const rawPageRange = [...Array(rawPages).keys()].filter(i => {
    const maxVisible = 5;
    let startPage = Math.max(0, rawPage - 2);
    let endPage = Math.min(rawPages - 1, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(0, endPage - maxVisible + 1);
    }
    return i >= startPage && i <= endPage;
  });

  return (
    <div className="flex flex-col gap-5 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nhật ký hệ thống</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi trạng thái đồng bộ kênh và nhật ký hoạt động.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-muted p-1 rounded-lg border border-border self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("sync")}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === "sync"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Đồng bộ kênh
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === "raw"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tất cả nhật ký
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-3 bg-card border border-border rounded-xl">
          <SpinnerGap size={32} className="animate-spin text-blue-500" />
          <span className="text-sm text-muted-foreground">Đang tải dữ liệu...</span>
        </div>
      ) : activeTab === "sync" ? (
        <div className="flex flex-col gap-4">
          {/* Filters Bar for Sync Tab */}
          <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-background border border-border rounded-md px-2.5 py-1.5 min-w-[200px] flex-1 max-w-[300px]">
              <MagnifyingGlass size={14} className="text-muted-foreground shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tên kênh / thông tin lỗi…"
                className="bg-transparent text-xs text-foreground outline-none w-full placeholder:text-muted-foreground"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground outline-none cursor-pointer focus:border-blue-500"
            >
              <option value="ALL">Trạng thái: Tất cả</option>
              <option value="SUCCESS">Thành công</option>
              <option value="FAILED">Thất bại</option>
              <option value="PENDING">Chưa chạy</option>
            </select>
          </div>

          {/* Sync Status Table */}
          <div className="bg-background border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left whitespace-nowrap">
                <thead className="border-b border-border text-blue-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tên kênh</th>
                    <th className="px-4 py-3 font-medium">Nền tảng</th>
                    <th className="px-4 py-3 font-medium text-center">Trạng thái</th>
                    <th className="px-4 py-3 font-medium">Chi tiết đồng bộ / Thông tin lỗi</th>
                    <th className="px-4 py-3 font-medium text-right">Lần quét cuối</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {filteredSync.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                        Không tìm thấy thông tin đồng bộ.
                      </td>
                    </tr>
                  ) : (
                    syncRows.map((s) => (
                      <tr key={s.id} className="hover:bg-card/40">
                        <td className="px-4 py-2.5 font-medium flex items-center gap-2">
                          <span title={s.isActive ? "Hoạt động" : "Tắt"} className={`w-1.5 h-1.5 rounded-full ${s.isActive ? 'bg-green-500' : 'bg-muted-foreground/40'}`}></span>
                          {s.channelName}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${PLATFORM_COLOR[s.platform] || "bg-muted/10 text-muted-foreground border-muted/20"}`}>
                            {PLATFORM_LABEL[s.platform] || s.platform}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {s.status === "SUCCESS" ? (
                            <span className="inline-flex items-center gap-1 text-green-400 font-medium">
                              <CheckCircle size={14} weight="fill" /> Thành công
                            </span>
                          ) : s.status === "FAILED" ? (
                            <span className="inline-flex items-center gap-1 text-red-400 font-medium">
                              <XCircle size={14} weight="fill" /> Lỗi đồng bộ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-muted-foreground font-medium">
                              <Clock size={14} weight="fill" /> Chưa chạy
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 max-w-[420px] truncate" title={s.rawDetail || s.detail}>
                          {s.status === "FAILED" ? (
                            <span className="text-red-400 font-medium cursor-help hover:underline decoration-dashed">
                              {parseErrorDetail(s.rawDetail)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              {s.detail}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground">
                          {fmtDate(s.time)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang cho Đồng bộ kênh */}
            {filteredSync.length > SYNC_PER_PAGE && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-card/10">
                <span className="text-[12px] text-muted-foreground">
                  Hiển thị {syncStart + 1}–{Math.min(syncStart + SYNC_PER_PAGE, filteredSync.length)} trong {filteredSync.length} kênh
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSyncPage(p => Math.max(0, p - 1))}
                    disabled={syncPage === 0}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                  >
                    <CaretLeft size={14} weight="bold" />
                  </button>
                  
                  {syncPageRange.map(i => (
                    <button
                      key={i}
                      onClick={() => setSyncPage(i)}
                      className={`w-6 h-6 flex items-center justify-center rounded text-[11px] font-medium transition-colors ${
                        syncPage === i 
                          ? "bg-blue-600 text-white" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setSyncPage(p => Math.min(syncPages - 1, p + 1))}
                    disabled={syncPage === syncPages - 1}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                  >
                    <CaretRight size={14} weight="bold" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Raw Logs Tab */
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-muted-foreground uppercase border-b border-border">
                  <th className="px-4 py-3 font-medium">Thời gian</th>
                  <th className="px-4 py-3 font-medium">Mức</th>
                  <th className="px-4 py-3 font-medium">Hành động</th>
                  <th className="px-4 py-3 font-medium">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                      Chưa có nhật ký hệ thống.
                    </td>
                  </tr>
                ) : (
                  rawRows.map((l) => (
                    <tr key={l.id} className="hover:bg-card/40">
                      <td className="px-4 py-2.5 text-muted-foreground text-xs whitespace-nowrap">
                        {new Date(l.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs text-foreground">
                          <span className={`w-2 h-2 rounded-full ${dot(l.level)}`} />
                          {l.level}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-foreground font-mono text-xs whitespace-nowrap">
                        {l.action}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground break-all max-w-[500px]" title={l.detail ?? ""}>
                        {l.detail ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang cho Raw Logs */}
          {logs.length > RAW_PER_PAGE && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-card/10">
              <span className="text-[12px] text-muted-foreground">
                Hiển thị {rawStart + 1}–{Math.min(rawStart + RAW_PER_PAGE, logs.length)} trong {logs.length} bản ghi
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setRawPage(p => Math.max(0, p - 1))}
                  disabled={rawPage === 0}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                >
                  <CaretLeft size={14} weight="bold" />
                </button>
                
                {rawPageRange.map(i => (
                  <button
                    key={i}
                    onClick={() => setRawPage(i)}
                    className={`w-6 h-6 flex items-center justify-center rounded text-[11px] font-medium transition-colors ${
                      rawPage === i 
                        ? "bg-blue-600 text-white" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setRawPage(p => Math.min(rawPages - 1, p + 1))}
                  disabled={rawPage === rawPages - 1}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                >
                  <CaretRight size={14} weight="bold" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
