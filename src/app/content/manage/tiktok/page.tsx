"use client";

import {
  MagnifyingGlass,
  Funnel,
  Plus,
  TiktokLogo
} from "@phosphor-icons/react";

const tiktokVideos = [
  { id: "t1", title: "Khi bạn để AI tự tối ưu ads và cái kết cực bất ngờ 😂 #auto #ai", date: "Hôm qua", views: "124,500", likes: "12,400", shares: "1,200", duration: "0:45" },
  { id: "t2", title: "Hướng dẫn cài đặt Quy Tắc Tự Động Facebook Ads siêu dễ #adsvcb", date: "3 ngày trước", views: "84,200", likes: "6,900", shares: "540", duration: "1:12" },
  { id: "t3", title: "1 ngày làm việc của Admin vận hành Auto Ads Facebook có gì?", date: "5 ngày trước", views: "215,900", likes: "18,200", shares: "2,300", duration: "2:05" },
  { id: "t4", title: "Tips né bão quét tài khoản quảng cáo mới nhất #ads #facebook", date: "1 tuần trước", views: "45,100", likes: "3,100", shares: "190", duration: "0:58" },
];

export default function TiktokContentPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm video TikTok..."
              className="bg-[#111827] border border-[#1f2937] hover:border-gray-700 rounded-lg px-3 py-1.5 pl-9 text-xs focus:border-blue-500 focus:outline-none w-[200px] text-white"
            />
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] rounded-lg text-xs text-gray-300 cursor-pointer">
            <Funnel size={14} />
            Bộ lọc
          </button>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded-lg text-xs text-white font-bold transition-all shadow-lg shadow-pink-500/15 cursor-pointer">
          <Plus size={14} weight="bold" />
          Đăng video TikTok mới
        </button>
      </div>

      {/* TikTok Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 font-medium">Lượt Xem Video (Views)</p>
          <h3 className="text-2xl font-bold text-white mt-1">2,420,200</h3>
          <span className="text-[10px] text-green-500 font-semibold">+18.5% tuần này</span>
        </div>
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 font-medium">Lượt Tim (Likes)</p>
          <h3 className="text-2xl font-bold text-white mt-1">456,800</h3>
          <span className="text-[10px] text-green-500 font-semibold">+12.4% tuần này</span>
        </div>
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 font-medium">Chia Sẻ (Shares)</p>
          <h3 className="text-2xl font-bold text-white mt-1">12,400</h3>
          <span className="text-[10px] text-green-500 font-semibold">+22.1% tuần này</span>
        </div>
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 font-medium">Tỷ lệ xem hết (Completion Rate)</p>
          <h3 className="text-2xl font-bold text-white mt-1">15.42%</h3>
          <span className="text-[10px] text-gray-500">Mức trung bình ngành: 12%</span>
        </div>
      </div>

      {/* TikTok Grid Videos Layout */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <TiktokLogo size={18} className="text-pink-500" />
          Nội dung TikTok đã tải lên
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiktokVideos.map((video) => (
            <div key={video.id} className="bg-[#111827] border border-[#1f2937] hover:border-pink-500/40 rounded-xl overflow-hidden shadow-md flex flex-col group transition-all duration-300">
              {/* Fake Thumbnail */}
              <div className="h-44 bg-gradient-to-br from-gray-900 via-gray-800 to-pink-900/20 relative flex items-center justify-center border-b border-[#1f2937]">
                <TiktokLogo size={48} className="text-gray-700/50 group-hover:text-pink-500/20 group-hover:scale-110 transition-all duration-300" />
                <span className="absolute bottom-2 right-2 text-[10px] bg-black/70 px-1.5 py-0.5 rounded text-white font-mono">
                  {video.duration}
                </span>
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="text-[10px] bg-green-500/80 px-2 py-0.5 rounded-full font-bold text-black">TikTok</span>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-white line-clamp-2 leading-snug group-hover:text-pink-400 transition-all">
                    {video.title}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">{video.date}</p>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-3 border-t border-[#1f2937] text-center">
                  <div>
                    <p className="text-xs font-bold text-white">{video.views}</p>
                    <p className="text-[9px] text-gray-500">Views</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-pink-400">{video.likes}</p>
                    <p className="text-[9px] text-gray-500">Likes</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{video.shares}</p>
                    <p className="text-[9px] text-gray-500">Shares</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
