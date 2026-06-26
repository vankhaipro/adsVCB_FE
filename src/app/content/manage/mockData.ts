// Mock data matching the Content Performance Report screenshots

export interface DonutItem {
  name: string;
  value: number;
  color: string;
  percentage?: string;
}

// 1. Tổng lượt xem platform distribution
export const viewsPlatformData: DonutItem[] = [
  { name: "Facebook", value: 63.08, color: "#3b82f6" },
  { name: "TikTok", value: 24.14, color: "#db2777" },
  { name: "Instagram", value: 7.76, color: "#e1306c" },
  { name: "YouTube", value: 5.02, color: "#dc2626" },
];

// 2. Main KPI cards
export const kpiStats = {
  views: "255,713,412",
  interactions: "2,405,852",
  likes: "2,006,209",
  comments: "149,418",
  followers: "7,357,986",
};

// 3. Donuts for post and production content
export const postContentData: DonutItem[] = [
  { name: "Win", value: 8.9, color: "#10b981" },
  { name: "Not Win", value: 91.1, color: "#ef4444" },
];

export const productionContentData: DonutItem[] = [
  { name: "Win", value: 15.0, color: "#10b981" },
  { name: "Not Win", value: 85.0, color: "#ef4444" },
];

// 4. Xu hướng lượt xem (Line Chart)
export const viewsTrendData = [
  { name: "5/1", Facebook: 4500000, Instagram: 800000, TikTok: 1200000, YouTube: 600000 },
  { name: "5/5", Facebook: 4900000, Instagram: 900000, TikTok: 1500000, YouTube: 700000 },
  { name: "5/10", Facebook: 3800000, Instagram: 750000, TikTok: 1300000, YouTube: 550000 },
  { name: "5/15", Facebook: 5400000, Instagram: 1100000, TikTok: 1700000, YouTube: 800000 },
  { name: "5/20", Facebook: 4200000, Instagram: 850000, TikTok: 1400000, YouTube: 650000 },
  { name: "5/25", Facebook: 5900000, Instagram: 1250000, TikTok: 2100000, YouTube: 900000 },
  { name: "5/29", Facebook: 3900000, Instagram: 800000, TikTok: 1350000, YouTube: 600000 },
  { name: "6/2", Facebook: 5200000, Instagram: 1050000, TikTok: 1800000, YouTube: 750000 },
  { name: "6/6", Facebook: 4100000, Instagram: 850000, TikTok: 1500000, YouTube: 620000 },
  { name: "6/10", Facebook: 5500000, Instagram: 1150000, TikTok: 1950000, YouTube: 820000 },
  { name: "6/12", Facebook: 3600000, Instagram: 720000, TikTok: 1250000, YouTube: 500000 },
  { name: "6/15", Facebook: 6100000, Instagram: 1300000, TikTok: 2400000, YouTube: 950000 },
  { name: "6/19", Facebook: 4800000, Instagram: 980000, TikTok: 1650000, YouTube: 700000 },
  { name: "6/23", Facebook: 5800000, Instagram: 1200000, TikTok: 2200000, YouTube: 880000 },
  { name: "6/25", Facebook: 2100000, Instagram: 450000, TikTok: 900000, YouTube: 350000 },
];

// 5. Tổng số kênh distribution
export const channelsDistributionData: DonutItem[] = [
  { name: "Facebook", value: 32.9, color: "#3b82f6" },
  { name: "TikTok", value: 27.0, color: "#db2777" },
  { name: "YouTube", value: 23.7, color: "#dc2626" },
  { name: "Instagram", value: 16.4, color: "#e1306c" },
];

// 6. Tổng lượt view theo team (Vertical Bar)
export const viewsByTeamData = [
  { name: "KT", views: 98.4 },
  { name: "K2", views: 41.5 },
  { name: "K3", views: 14.3 },
  { name: "Đà Đa", views: 10.2 },
  { name: "K0", views: 5.5 },
  { name: "Ads", views: 3.2 },
  { name: "Đá quý", views: 2.1 },
  { name: "AFF 2", views: 1.4 },
  { name: "Global-JP3", views: 0.8 },
  { name: "AFF 1", views: 0.5 },
];

