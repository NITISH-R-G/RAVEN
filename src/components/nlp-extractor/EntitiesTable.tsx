import React from "react";
import { Database, RefreshCw } from "lucide-react";
import { ParsedEntity } from "./types";

interface EntitiesTableProps {
  isParsing: boolean;
  parsedEntities: ParsedEntity[];
}

export const EntitiesTable: React.FC<EntitiesTableProps> = ({ isParsing, parsedEntities }) => {
  return (
    <div className="md:col-span-7 flex flex-col gap-3 min-h-[220px]">
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-550 border-b border-white/5 pb-1.5 shrink-0">
        <span className="flex items-center gap-1.5">
          <Database className="w-4 h-4 text-indigo-400 shrink-0" />
          Structured Relational Fields (Unified Schema)
        </span>
        <span>Confidence Indicator</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px] pr-1.5">
        {isParsing ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 gap-2 h-full">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
            <span className="text-xs font-mono">Running FineUploader OCR alignment & FinGPT classification...</span>
          </div>
        ) : parsedEntities.length > 0 ? (
          parsedEntities.map((entity, i) => (
            <div key={i} className="flex items-center justify-between gap-3 bg-[#161618] border border-white/5 hover:border-indigo-550/20 p-2.5 rounded-lg transition-all duration-300">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[8px] font-mono tracking-widest font-bold px-1.5 rounded uppercase leading-none border scale-[0.98] ${
                    entity.classification === "IDENTITY" ? "bg-cyan-950 text-cyan-400 border-cyan-900/30" :
                    entity.classification === "FINANCIAL" ? "bg-emerald-950 text-emerald-400 border-emerald-900/30" :
                    entity.classification === "ORGANIZATION" ? "bg-indigo-950 text-indigo-400 border-indigo-900/30" :
                    entity.classification === "GEOGRAPHIC" ? "bg-amber-955 text-amber-400 border-amber-900/30" :
                    "bg-slate-900 text-slate-400 border-white/5"
                  }`}>
                    {entity.classification}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-350">{entity.field}</span>
                </div>

                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="text-xs font-bold text-white truncate max-w-[90%] font-sans">{entity.value}</span>
                  {entity.status === "discrepant" && (
                    <span className="text-[9px] font-mono text-red-400 underline decoration-red-500/40 shrink-0">Anomaly Detected</span>
                  )}
                  {entity.status === "warning" && (
                    <span className="text-[9px] font-mono text-amber-400 decimal shrink-0">Check Metadata</span>
                  )}
                </div>

                <p className="text-[9.5px] font-mono text-slate-550 truncate max-w-full">
                  Source: <span className="italic text-slate-400">"{entity.extractedFrom}"</span>
                </p>
              </div>

              {/* Confidence meter */}
              <div className="flex flex-col items-end shrink-0 select-none">
                <span className={`text-xs font-mono font-bold ${
                  entity.confidence > 95 ? "text-emerald-400" : "text-amber-400"
                }`}>
                  {entity.confidence.toFixed(1)}%
                </span>
                <div className="w-12 bg-black rounded-full h-1 mt-1 overflow-hidden border border-white/5">
                  <div
                    className={`h-full rounded-full ${entity.confidence > 95 ? "bg-emerald-500" : "bg-amber-500"}`}
                    style={{ width: `${entity.confidence}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-8 text-slate-500 text-xs italic font-sans">
            Could not automatically parse structured schema. Paste valid financial coordinates.
          </div>
        )}
      </div>
    </div>
  );
};
