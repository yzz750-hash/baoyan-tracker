import { ApplicationStatus } from "@prisma/client";

const statusConfig: Record<
  ApplicationStatus,
  { label: string; color: string }
> = {
  PREPARING: { label: "材料准备", color: "bg-[#FF6B35] text-white" },
  SUBMITTED: { label: "已提交", color: "bg-blue-100 text-blue-800" },
  INTERVIEW_PREP: { label: "面试准备", color: "bg-indigo-500 text-white" },
  WAITLISTED: { label: "候补中", color: "bg-amber-100 text-amber-800" },
  OFFER: { label: "已录用", color: "bg-emerald-100 text-emerald-800" },
  REJECTED: { label: "未录用", color: "bg-gray-100 text-gray-500" },
};

export function ProgressOverview({
  counts,
}: {
  counts: Record<string, number>;
}) {
  return (
    <div className="flex gap-3">
      {(Object.keys(statusConfig) as ApplicationStatus[]).map((status) => (
        <div
          key={status}
          className={`flex-1 rounded-xl p-4 ${statusConfig[status].color}`}
        >
          <div className="text-2xl font-bold">{counts[status] ?? 0}</div>
          <div className="text-xs mt-1 opacity-80">
            {statusConfig[status].label}
          </div>
        </div>
      ))}
    </div>
  );
}