// 7. Tổng nội dung được tạo theo team (Horizontal Bar)
export const contentByTeamData = [
  { name: "K1", count: 5202 },
  { name: "K2", count: 4081 },
  { name: "Đà Đa", count: 2873 },
  { name: "K3", count: 2611 },
  { name: "K0", count: 1100 },
  { name: "AFF 2", count: 605 },
  { name: "Ads", count: 313 },
  { name: "Đá quý", count: 182 },
  { name: "Đá quý 2", count: 46 },
];

// 8. Phân bổ theo tuyến nội dung (Donut)
export const contentLineDistributionData: DonutItem[] = [
  { name: "A4", value: 53.51, color: "#ef4444" },
  { name: "A1", value: 19.37, color: "#10b981" },
  { name: "A2", value: 13.93, color: "#3b82f6" },
  { name: "A3", value: 4.77, color: "#8b5cf6" },
  { name: "A5", value: 2.18, color: "#f59e0b" },
  { name: "Khác", value: 6.24, color: "#6b7280" },
];

// 9. Phân bổ theo concept (Donut)
export const conceptDistributionData: DonutItem[] = [
  { name: "CĐ", value: 46.1, color: "#3b82f6" },
  { name: "Mới", value: 27.4, color: "#10b981" },
  { name: "Khác", value: 26.5, color: "#f59e0b" },
];

// 10. Top nội dung sản xuất nhiều video nhất
export const topProductionContent = [
  { name: "nhẫn nữ 1 hàng đá", count: 112 },
  { name: "nhẫn vàng chế tác", count: 104 },
  { name: "Thay bằng nhẫn Rolex", count: 88 },
  { name: "nhẫn pinky ring", count: 84 },
  { name: "Đồng nghiệp tưởng chiếc nhẫn này phải mấy chục triệu", count: 84 },
  { name: "Link tham khảo: https://douyin.com/...", count: 80 },
  { name: "huyK giao hàng Source tìm HuyK DL", count: 80 },
  { name: "nhẫn khắc gia huy", count: 72 },
];

// 11. Top SKU ghi dữ liệu
export const topSkuDataRecord = [
  { sku: "ML000963", count: 666, views: "3,319,348", avgViews: "4,984", interactions: "45,485" },
  { sku: "MNM101", count: 954, views: "3,206,365", avgViews: "3,361", interactions: "59,063" },
  { sku: "NM101", count: 146, views: "1,774,865", avgViews: "12,157", interactions: "13,300" },
  { sku: "MN610188", count: 286, views: "1,733,436", avgViews: "6,061", interactions: "33,176" },
  { sku: "MN100886", count: 347, views: "1,691,759", avgViews: "4,875", interactions: "54,894" },
  { sku: "MLS00412", count: 222, views: "1,541,099", avgViews: "6,942", interactions: "21,754" },
  { sku: "MK400013", count: 200, views: "1,514,469", avgViews: "7,572", interactions: "19,649" },
];

// 12. Top SKU thời gian tạo
export const topSkuCreateRecord = [
  { sku: "ML000963", count: 204, views: "1,674,378", avgViews: "8,208", interactions: "27,483" },
  { sku: "MLS00412", count: 114, views: "1,493,571", avgViews: "13,102", interactions: "21,058" },
  { sku: "MN0006", count: 112, views: "1,188,274", avgViews: "10,610", interactions: "15,756" },
  { sku: "MNM101", count: 214, views: "1,143,125", avgViews: "5,342", interactions: "23,424" },
  { sku: "MD64", count: 99, views: "982,869", avgViews: "9,928", interactions: "9,756" },
  { sku: "MN610188", count: 125, views: "892,655", avgViews: "7,141", interactions: "14,879" },
  { sku: "MN101276", count: 66, views: "891,458", avgViews: "13,507", interactions: "22,311" },
];

