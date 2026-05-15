# 保研通知系统 — 技术设计文档 v1.0

## 1. 技术栈

| 层 | 选型 |
|------|------|
| 框架 | Next.js 14+ (App Router) |
| 语言 | TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| 数据库 | PostgreSQL (Supabase/Neon) |
| ORM | Prisma |
| 队列 | Upstash QStash / Inngest |
| 部署 | Vercel |
| 爬虫 | Python (Playwright + PyMuPDF) |
| CI | GitHub Actions（定时触发爬虫） |
| 推送 | Resend（邮件）+ PushDeer（微信） |

## 2. 系统架构

```
┌────────────────┐     POST /api/webhooks/ingest     ┌──────────────────┐
│  Python 爬虫    │ ──── API Auth + JSON ──────────▶  │  Next.js App     │
│  (GitHub Actions)│                                │  (Vercel)        │
│  Playwright     │                                  │  ┌────────────┐  │
│  PyMuPDF(P2)    │                                  │  │  QStash    │  │
│  代理池+错峰     │                                  │  │  异步队列   │  │
└────────────────┘                                  │  └─────┬──────┘  │
       │                                             │        │        │
       ▼ 抓取                                        │        ▼        │
┌────────────────┐     Prisma ORM                    │  Resend/PushDeer│
│  高校官网       │◀────  Webhook 校验后写入 ──────▶  │  (异步推送)     │
│  (通知页)      │                                  └────────┬─────────┘
└────────────────┘                                           │
                                                              ▼
                                                     ┌──────────────────┐
                                                     │  PostgreSQL      │
                                                     │  (Supabase +     │
                                                     │   PgBouncer连接池)│
                                                     └──────────────────┘
```

### 爬虫数据流

```
爬虫抓取新通知 → 计算 MD5 指纹 → POST JSON → 
Next.js Webhook 校验 API Key → upsert Notification →
检测为新记录 → 入队 QStash → 异步遍历订阅用户 → 
发邮件 + PushDeer 推送 → 写入 NotificationDelivery
```

## 3. Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum ApplicationStatus {
  PREPARING
  SUBMITTED
  INTERVIEW_PREP
  WAITLISTED
  OFFER
  REJECTED
}

enum DeliveryChannel {
  EMAIL
  WECHAT
  IN_APP
}

enum DeliveryStatus {
  PENDING
  SENT
  FAILED
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  pushDeerKey  String?
  icalToken    String   @unique @default(uuid())

