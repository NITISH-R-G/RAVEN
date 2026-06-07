import { Terminal, Check, RefreshCw, Activity } from "lucide-react";

interface AgenticSweepProgressProps {
  readonly activeStageId: number;
  readonly stageOutputs: { readonly [key: number]: string };
}

export function AgenticSweepProgress({
  activeStageId,
  stageOutputs,
}: AgenticSweepProgressProps) {
  return (
    <div className="bg-[#161618] border border-white/5 rounded-xl p-6 flex flex-col gap-6 min-h-[540px]">
      <div className="border-b border-white/5 pb-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-350">
            Active Multi-Layer Agentic Sweep
          </span>
        </div>
        <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-2 py-0.5 rounded font-bold uppercase animate-pulse">
          Sweeping Ledger...
        </span>
      </div>

      {/* Steps Layout */}
      <div className="flex-1 flex flex-col gap-4">
        {[
          {
            id: 1,
            title: "Layer 1 — Document Ingestion & Optical Scan",
            desc: "Verifies digital coordinates, raster anomalies & fonts integration.",
          },
          {
            id: 2,
            title: "Layer 2 — Cross-Document Coherence Engine",
            desc: "Crosschecks financial claims, employer registration indexes & dates.",
          },
          {
            id: 3,
            title: "Layer 3 — Fraud Ring Connection Topography",
            desc: "Extracts logical nodes and checks shared identifiers/crossovers.",
          },
          {
            id: 4,
            title: "Layer 4 — Compliance Case Compilation",
            desc: "Applies regulatory compliance weights and drafts actionable directives.",
          },
        ].map((step) => {
          const isActive = activeStageId === step.id;
          const isDone = activeStageId > step.id;

          let iconContent = null;
          if (isDone) {
            iconContent = (
              <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-emerald-400 font-bold" />
              </div>
            );
          } else if (isActive) {
            iconContent = (
              <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/40 flex items-center justify-center shrink-0">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              </div>
            );
          } else {
            iconContent = (
              <div className="w-5 h-5 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0 font-mono text-[9px] text-slate-500">
                0{step.id}
              </div>
            );
          }

          let titleColor = "text-slate-500";
          if (isActive) {
            titleColor = "text-indigo-300";
          } else if (isDone) {
            titleColor = "text-emerald-400";
          }

          let bgColor = "bg-black/20 border-white/5 opacity-40 select-none";
          if (isActive) {
            bgColor =
              "bg-indigo-950/15 border-indigo-500/40 shadow-md shadow-indigo-950/30 ring-1 ring-indigo-500/20";
          } else if (isDone) {
            bgColor = "bg-[#0A0A0B]/40 border-emerald-500/20";
          }

          return (
            <div
              key={step.id}
              className={`p-4 rounded-xl border transition-all duration-300 flex flex-col gap-2 ${bgColor}`}
            >
              <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
                <div className="flex items-center gap-2.5">
                  {iconContent}
                  <div>
                    <h4
                      className={`text-xs font-bold font-mono leading-none ${titleColor}`}
                    >
                      {step.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-sans mt-1 leading-normal">
                      {step.desc}
                    </p>
                  </div>
                </div>

                {isActive && (
                  <span className="text-[8px] font-mono uppercase bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded text-indigo-300 animate-pulse font-bold self-start sm:self-center shrink-0">
                    RUNNING ⚡
                  </span>
                )}
                {isDone && (
                  <span className="text-[8px] font-mono uppercase bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded text-emerald-400 font-bold self-start sm:self-center shrink-0">
                    DONE ✓
                  </span>
                )}
                {!isActive && !isDone && (
                  <span className="text-[8px] font-mono uppercase bg-white/5 border border-white/5 px-2 py-0.5 rounded text-slate-600 font-bold self-start sm:self-center shrink-0">
                    WAITING
                  </span>
                )}
              </div>

              {/* Display active detailed message output parsed on this loading layer */}
              {(isActive || isDone) && (
                <div className="mt-2 text-[11px] font-mono bg-[#0A0A0B]/85 border border-white/5 rounded-lg p-3 text-slate-300 select-text leading-relaxed animate-fade-in flex items-center gap-1.5 break-all">
                  {!isDone && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                  )}
                  <span>{stageOutputs[step.id]}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress and tips */}
      <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 font-mono text-[10px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-indigo-400 animate-spin" />
          Tracing ledger entries... {(activeStageId - 1) * 25 || 5}% Complete
        </span>
        <span className="text-slate-600 text-[9px] uppercase tracking-wider">
          DO NOT CLOSE THIS TERMINAL TAB
        </span>
      </div>
    </div>
  );
}
