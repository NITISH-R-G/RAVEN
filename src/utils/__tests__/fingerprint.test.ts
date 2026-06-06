import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { computeBrowserFingerprint } from '../fingerprint';

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
});
