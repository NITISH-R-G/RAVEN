import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { AnalysisResult } from '../../types';

interface CoherenceFlagsProps {
  readonly analysisResult: AnalysisResult;
}

export function CoherenceFlags({ analysisResult }: CoherenceFlagsProps) {
  return (
    <div className="bg-[#161618] border border-white/5 p-5 rounded-xl space-y-4">
      <div className="border-b border-white/5 pb-2 flex justify-between items-center">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-indigo-400" />
          Section 1: Multi-Document Coherence clashing flags
        </h4>
        <span className="text-[9.5px] font-mono text-slate-500 font-bold select-none">
          Audit Level 2
        </span>
      </div>

      {analysisResult.contradictions.length > 0 ? (
        <div className="space-y-3">
          {analysisResult.contradictions.map((con, idx) => {
            let severityClass = 'bg-[#0A0A0B]/60 border-white/5';
            if (con.severity === 'high') {
              severityClass = 'bg-red-500/5 border-red-550/20 text-red-100';
            } else if (con.severity === 'medium') {
              severityClass = 'bg-amber-500/5 border-amber-550/15 text-amber-100';
            }

            let badgeClass = 'bg-[#0A0A0B] text-slate-400';
            if (con.severity === 'high') {
              badgeClass = 'bg-red-950/85 text-red-400 border border-red-900/30';
            } else if (con.severity === 'medium') {
              badgeClass = 'bg-amber-955/85 text-amber-400 border border-amber-900/30';
            }

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row gap-3 items-start justify-between transition-all duration-300 ${severityClass}`}
              >
                <div className="space-y-1.5 flex-1 select-text">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[8px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded leading-none font-bold ${badgeClass}`}
                    >
                      {con.severity}
                    </span>
                    <span className="text-xs font-semibold text-white">{con.title}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {con.description}
                  </p>
                </div>
                <div className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-slate-500 bg-black/45 border border-white/5 px-2.5 py-1 rounded max-w-[200px] text-center self-start sm:self-center">
                  {con.crossDocSource}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-emerald-555/5 border border-emerald-550/20 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-300">
            Coherence alignment verified
          </h4>
          <p className="text-xs text-slate-500 font-sans max-w-sm leading-relaxed">
            Income margins, corporate PAN hashes, listed guarantor files, and locations align
            precisely without cross-document contradictions.
          </p>
        </div>
      )}
    </div>
  );
}
