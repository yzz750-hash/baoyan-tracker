"use client";

import { useState, useEffect } from "react";
import { Plus, FileText } from "lucide-react";

interface Document {
  id: string;
  type: string;
  title: string | null;
  version: number;
  application: { university: { name: string } } | null;
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  ps: "个人陈述",
  cv: "简历",
  recommendation_letter: "推荐信",
  transcript: "成绩单",
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    fetch("/api/documents")
      .then((r) => r.json())
      .then(setDocuments);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">文书管理</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            管理你的个人陈述、简历和推荐信
          </p>
        </div>
        <button className="flex items-center gap-1.5 text-sm bg-[#FF6B35] text-white px-3 py-2 rounded-lg hover:bg-[#FF6B35]/90 transition-colors">
          <Plus className="w-4 h-4" /> 新建文书
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-[#FF6B35]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-[#1A1A1A] truncate">
                  {doc.title || typeLabels[doc.type] || doc.type}
                </h3>
                <p className="text-xs text-[#6B7280] mt-1">
                  v{doc.version} ·{" "}
                  {doc.application?.university.name || "通用"}
                </p>
              </div>
              <span className="text-[10px] bg-gray-100 text-[#6B7280] px-2 py-0.5 rounded-full shrink-0">
                {typeLabels[doc.type] || doc.type}
              </span>
            </div>
          </div>
        ))}
      </div>

      {documents.length === 0 && (
        <div className="text-center py-12 text-sm text-[#6B7280]">
          还没有文书，点击右上角创建
        </div>
      )}
    </div>
  );
}
