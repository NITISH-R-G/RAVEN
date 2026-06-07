import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function PRAnalytics({ data }: { data: any }) {
  if (!data) return null;
  return (
    <section className="bg-slate-900 rounded-xl p-6 border border-white/5">
      <h2 className="text-xl font-semibold text-white mb-4">Pull Request Analytics</h2>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 p-3 rounded text-center">
          <div className="text-sm text-slate-400">Open PRs</div>
          <div className="text-xl font-bold text-white">{data.openPRs}</div>
        </div>
        <div className="bg-slate-800 p-3 rounded text-center">
          <div className="text-sm text-slate-400">Merged PRs</div>
          <div className="text-xl font-bold text-indigo-400">{data.mergedPRs}</div>
        </div>
        <div className="bg-slate-800 p-3 rounded text-center">
          <div className="text-sm text-slate-400">Avg Merge Time</div>
          <div className="text-xl font-bold text-white">{data.avgMergeTime}h</div>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.history}>
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
            <Bar
              isAnimationActive={false}
              dataKey="merged"
              stackId="a"
              fill="#6366f1"
              name="Merged"
            />
            <Bar
              isAnimationActive={false}
              dataKey="opened"
              stackId="a"
              fill="#94a3b8"
              name="Opened"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
