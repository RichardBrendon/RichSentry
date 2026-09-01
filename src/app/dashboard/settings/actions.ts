"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ensureUserOrganization } from "@/lib/organizations";
import { adminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/supabase/server";

export type SettingsActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const nameSchema = z.string().trim().min(2).max(80);
const passwordSchema = z.string().min(8).max(128);

const invalidState = (message: string): SettingsActionState => ({
  status: "error",
  message,
});

export async function updateProfile(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const { client, user } = await requireUser();

  if (!client || !user) return invalidState("Your session has expired.");

  const parsedName = nameSchema.safeParse(formData.get("name"));

  if (!parsedName.success) {
    return invalidState("Enter a name between 2 and 80 characters.");
  }

  const { error } = await client.auth.updateUser({
    data: { full_name: parsedName.data, name: parsedName.data },
  });

  if (error) return invalidState("We could not update your profile.");

  revalidatePath("/dashboard/settings");

  return { status: "success", message: "Profile saved." };
}

export async function updateOrganization(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const { user } = await requireUser();

  if (!user) return invalidState("Your session has expired.");

  const membership = await ensureUserOrganization(user);

  if (!["OWNER", "ADMIN"].includes(membership.role)) {
    return invalidState("Only owners and admins can rename this workspace.");
  }

  const parsedName = nameSchema.safeParse(formData.get("organizationName"));

  if (!parsedName.success) {
    return invalidState("Enter a name between 2 and 80 characters.");
  }

  const { error } = await adminClient()
    .from("organizations")
    .update({ name: parsedName.data })
    .eq("id", membership.organization_id);

  if (error) return invalidState("We could not rename this workspace.");

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/status-pages");

  return { status: "success", message: "Workspace saved." };
}

export async function updatePassword(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const { client, user } = await requireUser();

  if (!client || !user) return invalidState("Your session has expired.");

  const hasEmailIdentity = user.identities?.some(
    (identity) => identity.provider === "email",
  );

  if (!hasEmailIdentity) {
    return invalidState("Password changes are unavailable for this account.");
  }

  const parsedPassword = passwordSchema.safeParse(formData.get("password"));
  const confirmation = formData.get("passwordConfirmation");

  if (!parsedPassword.success) {
    return invalidState("Use a password with at least 8 characters.");
  }

  if (parsedPassword.data !== confirmation) {
    return invalidState("The passwords do not match.");
  }

  const { error } = await client.auth.updateUser({
    password: parsedPassword.data,
  });

  if (error) return invalidState("We could not update your password.");

  return { status: "success", message: "Password updated." };
}
