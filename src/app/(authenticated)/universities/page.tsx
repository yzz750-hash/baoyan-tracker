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

  const [subscribeError, setSubscribeError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newProgram, setNewProgram] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const handleAddUniversity = async () => {
    if (!newName.trim() || !newProgram.trim()) return;
    setSubscribeError("");
    try {
      const res = await fetch("/api/universities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), program: newProgram.trim(), websiteUrl: newUrl.trim() }),
      });
      if (!res.ok) { setSubscribeError("添加失败"); return; }
      const uni = await res.json();
      setUniversities((prev) => [...prev, uni]);
      setNewName(""); setNewProgram(""); setNewUrl("");
      setShowAddForm(false);
    } catch { setSubscribeError("网络错误"); }
  };

  const handleToggleSubscribe = async (universityId: string, currentlySubscribed: boolean) => {
    setLoading(true);
    setSubscribeError("");
    try {
      if (currentlySubscribed) {
        const res = await fetch("/api/subscriptions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ universityId }),
        });
        if (!res.ok) { setSubscribeError("取消失败"); return; }
        setSubscribedIds((prev) => { const next = new Set(prev); next.delete(universityId); return next; });
      } else {
        const res = await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ universityId }),
        });
        if (!res.ok) { setSubscribeError("订阅失败，请确认已登录"); return; }
        setSubscribedIds((prev) => new Set(prev).add(universityId));
      }
    } catch {
      setSubscribeError("网络错误，请重试");
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

      <div className="flex items-center justify-between">
        <p className="text-xs text-[#6B7280]">{universities.length} 所院校</p>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs text-[#FF6B35] hover:underline"
        >
          {showAddForm ? "取消" : "+ 添加院校"}
        </button>
      </div>

      {showAddForm && (
        <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
          <input
            placeholder="院校名称（如：北京大学）"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
          />
          <input
            placeholder="专业方向（如：计算机科学与技术）"
            value={newProgram}
            onChange={(e) => setNewProgram(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
          />
          <input
            placeholder="官网地址（可选）"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
          />
          <button
            onClick={handleAddUniversity}
            disabled={!newName.trim() || !newProgram.trim()}
            className="w-full py-2 bg-[#FF6B35] text-white text-sm font-medium rounded-lg hover:bg-[#FF6B35]/90 disabled:opacity-40 transition-colors"
          >
            添加
          </button>
        </div>
      )}

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
                onClick={() => handleToggleSubscribe(uni.id, isSubscribed)}
                disabled={loading}
                className={`mt-4 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  isSubscribed
                    ? "bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/20 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
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

      {subscribeError && (
        <div className="text-center py-4 text-sm text-red-500">
          {subscribeError}
        </div>
      )}

      {universities.length === 0 && (
        <div className="text-center py-12 text-sm text-[#6B7280]">
          {query ? "未找到匹配的院校" : "暂无院校数据"}
        </div>
      )}
    </div>
  );
}
