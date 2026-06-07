import { Activity, CheckCircle2 } from 'lucide-react';
import { AnalysisResult } from '../../types';

interface MetadataSignaturesProps {
  readonly analysisResult: AnalysisResult;
}

export function MetadataSignatures({ analysisResult }: MetadataSignaturesProps) {
  return (
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
            <div
              key={i}
              className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 flex flex-col gap-2 transition-all"
            >
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
          <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-300">
            EXIF structure clean
          </h4>
          <p className="text-xs text-slate-500 font-sans max-w-sm leading-normal">
            Author tools, coordinate frames, digital font weights, and resolution indicators are
            verified standard.
          </p>
        </div>
      )}
    </div>
  );
}
