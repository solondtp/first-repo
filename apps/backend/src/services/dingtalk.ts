import { env } from "../config/env";

const KEYWORDS = ["报价", "购买", "价格", "代理", "合作", "报修", "停机", "紧急", "error", "故障"];

export function shouldNotifyDingTalk(input: { message?: string; leadSubmitted?: boolean; uploaded?: boolean; manual?: boolean }) {
  if (input.leadSubmitted || input.uploaded || input.manual) {
    return true;
  }
  const text = (input.message ?? "").toLowerCase();
  return KEYWORDS.some((k) => text.includes(k));
}

export async function pushDingTalkAlert(content: Record<string, unknown>) {
  if (!env.dingtalkDeliver) return;
  console.log("[dingtalk] push", JSON.stringify(content));
}
