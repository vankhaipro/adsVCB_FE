"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowsClockwise, SpinnerGap, Plus, Trash, Broadcast, ListMagnifyingGlass, PencilSimple, CaretLeft, CaretRight
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
  industry: string | null;
  market: string | null;
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
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  // Phân trang
  const [page, setPage] = useState(0);
  const PER_PAGE = 10;

  // Form thêm kênh
  const [url, setUrl] = useState("");
  const [staff, setStaff] = useState("");
  const [team, setTeam] = useState("");
  const [channelName, setChannelName] = useState("");
  const [industry, setIndustry] = useState("");
  const [market, setMarket] = useState("");

  // Form chỉnh sửa kênh
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editStaff, setEditStaff] = useState("");
  const [editTeam, setEditTeam] = useState("");
  const [editChannelName, setEditChannelName] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [editMarket, setEditMarket] = useState("");
  const [saving, setSaving] = useState(false);

  // Master data nhân sự & cài đặt (gợi ý)
  const [teamList, setTeamList] = useState<{ id: string; name: string; industry?: string | null; market?: string | null }[]>([]);
  const [empList, setEmpList] = useState<{ id: string; name: string; team: { name: string } | null }[]>([]);
  const [industryList, setIndustryList] = useState<string[]>([]);
  const [marketList, setMarketList] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [chs, teams, emps, settings] = await Promise.all([
        apiGet("/channels"),
        apiGet("/teams"),
        apiGet("/employees"),
        apiGet("/settings"),
      ]);
      setChannels(chs);
      setTeamList(teams);
      setEmpList(emps);
      const industriesData = settings.industries ? JSON.parse(settings.industries) : [];
      const marketsData = settings.markets ? JSON.parse(settings.markets) : [];
      setIndustryList(industriesData);
      setMarketList(marketsData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pages = Math.max(1, Math.ceil(channels.length / PER_PAGE));
  const start = page * PER_PAGE;
  const rows = channels.slice(start, start + PER_PAGE);

  // Compute sliding window of pagination buttons
  const pageRange = [...Array(pages).keys()].filter(i => {
    const maxVisible = 5;
    let startPage = Math.max(0, page - 2);
    let endPage = Math.min(pages - 1, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(0, endPage - maxVisible + 1);
    }
    return i >= startPage && i <= endPage;
  });

  const addChannel = async () => {
    if (!url.trim()) {
      setError("Vui lòng nhập URL kênh");
      return;
    }
    setAdding(true);
    setError(null);
    try {
      const selectedTeam = teamList.find((t) => t.name === team.trim());
      await apiPost("/channels", {
        url: url.trim(),
        staff: staff.trim() || undefined,
        team: team.trim() || undefined,
        channelName: channelName.trim() || undefined,
        industry: selectedTeam?.industry || undefined,
        market: selectedTeam?.market || undefined,
      });
      setUrl(""); setStaff(""); setTeam(""); setChannelName(""); setIndustry(""); setMarket("");
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

  const startEdit = (c: Channel) => {
    setEditingChannel(c);
    setEditUrl(c.url ?? "");
    setEditStaff(c.staff ?? "");
    setEditTeam(c.team ?? "");
    setEditChannelName(c.channelName ?? "");
    setEditIndustry(c.industry ?? "");
    setEditMarket(c.market ?? "");
  };

  const saveEdit = async () => {
    if (!editingChannel) return;
    if (!editUrl.trim()) {
      setError("Vui lòng nhập URL kênh");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const selectedTeam = teamList.find((t) => t.name === editTeam.trim());
      await apiPatch(`/channels/${editingChannel.id}`, {
        url: editUrl.trim(),
        staff: editStaff.trim() || null,
        team: editTeam.trim() || null,
        channelName: editChannelName.trim() || null,
        industry: selectedTeam?.industry || null,
        market: selectedTeam?.market || null,
      });
      setEditingChannel(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cập nhật kênh lỗi");
    } finally {
      setSaving(false);
    }
  };

  const handleStaffSelect = (staffName: string) => {
    setStaff(staffName);
    if (staffName) {
      const emp = empList.find((e) => e.name === staffName);
      if (emp && emp.team?.name) {
        setTeam(emp.team.name);
      }
    }
  };

  const handleEditStaffSelect = (staffName: string) => {
    setEditStaff(staffName);
    if (staffName) {
      const emp = empList.find((e) => e.name === staffName);
      if (emp && emp.team?.name) {
        setEditTeam(emp.team.name);
      }
    }
  };

  const inputCls =
    "bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500 placeholder:text-muted-foreground";

  return (
    <div className="flex flex-col gap-5 w-full max-w-full overflow-x-hidden pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Broadcast size={24} className="text-blue-400" /> Kênh organic
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {channels.length} kênh
          </p>
        </div>
        <button
          onClick={syncAll}
          disabled={syncingAll}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-foreground text-sm font-medium rounded-md transition-colors"
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
      <div className="bg-background border border-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Thêm kênh mới</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 flex-1 min-w-[260px]">
            <label className="text-xs text-muted-foreground">URL kênh *</label>
            <input
              className={inputCls}
              placeholder="https://www.tiktok.com/@tenkenh"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1 w-[160px]">
            <label className="text-xs text-muted-foreground">Tên kênh</label>
            <input className={inputCls} placeholder="(tự điền nếu trống)" value={channelName} onChange={(e) => setChannelName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1 w-[140px]">
            <label className="text-xs text-muted-foreground">Team</label>
            <select
              className={inputCls}
              value={team}
              onChange={(e) => {
                setTeam(e.target.value);
                setStaff("");
              }}
            >
              <option value="" className="bg-background">— Chọn Team —</option>
              {teamList.map((t) => (
                <option key={t.id} value={t.name} className="bg-background">{t.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 w-[160px]">
            <label className="text-xs text-muted-foreground">Nhân viên</label>
            <select
              className={inputCls}
              value={staff}
              onChange={(e) => handleStaffSelect(e.target.value)}
            >
              <option value="" className="bg-background">— Chọn Nhân viên —</option>
              {empList
                .filter((e) => !team.trim() || e.team?.name === team.trim())
                .map((e) => (
                  <option key={e.id} value={e.name} className="bg-background">{e.name}</option>
                ))}
            </select>
          </div>
          <button
            onClick={addChannel}
            disabled={adding}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-foreground text-sm font-medium rounded-md transition-colors h-[38px]"
          >
            {adding ? <SpinnerGap size={16} className="animate-spin" /> : <Plus size={16} />}
            Thêm
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">Nền tảng &amp; ID kênh được tự nhận diện từ URL.</p>
      </div>

      {/* Bảng kênh */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-3">
          <SpinnerGap size={32} className="animate-spin text-blue-500" />
          <span className="text-sm text-muted-foreground">Đang tải...</span>
        </div>
      ) : (
        <div className="bg-background border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="border-b border-border text-blue-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Nhân viên</th>
                  <th className="px-4 py-3 font-medium">Team</th>
                  <th className="px-4 py-3 font-medium">Ngành</th>
                  <th className="px-4 py-3 font-medium">Thị trường</th>
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
              <tbody className="divide-y divide-border text-foreground">
                {channels.length === 0 ? (
                  <tr><td colSpan={12} className="px-4 py-10 text-center text-muted-foreground">Chưa có kênh nào. Thêm kênh bằng URL ở trên.</td></tr>
                ) : (
                  rows.map((c) => {
                    const channelTeam = teamList.find((t) => t.name === c.team);
                    const displayIndustry = channelTeam?.industry ?? c.industry ?? "—";
                    const displayMarket = channelTeam?.market ?? c.market ?? "—";
                    return (
                      <tr key={c.id} className="hover:bg-card/40">
                        <td className="px-4 py-2.5">{c.staff || "—"}</td>
                        <td className="px-4 py-2.5">{c.team || "—"}</td>
                        <td className="px-4 py-2.5">{displayIndustry}</td>
                        <td className="px-4 py-2.5">{displayMarket}</td>
                        <td className="px-4 py-2.5 font-medium text-foreground max-w-[200px] truncate" title={c.channelName}>{c.channelName}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${PLATFORM_COLOR[c.platform] || "bg-muted/20 text-muted-foreground"}`}>
                          {PLATFORM_LABEL[c.platform] || c.platform}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{c.externalId || "—"}</td>
                      <td className="px-4 py-2.5 max-w-[180px] truncate">
                        {c.url ? <a href={c.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline" title={c.url}>{c.url}</a> : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-foreground">{fmtNum(c.followers)}</td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          onClick={() => toggleActive(c)}
                          title={c.isActive ? "Đang BẬT — bấm để tắt" : "Đang TẮT — bấm để bật"}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${c.isActive ? "bg-green-600" : "bg-muted"}`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${c.isActive ? "translate-x-5" : "translate-x-1"}`} />
                        </button>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(c.createdAt)}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => router.push(`/channels/videos?channelId=${c.id}`)}
                            title="Xem video"
                            className="text-muted-foreground hover:text-green-400"
                          >
                            <ListMagnifyingGlass size={16} />
                          </button>
                          <button
                            onClick={() => syncOne(c.id)}
                            disabled={syncingId === c.id}
                            title="Đồng bộ kênh này"
                            className="text-muted-foreground hover:text-blue-400 disabled:opacity-50"
                          >
                            {syncingId === c.id ? <SpinnerGap size={16} className="animate-spin" /> : <ArrowsClockwise size={16} />}
                          </button>
                          <button
                            onClick={() => startEdit(c)}
                            title="Chỉnh sửa"
                            className="text-muted-foreground hover:text-yellow-400"
                          >
                            <PencilSimple size={16} />
                          </button>
                          <button onClick={() => remove(c)} title="Xóa kênh" className="text-muted-foreground hover:text-red-400">
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {channels.length > PER_PAGE && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border">
              <span className="text-[11px] text-muted-foreground">
                Hiển thị {start + 1}–{Math.min(start + PER_PAGE, channels.length)} trong {channels.length} kênh
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                >
                  <CaretLeft size={14} weight="bold" />
                </button>
                
                {pageRange.map(i => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-6 h-6 flex items-center justify-center rounded text-[11px] font-medium transition-colors ${
                      page === i 
                        ? "bg-blue-600 text-white" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setPage(p => Math.min(pages - 1, p + 1))}
                  disabled={page === pages - 1}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                >
                  <CaretRight size={14} weight="bold" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal chỉnh sửa */}
      {editingChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">Chỉnh sửa kênh</h3>
              <button
                onClick={() => setEditingChannel(null)}
                className="text-muted-foreground hover:text-foreground transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground font-medium">Tên kênh</label>
                <input
                  className={inputCls}
                  placeholder="Tên kênh"
                  value={editChannelName}
                  onChange={(e) => setEditChannelName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground font-medium">URL kênh *</label>
                <input
                  className={inputCls}
                  placeholder="https://www.tiktok.com/@tenkenh"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground font-medium">Team</label>
                  <select
                    className={inputCls}
                    value={editTeam}
                    onChange={(e) => {
                      setEditTeam(e.target.value);
                      setEditStaff("");
                    }}
                  >
                    <option value="" className="bg-background">— Chọn Team —</option>
                    {teamList.map((t) => (
                      <option key={t.id} value={t.name} className="bg-background">{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground font-medium">Nhân viên</label>
                  <select
                    className={inputCls}
                    value={editStaff}
                    onChange={(e) => handleEditStaffSelect(e.target.value)}
                  >
                    <option value="" className="bg-background">— Chọn Nhân viên —</option>
                    {empList
                      .filter((e) => !editTeam.trim() || e.team?.name === editTeam.trim())
                      .map((e) => (
                        <option key={e.id} value={e.name} className="bg-background">{e.name}</option>
                      ))}
                  </select>
                </div>
              </div>


            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 p-4 border-t border-border bg-muted/20">
              <button
                onClick={() => setEditingChannel(null)}
                className="px-4 py-2 border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-sm font-medium rounded-md transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-foreground text-sm font-medium rounded-md transition-colors"
              >
                {saving ? <SpinnerGap size={16} className="animate-spin" /> : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
