import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  Sparkles, 
  Database, 
  Target, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Bookmark, 
  ShieldCheck, 
  Layers3,
  TrendingUp,
  FileCheck2,
  MapPin
} from "lucide-react";
import { DocumentItem } from "../types";

interface NLPDocumentExtractorProps {
  document: DocumentItem;
}

interface ParsedEntity {
  field: string;
  value: string;
  classification: "IDENTITY" | "FINANCIAL" | "ORGANIZATION" | "TEMPORAL" | "GEOGRAPHIC";
  confidence: number;
  extractedFrom: string;
  status: "verified" | "discrepant" | "warning";
}

export const NLPDocumentExtractor: React.FC<NLPDocumentExtractorProps> = ({ document }) => {
  const [selectedModel, setSelectedModel] = useState<"anthropic-finance" | "fingpt-llama" | "layoutlm-v3">("anthropic-finance");
  const [parsedEntities, setParsedEntities] = useState<ParsedEntity[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [layoutDiscovered, setLayoutDiscovered] = useState<{
    gridMatch: string;
    fieldsCount: number;
    density: string;
    alignmentConfidence: number;
  }>({ gridMatch: "Standard ITR Template", fieldsCount: 0, density: "Normal", alignmentConfidence: 99.5 });

  // Simulate parsing trigger whenever document content or selected model changes
  useEffect(() => {
    setIsParsing(true);
    const timer = setTimeout(() => {
      parseDocumentContent(document.content, document.type);
      setIsParsing(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [document.content, document.type, selectedModel]);

  const parseDocumentContent = (text: string, type: string) => {
    const lines = text.split("\n");
    const tempEntities: ParsedEntity[] = [];
    let discoveredFields = 0;

    // Helper to find lines with content
    const findValue = (labelKeywords: string[]): { val: string; raw: string } | null => {
      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        if (labelKeywords.some(keyword => lowerLine.includes(keyword.toLowerCase()))) {
          discoveredFields++;
          // Extract after colon or equal
          const delimiterIdx = line.indexOf(":") !== -1 ? line.indexOf(":") : line.indexOf("=");
          if (delimiterIdx !== -1) {
            return {
              val: line.substring(delimiterIdx + 1).trim(),
              raw: line
            };
          }
          // Try to search for values using simple chunks
          const chunks = line.split(" ");
          if (chunks.length > 2) {
            return {
              val: chunks.slice(2).join(" ").trim(),
              raw: line
            };
          }
        }
      }
      return null;
    };

    // Form specific custom state extraction rules
    if (type === "ITR") {
      const nameMatch = findValue(["name", "filing name", "assessee"]);
      const panMatch = findValue(["pan", "reg no", "id serial"]);
      const incomeMatch = findValue(["gross total income", "gross revenue declared", "revenue submitted", "taxable"]);
      const employerMatch = findValue(["employer name", "employment status", "business activity", "company"]);
      const yearMatch = findValue(["assessment year", "ay", "fy", "financial year"]);
      const addressMatch = findValue(["address"]);

      tempEntities.push({
        field: "Taxpayer Identity",
        value: nameMatch ? nameMatch.val : "Unknown Filer",
        classification: "IDENTITY",
        confidence: selectedModel === "anthropic-finance" ? 99.2 : 95.8,
        extractedFrom: nameMatch ? nameMatch.raw : "Document Header NLP Layer",
        status: "verified"
      });

      if (panMatch) {
         tempEntities.push({
           field: "Permanent Account Number (PAN)",
           value: panMatch.val,
           classification: "IDENTITY",
           confidence: 99.8,
           extractedFrom: panMatch.raw,
           status: panMatch.val.length < 10 ? "warning" : "verified"
         });
      }

      if (incomeMatch) {
        // Evaluate for mismatch with other cases (mock trigger)
        const valNum = parseInt(incomeMatch.val.replace(/[^0-9]/g, "")) || 0;
        tempEntities.push({
          field: "Declared Gross Income",
          value: incomeMatch.val,
          classification: "FINANCIAL",
          confidence: 98.6,
          extractedFrom: incomeMatch.raw,
          status: valNum > 2000000 && text.toLowerCase().includes("rajesh") ? "discrepant" : "verified"
        });
      }

      if (employerMatch) {
         tempEntities.push({
           field: "Certified Employer / Sector",
           value: employerMatch.val,
           classification: "ORGANIZATION",
           confidence: 94.2,
           extractedFrom: employerMatch.raw,
           status: employerMatch.val.toLowerCase().includes("discrepancy") ? "discrepant" : "verified"
         });
      }

      if (yearMatch) {
         tempEntities.push({
           field: "Filing Fiscal Term",
           value: yearMatch.val,
           classification: "TEMPORAL",
           confidence: 99.5,
           extractedFrom: yearMatch.raw,
           status: "verified"
         });
      }

      if (addressMatch) {
        tempEntities.push({
          field: "Filing Address Coordinate",
          value: addressMatch.val,
          classification: "GEOGRAPHIC",
          confidence: 96.4,
          extractedFrom: addressMatch.raw,
          status: "verified"
        });
      }

      setLayoutDiscovered({
        gridMatch: "Govt ITR-1/ITR-4 Form Schema",
        fieldsCount: discoveredFields,
        density: "High",
        alignmentConfidence: 98.4
      });

    } else if (type === "SALARY_SLIP") {
      const nameMatch = findValue(["beneficiary", "name", "employee code"]);
      const employerMatch = findValue(["employer", "office", "company"]);
      const salaryMatch = findValue(["gross salary", "gross credit details", "direct credits paid", "net disbursed"]);
      const bankMatch = findValue(["bank account", "accounts credited", "hdfc", "sbi", "yes bank"]);
      
      tempEntities.push({
        field: "Recipient Name",
        value: nameMatch ? nameMatch.val : "Unknown Beneficiary",
        classification: "IDENTITY",
        confidence: 98.1,
        extractedFrom: nameMatch ? nameMatch.raw : "Salary Grid Ingestion",
        status: "verified"
      });

      if (employerMatch) {
        tempEntities.push({
          field: "Corporate Employer",
          value: employerMatch.val,
          classification: "ORGANIZATION",
          confidence: 97.4,
          extractedFrom: employerMatch.raw,
          status: employerMatch.val.toLowerCase().includes("discrepancy") ? "discrepant" : "verified"
        });
      }

      if (salaryMatch) {
        tempEntities.push({
          field: "Gross Stated Salary",
          value: salaryMatch.val,
          classification: "FINANCIAL",
          confidence: 99.1,
          extractedFrom: salaryMatch.raw,
          status: text.toLowerCase().includes("discrepancy") || text.toLowerCase().includes("photoshop") ? "discrepant" : "verified"
        });
      }

      if (bankMatch) {
        tempEntities.push({
          field: "Salary Credit Bank Route",
          value: bankMatch.val,
          classification: "ORGANIZATION",
          confidence: 95.0,
          extractedFrom: bankMatch.raw,
          status: "verified"
        });
      }

      setLayoutDiscovered({
        gridMatch: "Corporate Multi-Column Ledger",
        fieldsCount: discoveredFields,
        density: "Medium-High",
        alignmentConfidence: selectedModel === "layoutlm-v3" ? 99.4 : 96.1
      });

    } else if (type === "PROPERTY_VALUATION") {
      const refMatch = findValue(["reference", "valuation reference", "survey"]);
      const ownerMatch = findValue(["official security owners", "registration owner", "occupied by"]);
      const valMatch = findValue(["market valuation value", "valuation amount", "valuation rating"]);
      const locationMatch = findValue(["target property details", "address", "property verified", "coordinates"]);

      if (refMatch) {
        tempEntities.push({
          field: "Government Property Reference ID",
          value: refMatch.val,
          classification: "IDENTITY",
          confidence: 99.7,
          extractedFrom: refMatch.raw,
          status: "verified"
        });
      }

      if (ownerMatch) {
        tempEntities.push({
          field: "Deed Registrant Owner",
          value: ownerMatch.val,
          classification: "IDENTITY",
          confidence: 97.5,
          extractedFrom: ownerMatch.raw,
          status: "verified"
        });
      }

      if (valMatch) {
        tempEntities.push({
          field: "Appraised Liquidity Value",
          value: valMatch.val,
          classification: "FINANCIAL",
          confidence: 99.0,
          extractedFrom: valMatch.raw,
          status: text.toLowerCase().includes("double-mortgaged") ? "discrepant" : "verified"
        });
      }

      if (locationMatch) {
        tempEntities.push({
          field: "Assessed Real-Estate Coordinates",
          value: locationMatch.val,
          classification: "GEOGRAPHIC",
          confidence: 94.8,
          extractedFrom: locationMatch.raw,
          status: "verified"
        });
      }

      setLayoutDiscovered({
        gridMatch: "State Real-Estate Stamps Survey",
        fieldsCount: discoveredFields,
        density: "Medium",
        alignmentConfidence: 97.9
      });

    } else {
      // General Parser
      const geoIp = findValue(["ip assigned", "session ip", "location trace", "co-applicant ip"]);
      const deviceSig = findValue(["device id", "device platform", "canvasfingerprint"]);

      if (geoIp) {
        tempEntities.push({
          field: "Identified Client IP Geolocation",
          value: geoIp.val,
          classification: "GEOGRAPHIC",
          confidence: 99.1,
          extractedFrom: geoIp.raw,
          status: text.toLowerCase().includes("mismatch") ? "discrepant" : "verified"
        });
      }

      if (deviceSig) {
        tempEntities.push({
          field: "Extracted Target Device Engine Signature",
          value: deviceSig.val,
          classification: "IDENTITY",
          confidence: 98.4,
          extractedFrom: deviceSig.raw,
          status: text.toLowerCase().includes("anomaly") ? "warning" : "verified"
        });
      }

      // Add fallback
      tempEntities.push({
        field: "Document Ingestion Hash",
        value: `md5-${document.id.replace("doc-", "")}`,
        classification: "IDENTITY",
        confidence: 100.0,
        extractedFrom: "FineUploader Security Tag",
        status: "verified"
      });

      setLayoutDiscovered({
        gridMatch: "Unstructured Log & Metapage Schema",
        fieldsCount: discoveredFields || 2,
        density: "Low",
        alignmentConfidence: 93.5
      });
    }

    setParsedEntities(tempEntities);
  };

  return (
    <div className="bg-[#101012] border border-white/5 rounded-xl p-4 flex flex-col gap-4 select-text">
      
      {/* Model Control Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3.5 gap-2.5">
        <div className="flex items-center gap-1.5 shrink-0">
          <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
          <h4 className="text-xs font-mono font-bold tracking-widest text-slate-350 uppercase">
            Anthropic & FinGPT NLP Extraction Engine
          </h4>
        </div>

        {/* NLP Model toggle buttons */}
        <div className="flex items-center gap-1.5 bg-black/65 border border-white/5 p-1 rounded-lg self-start sm:self-auto text-[10px] font-mono shrink-0">
          <button
            onClick={() => setSelectedModel("anthropic-finance")}
            className={`px-2 py-1 rounded transition-all flex items-center gap-1 ${
              selectedModel === "anthropic-finance" 
                ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30" 
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Sparkles className="w-3 h-3 text-indigo-300" />
            Claude-3.5 Sonnet FinNLP
          </button>
          
          <button
            onClick={() => setSelectedModel("fingpt-llama")}
            className={`px-2 py-1 rounded transition-all flex items-center gap-1 ${
              selectedModel === "fingpt-llama" 
                ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30" 
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <TrendingUp className="w-3 h-3 text-indigo-400" />
            FinGPT-v3 (LLaMA-7B)
          </button>

          <button
            onClick={() => setSelectedModel("layoutlm-v3")}
            className={`px-2 py-1 rounded transition-all flex items-center gap-1 ${
              selectedModel === "layoutlm-v3" 
                ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30" 
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Layers3 className="w-3 h-3 text-indigo-400" />
            LayoutLMv3 (OCR Maps)
          </button>
        </div>
      </div>

      {/* Grid: Left layout coordinates visualization, right parsed fields list */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Layout Bounding Box Visualizer Panel (inspired by layout-aware receipts extraction models) */}
        <div className="md:col-span-5 bg-black/40 border border-white/5 p-3.5 rounded-lg flex flex-col justify-between gap-3 min-h-[220px]">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-550 border-b border-white/5 pb-1.5 mb-2 shrink-0">
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                OCR Layout Bounding Map
              </span>
              <span>{layoutDiscovered.gridMatch}</span>
            </div>

            {/* Live visual skeleton representing layout segments mapped by FinGPT or LayoutLM */}
            <div className="bg-[#050506]/90 border border-indigo-500/10 rounded p-3 h-36 relative overflow-hidden font-mono text-[9px] flex flex-col justify-between">
              
              {/* Overlay layout scanning effect */}
              <div className="absolute top-0 left-0 w-full h-0.5 bg-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.5)] animate-[bounce_3.5s_infinite] pointer-events-none"></div>

              {document.type === "ITR" && (
                <div className="space-y-1.5 scale-[0.95] origin-top-left">
                  <div className="flex gap-1.5">
                    <div className="w-12 h-3 bg-indigo-550/15 border border-indigo-550/30 rounded text-indigo-400 flex items-center justify-center font-bold">HEADER</div>
                    <div className="w-24 h-3 bg-slate-800/40 rounded"></div>
                  </div>
                  <div className="border border-white/5 p-1 rounded space-y-1 bg-black/25">
                    <div className="flex justify-between items-center text-[8px]">
                      <span className="text-slate-500">[BOX 1] TAXPAYER ID:</span>
                      <span className="text-emerald-400 font-bold bg-emerald-900/10 px-1 border border-emerald-900/20 rounded">99.8% CONF</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded"></div>
                    <div className="flex justify-between items-center text-[8px]">
                      <span className="text-slate-500">[BOX 2] INCOME DECLARATION:</span>
                      <span className="text-indigo-400 font-bold bg-indigo-900/10 px-1 border border-indigo-900/20 rounded">98.6%</span>
                    </div>
                  </div>
                  <div className="w-full h-8 border border-dashed border-white/5 rounded p-1 flex justify-between">
                    <span className="text-slate-600">[BOX 3] ADDR COORDS:</span>
                    <span className="text-slate-500 italic">Matched 400012/560103</span>
                  </div>
                </div>
              )}

              {document.type === "SALARY_SLIP" && (
                <div className="space-y-1.5 scale-[0.95] origin-top-left">
                  <div className="w-full h-3 bg-indigo-650/10 border border-indigo-500/20 rounded flex items-center justify-between px-1 bg-indigo-950/10">
                    <span className="text-indigo-300 font-bold">LEDGER SCHEME</span>
                    <span className="text-[7px] text-slate-500">300 DPI SCANNED</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 bg-black/45 p-1 rounded border border-white/5">
                    <div className="p-0.5 border border-white/5 rounded space-y-0.5">
                      <div className="flex justify-between text-[7px] text-slate-500">
                        <span>CREDITS LOG:</span>
                        <span className="text-indigo-300 font-mono">99.1%</span>
                      </div>
                      <div className="w-full h-1 bg-indigo-950/50 rounded"></div>
                    </div>
                    <div className="p-0.5 border border-white/5 rounded space-y-0.5">
                      <div className="flex justify-between text-[7px] text-slate-500">
                        <span>ROUTING route:</span>
                        <span className="text-emerald-400 font-mono">95.0%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded"></div>
                    </div>
                  </div>
                  <div className="p-1 border border-dashed border-red-500/20 bg-red-950/5 rounded text-[8px] text-red-400 flex items-center justify-between">
                    <span>ANOMALOUS PIXEL DUMP</span>
                    <span className="font-bold">LOW-RESOLUTION EXPORT (96 DPI)</span>
                  </div>
                </div>
              )}

              {document.type === "PROPERTY_VALUATION" && (
                <div className="space-y-1.5 scale-[0.95] origin-top-left">
                  <div className="w-full h-3 bg-indigo-650/15 border border-indigo-400/25 rounded px-1.5 flex justify-between items-center text-indigo-300 font-bold">
                    <span>STAMPS DEED SURVEY</span>
                    <span className="text-slate-500">[CERT-VAL]</span>
                  </div>
                  <div className="space-y-1 border border-white/5 p-1 rounded">
                    <div className="flex justify-between text-[7px] text-slate-500">
                      <span>OWNERSHIP DEED ANCHOR:</span>
                      <span className="text-emerald-400">97.5%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded"></div>
                    <div className="flex justify-between text-[7px] text-slate-500">
                      <span>APPRAISED LIQUIDITY VALUE:</span>
                      <span className="text-indigo-400 font-bold">99.0%</span>
                    </div>
                  </div>
                </div>
              )}

              {document.type !== "ITR" && document.type !== "SALARY_SLIP" && document.type !== "PROPERTY_VALUATION" && (
                <div className="space-y-1 scale-[0.95] origin-top-left">
                  <span className="text-slate-500 block uppercase font-bold tracking-tight mb-1">Unstructured Raw Token Coordinates</span>
                  <div className="w-full h-8 bg-black/60 rounded border border-white/5 p-1 flex flex-wrap gap-1 content-start">
                    <span className="px-1 py-0.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded text-[7px]">TOKEN_IP [115.118]</span>
                    <span className="px-1 py-0.5 bg-slate-800 border border-white/5 text-slate-400 rounded text-[7px]">PLATFORM_OS</span>
                    <span className="px-1 py-0.5 bg-slate-800 border border-white/5 text-slate-400 rounded text-[7px]">DPI_CHECK [OK]</span>
                  </div>
                  <div className="text-[7.5px] text-indigo-400/60 leading-tight">
                    Running Layout-Aware Text Sequence Traversal via FinGPT Attention Matrix.
                  </div>
                </div>
              )}

              <div className="text-[8px] text-slate-650 flex justify-between items-baseline border-t border-white/5 pt-1 mt-1 shrink-0 select-none">
                <span>Model Scale: LLaMA-7B Base</span>
                <span>Layers Loaded: 32 Attention Blocks</span>
              </div>
            </div>
          </div>

          {/* Model feedback statistics */}
          <div className="bg-[#101012] border border-white/5 p-2.5 rounded text-[11px] font-mono grid grid-cols-2 gap-1 text-slate-400 shrink-0">
            <div>
              <span className="text-slate-500 block text-[8px] uppercase tracking-wider">Alignment Acc</span>
              <span className="text-indigo-400 font-bold">{layoutDiscovered.alignmentConfidence}%</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[8px] uppercase tracking-wider">Identified Fields</span>
              <span className="text-indigo-400 font-bold">{layoutDiscovered.fieldsCount} nodes</span>
            </div>
          </div>
        </div>

        {/* NLP Parsed Entities Table/List */}
        <div className="md:col-span-7 flex flex-col gap-3 min-h-[220px]">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-550 border-b border-white/5 pb-1.5 shrink-0">
            <span className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-400 shrink-0" />
              Structured Relational Fields (Unified Schema)
            </span>
            <span>Confidence Indicator</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px] pr-1.5">
            {isParsing ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 gap-2 h-full">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                <span className="text-xs font-mono">Running FineUploader OCR alignment & FinGPT classification...</span>
              </div>
            ) : parsedEntities.length > 0 ? (
              parsedEntities.map((entity, i) => (
                <div key={i} className="flex items-center justify-between gap-3 bg-[#161618] border border-white/5 hover:border-indigo-550/20 p-2.5 rounded-lg transition-all duration-300">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[8px] font-mono tracking-widest font-bold px-1.5 rounded uppercase leading-none border scale-[0.98] ${
                        entity.classification === "IDENTITY" ? "bg-cyan-950 text-cyan-400 border-cyan-900/30" :
                        entity.classification === "FINANCIAL" ? "bg-emerald-950 text-emerald-400 border-emerald-900/30" :
                        entity.classification === "ORGANIZATION" ? "bg-indigo-950 text-indigo-400 border-indigo-900/30" :
                        entity.classification === "GEOGRAPHIC" ? "bg-amber-955 text-amber-400 border-amber-900/30" :
                        "bg-slate-900 text-slate-400 border-white/5"
                      }`}>
                        {entity.classification}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-350">{entity.field}</span>
                    </div>

                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className="text-xs font-bold text-white truncate max-w-[90%] font-sans">{entity.value}</span>
                      {entity.status === "discrepant" && (
                        <span className="text-[9px] font-mono text-red-400 underline decoration-red-500/40 shrink-0">Anomaly Detected</span>
                      )}
                      {entity.status === "warning" && (
                        <span className="text-[9px] font-mono text-amber-400 decimal shrink-0">Check Metadata</span>
                      )}
                    </div>
                    
                    <p className="text-[9.5px] font-mono text-slate-550 truncate max-w-full">
                      Source: <span className="italic text-slate-400">"{entity.extractedFrom}"</span>
                    </p>
                  </div>

                  {/* Confidence meter */}
                  <div className="flex flex-col items-end shrink-0 select-none">
                    <span className={`text-xs font-mono font-bold ${
                      entity.confidence > 95 ? "text-emerald-400" : "text-amber-400"
                    }`}>
                      {entity.confidence.toFixed(1)}%
                    </span>
                    <div className="w-12 bg-black rounded-full h-1 mt-1 overflow-hidden border border-white/5">
                      <div 
                        className={`h-full rounded-full ${entity.confidence > 95 ? "bg-emerald-500" : "bg-amber-500"}`} 
                        style={{ width: `${entity.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-8 text-slate-500 text-xs italic font-sans">
                Could not automatically parse structured schema. Paste valid financial coordinates.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Model Log Details */}
      <div className="bg-black/60 border border-white/5 p-3 rounded-lg flex items-start gap-2.5 text-xs">
        <Cpu className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <p className="text-slate-300 font-mono text-[11px] font-semibold leading-none">
            {selectedModel === "anthropic-finance" && "Claude 3.5 Sonnet Financial Schema Handler (Aligned with anthropics/financial-services)"}
            {selectedModel === "fingpt-llama" && "AI4Finance FinGPT-v3 LLM Reasoning Output"}
            {selectedModel === "layoutlm-v3" && "LayoutLMv3 Multimodal Parsing Checkpoint"}
          </p>
          <p className="text-slate-400 text-[10.5px] leading-relaxed font-sans mt-1">
            {selectedModel === "anthropic-finance" && (
              "Handles document coordinate variability by mapping key-value structures onto an abstract RBI-compliant financial ledger. Reconciles tax statements and salary paystubs against master borrower records dynamically."
            )}
            {selectedModel === "fingpt-llama" && (
              "Analyses textual reasoning logs step-by-step. Evaluates numeric declarations by linking statements with the broader company file indicators to determine revenue authenticity indices."
            )}
            {selectedModel === "layoutlm-v3" && (
              "Scans spatial layout grids to flag micro-discrepancies in line coordinates or template borders, detecting whether details have been visual-pasted or edited (e.g., in Canva/Photoshop templates)."
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
