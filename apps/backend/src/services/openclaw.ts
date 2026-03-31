import { env } from "../config/env";

type OpenClawResponse = {
  answer: string;
  triage?: string;
  needHuman?: boolean;
  action?: string;
};

export async function callOpenClaw(payload: {
  message: string;
  sessionKey: string;
  pagePath?: string;
  country?: string;
  leadInfo?: Record<string, string | null>;
}) {
  const structuredPrompt = [
    `来源站点：allctp.com`,
    `页面：${payload.pagePath ?? "/"}`,
    `国家：${payload.country ?? "未知"}`,
    `联系方式：${JSON.stringify(payload.leadInfo ?? {}, null, 2)}`,
    `用户原始问题：${payload.message}`,
    "请输出：1.初步判断 2.建议补充资料 3.是否建议人工介入 4.推荐下一步动作"
  ].join("\n");

  const response = await fetch(env.openclawHookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.openclawToken}`
    },
    body: JSON.stringify({
      message: structuredPrompt,
      agentId: "main",
      sessionKey: payload.sessionKey,
      wakeMode: "now",
      deliver: env.dingtalkDeliver,
      channel: "dingtalk",
      to: env.dingtalkReceiver
    })
  });

  if (!response.ok) {
    throw new Error(`OpenClaw 调用失败: ${response.status}`);
  }

  const data = (await response.json()) as Partial<OpenClawResponse>;

  return {
    answer: data.answer ?? "已收到您的问题，我们会尽快处理。",
    triage: data.triage ?? "需进一步确认",
    needHuman: Boolean(data.needHuman),
    action: data.action ?? "继续收集设备信息"
  };
}
