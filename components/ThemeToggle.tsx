"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;

  const isDark = theme === "dark";

  const handleToggle = async () => {
    const button = buttonRef.current;
    if (!button) {
      setTheme(isDark ? "light" : "dark");
      return;
    }

    // View Transition API non supportée → fallback simple
    if (!document.startViewTransition) {
      setTheme(isDark ? "light" : "dark");
      return;
    }

    // Position du bouton pour que le cercle parte de là
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Rayon max pour couvrir tout l'écran depuis ce point
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = document.startViewTransition(() => {
      setTheme(isDark ? "light" : "dark");
    });

    await transition.ready;

    // Animation du clip-path : cercle qui grandit depuis le bouton
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 600,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  };

  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={cn(
        "h-9 w-9 rounded-lg transition-colors",
        "text-stone-500 hover:text-stone-900 hover:bg-stone-100",
        "dark:text-stone-400 dark:hover:text-stone-100 dark:hover:bg-stone-800",
      )}
      aria-label="Basculer le thème"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
