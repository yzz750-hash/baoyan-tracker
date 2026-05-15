interface DDLItem {
  applicationId: string;
  universityName: string;
  program: string;
  ddl: string;
  nextStep: string | null;
  daysLeft: number;
}

export function UrgentDDL({ deadlines }: { deadlines: DDLItem[] }) {
  if (deadlines.length === 0) return null;

  return (
    <div className="bg-[#FAFAFA] rounded-xl p-4">
      <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">
        即将截止
      </h3>
      <div className="space-y-2">
        {deadlines.map((d) => (
          <div
            key={d.applicationId}
            className="flex items-center justify-between bg-white rounded-lg px-4 py-3"
          >
            <div>
              <div className="text-sm font-medium text-[#1A1A1A]">
                {d.universityName} · {d.program}
              </div>
              {d.nextStep && (
                <div className="text-xs text-[#6B7280] mt-0.5">
                  {d.nextStep}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-[#FF6B35]">
                {d.daysLeft}天
              </div>
              <div className="text-xs text-[#6B7280]">
                {new Date(d.ddl).toLocaleDateString("zh-CN")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
