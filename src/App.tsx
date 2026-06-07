/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Award } from 'lucide-react';
import { DocumentItem } from './types';
import { INITIAL_DEMO_DOCUMENTS } from './constants/documents';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AnalysisResults } from './components/AnalysisResults';
import { useAnalysis } from './hooks/useAnalysis';
import { useFingerprint } from './hooks/useFingerprint';

export default function App() {
  const [activeDocTab, setActiveDocTab] = useState<string>('doc-itr');
  const [useManagedAgent, setUseManagedAgent] = useState<boolean>(true);
  const [managedAgentId, setManagedAgentId] = useState<string>('raven-coherence-auditor');
  const [customDirectives, setCustomDirectives] = useState<string>(
    'Cross-verify applicant tax dossiers collectively, audit core employer mismatch parameters, trace duplicate device IDs, and run topological DFS traversals.',
  );

  const { browserFingerprint, documentsState, setDocumentsState } =
    useFingerprint(INITIAL_DEMO_DOCUMENTS);

  const {
    analysisResult,
    setAnalysisResult,
    isAnalyzing,
    errorText,
    selectedNode,
    setSelectedNode,
    activeStageId,
    stageOutputs,
    engineMode,
    setEngineMode,
    triggerVerification,
  } = useAnalysis({ useManagedAgent, managedAgentId, browserFingerprint });

  const handleDocumentContentChange = (docId: string, newContent: string) => {
    const updated = documentsState.map((d) => {
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
