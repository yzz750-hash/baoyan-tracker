import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      applications: {
        where: { ddl: { not: null } },
        include: { university: true },
        orderBy: { ddl: "asc" },
      },
    },
  });

  if (!user) redirect("/login");

  const icalUrl = `${process.env.NEXTAUTH_URL}/api/ical/${user.icalToken}`;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#1A1A1A]">日历</h1>

      <div className="bg-[#FAFAFA] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">
          日历订阅链接
        </h3>
        <p className="text-xs text-[#6B7280] mb-3">
          复制以下链接到 Apple 日历或 Google 日历中添加订阅
        </p>
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#6B7280] break-all select-all">
          {icalUrl}
        </div>
      </div>

      <div className="space-y-2">
        {user.applications.map((app) => (
          <div
            key={app.id}
            className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between"
          >
            <div>
              <div className="text-sm font-medium text-[#1A1A1A]">
                {app.university.name} · {app.university.program} 截止
              </div>
              {app.nextStep && (
                <div className="text-xs text-[#6B7280] mt-0.5">
                  {app.nextStep}
                </div>
              )}
            </div>
            <div className="text-sm font-bold text-[#FF6B35]">
              {app.ddl!.toLocaleDateString("zh-CN")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
