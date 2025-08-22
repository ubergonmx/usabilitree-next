"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export function DotPatternBackground() {
  const { theme: themeContext } = useTheme();
  const [dotColor, setDotColor] = useState("var(--dot-pattern)");

  let theme: string | null | undefined = themeContext;
  if (typeof window !== "undefined") {
    theme = localStorage.getItem("theme");
  }

  useEffect(() => {
    if (theme === "system" || theme === null || theme === undefined) {
      setDotColor("var(--dot-pattern)");
    } else if (theme === "dark") {
      setDotColor("38 38 38");
    } else if (theme === "light") {
      setDotColor("229 231 235");
    }
  }, [theme]);

  return (
    <div
      className="absolute inset-0 z-0 h-full w-full [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"
      style={{
        backgroundImage: `radial-gradient(rgb(${dotColor}) 1px, transparent 1px)`,
      }}
    />
  );
}
