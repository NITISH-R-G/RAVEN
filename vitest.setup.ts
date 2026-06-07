import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

// Polyfill DOMMatrix for jsdom environment which is required by pdf-parse
if (typeof global !== 'undefined' && typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {
    constructor() {}
  } as any;
}
if (typeof global !== 'undefined' && typeof global.ImageData === 'undefined') {
  global.ImageData = class ImageData {
    constructor() {}
  } as any;
}
if (typeof global !== 'undefined' && typeof global.Path2D === 'undefined') {
  global.Path2D = class Path2D {
    constructor() {}
  } as any;
}
