import { Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnalysisResult, GraphNode } from '../../types';
import { NetworkGraph } from '../NetworkGraph';
import { Dispatch, SetStateAction } from 'react';

interface RelationalGraphProps {
  readonly analysisResult: AnalysisResult;
  readonly selectedNode: GraphNode | null;
  readonly setSelectedNode: Dispatch<SetStateAction<GraphNode | null>>;
}

export function RelationalGraph({
  analysisResult,
  selectedNode,
  setSelectedNode,
}: RelationalGraphProps) {
  return (
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
            <h5 className="text-xs font-bold text-white select-all">{selectedNode.label}</h5>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {selectedNode.details || 'Extracted relation node.'}
            </p>
            <div className="text-[10px] font-mono text-slate-500 flex gap-4 uppercase font-semibold">
              <span>
                Classification: <strong className="text-slate-350">{selectedNode.type}</strong>
              </span>
              <span>
                Audit Status:{' '}
                <strong className="text-indigo-300">{selectedNode.status || 'Audited'}</strong>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
