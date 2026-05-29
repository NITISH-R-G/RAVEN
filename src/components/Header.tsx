import { Layers, Fingerprint } from "lucide-react";
import { WebFingerprint } from "../utils/fingerprint";

interface HeaderProps {
  browserFingerprint: WebFingerprint | null;
}

export function Header({ browserFingerprint }: HeaderProps) {
  return (
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
  );
}
