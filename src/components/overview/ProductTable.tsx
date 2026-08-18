"use client";

import { useState, useMemo, useEffect } from "react";
import { MagnifyingGlass, Download, CaretLeft, CaretRight } from "@phosphor-icons/react";
import DateRangePicker from "@/components/DateRangePicker";
import { Panel, Th } from "./parts";
import { fmtNum, fmtVndShort } from "./dashboardData";
import { useProductInsights } from "./useProductInsights";

const PER_PAGE = 10;
const COL_COUNT = 11;

export default function ProductTable() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  const { rows: allRows, unmatched, videoRange, loading, dateState } = useProductInsights();

  useEffect(() => {
    setPage(0);
  }, [q, allRows]);

  const filteredRows = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return allRows;
    return allRows.filter(
      (r) => r.code.toLowerCase().includes(kw) || r.name.toLowerCase().includes(kw),
    );
  }, [allRows, q]);

  const pages = Math.max(1, Math.ceil(filteredRows.length / PER_PAGE));
  const start = page * PER_PAGE;
  const rows = filteredRows.slice(start, start + PER_PAGE);

  // Tổng tính trên TOÀN BỘ kết quả lọc, không phải riêng trang đang xem.
  const totals = useMemo(() => {
    const t = { videos: 0, campaigns: 0, spend: 0, likes: 0, messages: 0, comments: 0, organicComments: 0 };
    for (const r of filteredRows) {
      t.videos += r.videos;
      t.campaigns += r.campaigns;
      t.spend += r.spend;
      t.likes += r.likes;
      t.messages += r.messages;
      t.comments += r.comments;
      t.organicComments += r.organicComments;
    }
    return t;
  }, [filteredRows]);

  const pageRange = useMemo(() => {
    const range = [];
    const maxVisible = 5;
    let startPage = Math.max(0, page - 2);
    const endPage = Math.min(pages - 1, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(0, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) range.push(i);
    return range;
  }, [page, pages]);

  return (
    <Panel
      title="Hiệu quả theo sản phẩm"
      subtitle="Số video organic đã làm, chi phí quảng cáo, tin nhắn và bình luận trên cùng một mã sản phẩm"
      right={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-2.5 py-1.5">
            <MagnifyingGlass size={14} className="text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm mã / tên SP..."
              className="bg-transparent text-xs text-foreground outline-none w-32 placeholder:text-muted-foreground"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border hover:bg-muted text-foreground text-xs font-medium rounded-lg transition-colors">
            <Download size={14} /> Xuất
          </button>
        </div>
      }
      bodyClassName="px-0 pb-0"
    >
      <div className="px-5 -mt-1 mb-3 flex flex-wrap items-center justify-between gap-3">
        <DateRangePicker {...dateState} />
        <span className="text-[14px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded shrink-0">
          {filteredRows.length} sản phẩm
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left whitespace-nowrap">
          <thead className="border-y border-border bg-card">
            <tr>
              <Th>Mã SP</Th>
              <Th>Tên sản phẩm</Th>
              <Th align="right">Video organic</Th>
              <Th align="right">Số chiến dịch</Th>
              <Th align="right">Chi phí ads</Th>
              <Th align="right">Lượt thích Trang</Th>
              <Th align="right">Chi phí/Like</Th>
              <Th align="right">Tin nhắn</Th>
              <Th align="right">Chi phí/mess</Th>
              <Th align="right">Comment (ads)</Th>
              <Th align="right">Comment (video)</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-foreground">
            {rows.map((r) => (
              <tr key={r.code} className="hover:bg-card/40">
                <td className="px-3 py-2.5 font-semibold text-blue-400">{r.code}</td>
                <td className="px-3 py-2.5 max-w-[280px] truncate" title={r.name}>{r.name}</td>
                <td className="px-3 py-2.5 text-right font-medium">{fmtNum(r.videos)}</td>
                <td className="px-3 py-2.5 text-right">{fmtNum(r.campaigns)}</td>
                <td className="px-3 py-2.5 text-right font-medium">{fmtVndShort(r.spend)}</td>
                <td className="px-3 py-2.5 text-right">{fmtNum(r.likes)}</td>
                <td className="px-3 py-2.5 text-right font-medium">{r.costPerLike > 0 ? fmtVndShort(r.costPerLike) : "—"}</td>
                <td className="px-3 py-2.5 text-right">{fmtNum(r.messages)}</td>
                <td className="px-3 py-2.5 text-right font-medium">{r.costPerMessage > 0 ? fmtVndShort(r.costPerMessage) : "—"}</td>
                <td className="px-3 py-2.5 text-right">{fmtNum(r.comments)}</td>
                <td className="px-3 py-2.5 text-right text-muted-foreground">{fmtNum(r.organicComments)}</td>
              </tr>
            ))}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={COL_COUNT} className="px-4 py-8 text-center text-muted-foreground">
                  {loading ? "Đang tải..." : "Không tìm thấy sản phẩm nào."}
                </td>
              </tr>
            )}
          </tbody>

          {filteredRows.length > 0 && (
            <tfoot className="border-t border-border bg-card font-semibold text-foreground">
              {/* Phần không gắn được mã SP — bắt buộc hiện, nếu giấu thì tổng bảng
                  không khớp KPI ở đầu trang. Không tham gia tìm kiếm/phân trang. */}
              {unmatched && (unmatched.spend > 0 || unmatched.videos > 0) && (
                <tr className="bg-muted/30 font-normal text-muted-foreground">
                  <td className="px-3 py-2.5 italic" colSpan={2}>
                    (Không gắn được mã SP)
                  </td>
                  <td className="px-3 py-2.5 text-right">{fmtNum(unmatched.videos)}</td>
                  <td className="px-3 py-2.5 text-right">{fmtNum(unmatched.campaigns)}</td>
                  <td className="px-3 py-2.5 text-right">{fmtVndShort(unmatched.spend)}</td>
                  <td className="px-3 py-2.5 text-right">{fmtNum(unmatched.likes)}</td>
                  <td className="px-3 py-2.5" />
                  <td className="px-3 py-2.5 text-right">{fmtNum(unmatched.messages)}</td>
                  <td className="px-3 py-2.5" />
                  <td className="px-3 py-2.5 text-right">{fmtNum(unmatched.comments)}</td>
                  <td className="px-3 py-2.5 text-right">{fmtNum(unmatched.organicComments)}</td>
                </tr>
              )}
              <tr>
                <td className="px-3 py-3" colSpan={2}>TỔNG ({filteredRows.length} sản phẩm)</td>
                <td className="px-3 py-3 text-right">{fmtNum(totals.videos)}</td>
                <td className="px-3 py-3 text-right">{fmtNum(totals.campaigns)}</td>
                <td className="px-3 py-3 text-right">{fmtVndShort(totals.spend)}</td>
                <td className="px-3 py-3 text-right">{fmtNum(totals.likes)}</td>
                <td className="px-3 py-3" />
                <td className="px-3 py-3 text-right">{fmtNum(totals.messages)}</td>
                <td className="px-3 py-3" />
                <td className="px-3 py-3 text-right">{fmtNum(totals.comments)}</td>
                <td className="px-3 py-3 text-right">{fmtNum(totals.organicComments)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Video chỉ được đồng bộ trong "cửa sổ tháng" (channels.service computeSince), nên
          chọn khoảng cũ hơn sẽ ra 0 video — nói rõ thay vì để người dùng tưởng mất dữ liệu. */}
      {videoRange && (
        <p className="px-5 pt-3 text-[13px] text-muted-foreground">
          Số liệu video organic lấy theo ngày đăng trong khoảng {videoRange.from} → {videoRange.to}.
          Video chỉ được đồng bộ trong vài tháng gần nhất nên khoảng cũ hơn có thể không có dữ liệu.
        </p>
      )}

      {filteredRows.length > PER_PAGE && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-border">
          <span className="text-[14px] text-muted-foreground">
            Hiển thị {start + 1}–{Math.min(start + PER_PAGE, filteredRows.length)} trong {filteredRows.length} sản phẩm
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-card disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <CaretLeft size={14} />
            </button>
            {pageRange.map((i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium ${
                  i === page ? "bg-blue-600 text-foreground" : "text-muted-foreground hover:bg-card"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              disabled={page === pages - 1}
              className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-card disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <CaretRight size={14} />
            </button>
          </div>
        </div>
      )}
    </Panel>
  );
}
