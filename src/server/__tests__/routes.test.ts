import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import router from '../routes.js';

const app = express();
app.use(express.json());
app.use('/', router);

// Mock the @google/genai module
vi.mock('@google/genai', () => {
  class GoogleGenAI {
    models = {
      generateContent: vi.fn().mockImplementation(async () => {
        const error = new Error("Quota Exceeded");
        (error as any).status = 429;
        throw error;
      })
    };
  }
  return {
    GoogleGenAI,
    Type: { OBJECT: 'object', STRING: 'string', INTEGER: 'integer', ARRAY: 'array', BOOLEAN: 'boolean' }
  };
});

describe('POST /api/analyze error path', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    process.env.GEMINI_API_KEY = "test-key-123";
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should gracefully fallback when Gemini API throws a 429 error', async () => {
    const payload = {
      documents: [
        { type: "ID_PROOF", name: "test.pdf", content: "Test document content" }
      ]
    };

    const response = await request(app)
      .post('/api/analyze')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();

    // Check aiStatus fields
    expect(response.body.aiStatus.success).toBe(false);
    expect(response.body.aiStatus.isQuotaExceeded).toBe(true);

    // Check that summary indicates quota fallback
    expect(response.body.summary).toContain('[Quota Standard Mode]');
  });
});
