import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subs = await prisma.subscription.findMany({
    where: { userId: session.user.id, isActive: true },
    select: { universityId: true },
  });

  return NextResponse.json(subs.map((s) => s.universityId));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { universityId } = await req.json();

  const sub = await prisma.subscription.upsert({
    where: { userId_universityId: { userId: session.user.id, universityId } },
    update: { isActive: true },
    create: { userId: session.user.id, universityId },
  });

  return NextResponse.json(sub);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { universityId } = await req.json();

  await prisma.subscription.updateMany({
    where: { userId: session.user.id, universityId, isActive: true },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true });
}
