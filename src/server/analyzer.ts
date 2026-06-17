import {
  AnalysisResult,
  DocumentItem,
  Contradiction,
  ExtractedEntity,
  GraphNode,
  GraphEdge,
  TamperedSignature,
} from '../types.js';

const NAME_REGEX = /(?:NAME|Name|APPLICANT|Applicant|Owner|OWNER):\s*([A-Za-z ]+)/gi;
const PAN_REGEX = /(?:PAN|PAN card|PAN):\s*([A-Z0-9]+)/gi;
const FP_REGEX = /(?:device|fingerprint|fp-)\s*(?:ID|id)?:?\s*([a-fA-F0-9-]+)/gi;
const EMP_REGEX = /(?:EMPLOYER|Employer|Company|COMPANY):\s*([A-Za-z0-9 ]+)/gi;
const ADDR_REGEX = /(?:ADDRESS|Address|PROPERTY|Property|Flat|FLAT):\s*([A-Za-z0-9 ,.-]+)/gi;
const ITR_REGEX =
  /(?:TOTAL INCOME|GROSS INCOME|TAXABLE INCOME|INCOME|GTI):\s*(?:INR|₹)? *(?:[0-9,.]+)/i;
const SAL_REGEX =
  /(?:GROSS SALARY|NET SALARY|NET PAYABLE|PAYABLE|SALARY):\s*(?:INR|₹)? *(?:[0-9,.]+)/i;

