import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function TestCoverage({ data }: { data: any }) {
  if (!data) return null;
  return (
    <section className="bg-slate-900 rounded-xl p-6 border border-white/5">
      <h2 className="text-xl font-semibold text-white mb-4">Test & Coverage Analytics</h2>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          { label: 'Lines', value: data.lines },
          { label: 'Functions', value: data.functions },
          { label: 'Branches', value: data.branches }
        ].map(item => (
          <div key={item.label} className="bg-slate-800 p-3 rounded text-center">
            <div className="text-sm text-slate-400">{item.label}</div>
            <div className="text-xl font-semibold text-white">{item.value}%</div>
          </div>
        ))}
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.history}>
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis stroke="#64748b" domain={[0, 100]} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
            <Area isAnimationActive={false} type="monotone" dataKey="coverage" stroke="#60a5fa" fill="#3b82f6" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
