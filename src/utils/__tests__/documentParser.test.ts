import { describe, it, expect } from 'vitest';
import { parseDocument } from '../documentParser';
import { DocumentItem } from '../../types';

describe('parseDocument', () => {
  describe('ITR Document Type', () => {
    it('extracts standard ITR fields correctly with anthropic-finance model', () => {
      const text = [
        "Name: John Doe",
        "PAN: ABCDE1234F",
        "Gross Total Income: 1500000",
        "Employer Name: Tech Corp",
        "Assessment Year: 2023-24",
        "Address: 123 Main St, City"
      ].join('\n');

      const doc: DocumentItem = { id: 'doc-1', content: text, type: 'ITR', name: 'itr.pdf' };

      const result = parseDocument({ document: doc, nlpModel: 'anthropic-finance' });

      expect(result.layout.gridMatch).toBe("Govt ITR-1/ITR-4 Form Schema");
      expect(result.entities).toHaveLength(6);

      const nameEntity = result.entities.find(e => e.field === "Taxpayer Identity");
      expect(nameEntity).toBeDefined();
      expect(nameEntity?.value).toBe("John Doe");
      expect(nameEntity?.confidence).toBe(99.2);

      const panEntity = result.entities.find(e => e.field === "Permanent Account Number (PAN)");
      expect(panEntity).toBeDefined();
      expect(panEntity?.value).toBe("ABCDE1234F");
      expect(panEntity?.status).toBe("verified");
    });

    it('flags short PANs with warning status', () => {
      const doc: DocumentItem = { id: 'doc-1', content: "PAN: SHORT", type: 'ITR', name: 'itr.pdf' };
      const result = parseDocument({ document: doc, nlpModel: 'fingpt-llama' });

      const panEntity = result.entities.find(e => e.field === "Permanent Account Number (PAN)");
      expect(panEntity?.status).toBe("warning");
      expect(panEntity?.value).toBe("SHORT");

      const nameEntity = result.entities.find(e => e.field === "Taxpayer Identity");
      expect(nameEntity?.confidence).toBe(95.8);
    });

    it('flags discrepant income for rajesh > 2000000', () => {
      const doc: DocumentItem = { id: 'doc-1', content: "Name: Rajesh Kumar\nGross Total Income: 2500000", type: 'ITR', name: 'itr.pdf' };
      const result = parseDocument({ document: doc, nlpModel: 'fingpt-llama' });

      const incomeEntity = result.entities.find(e => e.field === "Declared Gross Income");
      expect(incomeEntity?.status).toBe("discrepant");
    });
  });

  describe('SALARY_SLIP Document Type', () => {
    it('extracts salary slip fields correctly with layoutlm-v3 model', () => {
      const text = [
        "Beneficiary: Jane Smith",
        "Company: MegaCorp Inc",
        "Gross Salary: 85000",
        "Bank Account: HDFC Bank"
      ].join('\n');

      const doc: DocumentItem = { id: 'doc-2', content: text, type: 'SALARY_SLIP', name: 'salary.pdf' };
      const result = parseDocument({ document: doc, nlpModel: 'layoutlm-v3' });

      expect(result.layout.gridMatch).toBe("Corporate Multi-Column Ledger");
      expect(result.layout.alignmentConfidence).toBe(99.4);
      expect(result.entities).toHaveLength(4);

      const empEntity = result.entities.find(e => e.field === "Corporate Employer");
      expect(empEntity?.value).toBe("MegaCorp Inc");
      expect(empEntity?.status).toBe("verified");
    });

    it('detects discrepancy in employer', () => {
      const doc: DocumentItem = { id: 'doc-2', content: "Employer: MegaCorp Discrepancy", type: 'SALARY_SLIP', name: 'salary.pdf' };
      const result = parseDocument({ document: doc, nlpModel: 'fingpt-llama' });

      const empEntity = result.entities.find(e => e.field === "Corporate Employer");
      expect(empEntity?.status).toBe("discrepant");
    });

    it('detects discrepant gross salary when text contains photoshop', () => {
      const doc: DocumentItem = { id: 'doc-2', content: "Gross Salary: 85000\nNote: This is a photoshop", type: 'SALARY_SLIP', name: 'salary.pdf' };
      const result = parseDocument({ document: doc, nlpModel: 'fingpt-llama' });

      const salaryEntity = result.entities.find(e => e.field === "Gross Stated Salary");
      expect(salaryEntity?.status).toBe("discrepant");
    });
  });

  describe('PROPERTY_VALUATION Document Type', () => {
    it('extracts property valuation fields correctly', () => {
      const text = [
        "Valuation Reference: REF-999",
        "Registration Owner: Bob Builder",
        "Valuation Amount: 5000000",
        "Address: 456 Elm St"
      ].join('\n');

      const doc: DocumentItem = { id: 'doc-3', content: text, type: 'PROPERTY_VALUATION', name: 'prop.pdf' };
      const result = parseDocument({ document: doc, nlpModel: 'anthropic-finance' });

      expect(result.layout.gridMatch).toBe("State Real-Estate Stamps Survey");
      expect(result.entities).toHaveLength(4);

      const valEntity = result.entities.find(e => e.field === "Appraised Liquidity Value");
      expect(valEntity?.value).toBe("5000000");
    });

    it('flags double-mortgaged status', () => {
      const doc: DocumentItem = { id: 'doc-3', content: "Valuation Amount: 5000000\nNote: Double-mortgaged property", type: 'PROPERTY_VALUATION', name: 'prop.pdf' };
      const result = parseDocument({ document: doc, nlpModel: 'anthropic-finance' });

      const valEntity = result.entities.find(e => e.field === "Appraised Liquidity Value");
      expect(valEntity?.status).toBe("discrepant");
    });
  });

  describe('General/Fallback Document Type', () => {
    it('extracts device and IP details', () => {
      const text = [
        "Session IP: 192.168.1.1",
        "Device ID: device-123"
      ].join('\n');

      const doc: DocumentItem = { id: 'doc-4', content: text, type: 'OTHER', name: 'log.txt' };
      const result = parseDocument({ document: doc, nlpModel: 'fingpt-llama' });

      expect(result.layout.gridMatch).toBe("Unstructured Log & Metapage Schema");
      // Expect 3 entities: IP, Device, and the default Document Ingestion Hash
      expect(result.entities).toHaveLength(3);

      const ipEntity = result.entities.find(e => e.field === "Identified Client IP Geolocation");
      expect(ipEntity?.value).toBe("192.168.1.1");

      const deviceEntity = result.entities.find(e => e.field === "Extracted Target Device Engine Signature");
      expect(deviceEntity?.value).toBe("device-123");

      const hashEntity = result.entities.find(e => e.field === "Document Ingestion Hash");
      expect(hashEntity?.value).toBe("md5-4");
    });

    it('handles anomaly in device ID', () => {
      const doc: DocumentItem = { id: 'doc-4', content: "Device ID: unknown anomaly", type: 'OTHER', name: 'log.txt' };
      const result = parseDocument({ document: doc, nlpModel: 'fingpt-llama' });

      const deviceEntity = result.entities.find(e => e.field === "Extracted Target Device Engine Signature");
      expect(deviceEntity?.status).toBe("warning");
    });

    it('handles mismatch in IP', () => {
      const doc: DocumentItem = { id: 'doc-4', content: "Session IP: 10.0.0.1 mismatch", type: 'OTHER', name: 'log.txt' };
      const result = parseDocument({ document: doc, nlpModel: 'fingpt-llama' });

      const ipEntity = result.entities.find(e => e.field === "Identified Client IP Geolocation");
      expect(ipEntity?.status).toBe("discrepant");
    });
  });
});