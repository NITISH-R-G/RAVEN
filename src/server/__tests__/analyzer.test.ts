import { describe, it, expect } from 'vitest';
import { analyzeDocumentsDynamically } from '../analyzer.js';
import { DocumentItem } from '../../types.js';

describe('analyzeDocumentsDynamically', () => {
  it('should handle empty documents correctly', () => {
    const result = analyzeDocumentsDynamically([]);

    expect(result.score).toBe(12);
    expect(result.verdict).toBe('LOW RISK');
    expect(result.summary).toContain('Success: Relational sweep completed clean.');
    expect(result.contradictions).toHaveLength(0);
    expect(result.extractedEntities).toHaveLength(0);
    expect(result.tamperedSignatures).toHaveLength(0);

    // Should have exactly 1 default graph node and 0 edges
    expect(result.graphNodes).toHaveLength(1);
    expect(result.graphNodes[0].type).toBe('person');
    expect(result.graphNodes[0].label).toBe('Discovered Applicant');
    expect(result.graphEdges).toHaveLength(0);
  });

  it('should correctly extract and parse entities from document text', () => {
    const documents: DocumentItem[] = [
      {
        id: 'doc-1',
        name: 'test_doc.pdf',
        type: 'ITR',
        content: `
          NAME: John Doe
          PAN: ABCDE1234F
          device id: abc-123-def
          EMPLOYER: Acme Corp
          ADDRESS: 123 Main St, Springfield
          GTI: 1000000
        `
      },
      {
        id: 'doc-2',
        name: 'test_slip.pdf',
        type: 'SALARY_SLIP',
        content: `
          EMPLOYER: Acme Corp
          GROSS SALARY: 83333.33
        `
      }
    ];

    const result = analyzeDocumentsDynamically(documents);

    // Score shouldn't be elevated by just having consistent entities
    expect(result.score).toBe(12);
    expect(result.verdict).toBe('LOW RISK');

    // Check extracted entities
    const extractedNames = result.extractedEntities.filter(e => e.value.includes('Signee'));
    const extractedPans = result.extractedEntities.filter(e => e.value.includes('Tax PAN ID'));

    expect(extractedNames[0].entity).toBe('John Doe');
    expect(extractedPans[0].entity).toBe('ABCDE1234F');

    // Check Graph Nodes (Person, Employer, Address, Device)
    const personNodes = result.graphNodes.filter(n => n.type === 'person');
    const employerNodes = result.graphNodes.filter(n => n.type === 'employer');
    const addressNodes = result.graphNodes.filter(n => n.type === 'address');
    const deviceNodes = result.graphNodes.filter(n => n.type === 'device');

    expect(personNodes).toHaveLength(1);
    expect(personNodes[0].label).toContain('John Doe');

    expect(employerNodes).toHaveLength(1);
    expect(employerNodes[0].label).toBe('Acme Corp');

    expect(addressNodes).toHaveLength(1);
    expect(addressNodes[0].label).toBe('123 Main St');

    expect(deviceNodes).toHaveLength(1);
    expect(deviceNodes[0].label).toContain('abc-123-def');
  });

  it('should detect tampered signatures via text, authorTool, and DPI', () => {
    const documents: DocumentItem[] = [
      {
        id: 'doc-1',
        name: 'fake_payslip.pdf',
        type: 'SALARY_SLIP',
        content: 'This document was designed using Canva...',
        metadata: {
          authorTool: 'Adobe Photoshop CC',
          dpiCheck: '72 DPI'
        }
      }
    ];

    const result = analyzeDocumentsDynamically(documents);

    // Expect score base to be overridden to 35, or increased by contradictions logic
    // tamperedSignatures overrides base to 35, plus loop logic might add more but here no contradictions.
    // Wait, let's trace: score = 35 for tampered signatures without contradictions.
    expect(result.score).toBe(35);
    expect(result.verdict).toBe('MEDIUM RISK');

    expect(result.tamperedSignatures).toHaveLength(3);

    const signatures = result.tamperedSignatures.map(ts => ts.signature);
    expect(signatures).toContain('Canva Pro Template Mark');
    expect(signatures).toContain('Adobe Photoshop CC adjustment layers');
    expect(signatures).toContain('Low Resolution Raster Anomaly');
  });

  it('should trigger Employer Brand Identification Conflict', () => {
    const documents: DocumentItem[] = [
      {
        id: 'doc-1',
        name: 'itr.pdf',
        type: 'ITR',
        content: 'EMPLOYER: Acme Corp'
      },
      {
        id: 'doc-2',
        name: 'slip.pdf',
        type: 'SALARY_SLIP',
        content: 'EMPLOYER: Globex Corporation'
      }
    ];

    const result = analyzeDocumentsDynamically(documents);

    const contradictions = result.contradictions.filter(c => c.title === 'Employer Brand Identification Conflict');
    expect(contradictions).toHaveLength(1);
    expect(contradictions[0].severity).toBe('medium');

    // 0 high * 35 + 1 med * 18 + 0 * 12 + 10 = 28. Base is 12. Score becomes 28.
    expect(result.score).toBe(28);
    expect(result.verdict).toBe('LOW RISK');
  });

  it('should trigger Income Margin Misalignment (high severity)', () => {
    const documents: DocumentItem[] = [
      {
        id: 'doc-1',
        name: 'itr.pdf',
        type: 'ITR',
        content: 'GTI: 1000000'
      },
      {
        id: 'doc-2',
        name: 'slip.pdf',
        type: 'SALARY_SLIP',
        content: 'GROSS SALARY: 10000' // Annualized = 120,000
      }
    ];

    // Ratio = 1000000 / 120000 = 8.33 (> 2, so severity high)
    const result = analyzeDocumentsDynamically(documents);

    const contradictions = result.contradictions.filter(c => c.title === 'Income Margin Misalignment');
    expect(contradictions).toHaveLength(1);
    expect(contradictions[0].severity).toBe('high');

    // 1 high * 35 + 0 med * 18 + 0 * 12 + 10 = 45
    expect(result.score).toBe(45);
    expect(result.verdict).toBe('MEDIUM RISK');
  });

  it('should trigger Income Margin Misalignment (medium severity)', () => {
    const documents: DocumentItem[] = [
      {
        id: 'doc-1',
        name: 'itr.pdf',
        type: 'ITR',
        content: 'GTI: 600000'
      },
      {
        id: 'doc-2',
        name: 'slip.pdf',
        type: 'SALARY_SLIP',
        content: 'GROSS SALARY: 40000' // Annualized = 480,000
      }
    ];

    // Ratio = 600000 / 480000 = 1.25. Wait, > 1.25 is required.
    // Let's use 40000 -> 480,000 vs 650,000
    documents[0].content = 'GTI: 650000';
    // Ratio = 650000 / 480000 = 1.35 (between 1.25 and 2, so medium)

    const result = analyzeDocumentsDynamically(documents);
    const contradictions = result.contradictions.filter(c => c.title === 'Income Margin Misalignment');
    expect(contradictions).toHaveLength(1);
    expect(contradictions[0].severity).toBe('medium');
    expect(result.score).toBe(28);
  });

  it('should trigger Device Footprint Collision', () => {
    const documents: DocumentItem[] = [
      {
        id: 'doc-1',
        name: 'doc1.pdf',
        type: 'OTHER',
        content: 'NAME: John Doe\ndevice id: abc-123-def'
      },
      {
        id: 'doc-2',
        name: 'doc2.pdf',
        type: 'OTHER',
        content: 'NAME: Jane Smith\ndevice id: abc-123-def'
      }
    ];

    const result = analyzeDocumentsDynamically(documents);

    const contradictions = result.contradictions.filter(c => c.title === 'Device Footprint Collision');
    expect(contradictions).toHaveLength(1);
    expect(contradictions[0].severity).toBe('high');

    expect(result.score).toBe(45);
  });

  it('should trigger Concurrent Asset Mortgage overlap', () => {
    const documents: DocumentItem[] = [
      {
        id: 'doc-1',
        name: 'property_deed.pdf',
        type: 'PROPERTY_VALUATION',
        content: 'This property has a double mortgage recorded.'
      }
    ];

    const result = analyzeDocumentsDynamically(documents);

    const contradictions = result.contradictions.filter(c => c.title === 'Concurrent Asset Mortgage overlap');
    expect(contradictions).toHaveLength(1);
    expect(contradictions[0].severity).toBe('high');

    expect(result.score).toBe(45);
  });

  it('should cap score at 99 and return HIGH RISK for severe combinations', () => {
    const documents: DocumentItem[] = [
      {
        id: 'doc-1',
        name: 'itr.pdf',
        type: 'ITR',
        content: 'NAME: John Doe\nEMPLOYER: Acme Corp\nGTI: 1000000\ndevice fingerprint: bad-id\ndouble mortgage'
      },
      {
        id: 'doc-2',
        name: 'slip.pdf',
        type: 'SALARY_SLIP',
        content: 'NAME: Jane Smith\nEMPLOYER: Globex\nGROSS SALARY: 10000\ndevice fingerprint: bad-id\nPhotoshop Canva',
        metadata: { dpiCheck: '72' }
      }
    ];

    const result = analyzeDocumentsDynamically(documents);

    // Contradictions:
    // Employer (med)
    // Income (high)
    // Device (high)
    // Mortgage (high)
    // 3 high, 1 med, 3 tampered
    // Calculation: 3 * 35 + 1 * 18 + 3 * 12 + 10 = 105 + 18 + 36 + 10 = 169 -> capped at 99

    expect(result.score).toBe(99);
    expect(result.verdict).toBe('HIGH RISK');
    expect(result.summary).toContain('Recommend immediate credit rejection');
    expect(result.caseFileDetails.bankActionRequired).toContain('MANDATED AUDIT CONTROL');
    expect(result.caseFileDetails.rbiComplianceWarning).toContain('Section 45IA Alert');
    expect(result.caseFileDetails.recommendingRejection).toBe(true);
  });
});
