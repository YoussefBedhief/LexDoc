"use server";

import { db } from "@/src/db";
import { documents } from "@/src/db/schema/documents";
import { templates } from "@/src/db/schema/templates";
import { users } from "@/src/db/schema/users";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

function replaceVariables(template: string, values: Record<string, string>) {
  let result = template;

  Object.entries(values).forEach(([key, value]) => {
    result = result.replaceAll(`{{${key}}}`, value || "");
  });

  return result;
}

export async function generateDocument(
  templateId: string,
  formValues: Record<string, string>,
  documentTitle: string,
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const [template] = await db
    .select()
    .from(templates)
    .where(eq(templates.id, templateId))
    .limit(1);

  if (!template) {
    throw new Error("Template not found");
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .limit(1);

  if (!user) {
    throw new Error("User not found");
  }

  const finalContent = replaceVariables(template.content, formValues);

  const [document] = await db
    .insert(documents)
    .values({
      companyId: template.companyId,
      templateId: template.id,
      title: documentTitle,
      data: formValues,
      content: finalContent,
      createdBy: user.id,
      status: "generated",
    })
    .returning();

  redirect(`/dashboard/documents/${document.id}`);
}
