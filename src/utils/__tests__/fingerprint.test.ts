import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { computeBrowserFingerprint, getFingerprintJSVisitorId } from '../fingerprint';
import fp from '@fingerprintjs/fingerprintjs';

vi.mock('@fingerprintjs/fingerprintjs', () => ({
  default: {
    load: vi.fn(),
  },
}));

describe('fingerprint utilities', () => {
  beforeEach(async () => {
    vi.resetAllMocks();

    // Clear the cache in the module before each test
    // To do this reliably, we can import the module and reset its internal state if possible,
    // or just rely on vi.resetModules() and re-importing, but let's see if we can just test the behavior
    // without resetting if it's tricky, or we use dynamic imports.
  });

  describe('computeBrowserFingerprint', () => {
    beforeEach(() => {
        // Mock navigator
        vi.stubGlobal('navigator', {
          userAgent: 'MockBrowser/1.0',
          language: 'en-US',
          platform: 'MockOS',
          hardwareConcurrency: 8,
          cookieEnabled: true,
        });

        // Mock window
        vi.stubGlobal('window', {
          screen: {
            width: 1920,
            height: 1080,
            colorDepth: 24,
          },
        });

        // Mock Intl
        const mockResolvedOptions = vi.fn().mockReturnValue({ timeZone: 'America/New_York' });
        vi.stubGlobal('Intl', {
          DateTimeFormat: vi.fn().mockImplementation(() => ({
            resolvedOptions: mockResolvedOptions,
          })),
        });

        // Mock document and canvas
        const mockContext2D = {
          fillRect: vi.fn(),
          fillText: vi.fn(),
          font: '',
          textBaseline: '',
          fillStyle: '',
        };
        const mockCanvas = {
          getContext: vi.fn((type) => {
            if (type === '2d') return mockContext2D;
            if (type === 'webgl' || type === 'experimental-webgl') return null; // Simplified for basic tests
            return null;
          }),
          toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mockdata'),
        };

        vi.stubGlobal('document', {
          createElement: vi.fn((tag) => {
            if (tag === 'canvas') return mockCanvas;
            return {};
          }),
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should compute fingerprint deterministically based on browser globals', () => {
      const fingerprint = computeBrowserFingerprint();

      expect(fingerprint).toMatchObject({
        userAgent: 'MockBrowser/1.0',
        language: 'en-US',
        platform: 'MockOS',
        screenResolution: '1920x1080 (Color: 24-bit)',
        timezone: 'America/New_York',
        hardwareConcurrency: 8,
        cookiesEnabled: true,
      });
      expect(typeof fingerprint.id).toBe('string');
      expect(fingerprint.id.startsWith('fp-')).toBe(true);
      // It's tricky to assert on fpjsVisitorId here because it depends on previous test states
    });

    it('should handle missing navigator/window properties by using defaults', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'MinimalBrowser',
        // Missing language, platform, hardwareConcurrency, cookieEnabled
      });

      const mockResolvedOptions = vi.fn().mockReturnValue({});
      vi.stubGlobal('Intl', {
          DateTimeFormat: vi.fn().mockImplementation(() => ({
            resolvedOptions: mockResolvedOptions,
          }))
      });

      const fingerprint = computeBrowserFingerprint();

      expect(fingerprint.language).toBe('en-US');
      expect(fingerprint.platform).toBe('Unknown');
      expect(fingerprint.hardwareConcurrency).toBe(4);
      expect(fingerprint.cookiesEnabled).toBe(false);
      expect(fingerprint.timezone).toBe('UTC');
    });

    it('should handle canvas errors gracefully', () => {
      vi.stubGlobal('document', {
        createElement: vi.fn(() => {
          throw new Error('Canvas blocked by mock extension');
        })
      });

      const fingerprint = computeBrowserFingerprint();

      expect(fingerprint.canvasHash).toBe('cb-901a88b2f901'); // Default fallback
    });

    it('should extract webgl vendor when available', () => {
       const mockGL = {
           getExtension: vi.fn().mockReturnValue({ UNMASKED_RENDERER_VENDOR_ID: 1234 }),
           getParameter: vi.fn().mockReturnValue('Mocked GPU Vendor'),
       };
       vi.stubGlobal('document', {
           createElement: vi.fn((tag) => {
               if (tag === 'canvas') {
                   return {
                       getContext: vi.fn((type) => {
                           if (type === '2d') return null;
                           if (type === 'webgl') return mockGL;
                           return null;
                       }),
                   };
               }
               return {};
           })
       });

       const fingerprint = computeBrowserFingerprint();
       expect(fingerprint.webGlVendor).toBe('Mocked GPU Vendor');
    });
  });

  describe('getFingerprintJSVisitorId', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should successfully load and return visitorId', async () => {
      const { getFingerprintJSVisitorId } = await import('../fingerprint');

      const mockAgent = {
        get: vi.fn().mockResolvedValue({ visitorId: 'mock-visitor-123' }),
      };
      (fp.load as any).mockResolvedValue(mockAgent);

      const visitorId = await getFingerprintJSVisitorId();

      expect(fp.load).toHaveBeenCalledTimes(1);
      expect(mockAgent.get).toHaveBeenCalledTimes(1);
      expect(visitorId).toBe('mock-visitor-123');
    });

    it('should return empty string when load fails', async () => {
      const { getFingerprintJSVisitorId } = await import('../fingerprint');

      (fp.load as any).mockRejectedValue(new Error('Blocked by adblocker'));

      const visitorId = await getFingerprintJSVisitorId();

      expect(visitorId).toBe('');
    });

    it('should use cached value on subsequent calls', async () => {
      const { getFingerprintJSVisitorId } = await import('../fingerprint');

      const mockAgent = {
        get: vi.fn().mockResolvedValue({ visitorId: 'cached-visitor-456' }),
      };
      (fp.load as any).mockResolvedValue(mockAgent);

      // Force a successful call to populate cache
      await getFingerprintJSVisitorId();

      // Clear mocks to verify they aren't called again
      vi.clearAllMocks();

      const visitorId2 = await getFingerprintJSVisitorId();

      expect(fp.load).not.toHaveBeenCalled();
      expect(visitorId2).toBe('cached-visitor-456');
    });
  });
});
