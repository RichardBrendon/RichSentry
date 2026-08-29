import { describe, expect, it } from "vitest";
import { isAllowedGoogleUser, isAllowedUser } from "./auth";
import type { User } from "@supabase/supabase-js";

function user(email: string, provider: string) {
  return { email, app_metadata: { provider, providers: [provider] }, identities: [{ provider }] } as unknown as User;
}

describe("authentication providers", () => {
  it("accepts personal Gmail authenticated by Google", () => {
    expect(isAllowedGoogleUser(user("person@gmail.com", "google"))).toBe(true);
    expect(isAllowedUser(user("person@gmail.com", "google"))).toBe(true);
  });

  it("keeps Google Workspace addresses out of the Google-only flow", () => {
    expect(isAllowedGoogleUser(user("person@company.com", "google"))).toBe(false);
    expect(isAllowedUser(user("person@company.com", "google"))).toBe(false);
  });

  it("accepts email and password identities with any valid email domain", () => {
    expect(isAllowedUser(user("person@gmail.com", "email"))).toBe(true);
    expect(isAllowedUser(user("person@company.com", "email"))).toBe(true);
  });

  it("rejects missing users", () => {
    expect(isAllowedUser(null)).toBe(false);
  });
});
