"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase/browser";
import { appOrigin } from "@/lib/app-url";

export function EmailAuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const client = browserClient();
    if (!client) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    if (mode === "login") {
      const { error: signInError } = await client.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
      return;
    }

    const { data, error: signUpError } = await client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${appOrigin(window.location.origin)}/` },
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setNotice("Check your email and open the confirmation link to finish creating your account.");
      setLoading(false);
    }
  }

  return <>
    <form className="authForm emailAuthForm" onSubmit={submit}>
      {error && <p className="formError" role="alert">{error}</p>}
      {notice && <p className="authNotice" role="status">{notice}</p>}
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <label>Password<input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} required /></label>
      <button className="button" disabled={loading}>{loading ? "Please wait…" : mode === "login" ? "Sign in with email" : "Create account with email"}</button>
    </form>
    <p className="authSwitch">{mode === "login" ? <>New to RichSentry? <Link href="/signup">Create an account</Link></> : <>Already have an account? <Link href="/login">Sign in</Link></>}</p>
  </>;
}
