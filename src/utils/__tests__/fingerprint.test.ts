import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { computeBrowserFingerprint, getFingerprintJSVisitorId } from '../fingerprint';
import fp from '@fingerprintjs/fingerprintjs';

vi.mock('@fingerprintjs/fingerprintjs', () => ({
  default: {
    load: vi.fn(),
  },
}));

describe('computeBrowserFingerprint', () => {
  beforeEach(() => {
    // Setup basic globals required by the function
    vi.stubGlobal('navigator', {
      userAgent: 'test-agent',
      language: 'en-US',
      platform: 'test-platform',
      hardwareConcurrency: 4,
      cookieEnabled: true,
    });

    vi.stubGlobal('window', {
      screen: {
        width: 1920,
        height: 1080,
        colorDepth: 24,
      },
    });

    vi.stubGlobal('Intl', {
      DateTimeFormat: () => ({
        resolvedOptions: () => ({ timeZone: 'UTC' })
      })
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should use default canvasHash when document.createElement throws an error', () => {
    // Mock document.createElement to throw an error for canvas
    vi.stubGlobal('document', {
      createElement: vi.fn().mockImplementation((tagName: string) => {
        if (tagName === 'canvas') {
          throw new Error('Canvas is blocked or unsupported');
        }
        return {};
      }),
    });

    const fingerprint = computeBrowserFingerprint();

    // Verify it used the fallback hash
    expect(fingerprint.canvasHash).toBe('cb-901a88b2f901');
    // Ensure document.createElement was actually called
    expect(document.createElement).toHaveBeenCalledWith('canvas');
  });

  it('should compute a hash when canvas rendering is supported', () => {
    const mockContext = {
      textBaseline: '',
      font: '',
      fillStyle: '',
      fillRect: vi.fn(),
      fillText: vi.fn(),
    };

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockContext),
      toDataURL: vi.fn().mockReturnValue('mock-data-url'),
    };

    vi.stubGlobal('document', {
      createElement: vi.fn().mockReturnValue(mockCanvas),
    });

    const fingerprint = computeBrowserFingerprint();

    // The canvasHash will be different from the fallback
    expect(fingerprint.canvasHash).not.toBe('cb-901a88b2f901');
    expect(fingerprint.canvasHash).toMatch(/^fp-[0-9a-f]+$/);

    // Ensure the expected methods were called
    expect(document.createElement).toHaveBeenCalledWith('canvas');
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    expect(mockCanvas.toDataURL).toHaveBeenCalled();
  });

  it('should use default webGlVendor when WebGL context extraction throws an error', () => {
    const mockContext2D = {
      textBaseline: '',
      font: '',
      fillStyle: '',
      fillRect: vi.fn(),
      fillText: vi.fn(),
    };

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockImplementation((contextType: string) => {
        if (contextType === '2d') {
          return mockContext2D;
        }
        if (contextType === 'webgl' || contextType === 'experimental-webgl') {
          throw new Error('WebGL is not supported or blocked');
        }
        return null;
      }),
      toDataURL: vi.fn().mockReturnValue('mock-data-url'),
    };

    vi.stubGlobal('document', {
      createElement: vi.fn().mockReturnValue(mockCanvas),
    });

    const fingerprint = computeBrowserFingerprint();

    // Verify it used the fallback webGlVendor
    expect(fingerprint.webGlVendor).toBe('WebGL Generic');

    // Ensure getContext was called for webgl
    expect(mockCanvas.getContext).toHaveBeenCalledWith('webgl');
  });
});

describe('getFingerprintJSVisitorId', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // We need to reset the module to clear the cachedFpjsId global state.
    // However, since it's a let variable, we might need to rely on module isolation
    // or we can test the behavior.
    // If not possible, vitest vi.resetModules() works well when re-importing.
  });

  it('should return empty string and warn when fp.load throws an error', async () => {
    // Suppress console.warn to avoid cluttering test output
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    vi.mocked(fp.load).mockRejectedValueOnce(new Error('Loader sandboxed'));

    const visitorId = await getFingerprintJSVisitorId();

    expect(visitorId).toBe('');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "[RAVEN FingerprintJS] Loader failed/sandboxed, using standard canvas fingerprint.",
      expect.any(Error)
    );

    consoleWarnSpy.mockRestore();
  });

  it('should return visitorId when fp.load succeeds', async () => {
    vi.resetModules();
    // This requires dynamic importing to avoid caching issues with the global `cachedFpjsId`.
    const module = await import('../fingerprint');

    const mockGet = vi.fn().mockResolvedValue({ visitorId: 'test-visitor-id' });
    vi.mocked(fp.load).mockResolvedValueOnce({ get: mockGet } as any);

    const visitorId = await module.getFingerprintJSVisitorId();

    expect(visitorId).toBe('test-visitor-id');
    expect(fp.load).toHaveBeenCalled();
    expect(mockGet).toHaveBeenCalled();

    // Testing caching behaviour
    const cachedVisitorId = await module.getFingerprintJSVisitorId();
    expect(cachedVisitorId).toBe('test-visitor-id');
    expect(fp.load).toHaveBeenCalledTimes(1); // load shouldn't be called again
  });
});
