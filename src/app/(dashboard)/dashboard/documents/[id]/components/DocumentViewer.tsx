"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Download,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export interface DocumentData {
  id: string;
  companyId: string;
  templateId: string;
  title: string;
  content: string;
  data: Record<string, string>;
  status: string;
  pdfUrl?: string;
  createdBy: string;
  createdAt?: string;
}

interface Props {
  documentData: DocumentData;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  generated: {
    label: "Généré",
    color:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  draft: {
    label: "Brouillon",
    color:
      "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  default: {
    label: "En cours",
    color:
      "text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700",
    dot: "bg-stone-400",
  },
};

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DocumentViewer({ documentData }: Props) {
  const [loading, setLoading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const status = STATUS_CONFIG[documentData.status] ?? STATUS_CONFIG.default;
  const dateFormatted = formatDate(documentData.createdAt);

  const downloadPDF = async () => {
    try {
      setLoading(true);

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

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-6 sm:px-8 py-4 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shrink-0">
        <Link href="/dashboard/documents">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer">
            <ArrowLeft className="h-4 w-4 text-stone-500 dark:text-stone-400" />
          </div>
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500 min-w-0">
          <span className="shrink-0">Documents</span>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="text-stone-700 dark:text-stone-300 font-medium truncate">
            {documentData.title}
          </span>
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          <Button
            onClick={downloadPDF}
            disabled={loading}
            className={cn(
              "h-9 gap-2 font-semibold text-sm transition-all duration-200 cursor-pointer",
              downloaded
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900",
            )}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : downloaded ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {loading
                ? "Génération…"
                : downloaded
                  ? "Téléchargé !"
                  : "Télécharger PDF"}
            </span>
          </Button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar info (desktop) ── */}

        {/* ── Document preview ── */}
        <div className="flex flex-col flex-1 overflow-hidden bg-stone-100 dark:bg-stone-950">
          {/* Preview toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shrink-0">
            <span className="text-xs font-semibold tracking-widest uppercase text-stone-400 dark:text-stone-500">
              Aperçu du document
            </span>
          </div>

          {/* Paper */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 print:p-0">
            <div
              className="bg-white text-stone-900 shadow-lg mx-auto rounded-sm"
              style={{
                maxWidth: "210mm",
                minHeight: "297mm",
                padding: "20mm 25mm",
                fontFamily: "'Times New Roman', Times, serif",
                fontSize: "13pt",
                lineHeight: "1.8",
              }}
              dangerouslySetInnerHTML={{ __html: documentData.content }}
            />
          </div>
        </div>
      </div>

      {/* ── Mobile info bar ── */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shrink-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border",
              status.color,
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
            {status.label}
          </span>
          {dateFormatted && (
            <span className="text-xs text-stone-400 dark:text-stone-500">
              {dateFormatted}
            </span>
          )}
        </div>
        <Button
          onClick={downloadPDF}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold transition-colors"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          PDF
        </Button>
      </div>
    </div>
  );
}
