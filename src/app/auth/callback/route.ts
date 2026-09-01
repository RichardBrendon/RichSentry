import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAllowedGoogleUser } from "@/lib/auth";
import { appOrigin } from "@/lib/app-url";

function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const flowId = request.nextUrl.searchParams.get("sb_flow_id");
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  const origin = appOrigin(request.nextUrl.origin);

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", origin));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", origin));
  }

  // Persist the OAuth session on the response that reaches the browser.
  const response = NextResponse.redirect(new URL(next, origin));
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(
    code,
    flowId ? { flowId } : undefined,
  );

  if (error) {
    response.headers.set(
      "location",
      new URL("/login?error=oauth_failed", origin).toString(),
    );

    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAllowedGoogleUser(user)) {
    await supabase.auth.signOut();
    response.headers.set(
      "location",
      new URL("/login?error=gmail_required", origin).toString(),
    );
  }

  return response;
}
