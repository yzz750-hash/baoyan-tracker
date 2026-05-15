import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    include: { application: { include: { university: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(documents);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, title, content, applicationId } = await req.json();

  const doc = await prisma.document.create({
    data: {
      userId: session.user.id,
      type,
      title,
      content,
      applicationId,
    },
  });

  return NextResponse.json(doc);
}
