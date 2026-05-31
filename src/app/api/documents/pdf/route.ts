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

    await page.setContent(
      `<!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 40px 50px;
              font-family: "Times New Roman", Times, serif;
              font-size: 13pt;
              line-height: 1.8;
              color: #1a1a1a;
            }
            pre {
              white-space: pre-wrap;
              font-family: inherit;
              font-size: inherit;
            }
          </style>
        </head>
        <body>${content}</body>
      </html>`,
      { waitUntil: "load" },
    );

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