// 13. Hiệu suất tuyến ghi dữ liệu
export const linePerformanceDataRecord = [
  { line: "A1", count: "18,510", views: "103,433,577", interactions: "1,332,386", lifetimeViews: "803,185,087" },
  { line: "A4", count: "48,940", views: "84,674,278", interactions: "1,400,296", lifetimeViews: "761,089,883" },
  { line: "A2", count: "8,447", views: "46,761,210", interactions: "889,612", lifetimeViews: "256,243,012" },
  { line: "A5", count: "2,947", views: "5,397,991", interactions: "84,123", lifetimeViews: "57,839,220" },
  { line: "A3", count: "3,229", views: "3,224,273", interactions: "47,132", lifetimeViews: "36,641,504" },
];

// 14. Hiệu suất tuyến thời gian tạo
export const linePerformanceCreateRecord = [
  { line: "A1", count: "3,337", views: "64,189,183", interactions: "808,240", lifetimeViews: "65,224,879" },
  { line: "A4", count: "9,216", views: "49,031,918", interactions: "757,236", lifetimeViews: "51,161,653" },
  { line: "A2", count: "2,400", views: "38,470,947", interactions: "685,461", lifetimeViews: "39,721,070" },
  { line: "A5", count: "376", views: "3,315,205", interactions: "57,130", lifetimeViews: "3,359,372" },
  { line: "A3", count: "822", views: "2,013,466", interactions: "30,525", lifetimeViews: "2,095,296" },
];

// 15. Hiệu suất loại nội dung
export const contentStylePerformance = [
  { type: "REEL", count: "6,044", views: "105,102,482", interactions: "1,230,278" },
  { type: "VIDEO", count: "10,673", views: "49,927,517", interactions: "1,100,170" },
  { type: "POST", count: "336", views: "4,164,789", interactions: "22,448" },
  { type: "CAROUSEL_ALBUM", count: "67", views: "35,644", interactions: "119" },
  { type: "IMAGE", count: "1", views: "8", interactions: "0" },
];

// 16. Top Kênh theo View
export const topChannelsByView = [
  { platform: "TikTok", name: "huytrangssucbacthai", views: "10,450,570", follows: "78,131" },
  { platform: "Facebook", name: "HuyK.vn", views: "10,278,743", follows: "96,741" },
  { platform: "TikTok", name: "HuyK - Trang Sức Chế Tác", views: "9,296,877", follows: "460,128" },
  { platform: "Facebook", name: "HuyK - Mộc kim hoàn", views: "9,019,735", follows: "606,378" },
  { platform: "Facebook", name: "HuyK Trang Sức Đá Quý", views: "8,826,116", follows: "52,108" },
];

// 17. Top Video theo View
export const topVideosByView = [
  { id: 1, caption: "Đừng mang ra tiệm nếu không biết mẹo này...", link: "https://www.facebook.com/watch/?v=123", views: "3,233,428" },
  { id: 2, caption: "Tại sao nó lại không tròn nhỉ #K101 #a1 #c #huy...", link: "https://www.facebook.com/watch/?v=456", views: "2,744,285" },
  { id: 3, caption: "Lưu lại ngay nha mấy chị #K103 #a1 #c #huy...", link: "https://www.facebook.com/watch/?v=789", views: "2,235,684" },
  { id: 4, caption: "Nhẫn Dii - biểu tượng cho tình yêu thủy chung...", link: "https://www.facebook.com/watch/?v=012", views: "2,211,438" },
  { id: 5, caption: "Đừng lo đã có HuyK rồi đây! #K207 #a1 #c #v...", link: "https://www.instagram.com/reel/345", views: "2,207,478" },
];

