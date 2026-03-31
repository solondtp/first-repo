import { Request, Response } from "express";
import path from "path";
import { prisma } from "../config/prisma";
import { fail, ok } from "../middleware/response";
import { ensureSession } from "../services/chat";
import { pushDingTalkAlert } from "../services/dingtalk";

export async function uploadFile(req: Request, res: Response) {
  if (!req.file) return fail(res, "文件不能为空");

  const sessionKey = String(req.body.sessionKey || "");
  if (!sessionKey) return fail(res, "sessionKey 必填");

  const session = await ensureSession(sessionKey);
  const file = await prisma.upload.create({
    data: {
      sessionId: session.id,
      sessionKey: session.sessionKey,
      originalName: req.file.originalname,
      filePath: path.relative(process.cwd(), req.file.path),
      mimeType: req.file.mimetype,
      size: req.file.size
    }
  });

  await pushDingTalkAlert({ source: "allctp.com", sessionKey, question: `上传了图片: ${file.originalName}` });

  return ok(res, "上传成功", file);
}
