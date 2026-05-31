import { db } from "@/src/db";
import { documents } from "@/src/db/schema/documents";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

async function getBrowser() {
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
}

export async function POST(req: Request) {
  let browser;

  try {
    const { documentId } = await req.json();

    const doc = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (!doc[0]) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { content, title } = doc[0];

    browser = await getBrowser();
    const page = await browser.newPage();

    // IMPORTANT: Google Fonts Arabic (NO base64)
    await page.setContent(
      `
      <!DOCTYPE html>
      <html lang="ar">
      <head>
        <meta charset="UTF-8" />

        <link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap" rel="stylesheet"/>

        <style>
          * { box-sizing: border-box; }

          body {
            margin: 0;
            padding: 40px 50px;
            font-family: "Noto Naskh Arabic", serif;
            font-size: 16px;
            line-height: 2;
            direction: rtl;
            color: #111;
          }

          #root {
            font-family: "Noto Naskh Arabic", serif;
          }

          p, span, div, h2 {
            font-family: "Noto Naskh Arabic", serif;
          }
        </style>
      </head>

      <body>
        <div id="root"></div>
      </body>
      </html>
      `,
      { waitUntil: "domcontentloaded" },
    );

    // inject content
    await page.evaluate((html) => {
      document.getElementById("root")!.innerHTML = html;
    }, content);

    // 🔥 CRUCIAL FIX: wait for fonts + rendering
    await page.evaluate(async () => {
      await document.fonts.ready;

      // force layout recalculation (important for Arabic)
      document.body.innerHTML = document.body.innerHTML;
    });

    // extra safety delay (Chromium Vercel fix)
    await new Promise((r) => setTimeout(r, 1000));

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();

    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${title}.pdf"`,
      },
    });
  } catch (e) {
    if (browser) await browser.close();
    console.error(e);

    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 },
    );
  }
}
