import React from "react";
import { Compass } from "lucide-react";
import { LayoutDiscovered } from "./types";
import { DocumentItem } from "../../types";

interface VisualizerProps {
  document: DocumentItem;
  layoutDiscovered: LayoutDiscovered;
}

export const Visualizer: React.FC<VisualizerProps> = ({ document, layoutDiscovered }) => {
  return (
    <div className="md:col-span-5 bg-black/40 border border-white/5 p-3.5 rounded-lg flex flex-col justify-between gap-3 min-h-[220px]">
      <div>
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-550 border-b border-white/5 pb-1.5 mb-2 shrink-0">
          <span className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            OCR Layout Bounding Map
          </span>
          <span>{layoutDiscovered.gridMatch}</span>
        </div>

        {/* Live visual skeleton representing layout segments mapped by FinGPT or LayoutLM */}
        <div className="bg-[#050506]/90 border border-indigo-500/10 rounded p-3 h-36 relative overflow-hidden font-mono text-[9px] flex flex-col justify-between">

          {/* Overlay layout scanning effect */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.5)] animate-[bounce_3.5s_infinite] pointer-events-none"></div>

          {document.type === "ITR" && (
            <div className="space-y-1.5 scale-[0.95] origin-top-left">
              <div className="flex gap-1.5">
                <div className="w-12 h-3 bg-indigo-550/15 border border-indigo-550/30 rounded text-indigo-400 flex items-center justify-center font-bold">HEADER</div>
                <div className="w-24 h-3 bg-slate-800/40 rounded"></div>
              </div>
              <div className="border border-white/5 p-1 rounded space-y-1 bg-black/25">
                <div className="flex justify-between items-center text-[8px]">
                  <span className="text-slate-500">[BOX 1] TAXPAYER ID:</span>
                  <span className="text-emerald-400 font-bold bg-emerald-900/10 px-1 border border-emerald-900/20 rounded">99.8% CONF</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded"></div>
                <div className="flex justify-between items-center text-[8px]">
                  <span className="text-slate-500">[BOX 2] INCOME DECLARATION:</span>
                  <span className="text-indigo-400 font-bold bg-indigo-900/10 px-1 border border-indigo-900/20 rounded">98.6%</span>
                </div>
              </div>
              <div className="w-full h-8 border border-dashed border-white/5 rounded p-1 flex justify-between">
                <span className="text-slate-600">[BOX 3] ADDR COORDS:</span>
                <span className="text-slate-500 italic">Matched 400012/560103</span>
              </div>
            </div>
          )}

          {document.type === "SALARY_SLIP" && (
            <div className="space-y-1.5 scale-[0.95] origin-top-left">
              <div className="w-full h-3 bg-indigo-650/10 border border-indigo-500/20 rounded flex items-center justify-between px-1 bg-indigo-950/10">
                <span className="text-indigo-300 font-bold">LEDGER SCHEME</span>
                <span className="text-[7px] text-slate-500">300 DPI SCANNED</span>
              </div>
              <div className="grid grid-cols-2 gap-1 bg-black/45 p-1 rounded border border-white/5">
                <div className="p-0.5 border border-white/5 rounded space-y-0.5">
                  <div className="flex justify-between text-[7px] text-slate-500">
                    <span>CREDITS LOG:</span>
                    <span className="text-indigo-300 font-mono">99.1%</span>
                  </div>
                  <div className="w-full h-1 bg-indigo-950/50 rounded"></div>
                </div>
                <div className="p-0.5 border border-white/5 rounded space-y-0.5">
                  <div className="flex justify-between text-[7px] text-slate-500">
                    <span>ROUTING route:</span>
                    <span className="text-emerald-400 font-mono">95.0%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded"></div>
                </div>
              </div>
              <div className="p-1 border border-dashed border-red-500/20 bg-red-950/5 rounded text-[8px] text-red-400 flex items-center justify-between">
                <span>ANOMALOUS PIXEL DUMP</span>
                <span className="font-bold">LOW-RESOLUTION EXPORT (96 DPI)</span>
              </div>
            </div>
          )}

          {document.type === "PROPERTY_VALUATION" && (
            <div className="space-y-1.5 scale-[0.95] origin-top-left">
              <div className="w-full h-3 bg-indigo-650/15 border border-indigo-400/25 rounded px-1.5 flex justify-between items-center text-indigo-300 font-bold">
                <span>STAMPS DEED SURVEY</span>
                <span className="text-slate-500">[CERT-VAL]</span>
              </div>
              <div className="space-y-1 border border-white/5 p-1 rounded">
                <div className="flex justify-between text-[7px] text-slate-500">
                  <span>OWNERSHIP DEED ANCHOR:</span>
                  <span className="text-emerald-400">97.5%</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded"></div>
                <div className="flex justify-between text-[7px] text-slate-500">
                  <span>APPRAISED LIQUIDITY VALUE:</span>
                  <span className="text-indigo-400 font-bold">99.0%</span>
                </div>
              </div>
            </div>
          )}

          {document.type !== "ITR" && document.type !== "SALARY_SLIP" && document.type !== "PROPERTY_VALUATION" && (
            <div className="space-y-1 scale-[0.95] origin-top-left">
              <span className="text-slate-500 block uppercase font-bold tracking-tight mb-1">Unstructured Raw Token Coordinates</span>
              <div className="w-full h-8 bg-black/60 rounded border border-white/5 p-1 flex flex-wrap gap-1 content-start">
                <span className="px-1 py-0.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded text-[7px]">TOKEN_IP [115.118]</span>
                <span className="px-1 py-0.5 bg-slate-800 border border-white/5 text-slate-400 rounded text-[7px]">PLATFORM_OS</span>
                <span className="px-1 py-0.5 bg-slate-800 border border-white/5 text-slate-400 rounded text-[7px]">DPI_CHECK [OK]</span>
              </div>
              <div className="text-[7.5px] text-indigo-400/60 leading-tight">
                Running Layout-Aware Text Sequence Traversal via FinGPT Attention Matrix.
              </div>
            </div>
          )}

          <div className="text-[8px] text-slate-650 flex justify-between items-baseline border-t border-white/5 pt-1 mt-1 shrink-0 select-none">
            <span>Model Scale: LLaMA-7B Base</span>
            <span>Layers Loaded: 32 Attention Blocks</span>
          </div>
        </div>
      </div>

      {/* Model feedback statistics */}
      <div className="bg-[#101012] border border-white/5 p-2.5 rounded text-[11px] font-mono grid grid-cols-2 gap-1 text-slate-400 shrink-0">
        <div>
          <span className="text-slate-500 block text-[8px] uppercase tracking-wider">Alignment Acc</span>
          <span className="text-indigo-400 font-bold">{layoutDiscovered.alignmentConfidence}%</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[8px] uppercase tracking-wider">Identified Fields</span>
          <span className="text-indigo-400 font-bold">{layoutDiscovered.fieldsCount} nodes</span>
        </div>
      </div>
    </div>
  );
};
