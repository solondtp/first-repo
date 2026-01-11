# 工单系统（微信小程序 + CloudBase）

该方案面向 10 人销售服务团队，使用微信小程序 + 云开发实现工单闭环。

## 目录结构

- `cloudfunctions/` 云函数（所有写操作）
- `miniprogram/` 小程序（WXML/WXSS/JS 原生）

## 数据库集合

- `users`: `{ _id, openid, role }`
- `tickets`: 工单主数据
- `audit_logs`: 审计日志
- `score_tokens`: 一次性评分 token

## 运行说明

1. 在微信开发者工具中打开项目根目录。
2. 在「云开发」面板创建环境。
3. 在数据库中创建集合：`users`、`tickets`、`audit_logs`、`score_tokens`。
4. 为 `users` 写入账号与角色：`Sales` 或 `Supervisor`。
5. 在云函数中上传并部署 `cloudfunctions/` 下所有函数。
6. 运行小程序，进入“创建工单”页面。

## 权限与审计

- 仅 `Sales`/`Supervisor` 可创建工单。
- 仅 `Supervisor` 可派单与审批。
- 全部写操作通过云函数完成，客户端不直写数据库。
- 审计日志统一写入 `audit_logs`。
