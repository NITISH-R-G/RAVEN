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
  Building, 
  MapPin, 
  User, 
  Smartphone, 
  AlertTriangle, 
  Search, 
  Sparkles, 
  RefreshCw, 
  FileText, 
  Check, 
  ExternalLink, 
  Eye, 
  BookOpen, 
  Download, 
  Scale, 
  Database,
  Info,
  Clock,
  Briefcase,
  Layers3,
  Terminal,
  FileSpreadsheet
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { computeBrowserFingerprint, WebFingerprint, getFingerprintJSVisitorId } from "./utils/fingerprint";
import { CaseStudy, DocumentItem, AnalysisResult, GraphNode } from "./types";
import { NetworkGraph } from "./components/NetworkGraph";
import { DocumentUploader } from "./components/DocumentUploader";
import { GraphDatabase, TraversalReport } from "./utils/graphDB";
import { NLPDocumentExtractor } from "./components/NLPDocumentExtractor";
import { ManagedAgentBuilder } from "./components/ManagedAgentBuilder";

export default function App() {
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
  const [documentsState, setDocumentsState] = useState<DocumentItem[]>([]);
  const [activeDocTab, setActiveDocTab] = useState<string>("");
  const [browserFingerprint, setBrowserFingerprint] = useState<WebFingerprint | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [useManagedAgent, setUseManagedAgent] = useState<boolean>(true);
  const [managedAgentId, setManagedAgentId] = useState<string>("raven-coherence-auditor");
  
  // Workspace UI Layout Tabs
  const [activeAnalysisLayer, setActiveAnalysisLayer] = useState<number>(2); // Default to Layer 2: Coherence Checks

  // 1. Initialise and load cases, and calculate local Browser Fingerprint (using fingerprintjs mechanism)
  useEffect(() => {
    // Generate standard local specifications on mount
    const fp = computeBrowserFingerprint();
    setBrowserFingerprint(fp);

    // Try asynchronous loading of FingerprintJS high-precision visitor ID
    getFingerprintJSVisitorId().then(visitorId => {
      if (visitorId) {
        setBrowserFingerprint(prev => prev ? {
          ...prev,
          fpjsVisitorId: visitorId,
          id: `fp-${visitorId.slice(0, 8)}`
        } : null);
      }
    });

    // Fetch cases from server
    fetch("/api/cases")
      .then(res => res.json())
      .then((data: CaseStudy[]) => {
        setCases(data);
        if (data.length > 0) {
          selectCaseStudy(data[0], fp);
        }
      })
      .catch(err => {
        console.error("Failed to load mock cases from server:", err);
        setErrorText("Network connection issues. Fallbacks loaded.");
      });
  }, []);

  const selectCaseStudy = (cs: CaseStudy, currentFp?: WebFingerprint) => {
    setSelectedCase(cs);
    
    // Create a copy of documents to allow on-the-fly editing
    const docCopies = cs.documents.map(doc => {
      // If we are on Bangalore case (Case 1), we dynamic override Suresh's application device id with the current computed canvas fingerprint ID
      // This spectacularly links the real browser fingerprint of the test runner to the fraud ring!
      if (cs.id === "case-bangalore-double-mortgage" && doc.id === "doc-fingerprint-track" && currentFp) {
        return {
          ...doc,
          content: doc.content.replace("fp-88a29b4e", currentFp.id)
        };
      }
      return { ...doc };
    });

    setDocumentsState(docCopies);
    if (docCopies.length > 0) {
      setActiveDocTab(docCopies[0].id);
    }
    
    // Direct trigger immediate analysis
    triggerVerification(cs.id, docCopies, currentFp?.id);
  };

  // Custom document editing handler to sandbox clashing values
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

    // Auto-analyze immediately to check for coherence and build graph clusters
    triggerVerification(selectedCase?.id || "custom-upload", updatedDocs, browserFingerprint?.id);
  };

  // 2. Main Trigger Verification function
  const triggerVerification = async (caseId: string, currentDocs: DocumentItem[], customFpId?: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setErrorText("");
    setSelectedNode(null);

    const deviceFingerprintId = customFpId || browserFingerprint?.id || "fp-tester";

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          documents: currentDocs,
          clientFingerprintId: deviceFingerprintId,
          useManagedAgent,
          managedAgentId
        })
      });

      const data: AnalysisResult = await response.json();
      
      // Override Suresh's fraud device node label in Layer 3 graph if we injected our client browser fingerprint
      if (caseId === "case-bangalore-double-mortgage" && data.graphNodes) {
        data.graphNodes = data.graphNodes.map(node => {
          if (node.id === "node-fp-device") {
            return {
              ...node,
              label: `Your Local Fingerprint: ${deviceFingerprintId}`,
              details: `FINGERPRINT MATCHED. This browser/device executed multiple applications under Rajesh and Suresh Kumar PANs. (canvasHash: ${browserFingerprint?.canvasHash || "Calculated"})`
            };
          }
          return node;
        });
      }

      setAnalysisResult(data);
    } catch (err: any) {
      console.error("Analysis api error:", err);
      setErrorText("Gemini evaluation error. Loaded structural heuristics instead.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const activeDocObj = documentsState.find(d => d.id === activeDocTab);
  
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-300 flex flex-col font-sans selection:bg-indigo-505/30 selection:text-white">
      {/* 1. Header Navigation Panel */}
      <header className="border-b border-white/10 bg-[#0A0A0B]/90 backdrop-blur sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded flex items-center justify-center shadow-lg shadow-indigo-950/40">
            <Layers className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-serif text-white italic tracking-tight">
              RAVEN <span className="text-xs font-sans not-italic text-indigo-400 font-semibold uppercase tracking-widest ml-2">Relational Verification Engine</span>
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              Google I/O Hackathon • San Francisco Chapter • Active Hub
            </p>
          </div>
        </div>

        {/* Browser Fingerprint Header badge */}
        <div className="flex flex-wrap items-center gap-4">
          {browserFingerprint && (
            <div className="flex items-center gap-2.5 bg-indigo-500/5 border border-indigo-500/20 rounded-lg px-3.5 py-1.5 text-xs font-mono select-none">
              <Fingerprint className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="text-left">
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Device Fingerprint ID</span>
                <span className="text-indigo-300 font-bold">{browserFingerprint.id}</span>
              </div>
              <div className="h-6 w-px bg-white/10 mx-1"></div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Canvas Signature</span>
                <span className="text-slate-400 font-bold">{browserFingerprint.canvasHash.slice(0, 10)}</span>
              </div>
            </div>
          )}
          <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded text-indigo-400 text-xs font-bold uppercase shrink-0">
            Terminal Online
          </div>
        </div>
      </header>

      {/* Main Workspace Layout (Two Big Columns) */}
      <main className="flex-1 p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl w-full mx-auto">
        
        {/* LEFT COLUMN: Controls, Documents OCR Editor, Custom Sandbox Case Selection (Grid size 5) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Card: Session Control Center */}
          <div className="bg-[#161618] border border-white/5 p-5 rounded-xl shrink-0 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[#94a3b8] text-[10.5px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 leading-none select-none">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                Active Relational Session
              </h2>
              <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded text-[9.5px] font-mono text-indigo-400 uppercase font-bold leading-none select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                Ready
              </div>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Compare independent applicant files, property deeds, and device footprints collectively. RAVEN uncovers hidden network links and financial inflation anomalies hidden cross-document.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="bg-[#0A0A0B]/60 border border-white/5 rounded-lg p-2.5">
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-mono">WORKSPACE STATE</span>
                <span className="text-[11px] font-mono font-bold text-emerald-450">SECURE HUB</span>
              </div>
              <div className="bg-[#0A0A0B]/60 border border-white/5 rounded-lg p-2.5">
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-mono">AUDIT SCOPE</span>
                <span className="text-[11px] font-mono font-bold text-indigo-300">MULTI-DOC RELATION</span>
              </div>
            </div>

            <div className="flex gap-2 mt-1">
              <button
                onClick={() => {
                  // Reset to standard workspace documents
                  if (cases.length > 0) {
                    selectCaseStudy(cases[0], browserFingerprint || undefined);
                  }
                }}
                className="flex-1 bg-black/45 hover:bg-black/60 border border-white/5 text-[10.5px] font-mono py-1.5 rounded text-slate-350 hover:text-white transition uppercase font-semibold"
                title="Restores the initial sample verification documents"
              >
                Reset Defaults
              </button>
              <button
                onClick={() => {
                  // Clear everything to build entirely from scratch!
                  setDocumentsState([]);
                  setActiveDocTab("");
                  setAnalysisResult(null);
                }}
                className="flex-1 bg-red-950/20 hover:bg-red-950/35 border border-red-500/15 text-[10.5px] font-mono py-1.5 rounded text-red-300 hover:text-red-200 transition uppercase font-semibold"
                title="Clears all active loaded files"
              >
                Clear Docs
              </button>
            </div>
          </div>

          {/* Card: Bank Ingested OCR Sandbox (Simulates Layer 1 Extraction of raw texts) */}
          {selectedCase && (
            <div className="bg-[#161618] border border-white/5 rounded-xl p-5 flex-1 flex flex-col min-h-[420px] max-h-[820px]">
              <div className="border-b border-white/5 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-mono font-bold tracking-widest text-slate-300 uppercase">
                    Layer 1 Document Ingestion & OCR Sandbox
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded px-2.5 py-0.5 text-[10px] font-mono text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  Extract Clean
                </div>
              </div>

              {/* Interactive FineUploader Drag & Drop Area */}
              <div className="mt-3 shrink-0">
                <DocumentUploader onDocumentIngested={handleDocumentIngested} />
              </div>

              {/* Sub tabs for documents */}
              <div className="flex flex-wrap gap-1 mt-3 bg-[#0A0A0B] border border-white/5 p-1 rounded-md shrink-0">
                {documentsState.map((doc) => {
                  const isActive = activeDocTab === doc.id;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setActiveDocTab(doc.id)}
                      className={`px-3 py-1.5 text-[10px] font-mono font-medium rounded transition-all leading-none ${
                        isActive
                          ? "bg-[#161618] text-white border border-white/5 shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-[#161618]/40"
                      }`}
                    >
                      {doc.name.slice(0, 18)}
                    </button>
                  );
                })}
              </div>

              {/* Document Display Sandbox body */}
              {activeDocObj ? (
                <div className="mt-4 flex-1 flex flex-col gap-3 min-h-0">
                  {/* Doc Metadata Indicators */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-[#0A0A0B] border border-white/5 p-2.5 rounded-lg text-[10px] font-mono text-slate-400 shrink-0">
                    <div>
                      <span className="text-slate-500 uppercase block text-[8px] tracking-wide">Category</span>
                      <span className="text-indigo-400 font-medium">{activeDocObj.type}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase block text-[8px] tracking-wide">Author Tool (EXIF)</span>
                      <span className={`font-medium ${
                        activeDocObj.metadata?.authorTool?.includes("Adobe") || activeDocObj.metadata?.authorTool?.includes("Canva")
                          ? "text-amber-400" 
                          : "text-slate-300"
                      }`}>
                        {activeDocObj.metadata?.authorTool || "Portal Server"}
                      </span>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <span className="text-slate-500 uppercase block text-[8px] tracking-wide">Embedded Fonts</span>
                      <span className="text-slate-300 font-medium">{activeDocObj.metadata?.fontsPercent || "N/A"}</span>
                    </div>
                  </div>

                  {/* Editable OCR text canvas */}
                  <div className="flex-1 flex flex-col min-h-0 relative group">
                    <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-350 z-10 flex items-center gap-1.5 bg-[#0A0A0B] border border-white/5 rounded px-2 py-1 text-[9px] font-mono text-slate-400 pointer-events-none">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                      Live Sandbox Editor
                    </div>
                    
                    <textarea
                      value={activeDocObj.content}
                      onChange={(e) => handleDocumentContentChange(activeDocObj.id, e.target.value)}
                      className="w-full flex-1 bg-[#0A0A0B] text-slate-300 font-mono text-xs p-4 rounded-lg border border-white/5 focus:outline-none focus:border-indigo-500/30 focus:ring-1 focus:ring-indigo-500/20 resize-none leading-relaxed overflow-y-auto"
                      placeholder="Paste raw OCR text representing document disclosures..."
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0A0A0B]/45 border border-white/5 p-3 rounded-lg shrink-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <label 
                        className={`flex items-center gap-2 cursor-pointer text-[10.5px] font-mono font-bold uppercase select-none border rounded px-3 py-1.5 transition-all ${
                          useManagedAgent 
                            ? "bg-indigo-950/30 text-indigo-300 border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.08)]" 
                            : "bg-black/40 text-slate-500 border-white/5"
                        }`}
                        title="Toggles verification via persistent Gemini API Managed Agent"
                      >
                        <input
                          type="checkbox"
                          checked={useManagedAgent}
                          onChange={(e) => setUseManagedAgent(e.target.checked)}
                          className="rounded border-white/10 bg-black text-indigo-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                        />
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>Managed Agent Engine</span>
                      </label>

                      {useManagedAgent && (
                        <div className="flex items-center gap-1.5 bg-black/60 border border-indigo-900/40 px-2 py-1 rounded text-[9px] font-mono text-indigo-350 italic">
                          <span>Agent ID: {managedAgentId}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => triggerVerification(selectedCase.id, documentsState, browserFingerprint?.id)}
                      disabled={isAnalyzing}
                      className="inline-flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-750 disabled:bg-slate-800 text-white text-[11px] font-mono tracking-widest uppercase font-bold px-4 py-2 rounded transition shadow-md shadow-indigo-950/30 shrink-0 select-none"
                    >
                      {isAnalyzing ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                      )}
                      Analyze Story
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                  <FileText className="w-12 h-12" />
                  <p className="text-xs font-sans mt-2">No documents ingested for this sandbox</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: RAVEN 4 Layers analysis and graphs (Grid size 7) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Section: Risk Score summary card */}
          {isAnalyzing ? (
            <div className="bg-[#161618] border border-white/5 rounded-xl p-8 flex flex-col items-center justify-center min-h-[500px]">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-white/5 border-t-indigo-600 rounded-full animate-spin"></div>
                <Layers className="w-6 h-6 text-indigo-400 absolute animate-[pulse_1.5s_infinite]" />
              </div>
              <h3 className="text-sm font-mono tracking-widest text-slate-350 uppercase mt-5">
                Ingesting Application Documents collectively...
              </h3>
              <p className="text-xs text-slate-500 font-mono tracking-wider mt-2 max-w-sm text-center">
                Querying logical consistency models & tracing entity nodes under Gemini 3.5 Flash...
              </p>
            </div>
          ) : analysisResult ? (
            <div className="flex flex-col gap-6">
              
              {/* Score visual metric card */}
              <div className="bg-[#161618] border border-white/5 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <span className="absolute top-0 right-0 w-32 h-32 bg-indigo-505/5 rounded-full filter blur-3xl"></span>
                
                <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
                  
                  {/* Circular Risk Score Progress Dial */}
                  <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="6"
                        fill="transparent"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke={analysisResult.score > 70 ? "#ef4444" : analysisResult.score > 30 ? "#f59e0b" : "#10b981"}
                        strokeWidth="7"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 48}
                        strokeDashoffset={2 * Math.PI * 48 * (1 - analysisResult.score / 100)}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-3xl font-serif text-white italic">{analysisResult.score}</span>
                      <p className={`text-[9px] uppercase font-bold tracking-wider ${analysisResult.score > 70 ? "text-red-500" : analysisResult.score > 30 ? "text-amber-500" : "text-emerald-500"}`}>
                        {analysisResult.score > 70 ? "High Risk" : analysisResult.score > 30 ? "Medium Risk" : "Low Risk"}
                      </p>
                    </div>
                  </div>

                  <div className="text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className={`text-[11px] font-mono tracking-widest font-bold uppercase border px-2.5 py-1 rounded leading-none ${
                        analysisResult.verdict === "HIGH RISK"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : analysisResult.verdict === "MEDIUM RISK"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {analysisResult.verdict} VERDICT
                      </span>
                      {analysisResult.isSimulated && (
                        <span className="text-[9px] font-mono text-slate-500 uppercase px-1.5 py-0.5 border border-white/5 rounded bg-black/40">
                          Simulator fallback
                        </span>
                      )}
                      {analysisResult.managedAgentStats?.active && (
                        <span className="text-[9.5px] font-mono text-indigo-350 font-bold uppercase px-2.5 py-1 border border-indigo-505/20 rounded bg-indigo-950/20 shadow-[0_0_8px_rgba(99,102,241,0.1)] flex items-center gap-1 leading-none select-none animate-fadeIn">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          Agent audited: {analysisResult.managedAgentStats.agentId}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-350 mt-3 leading-relaxed max-w-md font-sans">
                      {analysisResult.summary}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto md:max-w-[200px] border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-5 font-mono text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Decision Tag:</span>
                    <span className={analysisResult.caseFileDetails.recommendingRejection ? "text-red-400 font-bold" : "text-emerald-450 font-bold"}>
                      {analysisResult.caseFileDetails.recommendingRejection ? "REJECT" : "CLEAN"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Forensics Match:</span>
                    <span className="text-slate-300">{analysisResult.tamperedSignatures.length > 0 ? "⚠️ Anomaly Found" : "🟢 Clean PDF"}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Flagged Networks:</span>
                    <span className="text-slate-300">{analysisResult.graphEdges.filter(e => e.status === "flagged").length} active items</span>
                  </div>
                </div>
              </div>

              {/* Workstation Workspace Tabs (Layer 4 Intelligence model) */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-2 gap-3">
                  <div className="flex flex-wrap gap-2 text-xs">
                    {[
                      { id: 1, label: "LAYER 1: Ocr Metadata & Forensics", icon: FileSpreadsheet },
                      { id: 2, label: "LAYER 2: Cross-Doc Coherence Engine", icon: Layers3 },
                      { id: 3, label: "LAYER 3: Relational Graph Net", icon: Fingerprint },
                      { id: 4, label: "LAYER 4: Executive RBI Case File", icon: Scale },
                      { id: 5, label: "LAYER 5: SDK Managed Agents", icon: Sparkles }
                    ].map((tab) => {
                      const isActive = activeAnalysisLayer === tab.id;
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveAnalysisLayer(tab.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-[11px] font-mono uppercase font-bold tracking-tight ${
                            isActive
                              ? "bg-indigo-600/10 border-indigo-500/45 text-white shadow-sm shadow-indigo-950/20"
                              : "text-slate-400 hover:text-white border-transparent"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 text-indigo-400" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub Tab Screen view renders */}
                <div className="min-h-[300px]">
                  
                  {/* Layer 1: Ingestion Diagnostics & EXIF checks */}
                  {activeAnalysisLayer === 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {activeDocObj && (
                        <NLPDocumentExtractor document={activeDocObj} />
                      )}

                      <div className="bg-[#161618] border border-white/5 p-4 rounded-xl space-y-3">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                            <Terminal className="w-4 h-4 text-indigo-400" />
                            Digital Sandbox Forensics
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono">DPI checks active</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          RAVEN performs direct metadata inspection on files to look for modifications in coordinate metadata tags or pixel template distributions.
                        </p>
                      </div>

                      {analysisResult.tamperedSignatures.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysisResult.tamperedSignatures.map((sig, i) => (
                            <div key={i} className="bg-amber-500/5 border border-amber-550/20 rounded-xl p-4 flex flex-col gap-2">
                              <span className="text-[10px] font-mono tracking-widest uppercase font-bold px-1.5 py-0.5 rounded leading-none shrink-0 self-start bg-amber-955 text-amber-400 border border-amber-900/40">
                                METADATA EXPOSURE ({sig.confidence}% confidence)
                              </span>
                              <h5 className="text-xs font-semibold text-slate-200">{sig.signature}</h5>
                              <p className="text-xs text-slate-400 leading-normal font-sans">{sig.explanation}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2">
                          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                          <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-300">Clean Files EXIF Integrity</h4>
                          <p className="text-xs text-slate-500 font-sans max-w-sm">
                            Author tools, signature tags, and embedded typeface maps appear 100% authentic against original digital portals.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Layer 2: Main Cross-Document Coherence clashing values */}
                  {activeAnalysisLayer === 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="bg-[#161618] border border-white/5 p-4 rounded-xl">
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 border-b border-white/5 pb-2">
                          <Layers3 className="w-4 h-4 text-indigo-400" />
                          Flagged Contradictions Clashes
                        </h4>
                        <p className="text-xs text-slate-400 leading-normal font-sans mt-2.5">
                          Bank fraud rarely fails index lookups. It fails when two details in separate documents tell three different stories. These anomalies have been collectively flagged:
                        </p>
                      </div>

                      {analysisResult.managedAgentStats?.active && (
                        <div className="bg-indigo-950/20 border border-indigo-505/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-fadeIn">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-650/10 border border-indigo-500/25 flex items-center justify-center shrink-0">
                              <Sparkles className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div>
                              <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-200">
                                RELATIONAL SWEEP COMMITTED BY MANAGED AGENT
                              </h5>
                              <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                                Managed Agent ID <strong className="text-indigo-350">"{analysisResult.managedAgentStats.agentId}"</strong> successfully executed custom AGENTS.md rulesets to audit candidate files.
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <span className="text-[8.5px] font-mono text-emerald-450 bg-emerald-950/25 border border-emerald-900/30 px-2.5 py-1 rounded uppercase font-bold">
                              SDK Active
                            </span>
                            <span className="text-[8.5px] font-mono text-indigo-400 bg-indigo-950/25 border border-indigo-900/30 px-2.5 py-1 rounded uppercase font-bold">
                              Skill: presentation-exporter
                            </span>
                          </div>
                        </div>
                      )}

                      {analysisResult.contradictions.length > 0 ? (
                        <div className="space-y-3">
                          {analysisResult.contradictions.map((con, idx) => (
                            <div
                              key={idx}
                              className={`p-4 rounded-xl border flex flex-col sm:flex-row gap-3 items-start justify-between transition-all duration-300 ${
                                con.severity === "high"
                                  ? "bg-red-500/5 border-red-555/20 glow-rose text-red-100"
                                  : con.severity === "medium"
                                  ? "bg-amber-500/5 border-amber-550/20 text-amber-100"
                                  : "bg-[#161618] border-white/5"
                              }`}
                            >
                              <div className="space-y-1.5 flex-1 select-text">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded leading-none font-bold ${
                                    con.severity === "high"
                                      ? "bg-red-950/80 text-red-400 border border-red-900/30"
                                      : con.severity === "medium"
                                      ? "bg-amber-955/80 text-amber-400 border border-amber-900/30"
                                      : "bg-[#0A0A0B] text-indigo-400 border border-white/5"
                                  }`}>
                                    {con.severity} Severity
                                  </span>
                                  <span className="text-xs font-semibold text-white">{con.title}</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed font-sans">{con.description}</p>
                              </div>
                              <div className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-slate-400 bg-black/40 border border-white/5 px-2.5 py-1 rounded max-w-[200px] text-center">
                                {con.crossDocSource}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2">
                          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                          <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-300">Perfect Story Coherence</h4>
                          <p className="text-xs text-slate-500 font-sans max-w-sm">
                            Income values, employer directories, geolocated timestamps, and addresses correspond precisely without any clashing information.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Layer 3: Relational Graph & Fraud Ring Detection Console */}
                  {activeAnalysisLayer === 3 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-5"
                    >
                      <div className="bg-[#161618] border border-white/5 p-4 rounded-xl">
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 border-b border-white/5 pb-2">
                          <Layers3 className="w-4 h-4 text-indigo-400" />
                          Layer 3: Graph Database & Fraud Ring Traversal Engine
                        </h4>
                        <p className="text-xs text-slate-400 leading-normal font-sans mt-2.5">
                          Live graph-database traversal auditing multi-document intersections. By index-analyzing connection paths with DFS/BFS, RAVEN discovers coordinated rings sharing address vectors, physical device templates, or corporate facades.
                        </p>
                      </div>

                      {/* SVG Relations Canvas */}
                      <NetworkGraph 
                        nodes={analysisResult.graphNodes} 
                        edges={analysisResult.graphEdges}
                        onSelectNode={(node) => setSelectedNode(node)}
                      />

                      {/* Relational Graph Database Inspector & Traversal logs */}
                      {(() => {
                        const db = new GraphDatabase(analysisResult.graphNodes || [], analysisResult.graphEdges || []);
                        const rings = db.findFraudRings();
                        return (
                          <div className="bg-[#161618] border border-white/5 rounded-xl p-5 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3 gap-3">
                              <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-indigo-400 animate-pulse" />
                                Relational Engine Diagnostic & Cypher Projections
                              </h4>
                              
                              <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                                <span className="bg-slate-900 border border-white/5 px-2.5 py-0.5 rounded text-slate-400">
                                  Vertices: <strong className="text-indigo-400">{analysisResult.graphNodes.length}</strong>
                                </span>
                                <span className="bg-slate-900 border border-white/5 px-2.5 py-0.5 rounded text-slate-400">
                                  Edges: <strong className="text-indigo-400">{analysisResult.graphEdges.length}</strong>
                                </span>
                                <span className="bg-slate-900 border border-white/5 px-2.5 py-0.5 rounded text-slate-400">
                                  Active Sweeps: <strong className="text-indigo-400">3 Algorithms</strong>
                                </span>
                              </div>
                            </div>

                            {analysisResult.managedAgentStats?.active && (
                              <div className="bg-indigo-950/20 border border-indigo-550/15 rounded-xl p-3.5 space-y-2 text-xs font-mono text-slate-300 animate-fadeIn">
                                <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold text-indigo-400">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Managed Agent Query Constraints Detected</span>
                                </div>
                                <div className="text-[11px] leading-relaxed bg-[#0A0A0B] border border-white/5 rounded-lg p-2.5 text-indigo-300 select-all overflow-x-auto">
                                  <span className="text-slate-500 block text-[8px] tracking-wider uppercase mb-1 font-bold">Injected DFS Traversal Rule:</span>
                                  <code>{analysisResult.managedAgentStats.traversalDirectives}</code>
                                </div>
                                <div className="flex flex-wrap justify-between text-[10px] text-slate-450 gap-2">
                                  <span>Containment Strategy: <strong className="text-slate-200">RESTRICTED SANDBOX</strong></span>
                                  <span>Network Outbound: <strong className="text-emerald-450">SECURE API GATED</strong></span>
                                </div>
                              </div>
                            )}

                            {rings.length > 0 ? (
                              <div className="space-y-4">
                                {rings.map((ring, idx) => (
                                  <div 
                                    key={idx} 
                                    className={`p-4 rounded-xl border space-y-3.5 select-text ${
                                      ring.severity === "high" 
                                        ? "bg-rose-500/5 border-rose-500/20" 
                                        : "bg-amber-500/5 border-amber-500/10"
                                    }`}
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                                      <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-mono tracking-widest uppercase font-bold px-1.5 py-0.5 rounded border leading-none ${
                                          ring.severity === "high" 
                                            ? "bg-rose-950 text-rose-400 border-rose-800/40" 
                                            : "bg-amber-955 text-amber-400 border-amber-800/40"
                                        }`}>
                                          COLLUSION {ring.severity.toUpperCase()}
                                        </span>
                                        <h5 className="text-xs font-semibold text-white">{ring.title}</h5>
                                      </div>
                                      <span className="text-[10px] font-mono text-slate-500 italic block">
                                        Pattern: {ring.patternType}
                                      </span>
                                    </div>

                                    <p className="text-xs text-slate-350 leading-relaxed font-sans">{ring.description}</p>

                                    {/* Mock Neo4j Cypher projection representing the traversal expression */}
                                    <div className="bg-slate-950/85 border border-white/5 rounded-lg p-2.5 font-mono text-[10px] text-indigo-400 select-all overflow-x-auto leading-normal">
                                      <span className="text-slate-500 select-none block text-[9px] uppercase tracking-wider mb-1 font-semibold">Cypher Schema Projection:</span>
                                      {ring.patternType === "reused_template" && (
                                        <code>{`MATCH (p1:Person) -[s1:SUBMITMED_VIA]-> (d:Device) <-[s2:SUBMITMED_VIA]- (p2:Person)\nWHERE p1.id <> p2.id\nRETURN p1, p2, d`}</code>
                                      )}
                                      {ring.patternType === "shared_address" && (
                                        <code>{`MATCH (p1:Person) -[:CLAIMS_RESIDENCE]-> (prop:Property) <-[:CLAIMS_RESIDENCE]- (p2:Person)\nWHERE prop.lienStatus = "FLAGGED_OVERLAP"\nRETURN p1, p2, prop`}</code>
                                      )}
                                      {ring.patternType === "identity_bridge" && (
                                        <code>{`MATCH path = (p:Person) -[*1..3]-> (facade:FacadeEntity)\nWHERE facade.status = "synthetic"\nRETURN path, count(facade) as FACADE_LINK`}</code>
                                      )}
                                    </div>

                                    {/* Interactive Traversal Walk steps log */}
                                    <div className="space-y-2 border-t border-white/5 pt-3">
                                      <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block font-bold">Traversal Path Execution Trace (BFS/DFS Walk):</span>
                                      <div className="flex flex-col gap-2">
                                        {ring.steps.map((step, sIdx) => (
                                          <div key={sIdx} className="flex items-start gap-2.5 text-xs font-mono leading-relaxed bg-black/35 p-2 rounded-lg border border-white/5">
                                            <span className="bg-slate-900 border border-slate-700/60 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold text-indigo-400 shrink-0">
                                              {sIdx + 1}
                                            </span>
                                            <div className="flex-1">
                                              <p className="text-slate-200">
                                                {step.relationship && (
                                                  <span className="text-indigo-400 font-bold mr-1.5 font-mono">
                                                    -[{step.relationship}]-&gt;
                                                  </span>
                                                )}
                                                <span className="text-slate-450 uppercase text-[10px] tracking-wide mr-1.5 pr-1 px-1 py-0.5 rounded bg-slate-800 leading-none">
                                                  {step.type}
                                                </span>
                                                <strong className="text-slate-200 font-sans">{step.label}</strong>
                                              </p>
                                              {step.comment && (
                                                <p className="text-[10px] text-slate-500 leading-normal font-sans mt-0.5">{step.comment}</p>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2">
                                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                                <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-300">Relational Database Sweep Clean</h4>
                                <p className="text-xs text-slate-400 font-sans max-w-sm leading-normal">
                                  Our traversal sweeping algorithms (DFS/BFS checking template hashes, shared residences, and bridging devices) found zero loops or collusive cycles. Entity graph is fully secure.
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}

                  {/* Layer 4: Regulatory Compile (RBI Guidelines audits case folders) */}
                  {activeAnalysisLayer === 4 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 select-text"
                    >
                      <div className="bg-[#161618] border border-white/5 rounded-xl p-5 space-y-5">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <div className="flex items-center gap-2">
                            <Scale className="w-4 h-4 text-indigo-400" />
                            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300">
                              Official SEC/RBI Compliant Case File Report
                            </h4>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-400 animate-[pulse_2s_infinite]" />
                            Audit Ready Log Generated
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-[#0A0A0B] border border-white/5 rounded-lg p-3.5 space-y-2">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block font-bold">Recommended Bank Action</span>
                            <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
                              {analysisResult.caseFileDetails.bankActionRequired}
                            </p>
                          </div>
                          
                          <div className="bg-[#0A0A0B] border border-white/5 rounded-lg p-3.5 space-y-2">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block font-bold">RBI Guidelines Standard Vetting Warnings</span>
                            <p className="text-xs text-slate-400 leading-relaxed font-sans">
                              {analysisResult.caseFileDetails.rbiComplianceWarning}
                            </p>
                          </div>
                        </div>

                        {/* Auditing checklist overview */}
                        <div className="border-t border-white/5 pt-3.5 space-y-2.5 font-mono text-xs">
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1">Underwriting Integrity Checks:</h5>
                          
                          <div className="flex items-center justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              Layer 1: DPI / Metadata EXIF Structural Scan
                            </span>
                            <span className="text-slate-300 text-[11px]">Audit Complete</span>
                          </div>

                          <div className="flex items-center justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400 flex items-center gap-2">
                              {analysisResult.contradictions.filter(d => d.severity === "high").length > 0 ? (
                                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 animate-pulse" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              )}
                              Layer 2: Cross-Document Coherence Balance Match
                            </span>
                            <span className={analysisResult.contradictions.length > 0 ? "text-red-450 font-bold" : "text-emerald-450 font-bold"}>
                              {analysisResult.contradictions.length > 0 ? `${analysisResult.contradictions.length} Clashes Flagged` : "100% Coherent"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400 flex items-center gap-2">
                              {analysisResult.score > 50 ? (
                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              )}
                              Layer 3: CanvasFingerprint device node mappings
                            </span>
                            <span className="text-slate-350">Identity Graph Mapped</span>
                          </div>
                        </div>

                        {/* Interactive Case Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <button
                            onClick={() => {
                              const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(analysisResult, null, 2))}`;
                              const downloadAnchor = document.createElement("a");
                              downloadAnchor.setAttribute("href", jsonString);
                              downloadAnchor.setAttribute("download", `RAVEN_CaseFile_${selectedCase.id}.json`);
                              document.body.appendChild(downloadAnchor);
                              downloadAnchor.click();
                              downloadAnchor.remove();
                            }}
                            className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-white text-[11px] font-mono tracking-widest uppercase font-bold px-4 py-2.5 rounded transition shadow-md shadow-indigo-950/25"
                          >
                            <Download className="w-3.5 h-3.5 text-indigo-200" />
                            Download Case File JSON
                          </button>

                          <button
                            onClick={() => {
                              const reportText = `[RAVEN BANK AUDIT REPORT]\nCase: ${selectedCase.title}\nVerdict: ${analysisResult.verdict}\nRisk Score: ${analysisResult.score}/100\nSummary: ${analysisResult.summary}\nRBI compliance guideline warning: ${analysisResult.caseFileDetails.rbiComplianceWarning}\nRequired compliance action: ${analysisResult.caseFileDetails.bankActionRequired}`;
                              navigator.clipboard.writeText(reportText);
                              alert("Official Banking Case File details copied to clipboard!");
                            }}
                            className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto bg-black/40 border border-white/10 hover:bg-black/60 cursor-pointer text-slate-300 text-[11px] font-mono tracking-widest uppercase font-bold px-4 py-2.5 rounded transition"
                          >
                            <Check className="w-4 h-4 text-emerald-400" />
                            Copy Case File Text
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Layer 5: Developer Managed Agent configuration based on user Gemini API schema manuals */}
                  {activeAnalysisLayer === 5 && (
                    <ManagedAgentBuilder 
                      currentCaseSummary={analysisResult?.summary || "Workspace forensic review session."} 
                      contradictionsCount={analysisResult?.contradictions?.length || 0}
                    />
                  )}

                </div>
              </div>

            </div>
          ) : (
            <div className="bg-[#161618] border border-white/5 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[500px]">
              <Database className="w-12 h-12 text-slate-650 animate-pulse" />
              <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mt-4">No active analysis loaded</h3>
              <p className="text-xs text-slate-500 font-sans mt-2">Select a case on the left and run verification to populate forensic logs.</p>
            </div>
          )}
          
          {/* Error drawer banner */}
          {errorText && (
            <div className="bg-[#161618] border border-red-500/10 p-3.5 rounded-lg">
              <p className="text-xs font-mono text-red-400 leading-relaxed flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                {errorText}
              </p>
            </div>
          )}
        </section>

      </main>

      {/* 2. Unified elegant footer */}
      <footer className="border-t border-white/10 bg-[#0A0A0B] px-6 py-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 font-mono text-[10px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            <span>RAVEN Core Security Console v2.1 (Google AI Studio Ready)</span>
          </div>
          <div className="text-indigo-400 uppercase tracking-wider">
            System Online • Optimized for Agentic Reasoning
          </div>
        </div>
      </footer>
    </div>
  );
}
