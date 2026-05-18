import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { prisma } = await import("@/lib/prisma");
    const recent = await prisma.notification.findFirst({
      where: { extractedData: { not: null } },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, extractedData: true, summary: true, createdAt: true },
    });
    return NextResponse.json({ success: true, recent, body });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message?.slice(0, 200) },
      { status: 500 }
    );
  }
}
