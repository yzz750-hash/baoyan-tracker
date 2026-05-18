import { ExternalLink, Bell } from "lucide-react";
import { DocumentChecklist } from "./document-checklist";

interface ExtractedData {
  required_documents?: string[];
  target_program?: string;
  summary?: string;
}

interface FeedItem {
  id: string;
  title: string;
  url: string;
  publishDate: Date | null;
  createdAt: Date;
  university: { name: string; program: string };
  extractedData?: unknown;
}

export function FeedTimeline({ notifications }: { notifications: FeedItem[] }) {
  if (notifications.length === 0) {
    return (
      <div className="bg-[#FAFAFA] rounded-xl p-8 text-center">
        <Bell className="w-8 h-8 text-[#6B7280] mx-auto mb-3" />
        <p className="text-sm text-[#6B7280]">
          还没有已订阅院校的动态
        </p>
        <p className="text-xs text-[#6B7280] mt-1">
          去院校库订阅你关注的学校
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {notifications.map((n, i) => (
        <div
          key={n.id}
          className="flex items-start gap-4 py-4 group"
        >
          {/* 时间线竖线 + 圆点 */}
          <div className="flex flex-col items-center shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B35] ring-2 ring-white z-10" />
            {i < notifications.length - 1 && (
              <div className="w-px flex-1 bg-gray-200 mt-1" />
            )}
          </div>

          {/* 内容 */}
          <div className="flex-1 min-w-0 pb-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <a
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[#1A1A1A] group-hover:text-[#FF6B35] transition-colors leading-snug no-underline"
                >
                  {n.title}
                </a>
                <p className="text-xs text-[#6B7280] mt-1">
                  {n.university.name} · {n.university.program}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-[#6B7280]">
                  {new Date(n.createdAt).toLocaleDateString("zh-CN", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <a
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6B7280] hover:text-[#FF6B35] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {(() => {
              const ed = n.extractedData as ExtractedData | null | undefined;
              return ed?.required_documents ? (
                <DocumentChecklist
                  notificationId={n.id}
                  documents={ed.required_documents}
                />
              ) : null;
            })()}
          </div>
        </div>
      ))}
    </div>
  );
}
