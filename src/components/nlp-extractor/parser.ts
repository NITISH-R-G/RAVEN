import { DocumentItem } from "../../types";
import { ParsedEntity, LayoutDiscovered, SelectedModelType } from "./types";

export interface ParseResult {
  entities: ParsedEntity[];
  layout: LayoutDiscovered;
}

export const parseDocumentContent = (text: string, type: string, selectedModel: SelectedModelType, documentId: string): ParseResult => {
  const lines = text.split("\n");
  const tempEntities: ParsedEntity[] = [];
  let discoveredFields = 0;
  let currentLayout: LayoutDiscovered = { gridMatch: "Standard Template", fieldsCount: 0, density: "Normal", alignmentConfidence: 99.5 };

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

    currentLayout = {
      gridMatch: "Govt ITR-1/ITR-4 Form Schema",
      fieldsCount: discoveredFields,
      density: "High",
      alignmentConfidence: 98.4
    };

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

    currentLayout = {
      gridMatch: "Corporate Multi-Column Ledger",
      fieldsCount: discoveredFields,
      density: "Medium-High",
      alignmentConfidence: selectedModel === "layoutlm-v3" ? 99.4 : 96.1
    };

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

    currentLayout = {
      gridMatch: "State Real-Estate Stamps Survey",
      fieldsCount: discoveredFields,
      density: "Medium",
      alignmentConfidence: 97.9
    };

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
      value: `md5-${documentId.replace("doc-", "")}`,
      classification: "IDENTITY",
      confidence: 100.0,
      extractedFrom: "FineUploader Security Tag",
      status: "verified"
    });

    currentLayout = {
      gridMatch: "Unstructured Log & Metapage Schema",
      fieldsCount: discoveredFields || 2,
      density: "Low",
      alignmentConfidence: 93.5
    };
  }

  return { entities: tempEntities, layout: currentLayout };
};
