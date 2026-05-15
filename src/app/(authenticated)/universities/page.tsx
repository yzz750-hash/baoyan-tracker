"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Bell, BellOff } from "lucide-react";

interface University {
  id: string;
  name: string;
  program: string;
  websiteUrl: string;
}

export default function UniversitiesPage() {
  const [query, setQuery] = useState("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [subscribedIds, setSubscribedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/subscriptions")
      .then((r) => r.json())
      .then((ids: string[]) => setSubscribedIds(new Set(ids)));
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      fetch("/api/universities")
        .then((r) => r.json())
        .then(setUniversities);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/universities?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then(setUniversities);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSubscribe = async (universityId: string) => {
    setLoading(true);
    try {
      await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universityId }),
      });
      setSubscribedIds((prev) => new Set(prev).add(universityId));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A1A1A]">院校库</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          搜索院校并订阅通知，第一时间获取招生动态
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
        <input
          type="text"
          placeholder="搜索院校或专业名称..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-shadow"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {universities.map((uni) => {
          const isSubscribed = subscribedIds.has(uni.id);
          return (
            <div
              key={uni.id}
              className="bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[#1A1A1A] truncate">
                    {uni.name}
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-1 truncate">
                    {uni.program}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleSubscribe(uni.id)}
                disabled={loading}
                className={`mt-4 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  isSubscribed
                    ? "bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/20"
                    : "bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90"
                }`}
              >
                {isSubscribed ? (
                  <>
                    <BellOff className="w-3 h-3" /> 已订阅
                  </>
                ) : (
                  <>
                    <Bell className="w-3 h-3" /> 订阅通知
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {universities.length === 0 && (
        <div className="text-center py-12 text-sm text-[#6B7280]">
          {query ? "未找到匹配的院校" : "暂无院校数据"}
        </div>
      )}
    </div>
  );
}
