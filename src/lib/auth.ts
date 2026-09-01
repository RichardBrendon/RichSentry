import type { User } from "@supabase/supabase-js";

export function isAllowedGoogleUser(user: User | null): user is User {
  if (!user?.email?.toLowerCase().endsWith("@gmail.com")) return false;

  const providers = user.app_metadata?.providers;

  return (
    user.app_metadata?.provider === "google" ||
    (Array.isArray(providers) && providers.includes("google")) ||
    user.identities?.some((identity) => identity.provider === "google") === true
  );
}
export function isAllowedUser(user: User | null): user is User {
  if (!user?.email) return false;

  const providers = user.app_metadata?.providers;
  const hasEmail =
    user.app_metadata?.provider === "email" ||
    (Array.isArray(providers) && providers.includes("email")) ||
    user.identities?.some((identity) => identity.provider === "email") === true;

  return hasEmail || isAllowedGoogleUser(user);
}
