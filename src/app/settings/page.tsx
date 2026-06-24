"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash, SpinnerGap, UsersThree, User } from "@phosphor-icons/react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

type Team = { id: string; name: string; _count: { employees: number } };
type Employee = { id: string; name: string; team: { id: string; name: string } | null };

export default function SettingsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [teamName, setTeamName] = useState("");
  const [empName, setEmpName] = useState("");
  const [empTeamId, setEmpTeamId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [t, e] = await Promise.all([apiGet("/teams"), apiGet("/employees")]);
      setTeams(t);
      setEmployees(e);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addTeam = async () => {
    if (!teamName.trim()) return;
    try {
      await apiPost("/teams", { name: teamName.trim() });
      setTeamName("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Thêm team lỗi");
    }
  };

  const addEmployee = async () => {
    if (!empName.trim()) return;
    try {
      await apiPost("/employees", { name: empName.trim(), teamId: empTeamId || undefined });
      setEmpName("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Thêm nhân viên lỗi");
    }
  };

  const delTeam = async (t: Team) => {
    if (!confirm(`Xóa team "${t.name}"? Nhân viên thuộc team sẽ bị gỡ team.`)) return;
    try { await apiDelete(`/teams/${t.id}`); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : "Xóa team lỗi"); }
  };

  const delEmployee = async (e: Employee) => {
    if (!confirm(`Xóa nhân viên "${e.name}"?`)) return;
    try { await apiDelete(`/employees/${e.id}`); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : "Xóa nhân viên lỗi"); }
  };

  const inputCls =
    "bg-[#1e293b] border border-[#334155] rounded-md px-3 py-2 text-sm text-white outline-none focus:border-blue-500 placeholder:text-gray-500";

  return (
    <div className="flex flex-col gap-5 w-full max-w-full overflow-x-hidden pb-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Cài đặt</h1>
        <p className="text-sm text-gray-400 mt-1">Quản lý danh sách Team &amp; Nhân viên (dùng làm gợi ý khi thêm kênh).</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-md px-4 py-2">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-20 gap-3 text-gray-400">
          <SpinnerGap size={28} className="animate-spin text-blue-500" /> Đang tải...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Teams */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <UsersThree size={18} className="text-blue-400" /> Team ({teams.length})
            </h3>
            <div className="flex gap-2 mb-4">
              <input
                className={`${inputCls} flex-1`}
                placeholder="Tên team (vd: K4)"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTeam()}
              />
              <button onClick={addTeam} className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md">
                <Plus size={16} /> Thêm
              </button>
            </div>
            <div className="flex flex-col divide-y divide-[#1e293b]/60">
              {teams.length === 0 ? (
                <span className="text-xs text-gray-500 py-4 text-center">Chưa có team nào.</span>
              ) : (
                teams.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-gray-200">{t.name} <span className="text-gray-500 text-xs">({t._count.employees} nv)</span></span>
                    <button onClick={() => delTeam(t)} className="text-gray-500 hover:text-red-400"><Trash size={16} /></button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Employees */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <User size={18} className="text-blue-400" /> Nhân viên ({employees.length})
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <select className={inputCls} value={empTeamId} onChange={(e) => setEmpTeamId(e.target.value)}>
                <option value="" className="bg-[#0f172a]">— Team —</option>
                {teams.map((t) => <option key={t.id} value={t.id} className="bg-[#0f172a]">{t.name}</option>)}
              </select>
              <input
                className={`${inputCls} flex-1 min-w-[140px]`}
                placeholder="Tên nhân viên"
                value={empName}
                onChange={(e) => setEmpName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addEmployee()}
              />
              <button onClick={addEmployee} className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md">
                <Plus size={16} /> Thêm
              </button>
            </div>
            <div className="flex flex-col divide-y divide-[#1e293b]/60">
              {employees.length === 0 ? (
                <span className="text-xs text-gray-500 py-4 text-center">Chưa có nhân viên nào.</span>
              ) : (
                employees.map((e) => (
                  <div key={e.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-gray-200">{e.name} {e.team && <span className="text-gray-500 text-xs">· {e.team.name}</span>}</span>
                    <button onClick={() => delEmployee(e)} className="text-gray-500 hover:text-red-400"><Trash size={16} /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
