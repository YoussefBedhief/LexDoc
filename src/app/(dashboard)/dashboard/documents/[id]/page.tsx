import { db } from "@/src/db";
import { documents } from "@/src/db/schema/documents";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import DocumentViewer, { DocumentData } from "./components/DocumentViewer";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function DocumentPage({ params }: Props) {
  const { id } = await params;

  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);

  if (!document) {
    notFound();
  }

  return <DocumentViewer documentData={document as unknown as DocumentData} />;
}
