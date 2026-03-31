import express from "express";
import cors from "cors";
import helmet from "helmet";
import fs from "fs";
import { env } from "./config/env";
import { apiRateLimit } from "./middleware/rateLimit";
import { fail } from "./middleware/response";
import { router } from "./routes";

export function createApp() {
  if (!fs.existsSync(env.uploadDir)) {
    fs.mkdirSync(env.uploadDir, { recursive: true });
  }

  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use("/api", apiRateLimit);
  app.use("/api", router);

  app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("[error]", error);
    return fail(res, "服务器错误", error.message, 500);
  });

  return app;
}
