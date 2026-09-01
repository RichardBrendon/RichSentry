"use client";

import { useActionState } from "react";
import {
  updateOrganization,
  updatePassword,
  updateProfile,
  type SettingsActionState,
} from "@/app/dashboard/settings/actions";

const initialState: SettingsActionState = { status: "idle", message: "" };

function ActionMessage({ state }: { state: SettingsActionState }) {
  if (state.status === "idle") return null;

  return (
    <p
      className={`settingsMessage ${state.status}`}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}

export function ProfileSettings({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  const [state, action, pending] = useActionState(updateProfile, initialState);

  return (
    <form className="settingsForm" action={action}>
      <div>
        <small>ACCOUNT</small>
        <h2>Profile</h2>
        <p>Update the name associated with your account.</p>
      </div>
      <label>
        Display name
        <input name="name" defaultValue={name} required minLength={2} />
      </label>
      <label>
        Email
        <input value={email} disabled />
      </label>
      <ActionMessage state={state} />
      <button className="button" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

export function OrganizationSettings({
  canManage,
  name,
  role,
}: {
  canManage: boolean;
  name: string;
  role: string;
}) {
  const [state, action, pending] = useActionState(
    updateOrganization,
    initialState,
  );

  return (
    <form className="settingsForm" action={action}>
      <div>
        <small>WORKSPACE</small>
        <h2>Organization</h2>
        <p>Rename the workspace shown throughout the dashboard.</p>
      </div>
      <label>
        Workspace name
        <input
          name="organizationName"
          defaultValue={name}
          disabled={!canManage}
          required
          minLength={2}
        />
      </label>
      <p className="settingsHint">Your role: {role.toLowerCase()}</p>
      <ActionMessage state={state} />
      {canManage && (
        <button className="button" disabled={pending}>
          {pending ? "Saving…" : "Save workspace"}
        </button>
      )}
    </form>
  );
}

export function PasswordSettings() {
  const [state, action, pending] = useActionState(updatePassword, initialState);

  return (
    <form className="settingsForm" action={action}>
      <div>
        <small>SECURITY</small>
        <h2>Password</h2>
        <p>Set a new password for your email sign-in.</p>
      </div>
      <label>
        New password
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </label>
      <label>
        Confirm password
        <input
          name="passwordConfirmation"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </label>
      <ActionMessage state={state} />
      <button className="button" disabled={pending}>
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
