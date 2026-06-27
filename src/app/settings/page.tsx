"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash, SpinnerGap, UsersThree, User, Trophy, Key, FloppyDisk } from "@phosphor-icons/react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";

type Team = { id: string; name: string; _count: { employees: number } };
type Employee = { id: string; name: string; code: string | null; team: { id: string; name: string } | null };
type Account = { id: string; email: string; name: string; role: string };

type Tab = "employees" | "win" | "accounts";

const inputCls =
  "bg-[#1e293b] border border-[#334155] rounded-md px-3 py-2 text-sm text-white outline-none focus:border-blue-500 placeholder:text-gray-500";

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("employees");
  const [error, setError] = useState<string | null>(null);

  // --- Nhân viên / Team ---
  const [teams, setTeams] = useState<Team[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");
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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [t, e, s, u] = await Promise.all([
        apiGet("/teams"), apiGet("/employees"), apiGet("/settings"), apiGet("/users"),
      ]);
      setTeams(t); setEmployees(e); setAccounts(u);
      setWinViews(String(s.win_min_views ?? "")); setWinEng(String(s.win_min_engagement_rate ?? ""));
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
    await apiPost("/teams", { name: teamName.trim() }); setTeamName(""); await load();
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
    if (!accEmail.trim() || !accName.trim() || !accPass) { setError("Nhập đủ email / tên / mật khẩu"); return; }
    await apiPost("/users", { email: accEmail.trim(), name: accName.trim(), password: accPass, role: accRole });
    setAccEmail(""); setAccName(""); setAccPass(""); setAccRole("ADMIN"); await load();
  }, "Thêm tài khoản lỗi");

  const changeRole = (a: Account, role: string) =>
    guard(async () => { await apiPatch(`/users/${a.id}`, { role }); await load(); }, "Đổi vai trò lỗi")();

  const delAccount = (a: Account) => guard(async () => {
    if (!confirm(`Xóa tài khoản "${a.email}"?`)) return;
    await apiDelete(`/users/${a.id}`); await load();
  }, "Xóa tài khoản lỗi")();

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "employees", label: "Nhân viên", icon: <User size={16} /> },
    { id: "win", label: "Ngưỡng Win", icon: <Trophy size={16} /> },
    { id: "accounts", label: "Tài khoản", icon: <Key size={16} /> },
  ];

  return (
    <div className="flex flex-col gap-5 w-full max-w-full overflow-x-hidden pb-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Cài đặt</h1>
        <p className="text-sm text-gray-400 mt-1">Quản lý Nhân viên, ngưỡng Win/Not-win và tài khoản đăng nhập.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#1e293b]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t.id ? "border-blue-500 text-white" : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-md px-4 py-2">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center p-20 gap-3 text-gray-400">
          <SpinnerGap size={28} className="animate-spin text-blue-500" /> Đang tải...
        </div>
      ) : tab === "employees" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Teams */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <UsersThree size={18} className="text-blue-400" /> Team ({teams.length})
            </h3>
            <div className="flex gap-2 mb-4">
              <input className={`${inputCls} flex-1`} placeholder="Tên team (vd: K4)" value={teamName}
                onChange={(e) => setTeamName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTeam()} />
              <button onClick={addTeam} className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md">
                <Plus size={16} /> Thêm
              </button>
            </div>
            <div className="flex flex-col divide-y divide-[#1e293b]/60">
              {teams.length === 0 ? (
                <span className="text-xs text-gray-500 py-4 text-center">Chưa có team nào.</span>
              ) : teams.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-gray-200">{t.name} <span className="text-gray-500 text-xs">({t._count.employees} nv)</span></span>
                  <button onClick={() => delTeam(t)} className="text-gray-500 hover:text-red-400"><Trash size={16} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Employees */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <User size={18} className="text-blue-400" /> Nhân viên ({employees.length})
            </h3>
            <p className="text-[11px] text-gray-500 mb-3">Mã NV = mã trong hashtag (vd <code className="text-gray-300">K403</code>) để map nội dung về đúng người.</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <select className={inputCls} value={empTeamId} onChange={(e) => setEmpTeamId(e.target.value)}>
                <option value="" className="bg-[#0f172a]">— Team —</option>
                {teams.map((t) => <option key={t.id} value={t.id} className="bg-[#0f172a]">{t.name}</option>)}
              </select>
              <input className={`${inputCls} w-24`} placeholder="Mã (K403)" value={empCode}
                onChange={(e) => setEmpCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addEmployee()} />
              <input className={`${inputCls} flex-1 min-w-[120px]`} placeholder="Tên nhân viên" value={empName}
                onChange={(e) => setEmpName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addEmployee()} />
              <button onClick={addEmployee} className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md">
                <Plus size={16} /> Thêm
              </button>
            </div>
            <div className="flex flex-col divide-y divide-[#1e293b]/60">
              {employees.length === 0 ? (
                <span className="text-xs text-gray-500 py-4 text-center">Chưa có nhân viên nào.</span>
              ) : employees.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-2.5 text-sm gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      defaultValue={e.code ?? ""} placeholder="mã"
                      className="bg-[#1e293b] border border-[#334155] rounded px-2 py-1 text-xs text-white w-20 outline-none focus:border-blue-500"
                      onBlur={(ev) => { const v = ev.target.value.trim(); if (v !== (e.code ?? "")) saveEmpCode(e, v); }}
                    />
                    <span className="text-gray-200 truncate">{e.name} {e.team && <span className="text-gray-500 text-xs">· {e.team.name}</span>}</span>
                  </div>
                  <button onClick={() => delEmployee(e)} className="text-gray-500 hover:text-red-400 shrink-0"><Trash size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : tab === "win" ? (
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 max-w-xl">
          <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
            <Trophy size={18} className="text-yellow-400" /> Ngưỡng Win / Not-win
          </h3>
          <p className="text-[11px] text-gray-500 mb-4">Một video tính là <b className="text-green-400">Win</b> khi views ≥ ngưỡng (và nếu đặt tỉ lệ tương tác &gt; 0 thì phải đạt thêm).</p>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Views tối thiểu để Win</span>
              <input type="number" className={inputCls} value={winViews} onChange={(e) => setWinViews(e.target.value)} placeholder="vd 1000" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Tỉ lệ tương tác tối thiểu (%) — 0 = bỏ qua</span>
              <input type="number" className={inputCls} value={winEng} onChange={(e) => setWinEng(e.target.value)} placeholder="vd 5" />
            </label>
            <button onClick={saveWin} className="flex items-center gap-1.5 self-start px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md">
              <FloppyDisk size={16} /> Lưu {winSaved && <span className="text-green-300">✓ đã lưu</span>}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 max-w-3xl">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Key size={18} className="text-blue-400" /> Tài khoản đăng nhập ({accounts.length})
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <input className={`${inputCls} flex-1 min-w-[160px]`} placeholder="Email" value={accEmail} onChange={(e) => setAccEmail(e.target.value)} />
            <input className={`${inputCls} flex-1 min-w-[120px]`} placeholder="Tên" value={accName} onChange={(e) => setAccName(e.target.value)} />
            <input className={`${inputCls} w-36`} type="password" placeholder="Mật khẩu" value={accPass} onChange={(e) => setAccPass(e.target.value)} />
            <select className={inputCls} value={accRole} onChange={(e) => setAccRole(e.target.value)}>
              <option value="ADMIN" className="bg-[#0f172a]">ADMIN</option>
              <option value="STAFF" className="bg-[#0f172a]">STAFF</option>
            </select>
            <button onClick={addAccount} className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md">
              <Plus size={16} /> Thêm
            </button>
          </div>
          <div className="flex flex-col divide-y divide-[#1e293b]/60">
            {accounts.length === 0 ? (
              <span className="text-xs text-gray-500 py-4 text-center">Chưa có tài khoản nào.</span>
            ) : accounts.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2.5 text-sm gap-2">
                <div className="min-w-0">
                  <span className="text-gray-200 truncate">{a.name}</span>
                  <span className="text-gray-500 text-xs ml-2">{a.email}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select value={a.role} onChange={(e) => changeRole(a, e.target.value)}
                    className="bg-[#1e293b] border border-[#334155] rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500">
                    <option value="ADMIN" className="bg-[#0f172a]">ADMIN</option>
                    <option value="STAFF" className="bg-[#0f172a]">STAFF</option>
                  </select>
                  <button onClick={() => delAccount(a)} className="text-gray-500 hover:text-red-400"><Trash size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
