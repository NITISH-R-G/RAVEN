import { Dispatch, SetStateAction } from "react";
import { Database, FileText, Briefcase, Sparkles } from "lucide-react";
import { DocumentItem } from "../types";
import { DocumentUploader } from "./DocumentUploader";
import { WebFingerprint } from "../utils/fingerprint";
import { INITIAL_DEMO_DOCUMENTS } from "../constants/documents";

interface SidebarProps {
  documentsState: DocumentItem[];
  setDocumentsState: Dispatch<SetStateAction<DocumentItem[]>>;
  activeDocTab: string;
  setActiveDocTab: Dispatch<SetStateAction<string>>;
  handleDocumentContentChange: (docId: string, newContent: string) => void;
  handleDocumentIngested: (newDoc: DocumentItem) => void;
  managedAgentId: string;
  setManagedAgentId: Dispatch<SetStateAction<string>>;
  useManagedAgent: boolean;
  setUseManagedAgent: Dispatch<SetStateAction<boolean>>;
  customDirectives: string;
  setCustomDirectives: Dispatch<SetStateAction<string>>;
  engineMode: "gemini" | "local";
  setEngineMode: Dispatch<SetStateAction<"gemini" | "local">>;
  isAnalyzing: boolean;
  triggerVerification: (currentDocs: DocumentItem[], customFpId?: string) => void;
  browserFingerprint: WebFingerprint | null;
  setAnalysisResult: Dispatch<SetStateAction<any>>;
}

