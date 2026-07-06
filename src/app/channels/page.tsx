"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowsClockwise, SpinnerGap, Plus, Trash, Broadcast, ListMagnifyingGlass, PencilSimple, CaretLeft, CaretRight, Funnel, CaretDown, MagnifyingGlass
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
  THREADS: "Threads", ZALO: "Zalo", SHOPEE: "Shopee",
};
const PLATFORM_COLOR: Record<string, string> = {
  TIKTOK: "bg-pink-500/20 text-pink-400",
  YOUTUBE: "bg-red-500/20 text-red-400",
  FACEBOOK: "bg-blue-500/20 text-blue-400",
  INSTAGRAM: "bg-purple-500/20 text-purple-400",
  THREADS: "bg-zinc-500/20 text-zinc-400",
  ZALO: "bg-teal-500/20 text-teal-400",
  SHOPEE: "bg-orange-500/20 text-orange-400",
};

const fmtNum = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n || 0));
const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

function FilterDropdown({
  label,
  value,
  onChange,
  options,
  searchable = false
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  searchable?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOpt = options.find((o) => o.value === value);
  const displayLabel = selectedOpt ? selectedOpt.label : `${label}: Tất cả`;

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch("");
        }}
        className="flex items-center justify-between gap-2 bg-background border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground hover:border-border/80 focus:border-blue-500 focus:outline-none cursor-pointer w-[140px] text-left"
      >
        <span className="truncate flex-1">{displayLabel}</span>
        <CaretDown size={10} className="text-muted-foreground shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 z-50 w-56 bg-card border border-border rounded-lg shadow-xl flex flex-col overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-border bg-background/50">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Tìm ${label.toLowerCase()}...`}
                className="w-full bg-card border border-border rounded px-2 py-1 text-xs text-foreground outline-none focus:border-blue-500"
              />
            </div>
          )}
          <div className="max-h-48 overflow-y-auto p-1 divide-y divide-border/20 scrollbar-thin">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 text-xs rounded transition-colors ${
                value === "" ? "bg-blue-600/20 text-blue-400 font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Tất cả
            </button>
            {filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 text-xs rounded transition-colors truncate ${
                  value === o.value ? "bg-blue-600/20 text-blue-400 font-medium" : "text-foreground hover:bg-muted"
                }`}
                title={o.label}
              >
                {o.label}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="p-3 text-center text-[11px] text-muted-foreground">Không tìm thấy</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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

  // Bộ lọc ("" = tất cả)
  const [fPlatform, setFPlatform] = useState("");
  const [fTeam, setFTeam] = useState("");
  const [fStaff, setFStaff] = useState("");
  const [fIndustry, setFIndustry] = useState("");
  const [fMarket, setFMarket] = useState("");
  const [fSearch, setFSearch] = useState("");

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
  const [editPlatform, setEditPlatform] = useState("");
  const [editExternalId, setEditExternalId] = useState("");
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

  // Áp bộ lọc (client-side)
  const filtered = channels.filter((c) => {
    if (fPlatform && c.platform !== fPlatform) return false;
    if (fTeam && (c.team ?? "") !== fTeam) return false;
    if (fStaff && (c.staff ?? "") !== fStaff) return false;
    if (fIndustry && (c.industry ?? "") !== fIndustry) return false;
    if (fMarket && (c.market ?? "") !== fMarket) return false;
    if (fSearch) {
      const q = fSearch.toLowerCase();
      const hay = `${c.channelName ?? ""} ${c.externalId ?? ""} ${c.url ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  // Reset về trang đầu khi bộ lọc đổi
  useEffect(() => {
    setPage(0);
  }, [fPlatform, fTeam, fStaff, fIndustry, fMarket, fSearch]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const start = page * PER_PAGE;
  const rows = filtered.slice(start, start + PER_PAGE);
  const platformsInData = [...new Set(channels.map((c) => c.platform))].filter(p => p && p.toUpperCase() !== "UNKNOWN");

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
    setEditPlatform(c.platform ?? "");
    setEditExternalId(c.externalId ?? "");
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
        platform: editPlatform.trim() || null,
        externalId: editExternalId.trim() || null,
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

  // Tính toán thống kê theo Nền tảng
  const statsByPlatform = channels.reduce((acc, c) => {
    const p = c.platform || "UNKNOWN";
    if (p.toUpperCase() === "UNKNOWN") return acc;
    if (!acc[p]) acc[p] = { count: 0, active: 0, followers: 0 };
    acc[p].count += 1;
    if (c.isActive) acc[p].active += 1;
    acc[p].followers += c.followers || 0;
    return acc;
  }, {} as Record<string, { count: number; active: number; followers: number }>);

  // Tính toán thống kê theo Team
  const statsByTeam = channels.reduce((acc, c) => {
    const t = c.team || "Không có Team";
    if (!acc[t]) acc[t] = { count: 0, active: 0, followers: 0 };
    acc[t].count += 1;
    if (c.isActive) acc[t].active += 1;
    acc[t].followers += c.followers || 0;
    return acc;
  }, {} as Record<string, { count: number; active: number; followers: number }>);

  const totalFollowers = channels.reduce((sum, c) => sum + (c.followers || 0), 0);
  const activeChannels = channels.filter(c => c.isActive).length;

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

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Tổng quan */}
        <div className="bg-gradient-to-br from-blue-900/10 to-purple-900/10 border border-blue-500/10 rounded-xl p-4 shadow-sm flex flex-col justify-between min-h-[120px]">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">Tổng quan hệ thống</span>
            <h3 className="text-xl font-bold text-foreground mt-1">{fmtNum(channels.length)} <span className="text-xs font-normal text-muted-foreground">Kênh</span></h3>
          </div>
          <div className="flex justify-between items-center mt-3 border-t border-border/40 pt-2 text-xs">
            <div>
              <p className="text-[10px] text-muted-foreground">Đang hoạt động</p>
              <p className="font-semibold text-green-400">{fmtNum(activeChannels)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Tổng Followers</p>
              <p className="font-semibold text-purple-400">{fmtNum(totalFollowers)}</p>
            </div>
          </div>
        </div>

        {/* Card 2: Nền tảng */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between min-h-[120px]">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Theo Nền tảng</span>
            <div className="mt-2 space-y-1.5 max-h-[90px] overflow-y-auto pr-1 scrollbar-thin">
              {Object.keys(statsByPlatform).map((p) => {
                const stat = statsByPlatform[p];
                return (
                  <div key={p} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${p === 'TIKTOK' ? 'bg-pink-500' : p === 'YOUTUBE' ? 'bg-red-500' : p === 'FACEBOOK' ? 'bg-blue-500' : p === 'INSTAGRAM' ? 'bg-purple-500' : 'bg-zinc-400'}`}></span>
                      <span className="font-medium text-foreground">{PLATFORM_LABEL[p] || p}</span>
                    </div>
                    <span className="text-muted-foreground text-[10px]">
                      <strong className="text-foreground">{stat.count}</strong> kênh ({stat.active} chạy) • <strong className="text-foreground">{fmtNum(stat.followers)}</strong> fl
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 3: Team */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between min-h-[120px]">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Theo Team</span>
            <div className="mt-2 space-y-1.5 max-h-[90px] overflow-y-auto pr-1 scrollbar-thin">
              {Object.keys(statsByTeam).map((t) => {
                const stat = statsByTeam[t];
                return (
                  <div key={t} className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-foreground truncate max-w-[100px]" title={t}>{t}</span>
                    <span className="text-muted-foreground text-[10px]">
                      <strong className="text-foreground">{stat.count}</strong> kênh ({stat.active} chạy) • <strong className="text-foreground">{fmtNum(stat.followers)}</strong> fl
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

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
        <p className="text-[16px] text-muted-foreground mt-2">Nền tảng &amp; ID kênh được tự nhận diện từ URL.</p>
      </div>

      {/* Thanh bộ lọc */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mr-1">
          <Funnel size={14} className="text-blue-400" /> Lọc:
        </span>
        <div className="flex items-center gap-2 bg-background border border-border rounded-md px-2.5 py-1.5 min-w-[200px] flex-1 max-w-[260px]">
          <MagnifyingGlass size={14} className="text-muted-foreground shrink-0" />
          <input
            value={fSearch}
            onChange={(e) => setFSearch(e.target.value)}
            placeholder="Tìm tên kênh / ID / URL…"
            className="bg-transparent text-xs text-foreground outline-none w-full placeholder:text-muted-foreground"
          />
        </div>
        {[
          { label: "Nền tảng", value: fPlatform, set: setFPlatform, opts: platformsInData.map((p) => ({ value: p, label: PLATFORM_LABEL[p] || p })), searchable: false },
          { label: "Team", value: fTeam, set: setFTeam, opts: teamList.map((t) => ({ value: t.name, label: t.name })), searchable: true },
          { label: "Nhân viên", value: fStaff, set: setFStaff, opts: empList.map((e) => ({ value: e.name, label: e.name })), searchable: true },
          { label: "Ngành", value: fIndustry, set: setFIndustry, opts: industryList.map((x) => ({ value: x, label: x })), searchable: true },
          { label: "Thị trường", value: fMarket, set: setFMarket, opts: marketList.map((x) => ({ value: x, label: x })), searchable: true },
        ].map((f) => (
          <FilterDropdown
            key={f.label}
            label={f.label}
            value={f.value}
            onChange={f.set}
            options={f.opts}
            searchable={f.searchable}
          />
        ))}
        {(fPlatform || fTeam || fStaff || fIndustry || fMarket || fSearch) && (
          <button
            type="button"
            onClick={() => { setFPlatform(""); setFTeam(""); setFStaff(""); setFIndustry(""); setFMarket(""); setFSearch(""); }}
            className="px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            Xóa lọc
          </button>
        )}
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
                {filtered.length === 0 ? (
                  <tr><td colSpan={12} className="px-4 py-10 text-center text-muted-foreground">{channels.length === 0 ? "Chưa có kênh nào. Thêm kênh bằng URL ở trên." : "Không có kênh khớp bộ lọc."}</td></tr>
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
                        <span className={`text-[15px] px-2 py-0.5 rounded font-medium ${PLATFORM_COLOR[c.platform] || "bg-muted/20 text-muted-foreground"}`}>
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
          {filtered.length > PER_PAGE && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border">
              <span className="text-[16px] text-muted-foreground">
                Hiển thị {start + 1}–{Math.min(start + PER_PAGE, filtered.length)} trong {filtered.length} kênh
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
                    className={`w-6 h-6 flex items-center justify-center rounded text-[16px] font-medium transition-colors ${
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
                  <label className="text-xs text-muted-foreground font-medium">Nền tảng</label>
                  <select
                    className={inputCls}
                    value={editPlatform}
                    onChange={(e) => setEditPlatform(e.target.value)}
                  >
                    {Object.entries(PLATFORM_LABEL).map(([val, label]) => (
                      <option key={val} value={val} className="bg-background">{label}</option>
                    ))}
                    <option value="UNKNOWN" className="bg-background">UNKNOWN</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground font-medium">ID kênh</label>
                  <input
                    className={inputCls}
                    placeholder="ID kênh"
                    value={editExternalId}
                    onChange={(e) => setEditExternalId(e.target.value)}
                  />
                </div>
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