  applications  Application[]
  subscriptions Subscription[]
  documents     Document[]
  deliveries    NotificationDelivery[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model University {
  id        String @id @default(cuid())
  name      String
  program   String
  websiteUrl String

  applications  Application[]
  subscriptions Subscription[]
  notifications Notification[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([name, program])
}

model Application {
  id           String            @id @default(cuid())
  userId       String
  universityId String
  status       ApplicationStatus @default(PREPARING)
  ddl          DateTime?
  nextStep     String?
  notes        String?

  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  university University @relation(fields: [universityId], references: [id])
  documents  Document[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, universityId])
}

model Subscription {
  id           String  @id @default(cuid())
  userId       String
  universityId String
  isActive     Boolean @default(true)

  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  university University @relation(fields: [universityId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([userId, universityId])
}

model Notification {
  id          String   @id @default(cuid())
  universityId String
  title       String
  url         String
  publishDate DateTime?
  hash        String   @unique
  summary     String?

  university University @relation(fields: [universityId], references: [id], onDelete: Cascade)
  deliveries NotificationDelivery[]

  createdAt DateTime @default(now())
}

model NotificationDelivery {
  id             String   @id @default(cuid())
  notificationId String
  userId         String
  channel        String   // email / wechat / in_app
  status         String   // pending / sent / failed
  sentAt         DateTime?
  errorMessage   String?

  notification Notification @relation(fields: [notificationId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([notificationId, userId, channel])
}

model Document {
  id            String  @id @default(cuid())
  userId        String
  type          String  // ps / cv / recommendation_letter / transcript
  version       Int     @default(1)
  title         String?
  content       String?
  fileUrl       String?
  applicationId String? // 选填：关联特定院校的定制文书

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  application Application? @relation(fields: [applicationId], references: [id], onDelete: SetNull)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 4. API 契约

### 4.1 爬虫 → Webhook

```
POST /api/webhooks/ingest
Headers: Authorization: Bearer ${WEBHOOK_SECRET}

[
  {
    "universityId": "ckl...",
    "title": "2026年推免生接收工作通知",
    "url": "https://xx.edu.cn/notice/123",
    "publishDate": "2026-05-15T00:00:00Z",
    "hash": "md5(universityId + title + publishDate)"
  }
]
```

响应：

```json
{
  "received": 3,
  "new": 2,
  "duplicates": 1
}
```

### 4.2 前端 API

```
GET /api/dashboard
→ 用户仪表盘数据

GET /api/applications
→ 申请列表

POST /api/applications
→ 创建新申请

PATCH /api/applications/:id/status
→ 状态流转

GET /api/universities
→ 院校库搜索

POST /api/subscriptions
→ 订阅院校通知

GET /api/ical/:icalToken
→ 生成 .ics 日历订阅文件
```

## 5. 前端组件树

```
Layout
├── OnboardingWizard (首次引导选校)
└── AuthenticatedLayout
    ├── Sidebar (导航)
    │   ├── Logo
    │   ├── NavItem: 仪表盘
    │   ├── NavItem: 院校库
    │   ├── NavItem: 文书管理
    │   └── NavItem: 日历
    └── MainContent
        ├── Dashboard (默认首页)
        │   ├── ProgressOverview (全局进度看板)
        │   │   └── StatusCard (各阶段数量统计)
        │   ├── UrgentDDL (紧急待办)
        │   │   └── DDLItem (院校名 + 截止日期 + 倒计时)
        │   └── ApplicationCardList
        │       └── ApplicationCard (单院校状态卡)
        │           ├── UniversityInfo (校名 + 专业)
        │           ├── StatusBadge (当前阶段标签)
        │           ├── NextStep (下一步行动)
        │           ├── DDLCountdown (倒计时)
        │           └── ActionMenu (更新状态/编辑备注)
        ├── UniversityBrowser
        │   ├── SearchBar
        │   ├── FilterPanel (专业/地区筛选)
        │   └── UniversityCard (院校卡片 + 订阅按钮)
        ├── DocumentManager
        │   ├── DocumentList
        │   └── DocumentEditor (版本对比)
        └── CalendarView (iCal 预览/手动管理)
```

### 渲染策略

| 组件 | 类型 | 理由 |
|------|------|------|
| Dashboard | Server Component | 数据获取 + HTML 直出 |
| ApplicationCardList | Client Component | 状态交互 (拖拽/点击流转) |
| UniversityBrowser | Client Component | 搜索/筛选交互密集 |
| Sidebar | Server Component | 纯静态 |
| DocumentManager | Client Component | 文件上传/编辑 |
| CalendarView | Server Component | 渲染后无需交互 |

## 6. 状态流转

```
PREPARING ──→ SUBMITTED ──→ INTERVIEW_PREP ──→ OFFER
                  │               │
                  └──→ REJECTED   └──→ REJECTED
                  
                  WAITLISTED ──→ OFFER
                      │
                      └──→ REJECTED
```

前端 `StatusBadge` 根据状态显示不同颜色：
- PREPARING: 琥珀色
- SUBMITTED: 蓝色
- INTERVIEW_PREP: 紫色
- WAITLISTED: 黄色
- OFFER: 绿色
- REJECTED: 红色/灰色

## 7. 配色规范

| Token | 值 | 用途 |
|-------|------|------|
| `--primary` | #FF6B35 | CTA按钮、状态标签、DDL高亮 |
| `--background` | #FFFFFF | 大面积留白 |
| `--card` | #FAFAFA | 卡片背景 |
| `--foreground` | #1A1A1A | 正文 |
| `--muted-foreground` | #6B7280 | 辅助文字 |

## 8. 部署配置

### Vercel
- Framework: Next.js
- Environment: `DATABASE_URL`, `DIRECT_URL`, `WEBHOOK_SECRET`, `RESEND_API_KEY`
- Post-deploy: `npx prisma db push`

### GitHub Actions (爬虫)
- 触发: `cron` 错峰 (e.g., `17 9 * * *`)
- 运行 Playwright 脚本 → POST Webhook
- 代理池轮换防封

## 9. Phase 2 规划

- PDF 附件解析 (PyMuPDF + PaddleOCR)
- LLM 提取结构化信息 (截止日期、材料清单)
- 院校推荐算法 (基于 GPA/排名匹配往年数据)
- 面试准备库 (面经分享)
