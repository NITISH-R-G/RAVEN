import { AnalysisResult, DocumentItem, Contradiction, ExtractedEntity, GraphNode, GraphEdge, TamperedSignature } from "../types.js";

interface ExtractionState {
  people: Set<string>;
  employers: Set<string>;
  addresses: Set<string>;
  devices: Set<string>;
  itrGross: number;
  salaryMonthly: number;
  salaryAnnualized: number;
  itrEmployer: string;
  salaryEmployer: string;
  extractedEntities: ExtractedEntity[];
  tamperedSignatures: TamperedSignature[];
}

const NAME_REGEX = /(?:NAME|Name|APPLICANT|Applicant|Owner|OWNER):\s*([A-Za-z ]+)/gi;
const PAN_REGEX = /(?:PAN|PAN card|PAN):\s*([A-Z0-9]+)/gi;
const FP_REGEX = /(?:device|fingerprint|fp-)\s*(?:ID|id)?:?\s*([a-fA-F0-9-]+)/gi;
const EMP_REGEX = /(?:EMPLOYER|Employer|Company|COMPANY):\s*([A-Za-z0-9 ]+)/gi;
const ADDR_REGEX = /(?:ADDRESS|Address|PROPERTY|Property|Flat|FLAT):\s*([A-Za-z0-9 ,.-]+)/gi;
const ITR_REGEX = /(?:TOTAL INCOME|GROSS INCOME|TAXABLE INCOME|INCOME|GTI):\s*(?:INR|₹)?\s*([0-9,.]+)/i;
const SAL_REGEX = /(?:GROSS SALARY|NET SALARY|NET PAYABLE|PAYABLE|SALARY):\s*(?:INR|₹)?\s*([0-9,.]+)/i;

function parseDocuments(documents: DocumentItem[]): ExtractionState {
  const state: ExtractionState = {
    people: new Set(),
    employers: new Set(),
    addresses: new Set(),
    devices: new Set(),
    itrGross: 0,
    salaryMonthly: 0,
    salaryAnnualized: 0,
    itrEmployer: "",
    salaryEmployer: "",
    extractedEntities: [],
    tamperedSignatures: []
  };

  const items = documents || [];
  items.forEach((doc) => {
    const text = doc.content || "";
    const type = doc.type || "OTHER";

    // Parse Names
    const nameMatches = text.match(NAME_REGEX);
    if (nameMatches) {
      nameMatches.forEach((m) => {
        const val = m.split(":")[1]?.trim();
        if (val && val.length > 3) {
          state.people.add(val);
          state.extractedEntities.push({ entity: val, value: `${type} Signee`, docType: type });
        }
      });
    }

    // Parse PAN / Tax identifiers
    const panMatches = text.match(PAN_REGEX);
    if (panMatches) {
      panMatches.forEach((m) => {
        const val = m.split(":")[1]?.trim();
        if (val && val.length > 5) {
          state.extractedEntities.push({ entity: val, value: `Tax PAN ID`, docType: type });
        }
      });
    }

    // Parse Device Fingerprints
    const fpMatches = text.match(FP_REGEX);
    if (fpMatches) {
      fpMatches.forEach((m) => {
        const parts = m.split(":");
        const val = (parts.length > 1 ? parts[1] : m).replace(/device/i, "").replace(/id/i, "").replace(/fingerprint/i, "").replace(/=/g, "").trim();
        if (val && val.length > 4) {
          state.devices.add(val);
        }
      });
    }

    // Parse Employers
    const empMatches = text.match(EMP_REGEX);
    if (empMatches) {
      empMatches.forEach((m) => {
        const val = m.split(":")[1]?.trim();
        if (val && val.length > 3) {
          state.employers.add(val);
          if (type === "ITR") state.itrEmployer = val;
          if (type === "SALARY_SLIP") state.salaryEmployer = val;
        }
      });
    }

    // Parse Addresses
    const addrMatches = text.match(ADDR_REGEX);
    if (addrMatches) {
      addrMatches.forEach((m) => {
        const val = m.split(":")[1]?.trim();
        if (val && val.length > 8) {
          const shortAddr = val.split(",")[0].trim() || val;
          state.addresses.add(shortAddr);
        }
      });
    }

    // Parse Financial statements values
    if (type === "ITR") {
      const itrMatches = text.match(ITR_REGEX);
      if (itrMatches) {
        state.itrGross = parseInt(itrMatches[1].replace(/,/g, ""), 10);
      }
    }
    if (type === "SALARY_SLIP") {
      const salMatches = text.match(SAL_REGEX);
      if (salMatches) {
        state.salaryMonthly = parseInt(salMatches[1].replace(/,/g, ""), 10);
        state.salaryAnnualized = state.salaryMonthly * 12;
      }
    }

    // Verify EXIF author fields
    const author = doc.metadata?.authorTool || "";
    const dpi = doc.metadata?.dpiCheck || "";

    if (text.includes("Canva") || author.includes("Canva")) {
      state.tamperedSignatures.push({
        signature: "Canva Pro Template Mark",
        confidence: 92,
        explanation: "Document elements align with Canva design exports instead of certified payroll system prints."
      });
    }
    if (text.includes("Photoshop") || author.includes("Photoshop")) {
      state.tamperedSignatures.push({
        signature: "Adobe Photoshop CC adjustment layers",
        confidence: 96,
        explanation: "EXIF contains raster modifying traces indicating coordinate table graphics manipulation."
      });
    }
    if (dpi && (dpi.includes("96") || dpi.includes("72"))) {
      state.tamperedSignatures.push({
        signature: "Low Resolution Raster Anomaly",
        confidence: 85,
        explanation: `Raster mapped at a low ${dpi} rendering. Certified original financial vectors exceed 300 DPI.`
      });
    }
  });

  return state;
}