// 18. Top Nhân sự theo View
export const topStaffByView = [
  { id: 1, name: "Nguyễn Thị Ánh", team: "K3", views: "41,421,150" },
  { id: 2, name: "Trần Mai Linh", team: "K1", views: "29,352,164" },
  { id: 3, name: "Đỗ Thị Nga", team: "K1", views: "26,420,061" },
  { id: 4, name: "Bùi Văn Đoàn", team: "K2", views: "24,409,790" },
  { id: 5, name: "Nguyễn Thị Vân", team: "K2", views: "16,109,978" },
];

// 19. Hiệu suất chi tiết Kênh
export const detailChannelPerformance = [
  { platform: "Facebook", channel: "HuyK - Kim Hoàn", views: "31,475,477", follows: "285,763", likes: "321,511", comments: "30,153", shares: "16,857", saves: "0", avgWatch: "8.79s" },
  { platform: "Facebook", channel: "HuyK Viễn Chí Bảo", views: "18,129,795", follows: "396,480", likes: "183,871", comments: "8,876", shares: "10,748", saves: "0", avgWatch: "9.14s" },
  { platform: "TikTok", channel: "HuyK - Xưởng Chế Tác 2", views: "14,327,179", follows: "568,747", likes: "365,710", comments: "17,366", shares: "103,165", saves: "49,455", avgWatch: "9.78s" },
  { platform: "Facebook", channel: "HuyK - Chế Tác Kim Hoàn", views: "11,204,339", follows: "98,614", likes: "106,408", comments: "4,688", shares: "8,151", saves: "0", avgWatch: "7.65s" },
  { platform: "Facebook", channel: "HuyK - Trang sức thiết kế", views: "10,684,383", follows: "294,032", likes: "78,463", comments: "6,093", shares: "6,277", saves: "0", avgWatch: "7.08s" },
  { platform: "TikTok", channel: "huytrangssucbacthai", views: "10,450,570", follows: "78,131", likes: "186,781", comments: "13,751", shares: "46,110", saves: "45,236", avgWatch: "9.98s" },
];

// 20. Hiệu suất chi tiết Team
export const detailStaffPerformance = [
  { name: "Nguyễn Thị Ánh", views: "41,421,150", reach: "23,724,148", likes: "486,451", comments: "40,030", shares: "30,580", saves: "25,722" },
  { name: "Trần Mai Linh", views: "35,650,607", reach: "10,748,499", likes: "624,444", comments: "40,421", shares: "113,376", saves: "60,424" },
  { name: "Đỗ Thị Nga", views: "26,420,061", reach: "15,968,812", likes: "306,474", comments: "14,220", shares: "15,916", saves: "11,206" },
  { name: "Bùi Văn Đoàn", views: "24,409,790", reach: "8,281,734", likes: "302,044", comments: "18,763", shares: "57,317", saves: "47,816" },
  { name: "Nguyễn Thị Vân", views: "16,174,972", reach: "3,628,437", likes: "258,665", comments: "16,524", shares: "85,718", saves: "39,222" },
];

// 21. Hiệu quả KPI của nhân sự
export const staffKpiBarData = [
  { name: "Trần Mai Linh", percentage: 110 },
  { name: "Nguyễn An", percentage: 102 },
  { name: "Lương Lệ Đức", percentage: 88 },
  { name: "Nguyễn Tuấn", percentage: 84 },
  { name: "Thuỳ Trang", percentage: 74 },
  { name: "Việt Nguyễn", percentage: 54 },
  { name: "Hồ Thành Đạt", percentage: 50 },
  { name: "Bùi Minh Quyết", percentage: 48 },
  { name: "Nguyễn Hữu Thành", percentage: 45 },
  { name: "Huyền Cam", percentage: 40 },
];

