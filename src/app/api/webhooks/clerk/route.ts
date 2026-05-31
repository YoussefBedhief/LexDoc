import { db } from "@/src/db";
import { companies } from "@/src/db/schema/companies";
import { users } from "@/src/db/schema/users";
import { WebhookEvent } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Missing webhook secret in env variables");
  }

  // Getting svix header signatures
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Headers svix missing." },
      { status: 400 },
    );
  }

  // Checking webhook signature
  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error checking webhook payload:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  // Treating clerk event
  switch (evt.type) {
    case "user.created": {
      const { id: clerkUserId } = evt.data;

      // Checking if the user existe in the database
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.clerkUserId, clerkUserId))
        .limit(1);

      if (existing.length === 0) {
        // If it's a new user we add him in the database
        await db.insert(users).values({
          clerkUserId,
          role: "user",
          companyId: null,
        });
      }
      break;
    }

    case "user.deleted": {
      const { id: clerkUserId } = evt.data;

      if (clerkUserId) {
        // Get user companyId
        const [dbUser] = await db
          .select({ companyId: users.companyId })
          .from(users)
          .where(eq(users.clerkUserId, clerkUserId))
          .limit(1);

        // If the user has a company we deleting it
        if (dbUser?.companyId) {
          await db.delete(companies).where(eq(companies.id, dbUser.companyId));
        }

        await db.delete(users).where(eq(users.clerkUserId, clerkUserId));
      }
      break;
    }

    default:
      // Add here update events in future cases
      break;
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
