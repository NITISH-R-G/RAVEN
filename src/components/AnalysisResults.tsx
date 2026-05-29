import { Dispatch, SetStateAction } from "react";
import {
  Terminal,
  Check,
  RefreshCw,
  Activity,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Scale,
  Download,
  Database,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AnalysisResult, GraphNode } from "../types";
import { NetworkGraph } from "./NetworkGraph";

interface AnalysisResultsProps {
  isAnalyzing: boolean;
  activeStageId: number;
  stageOutputs: { [key: number]: string };
  analysisResult: AnalysisResult | null;
  selectedNode: GraphNode | null;
  setSelectedNode: Dispatch<SetStateAction<GraphNode | null>>;
  useManagedAgent: boolean;
  managedAgentId: string;
  errorText: string;
}

export function AnalysisResults({
  isAnalyzing,
  activeStageId,
  stageOutputs,
  analysisResult,
  selectedNode,
  setSelectedNode,
  useManagedAgent,
  managedAgentId,
  errorText,
}: AnalysisResultsProps) {
  return (
    <section className="lg:col-span-7 flex flex-col gap-6 lg:h-full lg:overflow-y-auto pr-1">
      {isAnalyzing ? (
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

              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-xl border transition-all duration-300 flex flex-col gap-2 ${
                    isActive
                      ? "bg-indigo-950/15 border-indigo-500/40 shadow-md shadow-indigo-950/30 ring-1 ring-indigo-500/20"
                      : isDone
                      ? "bg-[#0A0A0B]/40 border-emerald-500/20"
                      : "bg-black/20 border-white/5 opacity-40 select-none"
                  }`}
                >
                  <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
                    <div className="flex items-center gap-2.5">
                      {isDone ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 text-emerald-400 font-bold" />
                        </div>
                      ) : isActive ? (
                        <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/40 flex items-center justify-center shrink-0">
                          <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0 font-mono text-[9px] text-slate-500">
                          0{step.id}
                        </div>
                      )}
                      <div>
                        <h4
                          className={`text-xs font-mono font-bold leading-none ${
                            isActive
                              ? "text-indigo-300"
                              : isDone
                              ? "text-emerald-400"
                              : "text-slate-500"
                          }`}
                        >
                          {step.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-sans mt-1 leading-normal">
                          {step.desc}
                        </p>
                      </div>
                    </div>

                    {isActive ? (
                      <span className="text-[8px] font-mono uppercase bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded text-indigo-300 animate-pulse font-bold self-start sm:self-center shrink-0">
                        RUNNING ⚡
                      </span>
                    ) : isDone ? (
                      <span className="text-[8px] font-mono uppercase bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded text-emerald-400 font-bold self-start sm:self-center shrink-0">
                        DONE ✓
                      </span>
                    ) : (
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
      ) : analysisResult ? (
        <div className="flex flex-col gap-6">
          {analysisResult.aiStatus &&
            !analysisResult.aiStatus.success &&
            analysisResult.aiStatus.isQuotaExceeded && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-amber-400">
                  <ShieldAlert className="w-5 h-5 shrink-0 animate-bounce text-amber-500" />
                  <div>
                    <span className="font-bold uppercase block text-[10px]">
                      GEMINI CLOUD QUOTA REACHED (FREE TIER)
                    </span>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-relaxed">
                      To protect your seamless workflow, the local RAVEN Multi-Document Rule
                      Intelligence dynamic analyzer has compiled this relational graph check
                      instantly with top-tier heuristics.
                    </p>
                  </div>
                </div>
                <span className="text-[9px] uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded text-amber-300 font-bold self-start sm:self-center shrink-0">
                  Rule Engine Active
                </span>
              </div>
            )}

          {analysisResult.aiStatus &&
            !analysisResult.aiStatus.success &&
            !analysisResult.aiStatus.isQuotaExceeded && (
              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Sparkles className="w-5 h-5 shrink-0 text-indigo-400 animate-pulse" />
                  <div>
                    <span className="font-bold uppercase block text-[10px]">
                      LOCAL HEURISTICS EXECUTION
                    </span>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-relaxed">
                      Evaluated using RAVEN's fully optimized multi-document coherence ruleset. Set
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

          {/* Verdict Header dial */}
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
                    stroke={
                      analysisResult.score > 60
                        ? "#ef4444"
                        : analysisResult.score > 25
                        ? "#f59e0b"
                        : "#10b981"
                    }
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={
                      2 * Math.PI * 40 * (1 - analysisResult.score / 100)
                    }
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-serif text-white italic leading-none">
                    {analysisResult.score}
                  </span>
                  <p
                    className={`text-[8px] uppercase font-bold tracking-wider leading-none mt-1 ${
                      analysisResult.score > 60
                        ? "text-red-500"
                        : analysisResult.score > 25
                        ? "text-amber-500"
                        : "text-emerald-500"
                    }`}
                  >
                    {analysisResult.score > 60
                      ? "Deficit Risk"
                      : analysisResult.score > 25
                      ? "Warn Hold"
                      : "Verified Clear"}
                  </p>
                </div>
              </div>

              <div className="text-center sm:text-left">
                <div className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-start">
                  <span
                    className={`text-[9.5px] font-mono tracking-widest font-bold uppercase border px-2.5 py-1 rounded leading-none ${
                      analysisResult.verdict === "HIGH RISK"
                        ? "bg-red-500/10 text-red-400 border-red-500/25"
                        : analysisResult.verdict === "MEDIUM RISK"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                    }`}
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
                      ? "text-red-400 font-bold"
                      : "text-emerald-450 font-bold"
                  }
                >
                  {analysisResult.caseFileDetails.recommendingRejection
                    ? "REJECT ROUTE"
                    : "STANDARD PASS"}
                </span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-slate-500 uppercase">Clash Contradictions:</span>
                <span
                  className={
                    analysisResult.contradictions.length > 0
                      ? "text-amber-450 font-bold"
                      : "text-slate-400"
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

          {/* Consolidated Report Body */}
          <div className="flex flex-col gap-6">
            {/* 1. MAPPED CONTRADICTIONS & CLASHING STORY INDICATORS */}
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
                  {analysisResult.contradictions.map((con, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row gap-3 items-start justify-between transition-all duration-300 ${
                        con.severity === "high"
                          ? "bg-red-500/5 border-red-550/20 text-red-100"
                          : con.severity === "medium"
                          ? "bg-amber-500/5 border-amber-550/15 text-amber-100"
                          : "bg-[#0A0A0B]/60 border-white/5"
                      }`}
                    >
                      <div className="space-y-1.5 flex-1 select-text">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[8px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded leading-none font-bold ${
                              con.severity === "high"
                                ? "bg-red-950/85 text-red-400 border border-red-900/30"
                                : con.severity === "medium"
                                ? "bg-amber-955/85 text-amber-400 border border-amber-900/30"
                                : "bg-[#0A0A0B] text-slate-400"
                            }`}
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
                  ))}
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

            {/* 2. DYNAMIC FORENSIC GRAPH database TRAVERSAL MAPPINGS */}
            <div className="bg-[#161618] border border-white/5 p-5 rounded-xl space-y-4">
              <div className="border-b border-white/5 pb-2 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    Section 2: Dossier Relational Graph & Cluster traversal
                  </h4>
                  <p className="text-[9.5px] text-slate-500 font-sans mt-0.5">
                    Click vertices to query extracted metadata and trace connections.
                  </p>
                </div>
                <div className="flex gap-1.5 text-[9.5px] font-mono shrink-0">
                  <span className="bg-slate-900 border border-white/5 px-2 py-0.5 rounded text-slate-400 font-semibold">
                    Nodes: <strong className="text-indigo-400">{analysisResult.graphNodes.length}</strong>
                  </span>
                  <span className="bg-slate-900 border border-white/5 px-2 py-0.5 rounded text-slate-400 font-semibold">
                    Edges: <strong className="text-indigo-400">{analysisResult.graphEdges.length}</strong>
                  </span>
                </div>
              </div>

              {/* Interactive Network Graph render */}
              <div className="bg-black/35 rounded-xl border border-white/5 overflow-hidden">
                <NetworkGraph
                  nodes={analysisResult.graphNodes}
                  edges={analysisResult.graphEdges}
                  onSelectNode={(node) => setSelectedNode(node)}
                />
              </div>

              {/* Node inspector sidebar */}
              <AnimatePresence>
                {selectedNode && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="bg-indigo-950/20 border border-indigo-505/20 rounded-xl p-4 space-y-2 select-text"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                      <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 tracking-wider">
                        Relationship Vertex audited
                      </span>
                      <button
                        onClick={() => setSelectedNode(null)}
                        className="text-slate-500 hover:text-white font-mono text-[10px] cursor-pointer"
                      >
                        [Dismiss]
                      </button>
                    </div>
                    <h5 className="text-xs font-bold text-white select-all">
                      {selectedNode.label}
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {selectedNode.details || "Extracted relation node."}
                    </p>
                    <div className="text-[10px] font-mono text-slate-500 flex gap-4 uppercase font-semibold">
                      <span>
                        Classification: <strong className="text-slate-350">{selectedNode.type}</strong>
                      </span>
                      <span>
                        Audit Status: <strong className="text-indigo-300">{selectedNode.status || "Audited"}</strong>
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. METADATA TAMPERING / LOW RESOLUTION EXIF SIGNATURE SCAN */}
            <div className="bg-[#161618] border border-white/5 p-5 rounded-xl space-y-4">
              <div className="border-b border-white/5 pb-2 flex justify-between items-center">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-400 animate-[pulse_2.1s_infinite]" />
                  Section 3: Digital Forensic raster & metadata signature warnings
                </h4>
                <span className="text-[9.5px] font-mono text-slate-500 font-bold select-none">
                  EXIF integrity checks active
                </span>
              </div>

              {analysisResult.tamperedSignatures.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResult.tamperedSignatures.map((sig, i) => (
                    <div
                      key={i}
                      className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 flex flex-col gap-2 transition-all"
                    >
                      <span className="text-[8.5px] font-mono tracking-widest uppercase font-bold px-1.5 py-0.5 rounded leading-none shrink-0 self-start bg-amber-955 text-amber-400 border border-amber-800/40 font-bold select-none">
                        METADATA CLUE ({sig.confidence}% accuracy)
                      </span>
                      <h5 className="text-xs font-semibold text-slate-200">{sig.signature}</h5>
                      <p className="text-xs text-slate-400 leading-normal font-sans">
                        {sig.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-emerald-555/5 border border-emerald-550/20 rounded-xl p-6 text-center flex flex-col items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-300">
                    EXIF structure clean
                  </h4>
                  <p className="text-xs text-slate-500 font-sans max-w-sm leading-normal">
                    Author tools, coordinate frames, digital font weights, and resolution indicators
                    are verified standard.
                  </p>
                </div>
              )}
            </div>

            {/* 4. EXECUTIVE COMPLIANCE ACTION CONSOLE (RBI STamps compliance & Download anchor) */}
            <div className="bg-[#161618] border border-white/5 p-5 rounded-xl space-y-4">
              <div className="border-b border-white/5 pb-2 flex justify-between items-center">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-indigo-400" />
                  Section 4: Executive Compliance Directives & Action logs
                </h4>
                <span className="text-[9.5px] font-mono text-slate-500 font-bold leading-none select-none">
                  RBI Guidelines check
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/35 border border-white/5 rounded-lg p-3.5 space-y-1 select-all">
                  <span className="text-slate-500 block text-[8px] tracking-wider uppercase font-bold font-mono">
                    Recommended Compliance Action
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
                    {analysisResult.caseFileDetails.bankActionRequired}
                  </p>
                </div>

                <div className="bg-black/35 border border-white/5 rounded-lg p-3.5 space-y-1 select-all">
                  <span className="text-slate-500 block text-[8px] tracking-wider uppercase font-bold font-mono">
                    Governing Legal Notice Circular
                  </span>
                  <p className="text-xs text-slate-350 leading-relaxed font-sans">
                    {analysisResult.caseFileDetails.rbiComplianceWarning}
                  </p>
                </div>
              </div>

              {/* Operation Actions row buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
                      JSON.stringify(analysisResult, null, 2)
                    )}`;
                    const downloadAnchor = document.createElement("a");
                    downloadAnchor.setAttribute("href", jsonString);
                    downloadAnchor.setAttribute("download", `RAVEN_RelationAudit_Registry.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto bg-indigo-650 hover:bg-indigo-755 cursor-pointer text-white text-[10.5px] font-mono tracking-widest uppercase font-bold px-4 py-2.5 rounded transition shadow shadow-indigo-950/20"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-200" />
                  Download Case File JSON
                </button>

                <button
                  onClick={() => {
                    const reportText = `[RAVEN RELATIONAL AUDIT REPORT]\nVerdict: ${analysisResult.verdict}\nDeficit risk rating: ${analysisResult.score}/100\nCore Summary: ${analysisResult.summary}\nRBI compliant warning: ${analysisResult.caseFileDetails.rbiComplianceWarning}\nImmediate underwriter duty: ${analysisResult.caseFileDetails.bankActionRequired}`;
                    navigator.clipboard.writeText(reportText);
                    alert("Official Case File data copied successfully to clipboard!");
                  }}
                  className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto bg-[#0a0a0b] border border-white/5 hover:bg-black hover:border-white/10 cursor-pointer text-slate-300 text-[10.5px] font-mono tracking-widest uppercase font-bold px-4 py-2.5 rounded transition"
                >
                  <Check className="w-4 h-4 text-emerald-400 animate-[bounce_1.5s_infinite]" />
                  Copy Audit Report text
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#161618] border border-white/5 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[500px]">
          <Database className="w-10 h-10 text-slate-650 animate-pulse" />
          <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mt-4">
            Workspace Awaiting Active Scan
          </h3>
          <p className="text-xs text-slate-500 font-sans mt-2">
            Adjust agent directives on the left and trigger verification to run sweeps.
          </p>
        </div>
      )}

      {errorText && (
        <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-lg flex items-center gap-2 text-xs font-mono text-red-400 select-text">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorText}</span>
        </div>
      )}
    </section>
  );
}