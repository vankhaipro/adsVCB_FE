"use client";

import OverviewCharts from "./OverviewCharts";
import CampaignTable from "./CampaignTable";
import SkuTable from "./SkuTable";
import CreativeTable from "./CreativeTable";

// Body trang Tổng quan — dựng theo thiết kế Figma (dữ liệu mẫu, xem dashboardData.ts).
export default function OverviewBody() {
  return (
    <div className="flex flex-col gap-5">
      <OverviewCharts />
      <CampaignTable />
      <SkuTable />
      <CreativeTable />
    </div>
  );
}
