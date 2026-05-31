import { db } from "@/src/db";
import { documents } from "@/src/db/schema/documents";
import { eq } from "drizzle-orm";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

async function getBrowser() {
  if (process.env.NODE_ENV === "production") {
    const chromium = (await import("@sparticuz/chromium-min")).default;
    const puppeteer = (await import("puppeteer-core")).default;

    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1280, height: 800 },
      executablePath: await chromium.executablePath(
        "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar",
      ),
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

    // ✅ FIX ARABE: police embarquée locale (OBLIGATOIRE pour Vercel)
    const fontPath = path.join(
      process.cwd(),
      "public/fonts/NotoNaskhArabic-Regular.ttf",
    );

    const fontBase64 = fs.readFileSync(fontPath).toString("base64");

    await page.setContent(
      `
      <!DOCTYPE html>
      <html lang="ar">
        <head>
          <meta charset="UTF-8" />
          <style>
            @font-face {
              font-family: "ArabicFont";
              src: url(data:font/ttf;base64,${fontBase64}) format("truetype");
            }

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 40px 50px;
              font-family: "ArabicFont", Arial, sans-serif;
              font-size: 14px;
              line-height: 2;
              color: #1a1a1a;
              direction: rtl;
            }

            p {
              margin: 0 0 10px 0;
            }

            h2 {
              text-align: center;
              margin: 30px 0;
            }
          </style>
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
      `,
      { waitUntil: "load" },
    );

    // inject HTML
    await page.evaluate((htmlContent) => {
      const root = document.getElementById("root");
      if (root) root.innerHTML = htmlContent;
    }, content);

    // attendre fonts
    await page.evaluate(() => document.fonts?.ready);

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "20mm",
        right: "20mm",
      },
    });

    await browser.close();

    const asciiTitle =
      title
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\x20-\x7E]/g, "_")
        .trim() || "document";

    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${asciiTitle}.pdf"`,
      },
    });
  } catch (err) {
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }

    console.error("[PDF ERROR]", err);

    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 },
    );
  }
}
