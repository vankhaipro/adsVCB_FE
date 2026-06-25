import { Broadcast } from "@phosphor-icons/react/dist/ssr";

export default function ContentManagePage() {
  return (
    <div className="flex flex-col gap-5 w-full max-w-full overflow-x-hidden pb-10">
      <div className="border-b border-[#1e293b] pb-4">
        <h1 className="text-2xl font-bold text-white">Quản lý content</h1>
        <p className="text-sm text-gray-400 mt-1">
          Quản lý nội dung organic: kênh, video, lịch đăng và phân công nhân sự.
        </p>
      </div>

      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-12 flex flex-col items-center justify-center text-center gap-3">
        <Broadcast size={40} className="text-gray-600" />
        <p className="text-gray-300 font-medium">Trang đang được phát triển</p>
        <p className="text-xs text-gray-500 max-w-sm">
          Khu vực này sẽ dùng để quản lý content organic. Hiện tại bạn có thể quản lý kênh tại
          mục <span className="text-gray-300">Kênh organic</span>.
        </p>
      </div>
    </div>
  );
}
