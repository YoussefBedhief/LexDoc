import { db } from "@/src/db";
import { documents } from "@/src/db/schema/documents";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

async function getBrowser() {
  if (process.env.NODE_ENV === "production") {
    const chromium = (await import("@sparticuz/chromium-min")).default;
    const puppeteer = (await import("puppeteer-core")).default;

    const CHROMIUM_REMOTE_URL =
      process.env.CHROMIUM_REMOTE_URL ??
      "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar";

    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1280, height: 800 },
      executablePath: await chromium.executablePath(CHROMIUM_REMOTE_URL),
      headless: true,
    });
  } else {
    const puppeteer = (await import("puppeteer")).default;
    return puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
}

// Wrap le contenu HTML dans une page complète avec polices Google pour l'arabe
function buildHtmlPage(content: string): string {
  return `<!DOCTYPE html>
<html lang="ar">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!--
      Police Google Fonts pour l'arabe (Noto Naskh Arabic) chargée en base64
      pour éviter les problèmes de réseau dans Puppeteer Lambda.
      On utilise un @import direct — Puppeteer attend networkidle2 pour s'assurer
      que la police est chargée avant le rendu.
    -->
    <link
      rel="preconnect"
      href="https://fonts.googleapis.com"
      crossorigin="anonymous"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap"
      rel="stylesheet"
    />

    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: "Amiri", "Noto Naskh Arabic", "Times New Roman", serif;
        font-size: 13pt;
        line-height: 1.8;
        color: #1a1a1a;
        padding: 0;
        margin: 0;
      }

      /* Assure que le contenu arabe s'affiche correctement */
      [dir="rtl"], p, div, span, h1, h2, h3 {
        font-family: "Amiri", "Noto Naskh Arabic", "Times New Roman", serif;
      }

      pre {
        white-space: pre-wrap;
        font-family: inherit;
        font-size: inherit;
      }

      /* Reset des marges pour les paragraphes générés */
      p {
        margin-bottom: 0.5em;
      }

      h2 {
        font-size: 15pt;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    ${content}
  </body>
</html>`;
}

export const maxDuration = 60;

export async function POST(req: Request) {
  let browser;

  try {
    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "Missing document id" },
        { status: 400 },
      );
    }

    const doc = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (!doc[0]) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    const { content, title } = doc[0];

    browser = await getBrowser();
    const page = await browser.newPage();

    // Autorise le chargement des polices Google Fonts
    await page.setExtraHTTPHeaders({
      "Accept-Language": "fr-FR,fr;q=0.9,ar;q=0.8",
    });

    await page.setContent(buildHtmlPage(content), {
      // networkidle2 attend que les polices Google Fonts soient chargées
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // S'assure que les polices sont bien appliquées avant le rendu PDF
    await page.evaluateHandle("document.fonts.ready");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
    });

    await browser.close();

    const asciiTitle =
      title
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\x20-\x7E]/g, "_")
        .replace(/[\\"/]/g, "_")
        .trim() || "document";

    const encodedTitle = encodeURIComponent(title.trim() || "document");

    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${asciiTitle}.pdf"; filename*=UTF-8''${encodedTitle}.pdf`,
      },
    });
  } catch (err) {
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }

    console.error("[PDF] Erreur de génération :", err);
    return NextResponse.json(
      { error: "Échec de la génération du PDF." },
      { status: 500 },
    );
  }
}
