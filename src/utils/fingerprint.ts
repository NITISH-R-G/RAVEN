import fp from "@fingerprintjs/fingerprintjs";

export interface WebFingerprint {
  id: string;
  fpjsVisitorId?: string;
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  hardwareConcurrency: number;
  canvasHash: string;
  webGlVendor: string;
  cookiesEnabled: boolean;
}

// Global caching for FingerprintJS to make retrieval speedy and persistent across sub-session evaluations
let cachedFpjsId: string | null = null;

export async function getFingerprintJSVisitorId(): Promise<string> {
  if (cachedFpjsId) return cachedFpjsId;
  try {
    const agent = await fp.load();
    const result = await agent.get();
    cachedFpjsId = result.visitorId;
    return result.visitorId;
  } catch (e) {
    console.warn("[RAVEN FingerprintJS] Loader failed/sandboxed, using standard canvas fingerprint.", e);
    return "";
  }
}

export function computeBrowserFingerprint(): WebFingerprint {
  const ua = navigator.userAgent;
  const lang = navigator.language || "en-US";
  const plat = navigator.platform || "Unknown";
  const screenRes = `${window.screen.width}x${window.screen.height} (Color: ${window.screen.colorDepth}-bit)`;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const hc = navigator.hardwareConcurrency || 4;
  const cookies = navigator.cookieEnabled || false;

  // Compute a simple stable hash representing a canvas rendering artifact
  let canvasHash = "cb-901a88b2f901";
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      canvas.width = 200;
      canvas.height = 50;
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125,1,62,20);
      ctx.fillStyle = "#069";
      ctx.fillText("RAVEN,f-fingerprint,2026", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("RAVEN,f-fingerprint,2026", 4, 17);
      const str = canvas.toDataURL();
      
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      canvasHash = "fp-" + Math.abs(hash).toString(16);
    }
  } catch (e) {
    // Ignore canvas blocking error
  }

  // WebGL details
  let webGlVendor = "WebGL Generic";
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") as any;
    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        webGlVendor = gl.getParameter(debugInfo.UNMASKED_RENDERER_VENDOR_ID) || "GPU Vendor Gen";
      }
    }
  } catch (e) {
    // ignore
  }

  // Create a predictable browser ID based on these parameters
  const combinedSpecs = `${lang}|${plat}|${screenRes}|${tz}|${hc}|${cookies}`;
  let numericHash = 0;
  for (let i = 0; i < combinedSpecs.length; i++) {
    numericHash = (numericHash << 5) - numericHash + combinedSpecs.charCodeAt(i);
    numericHash |= 0;
  }
  const id = `fp-${Math.abs(numericHash).toString(16).slice(0, 8)}${canvasHash.slice(3, 7)}`;

  return {
    id,
    fpjsVisitorId: cachedFpjsId || id,
    userAgent: ua,
    language: lang,
    platform: plat,
    screenResolution: screenRes,
    timezone: tz,
    hardwareConcurrency: hc,
    canvasHash,
    webGlVendor,
    cookiesEnabled: cookies
  };
}
