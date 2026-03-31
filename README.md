# allctp.com 在线聊天与留资系统（可部署骨架）

## 1) 整体架构说明

- 前端：Vite + React + TypeScript，提供网站聊天悬浮窗与简单管理后台。
- 后端：Node.js + Express + TypeScript，提供聊天、留资、上传、后台 API。
- 数据库：MySQL + Prisma。
- AI：后端代理调用 OpenClaw（`127.0.0.1:18789/hooks/agent`）。
- 通知：后端触发钉钉告警（首版以接口/日志占位，便于替换真实 SDK）。
- 反向代理：Nginx（HTTPS，转发 `/api` 到后端，禁止 `/hooks/*` 对外暴露）。

## 2) 项目目录树

```text
.
├── .env.example
├── package.json
├── apps
│   ├── backend
│   │   ├── package.json
│   │   ├── prisma
│   │   │   ├── schema.prisma
│   │   │   ├── seed.ts
│   │   │   └── init.sql
│   │   ├── src
│   │   │   ├── app.ts
│   │   │   ├── server.ts
│   │   │   ├── config
│   │   │   ├── controllers
│   │   │   ├── middleware
│   │   │   ├── routes
│   │   │   ├── services
│   │   │   ├── types
│   │   │   └── utils
│   └── frontend
│       ├── package.json
│       ├── vite.config.ts
│       ├── index.html
│       └── src
│           ├── App.tsx
│           ├── styles.css
│           ├── api
│           ├── components
│           ├── pages
│           └── types
└── deploy
    ├── ecosystem.config.cjs
    ├── nginx.allctp.conf
    └── openclaw-integration.md
```

## 3) 数据库设计（Prisma）

主要表：
- `chat_sessions`
- `chat_messages`
- `leads`
- `uploads`
- `manual_handover_logs`
- `admin_users`

说明：
- 会话键支持：`web:guest:<uuid>`、`lead:<leadId>`、`ticket:<ticketId>`。
- 留资后自动从 guest session 升级到 lead session。
- 对话状态支持：`AI_PROCESSING` / `MANUAL_PENDING` / `FOLLOWED_UP` / `WON` / `CLOSED`。

## 4) 后端 API

- `POST /api/chat/send`
- `GET /api/chat/history/:sessionKey`
- `POST /api/leads`
- `POST /api/upload`
- `POST /api/handover/manual`
- `GET /api/admin/conversations`
- `GET /api/admin/leads`
- `POST /api/admin/reply`
- `POST /api/auth/login`

统一返回结构：
```json
{
  "success": true,
  "message": "发送成功",
  "data": {}
}
```

## 5) 前端功能

- 网站右下角聊天浮窗
- 访客问答 + AI 回复
- “转人工”状态显示
- 快捷按钮：
  - 获取产品资料
  - 申请报价
  - 申请远程支持
  - 留下联系方式
- 留资表单字段（name/company/country/whatsapp/wechat/email/machine_model/serial_number/message）
- 简易管理后台：登录、对话列表、留资列表、人工回复

## 6) OpenClaw 与钉钉联动

- 后端构造结构化 prompt（站点、页面、国家、联系方式、型号、SN、原始问题）。
- OpenClaw 返回内容写回 `chat_messages`。
- 触发条件（留资/关键词/上传/转人工）会触发钉钉推送占位逻辑。
- 预留“钉钉人工回复回写网站”的扩展字段（通过 `ADMIN` role message 可落地）。

## 7) 部署与运维

### 7.1 安装与启动

```bash
npm install
cp .env.example .env
npm --workspace apps/backend run prisma:generate
npm --workspace apps/backend run prisma:migrate
npm --workspace apps/backend run prisma:seed
npm run build
```

### 7.2 PM2

```bash
pm2 start deploy/ecosystem.config.cjs
pm2 save
```

### 7.3 Nginx

使用 `deploy/nginx.allctp.conf`，将前端静态目录指向构建产物目录。

## 8) 安全策略

- 前端不直连 OpenClaw。
- OpenClaw token 仅存后端环境变量。
- Nginx 层屏蔽 `/hooks/*`。
- 管理后台 JWT 基础鉴权。
- 上传类型/大小限制（图片与 PDF，默认 5MB）。
- API 基础限流（每分钟 40 次/IP）。
- 输入校验（Zod + Prisma 参数化查询）。

## 9) 错误处理与日志

- 全局错误中间件统一返回 JSON 错误。
- 关键动作（钉钉告警）记录日志，便于替换实际机器人 SDK。
- PM2 输出日志到 `/var/log/allctp/`。

## 10) 后续扩展建议

1. 接入 Redis 做会话缓存与消息队列。
2. 管理后台添加分页、搜索、导出。
3. 添加 RBAC（销售/工程师/管理员权限）。
4. 对上传文件接入对象存储（MinIO/S3）。
5. 增加微信小程序与钉钉工作台同源 API 网关。
6. 对 OpenClaw 调用增加重试、熔断、审计日志。

