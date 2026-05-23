/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  Fingerprint, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  Check, 
  Download, 
  Scale, 
  Database,
  Clock,
  Briefcase,
  Terminal,
  Activity,
  Award,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { computeBrowserFingerprint, WebFingerprint, getFingerprintJSVisitorId } from "./utils/fingerprint";
import { DocumentItem, AnalysisResult, GraphNode } from "./types";
import { NetworkGraph } from "./components/NetworkGraph";
import { DocumentUploader } from "./components/DocumentUploader";

export const INITIAL_DEMO_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-itr",
    name: "ITR_Declaration_FY26.txt",
    type: "ITR",
    content: `INCOME TAX RETURN DEPT OF INDIA (ITR-1 SAHAJ)
FILING YEAR: 2026-27 | PAN: APXPK9821L
NAME: RAJESH KUMAR
ADDRESS: FLAT 402, GREEN GLEN LAYOUT, BELANDUR, BANGALORE - 560103
GROSS TOTAL INCOME: INR 45,00,000
EMPLOYMENT STATUS: PRIVATE SECTOR CO.
EMPLOYER NAME: APEX DIGITAL SOLUTIONS PVT LTD`,
    metadata: {
      fileSize: "142 KB",
      createdDate: "2026-05-12 14:22:10",
      authorTool: "IT-FILING-PORTAL-OFFICIAL",
      dpiCheck: "300 DPI",
      fontsPercent: "100% Embedded"
    }
  },
  {
    id: "doc-slip",
    name: "Enterprise_Salary_Slip_April2026.txt",
    type: "SALARY_SLIP",
    content: `SALARY STATEMENT FOR MONTH OF APRIL 2026
EMPLOYEE CODE: EMP-88120 || NAME: RAJESH KUMAR
EMPLOYER: APEX TECH SOLUTIONS LTD (Discrepancy: Tax ITR says Digital Solutions!)
GROSS SALARY: INR 1,20,000 / Month (Annualised: INR 14,40,000 - Discrepancy with 45L declared income!)
NET PAYABLE CREDIT: INR 1,12,050`,
    metadata: {
      fileSize: "88 KB",
      createdDate: "2026-05-11 18:05:44",
      authorTool: "Canva Pro PDF Exporter (Tampered!)",
      dpiCheck: "96 DPI (Web low resolution anomaly)",
      fontsPercent: "Not Embedded"
    }
  },
  {
    id: "doc-deed",
    name: "Property_Registry_Deed_B402.txt",
    type: "PROPERTY_VALUATION",
    content: `REGISTRATION & STAMPS DEPT, GOVT OF KARNATAKA
PROPERTY DEED & VALUATION REPORT // REFS-55102BA
B-402, GREEN GLEN LAYOUT, BELANDUR, BANGALORE - 560103
VALUATION AMOUNT: INR 1,80,000,000
MORTGAGE REGISTERED DATE: 12-MAY-2026 (Double mortgage flagged - State logs check concurrent lien filed at Canara Bank within the exact same week)
OWNER: RAJESH KUMAR`,
    metadata: {
      fileSize: "220 KB",
      createdDate: "2026-05-12 11:30:00",
      authorTool: "e-Registration Portal (State)",
      dpiCheck: "300 DPI",
      fontsPercent: "100% Embedded"
    }
  },
  {
    id: "doc-devices",
    name: "Session_Fingerprint_DeviceLogs.txt",
    type: "ID_PROOF",
    content: `CO-APPLICANT SUBMISSION RECORDS:
NAME: SURESH KUMAR
RELATION: CO-APPLICANT (Rajesh's Brother)
ADDRESS CLAIMED: FLAT 402, GREEN GLEN LAYOUT, BANGALORE
DEVICE ID: CanvasFingerprint:fp-88a29b4e (Collision detected with Rajesh Kumar device footprint fp-88a29b4e!)
SESSION IP: 103.210.43.12 (VPN commercial proxy node)
SUBMISSION TIMELINE: Parallel submissions sent exactly 4 minutes apart.`,
    metadata: {
      fileSize: "12 KB",
      createdDate: "2026-05-23 09:04:10",
      authorTool: "RAVEN-Log-Tracker-SDK"
    }
  }
];

