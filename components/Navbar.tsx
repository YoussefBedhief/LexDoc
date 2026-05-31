"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  ChevronDown,
  Gavel,
  LogIn,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 dark:bg-stone-100 overflow-hidden">
        <span
          className="text-white dark:text-stone-900 text-base font-black leading-none select-none"
          style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.05em" }}
        >
          <Gavel />
        </span>
        <div className="absolute bottom-1.5 left-1.5 right-1.5 h-px bg-white/30 dark:bg-stone-900/30" />
      </div>
      <div className="flex items-baseline gap-0.5">
        <span
          className="text-lg font-black text-stone-900 dark:text-stone-100 tracking-tight leading-none group-hover:opacity-80 transition-opacity"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Lex
        </span>
        <span
          className="text-lg font-light text-stone-400 dark:text-stone-500 tracking-tight leading-none"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Doc
        </span>
      </div>
    </Link>
  );
}

function AuthSection() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!isLoaded)
    return (
      <div className="h-9 w-20 rounded-lg bg-stone-100 dark:bg-stone-800 animate-pulse" />
    );

  if (!isSignedIn) {
    return (
      <Link href="/sign-in">
        <Button
          variant="ghost"
          className={cn(
            "h-9 gap-2 rounded-lg px-4 text-sm font-medium transition-colors",
            "text-stone-600 hover:text-stone-900 hover:bg-stone-100",
            "dark:text-stone-400 dark:hover:text-stone-100 dark:hover:bg-stone-800",
          )}
        >
          <LogIn className="h-4 w-4" />
          Login
        </Button>
      </Link>
    );
  }

  const initials =
    ((user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "") ||
      user.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase()) ??
    "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors outline-none",
            "hover:bg-stone-100 dark:hover:bg-stone-800",
          )}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 dark:bg-stone-100">
            <span className="text-[11px] font-bold text-white dark:text-stone-900 select-none">
              {initials}
            </span>
          </div>
          <span className="hidden sm:block text-sm font-medium text-stone-700 dark:text-stone-300 max-w-[120px] truncate">
            {user.firstName ?? user.emailAddresses[0]?.emailAddress}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-52 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-lg p-1"
      >
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-[11px] text-stone-400 truncate mt-0.5">
            {user.emailAddresses[0]?.emailAddress}
          </p>
        </div>

        <DropdownMenuSeparator className="bg-stone-100 dark:bg-stone-800" />

        <Link href={"/dashboard"}>
          <DropdownMenuItem className="gap-2.5 rounded-lg text-sm text-stone-700 dark:text-stone-300 cursor-pointer focus:bg-stone-50 dark:focus:bg-stone-800">
            <User className="h-4 w-4 text-stone-400" />
            Mon espace
          </DropdownMenuItem>
        </Link>
        <Link href={"/dashboard/settings"}>
          <DropdownMenuItem className="gap-2.5 rounded-lg text-sm text-stone-700 dark:text-stone-300 cursor-pointer focus:bg-stone-50 dark:focus:bg-stone-800">
            <Settings className="h-4 w-4 text-stone-400" />
            Paramètres
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator className="bg-stone-100 dark:bg-stone-800" />
        <DropdownMenuItem
          onClick={() => signOut(() => router.push("/sign-in"))}
          className="gap-2.5 rounded-lg text-sm text-red-500 cursor-pointer focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Navbar() {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "bg-white/80 dark:bg-stone-950/80 backdrop-blur-md",
        "border-b border-stone-200/80 dark:border-stone-800/80",
      )}
    >
      <div className="flex h-14 w-full items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <div className="w-px h-5 bg-stone-200 dark:bg-stone-700 mx-1" />
          <AuthSection />
        </div>
      </div>
    </header>
  );
}
