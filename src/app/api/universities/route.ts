import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  const universities = await prisma.university.findMany({
    where: q
      ? { OR: [{ name: { contains: q } }, { program: { contains: q } }] }
      : undefined,
    orderBy: { name: "asc" },
  });
  return NextResponse.json(universities);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, program, websiteUrl } = body;
  if (!name || !program) {
    return NextResponse.json({ error: "name and program required" }, { status: 400 });
  }
  const uni = await prisma.university.create({
    data: { name, program, websiteUrl: websiteUrl || "" },
  });
  return NextResponse.json(uni);
}
