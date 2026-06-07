import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function IssueManagement({ data }: { data: any }) {
  if (!data) return null;
  return (
    <section className="bg-slate-900 rounded-xl p-6 border border-white/5">
      <h2 className="text-xl font-semibold text-white mb-4">Issue Management</h2>
      <div className="flex gap-4 mb-6">
        <div className="bg-slate-800 p-3 rounded flex-1">
          <div className="text-sm text-slate-400">Open Issues</div>
          <div className="text-2xl font-bold text-white">{data.openIssues}</div>
        </div>
        <div className="bg-slate-800 p-3 rounded flex-1">
          <div className="text-sm text-slate-400">Closed Issues</div>
          <div className="text-2xl font-bold text-white">{data.closedIssues}</div>
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
              type="monotone"
              dataKey="open"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.2}
              name="Open Issues"
            />
            <Area
              isAnimationActive={false}
              type="monotone"
              dataKey="closed"
              stroke="#22c55e"
              fill="#22c55e"
              fillOpacity={0.2}
              name="Closed Issues"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
