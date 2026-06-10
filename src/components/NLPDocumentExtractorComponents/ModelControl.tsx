import React from "react";
import { Cpu, Sparkles, TrendingUp, Layers3 } from "lucide-react";

export type NLPModelType = "anthropic-finance" | "fingpt-llama" | "layoutlm-v3";

interface ModelControlProps {
  selectedModel: NLPModelType;
  setSelectedModel: (model: NLPModelType) => void;
}

export const ModelControl: React.FC<ModelControlProps> = ({ selectedModel, setSelectedModel }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3.5 gap-2.5">
      <div className="flex items-center gap-1.5 shrink-0">
        <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
        <h4 className="text-xs font-mono font-bold tracking-widest text-slate-350 uppercase">
          Anthropic & FinGPT NLP Extraction Engine
        </h4>
      </div>

      <div className="flex items-center gap-1.5 bg-black/65 border border-white/5 p-1 rounded-lg self-start sm:self-auto text-[10px] font-mono shrink-0">
        <button
          onClick={() => setSelectedModel("anthropic-finance")}
          className={`px-2 py-1 rounded transition-all flex items-center gap-1 ${
            selectedModel === "anthropic-finance"
              ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Sparkles className="w-3 h-3 text-indigo-300" />
          Claude-3.5 Sonnet FinNLP
        </button>

        <button
          onClick={() => setSelectedModel("fingpt-llama")}
          className={`px-2 py-1 rounded transition-all flex items-center gap-1 ${
            selectedModel === "fingpt-llama"
              ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <TrendingUp className="w-3 h-3 text-indigo-400" />
          FinGPT-v3 (LLaMA-7B)
        </button>

        <button
          onClick={() => setSelectedModel("layoutlm-v3")}
          className={`px-2 py-1 rounded transition-all flex items-center gap-1 ${
            selectedModel === "layoutlm-v3"
              ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Layers3 className="w-3 h-3 text-indigo-400" />
          LayoutLMv3 (OCR Maps)
        </button>
      </div>
    </div>
  );
};
