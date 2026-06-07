import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function RepositoryActivity({ data }: { data: any }) {
  if (!data) return null;
  return (
    <section className="bg-slate-900 rounded-xl p-6 border border-white/5">
      <h2 className="text-xl font-semibold text-white mb-4">Repository Activity</h2>
      <div className="flex gap-4 mb-4">
        <div className="bg-slate-800 p-4 rounded flex-1 text-center">
          <div className="text-sm text-slate-400">Total Commits</div>
          <div className="text-3xl font-bold text-white">{data.totalCommits}</div>
        </div>
        <div className="bg-slate-800 p-4 rounded flex-1 text-center">
          <div className="text-sm text-slate-400">Active Contributors</div>
          <div className="text-3xl font-bold text-white">{data.activeContributors}</div>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.history}>
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
            <Area
              isAnimationActive={false}
              type="step"
              dataKey="commits"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.2}
              name="Commits"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
