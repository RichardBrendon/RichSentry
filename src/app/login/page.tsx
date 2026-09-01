import Link from "next/link";
import { redirect } from "next/navigation";
import { GoogleAuthButton } from "@/components/google-auth-button";
import { EmailAuthForm } from "@/components/email-auth-form";
import { requireUser } from "@/lib/supabase/server";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, { user }] = await Promise.all([
    searchParams,
    requireUser(),
  ]);

  if (user) redirect("/dashboard");

  return (
    <main className="authPage">
      <Link className="brand" href="/">
        <span>R</span> RichSentry
      </Link>
      <section>
        <small>WELCOME</small>
        <h1>Sign in</h1>
        <p>Access your monitoring workspace with email or Google.</p>
        {error === "gmail_required" && (
          <p className="authNotice" role="alert">
            Google sign-in requires a personal @gmail.com account. You can still
            use email and password below.
          </p>
        )}
        {error === "oauth_failed" && (
          <p className="authNotice" role="alert">
            Google sign-in could not be completed. Please try again.
          </p>
        )}
        <GoogleAuthButton />
        <div className="authDivider">
          <span>OR</span>
        </div>
        <EmailAuthForm mode="login" />
      </section>
    </main>
  );
}
