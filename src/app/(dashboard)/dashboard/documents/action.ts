"use server";

import { db } from "@/src/db";
import { documents } from "@/src/db/schema/documents";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function downloadPDF(documentId: string, title: string) {
  const baseUrl = process.env.NEXT_PUBLIC_URL;
  const res = await fetch(`${baseUrl}/api/documents/pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      documentId,
    }),
  });

  if (!res.ok) {
    throw new Error("PDF generation failed");
  }

  const blob = await res.blob();

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title}.pdf`;
  a.click();

  window.URL.revokeObjectURL(url);
}

export async function deleteDocument(id: string) {
  await db.delete(documents).where(eq(documents.id, id));

  revalidatePath("/dashboard/documents");
}
