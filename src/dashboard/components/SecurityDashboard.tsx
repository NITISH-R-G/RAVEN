import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function SecurityDashboard({ data }: { data: any }) {
  if (!data) return null;
  return (
    <section className="bg-slate-900 rounded-xl p-6 border border-white/5">
      <h2 className="text-xl font-semibold text-white mb-4">Security Dashboard</h2>
      <div className="flex justify-between mb-6">
        <div className="text-center p-4 bg-slate-800 rounded-lg flex-1 mr-2 border border-red-500/20">
          <div className="text-red-400 font-bold text-3xl">{data.critical}</div>
          <div className="text-xs text-slate-400 uppercase">Critical</div>
        </div>
        <div className="text-center p-4 bg-slate-800 rounded-lg flex-1 mx-2 border border-orange-500/20">
          <div className="text-orange-400 font-bold text-3xl">{data.high}</div>
          <div className="text-xs text-slate-400 uppercase">High</div>
        </div>
        <div className="text-center p-4 bg-slate-800 rounded-lg flex-1 ml-2 border border-yellow-500/20">
          <div className="text-yellow-400 font-bold text-3xl">{data.moderate}</div>
          <div className="text-xs text-slate-400 uppercase">Moderate</div>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.history}>
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
            <Bar isAnimationActive={false} dataKey="critical" stackId="a" fill="#ef4444" />
            <Bar isAnimationActive={false} dataKey="high" stackId="a" fill="#f97316" />
            <Bar isAnimationActive={false} dataKey="moderate" stackId="a" fill="#eab308" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
