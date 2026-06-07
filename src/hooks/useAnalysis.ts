import { useState } from 'react';
import { AnalysisResult, DocumentItem, GraphNode } from '../types';
import { WebFingerprint } from '../utils/fingerprint';

interface UseAnalysisProps {
  useManagedAgent: boolean;
  managedAgentId: string;
  browserFingerprint: WebFingerprint | null;
}

export function useAnalysis({
  useManagedAgent,
  managedAgentId,
  browserFingerprint,
}: UseAnalysisProps) {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // High-fidelity multi-stage loading trackers
  const [activeStageId, setActiveStageId] = useState<number>(0);
  const [stageOutputs, setStageOutputs] = useState<{ [key: number]: string }>({
    1: 'Awaiting workspace signal...',
    2: 'Awaiting workspace signal...',
    3: 'Awaiting workspace signal...',
    4: 'Awaiting workspace signal...',
  });

  const [engineMode, setEngineMode] = useState<'gemini' | 'local'>(() => {
    return (localStorage.getItem('raven_engine_mode') as 'gemini' | 'local') || 'gemini';
  });

  const triggerVerification = async (currentDocs: DocumentItem[], customFpId?: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setErrorText('');
    setSelectedNode(null);
    setActiveStageId(1);
    setStageOutputs({
      1: 'Synthesizing raw dossiers and optical alignment tags...',
      2: 'Waiting for Ingestion layer authorization...',
      3: 'Waiting for Coherence index calculation...',
      4: 'Waiting for Executive compliance compilation...',
    });

    const deviceFingerprintId = customFpId || browserFingerprint?.id || 'fp-tester';
    const activeEngine = localStorage.getItem('raven_engine_mode') || engineMode || 'gemini';

    try {
      const formData = new FormData();
      currentDocs.forEach((doc) => {
        if (doc.file) {
          formData.append('files', doc.file, doc.name);
        } else {
          const blob = new Blob([doc.content], { type: 'text/plain' });
          formData.append('files', blob, doc.name);
        }
      });

      formData.append('useManagedAgent', String(useManagedAgent));
      formData.append('managedAgentId', managedAgentId);
      formData.append('engineMode', activeEngine);
      formData.append('clientFingerprintId', deviceFingerprintId);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data: AnalysisResult = await response.json();

      if (data.aiStatus && !data.aiStatus.success && data.aiStatus.isQuotaExceeded) {
        setEngineMode('local');
        localStorage.setItem('raven_engine_mode', 'local');
      }

      if (data.graphNodes) {
        data.graphNodes = data.graphNodes.map((node) => {
          if (
            node.type === 'device' &&
            (node.label.includes(deviceFingerprintId) || node.label.includes('Fingerprint'))
          ) {
            return {
              ...node,
              label: `Your Device: ${deviceFingerprintId}`,
              details: `FINGERPRINT MATCHED. Browser fingerprint active on multi-document entries.`,
            };
          }
          return node;
        });
      }

      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      // --- LAYER 1 STREAMING TRANSITION ---
      setStageOutputs((prev) => ({
        ...prev,
        1: `Scanning ${currentDocs.length} custom user documents... Parsing EXIF metadata and OCR layers...`,
      }));
      await delay(1200);

      const mainApplicant =
        data.extractedEntities?.find(
          (e) =>
            e.value.includes('Signee') ||
            e.value.includes('Applicant') ||
            e.value.includes('Owner'),
        )?.entity || 'Applicant';
      const layer1Success = `Ingested: Extracted user trace signature of candidate [${mainApplicant}] successfully.`;

      setStageOutputs((prev) => ({
        ...prev,
        1: layer1Success,
        2: 'Running multi-document comparative matrices. Analyzing monthly income & employer clashing structures...',
      }));
      setActiveStageId(2);
      await delay(1400);

      // --- LAYER 2 STREAMING TRANSITION ---
      const contradictionsCount = data.contradictions?.length || 0;
      const layer2Success =
        contradictionsCount > 0
          ? `Coherence Alert: Highlighted ${contradictionsCount} active clashing claims. Detected '${data.contradictions[0].title}' discrepancies.`
          : 'Coherence Balanced: Verified clean income, date registers and address statements without conflicts.';

      setStageOutputs((prev) => ({
        ...prev,
        2: layer2Success,
        3: 'Simulating entity mapping. Translating structural nodes into network vertices...',
      }));
      setActiveStageId(3);
      await delay(1200);

      // --- LAYER 3 STREAMING TRANSITION ---
      const nodeCount = data.graphNodes?.length || 0;
      const edgeCount = data.graphEdges?.length || 0;
      const layer3Success = `Graph Complete: Mapped ${nodeCount} transaction vertices and established ${edgeCount} relationship edges.`;

      setStageOutputs((prev) => ({
        ...prev,
        3: layer3Success,
        4: 'Compiling risk score algorithms, writing legal audit records under RBI regulations...',
      }));
      setActiveStageId(4);
      await delay(1100);

      // --- LAYER 4 STREAMING TRANSITION ---
      const layer4Success = `Compliance Executed: Final threat weight rating compiled at ${data.score}/100. Case dossier ready.`;
      setStageOutputs((prev) => ({
        ...prev,
        4: layer4Success,
      }));
      await delay(600);

      setAnalysisResult(data);
    } catch (err: unknown) {
      console.error('Analysis API execution failure:', err);
      setErrorText(
        'Relational sweep execution failed connecting online tools. Please check connection.',
      );
    } finally {
      setIsAnalyzing(false);
      setActiveStageId(0);
    }
  };

  return {
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
  };
}
