import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProgressOverview } from "@/components/dashboard/progress-overview";
import { UrgentDDL } from "@/components/dashboard/urgent-ddl";
import { FeedTimeline } from "@/components/dashboard/feed-timeline";

const statusLabels: Record<string, string> = {
  PREPARING: "材料准备",
  SUBMITTED: "已提交",
  INTERVIEW_PREP: "面试准备",
  WAITLISTED: "候补中",
  OFFER: "已录用",
  REJECTED: "未录用",
};

const badgeColors: Record<string, string> = {
  PREPARING: "bg-[#FF6B35]",
  SUBMITTED: "bg-blue-500",
  INTERVIEW_PREP: "bg-indigo-500",
  WAITLISTED: "bg-amber-500",
  OFFER: "bg-emerald-500",
  REJECTED: "bg-gray-400",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const applications = await prisma.application.findMany({
    where: { userId },
    include: { university: true },
    orderBy: { updatedAt: "desc" },
  });

  const counts: Record<string, number> = {
    PREPARING: 0,
    SUBMITTED: 0,
    INTERVIEW_PREP: 0,
    WAITLISTED: 0,
    OFFER: 0,
    REJECTED: 0,
  };
  for (const app of applications) counts[app.status]++;

  const feed = await prisma.notification.findMany({
    where: {
      university: {
        subscriptions: { some: { userId, isActive: true } },
      },
    },
    include: {
      university: { select: { name: true, program: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const now = new Date();
  const deadlines = applications
    .filter((a) => a.ddl && a.ddl > now)
    .sort((a, b) => a.ddl!.getTime() - b.ddl!.getTime())
    .slice(0, 5)
    .map((a) => ({
      applicationId: a.id,
      universityName: a.university.name,
      program: a.university.program,
      ddl: a.ddl!.toISOString(),
      nextStep: a.nextStep,
      daysLeft: Math.ceil(
        (a.ddl!.getTime() - now.getTime()) / 86400000
      ),
    }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#1A1A1A]">仪表盘</h1>
      <ProgressOverview counts={counts} />
      <UrgentDDL deadlines={deadlines} />

      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-[#1A1A1A] mb-4">
          已订阅院校动态
        </h2>
        <FeedTimeline notifications={feed} />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-[#1A1A1A] mb-3">
          我的申请
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white border border-gray-100 rounded-xl p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#1A1A1A]">
                    {app.university.name}
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {app.university.program}
                  </p>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full text-white font-medium ${
                    badgeColors[app.status] ?? "bg-gray-400"
                  }`}
                >
                  {statusLabels[app.status] ?? app.status}
                </span>
              </div>
              {app.ddl && (
                <div className="mt-3 text-xs text-[#6B7280]">
                  截止: {app.ddl.toLocaleDateString("zh-CN")}
                </div>
              )}
              {app.nextStep && (
                <div className="mt-1 text-xs text-[#FF6B35]">
                  {app.nextStep}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
