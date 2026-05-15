# 保研通知系统 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 搭建保研通知与进度管理系统的 Next.js 完整基建，含数据库 Schema、Webhook API、仪表盘 UI、院校库、文书管理、iCal 日历

**架构：** Next.js 14+ App Router + Prisma + PostgreSQL + shadcn/ui，Python 爬虫为独立项目

**技术栈：** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Prisma, PostgreSQL (Supabase), NextAuth.js

---

### Phase 0: 项目脚手架

#### Task 0.1: 初始化 Next.js 项目

**Files:**
- Create: `G:\projects\baoyan\package.json`
- Create: `G:\projects\baoyan\tsconfig.json`
- Create: `G:\projects\baoyan\next.config.js`
- Create: `G:\projects\baoyan\tailwind.config.ts`
- Create: `G:\projects\baoyan\postcss.config.js`
- Create: `G:\projects\baoyan\src\app\layout.tsx`
- Create: `G:\projects\baoyan\src\app\page.tsx`
- Create: `G:\projects\baoyan\src\app\globals.css`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "baoyan-tracker",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:push": "prisma db push",
    "db:generate": "prisma generate",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@prisma/client": "^5.14.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-badge": "^1.0.3",
    "@radix-ui/react-card": "^1.0.3",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.350.0",
    "next-auth": "^4.24.0",
    "bcryptjs": "^2.4.3",
    "date-fns": "^3.6.0",
    "react-day-picker": "^8.10.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.11.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "prisma": "^5.14.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "tsx": "^4.7.0"
  }
}
```

- [ ] **Step 2: 安装依赖**

Run: `cd G:\projects\baoyan && npm install`
Expected: All 30+ packages installed, node_modules/ created

- [ ] **Step 3: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: 创建 next.config.js**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};
module.exports = nextConfig;
```

- [ ] **Step 5: 创建 tailwind.config.ts**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF6B35",
          50: "#FFF0EB",
          100: "#FFD6C8",
          200: "#FFB8A0",
          300: "#FF9A78",
          400: "#FF7C50",
          500: "#FF6B35",
          600: "#E05520",
          700: "#C04015",
          800: "#A03010",
          900: "#802508",
        },
        background: "#FFFFFF",
        card: "#FAFAFA",
        foreground: "#1A1A1A",
        muted: { foreground: "#6B7280" },
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 6: 创建 postcss.config.js**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 7: 创建 src/app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: #FFFFFF;
    --foreground: #1A1A1A;
    --card: #FAFAFA;
    --muted-foreground: #6B7280;
  }

  body {
    @apply bg-white text-[#1A1A1A];
  }
}
```

- [ ] **Step 8: 创建 src/app/layout.tsx**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "保研进度通",
  description: "保研通知与进度管理系统",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 9: 创建 src/app/page.tsx**

```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
```

- [ ] **Step 10: 创建 .env.example**

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
WEBHOOK_SECRET="your-webhook-secret"
```

- [ ] **Step 11: 验证项目启动**

Run: `cd G:\projects\baoyan && npx next dev`
Expected: Dev server starts on http://localhost:3000, redirects to /dashboard

---

### Phase 1: Prisma Schema + 数据库

#### Task 1.1: 初始化 Prisma 并写入 Schema

**Files:**
- Create: `G:\projects\baoyan\prisma\schema.prisma`

- [ ] **Step 1: 安装 Prisma**

Run: `cd G:\projects\baoyan && npm install prisma --save-dev && npx prisma init`
Expected: prisma/schema.prisma and .env created

- [ ] **Step 2: 写入完整 Schema**

覆盖 `prisma/schema.prisma` 为设计文档中的完整 Schema（含 User, University, Application, Subscription, Notification, NotificationDelivery, Document 以及 ApplicationStatus, DeliveryChannel, DeliveryStatus 枚举）

- [ ] **Step 3: 创建 src/lib/prisma.ts**

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 4: 推 Schema 到数据库**