export function Sidebar({
  documentsState,
  setDocumentsState,
  activeDocTab,
  setActiveDocTab,
  handleDocumentContentChange,
  handleDocumentIngested,
  managedAgentId,
  setManagedAgentId,
  useManagedAgent,
  setUseManagedAgent,
  customDirectives,
  setCustomDirectives,
  engineMode,
  setEngineMode,
  isAnalyzing,
  triggerVerification,
  browserFingerprint,
  setAnalysisResult
}: SidebarProps) {
  const activeDocObj = documentsState.find((d) => d.id === activeDocTab);

  return (
    <section className="lg:col-span-5 flex flex-col gap-4 min-h-0 lg:overflow-y-auto pr-1">
      {/* Card: File upload & OCR Sandbox text-editor */}
      <div className="bg-[#161618] border border-white/5 rounded-xl p-5 flex flex-col md:min-h-[460px] max-h-[820px] shrink-0">
        <div className="border-b border-white/5 pb-2.5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-mono font-bold tracking-widest text-[#94a3b8] uppercase">
              Dossier Document Sandbox & OCR Workspace
            </h3>
          </div>
          <span className="text-[9px] font-mono bg-indigo-500/10 border border-indigo-550/10 px-2 py-0.5 rounded text-indigo-450 uppercase font-bold">
            Local Vault
          </span>
        </div>

        <div className="mt-3 shrink-0">
          <DocumentUploader onDocumentIngested={handleDocumentIngested} />
        </div>

        {/* Document list tabs */}
        <div className="flex flex-wrap gap-1 mt-3 bg-[#0A0A0B] border border-white/5 p-1 rounded-md shrink-0">
          {documentsState.map((doc) => {
            const isActive = activeDocTab === doc.id;
            return (
              <button
                key={doc.id}
                onClick={() => setActiveDocTab(doc.id)}
                className={`px-3 py-1.5 text-[9.5px] font-mono rounded transition-all leading-none ${
                  isActive
                    ? "bg-[#161618] text-white border border-white/5 shadow-sm"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                }`}
              >
                {doc.name.slice(0, 18)}
              </button>
            );
          })}
        </div>

        {/* Document editor container */}
        {activeDocObj ? (
          <div className="mt-4 flex-1 flex flex-col gap-3 min-h-0">
            <div className="grid grid-cols-2 gap-2 bg-[#0A0A0B] border border-white/5 p-2 rounded-lg text-[9.5px] font-mono text-slate-500 shrink-0">
              <div>
                <span className="block text-slate-500 gap-1">Category & Subsystem:</span>
                <span className="text-slate-300 font-bold">{activeDocObj.type}</span>
              </div>
              <div>
                <span className="block text-slate-500">EXIF Author Trace:</span>
                <span
                  className={`font-bold uppercase ${
                    activeDocObj.metadata?.authorTool?.includes("Canva") ||
                    activeDocObj.metadata?.authorTool?.includes("Adobe")
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {activeDocObj.metadata?.authorTool || "Standard Portal"}
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 relative">
              <span className="text-[8px] font-mono uppercase tracking-wider text-slate-500 absolute top-2 right-3 z-10 select-none bg-black/45 border border-white/5 p-1 rounded opacity-60">
                Editable OCR Draft Layout
              </span>
              <textarea
                value={activeDocObj.content}
                onChange={(e) => handleDocumentContentChange(activeDocObj.id, e.target.value)}
                className="w-full flex-1 bg-[#0A0A0B] border border-white/5 text-slate-350 text-xs font-mono p-3 focus:outline-none focus:border-indigo-500/40 rounded-lg resize-none leading-relaxed overflow-y-auto selection:bg-indigo-650"
                placeholder="Document OCR output text payload..."
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 font-mono mt-8">
            <FileText className="w-10 h-10 text-slate-700 animate-pulse" />
            <p className="text-[10px] uppercase mt-2">Dossier Workspace is Empty</p>
            <p className="text-[9px] text-slate-500 text-center max-w-xs mt-1">
              Upload files or click 'Reset Default templates' to prepopulate core evaluation files.
            </p>
          </div>
        )}
      </div>

      {/* Card: Managed AI Security Agent Configuration */}
      <div className="bg-[#161618] border border-white/5 p-5 rounded-xl flex flex-col gap-4 shrink-0">
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
          <h2 className="text-[#94a3b8] text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 leading-none">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            Managed Auditor Agent Setup
          </h2>
          <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded text-[9.5px] font-mono text-indigo-400 uppercase font-bold leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 animate-ping"></span>
            Agent Ready
          </div>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 font-semibold text-[10px] uppercase">
              Agent System Identifier
            </label>
            <input
              type="text"
              value={managedAgentId}
              onChange={(e) => setManagedAgentId(e.target.value)}
              className="bg-black/45 border border-white/5 px-3 py-2 rounded font-sans text-xs text-white uppercase tracking-wider focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-slate-400 font-semibold text-[10px] uppercase">
                Custom Sweep Directives & Skills
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  id="agentToggle"
                  checked={useManagedAgent}
                  onChange={(e) => setUseManagedAgent(e.target.checked)}
                  className="accent-indigo-550 w-3.5 h-3.5 cursor-pointer"
                />
                <label
                  htmlFor="agentToggle"
                  className="text-indigo-400 font-bold text-[9px] uppercase cursor-pointer select-none"
                >
                  Agentic Overlay Active
                </label>
              </div>
            </div>
            <textarea
              rows={3}
              value={customDirectives}
              onChange={(e) => setCustomDirectives(e.target.value)}
              className="bg-black/45 border border-white/5 px-3 py-2 rounded font-sans text-xs text-slate-300 leading-normal resize-none focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5 pt-1 border-t border-white/5">
            <div className="flex justify-between items-center">
              <label className="text-slate-400 font-semibold text-[10px] uppercase">
                Sweep Analytics Engine
              </label>
              <span className="text-[9px] text-[#94a3b8] font-mono leading-none">
                {engineMode === "gemini" ? "⚡ AI Cloud" : "⚙️ Local Offline"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 bg-black/50 p-1 rounded border border-white/5 font-mono text-[10px]">
              <button
                type="button"
                onClick={() => {
                  setEngineMode("gemini");
                  localStorage.setItem("raven_engine_mode", "gemini");
                }}
                className={`py-1.5 rounded transition font-bold uppercase relative ${
                  engineMode === "gemini"
                    ? "bg-indigo-600 text-white shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Gemini Core
              </button>
              <button
                type="button"
                onClick={() => {
                  setEngineMode("local");
                  localStorage.setItem("raven_engine_mode", "local");
                }}
                className={`py-1.5 rounded transition font-bold uppercase relative ${
                  engineMode === "local"
                    ? "bg-slate-700 text-white shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Local Heuristic
              </button>
            </div>
          </div>
        </div>

        {/* Run Relational Sweep operations bar */}
        <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
          <button
            onClick={() => {
              setDocumentsState(INITIAL_DEMO_DOCUMENTS);
              setActiveDocTab("doc-itr");
              triggerVerification(INITIAL_DEMO_DOCUMENTS, browserFingerprint?.id);
            }}
            className="bg-black/45 hover:bg-black/60 border border-white/5 text-[10.5px] font-mono py-2 rounded text-slate-400 hover:text-white transition uppercase font-semibold"
            title="Clears customized text values and restores initial sandbox defaults"
          >
            Reset Default templates
          </button>
          <button
            onClick={() => {
              setDocumentsState([]);
              setActiveDocTab("");
              setAnalysisResult(null);
            }}
            className="bg-red-950/15 hover:bg-red-950/30 border border-red-500/15 text-[10.5px] font-mono py-2 rounded text-red-300 hover:text-red-200 transition uppercase font-semibold"
            title="Deletes all draft and customized files completely"
          >
            Clear Workspace files
          </button>
        </div>

        <button
          onClick={() => triggerVerification(documentsState, browserFingerprint?.id)}
          disabled={isAnalyzing || documentsState.length === 0}
          className={`w-full py-2.5 rounded font-mono text-xs tracking-widest uppercase font-bold text-white transition flex items-center justify-center gap-1.5 shadow-md ${
            isAnalyzing || documentsState.length === 0
              ? "bg-slate-850 border border-white/5 text-slate-500 cursor-not-allowed"
              : "bg-indigo-650 hover:bg-indigo-750 cursor-pointer shadow-indigo-950/30"
          }`}
        >
          <Sparkles className="w-4 h-4 animate-spin text-indigo-300" />
          {isAnalyzing ? "Executing Multi-Doc verification..." : "Execute Managed Agentic Sweep"}
        </button>
      </div>
    </section>
  );
}
