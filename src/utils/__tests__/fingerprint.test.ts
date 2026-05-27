import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the external module
vi.mock("@fingerprintjs/fingerprintjs", () => {
  return {
    default: {
      load: vi.fn(),
    },
  };
});

describe("getFingerprintJSVisitorId", () => {
  let getFingerprintJSVisitorId: () => Promise<string>;
  let fpLoadMock: any;

  beforeEach(async () => {
    // Reset modules to clear the `cachedFpjsId` in the file scope
    vi.resetModules();
    vi.clearAllMocks();

    // Setup our mock for `fp.load`
    const fp = await import("@fingerprintjs/fingerprintjs");
    fpLoadMock = vi.mocked(fp.default.load);

    // Import the function fresh so its cachedFpjsId is reset to null
    const mod = await import("../fingerprint");
    getFingerprintJSVisitorId = mod.getFingerprintJSVisitorId;

    // Suppress console.warn so test output is clean when testing errors
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return the visitorId successfully", async () => {
    const mockAgent = {
      get: vi.fn().mockResolvedValue({ visitorId: "mock-visitor-id" }),
    };
    fpLoadMock.mockResolvedValue(mockAgent);

    const result = await getFingerprintJSVisitorId();

    expect(result).toBe("mock-visitor-id");
    expect(fpLoadMock).toHaveBeenCalledTimes(1);
    expect(mockAgent.get).toHaveBeenCalledTimes(1);
  });

  it("should return the cached visitorId on subsequent calls", async () => {
    const mockAgent = {
      get: vi.fn().mockResolvedValue({ visitorId: "mock-visitor-id" }),
    };
    fpLoadMock.mockResolvedValue(mockAgent);

    // First call populates cache
    const firstResult = await getFingerprintJSVisitorId();
    expect(firstResult).toBe("mock-visitor-id");
    expect(fpLoadMock).toHaveBeenCalledTimes(1);
    expect(mockAgent.get).toHaveBeenCalledTimes(1);

    // Clear mock histories to verify they aren't called again
    fpLoadMock.mockClear();
    mockAgent.get.mockClear();

    // Second call should return cached ID without invoking fp.load or agent.get
    const secondResult = await getFingerprintJSVisitorId();
    expect(secondResult).toBe("mock-visitor-id");
    expect(fpLoadMock).not.toHaveBeenCalled();
    expect(mockAgent.get).not.toHaveBeenCalled();
  });

  it("should return an empty string and log a warning if fp.load fails", async () => {
    const mockError = new Error("Loader failed");
    fpLoadMock.mockRejectedValue(mockError);

    const result = await getFingerprintJSVisitorId();

    expect(result).toBe("");
    expect(fpLoadMock).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      "[RAVEN FingerprintJS] Loader failed/sandboxed, using standard canvas fingerprint.",
      mockError
    );
  });

  it("should return an empty string and log a warning if agent.get fails", async () => {
    const mockError = new Error("Agent get failed");
    const mockAgent = {
      get: vi.fn().mockRejectedValue(mockError),
    };
    fpLoadMock.mockResolvedValue(mockAgent);

    const result = await getFingerprintJSVisitorId();

    expect(result).toBe("");
    expect(fpLoadMock).toHaveBeenCalledTimes(1);
    expect(mockAgent.get).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      "[RAVEN FingerprintJS] Loader failed/sandboxed, using standard canvas fingerprint.",
      mockError
    );
  });
});
