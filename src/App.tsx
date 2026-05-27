/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Award } from "lucide-react";
import { computeBrowserFingerprint, WebFingerprint, getFingerprintJSVisitorId } from "./utils/fingerprint";
import { DocumentItem, AnalysisResult, GraphNode } from "./types";
import { INITIAL_DEMO_DOCUMENTS } from "./constants/documents";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { AnalysisResults } from "./components/AnalysisResults";

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
      <Header browserFingerprint={browserFingerprint} />

      {/* Main relational desktop workspace */}
      <main className="flex-1 p-3 md:p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl w-full mx-auto min-h-0">
        <Sidebar
          documentsState={documentsState}
          setDocumentsState={setDocumentsState}
          activeDocTab={activeDocTab}
          setActiveDocTab={setActiveDocTab}
          handleDocumentContentChange={handleDocumentContentChange}
          handleDocumentIngested={handleDocumentIngested}
          managedAgentId={managedAgentId}
          setManagedAgentId={setManagedAgentId}
          useManagedAgent={useManagedAgent}
          setUseManagedAgent={setUseManagedAgent}
          customDirectives={customDirectives}
          setCustomDirectives={setCustomDirectives}
          engineMode={engineMode}
          setEngineMode={setEngineMode}
          isAnalyzing={isAnalyzing}
          triggerVerification={triggerVerification}
          browserFingerprint={browserFingerprint}
          setAnalysisResult={setAnalysisResult}
        />
        <AnalysisResults
          isAnalyzing={isAnalyzing}
          activeStageId={activeStageId}
          stageOutputs={stageOutputs}
          analysisResult={analysisResult}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
          useManagedAgent={useManagedAgent}
          managedAgentId={managedAgentId}
          errorText={errorText}
        />
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
