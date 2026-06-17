import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import router from '../routes.js';
import { AnalysisResult } from '../../types.js';
import { GoogleGenAI } from '@google/genai';

// Mock module.createRequire to mock pdf-parse
vi.mock('module', async (importOriginal) => {
  const actual = await importOriginal<typeof import('module')>();
  return {
    ...actual,
    createRequire: () => (moduleName: string) => {
      if (moduleName === 'pdf-parse') {
        return async (buffer: any) => ({ text: 'mock parsed pdf text' });
      }
      const require = actual.createRequire(import.meta.url);
      return require(moduleName);
    },
  };
});

// Mock the dependencies
const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  const GoogleGenAI = vi.fn().mockImplementation(function () {
    return {
      models: {
        generateContent: mockGenerateContent,
      },
    };
  });
  return {
    GoogleGenAI,
    Type: {
      OBJECT: 'object',
      STRING: 'string',
      INTEGER: 'integer',
      BOOLEAN: 'boolean',
      ARRAY: 'array',
    },
  };
});

vi.mock('../analyzer.js', () => ({
  analyzeDocumentsDynamically: vi.fn().mockReturnValue({
    score: 40,
    verdict: 'MEDIUM RISK',
    summary: 'Mock fallback summary.',
    contradictions: [],
    extractedEntities: [],
    graphNodes: [],
    graphEdges: [],
    tamperedSignatures: [],
    caseFileDetails: {
      bankActionRequired: 'Manual review',
      rbiComplianceWarning: 'None',
      recommendingRejection: false,
    },
  } as AnalysisResult),
}));

describe('POST /api/analyze', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(router);
    vi.clearAllMocks();

    // Clear the GEMINI_API_KEY to test specific behavior, or set it when needed
    process.env.GEMINI_API_KEY = 'dummy_key';
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it("should use local engine when engineMode is 'local'", async () => {
    const response = await request(app)
      .post('/api/analyze')
      .send({
        engineMode: 'local',
        documents: [{ id: '1', name: 'test.pdf', type: 'OTHER', content: 'test' }],
      });

    expect(response.status).toBe(200);
    expect(response.body.aiStatus.message).toContain('Local Rule Intelligence engine');
    expect(response.body.score).toBe(40);
  });

  it('should enrich with managed agent stats when useManagedAgent is true', async () => {
    const response = await request(app).post('/api/analyze').send({
      engineMode: 'local',
      useManagedAgent: true,
      managedAgentId: 'test-agent',
      documents: [],
    });

    expect(response.status).toBe(200);
    expect(response.body.managedAgentStats).toBeDefined();
    expect(response.body.managedAgentStats.agentId).toBe('test-agent');
    expect(response.body.summary).toContain('[Managed Agent Account Sweep]');
  });

  it("should enrich with default fallback managed agent stats when managedAgentId is omitted", async () => {
    const response = await request(app)
      .post("/api/analyze")
      .send({
        engineMode: "local",
        useManagedAgent: true,
        documents: []
      });

    expect(response.status).toBe(200);
    expect(response.body.managedAgentStats).toBeDefined();
    expect(response.body.managedAgentStats.agentId).toBe("raven-coherence-auditor");
    expect(response.body.summary).toContain("[Managed Agent Account Sweep]");
  });

  it("should return Gemini API success response when engineMode is 'gemini'", async () => {
    const mockAiResponse = {
      score: 85,
      verdict: 'HIGH RISK',
      summary: 'Mock Gemini summary',
      contradictions: [],
      extractedEntities: [],
      graphNodes: [],
      graphEdges: [],
      tamperedSignatures: [],
      caseFileDetails: {
        bankActionRequired: 'Reject',
        rbiComplianceWarning: 'Warning',
        recommendingRejection: true,
      },
    };

    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(mockAiResponse),
    });

    const response = await request(app)
      .post('/api/analyze')
      .send({
        engineMode: 'gemini',
        documents: [{ id: '1', name: 'test.pdf', type: 'OTHER', content: 'test' }],
      });

    expect(response.status).toBe(200);
    expect(response.body.aiStatus.success).toBe(true);
    expect(response.body.score).toBe(85);
  });

  it('should fallback to local engine when Gemini API fails with quota exceeded', async () => {
    const mockError = new Error('Quota exceeded');
    (mockError as any).status = 429;

    mockGenerateContent.mockRejectedValueOnce(mockError);

    const response = await request(app)
      .post('/api/analyze')
      .send({
        engineMode: 'gemini',
        documents: [{ id: '1', name: 'test.pdf', type: 'OTHER', content: 'test' }],
      });

    expect(response.status).toBe(200);
    expect(response.body.aiStatus.success).toBe(false);
    expect(response.body.aiStatus.isQuotaExceeded).toBe(true);
    expect(response.body.summary).toContain('[Quota Standard Mode]');
    expect(response.body.score).toBe(40); // the local fallback score
  });

  it('should handle invalid JSON string in documents field gracefully', async () => {
    const response = await request(app).post('/api/analyze').send({
      engineMode: 'local',
      documents: 'invalid-json-string-not-an-array-or-object',
    });

    expect(response.status).toBe(200);
    // Should fallback to local engine correctly without crashing
    expect(response.body.aiStatus.message).toContain('Local Rule Intelligence engine');
    expect(response.body.score).toBe(40);
  });

  it('should guess document type correctly based on uploaded filename', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .field('engineMode', 'local')
      .attach('files', Buffer.from('test text content'), 'John_Doe_Salary_Slip.pdf');

    expect(response.status).toBe(200);

    // We can't directly inspect the parsed documents variable, but we can verify it doesn't crash
    // and returns the local fallback response. In a more integrated test, we'd check if the local
    // engine received the correctly mapped type.

    const analyzeDocumentsDynamically = vi.mocked(
      await import('../analyzer.js'),
    ).analyzeDocumentsDynamically;

    // Check what was passed to analyzeDocumentsDynamically
    expect(analyzeDocumentsDynamically).toHaveBeenCalled();
    const passedDocs = analyzeDocumentsDynamically.mock.calls[0][0];

    expect(passedDocs).toBeDefined();
    expect(passedDocs.length).toBeGreaterThan(0);
    expect(passedDocs[0].name).toBe('John_Doe_Salary_Slip.pdf');
    expect(passedDocs[0].type).toBe('SALARY_SLIP');
  });
});
