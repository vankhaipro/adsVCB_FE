"use client";

import {
  MagnifyingGlass,
  Funnel,
  Plus,
  YoutubeLogo,
  ArrowSquareOut,
  Trash
} from "@phosphor-icons/react";

const youtubeVideos = [
  { id: "y1", title: "Khóa Học Tự Động Hóa Quảng Cáo Facebook Toàn Diện từ A - Z (Phần 1)", type: "Video", date: "Hôm nay, 10:00", status: "Scheduled", views: "0", ctr: "0.0%" },
  { id: "y2", title: "Sự Khác Biệt Giữa Tài Khoản Quảng Cáo Cá Nhân Và Doanh Nghiệp (BM)", type: "Video", date: "22 Th06, 2026", status: "Published", views: "4,890", ctr: "8.4%" },
  { id: "y3", title: "Shorts: Cách khắc phục thẻ thanh toán bị từ chối trên FB Ads", type: "Short", date: "20 Th06, 2026", status: "Published", views: "18,200", ctr: "12.1%" },
  { id: "y4", title: "Webinar: Đón đầu xu hướng quảng cáo Automation thế hệ mới", type: "Video", date: "18 Th06, 2026", status: "Published", views: "7,500", ctr: "6.9%" },
];

export default function YoutubeContentPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm video YouTube..."
              className="bg-[#111827] border border-[#1f2937] hover:border-gray-700 rounded-lg px-3 py-1.5 pl-9 text-xs focus:border-blue-500 focus:outline-none w-[200px] text-white"
            />
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] rounded-lg text-xs text-gray-300 cursor-pointer">
            <Funnel size={14} />
            Bộ lọc
          </button>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-xs text-white font-bold transition-all shadow-lg shadow-red-500/15 cursor-pointer">
          <Plus size={14} weight="bold" />
          Tải lên video/Shorts mới
        </button>
      </div>

      {/* YouTube Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 font-medium">Tổng Số Sub (Subscribers)</p>
          <h3 className="text-2xl font-bold text-white mt-1">178,900</h3>
          <span className="text-[10px] text-green-500 font-semibold">+1,200 sub mới tuần này</span>
        </div>
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 font-medium">Tổng Lượt Xem (Views)</p>
          <h3 className="text-2xl font-bold text-white mt-1">1,290,000</h3>
          <span className="text-[10px] text-green-500 font-semibold">+8.4% tuần này</span>
        </div>
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 font-medium">Thời gian xem (Giờ)</p>
          <h3 className="text-2xl font-bold text-white mt-1">42,500 h</h3>
          <span className="text-[10px] text-green-500 font-semibold">+5.1% tuần này</span>
        </div>
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 font-medium">CTR Trung Bình (Click-through)</p>
          <h3 className="text-2xl font-bold text-white mt-1">7.82%</h3>
          <span className="text-[10px] text-gray-500">Mức tốt: 5% - 10%</span>
        </div>
      </div>

      {/* YouTube Video List Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-4 border-b border-[#1f2937] pb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <YoutubeLogo size={18} className="text-red-500" />
            Danh sách video YouTube Channel
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1f2937] text-gray-400 text-xs">
                <th className="py-2.5 font-medium">Tên Video / Thumbnail</th>
                <th className="py-2.5 font-medium">Phân loại</th>
                <th className="py-2.5 font-medium">Ngày phát sóng</th>
                <th className="py-2.5 font-medium text-right">Lượt xem</th>
                <th className="py-2.5 font-medium text-right">CTR</th>
                <th className="py-2.5 font-medium text-center">Trạng thái</th>
                <th className="py-2.5 font-medium text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/50 text-gray-300">
              {youtubeVideos.map((video) => (
                <tr key={video.id} className="hover:bg-[#1f2937]/20 transition-colors group">
                  <td className="py-3.5 flex items-center gap-3">
                    <div className="w-16 h-10 rounded bg-gray-800 border border-[#1f2937] flex items-center justify-center text-red-500/40 font-mono text-[10px] shrink-0">
                      {video.type === "Short" ? "Short" : "16:9"}
                    </div>
                    <span className="font-medium text-white max-w-sm truncate group-hover:text-red-400 transition-colors">{video.title}</span>
                  </td>
                  <td className="py-3.5 text-xs">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      video.type === "Short" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                    }`}>
                      {video.type}
                    </span>
                  </td>
                  <td className="py-3.5 text-xs text-gray-400">{video.date}</td>
                  <td className="py-3.5 text-right font-medium">{video.views}</td>
                  <td className="py-3.5 text-right font-medium text-gray-400">{video.ctr}</td>
                  <td className="py-3.5 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      video.status === "Published" ? "bg-green-500/10 text-green-500" :
                      video.status === "Scheduled" ? "bg-blue-500/10 text-blue-500" :
                      "bg-gray-500/10 text-gray-400"
                    }`}>
                      {video.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1 hover:text-red-500 transition-colors cursor-pointer" title="Mở link Youtube">
                        <ArrowSquareOut size={14} />
                      </button>
                      <button className="p-1 hover:text-red-500 transition-colors cursor-pointer" title="Xóa">
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
