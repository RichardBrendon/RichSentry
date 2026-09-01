import Link from "next/link";
import { redirect } from "next/navigation";
import { GoogleAuthButton } from "@/components/google-auth-button";
import { EmailAuthForm } from "@/components/email-auth-form";
import { requireUser } from "@/lib/supabase/server";

export default async function Signup() {
  const { user } = await requireUser();

  if (user) redirect("/dashboard");

  return (
    <main className="authPage">
      <Link className="brand" href="/">
        <span>R</span> RichSentry
      </Link>
      <section>
        <small>START MONITORING</small>
        <h1>Create your account</h1>
        <p>
          Use your email address or continue with a personal Google account.
        </p>
        <GoogleAuthButton />
        <div className="authDivider">
          <span>OR</span>
        </div>
        <EmailAuthForm mode="signup" />
      </section>
    </main>
  );
}
