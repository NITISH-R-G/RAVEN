import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

import { defaultCases } from "./src/casesData.js";
import { AnalysisResult, CaseStudy } from "./src/types.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy load Gemini Client
let _ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!_ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      console.log(`[RAVEN] Initializing server-side Gemini client with key.`);
      _ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } else {
      console.warn("[RAVEN] No valid GEMINI_API_KEY found in process.env. Falling back to heuristic/simulation analyzer.");
    }
  }
  return _ai;
}

// APIs FIRST
// 1. Get default Hackathon Case Studies
app.get("/api/cases", (req, res) => {
  res.json(defaultCases);
});

// Heuristic fallback matching the exact default case definitions
function runHeuristicSimulation(caseId: string, customDocuments?: any[]): AnalysisResult {
  console.log(`[RAVEN Heuristics] Running high-coherence rules on: ${caseId}`);
  
  if (caseId === "case-bangalore-double-mortgage") {
    return {
      score: 92,
      verdict: "HIGH RISK",
      summary: "Critically compromised loan story. The applicant's declared income of ₹45L in Income Tax Returns clashes completely with the salary statement showing ₹14.4L (annualised). Additionally, co-applicant Suresh Kumar submitted an application from the exact same physical browser fingerprint (fp-88a29b4e) via a known proxy hub, while the primary property has a concurrent double-lien warning flagged at Karnataka state registration stamps.",
      contradictions: [
        {
          title: "Employer Brand Discrepancy",
          severity: "medium",
          description: "Income Tax Return lists 'Apex Digital Solutions Pvt Ltd' as employer, while the provided salary slips show 'Apex Tech Solutions Ltd'. Potential synthetic employer setup.",
          crossDocSource: "ITR FY26 vs Salary Slip April 2026"
        },
        {
          title: "Extreme Income Misalignment",
          severity: "high",
          description: "Tax filings claim annual income of ₹45,00,000, but monthly salary slips demonstrate ₹1,20,000 credits (annualized ₹14,40,000). This represents an unsupported difference of over 300%.",
          crossDocSource: "ITR FY26 vs Salary Slips"
        },
        {
          title: "Co-Applicant Ring Device Linkage",
          severity: "high",
          description: "Primary applicant Rajesh Kumar and co-applicant Suresh Kumar submitted separate documents within minutes from the identical browser fingerprint (fp-88a29b4e). This bypasses traditional IP-address bans.",
          crossDocSource: "Device Fingerprint SDK Tracker"
        },
        {
          title: "Concurrent Secondary Mortgage Filing",
          severity: "high",
          description: "Bangalore Property Deed contains an active concurrent lien lookup error; Karnataka state records indicate another application was logged for B-402 Green Glen Layout at Canara Bank within the same week.",
          crossDocSource: "Karnataka Property Registry Audit"
        }
      ],
      extractedEntities: [
        { entity: "Rajesh Kumar", value: "Primary Applicant", docType: "ITR" },
        { entity: "Suresh Kumar", value: "Co-Applicant (Linked)", docType: "Device Tracker" },
        { entity: "Nisha Sharma", value: "Guarantor Owner", docType: "Property Deed" },
        { entity: "Apex Tech Solutions", value: "Employer Name Clashed", docType: "Salary Slip" },
        { entity: "fp-88a29b4e", value: "Browser Fingerprint ID", docType: "Device Tracker" }
      ],
      graphNodes: [
        { id: "node-rajesh", label: "Rajesh Kumar (Applicant)", type: "person", status: "flagged", details: "Income clash & linked device" },
        { id: "node-suresh", label: "Suresh Kumar (Co-Applicant)", type: "person", status: "flagged", details: "Shared Submission Signature" },
        { id: "node-nisha", label: "Nisha Sharma (Guarantor)", type: "person", status: "neutral", details: "Property Deed co-signer" },
        { id: "node-flat402", label: "Flat 402, Green Glen Layout", type: "address", status: "flagged", details: "Target property with dual mortgages" },
        { id: "node-apex-digital", label: "Apex Digital Solutions", type: "employer", status: "verified", details: "ITR reported employer" },
        { id: "node-apex-tech", label: "Apex Tech Solutions", type: "employer", status: "flagged", details: "Salary slip employer (discrepant)" },
        { id: "node-fp-device", label: "Fingerprint ID: fp-88a29b4e", type: "device", status: "flagged", details: "Shared by Rajesh & Suresh" }
      ],
      graphEdges: [
        { source: "node-rajesh", target: "node-flat402", relationship: "Claimed Address", status: "neutral" },
        { source: "node-suresh", target: "node-flat402", relationship: "Claimed Address", status: "neutral" },
        { source: "node-nisha", target: "node-flat402", relationship: "Co-Owner", status: "neutral" },
        { source: "node-rajesh", target: "node-apex-digital", relationship: "Employed By", status: "neutral" },
        { source: "node-rajesh", target: "node-apex-tech", relationship: "Claimed Salary From", status: "flagged" },
        { source: "node-rajesh", target: "node-fp-device", relationship: "Submitted Via Device", status: "flagged" },
        { source: "node-suresh", target: "node-fp-device", relationship: "Submitted Via Device", status: "flagged" }
      ],
      tamperedSignatures: [
        {
          signature: "Canva Pro PDF Exporter Tag",
          confidence: 95,
          explanation: "Salary slip contains Canva PDF generator metadata tags. Legitimate commercial salary statements are compiled by enterprise HR systems, not online graphical editors."
        },
        {
          signature: "Low Web Resolution DPI Check",
          confidence: 88,
          explanation: "Salary slip rendered at 96 DPI, suggesting it is a graphical screenshot edit rather than an authentic digital PDF vector stream."
        }
      ],
      caseFileDetails: {
        bankActionRequired: "PROMPT LEGAL REPORTING. Place immediate lock on Rajesh and Suresh Kumar PANs, notify risk team at Canara Bank to crosscheck double lien on green glen property.",
        rbiComplianceWarning: "Section 45IA Alert: Double mortgage represents structural banking theft. Requires filing a suspicious transaction report (STR) to FIU-IND within 48 hours.",
        recommendingRejection: true
      },
      isSimulated: true
    };
  }

  if (caseId === "case-mumbai-income-inflation") {
    return {
      score: 84,
      verdict: "HIGH RISK",
      summary: "Co-applicant Vikram Nair's declared salary cert details represent a severe, 600% inflation over the certified business Income Tax Returns. Metadata audits indicate Adobe Photoshop modifying trace paths in the salary slip layout.",
      contradictions: [
        {
          title: "6x Income Fabrication",
          severity: "high",
          description: "Vikram Nair's presumptive business income filed at tax registry is exactly ₹5,00,000 yearly. Meanwhile, his salary certificate claims a base credit of ₹2,50,000 per month (total of ₹30L yearly). Over 6 times inflated.",
          crossDocSource: "ITR Presumptive Business vs Salary Certificate"
        },
        {
          title: "Graphic Manipulation Metadata",
          severity: "high",
          description: "Vikram's salary certificate PDF shows structure modification paths mapped directly to 'Adobe Photoshop CC 2025' digital adjustments.",
          crossDocSource: "Salary Document Metadata Inspect"
        },
        {
          title: "Co-applicant Physical Location Mismatch",
          severity: "medium",
          description: "Primary applicant Priya submitted physical files from Mumbai, but the session tracking registers co-applicant Vikram's authorization IP trace from a New Delhi node.",
          crossDocSource: "IP Tracing Geolocation logs"
        }
      ],
      extractedEntities: [
        { entity: "Vikram Nair", value: "Co-Applicant / Self-Employed", docType: "ITR" },
        { entity: "Priya Nair", value: "Primary Applicant", docType: "Application" },
        { entity: "New Delhi Proxy IP", value: "Submitting IP Location", docType: "Network Logs" }
      ],
      graphNodes: [
        { id: "node-vikram", label: "Vikram Nair (Co-Applicant)", type: "person", status: "flagged", details: "600% income inflation" },
        { id: "node-priya", label: "Priya Nair (Applicant)", type: "person", status: "neutral", details: "Presents in Mumbai" },
        { id: "node-nair-retail", label: "Nair Retail Enterprises", type: "employer", status: "flagged", details: "Used to issue inflated salary slip" },
        { id: "node-delhi-ip", label: "IP: 115.118.90.11 (Delhi)", type: "device", status: "flagged", details: "Vikram session routing state" },
        { id: "node-mumbai-ip", label: "IP: 172.56.224.9 (Mumbai)", type: "device", status: "neutral", details: "Priya session routing state" }
      ],
      graphEdges: [
        { source: "node-priya", target: "node-mumbai-ip", relationship: "Auth Physical IP", status: "neutral" },
        { source: "node-vikram", target: "node-delhi-ip", relationship: "Auth Physical IP", status: "flagged" },
        { source: "node-vikram", target: "node-nair-retail", relationship: "Proprietor Owner", status: "neutral" },
        { source: "node-priya", target: "node-vikram", relationship: "Spouse", status: "neutral" }
      ],
      tamperedSignatures: [
        {
          signature: "Adobe Photoshop Modification Trace",
          confidence: 90,
          explanation: "Binary layers of the Salary_Certificate PDF register active Adobe Photoshop workspace artifacts. Authentic payroll docs are never edited with raster graphic suites."
        }
      ],
      caseFileDetails: {
        bankActionRequired: "Reject application and restrict credit underwriting lines. Do not disperse personal segment limits to Vikram Nair's accounts.",
        rbiComplianceWarning: "Unverifiable financial statement representing false declarations under RBI credit vetting rules.",
        recommendingRejection: true
      },
      isSimulated: true
    };
  }

  // Fallback / Legit Pune Case or Custom Analysis
  return {
    score: 12,
    verdict: "LOW RISK",
    summary: "Perfect document alignment. Anita Desai's reported Income Tax margins are strictly coherent with corporate HDFC ledger deposits, and physical validation on the Hadapsar warehouse asset registers healthy, verified records.",
    contradictions: [],
    extractedEntities: [
      { entity: "Anita Desai", value: "Primary CEO Applicant", docType: "ITR" },
      { entity: "HDFC Bank", value: "Verified Ledger Core", docType: "Bank Ledger" },
      { entity: "Pune Warehouse", value: "Property Security Asset", docType: "Physical Audit" }
    ],
    graphNodes: [
      { id: "node-anita", label: "Anita Desai (Applicant)", type: "person", status: "verified", details: "Filing records fully valid" },
      { id: "node-desai-organic", label: "Desai Organics Exports", type: "employer", status: "verified", details: "Registered corporate exporter" },
      { id: "node-hadapsar", label: "Warehouse Pune", type: "property", status: "verified", details: "Geolocated Pune Asset" },
      { id: "node-hdfc", label: "HDFC A/C: 50201198511212", type: "address", status: "verified", details: "Audited ledger accounts" }
    ],
    graphEdges: [
      { source: "node-anita", target: "node-desai-organic", relationship: "CEO & Shareholder", status: "verified" },
      { source: "node-desai-organic", target: "node-hadapsar", relationship: "Coordinates Audit Link", status: "verified" },
      { source: "node-desai-organic", target: "node-hdfc", relationship: "Treasury Bank", status: "verified" }
    ],
    tamperedSignatures: [],
    caseFileDetails: {
      bankActionRequired: "Proceed with standard business underwriting tracks. No structural anomalies found.",
      rbiComplianceWarning: "Documents fully clean and RBI Audit compliant.",
      recommendingRejection: false
    },
    isSimulated: true
  };
}

