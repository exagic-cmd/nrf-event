"use client";

import React, { useEffect } from "react";
import { createTheme } from "@/lib/createTheme";
import type { EventAppearance } from "@/lib/theme.config";

interface Props {
  appearance: EventAppearance;
  children: React.ReactNode;
}

export default function ThemeProvider({ appearance, children }: Props) {
  useEffect(() => {
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

    return () => {
      // optional: cleanup -> remove inline variables we set (leave defaults from CSS)
      Object.keys(vars).forEach((key) => {
        root.style.removeProperty(key);
      });
    };
  }, [appearance.theme, appearance.primaryColor]);

  return <>{children}</>;
}
