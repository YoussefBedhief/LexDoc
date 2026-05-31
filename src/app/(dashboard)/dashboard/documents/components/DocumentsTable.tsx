"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Download, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { deleteDocument } from "../action";
import { DocumentRow } from "../page";

export default function DocumentsTable({ docs }: { docs: DocumentRow[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (docs.length === 0) {
    return <p className="text-sm text-stone-500">Aucun document</p>;
  }

  const downloadPDF = async (documentData: DocumentRow) => {
    try {
      const res = await fetch("/api/documents/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: documentData.id,
        }),
      });

      if (!res.ok) throw new Error("PDF generation failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${documentData.title}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      if (err instanceof Error) {
        console.error(err);
        throw new Error("Error downloading the file", err);
      }
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4">Document</th>
            <th className="text-left p-4">Template</th>
            <th className="text-left p-4">Date</th>
            <th className="text-left p-4">Status</th>
            <th className="text-right p-4">Actions</th>
          </tr>
        </thead>

        <tbody>
          {docs.map((doc: DocumentRow) => (
            <tr key={doc.id} className="border-b">
              <td className="p-4">{doc.title}</td>
              <td className="p-4">{doc.templateName}</td>
              <td className="p-4">
                {new Date(doc.createdAt).toLocaleDateString("fr-FR")}
              </td>

              <td className="p-4">
                <Badge>{doc.status}</Badge>
              </td>

              <td className="p-4">
                <TooltipProvider>
                  <div className="flex justify-end gap-2">
                    {/* VIEW */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={`/dashboard/documents/${doc.id}`}>
                          <Button size="icon" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>Voir</TooltipContent>
                    </Tooltip>

                    {/* DOWNLOAD */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={loadingId === doc.id}
                          onClick={async () => {
                            setLoadingId(doc.id);
                            await downloadPDF(doc);
                            setLoadingId(null);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>PDF</TooltipContent>
                    </Tooltip>

                    {/* DELETE */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          className="text-red-600"
                          onClick={async () => {
                            await deleteDocument(doc.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Supprimer</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
