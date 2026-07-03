"use client";

import { useState } from "react";
import DateRangePicker, { presetToDates } from "@/components/DateRangePicker";
import {
  Gear,
  CaretDown,
  DownloadSimple,
  ArrowClockwise,
  Play,
  Plus,
  ChartBar,
  PencilSimple,
  Trash,
  UserCircle,
  FolderOpen,
  CaretLeft,
  CaretRight,
  ArrowsDownUp
} from "@phosphor-icons/react";

// Mock Channel list data (Page 1)
const initialChannelsPage1 = [
  { id: "c1", name: "Không có dữ liệu", username: "vangbacphuquy", topic: "-", views: 0, newVideos: 0, followers: 0, likes: 0, totalVideos: 0, topVideos: "Không có dữ liệu" },
  { id: "c2", name: "Không có dữ liệu", username: "vanggiaphuoc.0944444510", topic: "-", views: 0, newVideos: 0, followers: 0, likes: 0, totalVideos: 0, topVideos: "Không có dữ liệu" },
  { id: "c3", name: "Không có dữ liệu", username: "ngocphithuy.vn", topic: "-", views: 0, newVideos: 0, followers: 0, likes: 0, totalVideos: 0, topVideos: "Không có dữ liệu" },
  { id: "c4", name: "Không có dữ liệu", username: "chuyennhacaobac", topic: "-", views: 0, newVideos: 0, followers: 0, likes: 0, totalVideos: 0, topVideos: "Không có dữ liệu" },
  { id: "c5", name: "Không có dữ liệu", username: "lygiatrangsucphongthuy", topic: "-", views: 0, newVideos: 0, followers: 0, likes: 0, totalVideos: 0, topVideos: "Không có dữ liệu" },
  { id: "c6", name: "Không có dữ liệu", username: "dieptrangsuc", topic: "-", views: 0, newVideos: 0, followers: 0, likes: 0, totalVideos: 0, topVideos: "Không có dữ liệu" },
  { id: "c7", name: "Không có dữ liệu", username: "suki.silver7", topic: "-", views: 0, newVideos: 0, followers: 0, likes: 0, totalVideos: 0, topVideos: "Không có dữ liệu" }
];

// Mock Channel list data (Page 2)
const initialChannelsPage2 = [
  { id: "c8", name: "Không có dữ liệu", username: "qmj.vangbac.quangminh", topic: "-", views: 0, newVideos: 0, followers: 0, likes: 0, totalVideos: 0, topVideos: "Không có dữ liệu" },
  { id: "c9", name: "Không có dữ liệu", username: "huythanhjewelry.official", topic: "-", views: 0, newVideos: 0, followers: 0, likes: 0, totalVideos: 0, topVideos: "Không có dữ liệu" },
  { id: "c10", name: "Không có dữ liệu", username: "vangbachaihanh2", topic: "-", views: 0, newVideos: 0, followers: 0, likes: 0, totalVideos: 0, topVideos: "Không có dữ liệu" },
  { id: "c11", name: "Không có dữ liệu", username: "htjewelrydn", topic: "-", views: 0, newVideos: 0, followers: 0, likes: 0, totalVideos: 0, topVideos: "Không có dữ liệu" },
  { id: "c12", name: "Không có dữ liệu", username: "trangsuc.kimtin", topic: "-", views: 0, newVideos: 0, followers: 0, likes: 0, totalVideos: 0, topVideos: "Không có dữ liệu" },
  { id: "c13", name: "Không có dữ liệu", username: "tuan_moissanite", topic: "-", views: 0, newVideos: 0, followers: 0, likes: 0, totalVideos: 0, topVideos: "Không có dữ liệu" },
  { id: "c14", name: "Không có dữ liệu", username: "thanhkykarat", topic: "-", views: 0, newVideos: 0, followers: 0, likes: 0, totalVideos: 0, topVideos: "Không có dữ liệu" }
];