export const staffTaskCompletionData = [
  { name: "Bùi Đoan", auto: 3, creative: 33, done: 36, dailyKpi: 4, dailyPct: "900%", monthlyKpi: 120, monthlyPct: "30%" },
  { name: "Bùi Minh Quyết", auto: 47, creative: 37, done: 84, dailyKpi: 6, dailyPct: "1,400%", monthlyKpi: 180, monthlyPct: "46.67%" },
  { name: "Chung Đỗ", auto: 0, creative: 0, done: 0, dailyKpi: 4, dailyPct: "0%", monthlyKpi: 120, monthlyPct: "0%" },
  { name: "Huyền Cam", auto: 0, creative: 69, done: 69, dailyKpi: 6, dailyPct: "1,150%", monthlyKpi: 180, monthlyPct: "38.33%" },
  { name: "Huyền Trang", auto: 15, creative: 38, done: 53, dailyKpi: 6, dailyPct: "883.33%", monthlyKpi: 180, monthlyPct: "29.44%" },
  { name: "Hồ Thành Đạt", auto: 88, creative: 0, done: 88, dailyKpi: 6, dailyPct: "1,466.67%", monthlyKpi: 180, monthlyPct: "48.89%" },
  { name: "Khúc Quan", auto: 0, creative: 0, done: 0, dailyKpi: 4, dailyPct: "0%", monthlyKpi: 120, monthlyPct: "0%" },
  { name: "Linh Nguyễn Thùy", auto: 0, creative: 0, done: 0, dailyKpi: 4, dailyPct: "0%", monthlyKpi: 120, monthlyPct: "0%" },
  { name: "Lương Lệ Đức", auto: 0, creative: 106, done: 106, dailyKpi: 4, dailyPct: "2,650%", monthlyKpi: 120, monthlyPct: "88.33%" },
  { name: "Nguyễn An", auto: 172, creative: 12, done: 184, dailyKpi: 6, dailyPct: "3,066.67%", monthlyKpi: 180, monthlyPct: "102.22%" },
];

// 22. Meta Content raw list
export const metaRawContentList = [
  { caption: "Mỗi đường chỉ là một câu chuyện. Dây đồng hồ da...", link: "https://www.facebook.com/watch/?v=122104", channel: "Nhạn Nhạn - Thợ Da Văn Phong Các", platform: "facebook", date: "25/6/2026", sku: "-", product: "-", concept: "-", line: "A4", views: 182, reach: 124, likes: 1, comments: 0 },
  { caption: "Cách khóa chỉ sáp #dd04 #a2 #thucong #doda #h...", link: "https://www.facebook.com/watch/?v=130636", channel: "Nhạn Nhạn - Thợ Da Văn Phong Các", platform: "facebook", date: "25/6/2026", sku: "-", product: "-", concept: "-", line: "A2", views: 396, reach: 363, likes: 1, comments: 0 },
  { caption: "Hãy yêu thương bản thân mình #dd04 #a4 #T0310...", link: "https://www.facebook.com/watch/?v=948346", channel: "Nhạn Nhạn - Thợ Da Văn Phong Các", platform: "facebook", date: "25/6/2026", sku: "-", product: "-", concept: "-", line: "A4", views: 512, reach: 451, likes: 7, comments: 0 },
  { caption: "Yêu là sự thấu hiểu #dd04 #a4 #TX031 #thucong ...", link: "https://www.facebook.com/watch/?v=135114", channel: "Nhạn Nhạn - Thợ Da Văn Phong Các", platform: "facebook", date: "25/6/2026", sku: "-", product: "-", concept: "-", line: "A4", views: 281, reach: 258, likes: 2, comments: 0 },
  { caption: "Âm thanh chân thực của đồ da #dd04 #a1 #asmr ...", link: "https://www.facebook.com/watch/?v=985784", channel: "Nhạn Nhạn - Thợ Da Văn Phong Các", platform: "facebook", date: "25/6/2026", sku: "-", product: "-", concept: "-", line: "A1", views: 253, reach: 240, likes: 3, comments: 0 },
  { caption: "Phân biệt da thật và da nhân tạo #GD03 #a1 #feat...", link: "https://www.facebook.com/watch/?v=159801", channel: "Nhạn Nhạn - Thợ Da Thủ Công Văn Phong Các", platform: "facebook", date: "25/6/2026", sku: "-", product: "-", concept: "-", line: "A1", views: 554, reach: 454, likes: 5, comments: 0 },
];

