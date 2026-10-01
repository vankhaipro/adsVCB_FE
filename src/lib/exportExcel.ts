import * as XLSX from "xlsx";

export type ExportSheet = { name: string; rows: Record<string, unknown>[] };

// Gộp nhiều bảng thành nhiều sheet trong 1 file .xlsx. Bỏ qua sheet rỗng — json_to_sheet([])
// tạo ra 1 sheet không có header, nhìn như file lỗi khi mở lên.
export function exportWorkbook(filename: string, sheets: ExportSheet[]): boolean {
  const wb = XLSX.utils.book_new();
  for (const s of sheets) {
    if (!s.rows.length) continue;
    // Tên sheet trong Excel giới hạn 31 ký tự và không được chứa : \ / ? * [ ]
    const safeName = s.name.replace(/[:\\/?*[\]]/g, " ").slice(0, 31);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(s.rows), safeName);
  }
  if (!wb.SheetNames.length) return false;
  XLSX.writeFile(wb, filename);
  return true;
}
