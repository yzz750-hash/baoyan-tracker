import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    let prismaOk = false;
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.$queryRaw`SELECT 1`;
      prismaOk = true;
    } catch (e: any) {
      return NextResponse.json({
        success: false,
        prismaOk: false,
        error: e.message?.slice(0, 200),
        body,
      });
    }
    return NextResponse.json({ success: true, prismaOk, body });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message?.slice(0, 200) },
      { status: 500 }
    );
  }
}
