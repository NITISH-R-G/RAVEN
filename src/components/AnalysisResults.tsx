import { Dispatch, SetStateAction } from 'react';
import { Database, AlertTriangle } from 'lucide-react';
import { AnalysisResult, GraphNode } from '../types';
import { AgenticSweepProgress } from './AnalysisResultsComponents/AgenticSweepProgress';
import { VerdictHeader } from './AnalysisResultsComponents/VerdictHeader';
import { CoherenceFlags } from './AnalysisResultsComponents/CoherenceFlags';
import { RelationalGraph } from './AnalysisResultsComponents/RelationalGraph';
import { MetadataSignatures } from './AnalysisResultsComponents/MetadataSignatures';
import { ComplianceDirectives } from './AnalysisResultsComponents/ComplianceDirectives';
import { AIStatusBanners } from './AnalysisResultsComponents/AIStatusBanners';

interface AnalysisResultsProps {
  readonly isAnalyzing: boolean;
  readonly activeStageId: number;
  readonly stageOutputs: { readonly [key: number]: string };
  readonly analysisResult: AnalysisResult | null;
  readonly selectedNode: GraphNode | null;
  readonly setSelectedNode: Dispatch<SetStateAction<GraphNode | null>>;
  readonly useManagedAgent: boolean;
  readonly managedAgentId: string;
  readonly errorText: string;
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
  let content = null;

  if (isAnalyzing) {
    content = <AgenticSweepProgress activeStageId={activeStageId} stageOutputs={stageOutputs} />;
  } else if (analysisResult) {
    content = (
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-8">
        <AIStatusBanners analysisResult={analysisResult} />

        <VerdictHeader
          analysisResult={analysisResult}
          useManagedAgent={useManagedAgent}
          managedAgentId={managedAgentId}
        />

        {/* Consolidated Report Body */}
        <div className="flex flex-col gap-6">
          <CoherenceFlags analysisResult={analysisResult} />

          <RelationalGraph
            analysisResult={analysisResult}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
          />

          <MetadataSignatures analysisResult={analysisResult} />

          <ComplianceDirectives analysisResult={analysisResult} />
        </div>
      </div>
    );
  } else {
    content = (
      <div className="bg-[#161618] border border-white/5 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[500px]">
        <Database className="w-10 h-10 text-slate-650 animate-pulse" />
        <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mt-4">
          Workspace Awaiting Active Scan
        </h3>
        <p className="text-xs text-slate-500 font-sans mt-2">
          Adjust agent directives on the left and trigger verification to run sweeps.
        </p>
      </div>
    );
  }

  return (
    <section className="lg:col-span-7 flex flex-col gap-6 lg:h-full lg:overflow-y-auto pr-1">
      {content}
      {errorText && (
        <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-lg flex items-center gap-2 text-xs font-mono text-red-400 select-text">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorText}</span>
        </div>
      )}
    </section>
  );
}
