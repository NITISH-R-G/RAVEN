import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { computeBrowserFingerprint } from '../fingerprint';

describe('computeBrowserFingerprint', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      userAgent: 'test-agent',
      language: 'en-US',
      platform: 'Win32',
      hardwareConcurrency: 8,
      cookieEnabled: true,
    });

    vi.stubGlobal('window', {
      screen: {
        width: 1920,
        height: 1080,
        colorDepth: 24,
      }
    });

    vi.stubGlobal('document', {
      createElement: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should fallback to default canvasHash if document.createElement throws', () => {
    // Mock document.createElement to throw an error
    vi.mocked(document.createElement).mockImplementation(() => {
      throw new Error('Canvas blocked');
    });

    const result = computeBrowserFingerprint();

    // The fallback canvas hash should be cb-901a88b2f901
    expect(result.canvasHash).toBe('cb-901a88b2f901');
  });

  it('should generate a canvasHash when canvas is successfully created', () => {
    // Mock a successful canvas creation
    const mockContext = {
      fillText: vi.fn(),
      fillRect: vi.fn(),
    };
    const mockCanvas = {
      getContext: vi.fn((type) => {
        if (type === '2d') return mockContext;
        if (type === 'webgl' || type === 'experimental-webgl') return null;
        return null;
      }),
      toDataURL: vi.fn(() => 'data:image/png;base64,mockdata'),
    };

    vi.mocked(document.createElement).mockImplementation(() => mockCanvas as any);

    const result = computeBrowserFingerprint();

    // The calculated hash for 'data:image/png;base64,mockdata'
    // Let's compute it here manually:
    let hash = 0;
    const str = 'data:image/png;base64,mockdata';
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const expectedHash = "fp-" + Math.abs(hash).toString(16);

    expect(result.canvasHash).toBe(expectedHash);
    expect(result.canvasHash).not.toBe('cb-901a88b2f901');
  });
});
