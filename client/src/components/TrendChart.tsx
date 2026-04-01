import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Campaign } from '../services/campaignService';

type TrendChartProps = {
  activeDate: string;
  campaigns?: Campaign[];
  isLoading?: boolean;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] p-3 rounded-lg shadow-xl backdrop-blur-sm">
        <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-[13px] text-[var(--text-secondary)]">{entry.name}</span>
              </div>
              <span className="text-[13px] font-mono font-bold text-[var(--text-primary)]">
                {entry.name === 'Spend' ? `$${entry.value}` : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const TrendChart = ({ activeDate }: TrendChartProps) => {
  const data = useMemo(() => {
    const days = activeDate === '7D' ? 7 : activeDate === '90D' ? 90 : 30;
    return Array.from({ length: days }, (_, i) => ({
      date: `2024-03-${String(i + 1).padStart(2, '0')}`,
      Spend: Math.floor(Math.random() * 500) + 100,
      Conversions: Math.floor(Math.random() * 50) + 10,
    }));
  }, [activeDate]);

  return (
    <div className="card p-6 h-[320px] lg:h-[360px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            Performance Over Time
          </h3>
          <p className="text-[13px] font-medium text-[var(--text-secondary)]">Trends for Spend & Conversions</p>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-bold text-[var(--text-muted)] uppercase">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-blue-600 shadow-sm shadow-blue-600/20" />
            Spend
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-indigo-400 shadow-sm shadow-indigo-400/20" />
            Conversions
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
              strokeOpacity={0.4}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}
              dy={10}
              tickFormatter={(val) => val.split('-')[2]}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="Spend"
              stroke="#2563eb"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSpend)"
              animationDuration={1500}
            />
            <Area
              type="monotone"
              dataKey="Conversions"
              stroke="#818cf8"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorConv)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
