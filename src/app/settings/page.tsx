"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash, SpinnerGap, UsersThree, User, Trophy, Key, FloppyDisk, Tag, PencilSimple, X, Check } from "@phosphor-icons/react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";

type Team = { id: string; name: string; industry: string | null; market: string | null; _count: { employees: number } };
type Employee = { id: string; name: string; code: string | null; team: { id: string; name: string } | null };
type Account = { id: string; email: string; name: string; role: string };

type Tab = "employees" | "win" | "accounts" | "industry_market";

const inputCls =
  "bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500 placeholder:text-muted-foreground";

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("employees");
  const [error, setError] = useState<string | null>(null);

  // --- Nhân viên / Team ---
  const [teams, setTeams] = useState<Team[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");
  const [teamIndustry, setTeamIndustry] = useState("");
  const [teamMarket, setTeamMarket] = useState("");
  const [empName, setEmpName] = useState("");
  const [empCode, setEmpCode] = useState("");
  const [empTeamId, setEmpTeamId] = useState("");

  // --- Ngưỡng Win ---
  const [winViews, setWinViews] = useState("");
  const [winEng, setWinEng] = useState("");
  const [winSaved, setWinSaved] = useState(false);

  // --- Tài khoản ---
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accEmail, setAccEmail] = useState("");
  const [accName, setAccName] = useState("");
  const [accPass, setAccPass] = useState("");
  const [accRole, setAccRole] = useState("ADMIN");
  // Sửa tài khoản đang có
  const [editId, setEditId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editPass, setEditPass] = useState("");

  // --- Ngành / Thị trường ---
  const [industries, setIndustries] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [newIndustry, setNewIndustry] = useState("");
  const [newMarket, setNewMarket] = useState("");
 
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [t, e, s, u] = await Promise.all([
        apiGet("/teams"), apiGet("/employees"), apiGet("/settings"), apiGet("/users"),
      ]);
      setTeams(t); setEmployees(e); setAccounts(u);
      setWinViews(String(s.win_min_views ?? "")); setWinEng(String(s.win_min_engagement_rate ?? ""));
      const industriesData = s.industries ? JSON.parse(s.industries) : [];
      const marketsData = s.markets ? JSON.parse(s.markets) : [];
      setIndustries(industriesData);
      setMarkets(marketsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const guard = (fn: () => Promise<void>, msg: string) => async () => {
    try { await fn(); setError(null); } catch (err) { setError(err instanceof Error ? err.message : msg); }
  };

  const addTeam = guard(async () => {
    if (!teamName.trim()) return;
    await apiPost("/teams", {
      name: teamName.trim(),
      industry: teamIndustry || undefined,
      market: teamMarket || undefined,
    });
    setTeamName("");
    setTeamIndustry("");
    setTeamMarket("");
    await load();
  }, "Thêm team lỗi");

  const addEmployee = guard(async () => {
    if (!empName.trim()) return;
    await apiPost("/employees", { name: empName.trim(), code: empCode.trim() || undefined, teamId: empTeamId || undefined });
    setEmpName(""); setEmpCode(""); await load();
  }, "Thêm nhân viên lỗi");

  const saveEmpCode = (e: Employee, code: string) =>
    guard(async () => { await apiPatch(`/employees/${e.id}`, { code }); await load(); }, "Lưu mã lỗi")();

  const delTeam = (t: Team) => guard(async () => {
    if (!confirm(`Xóa team "${t.name}"? Nhân viên thuộc team sẽ bị gỡ team.`)) return;
    await apiDelete(`/teams/${t.id}`); await load();
  }, "Xóa team lỗi")();

  const delEmployee = (e: Employee) => guard(async () => {
    if (!confirm(`Xóa nhân viên "${e.name}"?`)) return;
    await apiDelete(`/employees/${e.id}`); await load();
  }, "Xóa nhân viên lỗi")();

  const saveWin = guard(async () => {
    await apiPatch("/settings", { win_min_views: Number(winViews) || 0, win_min_engagement_rate: Number(winEng) || 0 });
    setWinSaved(true); setTimeout(() => setWinSaved(false), 2000);
  }, "Lưu ngưỡng lỗi");

  const addAccount = guard(async () => {
    if (!accEmail.trim() || !accName.trim() || !accPass) { setError("Nhập đủ tài khoản / tên / mật khẩu"); return; }
    await apiPost("/users", { email: accEmail.trim(), name: accName.trim(), password: accPass, role: accRole });
    setAccEmail(""); setAccName(""); setAccPass(""); setAccRole("ADMIN"); await load();
  }, "Thêm tài khoản lỗi");

  const changeRole = (a: Account, role: string) =>
    guard(async () => { await apiPatch(`/users/${a.id}`, { role }); await load(); }, "Đổi vai trò lỗi")();

  const startEdit = (a: Account) => {
    setEditId(a.id); setEditEmail(a.email); setEditName(a.name); setEditPass("");
  };
  const cancelEdit = () => { setEditId(null); setEditEmail(""); setEditName(""); setEditPass(""); };
  const saveEdit = (a: Account) => guard(async () => {
    if (!editEmail.trim() || !editName.trim()) { setError("Nhập đủ tài khoản / tên"); return; }
    await apiPatch(`/users/${a.id}`, {
      email: editEmail.trim(), name: editName.trim(),
      ...(editPass ? { password: editPass } : {}),
    });
    cancelEdit(); await load();
  }, "Sửa tài khoản lỗi")();

  const delAccount = (a: Account) => guard(async () => {
    if (!confirm(`Xóa tài khoản "${a.email}"?`)) return;
    await apiDelete(`/users/${a.id}`); await load();
  }, "Xóa tài khoản lỗi")();

  const addIndustry = async () => {
    const val = newIndustry.trim();
    if (!val) return;
    if (industries.includes(val)) {
      setError("Ngành này đã tồn tại");
      return;
    }
    const updated = [...industries, val];
    try {
      await apiPatch("/settings", { industries: JSON.stringify(updated) });
      setIndustries(updated);
      setNewIndustry("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi thêm ngành");
    }
  };

  const delIndustry = async (name: string) => {
    if (!confirm(`Xóa ngành "${name}"?`)) return;
    const updated = industries.filter((x) => x !== name);
    try {
      await apiPatch("/settings", { industries: JSON.stringify(updated) });
      setIndustries(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi xóa ngành");
    }
  };

  const addMarket = async () => {
    const val = newMarket.trim();
    if (!val) return;
    if (markets.includes(val)) {
      setError("Thị trường này đã tồn tại");
      return;
    }
    const updated = [...markets, val];
    try {
      await apiPatch("/settings", { markets: JSON.stringify(updated) });
      setMarkets(updated);
      setNewMarket("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi thêm thị trường");
    }
  };

  const delMarket = async (name: string) => {
    if (!confirm(`Xóa thị trường "${name}"?`)) return;
    const updated = markets.filter((x) => x !== name);
    try {
      await apiPatch("/settings", { markets: JSON.stringify(updated) });
      setMarkets(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi xóa thị trường");
    }
  };
 
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "employees", label: "Nhân viên", icon: <User size={16} /> },
    { id: "industry_market", label: "Ngành & Thị trường", icon: <Tag size={16} /> },
    { id: "win", label: "Ngưỡng Win", icon: <Trophy size={16} /> },
    { id: "accounts", label: "Tài khoản", icon: <Key size={16} /> },
  ];

  return (
    <div className="flex flex-col gap-5 w-full max-w-full overflow-x-hidden pb-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cài đặt</h1>
        <p className="text-sm text-muted-foreground mt-1">Quản lý Nhân viên, ngưỡng Win/Not-win và tài khoản đăng nhập.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t.id ? "border-blue-500 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-md px-4 py-2">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center p-20 gap-3 text-muted-foreground">
          <SpinnerGap size={28} className="animate-spin text-blue-500" /> Đang tải...
        </div>
      ) : tab === "employees" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Teams */}
          <div className="bg-background border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <UsersThree size={18} className="text-blue-400" /> Team ({teams.length})
            </h3>
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex gap-2">
                <input className={`${inputCls} flex-1`} placeholder="Tên team (vd: K4)" value={teamName}
                  onChange={(e) => setTeamName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTeam()} />
              </div>
              <div className="flex gap-2">
                <select
                  value={teamIndustry}
                  onChange={(e) => setTeamIndustry(e.target.value)}
                  className={`${inputCls} flex-1`}
                >
                  <option value="">— Ngành mặc định —</option>
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
                <select
                  value={teamMarket}
                  onChange={(e) => setTeamMarket(e.target.value)}
                  className={`${inputCls} flex-1`}
                >
                  <option value="">— Thị trường mặc định —</option>
                  {markets.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <button onClick={addTeam} className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-foreground text-sm rounded-md shrink-0 cursor-pointer">
                  <Plus size={16} /> Thêm
                </button>
              </div>
            </div>
            <div className="flex flex-col divide-y divide-border">
              {teams.length === 0 ? (
                <span className="text-xs text-muted-foreground py-4 text-center">Chưa có team nào.</span>
              ) : teams.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2.5 text-sm gap-2">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="text-foreground font-medium shrink-0">{t.name} <span className="text-muted-foreground text-xs">({t._count.employees} nv)</span></span>
                    
                    {/* Select Ngành */}
                    <select
                      value={t.industry ?? ""}
                      onChange={async (e) => {
                        const val = e.target.value || null;
                        try {
                          await apiPatch(`/teams/${t.id}`, { industry: val });
                          await load();
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Lỗi đổi ngành");
                        }
                      }}
                      className="bg-card border border-border rounded px-1.5 py-0.5 text-[16px] text-muted-foreground focus:text-foreground outline-none focus:border-blue-500"
                    >
                      <option value="">— Ngành mặc định —</option>
                      {industries.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>

                    {/* Select Thị trường */}
                    <select
                      value={t.market ?? ""}
                      onChange={async (e) => {
                        const val = e.target.value || null;
                        try {
                          await apiPatch(`/teams/${t.id}`, { market: val });
                          await load();
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Lỗi đổi thị trường");
                        }
                      }}
                      className="bg-card border border-border rounded px-1.5 py-0.5 text-[16px] text-muted-foreground focus:text-foreground outline-none focus:border-blue-500"
                    >
                      <option value="">— Thị trường mặc định —</option>
                      {markets.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={() => delTeam(t)} className="text-muted-foreground hover:text-red-400 shrink-0"><Trash size={16} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Employees */}
          <div className="bg-background border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <User size={18} className="text-blue-400" /> Nhân viên ({employees.length})
            </h3>
            <p className="text-[16px] text-muted-foreground mb-3">Mã NV = mã trong hashtag (vd <code className="text-foreground">K403</code>) để map nội dung về đúng người.</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <select className={inputCls} value={empTeamId} onChange={(e) => setEmpTeamId(e.target.value)}>
                <option value="" className="bg-background">— Team —</option>
                {teams.map((t) => <option key={t.id} value={t.id} className="bg-background">{t.name}</option>)}
              </select>
              <input className={`${inputCls} w-24`} placeholder="Mã (K403)" value={empCode}
                onChange={(e) => setEmpCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addEmployee()} />
              <input className={`${inputCls} flex-1 min-w-[120px]`} placeholder="Tên nhân viên" value={empName}
                onChange={(e) => setEmpName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addEmployee()} />
              <button onClick={addEmployee} className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-foreground text-sm rounded-md">
                <Plus size={16} /> Thêm
              </button>
            </div>
            <div className="flex flex-col divide-y divide-border">
              {employees.length === 0 ? (
                <span className="text-xs text-muted-foreground py-4 text-center">Chưa có nhân viên nào.</span>
              ) : employees.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-2.5 text-sm gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      defaultValue={e.code ?? ""} placeholder="mã"
                      className="bg-card border border-border rounded px-2 py-1 text-xs text-foreground w-20 outline-none focus:border-blue-500"
                      onBlur={(ev) => { const v = ev.target.value.trim(); if (v !== (e.code ?? "")) saveEmpCode(e, v); }}
                    />
                    <span className="text-foreground truncate">{e.name} {e.team && <span className="text-muted-foreground text-xs">· {e.team.name}</span>}</span>
                  </div>
                  <button onClick={() => delEmployee(e)} className="text-muted-foreground hover:text-red-400 shrink-0"><Trash size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : tab === "industry_market" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Ngành */}
          <div className="bg-background border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Tag size={18} className="text-blue-400" /> Danh sách Ngành ({industries.length})
            </h3>
            <div className="flex gap-2 mb-4">
              <input
                className={`${inputCls} flex-1`}
                placeholder="Tên ngành (vd: Đá quý)"
                value={newIndustry}
                onChange={(e) => setNewIndustry(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addIndustry()}
              />
              <button
                onClick={addIndustry}
                className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-foreground text-sm rounded-md cursor-pointer transition-colors"
              >
                <Plus size={16} /> Thêm
              </button>
            </div>
            <div className="flex flex-col divide-y divide-border max-h-[400px] overflow-y-auto pr-1">
              {industries.length === 0 ? (
                <span className="text-xs text-muted-foreground py-4 text-center">Chưa có ngành nào.</span>
              ) : (
                industries.map((ind) => (
                  <div key={ind} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-foreground font-medium">{ind}</span>
                    <button
                      onClick={() => delIndustry(ind)}
                      className="text-muted-foreground hover:text-red-400 cursor-pointer transition-colors"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Thị trường */}
          <div className="bg-background border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Tag size={18} className="text-blue-400" /> Danh sách Thị trường ({markets.length})
            </h3>
            <div className="flex gap-2 mb-4">
              <input
                className={`${inputCls} flex-1`}
                placeholder="Tên thị trường (vd: US)"
                value={newMarket}
                onChange={(e) => setNewMarket(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addMarket()}
              />
              <button
                onClick={addMarket}
                className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-foreground text-sm rounded-md cursor-pointer transition-colors"
              >
                <Plus size={16} /> Thêm
              </button>
            </div>
            <div className="flex flex-col divide-y divide-border max-h-[400px] overflow-y-auto pr-1">
              {markets.length === 0 ? (
                <span className="text-xs text-muted-foreground py-4 text-center">Chưa có thị trường nào.</span>
              ) : (
                markets.map((m) => (
                  <div key={m} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-foreground font-medium">{m}</span>
                    <button
                      onClick={() => delMarket(m)}
                      className="text-muted-foreground hover:text-red-400 cursor-pointer transition-colors"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : tab === "win" ? (
        <div className="bg-background border border-border rounded-xl p-5 max-w-xl">
          <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <Trophy size={18} className="text-yellow-400" /> Ngưỡng Win / Not-win
          </h3>
          <p className="text-[16px] text-muted-foreground mb-4">Một video tính là <b className="text-green-400">Win</b> khi views ≥ ngưỡng (và nếu đặt tỉ lệ tương tác &gt; 0 thì phải đạt thêm).</p>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Views tối thiểu để Win</span>
              <input type="number" className={inputCls} value={winViews} onChange={(e) => setWinViews(e.target.value)} placeholder="vd 1000" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Tỉ lệ tương tác tối thiểu (%) — 0 = bỏ qua</span>
              <input type="number" className={inputCls} value={winEng} onChange={(e) => setWinEng(e.target.value)} placeholder="vd 5" />
            </label>
            <button onClick={saveWin} className="flex items-center gap-1.5 self-start px-4 py-2 bg-blue-600 hover:bg-blue-700 text-foreground text-sm rounded-md">
              <FloppyDisk size={16} /> Lưu {winSaved && <span className="text-green-300">✓ đã lưu</span>}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-background border border-border rounded-xl p-5 max-w-3xl">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Key size={18} className="text-blue-400" /> Tài khoản đăng nhập ({accounts.length})
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <input className={`${inputCls} flex-1 min-w-[160px]`} placeholder="Tài khoản" value={accEmail} onChange={(e) => setAccEmail(e.target.value)} />
            <input className={`${inputCls} flex-1 min-w-[120px]`} placeholder="Tên" value={accName} onChange={(e) => setAccName(e.target.value)} />
            <input className={`${inputCls} w-36`} type="password" placeholder="Mật khẩu" value={accPass} onChange={(e) => setAccPass(e.target.value)} />
            <select className={inputCls} value={accRole} onChange={(e) => setAccRole(e.target.value)}>
              <option value="ADMIN" className="bg-background">ADMIN</option>
              <option value="STAFF" className="bg-background">STAFF</option>
            </select>
            <button onClick={addAccount} className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-foreground text-sm rounded-md">
              <Plus size={16} /> Thêm
            </button>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {accounts.length === 0 ? (
              <span className="text-xs text-muted-foreground py-4 text-center">Chưa có tài khoản nào.</span>
            ) : accounts.map((a) => {
              const isAdmin = a.role === "ADMIN";
              return editId === a.id ? (
                /* ==== Chế độ sửa ==== */
                <div key={a.id} className="flex flex-wrap items-center gap-2 py-2.5 text-sm">
                  <input className={`${inputCls} flex-1 min-w-[150px]`} placeholder="Tài khoản" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                  <input className={`${inputCls} flex-1 min-w-[120px]`} placeholder="Tên" value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <input className={`${inputCls} w-40`} type="password" placeholder="Mật khẩu mới (bỏ trống nếu giữ)" value={editPass} onChange={(e) => setEditPass(e.target.value)} />
                  <button onClick={() => saveEdit(a)} title="Lưu" className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-foreground text-xs rounded-md">
                    <Check size={14} /> Lưu
                  </button>
                  <button onClick={cancelEdit} title="Hủy" className="p-1.5 text-muted-foreground hover:text-foreground"><X size={16} /></button>
                </div>
              ) : (
                /* ==== Chế độ xem ==== */
                <div key={a.id} className="flex items-center justify-between py-2.5 text-sm gap-2">
                  <div className="min-w-0">
                    <span className="text-foreground truncate">{a.name}</span>
                    <span className="text-muted-foreground text-xs ml-2">{a.email}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select value={a.role} onChange={(e) => changeRole(a, e.target.value)}
                      disabled={isAdmin}
                      title={isAdmin ? "Không thể đổi vai trò tài khoản Admin" : "Đổi vai trò"}
                      className="bg-card border border-border rounded px-2 py-1 text-xs text-foreground outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed">
                      <option value="ADMIN" className="bg-background">ADMIN</option>
                      <option value="STAFF" className="bg-background">STAFF</option>
                    </select>
                    <button onClick={() => startEdit(a)} title="Sửa" className="text-muted-foreground hover:text-blue-400"><PencilSimple size={16} /></button>
                    <button onClick={() => delAccount(a)} title="Xóa" className="text-muted-foreground hover:text-red-400"><Trash size={16} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
