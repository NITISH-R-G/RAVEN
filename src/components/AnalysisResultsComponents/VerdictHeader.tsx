import { Sparkles } from 'lucide-react';
import { AnalysisResult } from '../../types';

interface VerdictHeaderProps {
  readonly analysisResult: AnalysisResult;
  readonly useManagedAgent: boolean;
  readonly managedAgentId: string;
}

export function VerdictHeader({
  analysisResult,
  useManagedAgent,
  managedAgentId,
}: VerdictHeaderProps) {
  let scoreColor = '#10b981';
  if (analysisResult.score > 60) {
    scoreColor = '#ef4444';
  } else if (analysisResult.score > 25) {
    scoreColor = '#f59e0b';
  }

  let textScoreColorClass = 'text-emerald-500';
  let textScoreLabel = 'Verified Clear';
  if (analysisResult.score > 60) {
    textScoreColorClass = 'text-red-500';
    textScoreLabel = 'Deficit Risk';
  } else if (analysisResult.score > 25) {
    textScoreColorClass = 'text-amber-500';
    textScoreLabel = 'Warn Hold';
  }

  let verdictClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
  if (analysisResult.verdict === 'HIGH RISK') {
    verdictClass = 'bg-red-500/10 text-red-400 border-red-500/25';
  } else if (analysisResult.verdict === 'MEDIUM RISK') {
    verdictClass = 'bg-amber-500/10 text-amber-400 border-amber-500/25';
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-slate-200">
            Final Relational Audit Docket
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono uppercase font-bold tracking-wider">
              Scan Complete
            </span>
            <span className="text-[10px] text-slate-500 font-mono tracking-wider">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {useManagedAgent ? (
          <div className="bg-indigo-950/20 border border-indigo-505/20 rounded-lg p-2.5 flex items-start gap-3 max-w-sm self-start sm:self-center">
            <div className="mt-0.5 bg-indigo-500/20 p-1 rounded">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div>
              <span className="font-bold uppercase block text-[10px] text-indigo-300">
                Managed Agent Evaluated
              </span>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-relaxed">
                A custom multi-agent workflow ({managedAgentId}) was deployed to trace relationships
                and score this case file using specialized LLM reasoning paths.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 self-start sm:self-center">
            <div className="bg-black/35 border border-white/5 rounded-lg p-2.5 flex items-start gap-3 max-w-xs shrink-0 hidden md:flex">
              <div>
                <span className="font-bold uppercase block text-[10px]">
                  LOCAL HEURISTICS EXECUTION
                </span>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-relaxed">
                  Evaluated using RAVEN&apos;s fully optimized multi-document coherence ruleset. Set
                  GEMINI_API_KEY inside Settings drawer to fully enable LLM deep-reasoning tree
                  structures.
                </p>
              </div>
            </div>
            <span className="text-[9px] uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded text-indigo-300 font-bold self-start sm:self-center shrink-0">
              Local Mode
            </span>
          </div>
        )}
      </div>

      <div className="bg-[#161618] border border-white/5 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shrink-0">
        <span className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full filter blur-3xl"></span>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
          {/* Circle score metric */}
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0 select-none">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke={scoreColor}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - analysisResult.score / 100)}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-serif text-white italic leading-none">
                {analysisResult.score}
              </span>
              <p
                className={`text-[8px] uppercase font-bold tracking-wider leading-none mt-1 ${textScoreColorClass}`}
              >
                {textScoreLabel}
              </p>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <div className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-start">
              <span
                className={`text-[9.5px] font-mono tracking-widest font-bold uppercase border px-2.5 py-1 rounded leading-none ${verdictClass}`}
              >
                {analysisResult.verdict}
              </span>
              {useManagedAgent && (
                <span className="text-[8.5px] font-mono text-indigo-350 font-bold uppercase px-2 py-1 border border-indigo-500/20 rounded bg-indigo-950/20 shadow-[0_0_8px_rgba(99,102,241,0.1)] flex items-center gap-1 leading-none select-none">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  Auditor Run: {managedAgentId}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-350 mt-3.5 leading-relaxed max-w-md font-sans">
              {analysisResult.summary}
            </p>
          </div>
        </div>

        {/* Score indicators panel */}
        <div className="flex flex-col gap-1.5 shrink-0 w-full sm:w-auto md:max-w-[200px] border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-5 font-mono text-[10px]">
          <div className="flex justify-between items-center gap-4">
            <span className="text-slate-500 uppercase font-medium">Compliance Tag:</span>
            <span
              className={
                analysisResult.caseFileDetails.recommendingRejection
                  ? 'text-red-400 font-bold'
                  : 'text-emerald-450 font-bold'
              }
            >
              {analysisResult.caseFileDetails.recommendingRejection
                ? 'REJECT ROUTE'
                : 'STANDARD PASS'}
            </span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-slate-500 uppercase">Clash Contradictions:</span>
            <span
              className={
                analysisResult.contradictions.length > 0
                  ? 'text-amber-450 font-bold'
                  : 'text-slate-400'
              }
            >
              {analysisResult.contradictions.length} flagged
            </span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-slate-500 uppercase">Dossier Vertices:</span>
            <span className="text-indigo-400 font-bold">
              {analysisResult.graphNodes.length} mapped
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
