"use client";

import React, { useLayoutEffect } from "react";
import { createTheme } from "@/lib/createTheme";
import type { EventAppearance } from "@/lib/theme.config";

interface Props {
  appearance: EventAppearance;
  children: React.ReactNode;
}

export default function ThemeProvider({ appearance, children }: Props) {
  useLayoutEffect(() => {
    const { mode, vars } = createTheme(appearance);

    // Apply CSS variables to documentElement
    const root = document.documentElement;
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Ensure Tailwind dark/class is set on html element
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Keep the current theme in place until the next appearance is applied.
    // Removing variables during route changes briefly flashes the default theme.
  }, [appearance.theme, appearance.primaryColor]);

  return <>{children}</>;
}
