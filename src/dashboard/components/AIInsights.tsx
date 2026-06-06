import React from 'react';
import { Sparkles } from 'lucide-react';

export default function AIInsights({ data }: { data: any }) {
  if (!data) return null;
  return (
    <section className="bg-indigo-900/30 rounded-xl p-6 border border-indigo-500/30">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-indigo-400" />
        <h2 className="text-xl font-semibold text-white">AI Health Assessment</h2>
      </div>
      <div className="space-y-4">
        <div className="bg-slate-900/50 p-4 rounded-lg">
          <h3 className="font-semibold text-indigo-300 mb-2">Executive Summary</h3>
          <p className="text-slate-300">{data.summary}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-red-500">
            <h3 className="font-semibold text-red-400 mb-2">Priority Action Items</h3>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              {data.actionItems.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-green-500">
            <h3 className="font-semibold text-green-400 mb-2">Positive Trends</h3>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              {data.positiveTrends.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
