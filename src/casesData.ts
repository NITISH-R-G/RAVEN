import { CaseStudy } from "./types";

export const defaultCases: CaseStudy[] = [
  {
    id: "case-bangalore-double-mortgage",
    title: "Case study 1: Bangalore Double-Mortgage Fraud Ring",
    description: "Multi-document investigation targeting overlapping property registrations, matching bank templates, and device fingerprints sharing guarantor nodes.",
    targetRisk: "HIGH",
    riskFactorNotes: "Pixel-identical salary slip templates, matching device fingerprints across separate applicant IDs, and an invalid registration date overlapping resident records.",
    documents: [
      {
        id: "doc-itr-rajesh",
        name: "ITR_A_RajeshKumar_FY26.txt",
        type: "ITR",
        content: `INCOME TAX RETURN DEPT OF INDIA (ITR-1 SAHAJ)
ASSESSMENT YEAR: 2026-27 | FY: 2025-26
PAN: APXPK9821L | NAME: RAJESH KUMAR
ADDRESS: FLAT 402, GREEN GLEN LAYOUT, BELANDUR, BANGALORE - 560103
FILING DATE: 12-MAY-2026 | SUBMISSION STATUS: FINAL_SUCCESS
GROSS TOTAL INCOME: INR 45,00,000
TAXABLE INCOME: INR 42,40,000
EMPLOYMENT STATUS: PRIVATE SECTOR CO.
EMPLOYER CATEGORY: PRIVATE LTD.
EMPLOYER NAME: APEX DIGITAL SOLUTIONS PVT LTD`,
        metadata: {
          fileSize: "142 KB",
          createdDate: "2026-05-12 14:22:10",
          authorTool: "IT-FILLING-PORTAL-OFFICIAL",
          dpiCheck: "300 DPI",
          fontsPercent: "100% Embedded"
        }
      },
      {
        id: "doc-slip-rajesh",
        name: "Salary_Slip_Rajesh_April2026.txt",
        type: "SALARY_SLIP",
        content: `SALARY STATEMENT FOR MON APRIL 2026
EMPLOYEE CODE: EMP-88120 || NAME: RAJESH KUMAR
DESIGNATION: LEAD ARCHITECT
EMPLOYER: APEX TECH SOLUTIONS LTD (Discrepancy: ITR says Digital Solutions)
REG Office: 304, GREEN GLEN LAYOUT, BELANDUR, BANGALORE - 560103
GROSS SALARY: INR 1,20,000 / Month (Annualised: INR 14,40,000 - Discrepancy with 45L Income claims!)
NET PAYABLE CREDIT: INR 1,12,050
BANK ACCOUNT CREDIT: YES BANK - SB A/C: 90218312019`,
        metadata: {
          fileSize: "88 KB",
          createdDate: "2026-05-11 18:05:44",
          authorTool: "Canva Pro PDF Exporter (Signature of tampering!)",
          dpiCheck: "96 DPI (Web low resolution anomaly)",
          fontsPercent: "Not Embedded (Arial standard vector fonts block)"
        }
      },
      {
        id: "doc-prop-rajesh",
        name: "Bangalore_Property_Deed_B402.txt",
        type: "PROPERTY_VALUATION",
        content: `REGISTRATION & STAMPS DEPT, GOVT OF KARNATAKA
PROPERTY DEED & VALUATION REPORT // REFS-55102BA
PROPERTY TYPE: RESIDENTIAL APARTMENT (B-402, GREEN GLEN LAYOUT)
VALUATION AMOUNT: INR 1,80,000,000
MORTGAGE REGISTERED DATE: 12-MAY-2026 (Double-mortgaged - State logs check reports a concurrent lien filed at Canara Bank at the exact same hour)
REGISTRATION OWNER: RAJESH KUMAR
IDENTIFIED CO-OWNER/GUARANTOR: NISHA SHARMA`,
        metadata: {
          fileSize: "220 KB",
          createdDate: "2026-05-12 11:30:00",
          authorTool: "e-Registration Portal (State)",
          dpiCheck: "300 DPI",
          fontsPercent: "100% Embedded"
        }
      },
      {
        id: "doc-fingerprint-track",
        name: "Submissions_Suresh_CoApplicant.txt",
        type: "ID_PROOF",
        content: `CO-APPLICANT SUBMISSION RECORDS:
NAME: SURESH KUMAR
RELATION: CO-APPLICANT (Rajesh's Brother)
ADDRESS CLAIMED: FLAT 402, GREEN GLEN LAYOUT, BANGALORE
DEVICE ID: CanvasFingerprint:fp-88a29b4e (Anomaly matched to Rajesh's application device id fp-88a29b4e!)
SESSION IP: 103.210.43.12 (Known commercial proxy node VPN)
SUBMISSION TIMELINE: Parallel submissions sent exactly 4 minutes apart.`,
        metadata: {
          fileSize: "12 KB",
          createdDate: "2026-05-23 09:04:10",
          authorTool: "RAVEN-Log-Tracker-SDK"
        }
      }
    ]
  },
  {
    id: "case-mumbai-income-inflation",
    title: "Case study 2: The Co-Applicant Income Inflation Scam",
    description: "Investigation of a self-employed husband inflating salary slip figures 6x compared to structural tax submissions.",
    targetRisk: "HIGH",
    riskFactorNotes: "6x variance in declared income, Adobe suite modifications on a digital template, and a mismatching geographic IP locating the co-applicant in another state during submission.",
    documents: [
      {
        id: "doc-itr-vikram",
        name: "ITR-4_VikramNair_2025.txt",
        type: "ITR",
        content: `INCOME TAX DEPARTMENT, INDIA (PRESUMPTIVE BUSINESS INCOME)
FY 2024-25 | AY 2025-26 || REG NO: DLXPN2910J
ASSESSEE: VIKRAM NAIR
INDIVIDUAL STATUS: HUF APPLICANT / PROPRIETORY
BUSINESS ACTIVITY: RETAIL TRADE
REVENUE SUBMITTED UNDER SECTION 44AD: INR 12,50,000
NET TAXABLE PROFIT (ASSUMED INCOME): INR 5,00,000 (Filing confirms net income is ONLY 5 Lakhs per year)`,
        metadata: {
          fileSize: "95 KB",
          createdDate: "2025-07-31 23:12:00",
          authorTool: "E-Income-Tax-Daemon",
          dpiCheck: "300 DPI",
          fontsPercent: "100% Embedded"
        }
      },
      {
        id: "doc-slip-vikram",
        name: "Salary_Certificate_Nair_Retail.txt",
        type: "SALARY_SLIP",
        content: `SALARY CERTIFICATE & CASH CREDIT LOGS
NAIR GENERAL RETAIL ENTERPRISES PVT LTD
CERTIFYING OFFICERS DETAILS: COMM-OFFICE-MUMBAI
TO WHOMSOEVER IT MAY CONCERN:
WE CERTIFY VIKRAM NAIR IS OUR FOUNDER & CHIEF EXECUTIVE
DIRECT CREDITS PAID (MONTHLY FOR FY25): INR 2,50,000 Per Month (Calculates to INR 30,00,000 Annually - Over 600% higher than the Income Tax return reported!)
BONUS DECLARED: INR 5,00,000
SIGNATORY SIGN: S. RAO, REGISTERED DIRECTORS`,
        metadata: {
          fileSize: "320 KB",
          createdDate: "2026-05-10 10:15:22",
          authorTool: "Adobe Photoshop CC 2025 (Tampering detected!)",
          dpiCheck: "150 DPI (Anomaly)",
          fontsPercent: "72% Sub-Fonts Embedded"
        }
      },
      {
        id: "doc-session-nair",
        name: "IP_Tracing_Geolocation_Sheet.txt",
        type: "OTHER",
        content: `CO-APPLICANT IP NETWORK LOG:
IP ASSIGNED AND ACTIVE TIME: 115.118.90.11 (Location trace: New Delhi, India)
DEVICE PLATFORM: iPhone 15 Pro, iOS 17.4
REGISTRATION ADDRESS FOR MOBILE CLOUD: New Delhi
SUBMISSION IP FOR APPLICANT (PRIYA): 172.56.224.9 (Location trace: Mumbai, Maharashtra, India)
Mismatch detected: Husband vikram claiming live physical cooperation in Pune/Mumbai but sub IP matches New Delhi proxy line.`,
        metadata: {
          fileSize: "15 KB",
          createdDate: "2026-05-23 09:12:00",
          authorTool: "IP-GeoIntel-Daemon"
        }
      }
    ]
  },
  {
    id: "case-pune-clean-business",
    title: "Case study 3: Legit High-Value Business Loan (Pune)",
    description: "Fully-coherent premium business application with exact matching employer details, verified physical mapping, and secure matching tax returns.",
    targetRisk: "LOW",
    riskFactorNotes: "All data nodes align perfectly. Highly consistent records verified against external government APIs with perfect document structural checks.",
    documents: [
      {
        id: "doc-itr-desai",
        name: "ITR-3_AnitaDesai_FY26.txt",
        type: "ITR",
        content: `INCOME TAX RETURN FILING DEPT OF INDIA (ITR-3)
ASSESSMENT YEAR: 2026-27 | FY: 2025-26
PAN: DESAI8812A | NAME: ANITA DESAI
ADDRESS: ROW HOUSE #4, CENTRAL AVENUE, KOREGAON PARK, PUNE - 411001
GROSS REVENUES TRADED: INR 1,85,00,000
NET BUSINESS INCOME REPORTED: INR 78,00,000
COMPANY: DESAI ORGANICS EXPORTS PVT LTD`,
        metadata: {
          fileSize: "245 KB",
          createdDate: "2026-05-15 11:10:00",
          authorTool: "FINANCIAL-TAX-PORTAL-OFFICIAL",
          dpiCheck: "300 DPI",
          fontsPercent: "100% Embedded"
        }
      },
      {
        id: "doc-bank-desai",
        name: "Corporate_Bank_Statement_HDFC.txt",
        type: "SALARY_SLIP",
        content: `HDFC BANK LTD // CORPORATE ACCOUNT STATEMENT
A/C NO: 50201198511212 | HOLDER: DESAI ORGANICS EXPORTS PVT LTD
CORNER STONE AUDITED BRANCH: KOREGAON PARK BRANCH, PUNE
YEARLY CASH CREDITS VERIFIED:
TOTAL DEPOSITS (FY26): INR 1,85,00,000
TOTAL DEBITS (FY26): INR 1,07,00,000
NET CREDIT LEDGER BALANCE: INR 78,00,000 (Matches ITR Return precisely!)
VERIFICATION STATUS: BANK SECURE INTEGRATED CERTIFIED`,
        metadata: {
          fileSize: "412 KB",
          createdDate: "2026-05-18 09:30:00",
          authorTool: "HDFC-BANK-LEDGER-CORE",
          dpiCheck: "300 DPI",
          fontsPercent: "100% Embedded"
        }
      },
      {
        id: "doc-geo-desai",
        name: "Pune_Warehouse_Physical_Verification.txt",
        type: "PROPERTY_VALUATION",
        content: `PHYSICAL AUDIT AND WAREHOUSE VERIFICATION LOG
AUDITING OFFICER FOR COMMERCIAL SURE: V. GOKHALE
PROPERTY VERIFIED: REVENUE SURVEY 14/1, HADAPSAR INDUSTRIAL ESTATE, PUNE
COORDINATES GEOLOCATION: 18.5029° N, 73.9123° E (Matches Pune location)
VALUATION RATING: INR 8,50,00,000
OCCUPIED BY: DESAI ORGANICS EXPORTS PVT LTD
STATUS: CLEAN PHYSICAL LIEN DECLARED`,
        metadata: {
          fileSize: "180 KB",
          createdDate: "2026-05-20 16:45:00",
          authorTool: "GOVT-DIGILOCKER-VERIFIED-XML",
          dpiCheck: "300 DPI",
          fontsPercent: "100% Embedded"
        }
      }
    ]
  }
];
