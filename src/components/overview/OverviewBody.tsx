"use client";

import OverviewCharts from "./OverviewCharts";
import CampaignTable from "./CampaignTable";
import SkuTable from "./SkuTable";
import CreativeTable from "./CreativeTable";

interface OverviewBodyProps {
  trend: any[];
  breakdown: any;
}

// 3 bảng chi tiết tự fetch dữ liệu + tự lọc (ngày/chiến dịch/tài khoản) độc lập với thanh lọc tổng.
export default function OverviewBody({ trend, breakdown }: OverviewBodyProps) {
  return (
    <div className="flex flex-col gap-5">
      <OverviewCharts trend={trend} breakdown={breakdown} />
      <CampaignTable />
      <SkuTable />
      <CreativeTable />
    </div>
  );
}
