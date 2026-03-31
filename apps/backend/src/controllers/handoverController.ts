import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { fail, ok } from "../middleware/response";
import { updateConversationStatus } from "../services/chat";
import { pushDingTalkAlert } from "../services/dingtalk";

export async function manualHandover(req: Request, res: Response) {
  const { sessionKey, reason } = req.body as { sessionKey: string; reason?: string };
  if (!sessionKey) return fail(res, "sessionKey 必填");

  const session = await prisma.chatSession.findUnique({ where: { sessionKey } });
  if (!session) return fail(res, "会话不存在", "not found", 404);

  await prisma.manualHandoverLog.create({
    data: {
      sessionId: session.id,
      sessionKey,
      reason: reason ?? "用户主动转人工",
      triggerType: "manual_click"
    }
  });

  await updateConversationStatus(sessionKey, "MANUAL_PENDING");
  await pushDingTalkAlert({ source: "allctp.com", sessionKey, question: reason ?? "用户点击转人工", aiTriage: "待人工介入" });

  return ok(res, "已转人工");
}
