// ============================================================================
// Dữ liệu MẪU cho trang Tổng quan — khớp với thiết kế Figma.
// Backend hiện chưa cung cấp insight chi tiết theo campaign / SKU / creative,
// nên các bảng & biểu đồ bên dưới dùng dữ liệu mẫu. Khi API thật sẵn sàng,
// thay các mảng này bằng dữ liệu fetch về (giữ nguyên cấu trúc field).
// ============================================================================

export type Channel = "Facebook" | "TikTok" | "Google" | "Zalo";
export type CampaignStatus = "Đang chạy" | "Tạm dừng" | "Kết thúc";
export type Objective = "Chuyển đổi" | "Nhận thức" | "Traffic";

// ---- Formatters dùng chung cho dashboard ----
const nf = new Intl.NumberFormat("vi-VN");
export const fmtNum = (n: number) => nf.format(Math.round(n || 0));
export const fmtCompact = (n: number) => {
  const abs = Math.abs(n || 0);
  if (abs >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return fmtNum(n);
};
export const fmtK = (n: number) => `${(n / 1000).toFixed(1)}K`; // luôn hiển thị theo nghìn
export const fmtVndShort = (n: number) => `${nf.format(Math.round(n || 0))}đ`;
export const fmtPct = (n: number) => `${n.toFixed(2)}%`;
export const fmtRoas = (n: number) => `${n.toFixed(2)}x`;

// ---- KPI (khớp tổng của bảng chiến dịch) ----
export type Kpi = {
  label: string;
  value: string;
  sub: string;
  change: number;
  icon: "spend" | "revenue" | "reach" | "impressions" | "clicks" | "orders" | "ctr" | "roas";
  color: string;
  bg: string;
};

export const KPIS: Kpi[] = [
  { label: "Chi phí quảng cáo", value: "87.8M", sub: "đồng", change: -3.2, icon: "spend", color: "text-orange-400", bg: "bg-orange-500/15" },
  { label: "Tổng doanh thu", value: "205.3M", sub: "đồng", change: 8.4, icon: "revenue", color: "text-green-400", bg: "bg-green-500/15" },
  { label: "Tổng tiếp cận", value: "2.0B", sub: "người dùng", change: 5.1, icon: "reach", color: "text-blue-400", bg: "bg-blue-500/15" },
  { label: "Tổng hiển thị", value: "2.4B", sub: "lần", change: 2.7, icon: "impressions", color: "text-violet-400", bg: "bg-violet-500/15" },
  { label: "Lượt nhấp", value: "237.636", sub: "clicks", change: 6.3, icon: "clicks", color: "text-cyan-400", bg: "bg-cyan-500/15" },
  { label: "Lượt chuyển đổi", value: "4.207", sub: "đơn", change: 11.2, icon: "orders", color: "text-pink-400", bg: "bg-pink-500/15" },
  { label: "CTR Trung bình", value: "2.87%", sub: "tỷ lệ nhấp", change: 0.4, icon: "ctr", color: "text-amber-400", bg: "bg-amber-500/15" },
  { label: "ROAS Trung bình", value: "2.96x", sub: "lợi nhuận/chi phí", change: 1.8, icon: "roas", color: "text-indigo-400", bg: "bg-indigo-500/15" },
];

// ---- Biểu đồ: Xu hướng chi tiêu & doanh thu (theo ngày, tháng 6) ----
export type TrendPoint = { day: string; spend: number; revenue: number };
export const TREND: TrendPoint[] = Array.from({ length: 30 }, (_, i) => {
  const d = i + 1;
  const base = 200 + Math.sin(i / 3) * 35 + (i > 18 ? (i - 18) * 6 : 0);
  return {
    day: `${String(d).padStart(2, "0")}/06`,
    spend: Math.round(base + Math.cos(i / 2) * 18),
    revenue: Math.round(base + 25 + Math.sin(i / 2.4) * 30 + (i > 15 ? (i - 15) * 4 : 0)),
  };
});

// ---- Biểu đồ: Phân bổ kênh (theo chi tiêu) ----
export type ChannelSlice = { name: Channel; value: number; color: string };
export const CHANNEL_SPLIT: ChannelSlice[] = [
  { name: "Facebook", value: 73.5, color: "#3b82f6" },
  { name: "TikTok", value: 15.5, color: "#ec4899" },
  { name: "Google", value: 7.2, color: "#f59e0b" },
  { name: "Zalo", value: 3.8, color: "#06b6d4" },
];

// ---- Biểu đồ: Chuyển đổi theo ngày ----
export type ConvPoint = { day: string; orders: number };
export const CONVERSIONS: ConvPoint[] = Array.from({ length: 30 }, (_, i) => ({
  day: `${String(i + 1).padStart(2, "0")}/06`,
  orders: Math.round(12 + (i / 29) * 14 + Math.sin(i / 2) * 4),
}));

// ---- Bảng chi tiết chiến dịch ----
export type CampaignRow = {
  code: string;
  name: string;
  channel: Channel;
  objective: Objective;
  status: CampaignStatus;
  budget: number; // nghìn (K)
  spend: number; // nghìn (K)
  reach: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  engagement: number;
  conversions: number;
  cpa: number; // đồng
  revenue: number;
  roas: number;
  frequency: number;
};

export const CAMPAIGNS: CampaignRow[] = [
  { code: "LA0008", name: "Trần Thị Chú - FB Convert", channel: "Facebook", objective: "Chuyển đổi", status: "Đang chạy", budget: 15000, spend: 14960, reach: 148_100_000, impressions: 192_800_000, clicks: 23208, ctr: 1.2, cpc: 645, cpm: 77.6, engagement: 156_100, conversions: 1753, cpa: 8500, revenue: 52_600_000, roas: 3.52, frequency: 1.3 },
  { code: "BA0012", name: "Huỳnh Văn Huân - FB Brand", channel: "Facebook", objective: "Nhận thức", status: "Đang chạy", budget: 15000, spend: 14944, reach: 268_300_000, impressions: 193_400_000, clicks: 31764, ctr: 1.64, cpc: 470, cpm: 77.3, engagement: 139_100, conversions: 13, cpa: 1_150_000, revenue: 18_200_000, roas: 1.22, frequency: 0.72 },
  { code: "BA0015", name: "Huỳnh Văn Huân - FB Sale", channel: "Facebook", objective: "Chuyển đổi", status: "Đang chạy", budget: 15000, spend: 14012, reach: 291_000_000, impressions: 418_200_000, clicks: 70294, ctr: 1.68, cpc: 199, cpm: 33.5, engagement: 150_100, conversions: 14, cpa: 1_001_000, revenue: 27_500_000, roas: 1.96, frequency: 1.44 },
  { code: "DA0051", name: "Huỳnh Văn Huân - FB Traffic", channel: "Facebook", objective: "Traffic", status: "Tạm dừng", budget: 12000, spend: 11918, reach: 353_800_000, impressions: 353_800_000, clicks: 40282, ctr: 1.14, cpc: 296, cpm: 33.7, engagement: 188_100, conversions: 814, cpa: 14600, revenue: 24_400_000, roas: 2.05, frequency: 1.0 },
  { code: "TK0023", name: "Kuting Inline - TikTok Sale", channel: "TikTok", objective: "Chuyển đổi", status: "Đang chạy", budget: 9000, spend: 8309, reach: 357_700_000, impressions: 357_700_000, clicks: 17147, ctr: 0.48, cpc: 484, cpm: 23.2, engagement: 114_400, conversions: 9, cpa: 923_000, revenue: 12_800_000, roas: 1.54, frequency: 1.0 },
  { code: "BA0031", name: "Huỳnh Văn Huân - Retarget", channel: "Facebook", objective: "Chuyển đổi", status: "Kết thúc", budget: 8000, spend: 7840, reach: 45_200_000, impressions: 85_400_000, clicks: 18620, ctr: 2.18, cpc: 421, cpm: 91.8, engagement: 72_400, conversions: 438, cpa: 17900, revenue: 19_600_000, roas: 2.5, frequency: 1.89 },
  { code: "GG0018", name: "Kuting - Google Search Brand", channel: "Google", objective: "Traffic", status: "Đang chạy", budget: 6000, spend: 5760, reach: 38_400_000, impressions: 41_200_000, clicks: 12480, ctr: 3.02, cpc: 461, cpm: 139.8, engagement: 24_600, conversions: 192, cpa: 30000, revenue: 14_900_000, roas: 2.59, frequency: 1.07 },
  { code: "TK0019", name: "Kuting - TikTok TopView", channel: "TikTok", objective: "Nhận thức", status: "Đang chạy", budget: 5000, spend: 4820, reach: 184_000_000, impressions: 240_000_000, clicks: 48000, ctr: 2.0, cpc: 100, cpm: 20.1, engagement: 480_000, conversions: 96, cpa: 39583, revenue: 11_300_000, roas: 2.34, frequency: 1.33 },
  { code: "BA0009", name: "Vân - FB Mess Lookbook", channel: "Facebook", objective: "Chuyển đổi", status: "Đang chạy", budget: 4000, spend: 3920, reach: 31_000_000, impressions: 52_000_000, clicks: 9300, ctr: 3.0, cpc: 421, cpm: 75.4, engagement: 46_500, conversions: 372, cpa: 10538, revenue: 8_900_000, roas: 2.27, frequency: 1.25 },
  { code: "ZL0005", name: "Ngọc - Zalo Broadcast", channel: "Zalo", objective: "Nhận thức", status: "Đang chạy", budget: 3500, spend: 3340, reach: 12_000_000, impressions: 18_000_000, clicks: 3600, ctr: 3.0, cpc: 927, cpm: 185.6, engagement: 7_200, conversions: 72, cpa: 46389, revenue: 6_100_000, roas: 1.83, frequency: 1.22 },
];

// Tổng cộng (khớp KPI) — hiển thị ở hàng cuối bảng.
export const CAMPAIGN_TOTALS = {
  spendLabel: "87.8M",
  reachLabel: "2.0B",
  impressionsLabel: "2.4B",
  clicks: 237636,
  ctr: 2.87,
  cpc: 966,
  engagement: 26447, // hiển thị nguyên (26,447)
  engagementLabel: "1.3M",
  conversions: 4207,
  revenueLabel: "205.3M",
  roas: 2.96,
};

// ---- Bảng hiệu quả theo SKU ----
export type SkuRow = {
  sku: string;
  name: string;
  category: string;
  channel: Channel;
  spendK: number; // nghìn
  revenue: number;
  orders: number;
  sold: number;
  cpa: number;
  roas: number;
  ctr: number;
  cpc: number;
  addToCart: number;
  checkout: number; // %
  returnRate: number; // %
  aov: number;
  stock: number;
};

export const SKUS: SkuRow[] = [
  { sku: "SP-004", name: "Áo khoác denim unisex", category: "Áo khoác", channel: "Google", spendK: 980, revenue: 5_900_000, orders: 84, sold: 90, cpa: 11667, roas: 6.0, ctr: 8.9, cpc: 210, addToCart: 210, checkout: 40.0, returnRate: 1.9, aov: 70000, stock: 210 },
  { sku: "SP-002", name: "Quần jean nữ skinny", category: "Quần nữ", channel: "TikTok", spendK: 1920, revenue: 7_700_000, orders: 128, sold: 145, cpa: 15000, roas: 4.0, ctr: 1.87, cpc: 420, addToCart: 380, checkout: 33.7, returnRate: 5.1, aov: 60000, stock: 87 },
  { sku: "SP-007", name: "Áo sơ mi kẻ caro", category: "Áo nam", channel: "Facebook", spendK: 1650, revenue: 6_600_000, orders: 132, sold: 148, cpa: 12500, roas: 4.0, ctr: 2.68, cpc: 295, addToCart: 390, checkout: 33.8, returnRate: 2.3, aov: 50000, stock: 178 },
  { sku: "SP-008", name: "Túi tote canvas in hình", category: "Phụ kiện", channel: "Zalo", spendK: 430, revenue: 1_700_000, orders: 86, sold: 98, cpa: 5000, roas: 4.0, ctr: 1.2, cpc: 150, addToCart: 240, checkout: 35.8, returnRate: 1.0, aov: 20000, stock: 450 },
  { sku: "SP-001", name: "Áo thun Polo nam basic", category: "Áo nam", channel: "Facebook", spendK: 2840, revenue: 9_200_000, orders: 184, sold: 210, cpa: 15435, roas: 3.24, ctr: 2.41, cpc: 310, addToCart: 520, checkout: 35.4, returnRate: 3.2, aov: 50000, stock: 142 },
  { sku: "SP-003", name: "Váy maxi hoa nhí", category: "Váy nữ", channel: "Facebook", spendK: 3100, revenue: 8_700_000, orders: 217, sold: 230, cpa: 14286, roas: 2.8, ctr: 3.12, cpc: 280, addToCart: 640, checkout: 33.9, returnRate: 2.8, aov: 40000, stock: 55 },
  { sku: "SP-005", name: "Đầm công sở tay dài", category: "Váy nữ", channel: "Facebook", spendK: 2200, revenue: 5_500_000, orders: 110, sold: 120, cpa: 20000, roas: 2.5, ctr: 1.95, cpc: 380, addToCart: 310, checkout: 35.5, returnRate: 4.5, aov: 50000, stock: 34 },
  { sku: "SP-006", name: "Quần short thể thao nam", category: "Quần nam", channel: "TikTok", spendK: 760, revenue: 1_900_000, orders: 38, sold: 42, cpa: 20000, roas: 2.5, ctr: 0.72, cpc: 510, addToCart: 120, checkout: 31.7, returnRate: 6.2, aov: 50000, stock: 320 },
];

export const SKU_TOTALS = { spendK: 13880, revenueLabel: "47.2M", orders: 979 };

// ---- Bảng hiệu quả Creative / Mẫu quảng cáo ----
// Các trường khớp với bảng quản lý quảng cáo: thao tác, tên mẫu, ngày bắt đầu,
// trạng thái phân phối, SKU, các chỉ số hiệu suất + tương tác (like trang/bài, tổng tương tác).
export type CreativeRow = {
  id: string;
  name: string;          // Tên mẫu / Mẫu quảng cáo
  startDate: string;     // Ngày bắt đầu (dd/mm/yyyy)
  status: CampaignStatus; // Trạng thái phân phối
  sku: string;
  spendK: number;        // Tổng chi tiêu (nghìn đồng)
  impressions: number;   // Lượt hiển thị
  reach: number;         // Tiếp cận
  clicks: number;        // Click
  conversions: number;   // Kết quả
  cpa: number;           // Chi phí/kết quả (đồng)
  messages: number;      // Tin nhắn
  ctr: number;           // CTR (%)
  cpc: number;           // CPC (đồng)
  cpm: number;           // CPM (đồng)
  pageLikes: number;     // Lượt thích Trang
  postLikes: number;     // Lượt thích bài viết
  engagement: number;    // Tổng tương tác
};

export const CREATIVES: CreativeRow[] = [
  { id: "CRE-T002", name: "TikTok ASMR unbox 30s", startDate: "02/06/2026", status: "Đang chạy", sku: "SP-001", spendK: 3800, impressions: 24_000_000, reach: 18_000_000, clicks: 48000, conversions: 96, cpa: 39583, messages: 4300, ctr: 2.0, cpc: 79, cpm: 158, pageLikes: 7800, postLikes: 86000, engagement: 480_000 },
  { id: "CRE-T001", name: "TikTok challenge SP-003", startDate: "04/06/2026", status: "Đang chạy", sku: "SP-003", spendK: 2100, impressions: 12_400_000, reach: 8_200_000, clicks: 24800, conversions: 248, cpa: 8468, messages: 2480, ctr: 2.0, cpc: 85, cpm: 169, pageLikes: 3600, postLikes: 38000, engagement: 186_000 },
  { id: "CRE-F001", name: "Video unboxing SP-001 15s", startDate: "01/06/2026", status: "Đang chạy", sku: "SP-001", spendK: 3200, impressions: 8_200_000, reach: 4_100_000, clicks: 18400, conversions: 184, cpa: 17391, messages: 1840, ctr: 2.24, cpc: 174, cpm: 390, pageLikes: 2400, postLikes: 21000, engagement: 92_000 },
  { id: "CRE-G001", name: "Google Display Banner 300x250", startDate: "03/06/2026", status: "Tạm dừng", sku: "SP-004", spendK: 920, impressions: 4_800_000, reach: 3_600_000, clicks: 5760, conversions: 192, cpa: 4792, messages: 0, ctr: 12.0, cpc: 160, cpm: 192, pageLikes: 0, postLikes: 0, engagement: 11_500 },
  { id: "CRE-F002", name: "Ảnh tĩnh lookbook hè", startDate: "05/06/2026", status: "Đang chạy", sku: "SP-005", spendK: 1840, impressions: 3_100_000, reach: 2_500_000, clicks: 9300, conversions: 93, cpa: 19785, messages: 930, ctr: 3.0, cpc: 198, cpm: 594, pageLikes: 1860, postLikes: 18600, engagement: 46_500 },
  { id: "CRE-F003", name: "Carousel sản phẩm mới", startDate: "06/06/2026", status: "Đang chạy", sku: "SP-002", spendK: 1560, impressions: 2_800_000, reach: 2_000_000, clicks: 11200, conversions: 168, cpa: 9286, messages: 1120, ctr: 4.0, cpc: 139, cpm: 557, pageLikes: 2200, postLikes: 11200, engagement: 33_600 },
  { id: "CRE-Z001", name: "Zalo message + banner", startDate: "07/06/2026", status: "Đang chạy", sku: "SP-008", spendK: 430, impressions: 1_200_000, reach: 980_000, clicks: 3600, conversions: 72, cpa: 5972, messages: 1800, ctr: 3.0, cpc: 119, cpm: 358, pageLikes: 0, postLikes: 0, engagement: 7_200 },
];

// ---- Bảng màu cho chip kênh / loại creative ----
export const CHANNEL_STYLE: Record<Channel, string> = {
  Facebook: "text-blue-400",
  TikTok: "text-foreground",
  Google: "text-red-400",
  Zalo: "text-cyan-400",
};
