"use client";

import { useState } from "react";
import {
  CloudArrowDown,
  Plus,
  List,
  Link as LinkIcon,
  Download,
  DownloadSimple,
  Clock,
  Trash
} from "@phosphor-icons/react";

const initialSourcingItems = [
  { id: "s1", title: "Review công cụ tối ưu quảng cáo thông minh Douyin", originUrl: "https://v.douyin.com/xyz123/", source: "Douyin", status: "Sourced" as const, date: "25 Th06, 16:40", size: "45MB" },
  { id: "s2", title: "5 lỗi sai cơ bản khiến quảng cáo Facebook của bạn đắt đỏ", originUrl: "https://www.facebook.com/watch?v=987654", source: "Facebook", status: "Downloading" as const, date: "25 Th06, 19:10", size: "120MB" },
  { id: "s3", title: "Trend biến hình cực cuốn dùng để quảng cáo thời trang", originUrl: "https://www.tiktok.com/@trend/video/112233", source: "TikTok", status: "Idea" as const, date: "24 Th06, 10:00", size: "-" },
  { id: "s4", title: "Tài liệu thiết kế hình ảnh chạy ads có tỷ lệ click cao", originUrl: "https://pinterest.com/pin/556677", source: "Pinterest", status: "Sourced" as const, date: "23 Th06, 14:15", size: "12MB" },
];

export default function SourcingContentPage() {
  const [sourcingItems, setSourcingItems] = useState(initialSourcingItems);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newSource, setNewSource] = useState("TikTok");

  // Handle adding sourced link
  function handleAddSourcing(e: React.FormEvent) {
    e.preventDefault();
    if (!newUrl || !newTitle) return;

    const newItem = {
      id: "s" + (sourcingItems.length + 1),
      title: newTitle,
      originUrl: newUrl,
      source: newSource,
      status: "Idea" as const,
      date: "Vừa xong",
      size: "-"
    };

    setSourcingItems([newItem, ...sourcingItems]);
    setNewUrl("");
    setNewTitle("");
  }

  // Handle delete sourcing item
  function handleDeleteSourcing(id: string) {
    setSourcingItems(sourcingItems.filter(item => item.id !== id));
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Sourcing Add Card */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <CloudArrowDown size={18} className="text-blue-500" />
          Thu thập / Sourcing Content từ đối thủ
        </h3>
        
        <form onSubmit={handleAddSourcing} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 flex flex-col gap-1.5 w-full">
            <label className="text-xs text-gray-400 font-medium">Tiêu đề / Ý tưởng content</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ví dụ: Video review tính năng hay ho của BM"
              className="bg-[#1f2937]/50 border border-[#1f2937] hover:border-gray-700 rounded-lg px-3 py-2 text-xs focus:border-blue-500 focus:outline-none w-full text-white"
            />
          </div>

          <div className="flex-1 flex flex-col gap-1.5 w-full">
            <label className="text-xs text-gray-400 font-medium">Dán đường dẫn (Link Douyin, TikTok, Facebook...)</label>
            <input
              type="url"
              required
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://www.tiktok.com/@competitor/video/..."
              className="bg-[#1f2937]/50 border border-[#1f2937] hover:border-gray-700 rounded-lg px-3 py-2 text-xs focus:border-blue-500 focus:outline-none w-full text-white"
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full md:w-[150px]">
            <label className="text-xs text-gray-400 font-medium">Nền tảng nguồn</label>
            <select
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              className="bg-[#1f2937] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none w-full"
            >
              <option value="TikTok">TikTok</option>
              <option value="Facebook">Facebook Watch</option>
              <option value="Douyin">Douyin</option>
              <option value="Pinterest">Pinterest</option>
            </select>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs text-white font-bold transition-all w-full md:w-auto shrink-0 shadow-lg shadow-blue-500/15 cursor-pointer"
          >
            <Plus size={14} weight="bold" />
            Thêm liên kết
          </button>
        </form>
      </div>

      {/* Sourcing Backlog Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-4 border-b border-[#1f2937] pb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <List size={18} className="text-blue-500" />
            Danh mục ý tưởng và file tải xuống
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1f2937] text-gray-400 text-xs">
                <th className="py-2.5 font-medium">Tiêu đề content</th>
                <th className="py-2.5 font-medium">URL nguồn</th>
                <th className="py-2.5 font-medium">Nguồn</th>
                <th className="py-2.5 font-medium">Ngày thu thập</th>
                <th className="py-2.5 font-medium">Dung lượng</th>
                <th className="py-2.5 font-medium text-center">Trạng thái</th>
                <th className="py-2.5 font-medium text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/50 text-gray-300">
              {sourcingItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#1f2937]/20 transition-colors group">
                  <td className="py-3.5 font-medium text-white max-w-xs truncate group-hover:text-blue-400 transition-colors">{item.title}</td>
                  <td className="py-3.5 text-xs max-w-[150px] truncate text-gray-500 font-mono group-hover:text-gray-300 transition-colors">
                    <a href={item.originUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                      <LinkIcon size={12} />
                      {item.originUrl}
                    </a>
                  </td>
                  <td className="py-3.5 text-xs font-semibold text-gray-400">{item.source}</td>
                  <td className="py-3.5 text-xs text-gray-500">{item.date}</td>
                  <td className="py-3.5 text-xs text-gray-400 font-mono">{item.size}</td>
                  <td className="py-3.5 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === "Sourced" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                      item.status === "Downloading" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20 animate-pulse" :
                      "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {item.status === "Sourced" ? (
                        <button className="p-1 hover:text-blue-500 transition-colors cursor-pointer" title="Tải xuống file">
                          <Download size={14} />
                        </button>
                      ) : item.status === "Idea" ? (
                        <button
                          onClick={() => {
                            setSourcingItems(sourcingItems.map(si => si.id === item.id ? { ...si, status: "Downloading" as const } : si));
                            setTimeout(() => {
                              setSourcingItems(sourcingItems.map(si => si.id === item.id ? { ...si, status: "Sourced" as const, size: "32MB" } : si));
                            }, 3000);
                          }}
                          className="p-1 hover:text-blue-500 transition-colors cursor-pointer text-blue-400"
                          title="Tải video về Server"
                        >
                          <DownloadSimple size={14} />
                        </button>
                      ) : (
                        <button className="p-1 text-gray-500 transition-colors" disabled title="Đang xử lý...">
                          <Clock size={14} className="animate-spin" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteSourcing(item.id)}
                        className="p-1 hover:text-red-500 transition-colors cursor-pointer"
                        title="Xóa ý tưởng"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
