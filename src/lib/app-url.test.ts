import { describe, expect, it } from "vitest";

import { appOrigin, PRODUCTION_ORIGIN } from "./app-url";

describe("appOrigin", () => {
  it("preserves localhost during development", () => {
    expect(appOrigin("http://localhost:3000")).toBe("http://localhost:3000");
  });

  it("preserves Vercel preview origins", () => {
    expect(appOrigin("https://richsentry-git-teste-example.vercel.app")).toBe(
      "https://richsentry-git-teste-example.vercel.app",
    );
  });

  it("preserves the production Vercel origin", () => {
    expect(appOrigin(PRODUCTION_ORIGIN)).toBe(PRODUCTION_ORIGIN);
  });

  it("falls back to production for untrusted origins", () => {
    expect(appOrigin("https://example.com")).toBe(PRODUCTION_ORIGIN);
    expect(appOrigin("not-a-url")).toBe(PRODUCTION_ORIGIN);
  });

  it("does not trust domains that merely contain the Vercel suffix", () => {
    expect(appOrigin("https://preview.vercel.app.example.com")).toBe(
      PRODUCTION_ORIGIN,
    );
  });
});
