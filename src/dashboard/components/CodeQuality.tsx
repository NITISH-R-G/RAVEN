import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function CodeQuality({ data }: { data: any }) {
  if (!data) return null;
  return (
    <section className="bg-slate-900 rounded-xl p-6 border border-white/5">
      <h2 className="text-xl font-semibold text-white mb-4">Code Quality Metrics</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 p-4 rounded-lg flex justify-between items-center">
          <span className="text-slate-400">Linting Errors</span>
          <span className="text-2xl font-bold text-white">{data.lintErrors}</span>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg flex justify-between items-center">
          <span className="text-slate-400">Duplicate Code</span>
          <span className="text-2xl font-bold text-white">{data.duplicateCode}%</span>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg flex justify-between items-center">
          <span className="text-slate-400">Dead Code Files</span>
          <span className="text-2xl font-bold text-white">{data.deadCode}</span>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg flex justify-between items-center">
          <span className="text-slate-400">Tech Debt Score</span>
          <span className={`text-2xl font-bold ${data.techDebtScore > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
            {data.techDebtScore}
          </span>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.history}>
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
            <Line isAnimationActive={false} type="monotone" dataKey="lintErrors" stroke="#f43f5e" name="Lint Errors" />
            <Line isAnimationActive={false} type="monotone" dataKey="deadCode" stroke="#8b5cf6" name="Dead Code" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
