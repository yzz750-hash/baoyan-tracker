import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const applications = await prisma.application.findMany({
    where: { userId },
    include: {
      university: { select: { name: true, program: true } },
      _count: { select: { documents: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const upcomingDeadlines = applications
    .filter((a) => a.ddl && a.ddl > new Date())
    .sort((a, b) => a.ddl!.getTime() - b.ddl!.getTime())
    .slice(0, 5)
    .map((a) => ({
      applicationId: a.id,
      universityName: a.university.name,
      program: a.university.program,
      ddl: a.ddl!.toISOString(),
      nextStep: a.nextStep,
      daysLeft: Math.ceil(
        (a.ddl!.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ),
    }));

  return NextResponse.json({
    applications: applications.map((a) => ({
      id: a.id,
      university: a.university,
      status: a.status,
      ddl: a.ddl?.toISOString() ?? null,
      nextStep: a.nextStep,
      notes: a.notes,
      documentsCount: a._count.documents,
    })),
    upcomingDeadlines,
  });
}
