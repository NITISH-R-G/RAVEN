import React, { useState, useEffect } from "react";
import { GraphNode, GraphEdge } from "../types";
import { Network, User, MapPin, Building, Smartphone, Fingerprint, ShieldAlert, Award } from "lucide-react";
import { motion } from "motion/react";

interface NetworkGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode?: (node: GraphNode) => void;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ nodes, edges, onSelectNode }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ [key: string]: { x: number; y: number } }>({});

  // Compute node coordinates dynamically (arranged in a circle or clean bento structure to guarantee perfect alignment on resize)
  useEffect(() => {
    if (!nodes || nodes.length === 0) return;

    const width = 600;
    const height = 400;
    const padding = 60;
    const newCoords: { [key: string]: { x: number; y: number } } = {};

    // Center principal node if possible (like an applicant or target property)
    const primaryNode = nodes.find(n => n.type === "person" && n.status === "flagged") || nodes[0];
    const surroundingNodes = nodes.filter(n => n.id !== primaryNode.id);

    // Center coordinates
    newCoords[primaryNode.id] = { x: width / 2, y: height / 2 };

    // Arrange surrounding nodes in a beautifully spaced ellipse around the center
    const count = surroundingNodes.length;
    surroundingNodes.forEach((node, index) => {
      const angle = (index * 2 * Math.PI) / count;
      const rx = 200; // horizontal radius
      const ry = 130; // vertical radius
      newCoords[node.id] = {
        x: width / 2 + rx * Math.cos(angle),
        y: height / 2 + ry * Math.sin(angle)
      };
    });

    setCoords(newCoords);
  }, [nodes]);

  const getNodeIcon = (type: string, status: string) => {
    const isFlagged = status === "flagged";
    const baseColor = isFlagged ? "text-rose-400" : status === "verified" ? "text-emerald-400" : "text-sky-300";

    switch (type) {
      case "person":
        return <User className={`${baseColor} w-5 h-5`} />;
      case "address":
      case "property":
        return <MapPin className={`${baseColor} w-5 h-5`} />;
      case "employer":
        return <Building className={`${baseColor} w-5 h-5`} />;
      case "phone":
        return <Smartphone className={`${baseColor} w-5 h-5`} />;
      case "device":
        return <Fingerprint className={`${baseColor} w-5 h-5`} />;
      default:
        return <Network className={`${baseColor} w-5 h-5`} />;
    }
  };

  const getNodeColorClass = (status: string) => {
    switch (status) {
      case "flagged":
        return {
          bg: "bg-rose-950/80 border-rose-500/80 hover:border-rose-400 shadow-rose-900/40",
          text: "text-rose-200",
          ring: "ring-rose-500/30"
        };
      case "verified":
        return {
          bg: "bg-emerald-950/80 border-emerald-500/80 hover:border-emerald-400 shadow-emerald-900/40",
          text: "text-emerald-200",
          ring: "ring-emerald-500/30"
        };
      default:
        return {
          bg: "bg-slate-900/90 border-slate-700 hover:border-sky-400 shadow-slate-900",
          text: "text-slate-300",
          ring: "ring-sky-500/10"
        };
    }
  };

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNodeId(node.id);
    if (onSelectNode) {
      onSelectNode(node);
    }
  };

  const activeNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="flex flex-col xl:flex-row gap-6 bg-[#161618] rounded-xl border border-white/5 p-5 mt-4 min-h-[460px]">
      {/* SVG Canvas Area */}
      <div className="flex-1 relative border border-white/5 rounded-lg overflow-hidden bg-[#0A0A0B] min-h-[380px] flex items-center justify-center">
        {/* Absolute indicators in background */}
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-[#161618] border border-white/5 px-3 py-1.5 rounded-md text-xs font-mono">
          <Network className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span className="text-slate-400">Layer 3 Graph Traversal Active:</span>
          <span className="text-indigo-400 font-semibold">{nodes.length} nodes mapped</span>
        </div>

        {Object.keys(coords).length > 0 && (
          <svg className="w-full h-full max-w-[600px] max-h-[400px]" viewBox="0 0 600 400">
            <defs>
              <marker
                id="arrow-flagged"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
              </marker>
              <marker
                id="arrow-verified"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
              </marker>
              <marker
                id="arrow-neutral"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
              </marker>
            </defs>

            {/* Draw Edges */}
            {edges.map((edge, idx) => {
              const from = coords[edge.source];
              const to = coords[edge.target];
              if (!from || !to) return null;

              const isFlagged = edge.status === "flagged";
              const strokeColor = isFlagged ? "#f43f5e" : edge.status === "verified" ? "#10b981" : "#475569";
              const strokeWidth = isFlagged ? "2" : "1.5";
              const isDashed = isFlagged;

              // Quadratic bezier curve for visual appeal (curved links style)
              const midX = (from.x + to.x) / 2 + (to.y - from.y) * 0.12;
              const midY = (from.y + to.y) / 2 - (to.x - from.x) * 0.12;

              return (
                <g key={`edge-${idx}`}>
                  <path
                    d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={isDashed ? "5,5" : "none"}
                    markerEnd={`url(#arrow-${edge.status})`}
                    className="transition-all duration-300"
                  />
                  {/* Small text label in the middle of link */}
                  <rect
                    x={midX - 35}
                    y={midY - 8}
                    width="70"
                    height="16"
                    rx="3"
                    className="fill-slate-950 stroke-slate-900 border"
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    className="fill-slate-400 text-[9px] font-mono tracking-wider font-semibold uppercase"
                  >
                    {edge.relationship}
                  </text>
                </g>
              );
            })}

            {/* Draw Nodes */}
            {nodes.map((node) => {
              const coord = coords[node.id];
              if (!coord) return null;

              const style = getNodeColorClass(node.status);
              const isSelected = selectedNodeId === node.id;
              const isFlagged = node.status === "flagged";

              return (
                <g
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  className="cursor-pointer group"
                >
                  {/* Flagged pulsing outer animation */}
                  {isFlagged && (
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r="19"
                      className="fill-none stroke-rose-500/40 animate-ping"
                      style={{ animationDuration: "3s" }}
                    />
                  )}

                  {/* Outer selection ring */}
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r={isSelected ? "22" : "18"}
                    className={`transition-all duration-300 fill-slate-950 stroke-2 ${
                      isSelected
                        ? "stroke-sky-400/90 shadow-lg"
                        : isFlagged
                        ? "stroke-rose-500/80 group-hover:stroke-rose-400"
                        : node.status === "verified"
                        ? "stroke-emerald-500/80 group-hover:stroke-emerald-400"
                        : "stroke-slate-700 group-hover:stroke-sky-400"
                    }`}
                  />

                  {/* Icon wrapper inside circle */}
                  <foreignObject
                    x={coord.x - 10}
                    y={coord.y - 10}
                    width="20"
                    height="20"
                    className="pointer-events-none"
                  >
                    <div className="flex items-center justify-center w-full h-full">
                      {getNodeIcon(node.type, node.status)}
                    </div>
                  </foreignObject>

                  {/* Label under node */}
                  <text
                    x={coord.x}
                    y={coord.y + 28}
                    textAnchor="middle"
                    className={`text-[9px] font-semibold tracking-wide select-none ${
                      isFlagged
                        ? "fill-rose-300"
                        : node.status === "verified"
                        ? "fill-emerald-300"
                        : "fill-slate-300"
                    } font-mono`}
                  >
                    {node.label.length > 20 ? `${node.label.slice(0, 18)}...` : node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Selected Node Details Sidepanel */}
      <div className="w-full xl:w-72 bg-black/40 border border-white/5 rounded-lg p-4 flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase border-b border-white/5 pb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            Node Diagnostics
          </h4>

          {activeNode ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              key={activeNode.id}
              className="mt-4 space-y-3"
            >
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Node Entity</span>
                <span className="text-sm font-semibold tracking-tight text-white">{activeNode.label}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Class Type</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase bg-slate-850 text-sky-400 border border-slate-700/80">
                  {activeNode.type}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Status Level</span>
                {activeNode.status === "flagged" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase bg-rose-950/80 text-rose-400 border border-rose-800/50">
                    CRITICAL EXPOSURE
                  </span>
                ) : activeNode.status === "verified" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                    SURE TRUSTED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase bg-slate-800 text-slate-400 border border-slate-700">
                    NEUTRAL / CHECKED
                  </span>
                )}
              </div>

              {activeNode.details && (
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Audit Context</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{activeNode.details}</p>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="mt-8 text-center text-slate-500">
              <Network className="w-10 h-10 mx-auto text-slate-700 stroke-1 animate-[spin_8s_linear_infinite]" />
              <p className="text-xs font-sans mt-3">Click any network node on the left to inspect multi-document associations.</p>
            </div>
          )}
        </div>

        {activeNode && activeNode.status === "flagged" && (
          <div className="bg-rose-950/35 border border-rose-900/40 p-3 rounded mt-4">
            <div className="flex items-start gap-1.5 text-[11px] text-rose-300 leading-tight">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>Coherence Block Flag:</strong> Mapped connection bypasses isolation limits. Crosscheck required immediately.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default NetworkGraph;
