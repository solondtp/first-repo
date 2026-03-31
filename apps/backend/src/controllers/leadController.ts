import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { fail, ok } from "../middleware/response";
import { bindLead, ensureSession } from "../services/chat";
import { pushDingTalkAlert } from "../services/dingtalk";

const leadSchema = z.object({
  sessionKey: z.string(),
  name: z.string().min(1),
  company: z.string().optional(),
  country: z.string().optional(),
  whatsapp: z.string().optional(),
  wechat: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  machine_model: z.string().optional(),
  serial_number: z.string().optional(),
  message: z.string().optional()
});

export async function createLead(req: Request, res: Response) {
  const parsed = leadSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, "参数校验失败", parsed.error.message);

  const data = parsed.data;
  await ensureSession(data.sessionKey);

  const lead = await prisma.lead.create({
    data: {
      sessionKey: data.sessionKey,
      name: data.name,
      company: data.company,
      country: data.country,
      whatsapp: data.whatsapp,
      wechat: data.wechat,
      email: data.email || null,
      machineModel: data.machine_model,
      serialNumber: data.serial_number,
      message: data.message
    }
  });

  const upgradedSessionKey = await bindLead(data.sessionKey, lead.id);

  await pushDingTalkAlert({
    source: "allctp.com",
    sessionKey: upgradedSessionKey,
    visitor: data,
    question: data.message,
    aiTriage: "已提交联系方式"
  });

  return ok(res, "留资成功", { leadId: lead.id, sessionKey: upgradedSessionKey });
}
