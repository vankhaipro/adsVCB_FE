"use client";

import OverviewCharts from "./OverviewCharts";
import CampaignTable from "./CampaignTable";
import SkuTable from "./SkuTable";
import CreativeTable from "./CreativeTable";

interface OverviewBodyProps {
  campaigns: any[];
  sapoSkus: any[];
  trend: any[];
  breakdown: any;
}

export default function OverviewBody({ campaigns, sapoSkus, trend, breakdown }: OverviewBodyProps) {
  return (
    <div className="flex flex-col gap-5">
      <OverviewCharts trend={trend} breakdown={breakdown} />
      <CampaignTable campaigns={campaigns} />
      <SkuTable campaigns={campaigns} sapoSkus={sapoSkus} />
      <CreativeTable campaigns={campaigns} />
    </div>
  );
}
