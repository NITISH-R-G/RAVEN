import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ExecutiveOverview({ data }: { data: any }) {
  if (!data) return null;
  return (
    <section className="bg-slate-900 rounded-xl p-6 border border-white/5">
      <h2 className="text-xl font-semibold text-white mb-4">Executive Health Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Overall Health', value: data.overallScore },
          { label: 'Engineering Quality', value: data.engineeringScore },
          { label: 'Security Score', value: data.securityScore },
          { label: 'Maintainability', value: data.maintainabilityScore },
        ].map((item) => (
          <div key={item.label} className="bg-slate-800 p-4 rounded-lg">
            <div className="text-sm text-slate-400">{item.label}</div>
            <div
              className={`text-3xl font-bold ${item.value > 80 ? 'text-green-400' : 'text-yellow-400'}`}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.history}>
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
            <Line
              isAnimationActive={false}
              type="monotone"
              dataKey="score"
              stroke="#818cf8"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
