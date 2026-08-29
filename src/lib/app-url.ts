export const PRODUCTION_ORIGIN = "https://richsentry.vercel.app";

export function appOrigin(currentOrigin: string) {
  try {
    const current = new URL(currentOrigin);
    if (current.hostname === "localhost" || current.hostname === "127.0.0.1") {
      return current.origin;
    }
  } catch {}
  return PRODUCTION_ORIGIN;
}
