"use client";
import { useState, useEffect } from "react";

interface Props {
  notificationId: string;
  documents: string[];
}

export function DocumentChecklist({ notificationId, documents }: Props) {
  const storageKey = `baoyan-checklist-${notificationId}`;

  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setChecked(JSON.parse(saved));
    } catch {}
    setMounted(true);
  }, [storageKey]);

  const toggle = (index: number) => {
    const next = { ...checked, [index]: !checked[index] };
    setChecked(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}
  };

  const progress = documents.length > 0
    ? Math.round((Object.values(checked).filter(Boolean).length / documents.length) * 100)
    : 0;

  if (!mounted) return null;

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[#FF6B35] rounded-sm" />
          <span className="text-xs font-semibold text-[#1A1A1A]">
            材料准备清单
          </span>
        </div>
        <span className="text-[10px] text-[#6B7280]">{progress}%</span>
      </div>

      {progress > 0 && (
        <div className="h-1 bg-gray-100 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full bg-[#FF6B35] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <ul className="space-y-1.5">
        {documents.map((doc, i) => {
          const done = !!checked[i];
          return (
            <li
              key={i}
              onClick={() => toggle(i)}
              className={`group flex items-start gap-2.5 p-2 rounded-md cursor-pointer transition-all duration-150 border ${
                done
                  ? "border-[#FF6B35] bg-[#FF6B35]/5"
                  : "border-transparent hover:border-gray-200 hover:shadow-sm"
              }`}
            >
              <div
                className={`mt-0.5 w-4 h-4 flex-shrink-0 flex items-center justify-center rounded-sm border transition-colors ${
                  done
                    ? "bg-[#FF6B35] border-[#FF6B35]"
                    : "border-gray-300 group-hover:border-[#FF6B35]"
                }`}
              >
                {done && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span
                className={`text-xs leading-snug transition-colors ${
                  done ? "text-gray-400 line-through" : "text-gray-700"
                }`}
              >
                {doc}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
