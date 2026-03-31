import { Request, Response } from "express";
import { ConversationStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { fail, ok } from "../middleware/response";
import { addMessage, updateConversationStatus } from "../services/chat";

export async function listConversations(_req: Request, res: Response) {
  const sessions = await prisma.chatSession.findMany({
    orderBy: { updatedAt: "desc" },
    include: { lead: true, messages: { take: 1, orderBy: { createdAt: "desc" } } }
  });
  return ok(res, "获取成功", sessions);
}

export async function listLeads(_req: Request, res: Response) {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return ok(res, "获取成功", leads);
}

export async function manualReply(req: Request, res: Response) {
  const { sessionKey, content, status } = req.body as {
    sessionKey: string;
    content: string;
    status?: ConversationStatus;
  };
  const session = await prisma.chatSession.findUnique({ where: { sessionKey } });
  if (!session) return fail(res, "会话不存在", "not found", 404);

  await addMessage({ sessionId: session.id, sessionKey, role: "ADMIN", content });
  if (status) await updateConversationStatus(sessionKey, status);

  return ok(res, "回复成功");
}
