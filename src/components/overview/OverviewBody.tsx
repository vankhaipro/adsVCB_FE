"use client";

import type { Ref } from "react";
import OverviewCharts from "./OverviewCharts";
import CampaignTable, { type CampaignTableHandle } from "./CampaignTable";
import ProductTable, { type ProductTableHandle } from "./ProductTable";
import type { BreakdownData, TrendPoint } from "./dashboardData";

interface OverviewBodyProps {
  trend: TrendPoint[];
  breakdown: BreakdownData | null;
  campaignTableRef?: Ref<CampaignTableHandle>;
  productTableRef?: Ref<ProductTableHandle>;
}

// 2 bảng chi tiết tự fetch dữ liệu + tự lọc (ngày/chiến dịch/tài khoản) độc lập với thanh lọc tổng.
// Ref được forward xuống để nút "Xuất Excel" ở header (page.tsx) lấy đúng dữ liệu ĐANG HIỂN THỊ
// của mỗi bảng (xem CampaignTableHandle/ProductTableHandle) thay vì gọi lại hook và tạo ra bộ lọc
// rỗng khác với những gì người dùng đang xem.
export default function OverviewBody({ trend, breakdown, campaignTableRef, productTableRef }: OverviewBodyProps) {
  return (
    <div className="flex flex-col gap-5">
      <OverviewCharts trend={trend} breakdown={breakdown} />
      <CampaignTable ref={campaignTableRef} />
      <ProductTable ref={productTableRef} />
    </div>
  );
}