// 23. Tiktok Content raw list
export const tiktokRawContentList = [
  { caption: "Người tặng bạn chiếc lắc này chắc chắn là...", link: "https://www.tiktok.com/@huyk/video/1", channel: "HuyK.Silver", format: "VIDEO", date: "25/6/2026", concept: "Mới", line: "A4", sku: "-", product: "-", views: 1820, reach: 0, likes: 27, comments: 0 },
  { caption: "Tại sao thẻ hệ trước lại yêu thích vàng như...", link: "https://www.tiktok.com/@huyk/video/2", channel: "HuyK Mộc Kim Hoàn", format: "VIDEO", date: "25/6/2026", concept: "Mới", line: "A2", sku: "-", product: "-", views: 171, reach: 0, likes: 13, comments: 0 },
  { caption: "Đeo trang sức lưu ý nha #k105 #a2 #c #hu...", link: "https://www.tiktok.com/@huyk/video/3", channel: "HuyK.Silver", format: "VIDEO", date: "25/6/2026", concept: "Cũ", line: "A2", sku: "-", product: "-", views: 2136, reach: 0, likes: 51, comments: 0 },
  { caption: "Chiếc vòng đầu tiên luôn mang những ý n...", link: "https://www.tiktok.com/@huyk/video/4", channel: "huytrangssucbacthai", format: "VIDEO", date: "25/6/2026", concept: "Cũ", line: "A4", sku: "-", product: "-", views: 494, reach: 0, likes: 6, comments: 0 },
  { caption: "Nhẫn kim tiền đeo ngón nào cách #K102 #a1 ...", link: "https://www.tiktok.com/@huyk/video/5", channel: "HuyK - Kim Hoàn Viễn Chí Bảo", format: "VIDEO", date: "25/6/2026", concept: "Cũ", line: "A1", views: 7956, reach: 0, likes: 184, comments: 0 },
];

// 24. Youtube Content raw list
export const youtubeRawContentList = [
  { caption: "Nhẫn sánh duyên #K202 #MN610004 #a4 #moissanit...", link: "https://www.youtube.com/watch?v=1", channel: "Chế Tác Cùng HuyK", platform: "youtube", date: "25/6/2026", sku: "-", product: "-", concept: "Mới", line: "A4", views: 152, reach: 0, likes: 1, comments: 0 },
  { caption: "Tặng ốp lưng không vừa #K101 #ML0013-00-B-WH #...", link: "https://www.youtube.com/watch?v=2", channel: "HuyK Mở Chế Tác", platform: "youtube", date: "25/6/2026", sku: "-", product: "-", concept: "Cũ", line: "A4", views: 586, reach: 0, likes: 6, comments: 0 },
  { caption: "Đừng vội tặng chiếc lắc tay này nếu không biết điều n...", link: "https://www.youtube.com/watch?v=3", channel: "HuyK. Thợ trang sức gia công", platform: "youtube", date: "25/6/2026", sku: "-", product: "-", concept: "Mới", line: "A4", views: 756, reach: 0, likes: 7, comments: 1 },
  { caption: "Làm sáng trang sức bạc tại nhà #K301 #a1 #c #huykv...", link: "https://www.youtube.com/watch?v=4", channel: "HuyK Kim Hoàn Viễn Chí Bảo", platform: "youtube", date: "25/6/2026", sku: "-", product: "-", concept: "Cũ", line: "A1", views: 886, reach: 0, likes: 6, comments: 0 },
  { caption: "Ngày đầu đi làm chị đồng nghiệp tưởng rằng #MN000...", link: "https://www.youtube.com/watch?v=5", channel: "HuyK Kim Hoàn Viễn Chí Bảo", platform: "youtube", date: "25/6/2026", sku: "-", product: "-", concept: "Cũ", line: "A4", views: 1123, reach: 0, likes: 11, comments: 0 },
];
