// Khoá so khớp tên Fanpage/kênh: bỏ dấu tiếng Việt, hạ chữ thường, bỏ mọi ký tự không
// phải chữ/số. Dùng để nối tên kênh organic (nhập tay) với tên page do Meta trả về —
// hai bên thường chỉ lệch dấu cách hoặc hoa/thường.
//
// Bản sao cùng logic nằm ở backend: adsVCB_BE/src/ads/ads.service.ts → PageNameKey().
// Sửa một bên nhớ sửa bên kia, nếu không danh sách dropdown sẽ lệch với kết quả lọc.
export function pageNameKey(v: string): string {
  return String(v || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // bỏ dấu tiếng Việt
    .toLowerCase()
    .replace(/đ/g, "d")
    // Giữ MỌI chữ cái Unicode, không chỉ a-z: tên tiếng Thái/Nhật/Hàn nếu bị xoá sạch sẽ
    // co về cùng một khoá ("HuyK ช่างทอง" và "HuyK 宝飾職人" đều thành "huyk") → khớp nhầm.
    .replace(/[^\p{L}\p{N}]+/gu, "");
}
