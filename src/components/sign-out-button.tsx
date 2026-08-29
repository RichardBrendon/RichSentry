"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { browserClient } from "@/lib/supabase/browser";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    const client = browserClient();
    if (client) await client.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return <button type="button" className={compact ? "navSignOut" : "textButton signOutButton"} onClick={signOut} disabled={loading}>
    {compact && <LogOut />}{loading ? "Signing out…" : "Sign out"}
  </button>;
}
