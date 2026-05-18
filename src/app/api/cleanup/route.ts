import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const ids = [
    "cmpajf3kc000011awfivaf6ea",
    "cmpajfszx000311aw3jtitnc5",
    "cmpaji7310003yei498mzno3d",
    "cmpajhqqu0000yei4cty09dam",
  ];
  const result = await prisma.notification.deleteMany({
    where: { universityId: { in: ids } },
  });
  return NextResponse.json({ deleted: result.count });
}