Run: `cd G:\projects\baoyan && npx prisma db push`
Expected: Database tables created, no errors

- [ ] **Step 5: 生成 Prisma Client**

Run: `cd G:\projects\baoyan && npx prisma generate`
Expected: node_modules/.prisma/client generated

- [ ] **Step 6: 创建种子数据 prisma/seed.ts**

```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 创建示例院校
  const tsinghua = await prisma.university.create({
    data: {
      name: "清华大学",
      program: "计算机科学与技术",
      websiteUrl: "https://www.cs.tsinghua.edu.cn",
    },
  });

  const peking = await prisma.university.create({
    data: {
      name: "北京大学",
      program: "计算机科学与技术",
      websiteUrl: "https://eecs.pku.edu.cn",
    },
  });

  const zhejiang = await prisma.university.create({
    data: {
      name: "浙江大学",
      program: "计算机科学与技术",
      websiteUrl: "https://www.cs.zju.edu.cn",
    },
  });

  console.log(`Seeded ${3} universities`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 7: 运行种子数据**

Run: `cd G:\projects\baoyan && npx tsx prisma/seed.ts`
Expected: "Seeded 3 universities"

- [ ] **Step 8: Commit Phase 1**

Run: `git add . && git commit -m "feat: init prisma schema with seed data"`

---

### Phase 2: 认证系统

#### Task 2.1: 配置 NextAuth.js

**Files:**
- Create: `G:\projects\baoyan\src\lib\auth.ts`
- Create: `G:\projects\baoyan\src\app\api\auth\[...nextauth]\route.ts`

- [ ] **Step 1: 创建 auth.ts 配置**

```ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (user) return { id: user.id, email: user.email, name: user.name };
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async session({ session, token }) {
      if (session.user) session.user.id = token.sub!;
      return session;
    },
  },
};
```

- [ ] **Step 2: 创建 NextAuth 路由**

```ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

- [ ] **Step 3: 创建登录页面**

Create: `src/app/login/page.tsx`

```tsx
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
```

- [ ] **Step 4: Commit Task 2.1**

Run: `git add . && git commit -m "feat: add next-auth with credentials provider"`

---

### Phase 3: Webhook API

#### Task 3.1: Webhook 数据入库端点

**Files:**
- Create: `G:\projects\baoyan\src\app\api\webhooks\ingest\route.ts`

- [ ] **Step 1: 创建 Webhook 路由**

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface IngestNotification {
  title: string;
  url: string;
  publishDate: string | null;
  hash: string;
  summary: string | null;
}

interface IngestBody {
  universityId: string;
  notifications: IngestNotification[];
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: IngestBody = await req.json();
  let inserted = 0;

  for (const n of body.notifications) {
    const existing = await prisma.notification.findUnique({
      where: { hash: n.hash },
    });
    if (existing) continue;

    await prisma.notification.create({
      data: {
        universityId: body.universityId,
        title: n.title,
        url: n.url,
        publishDate: n.publishDate ? new Date(n.publishDate) : null,
        hash: n.hash,
        summary: n.summary,
      },
    });
    inserted++;
  }

  // 查询订阅该院校的用户数（推送由 QStash 异步处理）
  const subscriberCount = await prisma.subscription.count({
    where: { universityId: body.universityId, isActive: true },
  });

  return NextResponse.json({
    success: true,
    processed: body.notifications.length,
    inserted,
    queuedForPush: inserted > 0 ? subscriberCount : 0,
  });
}
```

- [ ] **Step 2: 本地测试 Webhook**

Run: `curl -X POST http://localhost:3000/api/webhooks/ingest -H "Authorization: Bearer test-secret" -H "Content-Type: application/json" -d "{\"universityId\":\"test\",\"notifications\":[{\"title\":\"测试通知\",\"url\":\"https://test.com\",\"publishDate\":\"2026-05-15T00:00:00Z\",\"hash\":\"test-hash-1\",\"summary\":null}]}"`
Expected: `{"success":true,"processed":1,"inserted":1,"queuedForPush":0}`