export default function SourcingContentPage() {
  const [activeSubTab, setActiveSubTab] = useState<"video" | "channel">("video");
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);
  const [channels, setChannels] = useState([...initialChannelsPage1]);

  // Bộ lọc ngày — dùng chung component DateRangePicker với toàn web.
  const [analysisDate, setAnalysisDate] = useState(() => ({
    presetId: "last30days",
    ...presetToDates("last30days"),
  }));
  const [postDate, setPostDate] = useState(() => ({
    presetId: "last30days",
    ...presetToDates("last30days"),
  }));
  const [channelDate, setChannelDate] = useState(() => ({
    presetId: "last30days",
    ...presetToDates("last30days"),
  }));

  function handlePageChange(page: 1 | 2) {
    setCurrentPage(page);
    setChannels(page === 1 ? [...initialChannelsPage1] : [...initialChannelsPage2]);
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full max-w-full text-foreground">

      {/* Sub-menu Tabs Row */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2 bg-card p-1 rounded-lg border border-border">
          <button
            onClick={() => setActiveSubTab("video")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeSubTab === "video"
                ? "bg-muted text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Video
          </button>
          <button
            onClick={() => setActiveSubTab("channel")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeSubTab === "channel"
                ? "bg-muted text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Kênh
          </button>
        </div>

        {/* Date picker on tab Kênh */}
        {activeSubTab === "channel" && (
          <div className="flex items-center gap-3">
            <DateRangePicker
              presetId={channelDate.presetId}
              from={channelDate.from}
              to={channelDate.to}
              onApply={setChannelDate}
            />

            {/* Create New Button */}
            <button className="flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary rounded-lg text-xs text-foreground font-bold transition-colors cursor-pointer shadow-md shadow-blue-500/10">
              <Plus size={14} weight="bold" />
              Tạo mới
            </button>
          </div>
        )}
      </div>

      {/* Conditional UI based on active tab */}
      {activeSubTab === "video" ? (
        <>
          {/* Filters Form Panel */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

              {/* Row 1 */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[15px] text-muted-foreground font-semibold uppercase tracking-wider">Thời gian phân tích</span>
                <DateRangePicker
                  presetId={analysisDate.presetId}
                  from={analysisDate.from}
                  to={analysisDate.to}
                  onApply={setAnalysisDate}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[15px] text-muted-foreground font-semibold uppercase tracking-wider">Ngày đăng video</span>
                <DateRangePicker
                  presetId={postDate.presetId}
                  from={postDate.from}
                  to={postDate.to}
                  onApply={setPostDate}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[15px] text-muted-foreground font-semibold uppercase tracking-wider">Lượt xem</span>
                <div className="relative">
                  <select className="w-full bg-muted/50 border border-border hover:border-border rounded-lg px-3 py-2 text-xs text-foreground appearance-none focus:outline-none focus:border-blue-500 cursor-pointer pr-8 font-medium">
                    <option>Không giới hạn</option>
                  </select>
                  <CaretDown size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[15px] text-muted-foreground font-semibold uppercase tracking-wider">Lượt thích</span>
                <div className="relative">
                  <select className="w-full bg-muted/50 border border-border hover:border-border rounded-lg px-3 py-2 text-xs text-foreground appearance-none focus:outline-none focus:border-blue-500 cursor-pointer pr-8 font-medium">
                    <option>Không giới hạn</option>
                  </select>
                  <CaretDown size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[15px] text-muted-foreground font-semibold uppercase tracking-wider">Nền tảng</span>
                <div className="relative bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground font-medium">
                  Tiktok
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[15px] text-muted-foreground font-semibold uppercase tracking-wider">Kênh</span>
                <div className="relative bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground font-medium">
                  Tất cả
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[15px] text-muted-foreground font-semibold uppercase tracking-wider">Lượt bình luận</span>
                <div className="relative">
                  <select className="w-full bg-muted/50 border border-border hover:border-border rounded-lg px-3 py-2 text-xs text-foreground appearance-none focus:outline-none focus:border-blue-500 cursor-pointer pr-8 font-medium">
                    <option>Không giới hạn</option>
                  </select>
                  <CaretDown size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[15px] text-muted-foreground font-semibold uppercase tracking-wider">Lượt chia sẻ</span>
                <div className="relative">
                  <select className="w-full bg-muted/50 border border-border hover:border-border rounded-lg px-3 py-2 text-xs text-foreground appearance-none focus:outline-none focus:border-blue-500 cursor-pointer pr-8 font-medium">
                    <option>Không giới hạn</option>
                  </select>
                  <CaretDown size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <div className="flex items-center gap-1">
                  <span className="text-[15px] text-muted-foreground font-semibold uppercase tracking-wider">Lọc theo nhãn</span>
                  <button className="text-muted-foreground hover:text-foreground" title="Cấu hình nhãn">
                    <Gear size={12} />
                  </button>
                </div>
                <div className="relative">
                  <select className="w-full bg-muted/50 border border-border hover:border-border rounded-lg px-3 py-2 text-xs text-muted-foreground appearance-none focus:outline-none focus:border-blue-500 cursor-pointer pr-8">
                    <option>Chọn nhãn</option>
                  </select>
                  <CaretDown size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <span className="text-[15px] text-muted-foreground font-semibold uppercase tracking-wider">Tỉ lệ tương tác</span>
                <div className="relative">
                  <select className="w-full bg-muted/50 border border-border hover:border-border rounded-lg px-3 py-2 text-xs text-foreground appearance-none focus:outline-none focus:border-blue-500 cursor-pointer pr-8 font-medium">
                    <option>Không giới hạn</option>
                  </select>
                  <CaretDown size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

            </div>

            {/* Buttons Row */}
            <div className="flex justify-end items-center gap-2.5 mt-5 pt-3 border-t border-border">
              <button className="flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary rounded-lg text-xs text-foreground font-bold transition-all cursor-pointer">
                <DownloadSimple size={14} weight="bold" />
                Tải tài liệu
              </button>

              <button className="flex items-center gap-1.5 px-4 py-1.5 bg-muted hover:bg-muted border border-border hover:border-border text-foreground rounded-lg text-xs font-semibold cursor-pointer transition-colors">
                <ArrowClockwise size={14} />
                Làm mới bộ lọc
              </button>

              <button className="flex items-center gap-1.5 px-4 py-1.5 bg-muted/40 text-muted-foreground rounded-lg text-xs font-semibold cursor-not-allowed select-none" disabled>
                <Play size={14} weight="fill" />
                Phân tích
              </button>
            </div>
          </div>

          {/* Sourcing Empty Video Table */}
          <div className="bg-card border border-border rounded-xl shadow-md overflow-hidden flex flex-col flex-1">
            <div className="overflow-auto w-full max-h-[calc(100vh-420px)] custom-scrollbar">
              <table style={{ minWidth: "1900px" }} className="w-full text-left text-xs border-collapse relative">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold select-none">
                    <th className="sticky top-0 z-10 bg-card py-3 px-4 w-12 text-center border-r border-border">
                      <input type="checkbox" disabled className="accent-blue-500 rounded cursor-not-allowed" />
                    </th>
                    <th className="sticky top-0 z-10 bg-card py-3 px-4 font-bold border-r border-border whitespace-nowrap min-w-[350px]">Video</th>
                    <th className="sticky top-0 z-10 bg-card py-3 px-4 font-bold border-r border-border whitespace-nowrap min-w-[180px]">Kênh</th>
                    <th className="sticky top-0 z-10 bg-card py-3 px-4 font-bold border-r border-border whitespace-nowrap min-w-[140px]">Nhãn</th>
                    <th className="sticky top-0 z-10 bg-card py-3 px-4 font-bold border-r border-border whitespace-nowrap min-w-[180px]">Lịch sử views</th>
                    <th className="sticky top-0 z-10 bg-card py-3 px-4 font-bold border-r border-border whitespace-nowrap text-right min-w-[130px]">Tổng lượt xem</th>
                    <th className="sticky top-0 z-10 bg-card py-3 px-4 font-bold border-r border-border whitespace-nowrap text-right min-w-[120px]">Lượt xem</th>
                    <th className="sticky top-0 z-10 bg-card py-3 px-4 font-bold border-r border-border whitespace-nowrap text-right min-w-[120px]">Lượt thích</th>
                    <th className="sticky top-0 z-10 bg-card py-3 px-4 font-bold border-r border-border whitespace-nowrap text-right min-w-[120px]">Lượt bình luận</th>
                    <th className="sticky top-0 z-10 bg-card py-3 px-4 font-bold border-r border-border whitespace-nowrap text-right min-w-[120px]">Lượt chia sẻ</th>
                    <th className="sticky top-0 z-10 bg-card py-3 px-4 font-bold border-r border-border whitespace-nowrap text-right min-w-[135px]">Tỷ lệ tương tác</th>
                    <th className="sticky top-0 z-10 bg-card py-3 px-4 font-bold border-r border-border whitespace-nowrap min-w-[130px]">Ngày đăng</th>
                    <th className="sticky top-0 z-10 bg-card py-3 px-4 font-bold whitespace-nowrap min-w-[180px]">Hashtags</th>
                  </tr>
                </thead>
              </table>

              {/* Empty Data Placeholder inside scroll boundaries */}
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <FolderOpen size={48} className="text-muted-foreground/80 stroke-1" />
                <span className="text-xs font-semibold">No data</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Tab Kênh */
        <div className="bg-card border border-border rounded-xl shadow-md overflow-hidden flex flex-col flex-1">
          <div className="overflow-auto w-full max-h-[calc(100vh-320px)] custom-scrollbar">
            <table style={{ minWidth: "1500px" }} className="w-full text-left text-xs border-collapse relative">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold select-none">
                  <th className="sticky top-0 z-10 bg-card py-3 px-4 font-bold border-r border-border whitespace-nowrap min-w-[280px]">
                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors">
                      <span>Kênh</span>
                      <ArrowsDownUp size={11} className="text-muted-foreground" />
                    </div>
                  </th>
                  
                  <th className="sticky top-0 z-10 bg-card py-3 px-4 font-bold border-r border-border whitespace-nowrap min-w-[140px]">
                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors">
                      <span>Chủ đề</span>
                      <ArrowsDownUp size={11} className="text-muted-foreground" />
                    </div>
                  </th>
                  
                  <th className="sticky top-0 z-10 bg-card py-3 px-4 font-bold border-r border-border whitespace-nowrap min-w-[140px]">
                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors">
                      <span>Lượt xem</span>
                      <ArrowsDownUp size={11} className="text-muted-foreground" />
                    </div>
                  </th>
                  
                  <th className="sticky top-0 z-10 bg-card py-3 px-4 font-bold border-r border-border whitespace-nowrap min-w-[150px]">
                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors">
                      <span>Số video mới</span>
                      <ArrowsDownUp size={11} className="text-muted-foreground" />
                    </div>
                  </th>
                  
                  <th className="sticky top-0 z-10 bg-card py-3 px-4 font-bold border-r border-border whitespace-nowrap min-w-[180px]">
                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors">
                      <span>Tổng lượt theo dõi</span>
                      <ArrowsDownUp size={11} className="text-muted-foreground" />
                    </div>
                  </th>
                  
                  <th className="sticky top-0 z-10 bg-card py-3 px-4 font-bold border-r border-border whitespace-nowrap min-w-[160px]">
                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors">
                      <span>Tổng lượt thích</span>
                      <ArrowsDownUp size={11} className="text-muted-foreground" />
                    </div>
                  </th>
                  
                  <th className="sticky top-0 z-10 bg-card py-3 px-4 font-bold border-r border-border whitespace-nowrap min-w-[160px]">
                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors">
                      <span>Tổng số video</span>
                      <ArrowsDownUp size={11} className="text-muted-foreground" />
                    </div>
                  </th>
                  
                  <th className="sticky top-0 z-10 bg-card py-3 px-4 font-bold border-r border-border whitespace-nowrap min-w-[200px]">Top videos</th>
                  <th className="sticky top-0 z-10 bg-card py-3 px-4 font-bold text-center whitespace-nowrap min-w-[120px]">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {channels.map((chan) => (
                  <tr key={chan.id} className="hover:bg-muted/20 transition-all">

                    {/* Channel info with avatar */}
                    <td className="py-3 px-4 border-r border-border font-medium">
                      <div className="flex items-center gap-3">
                        <UserCircle size={32} className="text-muted-foreground shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-foreground font-bold leading-tight">{chan.name}</span>
                          <span className="text-[15px] text-muted-foreground font-medium">ID: {chan.username}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 border-r border-border text-muted-foreground font-medium text-left">
                      {chan.topic}
                    </td>

                    <td className="py-3 px-4 border-r border-border font-semibold font-mono text-foreground">
                      {chan.views}
                    </td>

                    <td className="py-3 px-4 border-r border-border font-semibold font-mono text-muted-foreground">
                      {chan.newVideos}
                    </td>

                    <td className="py-3 px-4 border-r border-border font-semibold font-mono italic text-muted-foreground">
                      {chan.followers}
                    </td>

                    <td className="py-3 px-4 border-r border-border font-semibold font-mono italic text-muted-foreground">
                      {chan.likes}
                    </td>

                    <td className="py-3 px-4 border-r border-border font-semibold font-mono text-foreground">
                      {chan.totalVideos}
                    </td>

                    <td className="py-3 px-4 border-r border-border text-muted-foreground font-medium italic">
                      {chan.topVideos}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-3 text-muted-foreground">
                        <button className="p-1 hover:text-foreground transition-colors cursor-pointer" title="Xem biểu đồ">
                          <ChartBar size={16} />
                        </button>
                        <button className="p-1 hover:text-foreground transition-colors cursor-pointer" title="Chỉnh sửa">
                          <PencilSimple size={16} />
                        </button>
                        <button className="p-1 hover:text-red-500 transition-colors cursor-pointer" title="Xóa">
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer containing pagination */}
          <div className="bg-card border-t border-border px-5 py-3 flex items-center justify-end">
            <div className="flex items-center gap-1.5 select-none">

              <button
                onClick={() => currentPage === 2 && handlePageChange(1)}
                className={`p-1.5 rounded transition-colors cursor-pointer ${currentPage === 1 ? "text-muted-foreground cursor-not-allowed" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                disabled={currentPage === 1}
              >
                <CaretLeft size={14} weight="bold" />
              </button>

              <button
                onClick={() => handlePageChange(1)}
                className={`w-6 h-6 rounded text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${currentPage === 1 ? "bg-blue-600 text-foreground font-bold" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                1
              </button>

              <button
                onClick={() => handlePageChange(2)}
                className={`w-6 h-6 rounded text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${currentPage === 2 ? "bg-blue-600 text-foreground font-bold" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                2
              </button>

              <button
                onClick={() => currentPage === 1 && handlePageChange(2)}
                className={`p-1.5 rounded transition-colors cursor-pointer ${currentPage === 2 ? "text-muted-foreground cursor-not-allowed" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                disabled={currentPage === 2}
              >
                <CaretRight size={14} weight="bold" />
              </button>

            </div>
          </div>
        </div>
      )}

      {/* CSS details to style horizontal scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #111827;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1f2937;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #374151;
        }
      `}</style>

    </div>
  );
}
