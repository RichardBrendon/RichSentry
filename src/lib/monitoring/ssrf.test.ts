import { describe, expect, it } from "vitest";
import { assertSafeUrl } from "./ssrf";
describe("SSRF protection", () => {
  it.each([
    "http://localhost",
    "http://127.0.0.1",
    "http://10.0.0.1",
    "http://169.254.169.254/latest/meta-data",
    "file:///etc/passwd",
  ])(
    "blocks %s",
    async (url) => await expect(assertSafeUrl(url)).rejects.toThrow(),
  );
  it("accepts public HTTPS", async () =>
    expect((await assertSafeUrl("https://example.com")).hostname).toBe(
      "example.com",
    ));
});
