import { db } from "@/src/db";
import { documents } from "@/src/db/schema/documents";
import { templates } from "@/src/db/schema/templates";
import { users } from "@/src/db/schema/users";
import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import DocumentsTable from "./components/DocumentsTable";

export type DocumentRow = {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  templateName: string | null;
};

export default async function DocumentsPage() {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .limit(1);

  if (!dbUser?.companyId) redirect("/onboarding");

  const docs = await db
    .select({
      id: documents.id,
      title: documents.title,
      status: documents.status,
      createdAt: documents.createdAt,
      templateName: templates.name,
    })
    .from(documents)
    .leftJoin(templates, eq(documents.templateId, templates.id))
    .where(eq(documents.companyId, dbUser.companyId))
    .orderBy(desc(documents.createdAt));

  return (
    <div className="p-6 space-y-6">
      <DocumentsTable docs={docs} />
    </div>
  );
}
