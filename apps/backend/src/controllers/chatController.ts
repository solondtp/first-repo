import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { fail, ok } from "../middleware/response";
import { addMessage, ensureSession, updateConversationStatus } from "../services/chat";
import { pushDingTalkAlert, shouldNotifyDingTalk } from "../services/dingtalk";
import { callOpenClaw } from "../services/openclaw";

export async function sendChat(req: Request, res: Response) {
  const { message, sessionKey, pagePath, country, visitorInfo } = req.body as {
    message: string;
    sessionKey?: string;
    pagePath?: string;
    country?: string;
    visitorInfo?: Record<string, string>;
  };
  if (!message) return fail(res, "message 不能为空");

  const session = await ensureSession(sessionKey, pagePath, country);
  await addMessage({ sessionId: session.id, sessionKey: session.sessionKey, role: "USER", content: message });

  const openClawResult = await callOpenClaw({ message, sessionKey: session.sessionKey, pagePath, country });
  await addMessage({
    sessionId: session.id,
    sessionKey: session.sessionKey,
    role: "AI",
    content: openClawResult.answer,
    aiSummary: openClawResult.triage,
    needHuman: openClawResult.needHuman,
    recommendedAction: openClawResult.action,
    rawResponseJson: openClawResult
  });

  if (openClawResult.needHuman) {
    await updateConversationStatus(session.sessionKey, "MANUAL_PENDING");
  }

  if (shouldNotifyDingTalk({ message })) {
    await pushDingTalkAlert({
      source: "allctp.com",
      pagePath,
      sessionKey: session.sessionKey,
      visitorInfo,
      question: message,
      aiTriage: openClawResult.triage
    });
  }

  return ok(res, "发送成功", {
    sessionKey: session.sessionKey,
    answer: openClawResult.answer,
    triage: openClawResult.triage,
    needHuman: openClawResult.needHuman,
    action: openClawResult.action
  });
}

export async function history(req: Request, res: Response) {
  const sessionKey = req.params.sessionKey;
  const session = await prisma.chatSession.findUnique({
    where: { sessionKey },
    include: { messages: { orderBy: { createdAt: "asc" } }, lead: true }
  });
  if (!session) return fail(res, "会话不存在", "not found", 404);
  return ok(res, "获取成功", session);
}
