"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogOut, Settings, UserRound } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { browserClient } from "@/lib/supabase/browser";

type AccountMenuProps = {
  email: string;
  name: string;
};

export function AccountMenu({ email, name }: AccountMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const initial = (name || email).trim().charAt(0).toUpperCase();

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  async function signOut() {
    setSigningOut(true);

    const client = browserClient();

    if (client) await client.auth.signOut();

    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="accountMenu" ref={menuRef}>
      <button
        type="button"
        className="accountMenuTrigger"
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {initial || <UserRound aria-hidden="true" />}
        <span className="accountOnline" aria-hidden="true" />
      </button>
      {open && (
        <div className="accountMenuPanel" role="menu">
          <div className="accountIdentity">
            <strong>{name || "Signed-in user"}</strong>
            <span>{email}</span>
          </div>
          <div className="accountMenuLinks">
            <Link
              href={`/dashboard/settings?next=${encodeURIComponent(pathname)}`}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <Settings aria-hidden="true" />
              Settings
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={signOut}
              disabled={signingOut}
            >
              <LogOut aria-hidden="true" />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
