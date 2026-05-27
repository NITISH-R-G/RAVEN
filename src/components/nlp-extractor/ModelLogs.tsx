import React from "react";
import { Cpu } from "lucide-react";
import { SelectedModelType } from "./types";

interface ModelLogsProps {
  selectedModel: SelectedModelType;
}

export const ModelLogs: React.FC<ModelLogsProps> = ({ selectedModel }) => {
  return (
    <div className="bg-black/60 border border-white/5 p-3 rounded-lg flex items-start gap-2.5 text-xs">
      <Cpu className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
      <div className="space-y-1">
        <p className="text-slate-300 font-mono text-[11px] font-semibold leading-none">
          {selectedModel === "anthropic-finance" && "Claude 3.5 Sonnet Financial Schema Handler (Aligned with anthropics/financial-services)"}
          {selectedModel === "fingpt-llama" && "AI4Finance FinGPT-v3 LLM Reasoning Output"}
          {selectedModel === "layoutlm-v3" && "LayoutLMv3 Multimodal Parsing Checkpoint"}
        </p>
        <p className="text-slate-400 text-[10.5px] leading-relaxed font-sans mt-1">
          {selectedModel === "anthropic-finance" && (
            "Handles document coordinate variability by mapping key-value structures onto an abstract RBI-compliant financial ledger. Reconciles tax statements and salary paystubs against master borrower records dynamically."
          )}
          {selectedModel === "fingpt-llama" && (
            "Analyses textual reasoning logs step-by-step. Evaluates numeric declarations by linking statements with the broader company file indicators to determine revenue authenticity indices."
          )}
          {selectedModel === "layoutlm-v3" && (
            "Scans spatial layout grids to flag micro-discrepancies in line coordinates or template borders, detecting whether details have been visual-pasted or edited (e.g., in Canva/Photoshop templates)."
          )}
        </p>
      </div>
    </div>
  );
};