// 2. Main RAVEN Analyze API (Layered Coherence check using Gemini + fallback)
app.post("/api/analyze", async (req, res) => {
  const { caseId, documents, useManagedAgent, managedAgentId } = req.body;
  const ai = getGeminiClient();

  // Helper to enrich simulation/heuristic cases with agent configurations
  const enrichWithAgentStats = (data: AnalysisResult): AnalysisResult => {
    if (useManagedAgent) {
      return {
        ...data,
        summary: `[Managed Agent Account Sweep] Verified collectively under custom AGENTS.md rulesets. ${data.summary}`,
        managedAgentStats: {
          agentId: managedAgentId || "raven-coherence-auditor",
          description: "Automated underwriting auditor and relational anomaly processor.",
          loadedSkills: ["presentation-exporter", "graphDB-sweeper"],
          traversalDirectives: "MATCH (p1:Person)-[:SUBMITMED_VIA]->(d:Device)<-[:SUBMITMED_VIA]-(p2:Person) RETURN p1, p2, d",
          active: true
        }
      };
    }
    return data;
  };

  // If no AI client, or it's a default static case, we can leverage our clean simulator or custom AI parser
  if (!ai) {
    // If it's a built-in default case, serve the highly polished simulated case
    if (caseId && (caseId.startsWith("case-"))) {
      const result = runHeuristicSimulation(caseId, documents);
      return res.json(enrichWithAgentStats(result));
    }
    
    // Custom documentation heuristic
    const customResult = {
      score: 65,
      verdict: "MEDIUM RISK" as "MEDIUM RISK",
      summary: "Custom files analyzed via RAVEN heuristics. System noted potential structural discrepancies. (Enable full AI key for deep reasoning tree mappings).",
      contradictions: [
        {
          title: "Custom Review Needed",
          severity: "medium" as "medium",
          description: "Analyzing custom files. To unlock 100% deep cross-doc logic with entity parsing, attach your paid/free Gemini API key in the AI Studio Settings drawer.",
          crossDocSource: "RAVEN System Fallback Tracker"
        }
      ],
      extractedEntities: [
        { entity: "Custom Applicant", value: "Primary File Target", docType: "Upload" }
      ],
      graphNodes: [
        { id: "node-cust", label: "Custom Review Target", type: "person" as "person", status: "neutral" as "neutral" }
      ],
      graphEdges: [],
      tamperedSignatures: [
        { signature: "Manual Review Tag", confidence: 50, explanation: "Fallback heuristics activated. Visual analysis requires active Gemini credentials." }
      ],
      caseFileDetails: {
        bankActionRequired: "Review uploaded files manually or configure an active Gemini API key inside your environment.",
        rbiComplianceWarning: "Standard credit vetting protocols apply.",
        recommendingRejection: false
      },
      isSimulated: true
    };
    return res.json(enrichWithAgentStats(customResult));
  }

  try {
    // Compile docs text
    let promptDocs = "";
    if (documents && Array.isArray(documents)) {
      documents.forEach((doc: any, i: number) => {
        promptDocs += `\n\n--- DOCUMENT ${i + 1}: ${doc.name} (Type: ${doc.type}) ---\n${doc.content}\n`;
      });
    } else {
      // Fetch default case docs if none sent
      const loadedCase = defaultCases.find(c => c.id === caseId);
      if (loadedCase) {
        loadedCase.documents.forEach((doc: any, i: number) => {
          promptDocs += `\n\n--- DOCUMENT ${i + 1}: ${doc.name} (Type: ${doc.type}) ---\n${doc.content}\n`;
        });
      }
    }

    const systemPrompt = `You are RAVEN (Risk Analysis & Verification Network), a state-of-the-art fraud intelligence engine built for banking auditors and risk teams.
Your job is not verifying individual files in isolation; your primary task is TO VERIFY THE STORY.
Check for clashes/contradictions across the documents (e.g., matching or discrepant income figures between ITR and salary certificates, mismatched registration dates, visual/graphic template modifications, identical device signatures across separate applicants).

You operate across 4 layers of intelligence:
1. Ingestion: Analyze fields from provided files.
2. Cross-Document Coherence: Flags mismatches (income, identity, dates, addresses, employers) that span multiple documents.
3. Graph & Fraud Ring Detection: Create logic nodes (person, property, address, device, employer, phone) and edges representing links. Flag dangerous edges or clusters (e.g. sharing device fingerprint across separate ID filings, pixel-level salary templates).
4. Case File compilation: Produce a structured weighted risk score (0-100) and actionable decision.

Analyze the documents below. You MUST respond in valid JSON format. Follow the strict schema exactly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: systemPrompt },
        { text: `Evaluate these submitted documents collectively:\n${promptDocs}` }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.INTEGER,
              description: "Weighted credit fraud/ring score from 0 to 100."
            },
            verdict: {
              type: Type.STRING,
              description: "Must be 'HIGH RISK', 'MEDIUM RISK', or 'LOW RISK'."
            },
            summary: {
              type: Type.STRING,
              description: "Summary of the whole application's coherence or fraud warnings. Mention specific files."
            },
            contradictions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  severity: { type: Type.STRING, description: "Must be 'high', 'medium', or 'low'" },
                  description: { type: Type.STRING },
                  crossDocSource: { type: Type.STRING, description: "Clashing document tags, e.g. ITR vs Salary" }
                },
                required: ["title", "severity", "description", "crossDocSource"]
              }
            },
            extractedEntities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  entity: { type: Type.STRING },
                  value: { type: Type.STRING },
                  docType: { type: Type.STRING }
                },
                required: ["entity", "value", "docType"]
              }
            },
            graphNodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Unique snake-case id of node" },
                  label: { type: Type.STRING, description: "Short human label" },
                  type: { type: Type.STRING, description: "person, property, address, device, employer, or phone" },
                  status: { type: Type.STRING, description: "flagged, neutral, or verified" },
                  details: { type: Type.STRING }
                },
                required: ["id", "label", "type", "status"]
              }
            },
            graphEdges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  source: { type: Type.STRING, description: "Must match a valid node ID" },
                  target: { type: Type.STRING, description: "Must match a valid node ID" },
                  relationship: { type: Type.STRING, description: "Short label, e.g. Employed By, Shared Signature" },
                  status: { type: Type.STRING, description: "flagged, neutral, or verified" }
                },
                required: ["source", "target", "relationship", "status"]
              }
            },
            tamperedSignatures: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  signature: { type: Type.STRING, description: "Feature/Anomaly detected indicating manipulation" },
                  confidence: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["signature", "confidence", "explanation"]
              }
            },
            caseFileDetails: {
              type: Type.OBJECT,
              properties: {
                bankActionRequired: { type: Type.STRING, description: "Concrete immediate operations tasks for risk team." },
                rbiComplianceWarning: { type: Type.STRING, description: "Direct guidelines under RBI standards." },
                recommendingRejection: { type: Type.BOOLEAN }
              },
              required: ["bankActionRequired", "rbiComplianceWarning", "recommendingRejection"]
            }
          },
          required: [
            "score", "verdict", "summary", "contradictions", "extractedEntities",
            "graphNodes", "graphEdges", "tamperedSignatures", "caseFileDetails"
          ]
        }
      }
    });

    const parsedData: AnalysisResult = JSON.parse(response.text || "{}");
    parsedData.isSimulated = false;
    res.json(enrichWithAgentStats(parsedData));
  } catch (error: any) {
    console.error("[RAVEN AI Error] Failed to evaluate using Gemini:", error);
    // Graceful fallback to rich simulation if Gemini errors
    const fallback = runHeuristicSimulation(caseId || "pune-legit-default", documents);
    res.json(enrichWithAgentStats({
      ...fallback,
      summary: `Fallback activated (AI call error: ${error.message}). ${fallback.summary}`,
    }));
  }
});

// Vite & Static Server Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[RAVEN] Starting Vite Developer Mode server (Port ${PORT})...`);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log(`[RAVEN] Starting Production compiled server (Port ${PORT})...`);
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files from the 'dist' directory
    app.use(express.static(distPath));
    
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[RAVEN Engine ready on http://0.0.0.0:${PORT}]`);
  });
}

startServer();
