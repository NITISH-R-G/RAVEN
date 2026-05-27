/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { computeBrowserFingerprint } from '../utils/fingerprint';

describe('computeBrowserFingerprint', () => {
  let originalNavigator: any;
  let originalWindow: any;
  let originalIntl: any;
  let originalDocumentCreateElement: any;

  beforeEach(() => {
    // Save original globals
    originalNavigator = { ...global.navigator };
    originalWindow = { ...global.window };
    originalIntl = global.Intl;
    originalDocumentCreateElement = document.createElement;

    // Mock Navigator
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'TestUserAgent/1.0',
        language: 'en-GB',
        platform: 'Win32',
        hardwareConcurrency: 8,
        cookieEnabled: true,
      },
      writable: true,
      configurable: true,
    });

    // Mock Window Screen
    Object.defineProperty(global, 'window', {
      value: {
        ...global.window,
        screen: {
          width: 1920,
          height: 1080,
          colorDepth: 24,
        },
      },
      writable: true,
      configurable: true,
    });

    // Mock Intl
    const mockIntl = {
      DateTimeFormat: () => ({
        resolvedOptions: () => ({
          timeZone: 'Europe/London',
        }),
      }),
    };
    Object.defineProperty(global, 'Intl', {
      value: mockIntl,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore original globals
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(global, 'window', {
      value: originalWindow,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(global, 'Intl', {
      value: originalIntl,
      writable: true,
      configurable: true,
    });
    document.createElement = originalDocumentCreateElement;
    vi.restoreAllMocks();
  });

  it('should compute fingerprint with all browser APIs available', () => {
    // Mock canvas context
    const mockContext = {
      fillRect: vi.fn(),
      fillText: vi.fn(),
      getExtension: vi.fn().mockReturnValue('WEBGL_debug_renderer_info'),
      getParameter: vi.fn().mockReturnValue('Test GPU Vendor'),
      UNMASKED_RENDERER_VENDOR_ID: 1234,
    };

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn((type) => {
        if (type === '2d' || type === 'webgl' || type === 'experimental-webgl') {
          return mockContext;
        }
        return null;
      }),
      toDataURL: vi.fn().mockReturnValue('data:image/png;base64,testdata'),
    };

    document.createElement = vi.fn().mockReturnValue(mockCanvas);

    const fp = computeBrowserFingerprint();

    expect(fp.userAgent).toBe('TestUserAgent/1.0');
    expect(fp.language).toBe('en-GB');
    expect(fp.platform).toBe('Win32');
    expect(fp.screenResolution).toBe('1920x1080 (Color: 24-bit)');
    expect(fp.timezone).toBe('Europe/London');
    expect(fp.hardwareConcurrency).toBe(8);
    expect(fp.cookiesEnabled).toBe(true);
    expect(fp.webGlVendor).toBe('Test GPU Vendor');
    // hash logic check: "data:image/png;base64,testdata" hashes predictably
    expect(fp.canvasHash).toMatch(/^fp-[0-9a-f]+$/);
    expect(fp.id).toBeDefined();
    expect(fp.fpjsVisitorId).toBeDefined(); // Falls back to ID
  });

  it('should handle missing navigator properties gracefully', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'MinimalUA',
        // language, platform, hardwareConcurrency, cookieEnabled are missing
      },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, 'Intl', {
      value: {
        DateTimeFormat: () => ({
          resolvedOptions: () => ({
            // timeZone missing
          }),
        }),
      },
      writable: true,
      configurable: true,
    });

    document.createElement = vi.fn().mockReturnValue({
      getContext: vi.fn().mockReturnValue(null),
    });

    const fp = computeBrowserFingerprint();

    expect(fp.language).toBe('en-US'); // Default
    expect(fp.platform).toBe('Unknown'); // Default
    expect(fp.hardwareConcurrency).toBe(4); // Default
    expect(fp.cookiesEnabled).toBe(false); // Default
    expect(fp.timezone).toBe('UTC'); // Default
  });

  it('should handle canvas errors (e.g. strict blocking)', () => {
    // Force error when creating canvas
    document.createElement = vi.fn().mockImplementation((el) => {
      if (el === 'canvas') {
        throw new Error('Canvas blocked');
      }
      return originalDocumentCreateElement.call(document, el);
    });

    const fp = computeBrowserFingerprint();

    // Default values fallback
    expect(fp.canvasHash).toBe('cb-901a88b2f901');
    expect(fp.webGlVendor).toBe('WebGL Generic');
    expect(fp.id).toBeDefined();
  });
});
