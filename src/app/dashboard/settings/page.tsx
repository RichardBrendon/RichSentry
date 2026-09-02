import Link from "next/link";
import { redirect } from "next/navigation";

import {
  OrganizationSettings,
  PasswordSettings,
  ProfileSettings,
} from "@/components/settings-form";
import { ensureUserOrganization } from "@/lib/organizations";
import { requireUser } from "@/lib/supabase/server";

function safeReturnPath(value: string | undefined) {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/dashboard";
  if (value.startsWith("/dashboard/settings")) return "/dashboard";

  return value;
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const { user } = await requireUser();

  if (!user) redirect("/login");

  const membership = await ensureUserOrganization(user);
  const organization = Array.isArray(membership.organizations)
    ? membership.organizations[0]
    : membership.organizations;
  const profileName =
    user.user_metadata.full_name ?? user.user_metadata.name ?? "";
  const hasEmailIdentity = user.identities?.some(
    (identity) => identity.provider === "email",
  );
  const canManageOrganization = ["OWNER", "ADMIN"].includes(membership.role);
  const returnPath = safeReturnPath(next);

  return (
    <main className="simplePage">
      <Link href={returnPath}>← Back</Link>
      <small>WORKSPACE</small>
      <h1>Settings</h1>
      <p className="pageIntro">
        Manage the settings currently supported by your workspace.
      </p>
      <div className="settingsGrid">
        <ProfileSettings email={user.email ?? ""} name={profileName} />
        <OrganizationSettings
          canManage={canManageOrganization}
          name={organization.name}
          role={membership.role}
        />
        {hasEmailIdentity && <PasswordSettings />}
      </div>
    </main>
  );
}
