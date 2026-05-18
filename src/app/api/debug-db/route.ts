import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { prisma } = await import("@/lib/prisma");
    const recent = await prisma.$queryRaw<
      { id: string; title: string; extractedData: unknown; createdAt: Date }[]
    >`SELECT id, title, "extractedData", "createdAt" FROM "Notification" WHERE "extractedData" IS NOT NULL ORDER BY "createdAt" DESC LIMIT 1`;
    return NextResponse.json({ success: true, recent: recent[0] || null });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message?.slice(0, 200) },
      { status: 500 }
    );
  }
}
