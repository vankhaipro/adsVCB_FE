import { ArrowsClockwise, Plus, DotsThreeVertical, CaretDown, CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";

export default function OverviewPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-x-hidden pb-10">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Tổng quan</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1f2937] hover:bg-[#374151] text-gray-200 text-sm font-medium rounded-md transition-colors border border-[#374151]">
            <ArrowsClockwise size={16} />
            Làm mới dữ liệu
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-lg shadow-blue-500/20">
            <Plus size={16} weight="bold" />
            Tạo quy tắc mới
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1 */}
        <div className="bg-[#111827] border border-blue-900/30 rounded-xl p-4 flex flex-col relative overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-blue-900/20 to-transparent pointer-events-none"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-400">Chi tiêu hôm nay</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">12,540,000 đ</div>
          <div className="text-xs text-green-500 flex items-center gap-1 mt-auto">
            <span className="text-[10px]">▲</span> 18.6% so với hôm qua
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#111827] border border-green-900/30 rounded-xl p-4 flex flex-col relative overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-green-900/20 to-transparent pointer-events-none"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-400">Doanh thu hôm nay</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">38,750,000 đ</div>
          <div className="text-xs text-green-500 flex items-center gap-1 mt-auto">
            <span className="text-[10px]">▲</span> 24.7% so với hôm qua
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#111827] border border-purple-900/30 rounded-xl p-4 flex flex-col relative overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-purple-900/20 to-transparent pointer-events-none"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-400">ROAS trung bình</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">3.09</div>
          <div className="text-xs text-green-500 flex items-center gap-1 mt-auto">
            <span className="text-[10px]">▲</span> 15.3% so với hôm qua
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#111827] border border-orange-900/30 rounded-xl p-4 flex flex-col relative overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-orange-900/20 to-transparent pointer-events-none"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-400">CPA trung bình</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">42,350 đ</div>
          <div className="text-xs text-red-500 flex items-center gap-1 mt-auto">
            <span className="text-[10px]">▼</span> 6.2% so với hôm qua
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 flex flex-col justify-between">
          <span className="text-sm font-medium text-gray-400">Chiến dịch đang chạy</span>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-white">28 / 36</div>
              <div className="text-xs text-gray-500 mt-1">78% đang hoạt động</div>
            </div>
            <div className="w-10 h-10 rounded-full border-4 border-[#1f2937] border-t-blue-500 border-r-blue-500"></div>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table Column (takes 2 cols) */}
        <div className="lg:col-span-2 bg-[#111827] border border-[#1f2937] rounded-xl flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-[#1f2937]">
            <h2 className="text-base font-semibold text-white">Chiến dịch đang chạy</h2>
            <div className="flex gap-2">
              <button className="text-xs bg-[#1f2937] text-gray-300 px-3 py-1.5 rounded flex items-center gap-2">
                Tất cả tài khoản <CaretDown size={12} />
              </button>
              <button className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1.5">Xem tất cả</button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-xs text-gray-500 uppercase bg-[#111827] border-b border-[#1f2937]">
                <tr>
                  <th className="px-4 py-3 font-medium">Chiến dịch</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium">Ngân sách</th>
                  <th className="px-4 py-3 font-medium">Chi tiêu hôm nay</th>
                  <th className="px-4 py-3 font-medium">CPA</th>
                  <th className="px-4 py-3 font-medium">ROAS</th>
                  <th className="px-4 py-3 font-medium">Quy tắc áp dụng</th>
                  <th className="px-4 py-3 font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]">
                {[1, 2, 3].map((item) => (
                  <tr key={item} className="hover:bg-[#1f2937]/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-4 bg-blue-600 rounded-full flex items-center p-0.5">
                          <div className="w-3 h-3 bg-white rounded-full ml-auto"></div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-200">CBO - Remarketing {item}</p>
                          <p className="text-xs text-gray-500">BM 01 - Chính</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-500 text-xs font-medium">Đang chạy</span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">1,000,000 đ<br/><span className="text-xs text-gray-500">Ngày</span></td>
                    <td className="px-4 py-3 text-gray-300">980,000 đ<br/><span className="text-xs text-gray-500">98%</span></td>
                    <td className="px-4 py-3 text-gray-300">35,120 đ</td>
                    <td className="px-4 py-3 text-green-500">3.45</td>
                    <td className="px-4 py-3 text-gray-300">Tăng ngân sách<br/><span className="text-xs text-gray-500">+15% mỗi 24h</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="text-xs bg-[#374151] hover:bg-gray-600 px-3 py-1 rounded text-gray-200">Chi tiết</button>
                        <button className="text-gray-400 hover:text-white"><DotsThreeVertical size={16} weight="bold" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column Stack */}
        <div className="flex flex-col gap-6">
          {/* Lịch trình hệ thống */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl flex flex-col flex-1">
            <div className="flex items-center justify-between p-4 border-b border-[#1f2937]">
              <h2 className="text-base font-semibold text-white">Lịch trình hệ thống</h2>
              <button className="text-xs text-blue-400 hover:text-blue-300">Xem tất cả</button>
            </div>
            <div className="p-4 flex flex-col gap-4 flex-1">
              {[
                { time: "07:00", title: "Bật chiến dịch", desc: "Tất cả chiến dịch", active: true },
                { time: "11:30", title: "Tăng ngân sách", desc: "Tăng 15% ngân sách", active: true },
                { time: "18:00", title: "Giới hạn chi tiêu", desc: "Dừng khi vượt 80%", active: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="text-sm font-medium text-gray-400 w-10">{item.time}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-200">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <div className="w-8 h-4 bg-green-500/20 rounded-full flex items-center p-0.5">
                    <div className="w-3 h-3 bg-green-500 rounded-full ml-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cảnh báo */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl flex flex-col flex-1">
            <div className="flex items-center justify-between p-4 border-b border-[#1f2937]">
              <h2 className="text-base font-semibold text-white">Cảnh báo</h2>
              <button className="text-xs text-blue-400 hover:text-blue-300">Xem tất cả</button>
            </div>
            <div className="p-4 flex flex-col gap-4 flex-1">
              <div className="flex items-start gap-3">
                <WarningCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" weight="fill" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-200">Chi tiêu vượt ngưỡng</p>
                    <span className="text-xs text-gray-500">2 phút trước</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Chiến dịch CBO - Interest 02 đã vượt 90% ngân sách ngày</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
