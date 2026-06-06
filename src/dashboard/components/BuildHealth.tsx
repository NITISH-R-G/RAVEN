import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function BuildHealth({ data }: { data: any }) {
  if (!data) return null;
  return (
    <section className="bg-slate-900 rounded-xl p-6 border border-white/5">
      <h2 className="text-xl font-semibold text-white mb-4">Build & Deployment Health</h2>
      <div className="flex gap-4 mb-4">
        <div className="bg-slate-800 p-3 rounded flex-1">
          <div className="text-sm text-slate-400">Build Success Rate</div>
          <div className="text-2xl text-green-400">{data.buildSuccessRate}%</div>
        </div>
        <div className="bg-slate-800 p-3 rounded flex-1">
          <div className="text-sm text-slate-400">Deploy Success Rate</div>
          <div className="text-2xl text-green-400">{data.deploySuccessRate}%</div>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.history}>
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
            <Bar isAnimationActive={false} dataKey="success" stackId="a" fill="#4ade80" />
            <Bar isAnimationActive={false} dataKey="failure" stackId="a" fill="#f87171" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