export default function App() {
  const [documentsState, setDocumentsState] = useState<DocumentItem[]>(INITIAL_DEMO_DOCUMENTS);
  const [activeDocTab, setActiveDocTab] = useState<string>("doc-itr");
  const [browserFingerprint, setBrowserFingerprint] = useState<WebFingerprint | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  
  // High-fidelity multi-stage loading trackers
  const [activeStageId, setActiveStageId] = useState<number>(0);
  const [stageOutputs, setStageOutputs] = useState<{ [key: number]: string }>({
    1: "Awaiting workspace signal...",
    2: "Awaiting workspace signal...",
    3: "Awaiting workspace signal...",
    4: "Awaiting workspace signal..."
  });
  
  const [useManagedAgent, setUseManagedAgent] = useState<boolean>(true);
  const [managedAgentId, setManagedAgentId] = useState<string>("raven-coherence-auditor");
  const [customDirectives, setCustomDirectives] = useState<string>(
    "Cross-verify applicant tax dossiers collectively, audit core employer mismatch parameters, trace duplicate device IDs, and run topological DFS traversals."
  );
  
  const [engineMode, setEngineMode] = useState<"gemini" | "local">(() => {
    return (localStorage.getItem("raven_engine_mode") as "gemini" | "local") || "gemini";
  });

  useEffect(() => {
    const fp = computeBrowserFingerprint();
    setBrowserFingerprint(fp);

    getFingerprintJSVisitorId().then(visitorId => {
      let activeFp = fp;
      if (visitorId) {
        activeFp = {
          ...fp,
          fpjsVisitorId: visitorId,
          id: `fp-${visitorId.slice(0, 8)}`
        };
        setBrowserFingerprint(activeFp);
      }
      
      const updatedDocs = INITIAL_DEMO_DOCUMENTS.map(doc => {
        if (doc.id === "doc-devices" && activeFp) {
          return {
            ...doc,
            content: doc.content.replace("fp-88a29b4e", activeFp.id)
          };
        }
        return doc;
      });
      setDocumentsState(updatedDocs);
      // Avoid auto-triggering verification on mount
    });
  }, []);

  const triggerVerification = async (currentDocs: DocumentItem[], customFpId?: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setErrorText("");
    setSelectedNode(null);
    setActiveStageId(1);
    setStageOutputs({
      1: "Synthesizing raw dossiers and optical alignment tags...",
      2: "Waiting for Ingestion layer authorization...",
      3: "Waiting for Coherence index calculation...",
      4: "Waiting for Executive compliance compilation..."
    });

    const deviceFingerprintId = customFpId || browserFingerprint?.id || "fp-tester";
    const activeEngine = localStorage.getItem("raven_engine_mode") || engineMode || "gemini";

    try {
      const formData = new FormData();
      currentDocs.forEach((doc) => {
        if (doc.file) {
          formData.append("files", doc.file, doc.name);
        } else {
          const blob = new Blob([doc.content], { type: "text/plain" });
          formData.append("files", blob, doc.name);
        }
      });

      formData.append("useManagedAgent", String(useManagedAgent));
      formData.append("managedAgentId", managedAgentId);
      formData.append("engineMode", activeEngine);
      formData.append("clientFingerprintId", deviceFingerprintId);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });

      const data: AnalysisResult = await response.json();
      
      if (data.aiStatus && !data.aiStatus.success && data.aiStatus.isQuotaExceeded) {
        setEngineMode("local");
        localStorage.setItem("raven_engine_mode", "local");
      }

      if (data.graphNodes) {
        data.graphNodes = data.graphNodes.map(node => {
          if (node.type === "device" && (node.label.includes(deviceFingerprintId) || node.label.includes("Fingerprint"))) {
            return {
              ...node,
              label: `Your Device: ${deviceFingerprintId}`,
              details: `FINGERPRINT MATCHED. Browser fingerprint active on multi-document entries.`
            };
          }
          return node;
        });
      }

      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      // --- LAYER 1 STREAMING TRANSITION ---
      setStageOutputs(prev => ({
        ...prev,
        1: `Scanning ${currentDocs.length} custom user documents... Parsing EXIF metadata and OCR layers...`
      }));
      await delay(1200);

      const mainApplicant = data.extractedEntities?.find(e => e.value.includes("Signee") || e.value.includes("Applicant") || e.value.includes("Owner"))?.entity || "Applicant";
      const layer1Success = `Ingested: Extracted user trace signature of candidate [${mainApplicant}] successfully.`;
      
      setStageOutputs(prev => ({
        ...prev,
        1: layer1Success,
        2: "Running multi-document comparative matrices. Analyzing monthly income & employer clashing structures..."
      }));
      setActiveStageId(2);
      await delay(1400);

      // --- LAYER 2 STREAMING TRANSITION ---
      const contradictionsCount = data.contradictions?.length || 0;
      const layer2Success = contradictionsCount > 0
        ? `Coherence Alert: Highlighted ${contradictionsCount} active clashing claims. Detected '${data.contradictions[0].title}' discrepancies.`
        : "Coherence Balanced: Verified clean income, date registers and address statements without conflicts.";
      
      setStageOutputs(prev => ({
        ...prev,
        2: layer2Success,
        3: "Simulating entity mapping. Translating structural nodes into network vertices..."
      }));
      setActiveStageId(3);
      await delay(1200);

      // --- LAYER 3 STREAMING TRANSITION ---
      const nodeCount = data.graphNodes?.length || 0;
      const edgeCount = data.graphEdges?.length || 0;
      const layer3Success = `Graph Complete: Mapped ${nodeCount} transaction vertices and established ${edgeCount} relationship edges.`;
      
      setStageOutputs(prev => ({
        ...prev,
        3: layer3Success,
        4: "Compiling risk score algorithms, writing legal audit records under RBI regulations..."
      }));
      setActiveStageId(4);
      await delay(1100);

      // --- LAYER 4 STREAMING TRANSITION ---
      const layer4Success = `Compliance Executed: Final threat weight rating compiled at ${data.score}/100. Case dossier ready.`;
      setStageOutputs(prev => ({
        ...prev,
        4: layer4Success
      }));
      await delay(600);

      setAnalysisResult(data);
    } catch (err: any) {
      console.error("Analysis API execution failure:", err);
      setErrorText("Relational sweep execution failed connecting online tools. Please check connection.");
    } finally {
      setIsAnalyzing(false);
      setActiveStageId(0);
    }
  };

  const handleDocumentContentChange = (docId: string, newContent: string) => {
    const updated = documentsState.map(d => {
      if (d.id === docId) {
        return { ...d, content: newContent };
      }
      return d;
    });
    setDocumentsState(updated);
  };

  const handleDocumentIngested = (newDoc: DocumentItem) => {
    const updatedDocs = [...documentsState, newDoc];
    setDocumentsState(updatedDocs);
    setActiveDocTab(newDoc.id);
    triggerVerification(updatedDocs, browserFingerprint?.id);
  };

  const activeDocObj = documentsState.find(d => d.id === activeDocTab);

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#0A0A0B] text-slate-350 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      
      {/* Dynamic Header Row */}
      <header className="border-b border-white/5 bg-[#0A0A0B]/90 backdrop-blur sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded flex items-center justify-center shadow-lg shadow-indigo-950/40">
            <Layers className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-serif text-white italic tracking-tight">
              RAVEN <span className="text-xs font-sans not-italic text-indigo-400 font-semibold uppercase tracking-widest ml-2">Relational Verification Engine</span>
            </h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">
              Self-contained Underwriting Compliance Audit Consolidation
            </p>
          </div>
        </div>

        {/* Precise local client session metrics */}
        <div className="flex flex-wrap items-center gap-4">
          {browserFingerprint && (
            <div className="flex items-center gap-2.5 bg-indigo-500/5 border border-indigo-500/10 rounded-lg px-3.5 py-1.5 text-xs font-mono">
              <Fingerprint className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="text-left">
                <span className="text-slate-500 block text-[8px] uppercase tracking-wider">Device ID Signature</span>
                <span className="text-indigo-300 font-bold">{browserFingerprint.id}</span>
              </div>
              <div className="h-6 w-px bg-white/5 mx-1"></div>
              <div>
                <span className="text-slate-500 block text-[8px] uppercase tracking-wider">Canvas Signature</span>
                <span className="text-slate-400 font-bold">{browserFingerprint.canvasHash.slice(0, 10)}</span>
              </div>
            </div>
          )}
          <div className="px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-indigo-400 text-xs font-mono font-bold uppercase shrink-0">
            Audit terminal Online
          </div>
        </div>
      </header>

      {/* Main relational desktop workspace */}
      <main className="flex-1 p-3 md:p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl w-full mx-auto min-h-0">
        
        {/* LEFT COLUMN: Managed Agent setup & workspace files manager */}
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
                    <span className={`font-bold uppercase ${
                      activeDocObj.metadata?.authorTool?.includes("Canva") || activeDocObj.metadata?.authorTool?.includes("Adobe")
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}>
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
                <p className="text-[9px] text-slate-500 text-center max-w-xs mt-1">Upload files or click 'Reset Default templates' to prepopulate core evaluation files.</p>
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
                <label className="text-slate-400 font-semibold text-[10px] uppercase">Agent System Identifier</label>
                <input 
                  type="text"
                  value={managedAgentId}
                  onChange={(e) => setManagedAgentId(e.target.value)}
                  className="bg-black/45 border border-white/5 px-3 py-2 rounded font-sans text-xs text-white uppercase tracking-wider focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-400 font-semibold text-[10px] uppercase">Custom Sweep Directives & Skills</label>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="checkbox" 
                      id="agentToggle" 
                      checked={useManagedAgent} 
                      onChange={(e) => setUseManagedAgent(e.target.checked)}
                      className="accent-indigo-550 w-3.5 h-3.5 cursor-pointer"
                    />
                    <label htmlFor="agentToggle" className="text-indigo-400 font-bold text-[9px] uppercase cursor-pointer select-none">Agentic Overlay Active</label>
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
                  <label className="text-slate-400 font-semibold text-[10px] uppercase">Sweep Analytics Engine</label>
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

        {/* RIGHT COLUMN: Consolidated, single-screen Agent Verification results without clickable tabs */}
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
                  { id: 1, title: "Layer 1 — Document Ingestion & Optical Scan", desc: "Verifies digital coordinates, raster anomalies & fonts integration." },
                  { id: 2, title: "Layer 2 — Cross-Document Coherence Engine", desc: "Crosschecks financial claims, employer registration indexes & dates." },
                  { id: 3, title: "Layer 3 — Fraud Ring Connection Topography", desc: "Extracts logical nodes and checks shared identifiers/crossovers." },
                  { id: 4, title: "Layer 4 — Compliance Case Compilation", desc: "Applies regulatory compliance weights and drafts actionable directives." }
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
                            <h4 className={`text-xs font-mono font-bold leading-none ${isActive ? "text-indigo-300" : isDone ? "text-emerald-400" : "text-slate-500"}`}>
                              {step.title}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-sans mt-1 leading-normal">{step.desc}</p>
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
                          {!isDone && <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>}
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
                  Tracing ledger entries... {((activeStageId - 1) * 25) || 5}% Complete
                </span>
                <span className="text-slate-600 text-[9px] uppercase tracking-wider">
                  DO NOT CLOSE THIS TERMINAL TAB
                </span>
              </div>
            </div>
          ) : analysisResult ? (
            <div className="flex flex-col gap-6">

              {analysisResult.aiStatus && !analysisResult.aiStatus.success && analysisResult.aiStatus.isQuotaExceeded && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
                  <div className="flex items-center gap-2 text-amber-400">
                    <ShieldAlert className="w-5 h-5 shrink-0 animate-bounce text-amber-500" />
                    <div>
                      <span className="font-bold uppercase block text-[10px]">GEMINI CLOUD QUOTA REACHED (FREE TIER)</span>
                      <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-relaxed">
                        To protect your seamless workflow, the local RAVEN Multi-Document Rule Intelligence dynamic analyzer has compiled this relational graph check instantly with top-tier heuristics.
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded text-amber-300 font-bold self-start sm:self-center shrink-0">
                    Rule Engine Active
                  </span>
                </div>
              )}

              {analysisResult.aiStatus && !analysisResult.aiStatus.success && !analysisResult.aiStatus.isQuotaExceeded && (
                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Sparkles className="w-5 h-5 shrink-0 text-indigo-400 animate-pulse" />
                    <div>
                      <span className="font-bold uppercase block text-[10px]">LOCAL HEURISTICS EXECUTION</span>
                      <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-relaxed">
                        Evaluated using RAVEN's fully optimized multi-document coherence ruleset. Set GEMINI_API_KEY inside Settings drawer to fully enable LLM deep-reasoning tree structures.
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
                        stroke={analysisResult.score > 60 ? "#ef4444" : analysisResult.score > 25 ? "#f59e0b" : "#10b981"}
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - analysisResult.score / 100)}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-2xl font-serif text-white italic leading-none">{analysisResult.score}</span>
                      <p className={`text-[8px] uppercase font-bold tracking-wider leading-none mt-1 ${
                        analysisResult.score > 60 ? "text-red-500" : analysisResult.score > 25 ? "text-amber-500" : "text-emerald-500"
                      }`}>
                        {analysisResult.score > 60 ? "Deficit Risk" : analysisResult.score > 25 ? "Warn Hold" : "Verified Clear"}
                      </p>
                    </div>
                  </div>

                  <div className="text-center sm:text-left">
                    <div className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-start">
                      <span className={`text-[9.5px] font-mono tracking-widest font-bold uppercase border px-2.5 py-1 rounded leading-none ${
                        analysisResult.verdict === "HIGH RISK"
                          ? "bg-red-500/10 text-red-400 border-red-500/25"
                          : analysisResult.verdict === "MEDIUM RISK"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                      }`}>
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
                    <span className={analysisResult.caseFileDetails.recommendingRejection ? "text-red-400 font-bold" : "text-emerald-450 font-bold"}>
                      {analysisResult.caseFileDetails.recommendingRejection ? "REJECT ROUTE" : "STANDARD PASS"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-slate-500 uppercase">Clash Contradictions:</span>
                    <span className={analysisResult.contradictions.length > 0 ? "text-amber-450 font-bold" : "text-slate-400"}>
                      {analysisResult.contradictions.length} flagged
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-slate-500 uppercase">Dossier Vertices:</span>
                    <span className="text-indigo-400 font-bold">{analysisResult.graphNodes.length} mapped</span>
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
                              <span className={`text-[8px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded leading-none font-bold ${
                                con.severity === "high"
                                  ? "bg-red-950/85 text-red-400 border border-red-900/30"
                                  : con.severity === "medium"
                                  ? "bg-amber-955/85 text-amber-400 border border-amber-900/30"
                                  : "bg-[#0A0A0B] text-slate-400"
                              }`}>
                                {con.severity}
                              </span>
                              <span className="text-xs font-semibold text-white">{con.title}</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed font-sans">{con.description}</p>
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
                      <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-300">Coherence alignment verified</h4>
                      <p className="text-xs text-slate-500 font-sans max-w-sm leading-relaxed">
                        Income margins, corporate PAN hashes, listed guarantor files, and locations align precisely without cross-document contradictions.
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
                      <p className="text-[9.5px] text-slate-500 font-sans mt-0.5">Click vertices to query extracted metadata and trace connections.</p>
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
                        <h5 className="text-xs font-bold text-white select-all">{selectedNode.label}</h5>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedNode.details || "Extracted relation node."}</p>
                        <div className="text-[10px] font-mono text-slate-500 flex gap-4 uppercase font-semibold">
                          <span>Classification: <strong className="text-slate-350">{selectedNode.type}</strong></span>
                          <span>Audit Status: <strong className="text-indigo-300">{selectedNode.status || "Audited"}</strong></span>
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
                        <div key={i} className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 flex flex-col gap-2 transition-all">
                          <span className="text-[8.5px] font-mono tracking-widest uppercase font-bold px-1.5 py-0.5 rounded leading-none shrink-0 self-start bg-amber-955 text-amber-400 border border-amber-800/40 font-bold select-none">
                            METADATA CLUE ({sig.confidence}% accuracy)
                          </span>
                          <h5 className="text-xs font-semibold text-slate-200">{sig.signature}</h5>
                          <p className="text-xs text-slate-400 leading-normal font-sans">{sig.explanation}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-emerald-555/5 border border-emerald-550/20 rounded-xl p-6 text-center flex flex-col items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-300">EXIF structure clean</h4>
                      <p className="text-xs text-slate-500 font-sans max-w-sm leading-normal">
                        Author tools, coordinate frames, digital font weights, and resolution indicators are verified standard.
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
                      <span className="text-slate-500 block text-[8px] tracking-wider uppercase font-bold font-mono">Recommended Compliance Action</span>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
                        {analysisResult.caseFileDetails.bankActionRequired}
                      </p>
                    </div>
                    
                    <div className="bg-black/35 border border-white/5 rounded-lg p-3.5 space-y-1 select-all">
                      <span className="text-slate-500 block text-[8px] tracking-wider uppercase font-bold font-mono">Governing Legal Notice Circular</span>
                      <p className="text-xs text-slate-350 leading-relaxed font-sans">
                        {analysisResult.caseFileDetails.rbiComplianceWarning}
                      </p>
                    </div>
                  </div>

                  {/* Operation Actions row buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => {
                        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(analysisResult, null, 2))}`;
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
              <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mt-4">Workspace Awaiting Active Scan</h3>
              <p className="text-xs text-slate-500 font-sans mt-2">Adjust agent directives on the left and trigger verification to run sweeps.</p>
            </div>
          )}

          {errorText && (
            <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-lg flex items-center gap-2 text-xs font-mono text-red-400 select-text">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorText}</span>
            </div>
          )}

        </section>

      </main>

      {/* Persistent footer */}
      <footer className="border-t border-white/5 bg-[#0A0A0B] px-6 py-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 font-mono text-[9px] text-slate-500 select-none">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            <span>RAVEN Relational Gated Network Suite v2.2 (Google AI Studio)</span>
          </div>
          <div className="text-indigo-400/70 uppercase tracking-widest font-bold flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            <span>Optimal Agentic Coherence Traversal Mode</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
