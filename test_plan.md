1. Add `getFingerprintJSVisitorId` and `@fingerprintjs/fingerprintjs` to `src/utils/__tests__/fingerprint.test.ts` imports.
2. Add a `vi.mock('@fingerprintjs/fingerprintjs')` to mock the default export.
3. Write a test case in a new `describe('getFingerprintJSVisitorId')` block.
4. Mock `fp.load()` to throw an error.
5. Verify `getFingerprintJSVisitorId()` returns an empty string and that a warning is logged (optional, can just check return value).
6. Run tests to make sure it passes.
