import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function PerformanceMonitoring({ data }: { data: any }) {
  if (!data) return null;
  return (
    <section className="bg-slate-900 rounded-xl p-6 border border-white/5">
      <h2 className="text-xl font-semibold text-white mb-4">Performance Benchmarks</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800 p-4 rounded text-center">
          <div className="text-sm text-slate-400">Build Duration</div>
          <div className="text-2xl font-bold text-white">{data.buildDuration}s</div>
        </div>
        <div className="bg-slate-800 p-4 rounded text-center">
          <div className="text-sm text-slate-400">Bundle Size</div>
          <div className="text-2xl font-bold text-white">{data.bundleSize}MB</div>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.history}>
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
            <Line
              isAnimationActive={false}
              type="monotone"
              dataKey="buildTime"
              stroke="#14b8a6"
              name="Build Time (s)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
