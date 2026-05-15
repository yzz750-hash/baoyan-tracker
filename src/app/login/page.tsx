"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await signIn("credentials", { email, callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm space-y-6 p-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">保研进度通</h1>
        <p className="text-[#6B7280] text-sm">登录以管理你的保研申请</p>
        <input
          type="email"
          placeholder="输入邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
        />
        <button
          onClick={handleLogin}
          disabled={loading || !email}
          className="w-full bg-[#FF6B35] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#FF6B35]/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "登录中..." : "继续"}
        </button>
      </div>
    </div>
  );
}
