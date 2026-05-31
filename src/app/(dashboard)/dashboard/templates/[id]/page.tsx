import { db } from "@/src/db";
import { templates } from "@/src/db/schema/templates";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import TemplateDetailsClient, { Template } from "./components/TemplateDetails";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function TemplateDetailsPage({ params }: Props) {
  const { id } = await params;

  const [template] = await db
    .select()
    .from(templates)
    .where(eq(templates.id, id))
    .limit(1);

  if (!template) {
    notFound();
  }

  return <TemplateDetailsClient template={template as unknown as Template} />;
}
