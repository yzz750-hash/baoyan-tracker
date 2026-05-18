import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.$queryRaw<
    { id: string; title: string; extractedData: unknown }[]
  >`SELECT id, title, "extractedData" FROM "Notification" WHERE "extractedData" IS NOT NULL ORDER BY "createdAt" DESC LIMIT 10`;
  return NextResponse.json(items);
}
