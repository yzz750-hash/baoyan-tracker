"use client";
import { useState } from "react";
import { RefreshCw } from "lucide-react";

export function RefreshButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleRefresh = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/refresh-crawl", { method: "POST" });
      if (res.ok) {
        setMsg("爬取已触发，几分钟后刷新页面查看");
      } else {
        const data = await res.json();
        setMsg(data.error || "触发失败");
      }
    } catch {
      setMsg("网络错误");
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 5000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#FF6B35] transition-colors disabled:opacity-40"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        {loading ? "爬取中..." : "刷新"}
      </button>
      {msg && <span className="text-xs text-[#6B7280]">{msg}</span>}
    </div>
  );
}
