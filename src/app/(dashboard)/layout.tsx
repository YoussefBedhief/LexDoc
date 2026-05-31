import Navbar from "@/components/Navbar";
import { db } from "@/src/db";
import { companies } from "@/src/db/schema/companies";
import { users } from "@/src/db/schema/users";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import SidebarClient from "./_components/sidebarClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  if (!dbUser) redirect("/sign-in");
  if (!dbUser.companyId) redirect("/onboarding");

  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, dbUser.companyId))
    .limit(1);

  const clerkUser = await currentUser();

  return (
    <div className="h-dvh flex overflow-hidden bg-stone-50 dark:bg-stone-950">
      {/* Sidebar */}
      <aside className="w-64 h-full shrink-0 overflow-hidden">
        <SidebarClient
          companyName={company?.name ?? "Mon cabinet"}
          userName={clerkUser?.firstName ?? ""}
        />{" "}
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* TOP NAVBAR (dashboard only) */}
        <Navbar />

        {/* PAGE CONTENT SCROLL */}
        <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
