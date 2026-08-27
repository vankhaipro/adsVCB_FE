// Một dòng trả về từ GET /content/list — khớp đúng object mà
// adsVCB_BE/src/content/content.service.ts#list dựng.
// Nhiều field nullable vì organic không có đủ chỉ số (vd reach) hoặc chưa map được
// (productName cần đối chiếu Sapo).
export type ContentListRow = {
  videoId: string;
  caption: string | null;
  link: string | null;
  channel: string | null;
  platform: string;
  date: string | null;
  productCode: string | null;
  productName: string | null;
  concept: string | null;
  line: string | null;
  team: string | null;
  staff: string | null;
  market: string | null;
  industry: string | null;
  views: number | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  interactions: number | null;
};
