import React from 'react';

export default function Contributors({ data }: { data: any }) {
  if (!data) return null;
  return (
    <section className="bg-slate-900 rounded-xl p-6 border border-white/5">
      <h2 className="text-xl font-semibold text-white mb-4">Top Contributors</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.list.map((contributor: any, i: number) => (
          <div key={i} className="flex items-center gap-4 bg-slate-800 p-4 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white">
              {contributor.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-white">{contributor.name}</div>
              <div className="text-sm text-slate-400">{contributor.commits} commits</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
