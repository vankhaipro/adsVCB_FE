"use client";

import { useState } from "react";
import {
  MagnifyingGlass,
  Funnel,
  Plus,
  FacebookLogo,
  Eye,
  Trash,
  TrendUp
} from "@phosphor-icons/react";

const metaPosts = [
  { id: "m1", title: "Cách chạy quảng cáo chuyển đổi hiệu quả năm 2026", type: "Facebook Post", date: "26 Th06, 08:00", status: "Scheduled", reach: "0", engagement: "0" },
  { id: "m2", title: "Chia sẻ tips target đối tượng khách hàng bất động sản cao cấp", type: "Facebook Post", date: "25 Th06, 17:30", status: "Published", reach: "15,200", engagement: "1,480" },
  { id: "m3", title: "Video ngắn: Hướng dẫn đọc báo cáo Ads siêu tốc", type: "Instagram Reel", date: "24 Th06, 15:00", status: "Published", reach: "28,400", engagement: "3,120" },
  { id: "m4", title: "Chương trình ưu đãi nạp tiền Ads tài khoản đại lý VCB", type: "Facebook Image", date: "Draft", status: "Draft", reach: "0", engagement: "0" },
];

export default function MetaContentPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              className="bg-[#111827] border border-[#1f2937] hover:border-gray-700 rounded-lg px-3 py-1.5 pl-9 text-xs focus:border-blue-500 focus:outline-none w-[200px] text-white"
            />
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] rounded-lg text-xs text-gray-300 cursor-pointer">
            <Funnel size={14} />
            Bộ lọc
          </button>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs text-white font-bold transition-all shadow-lg shadow-blue-500/15 cursor-pointer">
          <Plus size={14} weight="bold" />
          Lên lịch bài viết mới
        </button>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 font-medium">Lượt tiếp cận trang Facebook</p>
          <h3 className="text-2xl font-bold text-white mt-2">689,400</h3>
          <p className="text-[10px] text-green-500 mt-1 font-semibold flex items-center gap-0.5">
            <TrendUp size={12} />
            +8.9% so với tuần trước
          </p>
        </div>
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 font-medium">Lượt tiếp cận Instagram</p>
          <h3 className="text-2xl font-bold text-white mt-2">490,800</h3>
          <p className="text-[10px] text-green-500 mt-1 font-semibold flex items-center gap-0.5">
            <TrendUp size={12} />
            +15.2% so với tuần trước
          </p>
        </div>
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 font-medium">Chi phí sản xuất content trung bình</p>
          <h3 className="text-2xl font-bold text-white mt-2">0đ</h3>
          <p className="text-[10px] text-gray-500 mt-1">Đội ngũ In-house organic</p>
        </div>
      </div>

      {/* Meta Content Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-4 border-b border-[#1f2937] pb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <FacebookLogo size={18} className="text-blue-500" />
            Danh sách bài viết Meta (Facebook & Instagram)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1f2937] text-gray-400 text-xs">
                <th className="py-2.5 font-medium">Chi tiết bài viết</th>
                <th className="py-2.5 font-medium">Phân loại</th>
                <th className="py-2.5 font-medium">Lịch đăng/Ngày đăng</th>
                <th className="py-2.5 font-medium text-right">Tiếp cận</th>
                <th className="py-2.5 font-medium text-right">Tương tác</th>
                <th className="py-2.5 font-medium text-center">Trạng thái</th>
                <th className="py-2.5 font-medium text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/50 text-gray-300">
              {metaPosts.map((post) => (
                <tr key={post.id} className="hover:bg-[#1f2937]/20 transition-colors group">
                  <td className="py-3.5 font-medium text-white max-w-sm truncate group-hover:text-blue-400 transition-colors">{post.title}</td>
                  <td className="py-3.5 text-xs text-gray-300">{post.type}</td>
                  <td className="py-3.5 text-xs text-gray-400">{post.date}</td>
                  <td className="py-3.5 text-right font-medium">{post.reach}</td>
                  <td className="py-3.5 text-right font-medium">{post.engagement}</td>
                  <td className="py-3.5 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      post.status === "Published" ? "bg-green-500/10 text-green-500" :
                      post.status === "Scheduled" ? "bg-blue-500/10 text-blue-500" :
                      "bg-gray-500/10 text-gray-400"
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1 hover:text-blue-500 transition-colors cursor-pointer" title="Xem chi tiết">
                        <Eye size={14} />
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
