"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useClerk } from "@clerk/nextjs";
import {
  ChevronRight,
  FilePlus2,
  FileText,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  {
    label: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  { label: "Templates", href: "/dashboard/templates", icon: Layers },
  { label: "Documents", href: "/dashboard/documents", icon: FileText },
  {
    label: "Nouveau document",
    href: "/dashboard/templates",
    icon: FilePlus2,
    highlight: true,
  },
];

const bottomItems = [
  { label: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

interface SidebarClientProps {
  companyName: string;
  userName: string;
}

function SidebarContent({
  companyName,
  onNavigate,
}: {
  companyName: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const router = useRouter();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-stone-900">
      {/* Company name */}
      <div className="px-5 py-5 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 dark:bg-stone-100 shrink-0">
            <span className="text-white dark:text-stone-900 text-xs font-bold">
              {companyName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 dark:text-stone-500 leading-none mb-0.5">
              Cabinet
            </p>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate leading-tight cursor-default">
                  {companyName}
                </p>
              </TooltipTrigger>
              {companyName.length > 20 && (
                <TooltipContent side="right">
                  <p>{companyName}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-hidden">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link key={item.href} href={item.href} onClick={onNavigate}>
                <div className="flex items-center gap-2.5 mt-3 px-3 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 transition-colors group cursor-pointer">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-semibold tracking-wide">
                    {item.label}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-60 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          }

          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}>
              <div
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer group",
                  active
                    ? "bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                    : "text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-100",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    active
                      ? "text-stone-900 dark:text-stone-100"
                      : "text-stone-400 dark:text-stone-500 group-hover:text-stone-600 dark:group-hover:text-stone-300",
                  )}
                />
                <span
                  className={cn(
                    "text-sm transition-colors",
                    active ? "font-semibold" : "font-medium",
                  )}
                >
                  {item.label}
                </span>
                {active && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-stone-900 dark:bg-stone-100" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-stone-100 dark:bg-stone-800" />

      {/* Bottom + logout */}
      <div className="px-3 py-3 space-y-0.5">
        {bottomItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}>
              <div
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer group",
                  active
                    ? "bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                    : "text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-100",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    active
                      ? "text-stone-900 dark:text-stone-100"
                      : "text-stone-400 dark:text-stone-500 group-hover:text-stone-600 dark:group-hover:text-stone-300",
                  )}
                />
                <span
                  className={cn(
                    "text-sm",
                    active ? "font-semibold" : "font-medium",
                  )}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}

        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start gap-2.5 px-3 py-2.5 h-auto rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:text-red-400 font-medium text-sm transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </Button>
      </div>
    </div>
  );
}

export default function SidebarClient({
  companyName,
  userName,
}: SidebarClientProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <TooltipProvider delayDuration={0}>
      {/* ── Desktop sidebar ── */}
      <aside className="w-64 hidden md:flex flex-col h-full bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 shrink-0">
        <SidebarContent companyName={companyName} />
      </aside>

      {/* ── Mobile : top bar + drawer ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-900 dark:bg-stone-100">
            <span className="text-white dark:text-stone-900 text-xs font-bold">
              {companyName.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate max-w-40">
            {companyName}
          </span>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 w-64 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800"
          >
            <SidebarContent
              companyName={companyName}
              onNavigate={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
}
