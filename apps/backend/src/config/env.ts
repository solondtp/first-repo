import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "change-me",
  openclawHookUrl: process.env.OPENCLAW_HOOK_URL ?? "http://127.0.0.1:18789/hooks/agent",
  openclawToken: process.env.OPENCLAW_HOOK_TOKEN ?? "",
  dingtalkReceiver: process.env.DINGTALK_RECEIVER ?? "ops-group",
  dingtalkDeliver: (process.env.DINGTALK_DELIVER ?? "true") === "true",
  uploadDir: process.env.UPLOAD_DIR ?? "uploads",
  maxUploadSize: Number(process.env.MAX_UPLOAD_SIZE_MB ?? 5) * 1024 * 1024
};