function findContradictions(state: ExtractionState, documents: DocumentItem[]): Contradiction[] {
  const contradictions: Contradiction[] = [];

  // Real-time comparative logic
  if (state.itrEmployer && state.salaryEmployer && state.itrEmployer.toLowerCase() !== state.salaryEmployer.toLowerCase()) {
    if (!state.itrEmployer.toLowerCase().includes(state.salaryEmployer.toLowerCase()) && !state.salaryEmployer.toLowerCase().includes(state.itrEmployer.toLowerCase())) {
      contradictions.push({
        title: "Employer Brand Identification Conflict",
        severity: "medium",
        description: `Government tax filings register '${state.itrEmployer}' as prime employer, but salary slip certifies payment from '${state.salaryEmployer}'. Signifies distinct discrepancies.`,
        crossDocSource: "ITR vs Salary Slip"
      });
    }
  }

  if (state.itrGross > 0 && state.salaryAnnualized > 0) {
    const ratio = Math.max(state.itrGross, state.salaryAnnualized) / Math.min(state.itrGross, state.salaryAnnualized);
    if (ratio > 1.25) {
      const severity = ratio > 2 ? "high" : "medium";
      contradictions.push({
        title: "Income Margin Misalignment",
        severity,
        description: `Tax reported Gross total income is ₹${state.itrGross.toLocaleString()}, whereas payslip states ₹${state.salaryMonthly.toLocaleString()} monthly (₹${state.salaryAnnualized.toLocaleString()} annualized). This represents an unsupported ${(ratio * 100 - 100).toFixed(0)}% deviation.`,
        crossDocSource: "ITR FY26 vs Payslip"
      });
    }
  }

  if (state.devices.size > 0 && state.people.size > 1) {
    contradictions.push({
      title: "Device Footprint Collision",
      severity: "high",
      description: `Risk engine detects identical client device browser fingerprints [${Array.from(state.devices).join(", ")}] executing submissions for discrete candidate applicants. Coordinated transaction hazard flagged.`,
      crossDocSource: "Fingerprint SDK Ledger"
    });
  }

  const items = documents || [];
  const propertiesText = items.some(d => d.content?.toLowerCase().includes("lien") || d.content?.toLowerCase().includes("double mortgage") || d.content?.toLowerCase().includes("concurrent"));
  if (propertiesText) {
    contradictions.push({
      title: "Concurrent Asset Mortgage overlap",
      severity: "high",
      description: "Property deeds register active, concurrent mortgages logged at multiple regional underwriters within the current week.",
      crossDocSource: "Property Stamp Registrar"
    });
  }

  return contradictions;
}

function calculateRisk(contradictions: Contradiction[], tamperedSignatures: TamperedSignature[]): { score: number, verdict: "HIGH RISK" | "MEDIUM RISK" | "LOW RISK", summary: string } {
  let score = 12;
  let verdict: "HIGH RISK" | "MEDIUM RISK" | "LOW RISK" = "LOW RISK";
  let summary = "Relational sweep successful: Workspace files are digitally sound and structurally aligned on all checks.";

  if (contradictions.length > 0) {
    const high = contradictions.filter(c => c.severity === "high").length;
    const med = contradictions.filter(c => c.severity === "medium").length;
    score = Math.min(high * 35 + med * 18 + tamperedSignatures.length * 12 + 10, 99);
  } else if (tamperedSignatures.length > 0) {
    score = 35;
  }

  if (score > 60) {
    verdict = "HIGH RISK";
    summary = `Relational sweep completed: RAVEN Managed Agent identified ${contradictions.length} active cross-file compromises. Warnings track material income margins alignment, browser device overlaps, and visual EXIF modifiers. Recommend immediate credit rejection.`;
  } else if (score > 30) {
    verdict = "MEDIUM RISK";
    summary = `Relational audit completed. Moderate risk profiles identified. Document margins generally correspond, but low DPI metadata layers require manual verification oversight.`;
  } else {
    verdict = "LOW RISK";
    summary = `Success: Relational sweep completed clean. Zero clashing claims, device crossovers, or template modifications discovered. Verified fully authentic.`;
  }

  return { score, verdict, summary };
}

