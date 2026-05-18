import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { prisma } = await import("@/lib/prisma");
    await prisma.$queryRaw`SELECT 1`;
    let alterResult = "not attempted";
    try {
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "extractedData" JSONB'
      );
      alterResult = "success";
    } catch (e: any) {
      alterResult = "fail: " + (e.message?.slice(0, 150) || "unknown");
    }
    return NextResponse.json({ success: true, alterResult, body });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message?.slice(0, 200) },
      { status: 500 }
    );
  }
}
