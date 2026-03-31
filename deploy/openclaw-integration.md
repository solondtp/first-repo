# OpenClaw 对接说明

- 后端统一调用 `POST http://127.0.0.1:18789/hooks/agent`。
- 必须使用 Header：`Authorization: Bearer ${OPENCLAW_HOOK_TOKEN}`。
- 前端不直接调用 OpenClaw，避免 token 泄露。
- 已在 `chatController.sendChat` 中实现“先写库再调用 OpenClaw 再写 AI 回复”。
- 请求体字段：
  - `message`（结构化 prompt）
  - `agentId = main`
  - `sessionKey`
  - `wakeMode = now`
  - `deliver`
  - `channel = dingtalk`
  - `to = DINGTALK_RECEIVER`
