import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const user = await prisma.user.findUnique({
    where: { icalToken: params.token },
    include: {
      applications: {
        where: { ddl: { not: null } },
        include: { university: true },
      },
    },
  });

  if (!user) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BaoyanTracker//CN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:保研进度通",
  ];

  for (const app of user.applications) {
    if (!app.ddl) continue;
    const d = app.ddl;
    const ds = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${app.id}@baoyan`);
    lines.push(`DTSTART;VALUE=DATE:${ds}`);
    lines.push(`SUMMARY:${app.university.name} ${app.university.program} 截止`);
    if (app.nextStep) lines.push(`DESCRIPTION:${app.nextStep}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": "inline; filename=baoyan.ics",
    },
  });
}
