"use client";

import { cn } from "@/lib/utils";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type ThemeOption = {
  value: string;
  label: string;
  description: string;
  icon: React.ElementType;
};

const themeOptions: ThemeOption[] = [
  {
    value: "light",
    label: "Clair",
    description: "Interface lumineuse",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Sombre",
    description: "Interface sombre",
    icon: Moon,
  },
  {
    value: "system",
    label: "Système",
    description: "Suit votre OS",
    icon: Monitor,
  },
];

export default function ThemeSection() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div>
      <div className="mb-6">
        <p className=" text-xs font-semibold tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-1">
          Apparence
        </p>

        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
          Thème
        </h2>

        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          {`Choisissez comment LexDoc s'affiche sur votre appareil.`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const active = theme === option.value;

          return (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={cn(
                "relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group",
                active
                  ? "border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-800"
                  : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800/50",
              )}
            >
              {/* Preview */}
              <div
                className={cn(
                  "w-full aspect-video rounded-lg overflow-hidden border",
                  active
                    ? "border-stone-300 dark:border-stone-600"
                    : "border-stone-200 dark:border-stone-700",
                )}
              >
                {option.value === "light" && (
                  <div className="w-full h-full bg-white flex flex-col p-1.5 gap-1">
                    <div className="h-1.5 w-3/4 rounded-full bg-stone-200" />
                    <div className="h-1 w-1/2 rounded-full bg-stone-100" />
                    <div className="flex-1 flex gap-1 mt-0.5">
                      <div className="w-1/4 rounded bg-stone-100" />
                      <div className="flex-1 rounded bg-stone-50" />
                    </div>
                  </div>
                )}
                {option.value === "dark" && (
                  <div className="w-full h-full bg-stone-900 flex flex-col p-1.5 gap-1">
                    <div className="h-1.5 w-3/4 rounded-full bg-stone-700" />
                    <div className="h-1 w-1/2 rounded-full bg-stone-800" />
                    <div className="flex-1 flex gap-1 mt-0.5">
                      <div className="w-1/4 rounded bg-stone-800" />
                      <div className="flex-1 rounded bg-stone-950" />
                    </div>
                  </div>
                )}
                {option.value === "system" && (
                  <div className="w-full h-full flex">
                    <div className="w-1/2 bg-white flex flex-col p-1.5 gap-1">
                      <div className="h-1.5 rounded-full bg-stone-200" />
                      <div className="h-1 w-2/3 rounded-full bg-stone-100" />
                      <div className="flex-1 rounded bg-stone-50 mt-0.5" />
                    </div>
                    <div className="w-1/2 bg-stone-900 flex flex-col p-1.5 gap-1">
                      <div className="h-1.5 rounded-full bg-stone-700" />
                      <div className="h-1 w-2/3 rounded-full bg-stone-800" />
                      <div className="flex-1 rounded bg-stone-950 mt-0.5" />
                    </div>
                  </div>
                )}
              </div>

              {/* Label */}
              <div className="flex items-center gap-1.5">
                <Icon
                  className={cn(
                    "h-3.5 w-3.5",
                    active
                      ? "text-stone-900 dark:text-stone-100"
                      : "text-stone-400 dark:text-stone-500",
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    active
                      ? "text-stone-900 dark:text-stone-100"
                      : "text-stone-500 dark:text-stone-400",
                  )}
                >
                  {option.label}
                </span>
              </div>

              {/* Active indicator */}
              {active && (
                <div className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-stone-900 dark:bg-stone-100" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
