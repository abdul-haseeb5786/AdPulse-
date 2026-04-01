import React, { useMemo } from 'react';
import { KPICard } from './KPICard';

type KPIGridProps = {
  campaigns: any[];
  isLoading: boolean;
};

// Formatter utilities
const formatNumber = (num: number) => {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
};

const formatCurrency = (num: number) => {
  return Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(num);
};

const formatPercent = (num: number) => {
  return Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 2,
    minimumFractionDigits: 1,
  }).format(num / 100);
};

export const KPIGrid: React.FC<KPIGridProps> = ({ campaigns = [], isLoading }) => {
  const metrics = useMemo(() => {
    // Accumulate totals directly from real remote props
    const totals = campaigns.reduce(
      (acc, curr) => ({
        spend: acc.spend + (Number(curr.spend) || 0),
        impressions: acc.impressions + (Number(curr.impressions) || 0),
        clicks: acc.clicks + (Number(curr.clicks) || 0),
        conversions: acc.conversions + (Number(curr.conversions) || 0),
        revenue: acc.revenue + (Number(curr.revenue) || 0),
      }),
      { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
    );

    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const roas = totals.spend > 0 ? totals.revenue / totals.spend : 0;

    return {
      impressions: totals.impressions,
      clicks: totals.clicks,
      conversions: totals.conversions,
      spend: totals.spend,
      revenue: totals.revenue,
      ctr,
      roas,
    };
  }, [campaigns]);

  // If loading, show skeletons
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[16px] h-[100px] animate-pulse"></div>
        ))}
      </div>
    );
  }

  // Not loading, map actuals
  const cardData = [
    {
      label: 'Impressions',
      value: formatNumber(metrics.impressions),
      delta: '0.0%',
      deltaUp: true,
    },
    {
      label: 'Clicks',
      value: formatNumber(metrics.clicks),
      delta: '0.0%',
      deltaUp: true,
    },
    {
      label: 'CTR',
      value: formatPercent(metrics.ctr),
      delta: '0.0%',
      isNeutral: true,
    },
    {
      label: 'Conversions',
      value: formatNumber(metrics.conversions),
      delta: '0.0%',
      deltaUp: true,
    },
    {
      label: 'Total Spend',
      value: formatCurrency(metrics.spend),
      delta: '0.0%',
      isNeutral: true,
    },
    {
      label: 'ROAS',
      value: `${metrics.roas.toFixed(2)}x`,
      delta: '0.0%',
      isNeutral: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
      {cardData.map((kpi) => (
        <KPICard
          key={kpi.label}
          label={kpi.label}
          value={kpi.value}
          delta={kpi.delta}
          deltaUp={kpi.deltaUp}
          isNeutral={kpi.isNeutral}
        />
      ))}
    </div>
  );
};
