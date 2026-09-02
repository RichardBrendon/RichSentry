import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./app.css";
import "./forms.css";
import "./theme.css";
import "./settings.css";
import "./oauth.css";
import "./dashboard-pages.css";
import "./auth-email.css";
import "./session.css";
import "./demo.css";
import "./language.css";
import "./account-menu.css";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { AccountMenu } from "@/components/account-menu";
import { requireUser } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RichSentry — Website & API monitoring",
    template: "%s · RichSentry",
  },
  description: "Know when your services fail. Before your users do.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { user } = await requireUser();
  const accountName =
    user?.user_metadata.full_name ?? user?.user_metadata.name ?? "";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem("richsentry-theme");

                if (t !== "light" && t !== "dark") {
                  t = matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light";
                }

                document.documentElement.dataset.theme = t;
                document.documentElement.style.colorScheme = t;
              } catch (e) {
                document.documentElement.dataset.theme = "light";
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        {user && (
          <AccountMenu email={user.email ?? ""} name={accountName} />
        )}
        <LanguageToggle />
        <ThemeToggle />
      </body>
    </html>
  );
}
