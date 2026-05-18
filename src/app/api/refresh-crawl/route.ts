import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.GITHUB_PAT;
  if (!token) {
    return NextResponse.json(
      { error: "GitHub token not configured" },
      { status: 500 }
    );
  }

  const res = await fetch(
    "https://api.github.com/repos/yzz750-hash/baoyan-tracker/actions/workflows/crawl.yml/dispatches",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "baoyan-tracker",
      },
      body: JSON.stringify({ ref: "master" }),
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: `GitHub API error: ${res.status}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
