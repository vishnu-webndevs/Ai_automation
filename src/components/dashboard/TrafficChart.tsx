// import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export type DashboardChartPoint = {
  date: string;
  label: string;
  pages: number;
  ai: number;
};

export type DashboardChartPayload = {
  range: { from: string; to: string };
  data: DashboardChartPoint[];
};

const TrafficChart = ({ chart, loading }: { chart?: DashboardChartPayload; loading?: boolean }) => {
  const data = chart?.data?.map((p) => ({ name: p.label, pages: p.pages, ai: p.ai })) ?? [];
  const rangeLabel = chart?.range ? `${chart.range.from} - ${chart.range.to}` : '';

  return (
    <div className="col-span-12 rounded-xl border border-slate-200 bg-white px-5 pt-7.5 pb-5 shadow-sm dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5">
            <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-indigo-600">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-indigo-600"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-indigo-600">Pages Created</p>
              <p className="text-sm font-medium text-slate-500">{loading ? '—' : rangeLabel}</p>
            </div>
          </div>
          <div className="flex min-w-47.5">
            <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-purple-500">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-purple-500"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-purple-500">AI Generations</p>
              <p className="text-sm font-medium text-slate-500">{loading ? '—' : rangeLabel}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A855F7" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 12 }}
                dy={10}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 12 }}
            />
            <Tooltip 
                contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                }}
            />
            <Area type="monotone" dataKey="pages" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorVisitors)" />
            <Area type="monotone" dataKey="ai" stroke="#A855F7" strokeWidth={2} fillOpacity={1} fill="url(#colorPageviews)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrafficChart;