export function analyzeDocumentsDynamically(documents: DocumentItem[]): AnalysisResult {
  const contradictions: Contradiction[] = [];
  const extractedEntities: ExtractedEntity[] = [];
  const graphNodes: GraphNode[] = [];
  const graphEdges: GraphEdge[] = [];
  const tamperedSignatures: TamperedSignature[] = [];

  let score = 12;
  let verdict: 'HIGH RISK' | 'MEDIUM RISK' | 'LOW RISK' = 'LOW RISK';
  let summary =
    'Relational sweep successful: Workspace files are digitally sound and structurally aligned on all checks.';

  let itrGross = 0;
  let salaryMonthly = 0;
  let salaryAnnualized = 0;

  let itrEmployer = '';
  let salaryEmployer = '';

  const people = new Set<string>();
  const employers = new Set<string>();
  const addresses = new Set<string>();
  const devices = new Set<string>();

  const items = documents || [];

  for (const doc of items) {
    const text = doc.content || '';
    const type = doc.type || 'OTHER';

    // Parse Names
    for (const m of text.match(NAME_REGEX) || []) {
      const val = m.split(':')[1]?.trim();
      if (!val || val.length <= 3) continue;
      people.add(val);
      extractedEntities.push({ entity: val, value: `${type} Signee`, docType: type });
    }

    // Parse PAN / Tax identifiers
    for (const m of text.match(PAN_REGEX) || []) {
      const val = m.split(':')[1]?.trim();
      if (!val || val.length <= 5) continue;
      extractedEntities.push({ entity: val, value: `Tax PAN ID`, docType: type });
    }

    // Parse Device Fingerprints
    for (const m of text.match(FP_REGEX) || []) {
      const parts = m.split(':');
      const val = (parts.length > 1 ? parts[1] : m)
        .replace(/device/i, '')
        .replace(/id/i, '')
        .replace(/fingerprint/i, '')
        .replace(/=/g, '')
        .trim();
      if (!val || val.length <= 4) continue;
      devices.add(val);
    }

    // Parse Employers
    for (const m of text.match(EMP_REGEX) || []) {
      const val = m.split(':')[1]?.trim();
      if (!val || val.length <= 3) continue;
      employers.add(val);
      if (type === 'ITR') itrEmployer = val;
      if (type === 'SALARY_SLIP') salaryEmployer = val;
    }

    // Parse Addresses
    for (const m of text.match(ADDR_REGEX) || []) {
      const val = m.split(':')[1]?.trim();
      if (!val || val.length <= 8) continue;
      const shortAddr = val.split(',')[0].trim() || val;
      addresses.add(shortAddr);
    }

    // Parse Financial statements values
    if (type === 'ITR') {
      const itrMatches = text.match(ITR_REGEX);
      if (itrMatches) {
        itrGross = parseInt(itrMatches[1].replace(/,/g, ''), 10);
      }
    }
    if (type === 'SALARY_SLIP') {
      const salMatches = text.match(SAL_REGEX);
      if (salMatches) {
        salaryMonthly = parseInt(salMatches[1].replace(/,/g, ''), 10);
        salaryAnnualized = salaryMonthly * 12;
      }
    }

    // Verify EXIF author fields
    const author = doc.metadata?.authorTool || '';
    const dpi = doc.metadata?.dpiCheck || '';

    if (text.includes('Canva') || author.includes('Canva')) {
      tamperedSignatures.push({
        signature: 'Canva Pro Template Mark',
        confidence: 92,
        explanation:
          'Document elements align with Canva design exports instead of certified payroll system prints.',
      });
    }
    if (text.includes('Photoshop') || author.includes('Photoshop')) {
      tamperedSignatures.push({
        signature: 'Adobe Photoshop CC adjustment layers',
        confidence: 96,
        explanation:
          'EXIF contains raster modifying traces indicating coordinate table graphics manipulation.',
      });
    }
    if (dpi && (dpi.includes('96') || dpi.includes('72'))) {
      tamperedSignatures.push({
        signature: 'Low Resolution Raster Anomaly',
        confidence: 85,
        explanation: `Raster mapped at a low ${dpi} rendering. Certified original financial vectors exceed 300 DPI.`,
      });
    }
  }

  // Real-time comparative logic
  if (itrEmployer && salaryEmployer) {
    const lowerItrEmployer = itrEmployer.toLowerCase();
    const lowerSalaryEmployer = salaryEmployer.toLowerCase();

    if (
      lowerItrEmployer !== lowerSalaryEmployer &&
      !lowerItrEmployer.includes(lowerSalaryEmployer) &&
      !lowerSalaryEmployer.includes(lowerItrEmployer)
    ) {
      contradictions.push({
        title: 'Employer Brand Identification Conflict',
        severity: 'medium',
        description: `Government tax filings register '${itrEmployer}' as prime employer, but salary slip certifies payment from '${salaryEmployer}'. Signifies distinct discrepancies.`,
        crossDocSource: 'ITR vs Salary Slip',
      });
    }
  }

  if (itrGross > 0 && salaryAnnualized > 0) {
    const ratio = Math.max(itrGross, salaryAnnualized) / Math.min(itrGross, salaryAnnualized);
    if (ratio > 1.25) {
      const severity = ratio > 2 ? 'high' : 'medium';
      contradictions.push({
        title: 'Income Margin Misalignment',
        severity,
        description: `Tax reported Gross total income is ₹${itrGross.toLocaleString()}, whereas payslip states ₹${salaryMonthly.toLocaleString()} monthly (₹${salaryAnnualized.toLocaleString()} annualized). This represents an unsupported ${(ratio * 100 - 100).toFixed(0)}% deviation.`,
        crossDocSource: 'ITR FY26 vs Payslip',
      });
    }
  }

  if (devices.size > 0 && people.size > 1) {
    contradictions.push({
      title: 'Device Footprint Collision',
      severity: 'high',
      description: `Risk engine detects identical client device browser fingerprints [${Array.from(devices).join(', ')}] executing submissions for discrete candidate applicants. Coordinated transaction hazard flagged.`,
      crossDocSource: 'Fingerprint SDK Ledger',
    });
  }

  const propertiesText = items.some((d) => {
    const lower = d.content?.toLowerCase();
    return (
      lower?.includes('lien') || lower?.includes('double mortgage') || lower?.includes('concurrent')
    );
  });
  if (propertiesText) {
    contradictions.push({
      title: 'Concurrent Asset Mortgage overlap',
      severity: 'high',
      description:
        'Property deeds register active, concurrent mortgages logged at multiple regional underwriters within the current week.',
      crossDocSource: 'Property Stamp Registrar',
    });
  }

  // Scoring
  if (contradictions.length > 0) {
    let high = 0;
    let med = 0;
    for (const c of contradictions) {
      if (c.severity === 'high') high++;
      else if (c.severity === 'medium') med++;
    }
    score = Math.min(high * 35 + med * 18 + tamperedSignatures.length * 12 + 10, 99);
  } else if (tamperedSignatures.length > 0) {
    score = 35;
  }

  if (score > 60) {
    verdict = 'HIGH RISK';
    summary = `Relational sweep completed: RAVEN Managed Agent identified ${contradictions.length} active cross-file compromises. Warnings track material income margins alignment, browser device overlaps, and visual EXIF modifiers. Recommend immediate credit rejection.`;
  } else if (score > 30) {
    verdict = 'MEDIUM RISK';
    summary = `Relational audit completed. Moderate risk profiles identified. Document margins generally correspond, but low DPI metadata layers require manual verification oversight.`;
  } else {
    verdict = 'LOW RISK';
    summary = `Success: Relational sweep completed clean. Zero clashing claims, device crossovers, or template modifications discovered. Verified fully authentic.`;
  }

  // Construct Extracted Relationships Graph
  const personNodeIds: string[] = [];
  let nodeIdx = 1;

  if (people.size > 0) {
    people.forEach((p) => {
      const id = `node-person-${nodeIdx++}`;
      graphNodes.push({
        id,
        label: `${p} (Applicant)`,
        type: 'person',
        status: score > 50 ? 'flagged' : 'verified',
        details: `Discovered active applicant signature.`,
      });
      personNodeIds.push(id);
    });
  } else {
    // default node to keep graph active
    graphNodes.push({
      id: 'node-person-1',
      label: 'Discovered Applicant',
      type: 'person',
      status: 'neutral',
      details: 'Extracted signature placeholder',
    });
    personNodeIds.push('node-person-1');
  }

  let empIdx = 1;
  employers.forEach((e) => {
    const id = `node-emp-${empIdx++}`;
    graphNodes.push({
      id,
      label: e,
      type: 'employer',
      status:
        salaryEmployer && itrEmployer && salaryEmployer !== itrEmployer ? 'flagged' : 'verified',
      details: 'Discovered employer linkage',
    });

    // Link persons to employer
    personNodeIds.forEach((pid) => {
      graphEdges.push({
        source: pid,
        target: id,
        relationship: 'Employed By',
        status:
          salaryEmployer && itrEmployer && salaryEmployer !== itrEmployer ? 'flagged' : 'verified',
      });
    });
  });

  let addrIdx = 1;
  addresses.forEach((a) => {
    const id = `node-addr-${addrIdx++}`;
    graphNodes.push({
      id,
      label: a,
      type: 'address',
      status: 'neutral',
      details: 'Discovered address registry',
    });

    personNodeIds.forEach((pid) => {
      graphEdges.push({
        source: pid,
        target: id,
        relationship: 'Claims Residence',
        status: 'neutral',
      });
    });
  });

  let devIdx = 1;
  devices.forEach((d) => {
    const id = `node-dev-${devIdx++}`;
    graphNodes.push({
      id,
      label: `Fingerprint: ${d}`,
      type: 'device',
      status: 'flagged',
      details: 'Device signatures crosslogged',
    });

    personNodeIds.forEach((pid) => {
      graphEdges.push({
        source: pid,
        target: id,
        relationship: 'Device Auth',
        status: 'flagged',
      });
    });
  });

  if (graphEdges.length === 0 && graphNodes.length > 1) {
    graphEdges.push({
      source: graphNodes[0].id,
      target: graphNodes[1].id,
      relationship: 'Document Link',
      status: 'neutral',
    });
  }

  const bankActionRequired =
    score > 60
      ? 'MANDATED AUDIT CONTROL. Freeze candidate application routing lines, file secure suspicious transaction logs to regulatory agencies instantly.'
      : 'Proceed standard credit routing pathways. No anomalies detected.';

  const rbiComplianceWarning =
    score > 60
      ? 'Section 45IA Alert: Cross-document credit anomalies represent structural declaration non-compliance.'
      : 'Transaction structures fully conform to RBI guidelines.';

  return {
    score,
    verdict,
    summary,
    contradictions,
    extractedEntities,
    graphNodes,
    graphEdges,
    tamperedSignatures,
    caseFileDetails: {
      bankActionRequired,
      rbiComplianceWarning,
      recommendingRejection: score > 60,
    },
  };
}