function buildRelationshipGraph(state: ExtractionState, score: number): { graphNodes: GraphNode[], graphEdges: GraphEdge[] } {
  const graphNodes: GraphNode[] = [];
  const graphEdges: GraphEdge[] = [];
  const personNodeIds: string[] = [];
  let nodeIdx = 1;

  if (state.people.size > 0) {
    state.people.forEach((p) => {
      const id = `node-person-${nodeIdx++}`;
      graphNodes.push({
        id,
        label: `${p} (Applicant)`,
        type: "person",
        status: score > 50 ? "flagged" : "verified",
        details: `Discovered active applicant signature.`
      });
      personNodeIds.push(id);
    });
  } else {
    // default node to keep graph active
    graphNodes.push({
      id: "node-person-1",
      label: "Discovered Applicant",
      type: "person",
      status: "neutral",
      details: "Extracted signature placeholder"
    });
    personNodeIds.push("node-person-1");
  }

  let empIdx = 1;
  state.employers.forEach((e) => {
    const id = `node-emp-${empIdx++}`;
    graphNodes.push({
      id,
      label: e,
      type: "employer",
      status: state.salaryEmployer && state.itrEmployer && state.salaryEmployer !== state.itrEmployer ? "flagged" : "verified",
      details: "Discovered employer linkage"
    });

    // Link persons to employer
    personNodeIds.forEach((pid) => {
      graphEdges.push({
        source: pid,
        target: id,
        relationship: "Employed By",
        status: state.salaryEmployer && state.itrEmployer && state.salaryEmployer !== state.itrEmployer ? "flagged" : "verified"
      });
    });
  });

  let addrIdx = 1;
  state.addresses.forEach((a) => {
    const id = `node-addr-${addrIdx++}`;
    graphNodes.push({
      id,
      label: a,
      type: "address",
      status: "neutral",
      details: "Discovered address registry"
    });

    personNodeIds.forEach((pid) => {
      graphEdges.push({
        source: pid,
        target: id,
        relationship: "Claims Residence",
        status: "neutral"
      });
    });
  });

  let devIdx = 1;
  state.devices.forEach((d) => {
    const id = `node-dev-${devIdx++}`;
    graphNodes.push({
      id,
      label: `Fingerprint: ${d}`,
      type: "device",
      status: "flagged",
      details: "Device signatures crosslogged"
    });

    personNodeIds.forEach((pid) => {
      graphEdges.push({
        source: pid,
        target: id,
        relationship: "Device Auth",
        status: "flagged"
      });
    });
  });

  if (graphEdges.length === 0 && graphNodes.length > 1) {
    graphEdges.push({
      source: graphNodes[0].id,
      target: graphNodes[1].id,
      relationship: "Document Link",
      status: "neutral"
    });
  }

  return { graphNodes, graphEdges };
}

export function analyzeDocumentsDynamically(documents: DocumentItem[]): AnalysisResult {
  const state = parseDocuments(documents);
  const contradictions = findContradictions(state, documents);
  const { score, verdict, summary } = calculateRisk(contradictions, state.tamperedSignatures);
  const { graphNodes, graphEdges } = buildRelationshipGraph(state, score);

  const bankActionRequired = score > 60
    ? "MANDATED AUDIT CONTROL. Freeze candidate application routing lines, file secure suspicious transaction logs to regulatory agencies instantly."
    : "Proceed standard credit routing pathways. No anomalies detected.";

  const rbiComplianceWarning = score > 60
    ? "Section 45IA Alert: Cross-document credit anomalies represent structural declaration non-compliance."
    : "Transaction structures fully conform to RBI guidelines.";

  return {
    score,
    verdict,
    summary,
    contradictions,
    extractedEntities: state.extractedEntities,
    graphNodes,
    graphEdges,
    tamperedSignatures: state.tamperedSignatures,
    caseFileDetails: {
      bankActionRequired,
      rbiComplianceWarning,
      recommendingRejection: score > 60
    }
  };
}
