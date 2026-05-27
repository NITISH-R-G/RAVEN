import { DocumentItem } from "../types";

export const INITIAL_DEMO_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-itr",
    name: "ITR_Declaration_FY26.txt",
    type: "ITR",
    content: `INCOME TAX RETURN DEPT OF INDIA (ITR-1 SAHAJ)
FILING YEAR: 2026-27 | PAN: APXPK9821L
NAME: RAJESH KUMAR
ADDRESS: FLAT 402, GREEN GLEN LAYOUT, BELANDUR, BANGALORE - 560103
GROSS TOTAL INCOME: INR 45,00,000
EMPLOYMENT STATUS: PRIVATE SECTOR CO.
EMPLOYER NAME: APEX DIGITAL SOLUTIONS PVT LTD`,
    metadata: {
      fileSize: "142 KB",
      createdDate: "2026-05-12 14:22:10",
      authorTool: "IT-FILING-PORTAL-OFFICIAL",
      dpiCheck: "300 DPI",
      fontsPercent: "100% Embedded"
    }
  },
  {
    id: "doc-slip",
    name: "Enterprise_Salary_Slip_April2026.txt",
    type: "SALARY_SLIP",
    content: `SALARY STATEMENT FOR MONTH OF APRIL 2026
EMPLOYEE CODE: EMP-88120 || NAME: RAJESH KUMAR
EMPLOYER: APEX TECH SOLUTIONS LTD (Discrepancy: Tax ITR says Digital Solutions!)
GROSS SALARY: INR 1,20,000 / Month (Annualised: INR 14,40,000 - Discrepancy with 45L declared income!)
NET PAYABLE CREDIT: INR 1,12,050`,
    metadata: {
      fileSize: "88 KB",
      createdDate: "2026-05-11 18:05:44",
      authorTool: "Canva Pro PDF Exporter (Tampered!)",
      dpiCheck: "96 DPI (Web low resolution anomaly)",
      fontsPercent: "Not Embedded"
    }
  },
  {
    id: "doc-deed",
    name: "Property_Registry_Deed_B402.txt",
    type: "PROPERTY_VALUATION",
    content: `REGISTRATION & STAMPS DEPT, GOVT OF KARNATAKA
PROPERTY DEED & VALUATION REPORT // REFS-55102BA
B-402, GREEN GLEN LAYOUT, BELANDUR, BANGALORE - 560103
VALUATION AMOUNT: INR 1,80,000,000
MORTGAGE REGISTERED DATE: 12-MAY-2026 (Double mortgage flagged - State logs check concurrent lien filed at Canara Bank within the exact same week)
OWNER: RAJESH KUMAR`,
    metadata: {
      fileSize: "220 KB",
      createdDate: "2026-05-12 11:30:00",
      authorTool: "e-Registration Portal (State)",
      dpiCheck: "300 DPI",
      fontsPercent: "100% Embedded"
    }
  },
  {
    id: "doc-devices",
    name: "Session_Fingerprint_DeviceLogs.txt",
    type: "ID_PROOF",
    content: `CO-APPLICANT SUBMISSION RECORDS:
NAME: SURESH KUMAR
RELATION: CO-APPLICANT (Rajesh's Brother)
ADDRESS CLAIMED: FLAT 402, GREEN GLEN LAYOUT, BANGALORE
DEVICE ID: CanvasFingerprint:fp-88a29b4e (Collision detected with Rajesh Kumar device footprint fp-88a29b4e!)
SESSION IP: 103.210.43.12 (VPN commercial proxy node)
SUBMISSION TIMELINE: Parallel submissions sent exactly 4 minutes apart.`,
    metadata: {
      fileSize: "12 KB",
      createdDate: "2026-05-23 09:04:10",
      authorTool: "RAVEN-Log-Tracker-SDK"
    }
  }
];
