"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

type Preference = "light:en" | "dark:en" | "light:pt-BR" | "dark:pt-BR";
const eventName = "richsentry-theme-change";

function subscribe(callback: () => void) {
  window.addEventListener(eventName, callback);
  return () => window.removeEventListener(eventName, callback);
}

function snapshot(): Preference {
  const theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  const language = localStorage.getItem("richsentry-language") === "pt-BR" ? "pt-BR" : "en";
  return `${theme}:${language}`;
}

function serverSnapshot(): Preference {
  return "light:en";
}

export function ThemeToggle() {
  const preference = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [theme, language] = preference.split(":") as ["light" | "dark", "en" | "pt-BR"];
  const target = theme === "dark" ? "light" : "dark";
  const label = language === "pt-BR" ? (target === "light" ? "Claro" : "Escuro") : (target === "light" ? "Light" : "Dark");
  const accessibleLabel = language === "pt-BR" ? `Mudar para o tema ${label.toLowerCase()}` : `Switch to ${label.toLowerCase()} theme`;

  function toggle() {
    document.documentElement.dataset.theme = target;
    document.documentElement.style.colorScheme = target;
    localStorage.setItem("richsentry-theme", target);
    window.dispatchEvent(new Event(eventName));
  }

  return <button data-no-translate type="button" className="themeToggle" onClick={toggle} aria-label={accessibleLabel} title={accessibleLabel}>{theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}<span>{label}</span></button>;
}
