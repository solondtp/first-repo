import { ConversationStatus, MessageRole } from "@prisma/client";
import { prisma } from "../config/prisma";
import { generateGuestSessionKey, upgradeSessionToLead } from "../utils/session";

export async function ensureSession(sessionKey?: string, pagePath?: string, country?: string) {
  const key = sessionKey ?? generateGuestSessionKey();
  const session = await prisma.chatSession.upsert({
    where: { sessionKey: key },
    create: { sessionKey: key, pagePath, country },
    update: { pagePath: pagePath ?? undefined, country: country ?? undefined }
  });
  return session;
}

export async function addMessage(params: {
  sessionId: number;
  sessionKey: string;
  role: MessageRole;
  content: string;
  aiSummary?: string;
  needHuman?: boolean;
  recommendedAction?: string;
  rawResponseJson?: unknown;
}) {
  return prisma.chatMessage.create({
    data: {
      ...params,
      rawResponseJson: params.rawResponseJson as object | undefined
    }
  });
}

export async function bindLead(sessionKey: string, leadId: number) {
  const leadSessionKey = upgradeSessionToLead(leadId);
  await prisma.chatSession.update({
    where: { sessionKey },
    data: { leadId, sessionKey: leadSessionKey }
  });
  return leadSessionKey;
}

export async function updateConversationStatus(sessionKey: string, status: ConversationStatus) {
  return prisma.chatSession.update({
    where: { sessionKey },
    data: { status }
  });
}