- [ ] **Step 3: Commit**

Run: `git add . && git commit -m "feat: add webhook ingest endpoint with dedup"`

---

### Phase 4: 布局 + 仪表盘

#### Task 4.1: 认证布局和导航

**Files:**
- Create: `G:\projects\baoyan\src\components\layout\sidebar.tsx`
- Create: `G:\projects\baoyan\src\app\(authenticated)\layout.tsx`
- Create: `G:\projects\baoyan\src\lib\utils.ts`

- [ ] **Step 1: 创建工具函数**

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: 创建侧边栏导航**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Calendar,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "仪表盘", icon: LayoutDashboard },
  { href: "/universities", label: "院校库", icon: Building2 },
  { href: "/documents", label: "文书管理", icon: FileText },
  { href: "/calendar", label: "日历", icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen border-r border-gray-100 bg-white p-6">
      <div className="text-lg font-bold text-[#1A1A1A] mb-8">保研进度通</div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-[#FF6B35]/10 text-[#FF6B35] font-medium"
                  : "text-[#6B7280] hover:bg-gray-50"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 3: 创建认证布局**

```tsx
import { Sidebar } from "@/components/layout/sidebar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

Run: `git add . && git commit -m "feat: add sidebar navigation and authenticated layout"`

---

#### Task 4.2: 仪表盘 API

**Files:**
- Create: `G:\projects\baoyan\src\app\api\dashboard\route.ts`

- [ ] **Step 1: 创建仪表盘 API**

```ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const applications = await prisma.application.findMany({
    where: { userId },
    include: {
      university: { select: { name: true, program: true } },
      _count: { select: { documents: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const upcomingDeadlines = applications
    .filter((a) => a.ddl && a.ddl > new Date())
    .sort((a, b) => (a.ddl!.getTime() - b.ddl!.getTime()))
    .slice(0, 5)
    .map((a) => ({
      applicationId: a.id,
      universityName: a.university.name,
      program: a.university.program,
      ddl: a.ddl!.toISOString(),
      nextStep: a.nextStep,
      daysLeft: Math.ceil(
        (a.ddl!.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ),
    }));

  return NextResponse.json({
    applications: applications.map((a) => ({
      id: a.id,
      university: a.university,
      status: a.status,
      ddl: a.ddl?.toISOString() ?? null,
      nextStep: a.nextStep,
      notes: a.notes,
      documentsCount: a._count.documents,
    })),
    upcomingDeadlines,
  });
}
```

- [ ] **Step 2: Commit**

Run: `git add . && git commit -m "feat: add dashboard API"`

---

#### Task 4.3: 仪表盘 UI

**Files:**
- Create: `G:\projects\baoyan\src\components\dashboard\progress-overview.tsx`
- Create: `G:\projects\baoyan\src\components\dashboard\urgent-ddl.tsx`
- Create: `G:\projects\baoyan\src\components\dashboard\application-card.tsx`
- Create: `G:\projects\baoyan\src\app\(authenticated)\dashboard\page.tsx`

- [ ] **Step 1: 创建全局进度看板组件**

```tsx
import { ApplicationStatus } from "@prisma/client";

const statusLabels: Record<ApplicationStatus, string> = {
  PREPARING: "材料准备",
  SUBMITTED: "已提交",
  INTERVIEW_PREP: "面试准备",
  WAITLISTED: "候补中",
  OFFER: "已录用",
  REJECTED: "未录用",
};

const statusColors: Record<ApplicationStatus, string> = {
  PREPARING: "bg-[#FF6B35] text-white",
  SUBMITTED: "bg-blue-100 text-blue-800",
  INTERVIEW_PREP: "bg-indigo-500 text-white",
  WAITLISTED: "bg-amber-100 text-amber-800",
  OFFER: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-gray-100 text-gray-500",
};

export function ProgressOverview({
  counts,
}: {
  counts: Record<ApplicationStatus, number>;
}) {
  return (
    <div className="flex gap-3">
      {(Object.keys(statusLabels) as ApplicationStatus[]).map((status) => (
        <div
          key={status}
          className={`flex-1 rounded-xl p-4 ${statusColors[status]}`}
        >
          <div className="text-2xl font-bold">{counts[status] || 0}</div>
          <div className="text-xs mt-1 opacity-80">
            {statusLabels[status]}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 创建紧急 DDL 组件**

```tsx
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
```

- [ ] **Step 3: 创建申请卡片组件**

```tsx
"use client";

import { ApplicationStatus } from "@prisma/client";

const statusLabels: Record<ApplicationStatus, string> = {
  PREPARING: "材料准备",
  SUBMITTED: "已提交",
  INTERVIEW_PREP: "面试准备",
  WAITLISTED: "候补中",
  OFFER: "已录用",
  REJECTED: "未录用",
};

const badgeColors: Record<ApplicationStatus, string> = {
  PREPARING: "bg-[#FF6B35]",
  SUBMITTED: "bg-blue-500",
  INTERVIEW_PREP: "bg-indigo-500",
  WAITLISTED: "bg-amber-500",
  OFFER: "bg-emerald-500",
  REJECTED: "bg-gray-400",
};

interface ApplicationCardProps {
  id: string;
  university: { name: string; program: string };
  status: ApplicationStatus;
  ddl: string | null;
  nextStep: string | null;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
}

export function ApplicationCard({
  id,
  university,
  status,
  ddl,
  nextStep,
  onStatusChange,
}: ApplicationCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#1A1A1A]">
            {university.name}
          </h3>
          <p className="text-xs text-[#6B7280] mt-0.5">{university.program}</p>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full text-white font-medium ${badgeColors[status]}`}
        >
          {statusLabels[status]}
        </span>
      </div>

      {ddl && (
        <div className="mt-3 text-xs text-[#6B7280]">
          截止: {new Date(ddl).toLocaleDateString("zh-CN")}
        </div>
      )}

      {nextStep && (
        <div className="mt-1 text-xs text-[#FF6B35]">{nextStep}</div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 创建仪表盘页面**

```tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProgressOverview } from "@/components/dashboard/progress-overview";
import { UrgentDDL } from "@/components/dashboard/urgent-ddl";
import { ApplicationCard } from "@/components/dashboard/application-card";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const applications = await prisma.application.findMany({
    where: { userId },
    include: { university: true },
    orderBy: { updatedAt: "desc" },
  });

  const counts = { PREPARING: 0, SUBMITTED: 0, INTERVIEW_PREP: 0, WAITLISTED: 0, OFFER: 0, REJECTED: 0 };
  for (const app of applications) counts[app.status]++;

  const deadlines = applications
    .filter((a) => a.ddl && a.ddl > new Date())
    .sort((a, b) => a.ddl!.getTime() - b.ddl!.getTime())
    .slice(0, 5)
    .map((a) => ({
      applicationId: a.id,
      universityName: a.university.name,
      program: a.university.program,
      ddl: a.ddl!.toISOString(),
      nextStep: a.nextStep,
      daysLeft: Math.ceil((a.ddl!.getTime() - Date.now()) / 86400000),
    }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#1A1A1A]">仪表盘</h1>
      <ProgressOverview counts={counts} />

      <UrgentDDL deadlines={deadlines} />

      <div>
        <h2 className="text-sm font-semibold text-[#1A1A1A] mb-3">
          我的申请
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#1A1A1A]">{app.university.name}</h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">{app.university.program}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
              {app.ddl && (
                <div className="mt-3 text-xs text-[#6B7280]">
                  截止: {app.ddl.toLocaleDateString("zh-CN")}
                </div>
              )}
              {app.nextStep && (
                <div className="mt-1 text-xs text-[#FF6B35]">{app.nextStep}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    PREPARING: "材料准备", SUBMITTED: "已提交",
    INTERVIEW_PREP: "面试准备", WAITLISTED: "候补中",
    OFFER: "已录用", REJECTED: "未录用",
  };
  const colors: Record<string, string> = {
    PREPARING: "bg-[#FF6B35]", SUBMITTED: "bg-blue-500",
    INTERVIEW_PREP: "bg-indigo-500", WAITLISTED: "bg-amber-500",
    OFFER: "bg-emerald-500", REJECTED: "bg-gray-400",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full text-white ${colors[status] ?? "bg-gray-400"}`}>
      {labels[status] ?? status}
    </span>
  );
}
```

- [ ] **Step 5: Commit**

Run: `git add . && git commit -m "feat: add dashboard page with progress overview and DDL alerts"`

---

### Phase 5: 院校库

#### Task 5.1: 院校搜索和订阅

**Files:**
- Create: `G:\projects\baoyan\src\app\api\universities\route.ts`
- Create: `G:\projects\baoyan\src\app\api\subscriptions\route.ts`
- Create: `G:\projects\baoyan\src\app\(authenticated)\universities\page.tsx`

- [ ] **Step 1: 创建院校搜索 API**

`GET /api/universities?q=清华`
```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  const universities = await prisma.university.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { program: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
  });
  return NextResponse.json(universities);
}
```

- [ ] **Step 2: 创建订阅 API**

`POST /api/subscriptions`
```ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { universityId } = await req.json();

  const sub = await prisma.subscription.upsert({
    where: {
      userId_universityId: {
        userId: session.user.id,
        universityId,
      },
    },
    update: { isActive: true },
    create: {
      userId: session.user.id,
      universityId,
    },
  });

  return NextResponse.json(sub);
}
```

- [ ] **Step 3: 创建院校库页面**

```tsx
"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface University {
  id: string;
  name: string;
  program: string;
  websiteUrl: string;
}

export default function UniversitiesPage() {
  const [query, setQuery] = useState("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [subscribed, setSubscribed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/universities?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then(setUniversities);
  }, [query]);

  const handleSubscribe = async (universityId: string) => {
    await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ universityId }),
    });
    setSubscribed((prev) => new Set(prev).add(universityId));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#1A1A1A]">院校库</h1>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
        <input
          type="text"
          placeholder="搜索院校或专业..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {universities.map((uni) => (
          <div
            key={uni.id}
            className="bg-white border border-gray-100 rounded-xl p-4"
          >
            <h3 className="text-sm font-semibold text-[#1A1A1A]">
              {uni.name}
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">{uni.program}</p>
            <button
              onClick={() => handleSubscribe(uni.id)}
              disabled={subscribed.has(uni.id)}
              className="mt-3 text-xs bg-[#FF6B35] text-white px-3 py-1.5 rounded-lg disabled:opacity-50 hover:bg-[#FF6B35]/90 transition-colors"
            >
              {subscribed.has(uni.id) ? "已订阅" : "订阅通知"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

Run: `git add . && git commit -m "feat: add university browser and subscription"`

---

### Phase 6: 文书管理

#### Task 6.1: 文书 API + 页面

**Files:**
- Create: `G:\projects\baoyan\src\app\api\documents\route.ts`
- Create: `G:\projects\baoyan\src\app\(authenticated)\documents\page.tsx`

- [ ] **Step 1: 创建文书 API**

`GET /api/documents` and `POST /api/documents`

```ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    include: { application: { include: { university: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(documents);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, title, content, applicationId } = await req.json();

  const doc = await prisma.document.create({
    data: {
      userId: session.user.id,
      type,
      title,
      content,
      applicationId,
    },
  });

  return NextResponse.json(doc);
}
```

- [ ] **Step 2: 创建文书管理页面**

```tsx
"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

interface Document {
  id: string;
  type: string;
  title: string | null;
  content: string | null;
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
    fetch("/api/documents").then((r) => r.json()).then(setDocuments);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1A1A1A]">文书管理</h1>
        <button className="flex items-center gap-1.5 text-sm bg-[#FF6B35] text-white px-3 py-2 rounded-lg hover:bg-[#FF6B35]/90 transition-colors">
          <Plus className="w-4 h-4" /> 新建文书
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white border border-gray-100 rounded-xl p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#1A1A1A]">
                  {doc.title || typeLabels[doc.type] || doc.type}
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  v{doc.version} · {doc.application?.university.name || "通用"}
                </p>
              </div>
              <span className="text-[10px] bg-gray-100 text-[#6B7280] px-2 py-0.5 rounded-full">
                {typeLabels[doc.type] || doc.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

Run: `git add . && git commit -m "feat: add document management"`

---

### Phase 7: iCal 日历

#### Task 7.1: 日历订阅

**Files:**
- Create: `G:\projects\baoyan\src\app\api\ical\[token]\route.ts`
- Create: `G:\projects\baoyan\src\app\(authenticated)\calendar\page.tsx`

- [ ] **Step 1: 创建 iCal API**

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const user = await prisma.user.findUnique({
    where: { icalToken: params.token },
    include: {
      applications: {
        where: { ddl: { not: null } },
        include: { university: true },
      },
    },
  });

  if (!user) {
    return new NextResponse("Not Found", { status: 404 });
  }

  let ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BaoyanTracker//CN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:保研进度通",
  ];

  for (const app of user.applications) {
    if (!app.ddl) continue;
    const dateStr = app.ddl.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    ics.push("BEGIN:VEVENT");
    ics.push(`UID:${app.id}@baoyan`);
    ics.push(`DTSTART;VALUE=DATE:${dateStr.substring(0, 8)}`);
    ics.push(`SUMMARY:${app.university.name} ${app.university.program} 截止`);
    if (app.nextStep) ics.push(`DESCRIPTION:${app.nextStep}`);
    ics.push("END:VEVENT");
  }

  ics.push("END:VCALENDAR");

  return new NextResponse(ics.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": "attachment; filename=baoyan.ics",
    },
  });
}
```

- [ ] **Step 2: 创建日历页面**

```tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      applications: {
        where: { ddl: { not: null } },
        include: { university: true },
        orderBy: { ddl: "asc" },
      },
    },
  });

  if (!user) redirect("/login");

  const icalUrl = `${process.env.NEXTAUTH_URL}/api/ical/${user.icalToken}`;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#1A1A1A]">日历</h1>

      <div className="bg-[#FAFAFA] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">
          日历订阅链接
        </h3>
        <p className="text-xs text-[#6B7280] mb-3">
          复制以下链接到 Apple 日历或 Google 日历中添加订阅
        </p>
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#6B7280] break-all select-all">
          {icalUrl}
        </div>
      </div>

      <div className="space-y-2">
        {user.applications.map((app) => (
          <div
            key={app.id}
            className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between"
          >
            <div>
              <div className="text-sm font-medium text-[#1A1A1A]">
                {app.university.name} · {app.university.program} 截止
              </div>
              {app.nextStep && (
                <div className="text-xs text-[#6B7280] mt-0.5">
                  {app.nextStep}
                </div>
              )}
            </div>
            <div className="text-sm font-bold text-[#FF6B35]">
              {app.ddl!.toLocaleDateString("zh-CN")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

Run: `git add . && git commit -m "feat: add iCal calendar subscription"`

---

### Phase 8: Python 爬虫 MVP

#### Task 8.1: 爬虫骨架

**Files:**
- Create: `G:\projects\baoyan\python-crawler\requirements.txt`
- Create: `G:\projects\baoyan\python-crawler\crawler.py`
- Create: `G:\projects\baoyan\python-crawler\config.py`

- [ ] **Step 1: 创建 requirements.txt**

```
httpx==0.27.0
playwright==1.44.0
```

- [ ] **Step 2: 创建 config.py**

```python
WEBHOOK_URL = "http://localhost:3000/api/webhooks/ingest"
WEBHOOK_SECRET = "your-webhook-secret"
UNIVERSITY_ID_MAP = {
    "清华大学计算机系": "UNI_ID_HERE",
}
```

- [ ] **Step 3: 创建 crawler.py**

```python
import hashlib
import httpx
from playwright.sync_api import sync_playwright


def crawl_tsinghua_news():
    """抓取清华大学计算机系通知公告"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("https://www.cs.tsinghua.edu.cn/tzgg.htm")
        page.wait_for_selector("li.list-item")
        items = page.query_selector_all("li.list-item a")
        results = []
        for item in items[:10]:
            title = item.inner_text().strip()
            href = item.get_attribute("href")
            full_url = f"https://www.cs.tsinghua.edu.cn/{href}" if href else ""
            raw = f"UNI_ID{title}"  # 正式用 universityId + title + publishDate
            hash_val = hashlib.md5(raw.encode()).hexdigest()
            results.append({
                "title": title,
                "url": full_url,
                "publishDate": None,
                "hash": hash_val,
                "summary": None,
            })
        browser.close()
        return results


def push_to_webhook(university_id: str, notifications: list):
    """推送数据到 Next.js Webhook"""
    payload = {"universityId": university_id, "notifications": notifications}
    resp = httpx.post(
        "http://localhost:3000/api/webhooks/ingest",
        json=payload,
        headers={"Authorization": "Bearer your-webhook-secret"},
        timeout=30,
    )
    return resp.json()


if __name__ == "__main__":
    news = crawl_tsinghua_news()
    result = push_to_webhook("tsinghua-cs-id", news)
    print(f"Pushed {len(news)} items: {result}")
```

- [ ] **Step 4: 安装 Playwright 浏览器**

Run: `cd G:\projects\baoyan\python-crawler && pip install -r requirements.txt && playwright install chromium`
Expected: Chromium browser installed

- [ ] **Step 5: Commit Phase 8**

Run: `git add . && git commit -m "feat: add python crawler MVP for tsinghua"`

---

### 最终验证

- [ ] **启动开发服务器**

Run: `cd G:\projects\baoyan && npm run dev`
Expected: http://localhost:3000 starts successfully

- [ ] **运行爬虫测试**

Run: `cd G:\projects\baoyan\python-crawler && python crawler.py`
Expected: Pushes data to webhook, returns success response

- [ ] **最终 Commit**

Run: `git add . && git commit -m "chore: initial complete MVP"`

---

## 文件清单总结

```
baoyan/
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── python-crawler/
│   ├── requirements.txt
│   ├── crawler.py
│   └── config.py
└── src/
    ├── lib/
    │   ├── prisma.ts
    │   ├── auth.ts
    │   └── utils.ts
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── login/page.tsx
    │   ├── (authenticated)/
    │   │   ├── layout.tsx
    │   │   ├── dashboard/page.tsx
    │   │   ├── universities/page.tsx
    │   │   ├── documents/page.tsx
    │   │   └── calendar/page.tsx
    │   └── api/
    │       ├── auth/[...nextauth]/route.ts
    │       ├── webhooks/ingest/route.ts
    │       ├── dashboard/route.ts
    │       ├── universities/route.ts
    │       ├── subscriptions/route.ts
    │       ├── documents/route.ts
    │       └── ical/[token]/route.ts
    └── components/
        ├── layout/sidebar.tsx
        └── dashboard/
            ├── progress-overview.tsx
            ├── urgent-ddl.tsx
            └── application-card.tsx
```
