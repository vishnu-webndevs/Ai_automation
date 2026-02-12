// import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', visitors: 4000, pageviews: 2400 },
  { name: 'Tue', visitors: 3000, pageviews: 1398 },
  { name: 'Wed', visitors: 2000, pageviews: 9800 },
  { name: 'Thu', visitors: 2780, pageviews: 3908 },
  { name: 'Fri', visitors: 1890, pageviews: 4800 },
  { name: 'Sat', visitors: 2390, pageviews: 3800 },
  { name: 'Sun', visitors: 3490, pageviews: 4300 },
];

const TrafficChart = () => {
  return (
    <div className="col-span-12 rounded-xl border border-slate-200 bg-white px-5 pt-7.5 pb-5 shadow-sm dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5">
            <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-indigo-600">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-indigo-600"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-indigo-600">Total Visitors</p>
              <p className="text-sm font-medium text-slate-500">12.04.2024 - 12.05.2024</p>
            </div>
          </div>
          <div className="flex min-w-47.5">
            <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-purple-500">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-purple-500"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-purple-500">Page Views</p>
              <p className="text-sm font-medium text-slate-500">12.04.2024 - 12.05.2024</p>
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
            <Area type="monotone" dataKey="visitors" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorVisitors)" />
            <Area type="monotone" dataKey="pageviews" stroke="#A855F7" strokeWidth={2} fillOpacity={1} fill="url(#colorPageviews)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrafficChart;