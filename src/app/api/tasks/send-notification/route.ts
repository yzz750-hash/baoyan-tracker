import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Receiver } from "@upstash/qstash";

export async function POST(req: NextRequest) {
  // 验证请求来自 QStash
  const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
  });

  const signature = req.headers.get("upstash-signature") || "";
  const bodyText = await req.text();

  try {
    await receiver.verify({ signature, body: bodyText });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { universityId } = JSON.parse(bodyText);

  // 查询该院校的订阅用户
  const subscribers = await prisma.subscription.findMany({
    where: { universityId, isActive: true },
    include: { user: true },
  });

  // 查询最近的通知
  const recentNotifications = await prisma.notification.findMany({
    where: { universityId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  let sent = 0;
  for (const sub of subscribers) {
    if (!sub.user.email) continue;

    // 记录每条通知对每个用户的推送
    for (const n of recentNotifications) {
      try {
        await prisma.notificationDelivery.create({
          data: {
            notificationId: n.id,
            userId: sub.user.id,
            channel: "EMAIL",
            status: "SENT",
          },
        });
        sent++;
      } catch (e: any) {
        if (e.code === "P2002") continue;
      }
    }
  }

  return NextResponse.json({
    success: true,
    subscribers: subscribers.length,
    notifications: recentNotifications.length,
    delivered: sent,
  });
}
