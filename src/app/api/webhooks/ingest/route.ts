import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  let inserted = 0;

  for (const n of body.notifications) {
    try {
      await prisma.notification.create({
        data: {
          universityId: body.universityId,
          title: n.title,
          url: n.url,
          publishDate: n.publishDate ? new Date(n.publishDate) : null,
          hash: n.hash,
          summary: n.summary,
        },
      });
      inserted++;
    } catch (e: any) {
      if (e.code === "P2002") continue;
      throw e;
    }
  }

  if (inserted > 0 && process.env.QSTASH_TOKEN) {
    try {
      const { Client } = await import("@upstash/qstash");
      const qstash = new Client({
        token: process.env.QSTASH_TOKEN,
        baseUrl: "https://qstash-us-east-1.upstash.io",
      });
      await qstash.publishJSON({
        url: `${process.env.NEXTAUTH_URL}/api/tasks/send-notification`,
        body: { universityId: body.universityId, newCount: inserted },
      });
    } catch (e: any) {
      console.error("[QStash] publish failed:", e.message);
    }
  }

  return NextResponse.json({
    success: true,
    processed: body.notifications.length,
    inserted,
    queuedForPush: inserted > 0 && process.env.QSTASH_TOKEN ? "qstash" : 0,
  });
}
